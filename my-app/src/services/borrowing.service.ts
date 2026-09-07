import api from './api';

export interface BorrowRecord {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  renewalCount?: number;
  maxRenewals?: number;
  notes?: string;
  reader?: { id: string; name: string; email: string };
  student?: { id: string; studentId: string; user: { id?: string; name: string; email?: string } };
  teacher?: { id: string; teacherId: string; user: { id?: string; name: string; email?: string } };
  book?: { id: string; title: string; author?: { id: string; name: string } | null; category?: { id: string; name: string } | null };
  readerId: string;
  readerType: string;
  bookId: string;
  bookCopyId?: string;
  reservation?: { id: string; requestDate?: string } | null;
}

export interface BorrowingStats {
  total: number;
  active: number;
  returned: number;
  overdue: number;
}

export interface BorrowingStatsDetailed extends BorrowingStats {
  overdueByReaderType: Array<{ readerType: string; _count: { id: number } }>;
  overdueByCategory: Record<string, number>;
  avgOverdueDays: number;
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

export const borrowingService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<{ success: boolean; data: { records: BorrowRecord[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/borrowing', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: BorrowRecord }>(`/borrowing/${id}`),

  create: (data: { readerId: string; bookId: string; dueDate?: string; notes?: string; borrowDate?: string; readerType?: string }) =>
    api.post<{ success: boolean; data: BorrowRecord; message: string }>('/borrowing', data),

  returnBook: (id: string, notes?: string) =>
    api.put<{ success: boolean; data: BorrowRecord; message: string }>(`/borrowing/${id}/return`, { notes }),

  renewBook: (id: string, data?: { dueDate?: string; notes?: string }) =>
    api.put<{ success: boolean; data: BorrowRecord; message: string }>(`/borrowing/${id}/renew`, data),

  getStats: () =>
    api.get<{ success: boolean; data: BorrowingStatsDetailed }>('/borrowing/stats'),

  getOverdueDetails: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ success: boolean; data: { records: BorrowRecord[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/borrowing/overdue', { params }),

  processOverdue: () =>
    api.post<{ success: boolean; data: { markedOverdue: number; created: unknown[]; updated: unknown[] }; message: string }>('/borrowing/process-overdue'),
};
