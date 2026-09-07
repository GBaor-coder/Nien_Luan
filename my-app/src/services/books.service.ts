import api from './api';

export interface Book {
  id: string;
  title: string;
  isbn?: string;
  authorId?: string;
  categoryId?: string;
  publisherId?: string;
  year?: number;
  pages?: number;
  language?: string;
  price?: number;
  location?: string;
  description?: string;
  coverImage?: string;
  coverColor?: string;
  edition?: string;
  quantity: number;
  available: number;
  status: string;
  avgRating?: number;
  totalReviews?: number;
  createdAt?: string;
  author?: { id: string; name: string } | null;
  category?: { id: string; name: string; color?: string } | null;
  publisher?: { id: string; name: string } | null;
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

export interface BookQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  authorId?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const booksService = {
  getAll: (params?: BookQueryParams) =>
    api.get<{ success: boolean; data: { books: Book[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>('/books', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Book }>(`/books/${id}`),

  create: (data: Partial<Book>) =>
    api.post<{ success: boolean; data: Book; message: string }>('/books', data),

  update: (id: string, data: Partial<Book>) =>
    api.put<{ success: boolean; data: Book; message: string }>(`/books/${id}`, data),

  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/books/${id}`),
};
