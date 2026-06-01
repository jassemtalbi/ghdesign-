'use client';
import { useAdmin } from '../../../context/AdminContext';
import { useEffect, useState } from 'react';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ',') + ' TND';

export default function AdminStats({ onNavigate }: { onNavigate: (tab: 'stats' | 'orders' | 'articles') => void }) {
  const { orders, articles } = useAdmin();
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setVisits(d.visits));
  }, []);

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const shipped = orders.filter(o => o.status === 'shipped').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const published = articles.filter(a => a.published).length;

  const stats = [
    { label: 'Visiteurs', value: visits === null ? '...' : visits.toLocaleString('fr-FR'), sub: 'Total visites', color: '#34d399', icon: <IconVisits /> },
    { label: 'Chiffre d\'affaires', value: fmt(totalRevenue), sub: `${orders.filter(o => o.status !== 'cancelled').length} commandes`, color: '#c9a96e', icon: <IconRevenue /> },
    { label: 'Commandes en attente', value: String(pending), sub: 'À traiter', color: pending > 0 ? '#f59e0b' : '#4ade80', icon: <IconPending /> },
    { label: 'En livraison', value: String(shipped), sub: 'En cours', color: '#60a5fa', icon: <IconShipped /> },
    { label: 'Articles publiés', value: String(published), sub: `${articles.length} total`, color: '#a78bfa', icon: <IconArticle /> },
  ];

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const statusColors: Record<string, string> = {
    pending: '#f59e0b', confirmed: '#60a5fa', shipped: '#818cf8', delivered: '#4ade80', cancelled: '#f87171',
  };
  const statusLabels: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
  };

  const categoryCount = articles.reduce((acc, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div>
      {/* KPI cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#0d0d0d', border: '1px solid #1a1a14', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </div>
            </div>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: s.color, fontWeight: 300, marginBottom: '4px', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '2px' }}>{s.label}</p>
            <p style={{ fontSize: '10px', color: '#444' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="stats-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>

        {/* Recent orders */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a14' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #1a1a14', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '9px', letterSpacing: '.35em', textTransform: 'uppercase', color: '#c9a96e' }}>Commandes récentes</p>
            <button onClick={() => onNavigate('orders')} style={{ fontSize: '9px', color: '#6b6560', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '.1em', textTransform: 'uppercase' }}>Voir tout →</button>
          </div>
          <div>
            {recentOrders.map((o, i) => (
              <div key={o.id} style={{ padding: '14px 22px', borderBottom: i < recentOrders.length - 1 ? '1px solid #111' : 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '.85rem', color: '#f5f0eb' }}>{o.customer.firstName} {o.customer.lastName}</span>
                    <span style={{ fontSize: '8px', color: '#444' }}>{o.id}</span>
                  </div>
                  <p style={{ fontSize: '10px', color: '#6b6560' }}>{new Date(o.createdAt).toLocaleDateString('fr-TN')} · {o.items.length} article{o.items.length > 1 ? 's' : ''}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '.9rem', color: '#c9a96e', marginBottom: '4px' }}>{fmt(o.total)}</p>
                  <span style={{ fontSize: '8px', padding: '3px 8px', background: `${statusColors[o.status]}18`, color: statusColors[o.status], border: `1px solid ${statusColors[o.status]}40` }}>
                    {statusLabels[o.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories breakdown */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a14' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #1a1a14' }}>
            <p style={{ fontSize: '9px', letterSpacing: '.35em', textTransform: 'uppercase', color: '#c9a96e' }}>Par catégorie</p>
          </div>
          <div style={{ padding: '16px 22px' }}>
            {Object.entries(categoryCount).map(([cat, count]) => {
              const pct = Math.round((count / articles.length) * 100);
              return (
                <div key={cat} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '10px', color: '#f5f0eb' }}>{cat}</span>
                    <span style={{ fontSize: '10px', color: '#6b6560' }}>{count} article{count > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: '2px', background: '#1a1a14' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#c9a96e', transition: 'width .6s' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '14px 22px', borderTop: '1px solid #1a1a14' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', color: '#6b6560' }}>Total articles</span>
              <span style={{ fontSize: '10px', color: '#c9a96e', fontWeight: 600 }}>{articles.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: '#6b6560' }}>Publiés</span>
              <span style={{ fontSize: '10px', color: '#4ade80' }}>{published}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: '#6b6560' }}>Brouillons</span>
              <span style={{ fontSize: '10px', color: '#f59e0b' }}>{articles.length - published}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconVisits() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function IconRevenue() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function IconPending() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function IconShipped() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function IconArticle() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>; }
