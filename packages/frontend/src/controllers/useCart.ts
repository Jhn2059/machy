import { useState, useCallback } from 'react';
import { saleService, type Sale } from '../models/sale.service';

interface CartItem {
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  maxStock: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv - discount;

  const addItem = (product: { id: string; name: string; barcode: string; salePrice: number; stock: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          barcode: product.barcode,
          quantity: 1,
          unitPrice: Number(product.salePrice),
          maxStock: product.stock,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId) {
          return { ...i, quantity: Math.min(quantity, i.maxStock) };
        }
        return i;
      }),
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(0);
  };

  const submitSale = async (): Promise<Sale | null> => {
    setSubmitting(true);
    try {
      const sale = await saleService.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        discount,
      });
      clearCart();
      return sale;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    items, discount, subtotal, igv, total, submitting,
    addItem, updateQuantity, removeItem, clearCart, setDiscount, submitSale,
  };
}
