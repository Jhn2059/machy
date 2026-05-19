import api from './api';

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
}

export const configService = {
  async getAll(): Promise<SystemConfig[]> {
    const { data } = await api.get<SystemConfig[]>('/config');
    return data;
  },

  async update(configs: { key: string; value: string }[]): Promise<SystemConfig[]> {
    const { data } = await api.put<SystemConfig[]>('/config', { configs });
    return data;
  },
};
