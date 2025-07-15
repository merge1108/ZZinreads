# 🚀 Google Cloud Run 배포 가이드

## 1. Google Cloud CLI 설치 및 설정

```bash
# Google Cloud CLI 설치 (Windows)
# https://cloud.google.com/sdk/docs/install에서 다운로드

# 인증 및 프로젝트 설정
gcloud auth login
gcloud config set project zzinreads-gcp
```

## 2. Secret Manager에 통합 환경 변수 설정

Google Cloud Console → Secret Manager에서 **`google-ads-notion-config`** 이름으로 비밀 생성:

```json
{
  "GOOGLE_ADS_DEVELOPER_TOKEN": "YOUR_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "GOOGLE_ADS_CLIENT_SECRET": "YOUR_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN": "YOUR_REFRESH_TOKEN",
  "GOOGLE_ADS_MCC_CUSTOMER_ID": "YOUR_MCC_CUSTOMER_ID",
  "GOOGLE_ADS_SUB_ACCOUNTS": "ACCOUNT_ID_1,ACCOUNT_ID_2",
  "NOTION_API_KEY": "ntn_YOUR_NOTION_API_KEY",
  "NOTION_DATABASE_ID": "YOUR_NOTION_DATABASE_ID",
  "PORT": "8080",
  "NODE_ENV": "production",
  "JWT_SECRET": "YOUR_JWT_SECRET_256_BIT_KEY",
  "ADMIN_PASSWORD_HASH": "YOUR_ADMIN_PASSWORD",
  "API_KEY": "YOUR_API_KEY_FOR_AUTHENTICATION",
  "LOG_LEVEL": "debug",
  "MORNING_SCHEDULE": "0 9 * * *",
  "EVENING_SCHEDULE": "0 18 * * *"
}
```

**또는 gcloud CLI로 생성:**

```bash
gcloud secrets create google-ads-notion-config --data-file=config.json
```

## 3. 서비스 계정 및 권한 설정

```bash
# 서비스 계정 생성
gcloud iam service-accounts create google-ads-notion-sync \
    --description="Google Ads Notion Sync Service Account" \
    --display-name="Google Ads Notion Sync"

# Secret Manager 접근 권한 부여
gcloud projects add-iam-policy-binding zzinreads-gcp \
    --member="serviceAccount:google-ads-notion-sync@zzinreads-gcp.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Cloud Run 배포 권한 부여
gcloud projects add-iam-policy-binding zzinreads-gcp \
    --member="serviceAccount:google-ads-notion-sync@zzinreads-gcp.iam.gserviceaccount.com" \
    --role="roles/run.invoker"
```

## 4. GitHub에 소스 코드 푸시

```bash
git add .
git commit -m "Production ready deployment with Secret Manager"
git push origin main
```

## 5. Cloud Build 트리거 설정

1. **Google Cloud Console** → **Cloud Build** → **트리거**
2. **트리거 만들기** 클릭
3. GitHub 저장소 연결
4. `cloudbuild.yaml` 파일 사용하도록 설정
5. 트리거 실행

## 6. 수동 배포 (대안)

```bash
# Cloud Build 수동 실행
gcloud builds submit --config cloudbuild.yaml

# 직접 Docker 이미지 빌드 및 배포
gcloud builds submit --tag gcr.io/zzinreads-gcp/google-ads-notion-sync

gcloud run deploy google-ads-notion-sync \
    --image gcr.io/zzinreads-gcp/google-ads-notion-sync \
    --region asia-northeast3 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --service-account google-ads-notion-sync@zzinreads-gcp.iam.gserviceaccount.com \
    --set-env-vars NODE_ENV=production,GOOGLE_CLOUD_PROJECT=zzinreads-gcp
```

## 📝 배포 후 확인사항

1. **Cloud Run 서비스 URL 확인**
   ```bash
   gcloud run services describe google-ads-notion-sync --region asia-northeast3
   ```

2. **로그 확인**
   ```bash
   gcloud logs read "resource.type=cloud_run_revision" --limit 50
   ```

3. **Secret Manager 로드 확인**
   - 로그에서 "✅ Secret Manager에서 환경 변수 로드 완료" 메시지 확인

4. **API 연결 테스트**
   - `https://your-service-url/api/health` 엔드포인트 확인

5. **스케줄러 작동 확인**
   - Cloud Scheduler 콘솔에서 작업 생성 (선택사항)

## 🔧 주요 특징

- ✅ **통합 Secret Manager**: 모든 환경 변수를 JSON 하나로 관리
- ✅ **자동 폴백**: Secret Manager 실패 시 로컬 .env 사용
- ✅ **보안**: 서비스 계정 기반 인증
- ✅ **확장성**: Cloud Run 자동 스케일링
- ✅ **모니터링**: Google Cloud Logging 통합

## 🚨 보안 참고사항

1. **config.json 파일은 .gitignore에 추가**되어 있습니다
2. **Secret Manager만** 환경 변수를 저장하세요
3. **서비스 계정 키**는 절대 코드에 포함하지 마세요
4. **프로덕션 환경**에서는 Cloud IAM으로 액세스 제어하세요

배포가 완료되면 Cloud Run URL을 통해 웹 인터페이스에 접속할 수 있습니다!