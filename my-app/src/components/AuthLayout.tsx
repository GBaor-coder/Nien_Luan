import React from 'react';
import { Library } from 'lucide-react';
import HeroSection from './HeroSection';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Hero bên trái */}
      <div className="hidden lg:block w-[55%] flex-shrink-0">
        <HeroSection />
      </div>

      {/* Form bên phải */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          {/* Header trên mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30 mb-4">
              <Library size={28} className="text-white" />
            </div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-slate-100">
              Hệ thống Quản lý Thư viện Trường học
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              Thư viện thông minh cho giáo dục hiện đại
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
