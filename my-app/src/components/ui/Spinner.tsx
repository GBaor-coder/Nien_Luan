import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  trackColor?: string;
  label?: string;
  className?: string;
}

const sizeMap: Record<SpinnerSize, { px: number; stroke: number }> = {
  xs: { px: 14, stroke: 2 },
  sm: { px: 20, stroke: 2.5 },
  md: { px: 28, stroke: 3 },
  lg: { px: 44, stroke: 4 },
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = '#2563EB',
  trackColor = 'rgba(148, 163, 184, 0.3)',
  label,
  className = '',
}) => {
  const { px, stroke } = sizeMap[size];
  const r = (px - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <span role="status" aria-live="polite" className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        className="animate-spin"
        style={{ animationDuration: '0.8s' }}
      >
        <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * 0.75} ${c}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${px / 2} ${px / 2})`}
        />
      </svg>
      {label && (
        <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
      )}
    </span>
  );
};

export default Spinner;
