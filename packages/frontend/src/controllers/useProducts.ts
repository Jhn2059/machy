import { useState, useEffect, useCallback } from 'react';
import { productService, categoryService, supplierService, type Product, type Category, type Supplier } from '../models/product.service';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);

  const fetchProducts = useCallback(async (filters?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const result: any = await productService.getAll({ ...filters, page: String(page), limit: '20' });
      setProducts(result.products || result);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {}
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch {}
  }, []);

  const fetchLowStock = useCallback(async () => {
    try {
      const data = await productService.getLowStock();
      setLowStock(data);
    } catch {}
  }, []);

  const createProduct = async (data: Partial<Product>) => {
    return productService.create(data);
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    return productService.update(id, data);
  };

  const discontinueProduct = async (id: string) => {
    const updated = await productService.discontinue(id);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
    fetchLowStock();
  }, [fetchProducts, fetchCategories, fetchSuppliers, fetchLowStock]);

  return {
    products, total, page, totalPages, setPage, loading, error,
    categories, suppliers, lowStock,
    fetchProducts, createProduct, updateProduct, discontinueProduct,
    fetchCategories,
  };
}
