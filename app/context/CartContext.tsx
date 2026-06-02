'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  priceNum: number;
  tag: string;
  image: string;
  size?: string;
  color?: string;
};

export type CartItem = Product & { qty: number; cartKey: string };

type CartCtx = {
  items: CartItem[];
  addItem: (p: Product) => void;
  removeItem: (cartKey: string) => void;
  changeQty: (cartKey: string, delta: number) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  total: number;
};

const Ctx = createContext<CartCtx>({} as CartCtx);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addItem = useCallback((p: Product) => {
    const cartKey = `${p.id}-${p.size || ''}-${p.color || ''}`;
    setItems(prev => {
      const existing = prev.find(it => it.cartKey === cartKey);
      if (existing) return prev.map(it => it.cartKey === cartKey ? { ...it, qty: it.qty + 1 } : it);
      return [...prev, { ...p, qty: 1, cartKey }];
    });
    setTimeout(() => setCartOpen(true), 0);
  }, []);

  const removeItem = useCallback((cartKey: string) =>
    setItems(prev => prev.filter(it => it.cartKey !== cartKey)), []);

  const changeQty = useCallback((cartKey: string, delta: number) =>
    setItems(prev => prev.map(it =>
      it.cartKey === cartKey ? { ...it, qty: Math.max(1, it.qty + delta) } : it
    )), []);

  const total = items.reduce((s, it) => s + it.qty, 0);

  return (
    <Ctx.Provider value={{ items, addItem, removeItem, changeQty, cartOpen, setCartOpen, total }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);
