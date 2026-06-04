'use client';
import { useEffect, useState, useRef } from 'react';
import { useAdmin } from '../../../context/AdminContext';

type Notif = {
  id: string;
  customer: string;
  total: number;
  city: string;
  wilaya: string;
  createdAt: string;
};

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ',') + ' TND';

export default function AdminNotifications() {
  const [notifs, setNotifs]   = useState<Notif[]>([]);
  const [unread, setUnread]   = useState(0);
  const [open, setOpen]       = useState(false);
  const [toast, setToast]     = useState<Notif | null>(null);
  const { refresh }           = useAdmin();
  const knownIds              = useRef<Set<string>>(new Set());
  const panelRef              = useRef<HTMLDivElement>(null);
  const initialized           = useRef(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res  = await fetch('/api/orders');
        const data = await res.json();

        if (!initialized.current) {
          // First load — just record existing IDs, don't notify
          data.forEach((o: any) => knownIds.current.add(o.id));
          initialized.current = true;
          return;
        }

        // Find new orders not seen before
        const newOrders = data.filter((o: any) => !knownIds.current.has(o.id));
        if (newOrders.length === 0) return;

        newOrders.forEach((o: any) => knownIds.current.add(o.id));

        const newNotifs: Notif[] = newOrders.map((o: any) => ({
          id: o.id,
          customer: `${o.customer.firstName} ${o.customer.lastName}`,
          total: o.total,
          city: o.customer.city,
          wilaya: o.customer.wilaya,
          createdAt: o.createdAt,
        }));

        setNotifs(prev => [...newNotifs, ...prev].slice(0, 20));
        setUnread(prev => prev + newNotifs.length);
        setToast(newNotifs[0]);
        refresh();
        setTimeout(() => setToast(null), 5000);

        // Play notification chime
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const play = (freq: number, start: number, dur: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, ctx.currentTime + start);
            gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + dur);
          };
          play(880, 0,    0.18);
          play(1100, 0.18, 0.18);
          play(1320, 0.36, 0.3);
        } catch {}
      } catch {}
    };

    check();
    const interval = setInterval(check, 8000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <>
      {/* Bell */}
      <div ref={panelRef} style={{ position: 'relative' }}>
        <button onClick={() => { setOpen(o => !o); setUnread(0); }}
          style={{ position: 'relative', background: 'none', border: '1px solid var(--border)', padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: unread > 0 ? 'var(--accent)' : 'var(--muted)', transition: 'all .2s' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          {unread > 0 && (
            <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', background: 'var(--accent)', borderRadius: '50%', fontSize: '12px', fontWeight: 700, color: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '300px', maxHeight: '380px', background: 'var(--surface)', border: '1px solid var(--border)', zIndex: 100, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.6)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '12px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--accent)' }}>Notifications</p>
              {notifs.length > 0 && (
                <button onClick={() => setNotifs([])} style={{ fontSize: '11px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '.1em', textTransform: 'uppercase' }}>Effacer</button>
              )}
            </div>
            {notifs.length === 0 ? (
              <p style={{ padding: '24px', textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>Aucune notification</p>
            ) : notifs.map(n => (
              <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #111', display: 'flex', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '.88rem', color: 'var(--foreground)', marginBottom: '2px' }}>Nouvelle commande 🎉</p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '2px' }}>{n.customer} · {n.city}, {n.wilaya}</p>
                  <p style={{ fontSize: '11px', color: 'var(--accent)' }}>{fmt(n.total)}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{new Date(n.createdAt).toLocaleTimeString('fr-TN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, background: 'var(--surface)', border: '1px solid var(--accent)', padding: '16px 20px', width: '300px', boxShadow: '0 0 32px rgba(201,169,110,.2)', animation: 'slideIn .4s ease' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '20px' }}>🛍️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '.88rem', color: 'var(--accent)', marginBottom: '4px' }}>Nouvelle commande !</p>
              <p style={{ fontSize: '11px', color: 'var(--foreground)', marginBottom: '2px' }}>{toast.customer}</p>
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{toast.city}, {toast.wilaya}</p>
              <p style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-serif)' }}>{fmt(toast.total)}</p>
            </div>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>×</button>
          </div>
          <div style={{ height: '2px', background: 'var(--border)', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--accent)', animation: 'shrink 5s linear forwards' }} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes shrink  { from { width:100%; } to { width:0%; } }
      `}</style>
    </>
  );
}
