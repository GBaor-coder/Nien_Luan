import {
  LayoutDashboard, Search, BookOpen, CalendarClock, ReceiptText,
  Clock, Bell, User, Settings,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface NavItem {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  path: string;
}

export const studentNavItems: NavItem[] = [
  { label: 'Tổng quan', icon: LayoutDashboard, path: '/user' },
  { label: 'Tìm & mượn sách', icon: Search, path: '/user/catalog' },
  { label: 'Phiếu mượn của tôi', icon: BookOpen, path: '/user/borrowings' },
  { label: 'Đặt chỗ', icon: CalendarClock, path: '/user/reservations' },
  { label: 'Quá hạn & Phí', icon: ReceiptText, path: '/user/fines' },
  { label: 'Lịch sử Đọc', icon: Clock, path: '/user/history' },
  { label: 'Thông báo', icon: Bell, path: '/user/notifications' },
  { label: 'Hồ sơ', icon: User, path: '/user/profile' },
  { label: 'Cài đặt', icon: Settings, path: '/user/settings' },
];

export const teacherNavItems: NavItem[] = [
  { label: 'Tổng quan', icon: LayoutDashboard, path: '/user' },
  { label: 'Tìm & mượn sách', icon: Search, path: '/user/catalog' },
  { label: 'Phiếu mượn của tôi', icon: BookOpen, path: '/user/borrowings' },
  { label: 'Đặt chỗ', icon: CalendarClock, path: '/user/reservations' },
  { label: 'Quá hạn & Phí', icon: ReceiptText, path: '/user/fines' },
  { label: 'Lịch sử Đọc', icon: Clock, path: '/user/history' },
  { label: 'Thông báo', icon: Bell, path: '/user/notifications' },
  { label: 'Hồ sơ', icon: User, path: '/user/profile' },
  { label: 'Cài đặt', icon: Settings, path: '/user/settings' },
];
