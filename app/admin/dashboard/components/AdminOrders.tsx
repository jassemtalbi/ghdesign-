'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useAdmin, type Order, type OrderStatus } from '../../../context/AdminContext';
import * as XLSX from 'xlsx';

function Celebration({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 4,
      color: ['#c9a96e','#4ade80','#60a5fa','#f59e0b','#f5f0eb','#a78bfa'][Math.floor(Math.random() * 6)],
      speed: Math.random() * 4 + 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      drift: (Math.random() - 0.5) * 2,
    }));

    let frame: number;
    let start = performance.now();

    const draw = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.speed;
        p.x += p.drift;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 1200);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      });
      if (elapsed < 1400) frame = requestAnimationFrame(draw);
      else onDone();
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} />
  );
}

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ',') + ' TND';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#f59e0b', confirmed: '#60a5fa', no_response: '#f87171', delivered: '#4ade80', cancelled: '#6b6560',
};
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente', confirmed: 'Confirmée', no_response: 'Ne répond pas', delivered: 'Livrée', cancelled: 'Annulée',
};
const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'no_response', 'delivered', 'cancelled'];

type SortKey = 'date' | 'total' | 'status';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useAdmin();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [celebrating, setCelebrating] = useState(false);

  const exportXLSX = () => {
    const data = filtered.map(o => ({
      'ID': o.id,
      'Date': new Date(o.createdAt).toLocaleDateString('fr-TN'),
      'Prénom': o.customer.firstName,
      'Nom': o.customer.lastName,
      'Téléphone': o.customer.phone,
      'Email': o.customer.email || '',
      'Adresse': o.customer.address,
      'Ville': o.customer.city,
      'Gouvernorat': o.customer.wilaya,
      'Articles': o.items.map(it => `${it.name}${it.size ? ` (${it.size})` : ''}${it.color ? ` - ${it.color}` : ''} x${it.qty}`).join(', '),
      'Sous-total (TND)': o.subtotal,
      'Livraison (TND)': o.delivery,
      'Total (TND)': o.total,
      'Statut': STATUS_LABELS[o.status],
      'Note': o.customer.notes || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Commandes');
    // Auto column width
    const cols = Object.keys(data[0] || {}).map(k => ({ wch: Math.max(k.length, 14) }));
    ws['!cols'] = cols;
    XLSX.writeFile(wb, `commandes_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = orders
      .filter(o => filter === 'all' || o.status === filter)
      .filter(o => {
        if (!search) return true;
        const q = search.toLowerCase();
        return o.id.toLowerCase().includes(q) ||
          `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q) ||
          o.customer.phone.includes(q);
      });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date')   cmp = a.createdAt.localeCompare(b.createdAt);
      if (sortKey === 'total')  cmp = a.total - b.total;
      if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [orders, filter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span style={{ marginLeft: '4px', opacity: sortKey === k ? 1 : 0.3, fontSize: '9px' }}>
      {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <>
      {celebrating && (
        <>
          <Celebration onDone={() => setCelebrating(false)} />
          <div style={{
            position: 'fixed', top: '32px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 10000, background: '#0d0d0d', border: '1px solid #4ade80',
            padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 0 32px rgba(74,222,128,.2)',
            animation: 'fadeInDown .4s ease',
          }}>
            <span style={{ fontSize: '20px' }}>🎉</span>
            <div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '.95rem', color: '#4ade80', fontWeight: 300 }}>Commande livrée !</p>
              <p style={{ fontFamily: 'inherit', fontSize: '9px', color: '#6b6560', letterSpacing: '.1em', marginTop: '2px' }}>Félicitations 🎊</p>
            </div>
          </div>
          <style>{`@keyframes fadeInDown { from { opacity:0; transform:translateX(-50%) translateY(-16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
        </>
      )}
      <style>{`
        @media (max-width: 768px) {
          .orders-table-header { display: none !important; }
          .order-row { grid-template-columns: 1fr !important; }
          .order-row-articles, .order-row-total-desktop, .order-row-date { display: none !important; }
          .order-detail-panel { width: 100% !important; position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; top: auto !important; max-height: 80vh !important; overflow-y: auto !important; z-index: 100 !important; border-top: 1px solid #1a1a14 !important; }
          .filter-scroll { overflow-x: auto; scrollbar-width: none; }
          .pagination { flex-wrap: wrap !important; }
        }
      `}</style>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Search + sort controls */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par nom, téléphone..."
              style={{ flex: 1, minWidth: '180px', padding: '10px 14px', background: '#0d0d0d', border: '1px solid #1a1a14', color: '#f5f0eb', fontSize: '11px', fontFamily: 'inherit', outline: 'none', borderRadius: 0 }} />
            <button onClick={exportXLSX} disabled={filtered.length === 0}
              style={{
                padding: '10px 16px', background: filtered.length === 0 ? '#111' : '#166534',
                border: `1px solid ${filtered.length === 0 ? '#1a1a14' : '#4ade80'}`,
                color: filtered.length === 0 ? '#333' : '#4ade80',
                fontSize: '9px', letterSpacing: '.15em', textTransform: 'uppercase',
                cursor: filtered.length === 0 ? 'default' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '7px', transition: 'all .2s', flexShrink: 0,
              }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export XLSX {filtered.length > 0 && `(${filtered.length})`}
            </button>
            <div style={{ display: 'flex', gap: '6px' }}>
              {([['date', 'Date'], ['total', 'Montant'], ['status', 'Statut']] as [SortKey, string][]).map(([k, label]) => (
                <button key={k} onClick={() => toggleSort(k)}
                  style={{
                    padding: '8px 12px', fontSize: '8px', letterSpacing: '.15em', textTransform: 'uppercase',
                    background: sortKey === k ? 'rgba(201,169,110,.1)' : '#0d0d0d',
                    border: `1px solid ${sortKey === k ? 'rgba(201,169,110,.3)' : '#1a1a14'}`,
                    color: sortKey === k ? '#c9a96e' : '#6b6560',
                    cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                  }}>
                  {label}<SortIcon k={k} />
                </button>
              ))}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="filter-scroll" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '6px', minWidth: 'max-content' }}>
              {(['all', ...ALL_STATUSES] as (OrderStatus | 'all')[]).map(s => (
                <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                  style={{
                    padding: '7px 12px', fontSize: '8px', letterSpacing: '.15em', textTransform: 'uppercase',
                    background: filter === s ? (s === 'all' ? '#c9a96e' : STATUS_COLORS[s as OrderStatus]) : '#0d0d0d',
                    color: filter === s ? '#0a0a0a' : '#6b6560',
                    border: `1px solid ${filter === s ? (s === 'all' ? '#c9a96e' : STATUS_COLORS[s as OrderStatus]) : '#1a1a14'}`,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', whiteSpace: 'nowrap',
                  }}>
                  {s === 'all' ? `Toutes (${orders.length})` : STATUS_LABELS[s as OrderStatus]}
                  {s !== 'all' && <span style={{ marginLeft: '5px', opacity: .6 }}>({orders.filter(o => o.status === s).length})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a14' }}>
            {/* Header */}
            <div className="orders-table-header" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 90px 110px', padding: '10px 18px', borderBottom: '1px solid #1a1a14', background: '#0a0a0a' }}>
              <span style={{ fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: '#6b6560' }}>Client</span>
              <span style={{ fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: '#6b6560' }}>Articles</span>
              <button onClick={() => toggleSort('total')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: sortKey === 'total' ? '#c9a96e' : '#6b6560' }}>Total</span>
                <SortIcon k="total" />
              </button>
              <button onClick={() => toggleSort('date')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: sortKey === 'date' ? '#c9a96e' : '#6b6560' }}>Date</span>
                <SortIcon k="date" />
              </button>
              <button onClick={() => toggleSort('status')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: sortKey === 'status' ? '#c9a96e' : '#6b6560' }}>Statut</span>
                <SortIcon k="status" />
              </button>
            </div>

            {paginated.length === 0 && (
              <p style={{ padding: '32px', textAlign: 'center', color: '#444', fontSize: '12px' }}>Aucune commande trouvée</p>
            )}

            {paginated.map((o, i) => (
              <div key={o.id} onClick={() => setSelected(o === selected ? null : o)}
                className="order-row"
                style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 90px 110px',
                  padding: '14px 18px', borderBottom: i < paginated.length - 1 ? '1px solid #111' : 'none',
                  cursor: 'pointer', background: selected?.id === o.id ? 'rgba(201,169,110,.05)' : 'none',
                  transition: 'background .2s', alignItems: 'center',
                }}>
                <div>
                  <p style={{ fontSize: '.85rem', color: '#f5f0eb', fontFamily: 'Georgia, serif', marginBottom: '2px' }}>
                    {o.customer.firstName} {o.customer.lastName}
                  </p>
                  <p style={{ fontSize: '10px', color: '#6b6560' }}>{o.customer.phone}</p>
                  {/* Mobile summary */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '5px' }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '.8rem', color: '#c9a96e' }}>{fmt(o.total)}</span>
                    <span style={{ fontSize: '7px', padding: '2px 6px', background: `${STATUS_COLORS[o.status]}18`, color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}40` }}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </div>
                </div>
                <div className="order-row-articles">
                  <p style={{ fontSize: '11px', color: '#f5f0eb', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items.map(it => it.name).join(', ')}</p>
                  <p style={{ fontSize: '10px', color: '#6b6560' }}>{o.items.reduce((s, it) => s + it.qty, 0)} art.</p>
                </div>
                <p className="order-row-total-desktop" style={{ fontFamily: 'Georgia, serif', fontSize: '.9rem', color: '#c9a96e' }}>{fmt(o.total)}</p>
                <p className="order-row-date" style={{ fontSize: '10px', color: '#6b6560' }}>{new Date(o.createdAt).toLocaleDateString('fr-TN')}</p>
                <div>
                  <span style={{ fontSize: '8px', padding: '4px 8px', background: `${STATUS_COLORS[o.status]}18`, color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}40` }}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', gap: '8px' }}>
              <p style={{ fontSize: '10px', color: '#6b6560' }}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} commandes
              </p>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setPage(1)} disabled={page === 1}
                  style={{ padding: '6px 10px', background: 'none', border: '1px solid #1a1a14', color: page === 1 ? '#333' : '#6b6560', cursor: page === 1 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '11px' }}>
                  «
                </button>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  style={{ padding: '6px 10px', background: 'none', border: '1px solid #1a1a14', color: page === 1 ? '#333' : '#6b6560', cursor: page === 1 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '11px' }}>
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) => p === '...'
                    ? <span key={`dots-${i}`} style={{ padding: '6px 8px', color: '#444', fontSize: '11px' }}>…</span>
                    : <button key={p} onClick={() => setPage(p as number)}
                        style={{ padding: '6px 10px', background: page === p ? '#c9a96e' : 'none', border: `1px solid ${page === p ? '#c9a96e' : '#1a1a14'}`, color: page === p ? '#0a0a0a' : '#6b6560', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', fontWeight: page === p ? 600 : 400 }}>
                        {p}
                      </button>
                  )}
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                  style={{ padding: '6px 10px', background: 'none', border: '1px solid #1a1a14', color: page === totalPages ? '#333' : '#6b6560', cursor: page === totalPages ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '11px' }}>
                  ›
                </button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                  style={{ padding: '6px 10px', background: 'none', border: '1px solid #1a1a14', color: page === totalPages ? '#333' : '#6b6560', cursor: page === totalPages ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '11px' }}>
                  »
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="order-detail-panel" style={{ width: '300px', flexShrink: 0, background: '#0d0d0d', border: '1px solid #1a1a14', position: 'sticky', top: '90px' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #1a1a14', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '9px', letterSpacing: '.35em', textTransform: 'uppercase', color: '#c9a96e' }}>Détail · {selected.id}</p>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#6b6560', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #111' }}>
              <p style={{ fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '8px' }}>Client</p>
              <p style={{ fontFamily: 'Georgia, serif', color: '#f5f0eb', marginBottom: '4px' }}>{selected.customer.firstName} {selected.customer.lastName}</p>
              <p style={{ fontSize: '11px', color: '#6b6560', marginBottom: '2px' }}>{selected.customer.phone}</p>
              {selected.customer.email && <p style={{ fontSize: '11px', color: '#6b6560', marginBottom: '2px' }}>{selected.customer.email}</p>}
              <p style={{ fontSize: '11px', color: '#6b6560', marginBottom: '2px' }}>{selected.customer.address}</p>
              <p style={{ fontSize: '11px', color: '#6b6560' }}>{selected.customer.city}, {selected.customer.wilaya}</p>
              {selected.customer.notes && <p style={{ fontSize: '11px', color: '#c9a96e', marginTop: '6px', fontStyle: 'italic' }}>Note: {selected.customer.notes}</p>}
            </div>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #111' }}>
              <p style={{ fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '8px' }}>Articles</p>
              {selected.items.map((it, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#f5f0eb' }}>{it.name} × {it.qty}</span>
                    <span style={{ fontSize: '11px', color: '#c9a96e' }}>{fmt(it.priceNum * it.qty)}</span>
                  </div>
                  {(it.size || it.color) && (
                    <div style={{ display: 'flex', gap: '5px', marginTop: '3px' }}>
                      {it.size && <span style={{ fontSize: '8px', padding: '1px 6px', border: '1px solid #2a2520', color: '#6b6560', letterSpacing: '.1em' }}>{it.size}</span>}
                      {it.color && <span style={{ fontSize: '8px', padding: '1px 6px', border: '1px solid rgba(201,169,110,.3)', color: '#c9a96e', letterSpacing: '.1em' }}>{it.color}</span>}
                    </div>
                  )}
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
            <div style={{ padding: '14px 18px' }}>
              <p style={{ fontSize: '8px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '10px' }}>Changer le statut</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {ALL_STATUSES.map(s => (
                  <button key={s} onClick={() => { updateOrderStatus(selected.id, s); setSelected(prev => prev ? { ...prev, status: s } : prev); if (s === 'delivered') setCelebrating(true); }}
                    style={{
                      padding: '9px 10px', fontSize: '9px', letterSpacing: '.1em', textTransform: 'uppercase',
                      background: selected.status === s ? `${STATUS_COLORS[s]}18` : 'none',
                      border: `1px solid ${selected.status === s ? STATUS_COLORS[s] : '#1a1a14'}`,
                      color: selected.status === s ? STATUS_COLORS[s] : '#6b6560',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: STATUS_COLORS[s], flexShrink: 0 }} />
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
