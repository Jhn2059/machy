import { useProducts } from '../../../controllers/useProducts';

export default function InventoryPage() {
  const { products, loading, lowStock } = useProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Inventario</h1>
      <p className="text-gray-500 text-sm mb-6">Stock actual en tiempo real</p>

      {lowStock.length > 0 && (
        <div className="bg-warning-50 border border-warning-500/30 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-warning-500">
            ⚠️ {lowStock.length} producto(s) bajo stock mínimo
          </p>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-8 text-gray-400">Cargando...</div>
      ) : products.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">Inventario vacío. Registra productos para ver el stock.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Código</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Mínimo</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  const isDisc = p.status === 'DISCONTINUED';
                  return (
                    <tr
                      key={p.id}
                      className={`${isLow ? 'bg-danger-50' : ''} ${isDisc ? 'opacity-40' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 hidden sm:table-cell">{p.barcode}</td>
                      <td className={`px-4 py-3 text-right font-bold ${isLow ? 'text-danger-600' : ''}`}>
                        {p.stock}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">{p.minStock}</td>
                      <td className="px-4 py-3 text-right font-medium">S/ {Number(p.salePrice).toFixed(2)}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`badge ${isDisc ? 'badge-gray' : isLow ? 'badge-red' : 'badge-green'}`}>
                          {isDisc ? 'Descontinuado' : isLow ? 'Stock bajo' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
