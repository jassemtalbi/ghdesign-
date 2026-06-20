'use client';
import { useState } from 'react';

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const username = localStorage.getItem('gh_admin_user');
    if (!username) {
      setError('Session expirée, veuillez vous reconnecter');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '20px' }}>
        Changer le mot de passe
      </p>

      <form onSubmit={submit}>
        <Field label="Mot de passe actuel">
          <PasswordInput value={currentPassword} show={showCurrent} onToggle={() => setShowCurrent(v => !v)}
            onChange={v => { setCurrentPassword(v); setError(''); setSuccess(false); }} />
        </Field>
        <Field label="Nouveau mot de passe">
          <PasswordInput value={newPassword} show={showNew} onToggle={() => setShowNew(v => !v)}
            onChange={v => { setNewPassword(v); setError(''); setSuccess(false); }} />
        </Field>
        <Field label="Confirmer le nouveau mot de passe">
          <PasswordInput value={confirmPassword} show={showConfirm} onToggle={() => setShowConfirm(v => !v)}
            onChange={v => { setConfirmPassword(v); setError(''); setSuccess(false); }} />
        </Field>

        {error && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#e07070', marginBottom: '16px' }}>{error}</p>
        )}
        {success && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#4ade80', marginBottom: '16px' }}>Mot de passe mis à jour avec succès</p>
        )}

        <button type="submit" disabled={loading} className="btn-gold"
          style={{ padding: '13px 28px', fontSize: '11px', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function PasswordInput({ value, onChange, show, onToggle }: { value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
        placeholder="••••••••" style={{ ...inp, paddingRight: '44px' }} />
      <button type="button" onClick={onToggle} tabIndex={-1}
        style={{ position: 'absolute', right: '2px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}

const inp: React.CSSProperties = {
  width: '100%', padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)',
  color: 'var(--foreground)', fontSize: '.88rem', fontFamily: 'inherit', outline: 'none', borderRadius: 0,
};
