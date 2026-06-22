'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ user: '', pass: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('gh_admin') === '1') {
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
        const data = await res.json();
        localStorage.setItem('gh_admin', '1');
        localStorage.setItem('gh_admin_role', data.role || 'admin');
        localStorage.setItem('gh_admin_user', form.user.trim());
        localStorage.setItem('gh_admin_session', String(data.sessionVersion || 0));
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
          <p style={{ fontSize: '12px', letterSpacing: '.52em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>Administration</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '2.2rem', color: 'var(--foreground)', letterSpacing: '.08em' }}>GH Design</h1>
          <div style={{ width: '40px', height: '1px', background: 'var(--accent)', margin: '16px auto 0' }} />
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Identifiant</label>
            <input
              value={form.user} onChange={e => { setForm(p => ({ ...p, user: e.target.value })); setError(''); }}
              placeholder="admin"
              style={{ width: '100%', padding: '13px 16px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '.88rem', outline: 'none', fontFamily: 'inherit', borderRadius: 0 }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={form.pass} onChange={e => { setForm(p => ({ ...p, pass: e.target.value })); setError(''); }}
                placeholder="••••••••"
                style={{ width: '100%', padding: '13px 44px 13px 16px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '.88rem', outline: 'none', fontFamily: 'inherit', borderRadius: 0 }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#e07070', marginBottom: '16px', textAlign: 'center' }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(201,169,110,.3)' : 'var(--accent)',
              border: 'none', color: 'var(--background)',
              fontSize: '12px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 700,
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

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}
