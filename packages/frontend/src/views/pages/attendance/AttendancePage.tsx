import { useState, useEffect } from 'react';
import api from '../../../models/api';

interface SessionRecord {
  id: string;
  userId: string;
  loginAt: string;
  logoutAt: string | null;
  type: string;
  user: { id: string; name: string; role: string; shift: string };
}

export default function AttendancePage() {
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance').then(({ data }) => setRecords(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Asistencia</h1>
      <p className="text-gray-500 text-sm mb-6">Registro de entradas y salidas del personal</p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
        <p className="font-medium text-blue-800">Informe semanal</p>
        <p className="text-blue-600 mt-1">El informe detallado con cumplimiento de turno estará disponible en la siguiente fase del proyecto.</p>
      </div>

      {loading ? (
        <div className="card text-center py-8 text-gray-400">Cargando...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Entrada</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Salida</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.slice(0, 50).map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.user?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      <span className={`badge ${r.user?.role === 'ADMIN' ? 'badge-red' : 'badge-green'}`}>
                        {r.user?.role === 'ADMIN' ? 'Admin' : 'Vendedor'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{new Date(r.loginAt).toLocaleString('es-PE')}</td>
                    <td className="px-4 py-3 text-xs">{r.logoutAt ? new Date(r.logoutAt).toLocaleString('es-PE') : '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`badge ${r.type === 'MANUAL' ? 'badge-gray' : 'badge-red'}`}>
                        {r.type === 'MANUAL' ? 'Manual' : 'Inactividad'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {records.length === 0 && <p className="text-center py-8 text-gray-400">No hay registros de asistencia.</p>}
        </div>
      )}
    </div>
  );
}
