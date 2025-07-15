import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { syncApi } from '../services/api';
import { SyncResult } from '../types';

const Sync: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);

  const handleManualSync = async () => {
    setIsLoading(true);
    
    try {
      const result = await syncApi.manual();
      setLastResult(result);
      
      if (result.success) {
        toast.success(
          `동기화 완료! ${result.updatedPages}개 페이지가 업데이트되었습니다.`
        );
      } else {
        toast.warning(
          `동기화가 부분적으로 완료되었습니다. ${result.errors.length}개의 오류가 발생했습니다.`
        );
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || '동기화 실행 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">수동 동기화</h1>
        <p className="text-gray-600 mt-2">
          Google Ads 캠페인 정보를 Notion 데이터베이스와 즉시 동기화합니다.
        </p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">동기화 실행</h3>
            <p className="text-sm text-gray-600 mt-1">
              모든 하위 계정의 캠페인 정보를 가져와서 Notion 페이지를 업데이트합니다.
            </p>
          </div>
          <button
            onClick={handleManualSync}
            disabled={isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                동기화 중...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                동기화 시작
              </>
            )}
          </button>
        </div>

        {lastResult && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">마지막 동기화 결과</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {lastResult.processedCampaigns}
                </div>
                <div className="text-sm text-gray-600">처리된 캠페인</div>
              </div>
              
              <div className="text-center p-4 bg-success-50 rounded-lg">
                <div className="text-2xl font-bold text-success-600">
                  {lastResult.updatedPages}
                </div>
                <div className="text-sm text-gray-600">업데이트된 페이지</div>
              </div>
              
              <div className="text-center p-4 bg-error-50 rounded-lg">
                <div className="text-2xl font-bold text-error-600">
                  {lastResult.errors.length}
                </div>
                <div className="text-sm text-gray-600">오류</div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {lastResult.success ? (
                  <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-error-600 mr-2" />
                )}
                <span className={`font-medium ${
                  lastResult.success ? 'text-success-600' : 'text-error-600'
                }`}>
                  {lastResult.success ? '동기화 성공' : '동기화 실패'}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {formatTimestamp(lastResult.timestamp)}
              </div>
            </div>

            {lastResult.errors.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">오류 목록:</h5>
                <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                  <ul className="space-y-1">
                    {lastResult.errors.map((error, index) => (
                      <li key={index} className="text-sm text-error-700">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">자동 동기화 스케줄</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">오전 동기화</div>
              <div className="text-sm text-gray-600">매일 오전 9시에 실행</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
              활성화
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">오후 동기화</div>
              <div className="text-sm text-gray-600">매일 오후 6시에 실행</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
              활성화
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sync;