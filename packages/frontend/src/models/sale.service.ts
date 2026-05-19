import api from './api';

export interface SaleDetail {
  id: string;
  productId: string;
  product?: { id: string; name: string; barcode: string };
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  userId: string;
  user?: { id: string; name: string };
  subtotal: number;
  igv: number;
  discount: number;
  total: number;
  status: string;
  voidReason?: string;
  correlative: number;
  createdAt: string;
  details?: SaleDetail[];
}

export const saleService = {
  async create(sale: { items: { productId: string; quantity: number }[]; discount?: number }): Promise<Sale> {
    const { data } = await api.post<Sale>('/sales', sale);
    return data;
  },

  async getAll(params?: Record<string, string>): Promise<Sale[]> {
    const { data } = await api.get<Sale[]>('/sales', { params });
    return data;
  },

  async getById(id: string): Promise<Sale> {
    const { data } = await api.get<Sale>(`/sales/${id}`);
    return data;
  },

  async void(id: string, reason: string): Promise<Sale> {
    const { data } = await api.put<Sale>(`/sales/${id}/void`, { reason });
    return data;
  },

  async getBoleta(id: string): Promise<Blob> {
    const { data } = await api.get(`/sales/${id}/boleta`, { responseType: 'blob' });
    return data;
  },
};
