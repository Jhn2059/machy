import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanner } from '../../controllers/useScanner';
import { type Product } from '../../models/product.service';

interface BarcodeScannerProps {
  onProductFound?: (product: Product) => void;
  mode?: 'sales' | 'inventory';
  autoStart?: boolean;
}

export default function BarcodeScanner({
  onProductFound,
  mode = 'sales',
  autoStart = true,
}: BarcodeScannerProps) {
  const navigate = useNavigate();
  const {
    isScanning,
    startScanner,
    stopScanner,
    lastResult,
    error,
    notFoundBarcode,
    clearResult,
  } = useScanner(onProductFound);

  useEffect(() => {
    if (autoStart) {
      startScanner(mode);
    }
    return () => {
      stopScanner();
    };
  }, []);

  const handleProductFound = (product: Product) => {
    if (onProductFound) {
      onProductFound(product);
    }
  };

  const handleGoToRegister = () => {
    stopScanner();
    navigate(`/products/new?barcode=${notFoundBarcode}`);
  };

  if (error) {
    return (
      <div className="card text-center py-8 space-y-4">
        <span className="text-4xl">📷</span>
        <div>
          <p className="text-danger-600 font-medium">Error de cámara</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <p className="text-sm text-gray-400 mt-2">
            Asegúrate de usar HTTPS y permitir el acceso a la cámara.
          </p>
        </div>
        <button onClick={() => startScanner(mode)} className="btn-primary">
          Reintentar
        </button>
        <button onClick={() => stopScanner()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    );
  }

  if (lastResult) {
    const product = lastResult;
    return (
      <div className="card text-center py-8 space-y-4">
        <span className="text-4xl">✅</span>
        <div>
          <p className="text-lg font-semibold text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-500">{product.barcode}</p>
          <p className="text-2xl font-bold text-machy-700 mt-2">
            S/ {Number(product.salePrice).toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Stock: {product.stock} unidades</p>
        </div>
        <div className="flex gap-3 justify-center">
          {mode === 'sales' && onProductFound && (
            <button
              onClick={() => handleProductFound(product)}
              className="btn-primary"
            >
              Agregar al carrito
            </button>
          )}
          <button onClick={clearResult} className="btn-secondary">
            Escanear otro
          </button>
        </div>
      </div>
    );
  }

  if (notFoundBarcode) {
    return (
      <div className="card text-center py-8 space-y-4">
        <span className="text-4xl">❓</span>
        <div>
          <p className="text-lg font-semibold text-warning-500">
            Producto no registrado
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Código: <strong>{notFoundBarcode}</strong>
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={handleGoToRegister} className="btn-primary">
            Registrar producto
          </button>
          <button onClick={clearResult} className="btn-secondary">
            Escanear otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Escaneando...</h3>
        <button onClick={stopScanner} className="btn-secondary text-sm py-1 min-h-[36px] px-3">
          Detener
        </button>
      </div>

      {isScanning && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div id="machy-scanner" className="w-full aspect-square max-w-sm mx-auto" />
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <p className="text-white text-sm bg-black/50 inline-block px-3 py-1 rounded-full">
              Apunta al código de barras
            </p>
          </div>
        </div>
      )}

      {!isScanning && (
        <div className="text-center py-8">
          <button onClick={() => startScanner(mode)} className="btn-primary">
            📷 Activar cámara
          </button>
        </div>
      )}
    </div>
  );
}
