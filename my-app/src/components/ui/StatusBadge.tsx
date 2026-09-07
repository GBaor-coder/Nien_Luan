import React from 'react';
import type { StatusConfig } from '../../data/statusConfig';

interface StatusBadgeProps {
  config: StatusConfig;
  dot?: boolean;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ config, dot = false, size = 'sm' }) => {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold flex-shrink-0 whitespace-nowrap ${padding}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dot || config.text }} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
