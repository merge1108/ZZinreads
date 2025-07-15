# Google Ads-Notion Sync 배포 스크립트

Write-Host "🚀 Google Ads-Notion Sync 배포 시작..." -ForegroundColor Green

# 변수 설정
$PROJECT_ID = "zzinreads-gcp"
$SERVICE_NAME = "google-ads-notion-sync"
$REGION = "asia-northeast3"
$SERVICE_ACCOUNT = "zzinreads@zzinreads-gcp.iam.gserviceaccount.com"

# 프로젝트 설정
Write-Host "📋 프로젝트 설정: $PROJECT_ID" -ForegroundColor Blue
gcloud config set project $PROJECT_ID

# API 활성화
Write-Host "🔧 필요한 API 활성화 중..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 권한 확인
Write-Host "🔐 서비스 계정 권한 설정 중..." -ForegroundColor Yellow

# Cloud Build 서비스 계정 정보 가져오기
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
$CLOUDBUILD_SA = "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"

# 서비스 계정 사용 권한
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT `
    --member="serviceAccount:$CLOUDBUILD_SA" `
    --role="roles/iam.serviceAccountUser"

# Cloud Run 관리 권한
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/run.admin"

# Storage 관리 권한 (Container Registry용)
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/storage.admin"

# 빌드 및 배포
Write-Host "🏗️ 이미지 빌드 및 배포 중..." -ForegroundColor Magenta
gcloud builds submit --config cloudbuild.yaml

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 배포 성공!" -ForegroundColor Green
    
    # 서비스 URL 가져오기
    $SERVICE_URL = gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"
    
    Write-Host "🌐 서비스 URL: $SERVICE_URL" -ForegroundColor Cyan
    Write-Host "📊 로그 확인: gcloud logs read `"resource.type=cloud_run_revision`" --limit 50" -ForegroundColor Gray
    Write-Host "🎉 배포 완료!" -ForegroundColor Green
} else {
    Write-Host "❌ 배포 실패. 로그를 확인하세요." -ForegroundColor Red
    gcloud builds log --limit=10
}

Write-Host "
📝 다음 단계:
1. 서비스 URL로 웹 인터페이스 접속
2. admin 계정으로 로그인 (비밀번호: choiwseok1108423)
3. API 연결 상태 확인
4. 수동 동기화 테스트
" -ForegroundColor White