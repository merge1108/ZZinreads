export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  customerId: string;
}

export interface NotionPage {
  id: string;
  campaignName: string;
  adSchedule?: string;
  lastUpdated?: string;
}

export interface SyncResult {
  success: boolean;
  processedCampaigns: number;
  updatedPages: number;
  errors: string[];
  timestamp: string;
}

export interface Config {
  googleAds: {
    developerToken: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    mccCustomerId: string;
    subAccounts: string[];
  };
  notion: {
    apiKey: string;
    databaseId: string;
  };
  server: {
    port: number;
    nodeEnv: string;
    jwtSecret: string;
  };
  scheduler: {
    morningSchedule: string;
    eveningSchedule: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}