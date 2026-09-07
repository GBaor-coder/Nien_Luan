import api from './api';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  _count?: { users: number };
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

export const rolesService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ success: boolean; data: { roles: Role[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/roles', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Role }>(`/roles/${id}`),

  create: (data: Partial<Role>) =>
    api.post<{ success: boolean; data: Role; message: string }>('/roles', data),

  update: (id: string, data: Partial<Role>) =>
    api.put<{ success: boolean; data: Role; message: string }>(`/roles/${id}`, data),

  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/roles/${id}`),
};
