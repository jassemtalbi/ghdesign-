'use client';
import { useState } from 'react';
import { useAdmin, type Order, type OrderStatus } from '../../../context/AdminContext';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ',') + ' TND';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#f59e0b', confirmed: '#60a5fa', shipped: '#818cf8', delivered: '#4ade80', cancelled: '#f87171',
};
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};
const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useAdmin();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState('');

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o => {
      if (!search) return true;
      const q = search.toLowerCase();
      return o.id.toLowerCase().includes(q) || `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q) || o.customer.phone.includes(q);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

      {/* List */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Filters + search */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, tél..."
            style={{ padding: '9px 14px', background: '#0d0d0d', border: '1px solid #1a1a14', color: '#f5f0eb', fontSize: '11px', fontFamily: 'inherit', outline: 'none', width: '220px', borderRadius: 0 }} />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['all', ...ALL_STATUSES] as (OrderStatus | 'all')[]).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                style={{
                  padding: '7px 14px', fontSize: '8px', letterSpacing: '.2em', textTransform: 'uppercase',
                  background: filter === s ? (s === 'all' ? '#c9a96e' : STATUS_COLORS[s as OrderStatus]) : '#0d0d0d',
                  color: filter === s ? '#0a0a0a' : '#6b6560',
                  border: `1px solid ${filter === s ? (s === 'all' ? '#c9a96e' : STATUS_COLORS[s as OrderStatus]) : '#1a1a14'}`,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
                }}>
                {s === 'all' ? 'Toutes' : STATUS_LABELS[s as OrderStatus]}
                {s !== 'all' && <span style={{ marginLeft: '6px', opacity: .7 }}>({orders.filter(o => o.status === s).length})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a14' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 110px', padding: '10px 18px', borderBottom: '1px solid #1a1a14' }}>
            {['Client', 'Articles', 'Total', 'Date', 'Statut'].map(h => (
              <span key={h} style={{ fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: '#6b6560' }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ padding: '32px', textAlign: 'center', color: '#444', fontSize: '12px' }}>Aucune commande trouvée</p>
          )}

          {filtered.map((o, i) => (
            <div key={o.id} onClick={() => setSelected(o === selected ? null : o)}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 110px',
                padding: '14px 18px', borderBottom: i < filtered.length - 1 ? '1px solid #111' : 'none',
                cursor: 'pointer', background: selected?.id === o.id ? 'rgba(201,169,110,.05)' : 'none',
                transition: 'background .2s',
              }}>
              <div>
                <p style={{ fontSize: '.85rem', color: '#f5f0eb', fontFamily: 'Georgia, serif', marginBottom: '2px' }}>{o.customer.firstName} {o.customer.lastName}</p>
                <p style={{ fontSize: '10px', color: '#6b6560' }}>{o.customer.phone}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#f5f0eb', marginBottom: '2px' }}>{o.items.map(i => i.name).join(', ')}</p>
                <p style={{ fontSize: '10px', color: '#6b6560' }}>{o.items.reduce((s, i) => s + i.qty, 0)} article{o.items.reduce((s, i) => s + i.qty, 0) > 1 ? 's' : ''}</p>
              </div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '.9rem', color: '#c9a96e', alignSelf: 'center' }}>{fmt(o.total)}</p>
              <p style={{ fontSize: '10px', color: '#6b6560', alignSelf: 'center' }}>{new Date(o.createdAt).toLocaleDateString('fr-TN')}</p>
              <div style={{ alignSelf: 'center' }}>
                <span style={{ fontSize: '8px', padding: '4px 8px', background: `${STATUS_COLORS[o.status]}18`, color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}40` }}>
                  {STATUS_LABELS[o.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ width: '300px', flexShrink: 0, background: '#0d0d0d', border: '1px solid #1a1a14', position: 'sticky', top: '90px' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #1a1a14', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '9px', letterSpacing: '.35em', textTransform: 'uppercase', color: '#c9a96e' }}>Détail {selected.id}</p>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#6b6560', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
          </div>

          {/* Customer */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #111' }}>
            <p style={{ fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '8px' }}>Client</p>
            <p style={{ fontFamily: 'Georgia, serif', color: '#f5f0eb', marginBottom: '4px' }}>{selected.customer.firstName} {selected.customer.lastName}</p>
            <p style={{ fontSize: '11px', color: '#6b6560', marginBottom: '2px' }}>{selected.customer.phone}</p>
            {selected.customer.email && <p style={{ fontSize: '11px', color: '#6b6560', marginBottom: '2px' }}>{selected.customer.email}</p>}
            <p style={{ fontSize: '11px', color: '#6b6560', marginBottom: '2px' }}>{selected.customer.address}</p>
            <p style={{ fontSize: '11px', color: '#6b6560' }}>{selected.customer.city}, {selected.customer.wilaya}</p>
            {selected.customer.notes && (
              <p style={{ fontSize: '11px', color: '#c9a96e', marginTop: '6px', fontStyle: 'italic' }}>Note: {selected.customer.notes}</p>
            )}
          </div>

          {/* Items */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #111' }}>
            <p style={{ fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '8px' }}>Articles</p>
            {selected.items.map(it => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#f5f0eb' }}>{it.name} × {it.qty}</span>
                <span style={{ fontSize: '11px', color: '#c9a96e' }}>{fmt(it.priceNum * it.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #1a1a14', marginTop: '8px', paddingTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#6b6560' }}>Livraison</span>
                <span style={{ fontSize: '10px', color: selected.delivery === 0 ? '#4ade80' : '#f5f0eb' }}>{selected.delivery === 0 ? 'Gratuite' : fmt(selected.delivery)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#6b6560' }}>Total</span>
                <span style={{ fontFamily: 'Georgia, serif', color: '#c9a96e' }}>{fmt(selected.total)}</span>
              </div>
            </div>
          </div>

          {/* Status change */}
          <div style={{ padding: '14px 18px' }}>
            <p style={{ fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '10px' }}>Changer le statut</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {ALL_STATUSES.map(s => (
                <button key={s} onClick={() => { updateOrderStatus(selected.id, s); setSelected(prev => prev ? { ...prev, status: s } : prev); }}
                  style={{
                    padding: '9px 12px', fontSize: '9px', letterSpacing: '.15em', textTransform: 'uppercase',
                    background: selected.status === s ? `${STATUS_COLORS[s]}18` : 'none',
                    border: `1px solid ${selected.status === s ? STATUS_COLORS[s] : '#1a1a14'}`,
                    color: selected.status === s ? STATUS_COLORS[s] : '#6b6560',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLORS[s], flexShrink: 0 }} />
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
