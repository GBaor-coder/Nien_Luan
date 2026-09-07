export interface StatusConfig {
  bg: string;
  text: string;
  label: string;
  dot?: string;
}

export const BORROW_STATUS: Record<string, StatusConfig> = {
  active: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Đang mượn' },
  overdue: { bg: '#FEF2F2', text: '#DC2626', label: 'Quá hạn' },
  returned: { bg: '#F0FDF4', text: '#16A34A', label: 'Đã trả' },
  due_soon: { bg: '#FFFBEB', text: '#D97706', label: 'Sắp hết hạn' },
};

export const RESERVATION_STATUS: Record<string, StatusConfig> = {
  in_queue: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Đang chờ', dot: '#2563EB' },
  processing: { bg: '#FFFBEB', text: '#D97706', label: 'Đang xử lý', dot: '#F59E0B' },
  ready_for_pickup: { bg: '#F0FDF4', text: '#16A34A', label: 'Sẵn sàng nhận', dot: '#22C55E' },
  ready: { bg: '#F0FDF4', text: '#16A34A', label: 'Sẵn sàng nhận', dot: '#22C55E' },
  fulfilled: { bg: '#F0FDF4', text: '#16A34A', label: 'Đã nhận', dot: '#22C55E' },
  expired: { bg: '#F1F5F9', text: '#64748B', label: 'Hết hạn', dot: '#94A3B8' },
  cancelled: { bg: '#F1F5F9', text: '#64748B', label: 'Đã hủy', dot: '#94A3B8' },
};

export const FINE_STATUS: Record<string, StatusConfig> = {
  pending: { bg: '#FEF2F2', text: '#DC2626', label: 'Chưa nộp' },
  unpaid: { bg: '#FEF2F2', text: '#DC2626', label: 'Chưa nộp' },
  paid: { bg: '#F0FDF4', text: '#16A34A', label: 'Đã nộp' },
  partial: { bg: '#FFFBEB', text: '#D97706', label: 'Nộp một phần' },
  partially_paid: { bg: '#FFFBEB', text: '#D97706', label: 'Nộp một phần' },
  waived: { bg: '#F1F5F9', text: '#64748B', label: 'Miễn phạt' },
};

export const BOOK_STATUS: Record<string, StatusConfig> = {
  available: { bg: '#F0FDF4', text: '#16A34A', label: 'Có sẵn' },
  limited: { bg: '#FFFBEB', text: '#D97706', label: 'Sắp hết' },
  out_of_stock: { bg: '#FEF2F2', text: '#DC2626', label: 'Hết sách' },
  unavailable: { bg: '#F1F5F9', text: '#64748B', label: 'Không khả dụng' },
};

export function getStatusConfig(
  map: Record<string, StatusConfig>,
  status: string,
  fallback = status
): StatusConfig {
  return map[status] || { bg: '#F1F5F9', text: '#64748B', label: fallback };
}
