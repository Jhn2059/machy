import api from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SELLER';
  shift: string;
  active: boolean;
}

interface LoginResponse {
  user: AuthUser;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    return data;
  },

  async getMe(token: string): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async recover(email: string): Promise<void> {
    await api.post('/auth/recover', { email });
  },
};
