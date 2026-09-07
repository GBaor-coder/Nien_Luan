import type { BorrowRecord } from '../services/borrowing.service';

export function getReaderName(r?: BorrowRecord | null): string {
  if (!r) return '';
  if (r.student?.user?.name) return r.student.user.name;
  if (r.teacher?.user?.name) return r.teacher.user.name;
  if (r.reader?.name) return r.reader.name;
  return r.readerId || '-';
}

export function getReaderTypeLabel(r?: BorrowRecord | null): string {
  if (!r) return '';
  if (r.student?.user?.name) return 'Sinh viên';
  if (r.teacher?.user?.name) return 'Giảng viên';
  return 'Khác';
}

export function getOverdueDays(dueDate: string): number {
  const due = new Date(dueDate).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
}
