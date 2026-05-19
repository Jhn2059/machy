import { useState, useEffect } from 'react';
import { supplierService, type Supplier } from '../../../models/product.service';
import { useAuth } from '../../../context/AuthContext';

export default function SupplierListPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', ruc: '', contact: '', phone: '' });
  const { isAdmin } = useAuth();

  const fetchAll = async () => {
    setLoading(true);
    try { setSuppliers(await supplierService.getAll()); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    await supplierService.create({ name: form.name, ruc: form.ruc || undefined, contact: form.contact || undefined, phone: form.phone || undefined });
    setForm({ name: '', ruc: '', contact: '', phone: '' });
    setShowForm(false);
    fetchAll();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500 text-sm">Catálogo de proveedores</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            + Nuevo proveedor
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4 max-w-lg">
          <h3 className="text-sm font-semibold mb-3">Nuevo proveedor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" />
            <input placeholder="RUC" value={form.ruc} onChange={(e) => setForm({...form, ruc: e.target.value})} className="input-field" />
            <input placeholder="Contacto" value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})} className="input-field" />
            <input placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input-field" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={!form.name.trim()} className="btn-primary">Crear</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-8 text-gray-400">Cargando...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">RUC</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Contacto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Teléfono</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono hidden sm:table-cell">{s.ruc || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{s.contact || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{s.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {suppliers.length === 0 && <p className="text-center py-8 text-gray-400">No hay proveedores registrados.</p>}
        </div>
      )}
    </div>
  );
}
