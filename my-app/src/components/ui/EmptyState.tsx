import React from 'react';
import type { ComponentType } from 'react';

interface EmptyStateProps {
  icon?: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {Icon && <Icon size={48} className="mx-auto mb-4 text-slate-200 dark:text-slate-700" />}
      <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400">{title}</p>
      {description && <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors cursor-pointer border-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
