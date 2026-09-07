import api from './api';

export type ReaderType = 'student' | 'teacher';

export interface Reader {
  id: string;
  userId: string;
  readerType: ReaderType;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: string;
  code?: string;
  borrowed?: number;
  createdAt?: string;
  profile?: {
    studentId?: string;
    teacherId?: string;
    code?: string;
    className?: string;
    grade?: number;
    enrollYear?: number;
    department?: string;
    position?: string;
    degree?: string;
    status?: string;
  };
}

export interface ReaderInput {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  status?: string;
  readerType?: ReaderType;
  code?: string;
  studentId?: string;
  className?: string;
  grade?: number;
  enrollYear?: number;
  teacherId?: string;
  department?: string;
  position?: string;
  degree?: string;
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

export const readersService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; readerType?: string }) =>
    api.get<{ success: boolean; data: { readers: Reader[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/readers', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Reader }>(`/readers/${id}`),

  create: (data: ReaderInput) =>
    api.post<{ success: boolean; data: Reader; message: string }>('/readers', data),

  update: (id: string, data: Partial<ReaderInput>) =>
    api.put<{ success: boolean; data: Reader; message: string }>(`/readers/${id}`, data),

  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/readers/${id}`),
};
