import api from './api';

export interface Author {
  id: string;
  name: string;
  nationality?: string;
  bio?: string;
  avatar?: string;
  birthYear?: number | null;
  deathYear?: number | null;
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

export const authorsService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ success: boolean; data: { authors: Author[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/authors', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Author }>(`/authors/${id}`),

  create: (data: Partial<Author>) =>
    api.post<{ success: boolean; data: Author; message: string }>('/authors', data),

  update: (id: string, data: Partial<Author>) =>
    api.put<{ success: boolean; data: Author; message: string }>(`/authors/${id}`, data),

  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/authors/${id}`),
};
