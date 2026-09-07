import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {title}
        </h2>
        <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export default PageHeader;
