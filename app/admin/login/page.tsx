'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ user: '', pass: '' });

  useEffect(() => {
    if (localStorage.getItem('gh_admin') === '1') {
      router.replace('/admin/dashboard');
    }
  }, [router]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.user, password: form.pass }),
      });
      if (res.ok) {
        localStorage.setItem('gh_admin', '1');
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Identifiants incorrects');
        setLoading(false);
      }
    } catch {
      setError('Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Montserrat', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '.52em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>Administration</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2.4rem', color: 'var(--foreground)', letterSpacing: '.08em' }}>GH Design</h1>
          <div style={{ width: '40px', height: '1px', background: 'var(--accent)', margin: '16px auto 0' }} />
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Identifiant</label>
            <input
              value={form.user} onChange={e => { setForm(p => ({ ...p, user: e.target.value })); setError(''); }}
              placeholder="admin"
              style={{ width: '100%', padding: '13px 16px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '.9rem', outline: 'none', fontFamily: 'inherit', borderRadius: 0 }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Mot de passe</label>
            <input
              type="password" value={form.pass} onChange={e => { setForm(p => ({ ...p, pass: e.target.value })); setError(''); }}
              placeholder="••••••••"
              style={{ width: '100%', padding: '13px 16px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '.9rem', outline: 'none', fontFamily: 'inherit', borderRadius: 0 }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#e07070', marginBottom: '16px', textAlign: 'center' }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(201,169,110,.3)' : 'var(--accent)',
              border: 'none', color: 'var(--background)',
              fontSize: '9px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer', transition: 'all .3s',
            }}>
            {loading ? '...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: 'var(--muted)' }}>
          <a href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Retour à la boutique</a>
        </p>
      </div>
    </div>
  );
}
