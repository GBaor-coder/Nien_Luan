import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

const SessionExpiredModal: React.FC = () => {
  const { authExpired, dismissAuthExpired } = useAuth();

  if (!authExpired) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-md p-6"
        style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-50 dark:bg-red-500/20">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100 mb-2">
          Phiên đăng nhập đã hết hạn
        </h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              dismissAuthExpired();
              window.location.href = '/login';
            }}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors cursor-pointer border-0"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
