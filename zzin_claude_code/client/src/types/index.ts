export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface SyncResult {
  success: boolean;
  processedCampaigns: number;
  updatedPages: number;
  errors: string[];
  timestamp: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    googleAds: boolean;
    notion: boolean;
  };
  lastSync?: string;
}

export interface SystemStatus {
  scheduler: { [key: string]: boolean };
  user: string;
  uptime: number;
}

export interface User {
  id: string;
  username: string;
}