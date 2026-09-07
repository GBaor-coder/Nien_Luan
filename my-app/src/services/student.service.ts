import api from './api';

export interface BorrowRecord {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  renewalCount: number;
  maxRenewals: number;
  notes?: string;
  readerId: string;
  readerType: string;
  studentId?: string;
  teacherId?: string;
  bookCopyId: string;
  bookId: string;
  book?: {
    id: string;
    title: string;
    coverColor?: string;
    coverImage?: string;
    category?: { id: string; name: string; color: string };
    author?: { id: string; name: string };
  };
  bookCopy?: {
    id: string;
    barcode: string;
    condition: string;
    shelfLocation?: string;
  };
}

export interface Reservation {
  id: string;
  requestDate: string;
  estimatedAvailability?: string;
  expiryDate: string;
  queuePosition: number;
  status: string;
  notes?: string;
  readerId: string;
  readerType: string;
  studentId?: string;
  teacherId?: string;
  bookId: string;
  book?: {
    id: string;
    title: string;
    coverColor?: string;
    coverImage?: string;
    author?: { id: string; name: string };
    category?: { id: string; name: string };
  };
}

export interface Fine {
  id: string;
  amount: number;
  reason: string;
  status: string;
  paidAmount: number;
  paidDate?: string;
  paidMethod?: string;
  notes?: string;
  studentId?: string;
  teacherId?: string;
  borrowRecordId?: string;
  borrowRecord?: {
    id: string;
    book?: { id: string; title: string };
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category?: string;
  read: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BorrowingStats {
  total: number;
  active: number;
  returned: number;
  overdue: number;
}

export const studentService = {
  // Borrowings
  getMyBorrowings: (readerId: string, params?: { page?: number; limit?: number; search?: string; status?: string; studentId?: string; teacherId?: string }) =>
    api.get<{ success: boolean; data: { records: BorrowRecord[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/borrowing', { params: { ...params, readerId, studentId: params?.studentId, teacherId: params?.teacherId } }),

  getBorrowingStats: () =>
    api.get<{ success: boolean; data: BorrowingStats }>('/borrowing/stats'),

  renewBook: (id: string) =>
    api.put<{ success: boolean; data: BorrowRecord; message: string }>(`/borrowing/${id}/renew`),

  // Reservations
  getMyReservations: (readerId: string, params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<{ success: boolean; data: { reservations: Reservation[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/reservations', { params: { ...params, readerId } }),

  createReservation: (data: { readerId: string; bookId: string; readerType?: string; studentId?: string; teacherId?: string; estimatedAvailability?: string }) =>
    api.post<{ success: boolean; data: Reservation; message: string }>('/reservations', data),

  cancelReservation: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/reservations/${id}`),

  getOverdueBorrowings: (readerId: string, params?: { page?: number; limit?: number; search?: string; studentId?: string; teacherId?: string }) =>
    api.get<{ success: boolean; data: { records: BorrowRecord[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/borrowing', { params: { ...params, readerId, studentId: params?.studentId, teacherId: params?.teacherId, status: 'overdue' } }),

  // Fines
  getMyFines: (readerId: string, params?: { page?: number; limit?: number; status?: string; studentId?: string; teacherId?: string }) =>
    api.get<{ success: boolean; data: { fines: Fine[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/fines', { params: { ...params, readerId, studentId: params?.studentId, teacherId: params?.teacherId } }),

  // Notifications
  getMyNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get<{ success: boolean; data: { notifications: Notification[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/notifications', { params }),

  getUnreadCount: () =>
    api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    api.put<{ success: boolean; message: string }>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.put<{ success: boolean; message: string }>('/notifications/mark-all-read'),

  // Books (for recommendations)
  getBooks: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ success: boolean; data: { books: { id: string; title: string; coverColor: string; avgRating: number; category?: { name: string }; author?: { name: string } }[]; pagination: { total: number } } }>('/books', { params }),
};
