import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import secretManager from './utils/secretManager';
import config from './config';
import logger from './utils/logger';
import SchedulerService from './services/schedulerService';
import apiRoutes from './routes/api';
import {
  securityHeaders,
  apiRateLimit,
  requestLogger,
  errorHandler,
} from './middleware/security';

class Server {
  private app: express.Application;
  private schedulerService: SchedulerService;

  constructor() {
    this.app = express();
    this.schedulerService = new SchedulerService();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(securityHeaders);
    this.app.use(requestLogger);

    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    }));

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    this.app.use('/api', apiRateLimit);
  }

  private setupRoutes(): void {
    this.app.use('/api', apiRoutes);

    if (config.server.nodeEnv === 'production') {
      const clientBuildPath = path.join(__dirname, '../client/build');
      
      if (fs.existsSync(clientBuildPath)) {
        this.app.use(express.static(clientBuildPath));
        
        this.app.get('*', (_req, res) => {
          res.sendFile(path.join(clientBuildPath, 'index.html'));
        });
      } else {
        logger.warn('클라이언트 빌드 파일을 찾을 수 없습니다.');
      }
    }

    this.app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'Google Ads - Notion 동기화 서비스',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((_req, res) => {
      res.status(404).json({
        success: false,
        error: '요청한 리소스를 찾을 수 없습니다.',
        timestamp: new Date().toISOString(),
      });
    });

    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
      }

      logger.info('서버를 시작하는 중...');

      await this.testConnections();

      this.schedulerService.start();

      this.app.listen(config.server.port, () => {
        logger.info(`서버가 포트 ${config.server.port}에서 시작되었습니다.`);
        logger.info(`환경: ${config.server.nodeEnv}`);
      });

      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('서버 시작 실패:', error);
      process.exit(1);
    }
  }

  private async testConnections(): Promise<void> {
    try {
      const health = await this.schedulerService.getSystemHealth();
      
      if (health.status === 'unhealthy') {
        logger.error('필수 서비스 연결 실패:', health.services);
        throw new Error('API 연결에 실패했습니다.');
      } else if (health.status === 'degraded') {
        logger.warn('일부 서비스 연결 문제:', health.services);
      } else {
        logger.info('모든 서비스 연결 확인됨');
      }
    } catch (error) {
      logger.error('연결 테스트 실패:', error);
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = (signal: string) => {
      logger.info(`${signal} 신호를 받았습니다. 서버를 종료합니다...`);
      
      this.schedulerService.stop();
      
      setTimeout(() => {
        logger.info('서버가 종료되었습니다.');
        process.exit(0);
      }, 5000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error('처리되지 않은 예외:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('처리되지 않은 Promise 거부:', { reason, promise });
      process.exit(1);
    });
  }
}

async function main() {
  try {
    // Secret Manager에서 환경 변수 로드
    await secretManager.loadConfig();
    
    // 서버 시작
    const server = new Server();
    await server.start();
  } catch (error) {
    logger.error('서버 시작 중 치명적 오류:', error);
    process.exit(1);
  }
}

main();

export default Server;