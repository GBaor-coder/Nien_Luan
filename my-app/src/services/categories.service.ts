import api from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  bookCount?: number;
  _count?: { books: number };
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

export const categoriesService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ success: boolean; data: { categories: Category[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/categories', { params }),

  getAllSimple: () =>
    api.get<{ success: boolean; data: Category[] }>('/categories/simple'),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Category }>(`/categories/${id}`),

  create: (data: Partial<Category>) =>
    api.post<{ success: boolean; data: Category; message: string }>('/categories', data),

  update: (id: string, data: Partial<Category>) =>
    api.put<{ success: boolean; data: Category; message: string }>(`/categories/${id}`, data),

  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/categories/${id}`),
};
