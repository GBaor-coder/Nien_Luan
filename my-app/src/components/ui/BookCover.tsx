import React from 'react';

interface BookCoverProps {
  title?: string;
  subtitle?: string;
  coverImage?: string | null;
  coverColor?: string | null;
  className?: string;
  textClassName?: string;
  showTitle?: boolean;
}

const GRADIENT_SETS: [string, string][] = [
  ['#2563EB', '#1E3A8A'],
  ['#7C3AED', '#4C1D95'],
  ['#0EA5E9', '#075985'],
  ['#059669', '#064E3B'],
  ['#F59E0B', '#92400E'],
  ['#EC4899', '#9D174D'],
  ['#6366F1', '#312E81'],
  ['#14B8A6', '#134E4A'],
  ['#F43F5E', '#881337'],
  ['#8B5CF6', '#5B21B6'],
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const value = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(value, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function shade(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 + percent), g * (1 + percent), b * (1 + percent));
}

const BookCover: React.FC<BookCoverProps> = ({
  title = '',
  subtitle,
  coverImage,
  coverColor,
  className = '',
  textClassName = '',
  showTitle = true,
}) => {
  const gradient = coverColor
    ? `linear-gradient(155deg, ${coverColor} 0%, ${shade(coverColor, -0.35)} 100%)`
    : `linear-gradient(155deg, ${GRADIENT_SETS[hashCode(title) % GRADIENT_SETS.length][0]} 0%, ${GRADIENT_SETS[hashCode(title) % GRADIENT_SETS.length][1]} 100%)`;

  if (coverImage) {
    return (
      <div className={`relative flex-shrink-0 overflow-hidden rounded-xl ${className}`}>
        <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden rounded-xl flex items-end justify-center ${className}`}
      style={{ background: gradient }}
    >
      {/* Gáy sách */}
      <div className="absolute inset-y-0 left-0 w-[7%] bg-white/15" />
      <div className="absolute inset-y-0 left-[7%] w-px bg-white/10" />

      {/* Ánh sáng trang trí */}
      <div className="absolute -top-12 -right-8 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-black/10 blur-xl" />

      {/* Ký hiệu trang trí */}
      <div className="absolute top-3 right-3 w-4 h-4 rounded-full border border-white/25" />

      {(showTitle || subtitle) && (
        <div className="relative z-10 flex flex-col items-center justify-end px-3 pb-3 text-center">
          {showTitle && (
            <span className={`text-white font-semibold leading-snug line-clamp-3 ${textClassName}`}>
              {title}
            </span>
          )}
          {subtitle && (
            <span className="text-white/80 text-[10px] line-clamp-1 mt-1">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default BookCover;
