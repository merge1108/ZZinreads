#!/bin/bash

# Cloud Run 배포 스크립트
# 사용법: ./scripts/deploy.sh [PROJECT_ID]

set -e

PROJECT_ID=${1:-$(gcloud config get-value project)}
SERVICE_NAME="google-ads-notion-sync"
REGION="asia-northeast3"

if [ -z "$PROJECT_ID" ]; then
    echo "❌ 오류: 프로젝트 ID가 필요합니다."
    echo "사용법: ./scripts/deploy.sh PROJECT_ID"
    exit 1
fi

echo "🚀 Cloud Run 배포 시작..."
echo "프로젝트: $PROJECT_ID"
echo "서비스: $SERVICE_NAME"
echo "리전: $REGION"
echo ""

# 프로젝트 설정 확인
gcloud config set project $PROJECT_ID

# Docker 이미지 빌드 및 배포
echo "🏗️  Cloud Build로 이미지 빌드 및 배포 중..."
gcloud builds submit --config cloudbuild.yaml

echo "✅ 배포 완료!"
echo ""

# 서비스 URL 가져오기
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo "🌐 서비스 URL: $SERVICE_URL"
echo "📊 대시보드: $SERVICE_URL"
echo "🔧 API 헬스체크: $SERVICE_URL/api/health"
echo ""

# 서비스 상태 확인
echo "🔍 서비스 상태 확인 중..."
gcloud run services describe $SERVICE_NAME --region=$REGION --format="table(
    metadata.name,
    status.conditions[0].type,
    status.conditions[0].status,
    status.url
)"

echo ""
echo "📝 추가 작업:"
echo "1. Secret Manager에서 API 키와 토큰 설정 확인"
echo "2. Notion 데이터베이스 구조 확인 ('캠페인명', '광고 일정' 속성)"
echo "3. Google Ads MCC 계정과 하위 계정 권한 확인"
echo "4. Cloud Scheduler 작업의 API 키 헤더 업데이트"