import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUsers } from '../../../controllers/useUsers';
import { userService, type User } from '../../../models/user.service';

const SHIFTS = [
  { value: 'NONE', label: 'Sin turno' },
  { value: 'MORNING', label: 'Mañana (08:00–13:30)' },
  { value: 'AFTERNOON', label: 'Tarde (14:00–19:00)' },
  { value: 'FULL', label: 'Completo (08:00–19:00)' },
];

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { createUser, updateUser } = useUsers();

  const [form, setForm] = useState({ name: '', dni: '', email: '', role: 'SELLER', shift: 'NONE', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      userService.getById(id).then((user) => {
        setForm({ name: user.name, dni: user.dni || '', email: user.email, role: user.role, shift: user.shift, phone: user.phone || '', password: '' });
      }).catch(() => navigate('/users'));
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        const { password, ...rest } = form;
        await updateUser(id!, rest);
      } else {
        await createUser({ name: form.name, dni: form.dni || undefined, email: form.email, role: form.role, shift: form.shift, phone: form.phone || undefined, password: form.password });
      }
      navigate('/users');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/users" className="btn-secondary p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h1>
          <p className="text-gray-500 text-sm">{isEdit ? 'Modificar datos del usuario' : 'Registrar un nuevo usuario en el sistema'}</p>
        </div>
      </div>

      <div className="card max-w-lg">
        {error && <div className="bg-danger-50 text-danger-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" required minLength={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
              <input name="dni" value={form.dni} onChange={handleChange} className="input-field" placeholder="Opcional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="Opcional" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required />
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña temporal</label>
              <input name="password" type="text" value={form.password} onChange={handleChange} className="input-field" placeholder="Se generará automáticamente si se deja vacío" />
              <p className="text-xs text-gray-400 mt-1">Se enviará al correo del usuario.</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select name="role" value={form.role} onChange={handleChange} className="input-field">
                <option value="SELLER">Vendedor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turno laboral</label>
              <select name="shift" value={form.shift} onChange={handleChange} className="input-field">
                {SHIFTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear usuario'}
            </button>
            <Link to="/users" className="btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
