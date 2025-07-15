import { Client } from '@notionhq/client';
import { NotionPage, GoogleAdsCampaign } from '../types';
import config from '../config';
import logger from '../utils/logger';

class NotionService {
  private notion: Client;

  constructor() {
    this.notion = new Client({
      auth: config.notion.apiKey,
    });
  }

  async getAllPages(): Promise<NotionPage[]> {
    try {
      logger.info('Notion 데이터베이스에서 페이지 목록을 가져오는 중...');
      
      const response = await this.notion.databases.query({
        database_id: config.notion.databaseId,
      });

      const pages = response.results.map((page: any) => {
        const properties = page.properties;
        
        return {
          id: page.id,
          campaignName: this.extractTextFromProperty(properties['캠페인명']),
          adSchedule: this.extractTextFromProperty(properties['광고 일정']),
          lastUpdated: page.last_edited_time,
        };
      });

      logger.info(`Notion에서 ${pages.length}개의 페이지를 가져왔습니다.`);
      return pages;
    } catch (error) {
      logger.error('Notion 페이지 가져오기 실패:', error);
      throw new Error(`Notion API 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async updatePageAdSchedule(pageId: string, adSchedule: string): Promise<void> {
    try {
      await this.notion.pages.update({
        page_id: pageId,
        properties: {
          '광고 일정': {
            rich_text: [
              {
                text: {
                  content: adSchedule,
                },
              },
            ],
          },
        },
      });

      logger.info(`페이지 ${pageId}의 광고 일정을 업데이트했습니다: ${adSchedule}`);
    } catch (error) {
      logger.error(`페이지 ${pageId} 업데이트 실패:`, error);
      throw new Error(`페이지 업데이트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async syncCampaignsWithPages(campaigns: GoogleAdsCampaign[]): Promise<{
    updated: number;
    errors: string[];
  }> {
    try {
      const pages = await this.getAllPages();
      const result = { updated: 0, errors: [] as string[] };

      for (const campaign of campaigns) {
        try {
          const matchingPage = pages.find(
            page => page.campaignName === campaign.name
          );

          if (matchingPage) {
            const newAdSchedule = this.formatAdSchedule(
              campaign.startDate,
              campaign.endDate
            );

            if (matchingPage.adSchedule !== newAdSchedule) {
              await this.updatePageAdSchedule(matchingPage.id, newAdSchedule);
              result.updated++;
              
              logger.info(
                `캠페인 "${campaign.name}" 동기화 완료: ${newAdSchedule}`
              );
            } else {
              logger.debug(
                `캠페인 "${campaign.name}"는 이미 최신 상태입니다.`
              );
            }
          } else {
            const errorMsg = `Notion에서 캠페인 "${campaign.name}"에 해당하는 페이지를 찾을 수 없습니다.`;
            logger.warn(errorMsg);
            result.errors.push(errorMsg);
          }
        } catch (error) {
          const errorMsg = `캠페인 "${campaign.name}" 동기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
          logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      return result;
    } catch (error) {
      logger.error('캠페인 동기화 프로세스 실패:', error);
      throw error;
    }
  }

  private extractTextFromProperty(property: any): string {
    if (!property) return '';

    switch (property.type) {
      case 'title':
        return property.title?.[0]?.text?.content || '';
      case 'rich_text':
        return property.rich_text?.[0]?.text?.content || '';
      case 'plain_text':
        return property.plain_text || '';
      default:
        return '';
    }
  }

  private formatAdSchedule(startDate?: string, endDate?: string): string {
    if (!startDate && !endDate) {
      return '무제한';
    }

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR');
    };

    if (startDate && endDate) {
      return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    } else if (startDate) {
      return `${formatDate(startDate)} ~ 무제한`;
    } else {
      return `~ ${formatDate(endDate!)}`;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.notion.databases.retrieve({
        database_id: config.notion.databaseId,
      });
      
      logger.info('Notion API 연결 테스트 성공');
      return true;
    } catch (error) {
      logger.error('Notion API 연결 테스트 실패:', error);
      return false;
    }
  }

  async createNewCampaignPage(campaignName: string, adSchedule: string): Promise<string> {
    try {
      const response = await this.notion.pages.create({
        parent: {
          database_id: config.notion.databaseId,
        },
        properties: {
          '캠페인명': {
            title: [
              {
                text: {
                  content: campaignName,
                },
              },
            ],
          },
          '광고 일정': {
            rich_text: [
              {
                text: {
                  content: adSchedule,
                },
              },
            ],
          },
        },
      });

      logger.info(`새 캠페인 페이지 생성: ${campaignName}`);
      return response.id;
    } catch (error) {
      logger.error(`캠페인 페이지 생성 실패 (${campaignName}):`, error);
      throw error;
    }
  }
}

export default NotionService;