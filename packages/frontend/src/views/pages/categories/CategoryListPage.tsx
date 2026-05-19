import { useState, useEffect } from 'react';
import { categoryService, type Category } from '../../../models/product.service';
import { useAuth } from '../../../context/AuthContext';

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { isAdmin } = useAuth();

  const fetchAll = async () => {
    setLoading(true);
    try { setCategories(await categoryService.getAll()); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await categoryService.create({ name: newName });
    setNewName('');
    fetchAll();
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await categoryService.update(id, { name: editName });
    setEditId(null);
    fetchAll();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Categorías</h1>
      <p className="text-gray-500 text-sm mb-6">Organización del catálogo</p>

      {isAdmin && (
        <div className="card mb-4">
          <div className="flex gap-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nueva categoría..." className="input-field flex-1" onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
            <button onClick={handleCreate} disabled={!newName.trim()} className="btn-primary">Crear</button>
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
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Estado</th>
                  {isAdmin && <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {editId === c.id ? (
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field py-1 min-h-[32px]" onKeyDown={(e) => e.key === 'Enter' && handleUpdate(c.id)} autoFocus />
                      ) : (
                        <span className="font-medium">{c.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>{c.active ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {editId === c.id ? (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleUpdate(c.id)} className="text-xs btn-primary py-1 px-2 min-h-[32px]">Guardar</button>
                            <button onClick={() => setEditId(null)} className="text-xs btn-secondary py-1 px-2 min-h-[32px]">Cancelar</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditId(c.id); setEditName(c.name); }} className="text-xs btn-secondary py-1 px-2 min-h-[32px]">Editar</button>
                        )}
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
