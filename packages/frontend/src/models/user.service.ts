import api from './api';

export interface User {
  id: string;
  name: string;
  dni?: string;
  email: string;
  role: string;
  shift: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export const userService = {
  async getAll(params?: { role?: string; active?: boolean }): Promise<User[]> {
    const { data } = await api.get<User[]>('/users', { params });
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(user: Partial<User> & { password: string }): Promise<User> {
    const { data } = await api.post<User>('/users', user);
    return data;
  },

  async update(id: string, user: Partial<User>): Promise<User> {
    const { data } = await api.put<User>(`/users/${id}`, user);
    return data;
  },

  async toggleActive(id: string): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}/toggle`);
    return data;
  },
};
