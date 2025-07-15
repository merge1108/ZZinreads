import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

interface SecretConfig {
  [key: string]: string;
}

class SecretManager {
  private client: SecretManagerServiceClient;
  private projectId: string;

  constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'zzinreads-gcp';
  }

  async loadConfig(secretName: string = 'google-ads-notion-config'): Promise<void> {
    try {
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await this.client.accessSecretVersion({ name });
      
      if (!version.payload?.data) {
        throw new Error('Secret payload is empty');
      }

      const secretValue = version.payload.data.toString();
      const config: SecretConfig = JSON.parse(secretValue);

      // 환경 변수로 설정
      Object.entries(config).forEach(([key, value]) => {
        process.env[key] = value;
      });

      console.log('✅ Secret Manager에서 환경 변수 로드 완료');
    } catch (error) {
      console.warn('⚠️ Secret Manager 로드 실패, 로컬 .env 사용:', error instanceof Error ? error.message : error);
      // Secret Manager 실패 시 기본 .env 파일 사용
      require('dotenv').config();
    }
  }
}

export default new SecretManager();