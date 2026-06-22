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

  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [logoutAllResult, setLogoutAllResult] = useState<string | null>(null);

  const handleLogoutAll = async () => {
    const username = localStorage.getItem('gh_admin_user');
    if (!username) {
      setLogoutAllResult('Session expirée, veuillez vous reconnecter');
      setConfirmLogoutAll(false);
      return;
    }
    setLogoutAllLoading(true);
    setLogoutAllResult(null);
    try {
      const res = await fetch('/api/auth/force-logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        setLogoutAllResult('Tous les autres comptes ont été déconnectés');
      } else {
        setLogoutAllResult(data.error || 'Erreur lors de la déconnexion');
      }
    } catch {
      setLogoutAllResult('Erreur de connexion');
    } finally {
      setLogoutAllLoading(false);
      setConfirmLogoutAll(false);
    }
  };

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

      <div style={{ height: '1px', background: 'var(--border)', margin: '36px 0 28px' }} />

      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>
        Sécurité
      </p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        Déconnecte instantanément tous les autres comptes administrateurs (sur tous les appareils). Votre session actuelle reste active.
      </p>

      {!confirmLogoutAll ? (
        <button type="button" onClick={() => setConfirmLogoutAll(true)}
          style={{ padding: '12px 24px', background: 'none', border: '1px solid #c05050', color: '#e07070', fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Déconnecter tous les autres comptes
        </button>
      ) : (
        <div style={{ padding: '14px 16px', background: 'rgba(192,80,80,.08)', border: '1px solid #c05050' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '.85rem', color: 'var(--foreground)', marginBottom: '12px' }}>
            Confirmer la déconnexion de tous les autres comptes ?
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={handleLogoutAll} disabled={logoutAllLoading}
              style={{ padding: '10px 18px', background: '#7f1d1d', border: '1px solid #c05050', color: '#fca5a5', fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase', cursor: logoutAllLoading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: logoutAllLoading ? 0.6 : 1 }}>
              {logoutAllLoading ? 'Déconnexion…' : 'Oui, déconnecter'}
            </button>
            <button type="button" onClick={() => setConfirmLogoutAll(false)} disabled={logoutAllLoading}
              style={{ padding: '10px 18px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {logoutAllResult && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: logoutAllResult.includes('Erreur') || logoutAllResult.includes('expirée') ? '#e07070' : '#4ade80', marginTop: '12px' }}>
          {logoutAllResult}
        </p>
      )}
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
