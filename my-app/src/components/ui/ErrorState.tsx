import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  compact?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Không thể tải dữ liệu',
  description = 'Đã có lỗi xảy ra trong quá trình tải dữ liệu. Vui lòng thử lại sau.',
  onRetry,
  retryLabel = 'Thử lại',
  className = '',
  compact = false,
}) => {
  if (compact) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}>
        <AlertTriangle size={28} className="text-amber-500" />
        <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">{title}</p>
        {description && <p className="text-[12px] text-slate-400 max-w-[420px]">{description}</p>}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-[12px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0"
          >
            <RefreshCw size={13} /> {retryLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-500/50 p-12 text-center ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={28} className="text-red-600 dark:text-red-400" />
      </div>
      <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      {description && (
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 max-w-[420px] mx-auto">{description}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0"
        >
          <RefreshCw size={14} /> {retryLabel}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
