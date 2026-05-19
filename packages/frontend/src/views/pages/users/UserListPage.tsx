import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '../../../controllers/useUsers';
import { useAuth } from '../../../context/AuthContext';

export default function UserListPage() {
  const { users, loading, toggleUser, fetchUsers } = useUsers();
  const { isAdmin } = useAuth();

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm">Gestión de usuarios del sistema</p>
        </div>
        {isAdmin && (
          <Link to="/users/new" className="btn-primary">
            + Nuevo usuario
          </Link>
        )}
      </div>

      {loading ? (
        <div className="card text-center py-8 text-gray-400">Cargando...</div>
      ) : users.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">No hay usuarios registrados.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Turno</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                  {isAdmin && <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-red' : 'badge-green'}`}>
                        {u.role === 'ADMIN' ? 'Admin' : 'Vendedor'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {u.shift === 'FULL' ? 'Completo' : u.shift === 'MORNING' ? 'Mañana' : u.shift === 'AFTERNOON' ? 'Tarde' : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.active ? 'badge-green' : 'badge-gray'}`}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link to={`/users/${u.id}/edit`} className="text-xs btn-secondary py-1 px-2 min-h-[32px]">
                            Editar
                          </Link>
                          <button
                            onClick={() => toggleUser(u.id)}
                            className={`text-xs py-1 px-2 min-h-[32px] rounded-lg font-medium ${
                              u.active
                                ? 'text-danger-600 hover:bg-danger-50 border border-danger-200'
                                : 'text-green-600 hover:bg-green-50 border border-green-200'
                            }`}
                          >
                            {u.active ? 'Desactivar' : 'Activar'}
                          </button>
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
