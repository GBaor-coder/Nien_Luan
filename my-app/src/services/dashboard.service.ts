import api from './api';

export interface DashboardKPIs {
  totalBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
  activeReaders: number;
  availableBooks: number;
  totalReaders: number;
  outstandingFines: number;
  pendingReservations: number;
  returnedBooks: number;
  lostBooks: number;
}

export interface KpiTrend {
  current: number;
  previous: number;
  change: string;
  trend: 'up' | 'down';
}

export interface DashboardOverview {
  kpis: DashboardKPIs;
  kpiTrends: {
    borrowedBooks: KpiTrend;
    returnedBooks: KpiTrend;
  };
  counts: {
    categories: number;
    authors: number;
  };
  insights: {
    overdueBooks: number;
    outstandingFines: number;
    readyForPickup: number;
    totalReservations: number;
  };
}

export interface BorrowingTrend {
  month: string;
  borrowed: number;
  returned: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  reader: string;
  bookTitle: string;
  action: string;
  date: string;
  borrowDate?: string;
  dueDate?: string;
  status: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export const dashboardService = {
  getOverview: (params?: DateRangeParams) =>
    api.get<{ success: boolean; data: DashboardOverview }>('/dashboard/overview', { params }),

  getBorrowingTrends: (params?: DateRangeParams) =>
    api.get<{ success: boolean; data: BorrowingTrend[] }>('/dashboard/borrowing-trends', { params }),

  getCategoryDistribution: (params?: DateRangeParams) =>
    api.get<{ success: boolean; data: CategoryDistribution[] }>('/dashboard/category-distribution', { params }),

  getRecentActivity: (limit?: number) =>
    api.get<{ success: boolean; data: RecentActivity[] }>('/dashboard/recent-activity', { params: { limit } }),

  getStatusDistribution: () =>
    api.get<{ success: boolean; data: StatusDistribution[] }>('/dashboard/status-distribution'),
};
