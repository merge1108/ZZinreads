import * as cron from 'node-cron';
import SyncService from './syncService';
import config from '../config';
import logger from '../utils/logger';

class SchedulerService {
  private syncService: SyncService;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.syncService = new SyncService();
  }

  start(): void {
    logger.info('스케줄러 서비스를 시작합니다...');

    this.scheduleJob(
      'morning-sync',
      config.scheduler.morningSchedule,
      '오전 자동 동기화'
    );

    this.scheduleJob(
      'evening-sync',
      config.scheduler.eveningSchedule,
      '오후 자동 동기화'
    );

    logger.info(`스케줄 설정 완료:
      - 오전: ${config.scheduler.morningSchedule}
      - 오후: ${config.scheduler.eveningSchedule}`);
  }

  stop(): void {
    logger.info('모든 스케줄된 작업을 중지합니다...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`작업 '${name}' 중지됨`);
    });
    
    this.jobs.clear();
  }

  private scheduleJob(name: string, schedule: string, description: string): void {
    try {
      const task = cron.schedule(
        schedule,
        async () => {
          logger.info(`${description} 작업을 시작합니다...`);
          
          try {
            const result = await this.syncService.performSync();
            
            if (result.success) {
              logger.info(`${description} 완료: ${result.updatedPages}개 페이지 업데이트`);
            } else {
              logger.error(`${description} 실패:`, result.errors);
            }
          } catch (error) {
            logger.error(`${description} 중 오류 발생:`, error);
          }
        },
        {
          scheduled: false,
          timezone: 'Asia/Seoul',
        }
      );

      this.jobs.set(name, task);
      task.start();
      
      logger.info(`작업 '${name}' (${description}) 스케줄됨: ${schedule}`);
    } catch (error) {
      logger.error(`작업 '${name}' 스케줄 설정 실패:`, error);
    }
  }

  async runManualSync(): Promise<any> {
    logger.info('수동 동기화 작업을 시작합니다...');
    
    try {
      return await this.syncService.performSync();
    } catch (error) {
      logger.error('수동 동기화 실패:', error);
      throw error;
    }
  }

  getJobStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    
    this.jobs.forEach((_job, name) => {
      status[name] = true; // 스케줄러에 등록된 작업은 모두 활성 상태로 표시
    });
    
    return status;
  }

  async getSystemHealth(): Promise<any> {
    return await this.syncService.getSystemHealth();
  }
}

export default SchedulerService;