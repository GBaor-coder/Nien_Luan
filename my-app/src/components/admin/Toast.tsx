import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-slide-up">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lift border min-w-[300px] max-w-sm ${
          isSuccess
            ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-500/30'
            : 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-500/30'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isSuccess ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-red-50 dark:bg-red-500/10 text-red-500'
          }`}
        >
          <Icon size={18} />
        </div>
        <span className="text-[14px] font-medium text-slate-700 dark:text-slate-200 flex-1">{message}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
