import { useState } from 'react';
import { useSales } from '../../../controllers/useSales';
import { useAuth } from '../../../context/AuthContext';

export default function SalesHistoryPage() {
  const { sales, total, loading, fetchSales, voidSale } = useSales();
  const { isAdmin } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [voiding, setVoiding] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const handleFilter = () => {
    fetchSales({ startDate, endDate });
  };

  const handleVoid = async (id: string) => {
    if (!voidReason.trim()) return;
    await voidSale(id, voidReason);
    setVoiding(null);
    setVoidReason('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Historial de Ventas</h1>
      <p className="text-gray-500 text-sm mb-6">{total} transacciones</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field max-w-[180px]" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field max-w-[180px]" />
        <button onClick={handleFilter} className="btn-primary">Filtrar</button>
      </div>

      {voiding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Anular venta</h3>
            <p className="text-sm text-gray-500">Ingresa el motivo de la anulación:</p>
            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Motivo de la anulación..."
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setVoiding(null); setVoidReason(''); }} className="btn-secondary">Cancelar</button>
              <button onClick={() => handleVoid(voiding)} disabled={voidReason.length < 5} className="btn-danger">Anular venta</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-8 text-gray-400">Cargando...</div>
      ) : sales.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">No hay ventas registradas.</div>
      ) : (
        <div className="space-y-4">
          {sales.map((s) => (
            <div key={s.id} className={`card ${s.status === 'VOIDED' ? 'opacity-60' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <span className="font-mono text-sm font-bold">#{String(s.correlative).padStart(6, '0')}</span>
                  <span className={`ml-2 badge ${s.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`}>
                    {s.status === 'CONFIRMED' ? 'Confirmada' : s.status === 'VOIDED' ? 'Anulada' : 'Pendiente'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(s.createdAt).toLocaleString('es-PE')} — {s.user?.name || '—'}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                {s.details?.map((d: any) => (
                  <div key={d.id} className="flex justify-between text-sm">
                    <span>{d.product?.name || d.productId} ×{d.quantity}</span>
                    <span className="text-gray-500">S/ {Number(d.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-gray-400">
                  Sub: S/ {Number(s.subtotal).toFixed(2)} | IGV: S/ {Number(s.igv).toFixed(2)}
                  {Number(s.discount) > 0 && ` | Desc: S/ ${Number(s.discount).toFixed(2)}`}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">S/ {Number(s.total).toFixed(2)}</span>
                  {isAdmin && s.status === 'CONFIRMED' && (
                    <button onClick={() => setVoiding(s.id)} className="text-xs btn-danger py-1 px-2 min-h-[32px]">
                      Anular
                    </button>
                  )}
                </div>
              </div>

              {s.voidReason && (
                <p className="text-xs text-danger-600 mt-2">Motivo: {s.voidReason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
