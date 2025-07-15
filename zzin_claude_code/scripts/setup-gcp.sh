#!/bin/bash

# Google Cloud Run 배포를 위한 설정 스크립트
# 사용법: ./scripts/setup-gcp.sh PROJECT_ID

set -e

PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME="google-ads-notion-sync"
REGION="asia-northeast3"
SERVICE_ACCOUNT_NAME="google-ads-notion-sync"

echo "🚀 Google Cloud 프로젝트 설정 시작: $PROJECT_ID"

# 프로젝트 설정
echo "📝 프로젝트 설정 중..."
gcloud config set project $PROJECT_ID

# 필요한 API 활성화
echo "🔧 필요한 API 활성화 중..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudscheduler.googleapis.com

# 서비스 계정 생성
echo "👤 서비스 계정 생성 중..."
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="Google Ads Notion Sync Service" \
    --description="Service account for Google Ads Notion sync application"

# 서비스 계정에 필요한 권한 부여
echo "🔑 서비스 계정 권한 설정 중..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/monitoring.metricWriter"

# Secret Manager에 시크릿 생성 (빈 값으로 초기화)
echo "🔐 Secret Manager 시크릿 생성 중..."

# Google Ads 설정
gcloud secrets create google-ads-config --data-file=- <<< '{
  "developer-token": "YOUR_DEVELOPER_TOKEN",
  "client-id": "YOUR_CLIENT_ID", 
  "client-secret": "YOUR_CLIENT_SECRET",
  "refresh-token": "YOUR_REFRESH_TOKEN",
  "mcc-customer-id": "YOUR_MCC_CUSTOMER_ID",
  "sub-accounts": "ACCOUNT1,ACCOUNT2"
}'

# Notion 설정  
gcloud secrets create notion-config --data-file=- <<< '{
  "api-key": "YOUR_NOTION_API_KEY",
  "database-id": "YOUR_DATABASE_ID"
}'

# 앱 설정
gcloud secrets create app-config --data-file=- <<< '{
  "jwt-secret": "YOUR_JWT_SECRET",
  "admin-password-hash": "YOUR_ADMIN_PASSWORD_HASH",
  "api-key": "YOUR_API_KEY"
}'

echo "📋 Cloud Scheduler 작업 생성 중..."

# 오전 9시 스케줄러
gcloud scheduler jobs create http morning-sync \
    --schedule="0 9 * * *" \
    --uri="https://$SERVICE_NAME-$(gcloud config get-value project | tr ':' '-' | tr '.' '-')-$REGION.a.run.app/api/webhook/sync" \
    --http-method=POST \
    --headers="X-API-Key=YOUR_API_KEY" \
    --time-zone="Asia/Seoul" \
    --description="Morning sync job for Google Ads to Notion"

# 오후 6시 스케줄러  
gcloud scheduler jobs create http evening-sync \
    --schedule="0 18 * * *" \
    --uri="https://$SERVICE_NAME-$(gcloud config get-value project | tr ':' '-' | tr '.' '-')-$REGION.a.run.app/api/webhook/sync" \
    --http-method=POST \
    --headers="X-API-Key=YOUR_API_KEY" \
    --time-zone="Asia/Seoul" \
    --description="Evening sync job for Google Ads to Notion"

echo "✅ Google Cloud 설정 완료!"
echo ""
echo "📝 다음 단계:"
echo "1. Secret Manager에서 실제 API 키와 토큰으로 시크릿 업데이트"
echo "2. Cloud Scheduler의 API 키 헤더 값 업데이트"
echo "3. Cloud Build 트리거 설정 또는 수동 배포 실행"
echo ""
echo "🔧 배포 명령어:"
echo "   gcloud builds submit --config cloudbuild.yaml"
echo ""
echo "🌐 배포 후 URL:"
echo "   https://$SERVICE_NAME-$(gcloud config get-value project | tr ':' '-' | tr '.' '-')-$REGION.a.run.app"