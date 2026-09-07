import api from './api';

export interface Publisher {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  foundedYear?: number;
  createdAt: string;
  updatedAt: string;
  bookCount?: number;
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

export const publishersService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ success: boolean; data: { publishers: Publisher[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/publishers', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Publisher }>(`/publishers/${id}`),

  create: (data: { name: string; address?: string; phone?: string; email?: string; website?: string; description?: string; foundedYear?: number }) =>
    api.post<{ success: boolean; data: Publisher; message: string }>('/publishers', data),

  update: (id: string, data: Partial<Publisher>) =>
    api.put<{ success: boolean; data: Publisher; message: string }>(`/publishers/${id}`, data),

  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/publishers/${id}`),
};
