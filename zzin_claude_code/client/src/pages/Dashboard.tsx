import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Server,
  Database
} from 'lucide-react';
import { syncApi } from '../services/api';
import { SystemHealth, SystemStatus } from '../types';

const Dashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [healthData, statusData] = await Promise.all([
        syncApi.getHealth(),
        syncApi.getStatus(),
      ]);
      
      setHealth(healthData);
      setStatus(statusData);
    } catch (error: any) {
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-success-600 bg-success-50';
      case 'degraded':
        return 'text-warning-600 bg-warning-50';
      case 'unhealthy':
        return 'text-error-600 bg-error-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />;
      case 'degraded':
        return <Clock className="w-5 h-5" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}시간 ${minutes}분`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">시스템 대시보드</h1>
        <button
          onClick={fetchData}
          className="btn-secondary inline-flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${getStatusColor(health?.status || 'unknown')}`}>
              {getStatusIcon(health?.status || 'unknown')}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">전체 상태</h3>
              <p className="text-sm text-gray-600 capitalize">
                {health?.status === 'healthy' && '정상'}
                {health?.status === 'degraded' && '일부 문제'}
                {health?.status === 'unhealthy' && '서비스 중단'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              health?.services.googleAds ? 'text-success-600 bg-success-50' : 'text-error-600 bg-error-50'
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Google Ads API</h3>
              <p className="text-sm text-gray-600">
                {health?.services.googleAds ? '연결됨' : '연결 실패'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              health?.services.notion ? 'text-success-600 bg-success-50' : 'text-error-600 bg-error-50'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Notion API</h3>
              <p className="text-sm text-gray-600">
                {health?.services.notion ? '연결됨' : '연결 실패'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">스케줄러 상태</h3>
          <div className="space-y-3">
            {status?.scheduler && Object.entries(status.scheduler).map(([name, isRunning]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {name === 'morning-sync' && '오전 자동 동기화'}
                  {name === 'evening-sync' && '오후 자동 동기화'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isRunning ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isRunning ? '실행 중' : '중지됨'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">시스템 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">사용자</span>
              <span className="text-sm font-medium text-gray-900">
                {status?.user || '알 수 없음'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">서버 실행 시간</span>
              <span className="text-sm font-medium text-gray-900">
                {status?.uptime ? formatUptime(status.uptime) : '알 수 없음'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">마지막 업데이트</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date().toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;