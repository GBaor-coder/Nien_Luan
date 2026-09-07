import api from './api';

export const uploadService = {
  uploadBookCover: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ success: boolean; data: { url: string }; message: string }>('/upload/book-cover', formData);
  },

  uploadAuthorAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ success: boolean; data: { url: string }; message: string }>('/upload/author-avatar', formData);
  },
};
