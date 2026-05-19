import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../controllers/useCart';
import { productService } from '../../../models/product.service';
import BarcodeScanner from '../../components/BarcodeScanner';
import type { Product } from '../../../models/product.service';

export default function PosPage() {
  const {
    items, discount, subtotal, igv, total, submitting,
    addItem, updateQuantity, removeItem, clearCart, setDiscount, submitSale,
  } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [saleDone, setSaleDone] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const result: any = await productService.getAll({ name: searchTerm, status: 'ACTIVE' });
      setSearchResults(result.products || []);
    } catch {}
  };

  const handleBarcodeResult = async (product: Product) => {
    addItem(product);
    setShowScanner(false);
  };

  const handleConfirm = async () => {
    setError('');
    const sale = await submitSale();
    if (sale) {
      setSaleDone(sale.correlative);
    } else {
      setError('Error al procesar la venta');
    }
  };

  if (saleDone) {
    return (
      <div className="card text-center py-12 space-y-4 max-w-md mx-auto">
        <span className="text-5xl">✅</span>
        <h2 className="text-2xl font-bold text-gray-900">Venta registrada</h2>
        <p className="text-gray-500">Comprobante N° {String(saleDone).padStart(6, '0')}</p>
        <div className="flex gap-3 justify-center pt-4">
          <button onClick={() => setSaleDone(null)} className="btn-primary">Nueva venta</button>
          <Link to="/sales" className="btn-secondary">Ir a ventas</Link>
        </div>
      </div>
    );
  }

  if (showScanner) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <button onClick={() => setShowScanner(false)} className="btn-secondary mb-4">
          ← Volver a venta
        </button>
        <BarcodeScanner mode="sales" onProductFound={handleBarcodeResult} autoStart />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
          <p className="text-gray-500 text-sm">Registro de ventas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="btn-primary text-lg"
          >
            📷 Escanear
          </button>
        </div>
      </div>

      {error && <div className="bg-danger-50 text-danger-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                placeholder="Buscar producto por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field flex-1"
              />
              <button onClick={handleSearch} className="btn-primary">Buscar</button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { addItem(p); setSearchResults([]); setSearchTerm(''); }}
                    className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border"
                  >
                    <div>
                      <span className="font-medium text-sm">{p.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{p.barcode}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm">S/ {Number(p.salePrice).toFixed(2)}</span>
                      <span className="text-xs text-gray-400 ml-2">Stock: {p.stock}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Carrito ({items.length} items)</h2>
              {items.length > 0 && (
                <button onClick={clearCart} className="text-sm text-danger-600 hover:underline">
                  Vaciar carrito
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Escanea un código de barras o busca un producto para comenzar.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-500">Producto</th>
                      <th className="text-center py-2 font-medium text-gray-500 w-20">Cant</th>
                      <th className="text-right py-2 font-medium text-gray-500 w-24">Total</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.productId} className="border-b last:border-0">
                        <td className="py-2">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-gray-400">S/ {item.unitPrice.toFixed(2)} c/u</p>
                        </td>
                        <td className="py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-7 h-7 rounded border text-sm hover:bg-gray-100"
                            >−</button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-7 h-7 rounded border text-sm hover:bg-gray-100"
                            >+</button>
                          </div>
                        </td>
                        <td className="py-2 text-right font-medium">
                          S/ {(item.unitPrice * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-2 text-center">
                          <button onClick={() => removeItem(item.productId)} className="text-danger-500 hover:text-danger-700 text-lg">×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card h-fit lg:sticky lg:top-4">
          <h2 className="text-lg font-semibold mb-4">Resumen</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">IGV (18%)</span>
              <span>S/ {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Descuento</span>
              <div className="flex items-center gap-1">
                <span>S/</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-20 input-field text-right py-1 min-h-[32px]"
                />
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            disabled={items.length === 0 || submitting}
            className="btn-primary w-full mt-4 text-base"
          >
            {submitting ? 'Procesando...' : `Confirmar venta S/ ${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
