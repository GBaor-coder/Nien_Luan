import React from 'react';
import { BookOpen, BookMarked, CheckCircle, Users } from 'lucide-react';

interface QuickStatsProps {
  activeCount: number;
  totalCount: number;
  returnedCount: number;
  maxBorrow: number;
  loading: boolean;
}

const QuickStats: React.FC<QuickStatsProps> = ({ activeCount, totalCount, returnedCount, maxBorrow, loading }) => {
  const stats = [
    {
      label: 'Đang mượn',
      value: activeCount,
      max: maxBorrow,
      icon: BookOpen,
      color: '#2563EB',
      bg: '#EFF6FF',
    },
    {
      label: 'Tổng lần mượn',
      value: totalCount,
      icon: BookMarked,
      color: '#8B5CF6',
      bg: '#F3E8FF',
    },
    {
      label: 'Đã trả',
      value: returnedCount,
      icon: CheckCircle,
      color: '#16A34A',
      bg: '#F0FDF4',
    },
    {
      label: 'Giới hạn mượn',
      value: maxBorrow,
      icon: Users,
      color: '#D97706',
      bg: '#FFFBEB',
    },
  ];

  return (
    <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-100 mb-4">Thống kê nhanh</h3>
        <div className="space-y-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: stat.bg }}
                >
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-[16px] font-bold text-slate-900 dark:text-slate-100">{loading ? '-' : stat.value}</p>
                </div>
                {stat.max && (
                  <span className="text-[11px] text-slate-400">/ {stat.max}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
