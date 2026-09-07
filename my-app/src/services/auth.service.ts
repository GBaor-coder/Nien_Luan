import api from './api';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  className: string;
  grade: number;
  enrollYear: number;
  status: string;
  membershipCard?: {
    id: string;
    cardNumber: string;
    maxBorrow: number;
    borrowDays: number;
    expiryDate: string;
    status: string;
  };
}

export interface TeacherProfile {
  id: string;
  teacherId: string;
  department: string;
  position?: string;
  degree?: string;
  status: string;
}

export interface AuthResponse {
  user: {
    id: string;
    code: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    avatar?: string;
    gender?: string;
    dateOfBirth?: string;
    status?: string;
    createdAt?: string;
    student?: StudentProfile;
    teacher?: TeacherProfile;
  };
  token: string;
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post<{ success: boolean; data: AuthResponse; message: string }>('/auth/login', data),

  register: (data: RegisterPayload) =>
    api.post<{ success: boolean; data: AuthResponse; message: string }>('/auth/register', data),

  getProfile: () =>
    api.get<{ success: boolean; data: AuthResponse['user'] }>('/auth/profile'),
};
