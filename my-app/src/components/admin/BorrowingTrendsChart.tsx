import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../context/useTheme';

interface BorrowingTrendsChartProps {
  data?: { month: string; borrowed: number; returned: number }[];
}

const BorrowingTrendsChart: React.FC<BorrowingTrendsChartProps> = ({ data = [] }) => {
  const { isDark } = useTheme();

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100">
            Xu hướng Mượn - Trả
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Hoạt động mượn trả theo tháng</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-[12px] text-slate-500 dark:text-slate-400">Đã mượn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-[12px] text-slate-500 dark:text-slate-400">Đã trả</span>
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1E293B' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                borderRadius: '8px',
                fontSize: '13px',
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            />
            <Bar dataKey="borrowed" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="returned" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BorrowingTrendsChart;
