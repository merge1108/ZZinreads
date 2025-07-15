import { GoogleAdsApi, Customer, enums } from 'google-ads-api';
import { GoogleAdsCampaign } from '../types';
import config from '../config';
import logger from '../utils/logger';

class GoogleAdsService {
  private client: GoogleAdsApi;

  constructor() {
    this.client = new GoogleAdsApi({
      client_id: config.googleAds.clientId,
      client_secret: config.googleAds.clientSecret,
      developer_token: config.googleAds.developerToken,
    });
  }

  async getCampaignsFromSubAccounts(): Promise<GoogleAdsCampaign[]> {
    try {
      const allCampaigns: GoogleAdsCampaign[] = [];

      for (const subAccountId of config.googleAds.subAccounts) {
        logger.info(`하위 계정 ${subAccountId}의 캠페인 정보를 가져오는 중...`);
        
        const customer = this.client.Customer({
          customer_id: subAccountId,
          refresh_token: config.googleAds.refreshToken,
          login_customer_id: config.googleAds.mccCustomerId,
        });

        const campaigns = await this.fetchCampaignsForCustomer(customer, subAccountId);
        allCampaigns.push(...campaigns);
      }

      logger.info(`총 ${allCampaigns.length}개의 캠페인을 가져왔습니다.`);
      return allCampaigns;
    } catch (error) {
      logger.error('Google Ads 캠페인 정보 가져오기 실패:', error);
      throw new Error(`Google Ads API 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private async fetchCampaignsForCustomer(
    customer: Customer, 
    customerId: string
  ): Promise<GoogleAdsCampaign[]> {
    try {
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.start_date,
          campaign.end_date
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `;

      const campaigns = await customer.query(query);
      
      return campaigns.map((row: any) => ({
        id: row.campaign.id.toString(),
        name: row.campaign.name,
        status: this.mapCampaignStatus(row.campaign.status),
        startDate: row.campaign.start_date || undefined,
        endDate: row.campaign.end_date || undefined,
        customerId,
      }));
    } catch (error) {
      logger.error(`고객 ID ${customerId}의 캠페인 가져오기 실패:`, error);
      throw error;
    }
  }

  private mapCampaignStatus(status: number): string {
    switch (status) {
      case enums.CampaignStatus.ENABLED:
        return 'ENABLED';
      case enums.CampaignStatus.PAUSED:
        return 'PAUSED';
      case enums.CampaignStatus.REMOVED:
        return 'REMOVED';
      default:
        return 'UNKNOWN';
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      logger.debug('Google Ads API 연결 테스트 시작', {
        developerToken: config.googleAds.developerToken ? '설정됨' : '미설정',
        clientId: config.googleAds.clientId ? '설정됨' : '미설정',
        clientSecret: config.googleAds.clientSecret ? '설정됨' : '미설정',
        refreshToken: config.googleAds.refreshToken ? '설정됨' : '미설정',
        mccCustomerId: config.googleAds.mccCustomerId,
        subAccounts: config.googleAds.subAccounts,
      });

      const customer = this.client.Customer({
        customer_id: config.googleAds.subAccounts[0],
        refresh_token: config.googleAds.refreshToken,
        login_customer_id: config.googleAds.mccCustomerId,
      });

      await customer.query('SELECT customer.id FROM customer LIMIT 1');
      logger.info('Google Ads API 연결 테스트 성공');
      return true;
    } catch (error) {
      logger.error('Google Ads API 연결 테스트 실패:', {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: JSON.stringify(error, null, 2),
        config: {
          hasDevToken: !!config.googleAds.developerToken,
          hasClientId: !!config.googleAds.clientId,
          hasClientSecret: !!config.googleAds.clientSecret,
          hasRefreshToken: !!config.googleAds.refreshToken,
          clientIdFirst10: config.googleAds.clientId ? config.googleAds.clientId.substring(0, 10) : 'none',
          refreshTokenFirst10: config.googleAds.refreshToken ? config.googleAds.refreshToken.substring(0, 10) : 'none',
        }
      });
      console.error('상세 오류:', error);
      return false;
    }
  }

  formatAdSchedule(startDate?: string, endDate?: string): string {
    if (!startDate && !endDate) {
      return '무제한';
    }

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };

    if (startDate && endDate) {
      return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    } else if (startDate) {
      return `${formatDate(startDate)} ~ 무제한`;
    } else {
      return `~ ${formatDate(endDate!)}`;
    }
  }
}

export default GoogleAdsService;