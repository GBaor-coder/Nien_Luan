// ─── Book Copies (no backend API yet) ───
export interface BookCopy {
  id: string; bookId: string; barcode: string; condition: 'new' | 'good' | 'worn' | 'damaged';
  shelfLocation: string; status: 'available' | 'borrowed' | 'reserved' | 'maintenance';
  acquiredDate: string; notes: string;
}

export const bookCopiesData: BookCopy[] = [
  { id: 'CP-001', bookId: 'BK-001', barcode: '978-0262033848-01', condition: 'good', shelfLocation: 'A1-01-01', status: 'available', acquiredDate: '2024-01-15', notes: '' },
  { id: 'CP-002', bookId: 'BK-001', barcode: '978-0262033848-02', condition: 'new', shelfLocation: 'A1-01-02', status: 'available', acquiredDate: '2024-06-20', notes: '' },
  { id: 'CP-003', bookId: 'BK-001', barcode: '978-0262033848-03', condition: 'worn', shelfLocation: 'A1-01-03', status: 'borrowed', acquiredDate: '2023-03-10', notes: 'Page 45 slightly torn' },
  { id: 'CP-004', bookId: 'BK-002', barcode: '978-0132350884-01', condition: 'good', shelfLocation: 'A1-02-01', status: 'borrowed', acquiredDate: '2024-02-10', notes: '' },
  { id: 'CP-005', bookId: 'BK-002', barcode: '978-0132350884-02', condition: 'damaged', shelfLocation: 'A1-02-02', status: 'maintenance', acquiredDate: '2023-05-15', notes: 'Cover damaged, needs repair' },
  { id: 'CP-006', bookId: 'BK-003', barcode: '978-0201633610-01', condition: 'new', shelfLocation: 'A1-03-01', status: 'borrowed', acquiredDate: '2024-08-01', notes: '' },
  { id: 'CP-007', bookId: 'BK-004', barcode: '978-0135957059-01', condition: 'good', shelfLocation: 'A1-04-01', status: 'available', acquiredDate: '2024-04-12', notes: '' },
  { id: 'CP-008', bookId: 'BK-005', barcode: '978-0134757599-01', condition: 'good', shelfLocation: 'A1-05-01', status: 'available', acquiredDate: '2024-03-20', notes: '' },
  { id: 'CP-009', bookId: 'BK-006', barcode: '978-0262035613-01', condition: 'new', shelfLocation: 'B2-01-01', status: 'available', acquiredDate: '2024-09-05', notes: '' },
  { id: 'CP-010', bookId: 'BK-007', barcode: '978-0062316097-01', condition: 'good', shelfLocation: 'C3-01-01', status: 'available', acquiredDate: '2024-07-18', notes: '' },
];

// ─── Book History (no backend API yet) ───
export interface BookHistory {
  id: string; bookId: string; readerName: string; action: 'borrow' | 'return' | 'renew' | 'reserve';
  date: string; notes: string;
}

export const bookHistoryData: BookHistory[] = [
  { id: 'BH-001', bookId: 'BK-001', readerName: 'Nguyen Van A', action: 'borrow', date: '2026-07-10', notes: '' },
  { id: 'BH-002', bookId: 'BK-001', readerName: 'Tran Thi B', action: 'return', date: '2026-07-05', notes: 'Returned on time' },
  { id: 'BH-003', bookId: 'BK-001', readerName: 'Le Minh C', action: 'borrow', date: '2026-06-28', notes: '' },
  { id: 'BH-004', bookId: 'BK-001', readerName: 'Le Minh C', action: 'return', date: '2026-06-25', notes: 'Returned early' },
  { id: 'BH-005', bookId: 'BK-001', readerName: 'Pham Hoang D', action: 'renew', date: '2026-06-20', notes: 'Extended by 7 days' },
  { id: 'BH-006', bookId: 'BK-002', readerName: 'Tran Thi B', action: 'borrow', date: '2026-07-08', notes: '' },
  { id: 'BH-007', bookId: 'BK-002', readerName: 'Hoang Thi E', action: 'reserve', date: '2026-07-06', notes: 'Reservation for next week' },
  { id: 'BH-008', bookId: 'BK-003', readerName: 'Gang of Four', action: 'borrow', date: '2026-07-05', notes: '' },
  { id: 'BH-009', bookId: 'BK-004', readerName: 'David Thomas', action: 'return', date: '2026-07-01', notes: '' },
  { id: 'BH-010', bookId: 'BK-005', readerName: 'Martin Fowler', action: 'borrow', date: '2026-06-28', notes: '' },
];

// ─── Quick Actions ───
export const quickActions = [
  { id: 1, label: 'Thêm Sách Mới', icon: 'BookPlus', color: '#2563EB' },
  { id: 2, label: 'Đăng ký Độc giả', icon: 'UserPlus', color: '#8B5CF6' },
  { id: 3, label: 'Tạo Phiếu Mượn', icon: 'FilePlus', color: '#22C55E' },
  { id: 4, label: 'Tạo Báo cáo', icon: 'BarChart3', color: '#F59E0B' },
  { id: 5, label: 'Quản lý Danh mục', icon: 'FolderCog', color: '#EC4899' },
];

// ─── Nav ───
export interface NavChild {
  label: string;
  icon: string;
  path: string;
}

export interface NavItem {
  label: string;
  icon: string;
  path: string;
  children?: NavChild[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const navItems: NavGroup[] = [
  { group: 'Điều hướng Chính', items: [
    { label: 'Tổng quan', icon: 'LayoutDashboard', path: '/dashboard' },
    {
      label: 'Thư viện', icon: 'Library', path: '', children: [
        { label: 'Kho sách', icon: 'BookOpen', path: '/dashboard/catalog' },
        { label: 'Tác giả', icon: 'PenTool', path: '/dashboard/authors' },
        { label: 'Nhà xuất bản', icon: 'Building2', path: '/dashboard/publishers' },
        { label: 'Quản lý danh mục', icon: 'FolderOpen', path: '/dashboard/categories' },
        { label: 'Quản lý thẻ', icon: 'Tag', path: '/dashboard/tags' },
      ],
    },
    { label: 'Độc giả', icon: 'Users', path: '/dashboard/readers' },
    {
      label: 'Phiếu mượn', icon: 'BookMarked', path: '/dashboard/borrowing',
      children: [
        { label: 'Tất cả phiếu mượn', icon: 'ClipboardList', path: '/dashboard/borrowing' },
        { label: 'Tạo phiếu mượn mới', icon: 'FilePlus2', path: '/dashboard/borrowing/create' },
        { label: 'Phiếu đang mượn', icon: 'BookOpenCheck', path: '/dashboard/borrowing/active' },
        { label: 'Phiếu đã trả', icon: 'BookCheck', path: '/dashboard/borrowing/returned' },
        { label: 'Phiếu quá hạn', icon: 'AlertTriangle', path: '/dashboard/borrowing/overdue' },
        { label: 'Gia hạn phiếu mượn', icon: 'RotateCcw', path: '/dashboard/borrowing/renew' },
        { label: 'Quản lý đặt chỗ', icon: 'CalendarClock', path: '/dashboard/reservations' },
        { label: 'Lịch sử mượn trả', icon: 'History', path: '/dashboard/borrowing/history' },
        { label: 'Thống kê mượn trả', icon: 'BarChart3', path: '/dashboard/borrowing/stats' },
      ],
    },
    { label: 'Báo cáo & Phân tích', icon: 'BarChart3', path: '/dashboard/reports' },
    { label: 'Phí phạt', icon: 'ReceiptText', path: '/dashboard/fines' },
  ]},
  { group: 'Hệ thống', items: [
    { label: 'Quản lý Người dùng', icon: 'UserCog', path: '/dashboard/users' },
    { label: 'Vai trò & Quyền hạn', icon: 'Shield', path: '/dashboard/roles' },
    { label: 'Cài đặt', icon: 'Settings', path: '/dashboard/settings' },
  ]},
];
