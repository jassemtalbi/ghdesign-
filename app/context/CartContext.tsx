'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  priceNum: number;
  tag: string;
  image: string;
};

export type CartItem = Product & { qty: number };

type CartCtx = {
  items: CartItem[];
  addItem: (p: Product) => void;
  removeItem: (id: number) => void;
  changeQty: (id: number, delta: number) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  total: number;
};

const Ctx = createContext<CartCtx>({} as CartCtx);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addItem = useCallback((p: Product) => {
    setItems(prev => {
      const existing = prev.find(it => it.id === p.id);
      if (existing) {
        return prev.map(it => it.id === p.id ? { ...it, qty: it.qty + 1 } : it);
      }
      return [...prev, { ...p, qty: 1 }];
    });
    // Open cart in next tick so state update is already flushed
    setTimeout(() => setCartOpen(true), 0);
  }, []);

  const removeItem = useCallback((id: number) =>
    setItems(prev => prev.filter(it => it.id !== id)), []);

  const changeQty = useCallback((id: number, delta: number) =>
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
    )), []);

  const total = items.reduce((s, it) => s + it.qty, 0);

  return (
    <Ctx.Provider value={{ items, addItem, removeItem, changeQty, cartOpen, setCartOpen, total }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);
