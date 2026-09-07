import React from 'react';

const statusMap: Record<string, { bg: string; color: string; label: string }> = {
  available: { bg: '#F0FDF4', color: '#16A34A', label: 'Có sẵn' },
  limited: { bg: '#FFFBEB', color: '#D97706', label: 'Hạn chế' },
  out_of_stock: { bg: '#FEF2F2', color: '#DC2626', label: 'Hết sách' },
  active: { bg: '#F0FDF4', color: '#16A34A', label: 'Đang hoạt động' },
  inactive: { bg: '#F1F5F9', color: '#64748B', label: 'Ngừng hoạt động' },
  suspended: { bg: '#FEF2F2', color: '#DC2626', label: 'Đình chỉ' },
  returned: { bg: '#EFF6FF', color: '#2563EB', label: 'Đã trả' },
  pending: { bg: '#FFFBEB', color: '#D97706', label: 'Đang chờ' },
  overdue: { bg: '#FEF2F2', color: '#DC2626', label: 'Quá hạn' },
  success: { bg: '#F0FDF4', color: '#16A34A', label: 'Thành công' },
  in_queue: { bg: '#EFF6FF', color: '#2563EB', label: 'Đang chờ' },
  processing: { bg: '#FFFBEB', color: '#D97706', label: 'Đang xử lý' },
  ready_for_pickup: { bg: '#F0FDF4', color: '#16A34A', label: 'Sẵn sàng nhận' },
  fulfilled: { bg: '#F0FDF4', color: '#16A34A', label: 'Đã nhận' },
  cancelled: { bg: '#F1F5F9', color: '#64748B', label: 'Đã hủy' },
  expired: { bg: '#F1F5F9', color: '#94A3B8', label: 'Hết hạn' },
};

interface StatusBadgeProps {
  status: string;
  dot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, dot = false }) => {
  const s = statusMap[status] || { bg: '#F1F5F9', color: '#64748B', label: status };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />}
      {s.label}
    </span>
  );
};

export default StatusBadge;
