import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, Settings, Activity, Play } from 'lucide-react';
import { authApi } from '../services/api';

const Layout: React.FC = () => {
  const location = useLocation();

  const handleLogout = () => {
    authApi.logout();
    window.location.href = '/login';
  };

  const navigation = [
    { name: '대시보드', path: '/', icon: Activity },
    { name: '수동 동기화', path: '/sync', icon: Play },
    { name: '설정', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Google Ads - Notion 동기화
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 inline-flex items-center px-3 py-2 text-sm font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;