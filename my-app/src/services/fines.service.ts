import api from './api';

export interface Fine {
  id: string;
  amount: number;
  reason: string;
  status: string;
  paidAmount: number;
  paidDate?: string;
  paidMethod?: string;
  notes?: string;
  processedBy?: string;
  waivedBy?: string;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; studentId: string; user?: { id?: string; name: string; email?: string } };
  teacher?: { id: string; teacherId: string; user?: { id?: string; name: string; email?: string } };
  borrowRecord?: { id: string; book?: { id: string; title: string } };
  studentId?: string;
  teacherId?: string;
  borrowRecordId?: string;
}

export interface FineStats {
  pendingCount: number;
  paidCount: number;
  waivedCount: number;
  totalOutstanding: number;
  totalPaid: number;
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

export const finesService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; studentId?: string; teacherId?: string }) =>
    api.get<{ success: boolean; data: { fines: Fine[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/fines', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Fine }>(`/fines/${id}`),

  create: (data: { readerId: string; amount: number; reason: string; borrowRecordId?: string; notes?: string }) =>
    api.post<{ success: boolean; data: Fine; message: string }>('/fines', data),

  addPayment: (id: string, data: { paidAmount: number; notes?: string }) =>
    api.put<{ success: boolean; data: Fine; message: string }>(`/fines/${id}/payment`, data),

  waive: (id: string) =>
    api.put<{ success: boolean; data: Fine; message: string }>(`/fines/${id}/waive`),

  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/fines/${id}`),

  getStats: () =>
    api.get<{ success: boolean; data: FineStats }>('/fines/stats'),
};
