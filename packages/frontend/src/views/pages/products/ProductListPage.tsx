import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../../controllers/useProducts';
import { useAuth } from '../../../context/AuthContext';

export default function ProductListPage() {
  const { products, total, loading, categories, fetchProducts, discontinueProduct } = useProducts();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (search) filters.name = search;
    if (catFilter) filters.categoryId = catFilter;
    fetchProducts(filters);
  }, [search, catFilter, fetchProducts]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm">{total} productos en catálogo</p>
        </div>
        {isAdmin && (
          <Link to="/products/new" className="btn-primary">
            + Nuevo producto
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input-field max-w-[200px]">
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="card text-center py-8 text-gray-400">Cargando...</div>
      ) : products.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">
          {search ? 'Sin resultados.' : 'Catálogo vacío. Registra tu primer producto.'}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Código</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Categoría</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Precio</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Estado</th>
                  {isAdmin && <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50 ${p.status === 'DISCONTINUED' ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-xs font-mono">{p.barcode}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium">S/ {Number(p.salePrice).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.stock <= p.minStock ? 'text-danger-600 font-bold' : ''}>
                        {p.stock}
                        {p.stock <= p.minStock && ` ⚠️`}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`badge ${p.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>
                        {p.status === 'ACTIVE' ? 'Activo' : 'Descontinuado'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link to={`/products/${p.id}/edit`} className="text-xs btn-secondary py-1 px-2 min-h-[32px]">
                            Editar
                          </Link>
                          {p.status === 'ACTIVE' && (
                            <button
                              onClick={() => discontinueProduct(p.id)}
                              className="text-xs text-danger-600 hover:bg-danger-50 border border-danger-200 rounded-lg py-1 px-2 min-h-[32px]"
                            >
                              Descontinuar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
