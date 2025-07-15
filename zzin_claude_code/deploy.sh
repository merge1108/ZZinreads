#!/bin/bash

echo "🚀 Google Ads-Notion Sync 배포 시작..."

# 프로젝트 설정
PROJECT_ID="zzinreads-gcp"
SERVICE_NAME="google-ads-notion-sync"
REGION="asia-northeast3"
SERVICE_ACCOUNT="zzinreads@zzinreads-gcp.iam.gserviceaccount.com"

# 프로젝트 설정 확인
echo "📋 프로젝트 설정: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# API 활성화
echo "🔧 필요한 API 활성화 중..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 빌드 및 배포
echo "🏗️ 이미지 빌드 및 배포 중..."
gcloud builds submit --config cloudbuild.yaml

# 배포 상태 확인
echo "✅ 배포 완료! 서비스 정보:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format="export"

# 서비스 URL 출력
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "🌐 서비스 URL: $SERVICE_URL"

echo "📊 로그 확인:"
echo "gcloud logs read \"resource.type=cloud_run_revision\" --limit 50"

echo "🎉 배포 완료!"