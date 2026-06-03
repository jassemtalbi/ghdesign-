'use client';
import { useAdmin } from '../../../context/AdminContext';
import { useEffect, useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ',') + ' TND';
const fmtShort = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(0)+'k' : String(n);

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#60a5fa', no_response: '#f87171', delivered: '#4ade80', cancelled: 'var(--muted)',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', no_response: 'Ne répond pas', delivered: 'Livrée', cancelled: 'Annulée',
};

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

type Range = '7d' | '30d' | 'month' | 'year';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px 14px', fontFamily: 'inherit' }}>
      {label && <p style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: '11px', color: p.color || 'var(--accent)' }}>
          {p.name ? `${p.name}: ` : ''}{typeof p.value === 'number' && p.value > 100 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

function RangeBar({ range, setRange, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }: {
  range: Range; setRange: (r: Range) => void;
  selectedMonth: number; setSelectedMonth: (m: number) => void;
  selectedYear: number; setSelectedYear: (y: number) => void;
}) {
  const now = new Date();
  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', fontSize: '8px', letterSpacing: '.15em', textTransform: 'uppercase',
    background: active ? 'var(--accent)' : 'var(--surface)', color: active ? 'var(--background)' : 'var(--muted)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
  });

  const selStyle: React.CSSProperties = {
    padding: '5px 10px', fontSize: '9px', background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--muted)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
    appearance: 'none' as const,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <button style={btnStyle(range === '7d')}   onClick={() => setRange('7d')}>7 jours</button>
      <button style={btnStyle(range === '30d')}  onClick={() => setRange('30d')}>30 jours</button>
      <button style={btnStyle(range === 'month')} onClick={() => setRange('month')}>Mois</button>
      <button style={btnStyle(range === 'year')}  onClick={() => setRange('year')}>Année</button>

      {range === 'month' && (
        <>
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={selStyle}>
            {MONTHS_FR.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={selStyle}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </>
      )}
      {range === 'year' && (
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={selStyle}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      )}
    </div>
  );
}

export default function AdminStats({ onNavigate }: { onNavigate: (tab: 'stats' | 'orders' | 'articles') => void }) {
  const { orders, articles } = useAdmin();
  const [visits, setVisits] = useState<number | null>(null);
  const [range, setRange] = useState<Range>('7d');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setVisits(d.visits));
  }, []);

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const pending   = orders.filter(o => o.status === 'pending').length;
  const noResponse = orders.filter(o => o.status === 'no_response').length; // eslint-disable-line
  const published = articles.filter(a => a.published).length;

  // Build chart data based on range
  const { revenueData, ordersData, rangeLabel } = useMemo(() => {
    if (range === '7d' || range === '30d') {
      const days = range === '7d' ? 7 : 30;
      const map: Record<string, { total: number; count: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        map[key] = { total: 0, count: 0 };
      }
      orders.filter(o => o.status !== 'cancelled').forEach(o => {
        const d = new Date(o.createdAt);
        const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        if (key in map) map[key].total += o.total;
      });
      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        if (key in map) map[key].count++;
      });
      return {
        revenueData: Object.entries(map).map(([date, v]) => ({ date, total: v.total })),
        ordersData:  Object.entries(map).map(([date, v]) => ({ date, count: v.count })),
        rangeLabel: `${days} derniers jours`,
      };
    }

    if (range === 'month') {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const map: Record<string, { total: number; count: number }> = {};
      for (let d = 1; d <= daysInMonth; d++) {
        const key = String(d).padStart(2, '0');
        map[key] = { total: 0, count: 0 };
      }
      orders.filter(o => o.status !== 'cancelled').forEach(o => {
        const d = new Date(o.createdAt);
        if (d.getMonth() === selectedMonth && d.getFullYear() === selectedYear) {
          const key = String(d.getDate()).padStart(2, '0');
          if (key in map) map[key].total += o.total;
        }
      });
      orders.forEach(o => {
        const d = new Date(o.createdAt);
        if (d.getMonth() === selectedMonth && d.getFullYear() === selectedYear) {
          const key = String(d.getDate()).padStart(2, '0');
          if (key in map) map[key].count++;
        }
      });
      return {
        revenueData: Object.entries(map).map(([date, v]) => ({ date, total: v.total })),
        ordersData:  Object.entries(map).map(([date, v]) => ({ date, count: v.count })),
        rangeLabel: `${MONTHS_FR[selectedMonth]} ${selectedYear}`,
      };
    }

    // year
    const map: Record<string, { total: number; count: number }> = {};
    MONTHS_FR.forEach(m => { map[m.slice(0,3)] = { total: 0, count: 0 }; });
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === selectedYear) {
        const key = MONTHS_FR[d.getMonth()].slice(0, 3);
        map[key].total += o.total;
      }
    });
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === selectedYear) {
        const key = MONTHS_FR[d.getMonth()].slice(0, 3);
        map[key].count++;
      }
    });
    return {
      revenueData: Object.entries(map).map(([date, v]) => ({ date, total: v.total })),
      ordersData:  Object.entries(map).map(([date, v]) => ({ date, count: v.count })),
      rangeLabel: String(selectedYear),
    };
  }, [range, selectedMonth, selectedYear, orders]);

  const statusData = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    name: label, value: orders.filter(o => o.status === key).length, color: STATUS_COLORS[key],
  })).filter(d => d.value > 0);

  const categoryData = articles.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1; return acc;
  }, {} as Record<string, number>);
  const categoryChart = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  const kpis = [
    { label: 'Visiteurs',          value: visits === null ? '...' : visits.toLocaleString('fr-FR'), sub: 'Total visites',   color: '#34d399', icon: <IconVisits /> },
    { label: "Chiffre d'affaires", value: fmt(totalRevenue), sub: `${orders.filter(o=>o.status!=='cancelled').length} commandes`, color: 'var(--accent)', icon: <IconRevenue /> },
    { label: 'En attente',         value: String(pending),   sub: 'À traiter',  color: pending > 0 ? '#f59e0b' : '#4ade80', icon: <IconPending /> },
    { label: 'Ne répond pas',      value: String(noResponse), sub: 'Sans réponse', color: '#f87171', icon: <IconShipped /> },
    { label: 'Articles publiés',   value: String(published), sub: `${articles.length} total`, color: '#a78bfa', icon: <IconArticle /> },
  ];

  return (
    <div>
      {/* KPIs */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {kpis.map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </div>
              <div style={{ width: '3px', height: '28px', background: s.color, opacity: .4 }} />
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: s.color, fontWeight: 300, marginBottom: '2px', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>{s.label}</p>
            <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <p style={{ fontSize: '9px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>Période : <span style={{ color: 'var(--accent)' }}>{rangeLabel}</span></p>
        <RangeBar range={range} setRange={setRange} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
      </div>

      {/* Charts row 1 */}
      <div className="stats-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

        {/* Revenue area */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '4px' }}>Chiffre d'affaires</p>
          <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '16px' }}>{rangeLabel}</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={fmtShort} tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2} fill="url(#revGrad)" dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders bar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '.35em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: '4px' }}>Commandes</p>
          <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '16px' }}>{rangeLabel}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ordersData} barSize={range === 'year' ? 14 : 18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Commandes" fill="#60a5fa" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="stats-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

        {/* Status pie */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '.35em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: '4px' }}>Statuts commandes</p>
          <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '16px' }}>Répartition</p>
          {statusData.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '11px', padding: '60px 0' }}>Aucune commande</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {statusData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '9px', color: 'var(--muted)', flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--foreground)', fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categories bar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '.35em', textTransform: 'uppercase', color: '#34d399', marginBottom: '4px' }}>Articles par catégorie</p>
          <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '16px' }}>Inventaire</p>
          {categoryChart.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '11px', padding: '60px 0' }}>Aucun article</p>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={categoryChart} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Articles" fill="#34d399" fillOpacity={0.8} radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '9px', letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--accent)' }}>Commandes récentes</p>
          <button onClick={() => onNavigate('orders')} style={{ fontSize: '9px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '.1em', textTransform: 'uppercase' }}>Voir tout →</button>
        </div>
        {recentOrders.length === 0 && (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>Aucune commande</p>
        )}
        {recentOrders.map((o, i) => (
          <div key={o.id} style={{ padding: '14px 22px', borderBottom: i < recentOrders.length - 1 ? '1px solid #111' : 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '.85rem', color: 'var(--foreground)' }}>{o.customer.firstName} {o.customer.lastName}</span>
                <span style={{ fontSize: '8px', color: 'var(--muted)' }}>{o.id}</span>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--muted)' }}>{new Date(o.createdAt).toLocaleDateString('fr-TN')} · {o.items.length} article{o.items.length > 1 ? 's' : ''}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '.9rem', color: 'var(--accent)', marginBottom: '4px' }}>{fmt(o.total)}</p>
              <span style={{ fontSize: '8px', padding: '3px 8px', background: `${STATUS_COLORS[o.status]}18`, color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}40` }}>
                {STATUS_LABELS[o.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IconVisits()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function IconRevenue() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function IconPending() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function IconShipped() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function IconArticle() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>; }
