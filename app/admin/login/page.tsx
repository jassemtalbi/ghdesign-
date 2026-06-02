'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ user: '', pass: '' });
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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Montserrat', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '.52em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '10px' }}>Administration</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: '2.4rem', color: '#f5f0eb', letterSpacing: '.08em' }}>GH Design</h1>
          <div style={{ width: '40px', height: '1px', background: '#c9a96e', margin: '16px auto 0' }} />
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '8px' }}>Identifiant</label>
            <input
              value={form.user} onChange={e => { setForm(p => ({ ...p, user: e.target.value })); setError(''); }}
              placeholder="admin"
              style={{ width: '100%', padding: '13px 16px', background: '#111', border: '1px solid #222018', color: '#f5f0eb', fontSize: '.9rem', outline: 'none', fontFamily: 'inherit', borderRadius: 0 }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '8px' }}>Mot de passe</label>
            <input
              type="password" value={form.pass} onChange={e => { setForm(p => ({ ...p, pass: e.target.value })); setError(''); }}
              placeholder="••••••••"
              style={{ width: '100%', padding: '13px 16px', background: '#111', border: '1px solid #222018', color: '#f5f0eb', fontSize: '.9rem', outline: 'none', fontFamily: 'inherit', borderRadius: 0 }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#e07070', marginBottom: '16px', textAlign: 'center' }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(201,169,110,.3)' : '#c9a96e',
              border: 'none', color: '#0a0a0a',
              fontSize: '9px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer', transition: 'all .3s',
            }}>
            {loading ? '...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: '#333' }}>
          <a href="/" style={{ color: '#6b6560', textDecoration: 'none' }}>← Retour à la boutique</a>
        </p>
      </div>
    </div>
  );
}
