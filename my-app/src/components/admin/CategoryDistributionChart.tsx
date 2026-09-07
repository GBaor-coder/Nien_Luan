import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../context/useTheme';

interface CategoryDistributionChartProps {
  data?: { name: string; value: number; color: string }[];
}

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ data = [] }) => {
  const { isDark } = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100">
          Phân bố theo Thể loại
        </h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Tồn kho thư viện theo thể loại</p>
      </div>

      <div className="flex flex-col items-center">
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${Number(value).toLocaleString()} sách`, name]}
                contentStyle={{
                  backgroundColor: isDark ? '#1E293B' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="w-full mt-2">
          {data.map((item) => {
            const pct = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[13px] text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-[12px] text-slate-400 dark:text-slate-500 w-[42px] text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryDistributionChart;
