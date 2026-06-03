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
      color: ['var(--accent)','#4ade80','#60a5fa','#f59e0b','var(--foreground)','#a78bfa'][Math.floor(Math.random() * 6)],
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
  pending: '#f59e0b', confirmed: '#60a5fa', no_response: '#f87171', delivered: '#4ade80', cancelled: 'var(--muted)',
};
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente', confirmed: 'Confirmée', no_response: 'Ne répond pas', delivered: 'Livrée', cancelled: 'Annulée',
};
const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'no_response', 'delivered', 'cancelled'];

type SortKey = 'date' | 'total' | 'status';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

export default function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder } = useAdmin();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
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
    <span style={{ marginLeft: '4px', opacity: sortKey === k ? 1 : 0.3, fontSize: '12px' }}>
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
            zIndex: 10000, background: 'var(--surface)', border: '1px solid #4ade80',
            padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 0 32px rgba(74,222,128,.2)',
            animation: 'fadeInDown .4s ease',
          }}>
            <span style={{ fontSize: '20px' }}>🎉</span>
            <div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#4ade80', fontWeight: 700 }}>Commande livrée !</p>
              <p style={{ fontFamily: 'inherit', fontSize: '12px', color: 'var(--muted)', letterSpacing: '.1em', marginTop: '2px' }}>Félicitations 🎊</p>
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
          .order-detail-panel { width: 100% !important; position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; top: auto !important; max-height: 80vh !important; overflow-y: auto !important; z-index: 100 !important; border-top: 1px solid var(--border) !important; }
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
              style={{ flex: 1, minWidth: '180px', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '11px', fontFamily: 'inherit', outline: 'none', borderRadius: 0 }} />
            <button onClick={exportXLSX} disabled={filtered.length === 0}
              style={{
                padding: '10px 16px', background: filtered.length === 0 ? 'var(--surface)' : '#166534',
                border: `1px solid ${filtered.length === 0 ? 'var(--border)' : '#4ade80'}`,
                color: filtered.length === 0 ? '#333' : '#4ade80',
                fontSize: '12px', letterSpacing: '.15em', textTransform: 'uppercase',
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
                    padding: '8px 12px', fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase',
                    background: sortKey === k ? 'rgba(201,169,110,.1)' : 'var(--surface)',
                    border: `1px solid ${sortKey === k ? 'rgba(201,169,110,.3)' : 'var(--border)'}`,
                    color: sortKey === k ? 'var(--accent)' : 'var(--muted)',
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
                    padding: '7px 12px', fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase',
                    background: filter === s ? (s === 'all' ? 'var(--accent)' : STATUS_COLORS[s as OrderStatus]) : 'var(--surface)',
                    color: filter === s ? 'var(--background)' : 'var(--muted)',
                    border: `1px solid ${filter === s ? (s === 'all' ? 'var(--accent)' : STATUS_COLORS[s as OrderStatus]) : 'var(--border)'}`,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', whiteSpace: 'nowrap',
                  }}>
                  {s === 'all' ? `Toutes (${orders.length})` : STATUS_LABELS[s as OrderStatus]}
                  {s !== 'all' && <span style={{ marginLeft: '5px', opacity: .6 }}>({orders.filter(o => o.status === s).length})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {/* Header */}
            <div className="orders-table-header" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 90px 110px', padding: '10px 18px', borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
              <span style={{ fontSize: '11px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>Client</span>
              <span style={{ fontSize: '11px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>Articles</span>
              <button onClick={() => toggleSort('total')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', letterSpacing: '.3em', textTransform: 'uppercase', color: sortKey === 'total' ? 'var(--accent)' : 'var(--muted)' }}>Total</span>
                <SortIcon k="total" />
              </button>
              <button onClick={() => toggleSort('date')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', letterSpacing: '.3em', textTransform: 'uppercase', color: sortKey === 'date' ? 'var(--accent)' : 'var(--muted)' }}>Date</span>
                <SortIcon k="date" />
              </button>
              <button onClick={() => toggleSort('status')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', letterSpacing: '.3em', textTransform: 'uppercase', color: sortKey === 'status' ? 'var(--accent)' : 'var(--muted)' }}>Statut</span>
                <SortIcon k="status" />
              </button>
            </div>

            {paginated.length === 0 && (
              <p style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>Aucune commande trouvée</p>
            )}

            {paginated.map((o, i) => (
              <div key={o.id} onClick={() => { setSelected(o === selected ? null : o); setDeleteConfirm(false); }}
                className="order-row"
                style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 90px 110px',
                  padding: '14px 18px', borderBottom: i < paginated.length - 1 ? '1px solid #111' : 'none',
                  cursor: 'pointer', background: selected?.id === o.id ? 'rgba(201,169,110,.05)' : 'none',
                  transition: 'background .2s', alignItems: 'center',
                }}>
                <div>
                  <p style={{ fontSize: '.88rem', color: 'var(--foreground)', fontFamily: 'var(--font-serif)', marginBottom: '2px' }}>
                    {o.customer.firstName} {o.customer.lastName}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{o.customer.phone}</p>
                  {/* Mobile summary */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '5px' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--accent)' }}>{fmt(o.total)}</span>
                    <span style={{ fontSize: '11px', padding: '2px 6px', background: `${STATUS_COLORS[o.status]}18`, color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}40` }}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </div>
                </div>
                <div className="order-row-articles">
                  <p style={{ fontSize: '11px', color: 'var(--foreground)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items.map(it => it.name).join(', ')}</p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{o.items.reduce((s, it) => s + it.qty, 0)} art.</p>
                </div>
                <p className="order-row-total-desktop" style={{ fontFamily: 'var(--font-serif)', fontSize: '.88rem', color: 'var(--accent)' }}>{fmt(o.total)}</p>
                <p className="order-row-date" style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(o.createdAt).toLocaleDateString('fr-TN')}</p>
                <div>
                  <span style={{ fontSize: '11px', padding: '4px 8px', background: `${STATUS_COLORS[o.status]}18`, color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}40` }}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', gap: '8px' }}>
              <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} commandes
              </p>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setPage(1)} disabled={page === 1}
                  style={{ padding: '6px 10px', background: 'none', border: '1px solid var(--border)', color: page === 1 ? '#333' : 'var(--muted)', cursor: page === 1 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '11px' }}>
                  «
                </button>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  style={{ padding: '6px 10px', background: 'none', border: '1px solid var(--border)', color: page === 1 ? '#333' : 'var(--muted)', cursor: page === 1 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '11px' }}>
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
                    ? <span key={`dots-${i}`} style={{ padding: '6px 8px', color: 'var(--muted)', fontSize: '11px' }}>…</span>
                    : <button key={p} onClick={() => setPage(p as number)}
                        style={{ padding: '6px 10px', background: page === p ? 'var(--accent)' : 'none', border: `1px solid ${page === p ? 'var(--accent)' : 'var(--border)'}`, color: page === p ? 'var(--background)' : 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', fontWeight: page === p ? 600 : 400 }}>
                        {p}
                      </button>
                  )}
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                  style={{ padding: '6px 10px', background: 'none', border: '1px solid var(--border)', color: page === totalPages ? '#333' : 'var(--muted)', cursor: page === totalPages ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '11px' }}>
                  ›
                </button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                  style={{ padding: '6px 10px', background: 'none', border: '1px solid var(--border)', color: page === totalPages ? '#333' : 'var(--muted)', cursor: page === totalPages ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '11px' }}>
                  »
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="order-detail-panel" style={{ width: '320px', flexShrink: 0, background: 'var(--background)', border: '1px solid var(--border)', position: 'sticky', top: '90px', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '2px' }}>Commande</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>{selected.id}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {deleteConfirm ? (
                  <>
                    <button onClick={async () => { await deleteOrder(selected.id); setSelected(null); setDeleteConfirm(false); }}
                      style={{ padding: '5px 12px', background: '#7f1d1d', border: '1px solid #f87171', color: '#fca5a5', fontSize: '9px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                      Confirmer
                    </button>
                    <button onClick={() => setDeleteConfirm(false)}
                      style={{ padding: '5px 10px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '9px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Annuler
                    </button>
                  </>
                ) : (
                  <button onClick={() => setDeleteConfirm(true)}
                    style={{ background: 'none', border: '1px solid rgba(248,113,113,.3)', color: '#f87171', cursor: 'pointer', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'inherit' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    Supprimer
                  </button>
                )}
                <button onClick={() => { setSelected(null); setDeleteConfirm(false); }} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            {/* Client */}
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '9px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '12px' }}>Client</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '10px' }}>{selected.customer.firstName} {selected.customer.lastName}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href={`tel:${selected.customer.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  <span style={{ width: '28px', height: '28px', background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)' }}>{selected.customer.phone}</span>
                </a>
                {selected.customer.email && (
                  <a href={`mailto:${selected.customer.email}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <span style={{ width: '28px', height: '28px', background: 'rgba(96,165,250,.1)', border: '1px solid rgba(96,165,250,.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#60a5fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.customer.email}</span>
                  </a>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ width: '28px', height: '28px', background: 'rgba(184,146,74,.1)', border: '1px solid rgba(184,146,74,.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.4 }}>{selected.customer.address}</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{selected.customer.city}, {selected.customer.wilaya}</p>
                  </div>
                </div>
              </div>
              {selected.customer.notes && (
                <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(184,146,74,.06)', border: '1px solid rgba(184,146,74,.2)', borderLeft: '3px solid var(--accent)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--accent)', fontStyle: 'italic' }}>"{selected.customer.notes}"</p>
                </div>
              )}
            </div>

            {/* Articles */}
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '9px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '12px' }}>Articles</p>
              {selected.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', paddingBottom: '10px', borderBottom: i < selected.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.3 }}>{it.name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>× {it.qty}</span></span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>{fmt(it.priceNum * it.qty)}</span>
                    </div>
                    {(it.size || it.color) && (
                      <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                        {it.size && <span style={{ fontSize: '10px', padding: '2px 8px', border: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600, letterSpacing: '.08em' }}>{it.size}</span>}
                        {it.color && <span style={{ fontSize: '10px', padding: '2px 8px', border: '1px solid rgba(184,146,74,.3)', color: 'var(--accent)', fontWeight: 600, letterSpacing: '.08em' }}>{it.color}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ background: 'var(--surface)', padding: '10px 12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Livraison</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: selected.delivery === 0 ? '#4ade80' : 'var(--foreground)' }}>{selected.delivery === 0 ? 'Gratuite' : fmt(selected.delivery)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>{fmt(selected.total)}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{ padding: '16px 18px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px' }}>Changer le statut</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {ALL_STATUSES.map(s => (
                  <button key={s} onClick={() => { updateOrderStatus(selected.id, s); setSelected(prev => prev ? { ...prev, status: s } : prev); if (s === 'delivered') setCelebrating(true); }}
                    style={{
                      padding: '9px 10px', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase',
                      background: selected.status === s ? `${STATUS_COLORS[s]}18` : 'none',
                      border: `1px solid ${selected.status === s ? STATUS_COLORS[s] : 'var(--border)'}`,
                      color: selected.status === s ? STATUS_COLORS[s] : 'var(--muted)',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', fontWeight: selected.status === s ? 700 : 400,
                      display: 'flex', alignItems: 'center', gap: '6px',
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
    </>
  );
}
