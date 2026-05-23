import axios from 'axios';
import type { AssignmentInput, Assignment, QuestionPaper, User } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't redirect if we are already on login or logout pages
      if (window.location.pathname !== '/login' && window.location.pathname !== '/logout') {
        window.location.href = '/logout';
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────

interface LoginResponse {
  user: User;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  schoolName?: string;
  schoolLocation?: string;
}

export const authApi = {
  login: (email: string, password: string, role: string) =>
    api.post<{ success: boolean; data: LoginResponse }>('/api/auth/login', { email, password, role }),

  register: (data: RegisterData) =>
    api.post<{ success: boolean; data: LoginResponse }>('/api/auth/register', data),

  getMe: () => api.get<{ success: boolean; data: User }>('/api/auth/me'),

  logout: () => api.post<{ success: boolean }>('/api/auth/logout'),
};

// ── Assignments ───────────────────────────────────────────────────────────────

interface CreateAssignmentResponse {
  success: boolean;
  data: {
    assignmentId: string;
    jobId: string;
  };
}

export const assignmentsApi = {
  create: (data: AssignmentInput | FormData) => {
    const isFormData = data instanceof FormData;
    return api.post<CreateAssignmentResponse>('/api/assignments', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  list: () => api.get<{ success: boolean; data: Assignment[] }>('/api/assignments'),

  get: (id: string) => api.get<Assignment>(`/api/assignments/${id}`),

  delete: (id: string) => api.delete<{ success: boolean }>(`/api/assignments/${id}`),

  seed: () => api.post<{ success: boolean; message: string }>('/api/assignments/seed'),
};

// ── Results ───────────────────────────────────────────────────────────────────

export interface ResultResponse {
  success: boolean;
  data: {
    paper: QuestionPaper;
    assignmentId: string;
    images?: { data: string; mimeType: string }[];
  };
}

export const resultsApi = {
  get: (jobId: string) => api.get<ResultResponse>(`/api/results/${jobId}`),

  regenerate: (jobId: string, assignmentId: string) =>
    api.post<{ jobId: string }>(`/api/results/${jobId}/regenerate`, { assignmentId }),

  downloadPDF: (jobId: string) =>
    api.get(`/api/results/${jobId}/pdf`, { responseType: 'blob' }),
};
