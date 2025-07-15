import GoogleAdsService from './googleAdsService';
import NotionService from './notionService';
import { SyncResult } from '../types';
import logger from '../utils/logger';

class SyncService {
  private googleAdsService: GoogleAdsService;
  private notionService: NotionService;

  constructor() {
    this.googleAdsService = new GoogleAdsService();
    this.notionService = new NotionService();
  }

  async performSync(): Promise<SyncResult> {
    const startTime = new Date();
    logger.info('캠페인 동기화 작업을 시작합니다...');

    try {
      const campaigns = await this.googleAdsService.getCampaignsFromSubAccounts();
      
      if (campaigns.length === 0) {
        logger.warn('가져온 캠페인이 없습니다.');
        return {
          success: true,
          processedCampaigns: 0,
          updatedPages: 0,
          errors: ['가져온 캠페인이 없습니다.'],
          timestamp: startTime.toISOString(),
        };
      }

      const syncResult = await this.notionService.syncCampaignsWithPages(campaigns);

      const result: SyncResult = {
        success: syncResult.errors.length === 0,
        processedCampaigns: campaigns.length,
        updatedPages: syncResult.updated,
        errors: syncResult.errors,
        timestamp: startTime.toISOString(),
      };

      logger.info(
        `동기화 완료: ${campaigns.length}개 캠페인 처리, ${syncResult.updated}개 페이지 업데이트, ${syncResult.errors.length}개 오류`
      );

      return result;
    } catch (error) {
      logger.error('동기화 작업 실패:', error);
      
      return {
        success: false,
        processedCampaigns: 0,
        updatedPages: 0,
        errors: [error instanceof Error ? error.message : '알 수 없는 오류'],
        timestamp: startTime.toISOString(),
      };
    }
  }

  async testConnections(): Promise<{ googleAds: boolean; notion: boolean }> {
    logger.info('API 연결 상태를 확인하는 중...');

    const [googleAdsConnected, notionConnected] = await Promise.allSettled([
      this.googleAdsService.testConnection(),
      this.notionService.testConnection(),
    ]);

    return {
      googleAds: googleAdsConnected.status === 'fulfilled' ? googleAdsConnected.value : false,
      notion: notionConnected.status === 'fulfilled' ? notionConnected.value : false,
    };
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      googleAds: boolean;
      notion: boolean;
    };
    lastSync?: string;
  }> {
    const connections = await this.testConnections();
    const allHealthy = connections.googleAds && connections.notion;
    const anyHealthy = connections.googleAds || connections.notion;

    return {
      status: allHealthy ? 'healthy' : anyHealthy ? 'degraded' : 'unhealthy',
      services: connections,
    };
  }
}

export default SyncService;