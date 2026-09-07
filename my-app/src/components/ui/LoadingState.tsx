import React from 'react';
import Spinner, { type SpinnerSize } from './Spinner';

interface LoadingStateProps {
  label?: string;
  size?: SpinnerSize;
  className?: string;
  minHeight?: number | string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Đang tải dữ liệu...',
  size = 'md',
  className = '',
  minHeight = 240,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      style={{ minHeight }}
    >
      <Spinner size={size} />
      <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 animate-pulse-gentle">
        {label}
      </span>
    </div>
  );
};

export default LoadingState;
