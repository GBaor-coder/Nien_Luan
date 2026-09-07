// ─── Library Notices ───
export interface LibraryNotice {
  id: string;
  title: string;
  description: string;
  type: 'new_collection' | 'maintenance' | 'policy' | 'event';
  date: string;
  isNew: boolean;
}

export const libraryNotices: LibraryNotice[] = [
  { id: 'LN-001', title: 'Bộ sưu tập AI & Học máy mới', description: '50+ đầu sách mới về trí tuệ nhân tạo, học máy và khoa học dữ liệu đã được thêm vào bộ sưu tập.', type: 'new_collection', date: '2026-07-16', isNew: true },
  { id: 'LN-002', title: 'Chương trình Đọc mùa hè', description: 'Tham gia thử thách đọc mùa hè! Hoàn thành 5 cuốn sách và nhận chứng nhận thành tích.', type: 'event', date: '2026-07-15', isNew: true },
  { id: 'LN-003', title: 'Gia hạn giờ mở cửa kỳ thi', description: 'Thư viện sẽ mở đến 11 giờ tối trong kỳ thi từ 20/7 đến 5/8.', type: 'policy', date: '2026-07-14', isNew: false },
  { id: 'LN-004', title: 'Bảo trì hệ thống theo lịch trình', description: 'Thư mục trực tuyến sẽ không khả dụng vào Thứ Bảy, 19/7 từ 2 giờ sáng đến 6 giờ sáng để nâng cấp hệ thống.', type: 'maintenance', date: '2026-07-12', isNew: false },
];
