'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../context/AdminContext';
import AdminStats from './components/AdminStats';
import AdminOrders from './components/AdminOrders';
import AdminArticles from './components/AdminArticles';
import AdminNotifications from './components/AdminNotifications';
import AdminSettings from './components/AdminSettings';

type Tab = 'stats' | 'orders' | 'articles' | 'settings';

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('stats');
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  const { orders, articles } = useAdmin();

  const logout = () => {
    localStorage.removeItem('gh_admin');
    localStorage.removeItem('gh_admin_role');
    localStorage.removeItem('gh_admin_user');
    localStorage.removeItem('gh_admin_session');
    router.replace('/admin/login');
  };

  useEffect(() => {
    if (localStorage.getItem('gh_admin') !== '1') {
      router.replace('/admin/login');
      return;
    }
    setIsViewer(localStorage.getItem('gh_admin_role') === 'viewer');
    setReady(true);

    const checkSession = async () => {
      const username = localStorage.getItem('gh_admin_user');
      const localVersion = localStorage.getItem('gh_admin_session');
      if (!username) return;
      try {
        const res = await fetch(`/api/auth?username=${encodeURIComponent(username)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (String(data.sessionVersion ?? 0) !== (localVersion ?? '0')) {
          logout();
        }
      } catch { /* network hiccup — ignore, retry next interval */ }
    };

    checkSession();
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!ready) return <div style={{ minHeight: '100vh', background: 'var(--background)' }} />;

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const navItems = [
    { id: 'stats' as Tab,    label: 'Dashboard',  icon: <IconStats /> },
    { id: 'orders' as Tab,   label: 'Commandes',  icon: <IconOrders />,   badge: pendingCount },
    { id: 'articles' as Tab, label: 'Articles',   icon: <IconArticles /> },
    { id: 'settings' as Tab, label: 'Paramètres', icon: <IconSettings /> },
  ];

  const tabLabel = tab === 'stats' ? 'Tableau de bord' : tab === 'orders' ? 'Commandes' : tab === 'articles' ? 'Articles' : 'Paramètres';

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          main { margin-left: 0 !important; }
          .bottom-nav { display: flex !important; }
          .main-pad { padding: 16px !important; padding-bottom: 80px !important; }
          .topbar-pad { padding: 14px 16px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-bottom { grid-template-columns: 1fr !important; }
          .orders-detail { display: none !important; }
          .orders-grid { grid-template-columns: 1fr !important; }
          .summary-panel { display: none !important; }
        }
        @media (min-width: 769px) {
          .bottom-nav { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--background)', fontFamily: "'Montserrat', system-ui, sans-serif", display: 'flex' }}>

        {/* Sidebar — desktop only */}
        <aside className="sidebar" style={{ width: '220px', flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 20 }}>
          <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '11px', letterSpacing: '.5em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '6px' }}>Admin</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--foreground)', letterSpacing: '.06em', marginBottom: '14px' }}>GH Design</h2>
            <div style={{ padding: '10px 12px', background: 'rgba(201,169,110,.06)', border: '1px solid rgba(201,169,110,.15)' }}>
              <p style={{ fontSize: '11px', color: 'var(--foreground)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>Bonjour Ghada ☀️😊</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px', fontFamily: 'inherit' }}>Bonne journée !</p>
            </div>
          </div>
          <nav style={{ flex: 1, padding: '20px 12px' }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                style={{
                  width: '100%', padding: '11px 14px', marginBottom: '4px',
                  background: tab === item.id ? 'rgba(201,169,110,.1)' : 'none',
                  border: tab === item.id ? '1px solid rgba(201,169,110,.2)' : '1px solid transparent',
                  color: tab === item.id ? 'var(--accent)' : 'var(--muted)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit', textAlign: 'left',
                }}>
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge ? <span style={{ background: 'var(--accent)', color: 'var(--background)', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>{item.badge}</span> : null}
              </button>
            ))}
          </nav>
          <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
            <a href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', color: 'var(--muted)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '4px' }}>
              <IconShop /> Voir la boutique
            </a>
            <button onClick={logout} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'inherit' }}>
              <IconLogout /> Déconnexion
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, marginLeft: '220px' }}>
          {/* Top bar */}
          <div className="topbar-pad" style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--foreground)' }}>{tabLabel}</h1>
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                {new Date().toLocaleDateString('fr-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade8066' }} />
              <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '.1em' }}>En ligne</span>
              <AdminNotifications />
              {/* Mobile logout */}
              <button onClick={logout} className="mobile-logout" style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'inherit' }}>
                <IconLogout />
              </button>
            </div>
          </div>

          <div className="main-pad" style={{ padding: '32px' }}>
            {tab === 'stats'    && <AdminStats onNavigate={setTab} isViewer={isViewer} />}
            {tab === 'orders'   && <AdminOrders isViewer={isViewer} />}
            {tab === 'articles' && <AdminArticles />}
            {tab === 'settings' && <AdminSettings />}
          </div>
        </main>

        {/* Bottom nav — mobile only */}
        <nav className="bottom-nav" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          display: 'none', alignItems: 'center', justifyContent: 'space-around',
          padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
                color: tab === item.id ? 'var(--accent)' : 'var(--muted)',
                transition: 'color .2s', fontFamily: 'inherit', position: 'relative',
              }}>
              {item.icon}
              <span style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase' }}>{item.label}</span>
              {item.badge ? (
                <span style={{ position: 'absolute', top: '2px', right: '20%', background: 'var(--accent)', color: 'var(--background)', fontSize: '11px', fontWeight: 700, padding: '1px 5px', borderRadius: '10px' }}>{item.badge}</span>
              ) : null}
            </button>
          ))}
          <a href="/" target="_blank"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--muted)', textDecoration: 'none', padding: '6px 0' }}>
            <IconShop />
            <span style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase' }}>Boutique</span>
          </a>
        </nav>
      </div>
    </>
  );
}

function IconStats() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function IconOrders() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>; }
function IconArticles() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>; }
function IconShop() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>; }
function IconLogout() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function IconSettings() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
