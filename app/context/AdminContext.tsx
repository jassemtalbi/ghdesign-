'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type OrderStatus = 'pending' | 'confirmed' | 'no_response' | 'delivered' | 'cancelled' | 'traite';

export type Order = {
  id: string;
  createdAt: string;
  customer: { firstName: string; lastName: string; phone: string; email: string; address: string; city: string; wilaya: string; notes: string };
  items: { id: string; name: string; category: string; price: string; priceNum: number; qty: number; image: string; size?: string; color?: string }[];
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
};

export type Article = {
  id: string;
  name: string;
  category: string;
  price: string;
  priceNum: number;
  tag: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  description: string;
  pinned: boolean;
  published: boolean;
  createdAt: string;
};

type AdminCtx = {
  orders: Order[];
  articles: Article[];
  loading: boolean;
  addOrder: (o: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addArticle: (a: Omit<Article, 'id' | 'createdAt'>) => Promise<void>;
  updateArticle: (id: string, updates: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  togglePublish: (id: string, current: boolean) => Promise<void>;
  togglePin: (id: string, current: boolean) => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AdminCtx>({} as AdminCtx);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [artRes, ordRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/orders'),
      ]);
      if (artRes.ok) setArticles(await artRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addOrder = useCallback(async (o: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
    if (res.ok) { const order = await res.json(); setOrders(prev => [order, ...prev]); }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    if (res.ok) setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const addArticle = useCallback(async (a: Omit<Article, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) });
    if (res.ok) { const article = await res.json(); setArticles(prev => [article, ...prev]); }
  }, []);

  const updateArticle = useCallback(async (id: string, updates: Partial<Article>) => {
    const res = await fetch(`/api/articles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (res.ok) setArticles(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteArticle = useCallback(async (id: string) => {
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    if (res.ok) setArticles(prev => prev.filter(a => a.id !== id));
  }, []);

  const togglePublish = useCallback(async (id: string, current: boolean) => {
    const res = await fetch(`/api/articles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !current }) });
    if (res.ok) setArticles(prev => prev.map(a => a.id === id ? { ...a, published: !current } : a));
  }, []);

  const togglePin = useCallback(async (id: string, current: boolean) => {
    const res = await fetch(`/api/articles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pinned: !current }) });
    if (res.ok) setArticles(prev => prev.map(a => a.id === id ? { ...a, pinned: !current } : a));
  }, []);

  return (
    <Ctx.Provider value={{ orders, articles, loading, addOrder, updateOrderStatus, deleteOrder, addArticle, updateArticle, deleteArticle, togglePublish, togglePin, refresh: fetchAll }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAdmin = () => useContext(Ctx);
