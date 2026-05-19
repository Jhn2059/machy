import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../../models/auth.service';

export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.recover(email);
      setSent(true);
    } catch {
      setError('No se pudo enviar el correo de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <div className="text-center mb-6">
        <span className="text-4xl">🔑</span>
        <h1 className="text-2xl font-bold text-machy-800 mt-2">Recuperar contraseña</h1>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
            Se ha enviado un enlace de recuperación a <strong>{email}</strong>.
            Revisa tu bandeja de entrada.
          </div>
          <Link to="/login" className="btn-primary inline-flex">
            Volver al inicio de sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger-50 text-danger-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico registrado
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="usuario@machy.pe"
              required
              autoFocus
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-machy-600 hover:text-machy-700">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
