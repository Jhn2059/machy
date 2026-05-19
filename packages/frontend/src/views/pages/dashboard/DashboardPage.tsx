import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { productService } from '../../../models/product.service';
import { saleService } from '../../../models/sale.service';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, salesToday: 0, revenueToday: 0, lowStock: 0, loading: true });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      productService.getAll().then((r: any) => r.total || r.length || 0),
      productService.getLowStock().then((r) => r.length),
      saleService.getAll({ startDate: today, endDate: today }).then((r: any) => {
        const list = r.sales || r;
        const confirmed = list.filter((s: any) => s.status === 'CONFIRMED');
        const revenue = confirmed.reduce((sum: number, s: any) => sum + Number(s.total), 0);
        return { count: confirmed.length, revenue };
      }),
    ]).then(([products, lowStock, salesData]) => {
      setStats({ products, lowStock, salesToday: salesData.count, revenueToday: salesData.revenue, loading: false });
    }).catch(() => setStats((s) => ({ ...s, loading: false })));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Bienvenido{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="text-gray-500 mb-6">
        {user?.role === 'ADMIN' ? 'Panel de administración' : 'Panel de ventas'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link to="/products" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <p className="text-sm text-gray-500">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.loading ? '—' : stats.products}</p>
            </div>
          </div>
        </Link>

        <Link to="/sales/history" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <p className="text-sm text-gray-500">Ventas hoy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.loading ? '—' : stats.salesToday}</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm text-gray-500">Ingresos hoy</p>
              <p className="text-2xl font-bold text-green-700">
                {stats.loading ? '—' : `S/ ${stats.revenueToday.toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>

        <Link to="/inventory" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm text-gray-500">Stock bajo</p>
              <p className={`text-2xl font-bold ${stats.lowStock > 0 ? 'text-danger-600' : 'text-gray-900'}`}>
                {stats.loading ? '—' : stats.lowStock}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/sales" className="card bg-machy-600 text-white hover:bg-machy-700 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛒</span>
            <div>
              <p className="text-lg font-bold">Ir a Punto de Venta</p>
              <p className="text-sm text-white/80">Registrar nueva venta</p>
            </div>
          </div>
        </Link>

        <Link to="/inventory" className="card bg-green-700 text-white hover:bg-green-800 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📈</span>
            <div>
              <p className="text-lg font-bold">Ver Inventario</p>
              <p className="text-sm text-white/80">Consultar stock actual</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
