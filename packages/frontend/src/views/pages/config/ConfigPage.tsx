import { useState, useEffect } from 'react';
import { useConfig } from '../../../controllers/useConfig';

const CONFIG_FIELDS = [
  { key: 'business_name', label: 'Nombre del negocio', type: 'text' },
  { key: 'business_ruc', label: 'RUC', type: 'text' },
  { key: 'business_address', label: 'Dirección', type: 'text' },
  { key: 'business_phone', label: 'Teléfono', type: 'text' },
  { key: 'min_boleta_amount', label: 'Monto mínimo para boleta (S/)', type: 'number' },
  { key: 'default_min_stock', label: 'Stock mínimo por defecto', type: 'number' },
];

export default function ConfigPage() {
  const { configs, loading, saving, saveConfigs } = useConfig();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    CONFIG_FIELDS.forEach((f) => {
      initial[f.key] = configs.find((c) => c.key === f.key)?.value || '';
    });
    setForm(initial);
  }, [configs]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = Object.entries(form).map(([key, value]) => ({ key, value }));
    saveConfigs(updates);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Configuración</h1>
        <p className="text-gray-500 text-sm mb-6">Parámetros generales del sistema</p>
        <div className="card text-center py-8 text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Configuración</h1>
      <p className="text-gray-500 text-sm mb-6">Parámetros generales del sistema</p>

      <div className="card max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {CONFIG_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="input-field"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
            <input value="America/Lima" disabled className="input-field bg-gray-50 text-gray-500" />
            <p className="text-xs text-gray-400 mt-1">Fijo: UTC-5 (hora oficial de Perú)</p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </form>
      </div>
    </div>
  );
}
