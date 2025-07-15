import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { LogIn } from 'lucide-react';
import { authApi, LoginCredentials } from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      const response = await authApi.login(data);
      authApi.setToken(response.token);
      toast.success('로그인 성공!');
      navigate('/');
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || '로그인에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <LogIn className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            관리자 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Google Ads - Notion 동기화 서비스
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="username" className="label">
              사용자명
            </label>
            <input
              {...register('username', {
                required: '사용자명을 입력해주세요.',
              })}
              type="text"
              className="input"
              placeholder="사용자명"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-error-600">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="label">
              비밀번호
            </label>
            <input
              {...register('password', {
                required: '비밀번호를 입력해주세요.',
              })}
              type="password"
              className="input"
              placeholder="비밀번호"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-error-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;