import { useState, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { productService, type Product } from '../models/product.service';

type ScannerMode = 'sales' | 'inventory';

interface UseScannerReturn {
  isScanning: boolean;
  startScanner: (mode: ScannerMode) => Promise<void>;
  stopScanner: () => void;
  lastResult: Product | null;
  error: string | null;
  notFoundBarcode: string | null;
  clearResult: () => void;
}

export function useScanner(onProductFound?: (product: Product) => void): UseScannerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const modeRef = useRef<ScannerMode>('sales');

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null;
        })
        .catch(() => {});
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(
    async (mode: ScannerMode) => {
      setError(null);
      setLastResult(null);
      setNotFoundBarcode(null);
      modeRef.current = mode;

      try {
        const scanner = new Html5Qrcode('machy-scanner');
        scannerRef.current = scanner;
        setIsScanning(true);

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            try {
              const product = await productService.getByBarcode(decodedText);
              setLastResult(product);
              stopScanner();

              if (onProductFound) {
                onProductFound(product);
              }

              // Vibrate on success if available
              if (navigator.vibrate) {
                navigator.vibrate(200);
              }
            } catch {
              setNotFoundBarcode(decodedText);
              stopScanner();
            }
          },
          () => {},
        );
      } catch (err: any) {
        setError(err.message || 'Error al acceder a la cámara');
        setIsScanning(false);
      }
    },
    [stopScanner, onProductFound],
  );

  const clearResult = useCallback(() => {
    setLastResult(null);
    setNotFoundBarcode(null);
    setError(null);
  }, []);

  return {
    isScanning,
    startScanner,
    stopScanner,
    lastResult,
    error,
    notFoundBarcode,
    clearResult,
  };
}
