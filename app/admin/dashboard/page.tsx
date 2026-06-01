'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../context/AdminContext';
import AdminStats from './components/AdminStats';
import AdminOrders from './components/AdminOrders';
import AdminArticles from './components/AdminArticles';

type Tab = 'stats' | 'orders' | 'articles';

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('stats');
  const [ready, setReady] = useState(false);
  const { orders, articles } = useAdmin();

  useEffect(() => {
    if (localStorage.getItem('gh_admin') !== '1') {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, [router]);

  const logout = () => { localStorage.removeItem('gh_admin'); router.replace('/admin/login'); };

  if (!ready) return <div style={{ minHeight: '100vh', background: '#0a0a0a' }} />;

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: "'Montserrat', system-ui, sans-serif", display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{ width: '220px', flexShrink: 0, background: '#0d0d0d', borderRight: '1px solid #1a1a14', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        {/* Brand */}
        <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid #1a1a14' }}>
          <p style={{ fontSize: '7px', letterSpacing: '.5em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '6px' }}>Admin</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: '1.3rem', color: '#f5f0eb', letterSpacing: '.06em' }}>GH Design</h2>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 12px' }}>
          {([
            { id: 'stats', label: 'Tableau de bord', icon: <IconStats /> },
            { id: 'orders', label: 'Commandes', icon: <IconOrders />, badge: pendingCount },
            { id: 'articles', label: 'Articles', icon: <IconArticles /> },
          ] as { id: Tab; label: string; icon: React.ReactNode; badge?: number }[]).map(item => (
            <button key={item.id} onClick={() => setTab(item.id as Tab)}
              style={{
                width: '100%', padding: '11px 14px', marginBottom: '4px',
                background: tab === item.id ? 'rgba(201,169,110,.1)' : 'none',
                border: tab === item.id ? '1px solid rgba(201,169,110,.2)' : '1px solid transparent',
                color: tab === item.id ? '#c9a96e' : '#6b6560',
                display: 'flex', alignItems: 'center', gap: '10px',
                fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit', textAlign: 'left',
              }}>
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge ? (
                <span style={{ background: '#c9a96e', color: '#0a0a0a', fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1a1a14' }}>
          <a href="/" target="_blank"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', color: '#6b6560', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '4px' }}>
            <IconShop /> Voir la boutique
          </a>
          <button onClick={logout}
            style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#6b6560', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'inherit' }}>
            <IconLogout /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #1a1a14', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0d0d0d', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: '1.5rem', color: '#f5f0eb' }}>
              {tab === 'stats' ? 'Tableau de bord' : tab === 'orders' ? 'Commandes' : 'Articles'}
            </h1>
            <p style={{ fontSize: '10px', color: '#6b6560', marginTop: '2px' }}>
              {new Date().toLocaleDateString('fr-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade8066' }} />
            <span style={{ fontSize: '10px', color: '#6b6560', letterSpacing: '.1em' }}>En ligne</span>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          {tab === 'stats' && <AdminStats onNavigate={setTab} />}
          {tab === 'orders' && <AdminOrders />}
          {tab === 'articles' && <AdminArticles />}
        </div>
      </main>
    </div>
  );
}

function IconStats() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IconOrders() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
}
function IconArticles() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
}
function IconShop() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
}
function IconLogout() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
