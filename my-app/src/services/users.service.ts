import api from './api';

export interface User {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  lastActive?: string;
  createdAt?: string;
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

export const usersService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) =>
    api.get<{ success: boolean; data: { users: User[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/users', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: User }>(`/users/${id}`),

  create: (data: Partial<User> & { password?: string }) =>
    api.post<{ success: boolean; data: User; message: string }>('/users', data),

  update: (id: string, data: Partial<User>) =>
    api.put<{ success: boolean; data: User; message: string }>(`/users/${id}`, data),

  changePassword: (id: string, password: string) =>
    api.put<{ success: boolean; message: string }>(`/users/${id}/password`, { password }),

  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/users/${id}`),
};
