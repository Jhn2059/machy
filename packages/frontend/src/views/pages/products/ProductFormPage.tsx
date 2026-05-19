import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProducts } from '../../../controllers/useProducts';
import { productService } from '../../../models/product.service';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { categories, suppliers, createProduct, updateProduct } = useProducts();

  const [form, setForm] = useState({
    barcode: '', name: '', description: '', categoryId: '', unit: 'UNIDAD',
    costPrice: '', salePrice: '', stock: '0', minStock: '5', supplierId: '', image: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      productService.getById(id).then((prod) => {
        setForm({
          barcode: prod.barcode, name: prod.name, description: prod.description || '',
          categoryId: prod.categoryId, unit: prod.unit, costPrice: String(prod.costPrice),
          salePrice: String(prod.salePrice), stock: String(prod.stock), minStock: String(prod.minStock),
          supplierId: prod.supplierId || '', image: prod.image || '',
        });
      }).catch(() => navigate('/products'));
    } else {
      const q = new URLSearchParams(window.location.search).get('barcode');
      if (q) setForm((f) => ({ ...f, barcode: q }));
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        barcode: form.barcode,
        name: form.name,
        description: form.description || undefined,
        categoryId: form.categoryId,
        unit: form.unit,
        costPrice: Number(form.costPrice),
        salePrice: Number(form.salePrice),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        supplierId: form.supplierId || undefined,
        image: form.image || undefined,
      };
      if (isEdit) {
        await updateProduct(id!, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/products" className="btn-secondary p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
          <p className="text-gray-500 text-sm">{isEdit ? 'Modificar datos del producto' : 'Registrar producto en el inventario'}</p>
        </div>
      </div>

      <div className="card max-w-xl">
        {error && <div className="bg-danger-50 text-danger-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de barras</label>
            <input name="barcode" value={form.barcode} onChange={handleChange} className="input-field font-mono" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field" rows={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} className="input-field" required>
                <option value="">Seleccionar...</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <input name="unit" value={form.unit} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio compra</label>
              <input name="costPrice" type="number" step="0.01" min="0" value={form.costPrice} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio venta (S/)</label>
              <input name="salePrice" type="number" step="0.01" min="0.01" value={form.salePrice} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock inicial</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
              <input name="minStock" type="number" min="0" value={form.minStock} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <select name="supplierId" value={form.supplierId} onChange={handleChange} className="input-field">
              <option value="">Sin proveedor</option>
              {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear producto'}
            </button>
            <Link to="/products" className="btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
