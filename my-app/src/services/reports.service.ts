import api from './api';

export interface OverviewReport {
  totalBooks: number;
  activeReaders: number;
  activeBorrows: number;
  overdueBorrows: number;
  outstandingFines: number;
  recentBorrows: Array<{
    id: string;
    borrowDate: string;
    dueDate: string;
    returnDate: string | null;
    status: string;
    readerName?: string;
    book?: { id: string; title: string };
  }>;
}

export interface BorrowingRecord {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  student?: { user?: { name?: string } } | null;
  teacher?: { user?: { name?: string } } | null;
  book?: { id: string; title: string };
}

export interface BorrowingReport {
  records: BorrowingRecord[];
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  byMonth: Array<{ month: string; count: number; returned: number }>;
}

export interface BookReport {
  books: Array<{ id: string; title: string }>;
  total: number;
  byCategory: Array<{ categoryId: string | null; count: number; totalQuantity: number; totalAvailable: number }>;
  byStatus: Array<{ status: string; count: number }>;
  mostBorrowed: Array<{ id: string; title: string; borrowCount: number }>;
}

export interface ReaderReport {
  readers: Array<{ id: string; type: string; status: string; user?: { name?: string; email?: string } }>;
  total: number;
  activeCount: number;
  byStatus: Array<{ status: string; count: number }>;
  mostActive: Array<{ id: string; name: string; type: string; borrowCount: number }>;
}

export const reportsService = {
  getOverview: () =>
    api.get<{ success: boolean; data: OverviewReport }>('/reports/overview'),

  getBorrowing: (params?: { startDate?: string; endDate?: string; status?: string }) =>
    api.get<{ success: boolean; data: BorrowingReport }>('/reports/borrowing', { params }),

  getBooks: () =>
    api.get<{ success: boolean; data: BookReport }>('/reports/books'),

  getReaders: () =>
    api.get<{ success: boolean; data: ReaderReport }>('/reports/readers'),
};
