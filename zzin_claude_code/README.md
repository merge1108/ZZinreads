# Google Ads - Notion 동기화 서비스

Google Ads MCC 계정의 캠페인 정보를 Notion 데이터베이스와 자동으로 동기화하는 서버리스 웹앱입니다.

🚀 **배포 상태**: Cloud Run europe-west1에 자동 배포 설정 완료

## 주요 기능

- **자동 동기화**: 매일 오전 9시, 오후 6시 자동 실행
- **수동 동기화**: 웹 인터페이스를 통한 즉시 동기화
- **보안**: JWT 인증, Rate Limiting, 보안 헤더 적용
- **모니터링**: 실시간 상태 모니터링 및 로깅
- **안정성**: 에러 처리, 재시도 로직, 헬스체크

## 아키텍처

```
Google Ads MCC 계정
├── 하위 계정 1
└── 하위 계정 2
    ↓
Google Ads API → 서버리스 웹앱 → Notion API
    ↓
Notion 데이터베이스 (캠페인명, 광고 일정)
```

## 시스템 요구사항

- Node.js 18+
- Google Cloud Platform 계정
- Google Ads API 액세스
- Notion 통합 설정

## 설치 및 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd google-ads-notion-sync
npm install
cd client && npm install
```

### 2. 환경 변수 설정

`.env.example`을 참고하여 `.env` 파일을 생성하고 설정:

```bash
# Google Ads API
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret  
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_MCC_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_SUB_ACCOUNTS=111-111-1111,222-222-2222

# Notion API
NOTION_API_KEY=secret_your_notion_integration_token
NOTION_DATABASE_ID=your_database_id

# 서버 설정
JWT_SECRET=your_jwt_secret_key
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password
```

### 3. 관리자 비밀번호 해시 생성

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_password', 12));"
```

### 4. 로컬 개발 실행

```bash
# 서버 실행
npm run dev

# 클라이언트 실행 (새 터미널)
cd client && npm run dev
```

## Google Cloud Run 배포

### 1. GCP 설정

```bash
# 프로젝트 설정 스크립트 실행
chmod +x scripts/setup-gcp.sh
./scripts/setup-gcp.sh YOUR_PROJECT_ID
```

### 2. Secret Manager 설정

GCP 콘솔에서 Secret Manager로 이동하여 실제 값으로 업데이트:

- `google-ads-config`: Google Ads API 설정
- `notion-config`: Notion API 설정  
- `app-config`: 앱 보안 설정

### 3. 배포 실행

```bash
# 배포 스크립트 실행
chmod +x scripts/deploy.sh
./scripts/deploy.sh YOUR_PROJECT_ID
```

## Notion 데이터베이스 설정

데이터베이스에 다음 속성들이 필요합니다:

| 속성명 | 타입 | 설명 |
|--------|------|------|
| 캠페인명 | 제목 | Google Ads 캠페인 이름과 매칭 |
| 광고 일정 | 텍스트 | 캠페인 시작일~종료일 정보 |

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 관리자 로그인

### 동기화
- `POST /api/sync/manual` - 수동 동기화 실행
- `POST /api/webhook/sync` - 웹훅 동기화 (API 키 필요)

### 모니터링  
- `GET /api/health` - 시스템 헬스체크
- `GET /api/status` - 시스템 상태 조회 (인증 필요)

## 보안 기능

- **인증**: JWT 토큰 기반 인증
- **Rate Limiting**: API 호출 제한
- **보안 헤더**: Helmet.js 적용
- **입력 검증**: Joi 스키마 검증
- **로깅**: Winston 로거로 모든 활동 기록

## 모니터링 및 로깅

- **헬스체크**: `/api/health` 엔드포인트
- **로그 파일**: `logs/` 디렉토리에 저장
- **에러 추적**: 상세한 에러 로깅 및 알림
- **메트릭**: Cloud Run 메트릭 수집

## 스케줄러 설정

Cloud Scheduler로 자동 실행:

- **오전 동기화**: 매일 09:00 (KST)
- **오후 동기화**: 매일 18:00 (KST)

## 트러블슈팅

### 일반적인 문제

1. **Google Ads API 연결 실패**
   - 개발자 토큰, 클라이언트 ID/Secret 확인
   - MCC 계정 권한 확인
   - 리프레시 토큰 갱신

2. **Notion API 연결 실패**
   - 통합 토큰 권한 확인
   - 데이터베이스 ID 확인
   - 데이터베이스 속성명 일치 확인

3. **동기화 실패**
   - 로그 파일 확인 (`logs/error.log`)
   - 캠페인 이름 매칭 확인
   - 네트워크 연결 상태 확인

### 로그 확인

```bash
# 에러 로그 확인
tail -f logs/error.log

# 전체 로그 확인  
tail -f logs/combined.log

# Cloud Run 로그 (배포 환경)
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=google-ads-notion-sync" --limit=50
```

## 개발 가이드

### 프로젝트 구조

```
├── src/
│   ├── config/          # 설정 파일
│   ├── middleware/      # Express 미들웨어
│   ├── routes/          # API 라우트
│   ├── services/        # 비즈니스 로직
│   ├── types/           # TypeScript 타입
│   └── utils/           # 유틸리티 함수
├── client/              # React 프론트엔드
├── scripts/             # 배포 스크립트
└── logs/                # 로그 파일
```

### 코드 품질

- **TypeScript**: 강력한 타입 시스템
- **ESLint**: 코드 스타일 검사
- **Jest**: 단위 테스트 (선택사항)

## 라이선스

MIT License

## 지원

문제가 발생하면 다음을 확인해 주세요:

1. 환경 변수 설정
2. API 권한 및 토큰
3. 로그 파일
4. 네트워크 연결

추가 도움이 필요하면 개발팀에 문의하세요.