import React from 'react';
import { Settings as SettingsIcon, Info, Shield, Database, Calendar } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-600 mt-2">
          시스템 설정 및 구성 정보를 확인할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">API 연결 설정</h3>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Google Ads API</h4>
              <p className="text-sm text-gray-600">
                MCC 계정과 2개의 하위 계정에서 캠페인 정보를 가져옵니다.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notion API</h4>
              <p className="text-sm text-gray-600">
                지정된 데이터베이스의 페이지를 업데이트합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">동기화 스케줄</h3>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900">자동 실행</h4>
              <p className="text-sm text-gray-600">
                매일 오전 9시와 오후 6시에 자동으로 동기화가 실행됩니다.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">수동 실행</h4>
              <p className="text-sm text-gray-600">
                필요시 언제든지 수동으로 동기화를 실행할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">보안 설정</h3>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900">인증</h4>
              <p className="text-sm text-gray-600">
                JWT 토큰 기반 인증으로 보안이 강화되어 있습니다.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">API 보호</h4>
              <p className="text-sm text-gray-600">
                Rate limiting과 보안 헤더로 API가 보호됩니다.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">로깅</h4>
              <p className="text-sm text-gray-600">
                모든 작업이 로그로 기록되어 추적 가능합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Info className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">동기화 규칙</h3>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900">캠페인 이름 매칭</h4>
              <p className="text-sm text-gray-600">
                Google Ads의 캠페인 이름과 Notion의 '캠페인명' 속성이 일치하는 페이지를 찾습니다.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">광고 일정 업데이트</h4>
              <p className="text-sm text-gray-600">
                캠페인의 시작일과 종료일을 파싱하여 Notion의 '광고 일정' 속성에 입력합니다.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">오류 처리</h4>
              <p className="text-sm text-gray-600">
                매칭되지 않는 캠페인이나 오류는 로그에 기록되며 사용자에게 알림됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center mb-4">
          <SettingsIcon className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">환경 변수 설정 가이드</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            시스템이 정상적으로 작동하려면 다음 환경 변수들이 설정되어야 합니다:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Google Ads API</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• GOOGLE_ADS_DEVELOPER_TOKEN</li>
                <li>• GOOGLE_ADS_CLIENT_ID</li>
                <li>• GOOGLE_ADS_CLIENT_SECRET</li>
                <li>• GOOGLE_ADS_REFRESH_TOKEN</li>
                <li>• GOOGLE_ADS_MCC_CUSTOMER_ID</li>
                <li>• GOOGLE_ADS_SUB_ACCOUNTS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">기타 설정</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• NOTION_API_KEY</li>
                <li>• NOTION_DATABASE_ID</li>
                <li>• JWT_SECRET</li>
                <li>• ADMIN_PASSWORD_HASH</li>
                <li>• API_KEY (선택사항)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;