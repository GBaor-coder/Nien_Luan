import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useTheme } from '../../context/useTheme';
import type { StatusDistribution } from '../../services/dashboard.service';

interface StatusDistributionChartProps {
  data?: StatusDistribution[];
}

const statusLabels: Record<string, string> = {
  available: 'Có sẵn',
  borrowed: 'Đang mượn',
  reserved: 'Đặt trước',
  overdue: 'Quá hạn',
  lost: 'Mất',
  damaged: 'Hỏng',
};

const statusColors: Record<string, string> = {
  available: '#22C55E',
  borrowed: '#2563EB',
  reserved: '#A855F7',
  overdue: '#EF4444',
  lost: '#6B7280',
  damaged: '#F59E0B',
};

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data = [] }) => {
  const { isDark } = useTheme();

  const chartData = data.map((item) => ({
    status: statusLabels[item.status] || item.status,
    count: item.count,
    color: statusColors[item.status] || '#94A3B8',
  }));

  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100">
          Trạng thái mượn trả
        </h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Phân bổ phiếu mượn theo trạng thái</p>
      </div>

      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical" barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} horizontal={false} />
            <XAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }}
              dataKey="status"
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
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusDistributionChart;
