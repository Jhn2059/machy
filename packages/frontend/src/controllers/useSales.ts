import { useState, useEffect, useCallback } from 'react';
import { saleService, type Sale } from '../models/sale.service';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async (filters?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const result: any = await saleService.getAll(filters);
      setSales(result.sales || result);
      setTotal(result.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  const voidSale = async (id: string, reason: string) => {
    const updated = await saleService.void(id, reason);
    setSales((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { sales, total, loading, error, fetchSales, voidSale };
}
