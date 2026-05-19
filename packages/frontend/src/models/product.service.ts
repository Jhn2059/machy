import api from './api';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: { id: string; name: string };
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  status: string;
  supplierId?: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  ruc?: string;
  contact?: string;
  phone?: string;
  active: boolean;
}

export const productService = {
  async getAll(params?: Record<string, string>): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products', { params });
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async getByBarcode(barcode: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/barcode/${barcode}`);
    return data;
  },

  async create(product: Partial<Product>): Promise<Product> {
    const { data } = await api.post<Product>('/products', product);
    return data;
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const { data } = await api.put<Product>(`/products/${id}`, product);
    return data;
  },

  async discontinue(id: string): Promise<Product> {
    const { data } = await api.patch<Product>(`/products/${id}/discontinue`);
    return data;
  },

  async getLowStock(): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products/low-stock');
    return data;
  },
};

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },
  async create(category: Partial<Category>): Promise<Category> {
    const { data } = await api.post<Category>('/categories', category);
    return data;
  },
  async update(id: string, category: Partial<Category>): Promise<Category> {
    const { data } = await api.put<Category>(`/categories/${id}`, category);
    return data;
  },
};

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const { data } = await api.get<Supplier[]>('/suppliers');
    return data;
  },
  async create(supplier: Partial<Supplier>): Promise<Supplier> {
    const { data } = await api.post<Supplier>('/suppliers', supplier);
    return data;
  },
  async update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const { data } = await api.put<Supplier>(`/suppliers/${id}`, supplier);
    return data;
  },
};
