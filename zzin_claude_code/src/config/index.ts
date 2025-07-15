import { Config } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

const config: Config = {
  googleAds: {
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
    mccCustomerId: process.env.GOOGLE_ADS_MCC_CUSTOMER_ID!,
    subAccounts: process.env.GOOGLE_ADS_SUB_ACCOUNTS?.split(',') || [],
  },
  notion: {
    apiKey: process.env.NOTION_API_KEY!,
    databaseId: process.env.NOTION_DATABASE_ID!,
  },
  server: {
    port: Number(process.env.PORT) || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET!,
  },
  scheduler: {
    morningSchedule: process.env.MORNING_SCHEDULE || '0 9 * * *',
    eveningSchedule: process.env.EVENING_SCHEDULE || '0 18 * * *',
  },
};

function validateConfig(): void {
  const required = [
    'GOOGLE_ADS_DEVELOPER_TOKEN',
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_CLIENT_SECRET',
    'GOOGLE_ADS_REFRESH_TOKEN',
    'GOOGLE_ADS_MCC_CUSTOMER_ID',
    'NOTION_API_KEY',
    'NOTION_DATABASE_ID',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`필수 환경변수가 누락되었습니다: ${missing.join(', ')}`);
  }
}

validateConfig();

export default config;