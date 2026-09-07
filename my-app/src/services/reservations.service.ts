import api from './api';

export interface Reservation {
  id: string;
  requestDate: string;
  estimatedAvailability?: string;
  expiryDate?: string;
  queuePosition: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  book: { id: string; title: string; isbn?: string; coverColor?: string; coverImage?: string; author?: { id: string; name: string } | null };
  student?: { id: string; studentId: string; user?: { id?: string; name: string; email?: string } };
  teacher?: { id: string; teacherId: string; user?: { id?: string; name: string; email?: string } };
  readerId: string;
  readerType: string;
  studentId?: string;
  teacherId?: string;
  bookId: string;
  borrowRecord?: { id: string; borrowDate: string; dueDate: string; status: string };
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

export const reservationsService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; readerId?: string }) =>
    api.get<{ success: boolean; data: { reservations: Reservation[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/reservations', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Reservation }>(`/reservations/${id}`),

  create: (data: { bookId: string; readerId: string; readerType?: string; studentId?: string; teacherId?: string; notes?: string }) =>
    api.post<{ success: boolean; data: Reservation; message: string }>('/reservations', data),

  updateStatus: (id: string, status: string) =>
    api.put<{ success: boolean; data: Reservation; message: string }>(`/reservations/${id}/status`, { status }),

  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/reservations/${id}`),
};
