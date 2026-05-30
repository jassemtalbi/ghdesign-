'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

type Step = 'form' | 'confirm';

const WILAYAS = [
  'Tunis','Ariana','Ben Arous','Manouba','Nabeul','Zaghouan','Bizerte','Béja',
  'Jendouba','Kef','Siliana','Sousse','Monastir','Mahdia','Sfax','Kairouan',
  'Kasserine','Sidi Bouzid','Gabès','Médenine','Tataouine','Gafsa','Tozeur','Kébili',
];

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ',') + ' TND';

export default function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, setCartOpen } = useCart();
  const subtotal = items.reduce((s, it) => s + it.priceNum * it.qty, 0);
  const delivery  = subtotal >= 100000 ? 0 : 8000;
  const grandTotal = subtotal + delivery;

  const [step, setStep]   = useState<Step>('form');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm]   = useState({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', city: '', wilaya: '', notes: '',
  });

  if (!open) return null;

  const set = (k: string, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors(prev => ({ ...prev, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Requis';
    if (!form.lastName.trim())  e.lastName  = 'Requis';
    if (!form.phone.trim())     e.phone     = 'Requis';
    else if (!/^[0-9+\s\-]{8,15}$/.test(form.phone)) e.phone = 'Numéro invalide';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    if (!form.address.trim()) e.address = 'Requis';
    if (!form.city.trim())    e.city    = 'Requis';
    if (!form.wilaya)         e.wilaya  = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => { if (validate()) setStep('confirm'); };

  const handleClose = () => {
    setStep('form');
    setErrors({});
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)',
      }} />

      {/* Modal shell */}
      <div style={{
        position: 'fixed', zIndex: 81,
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 'min(980px, 96vw)',
        height: 'min(90vh, 780px)',
        background: '#0d0d0d',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Header (fixed, never scrolls) ── */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, background: '#0d0d0d',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', rowGap: '8px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '1.5rem', color: 'var(--foreground)', lineHeight: 1 }}>
              {step === 'form' ? 'Passer la commande' : 'Commande confirmée'}
            </h2>

            {step === 'form' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, color: '#0a0a0a' }}>1</div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--foreground)' }}>Informations</span>
                </div>
                <div style={{ width: '28px', height: '1px', background: 'var(--border)' }} />
                {/* Step 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, color: 'var(--muted)' }}>2</div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>Récapitulatif</span>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleClose} className="close-modal"
            style={{ background: 'none', border: '1px solid var(--border)', cursor: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '20px', lineHeight: 1, transition: 'all .3s', flexShrink: 0 }}>
            ×
          </button>
        </div>

        {/* ── Body ── */}
        {step === 'form' ? (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

            {/* LEFT — scrollable form + sticky submit */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
              {/* Scrollable fields */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 12px' }}>

                <SectionTitle>Informations personnelles</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginBottom: '12px' }}>
                  <Field label="Prénom *" error={errors.firstName}>
                    <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Sarra" style={inp(!!errors.firstName)} />
                  </Field>
                  <Field label="Nom *" error={errors.lastName}>
                    <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Ben Ali" style={inp(!!errors.lastName)} />
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginBottom: '24px' }}>
                  <Field label="Téléphone *" error={errors.phone}>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+216 XX XXX XXX" type="tel" style={inp(!!errors.phone)} />
                  </Field>
                  <Field label="Email (optionnel)" error={errors.email}>
                    <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="vous@exemple.com" type="email" style={inp(!!errors.email)} />
                  </Field>
                </div>

                <SectionTitle>Adresse de livraison</SectionTitle>
                <div style={{ marginBottom: '12px' }}>
                  <Field label="Adresse complète *" error={errors.address}>
                    <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Rue, numéro, appartement..." style={inp(!!errors.address)} />
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginBottom: '12px' }}>
                  <Field label="Ville *" error={errors.city}>
                    <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Tunis" style={inp(!!errors.city)} />
                  </Field>
                  <Field label="Gouvernorat *" error={errors.wilaya}>
                    <select value={form.wilaya} onChange={e => set('wilaya', e.target.value)} style={sel(!!errors.wilaya)}>
                      <option value="">Sélectionner...</option>
                      {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </Field>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Field label="Note de commande (optionnel)" error="">
                    <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                      placeholder="Taille, couleur préférée, instructions spéciales..."
                      rows={2} style={{ ...inp(false), resize: 'none', lineHeight: 1.6 }} />
                  </Field>
                </div>

                {/* Delivery info */}
                <div style={{ padding: '12px 14px', background: 'rgba(201,169,110,.06)', border: '1px solid rgba(201,169,110,.18)', marginBottom: '4px' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.9 }}>
                    🚚 <span style={{ color: 'var(--accent)' }}>Livraison gratuite</span> à partir de 100,000 TND &nbsp;·&nbsp;
                    📦 Délai : <span style={{ color: 'var(--foreground)' }}>3–5 jours ouvrables</span> &nbsp;·&nbsp;
                    💳 Paiement à la livraison
                  </p>
                </div>
              </div>

              {/* Sticky submit — always visible */}
              <div style={{ flexShrink: 0, padding: '16px 28px 20px', borderTop: '1px solid var(--border)', background: '#0d0d0d' }}>
                <button onClick={handleSubmit} className="btn-gold"
                  style={{ width: '100%', padding: '15px', fontSize: '10px', cursor: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none' }}>
                  Confirmer la commande
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            {/* RIGHT — order summary panel */}
            <div style={{ width: '280px', flexShrink: 0, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: '#0a0a0a', overflow: 'hidden' }} className="summary-panel">
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.4em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '18px' }}>Votre commande</p>

                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '54px', height: '68px', flexShrink: 0, position: 'relative', overflow: 'hidden', background: '#1a1208' }}>
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="54px" />
                      <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '17px', height: '17px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 700, color: '#0a0a0a' }}>{item.qty}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '.9rem', color: 'var(--foreground)', marginBottom: '3px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h4>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--muted)', marginBottom: '5px' }}>{item.category}</p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '.78rem', color: 'var(--accent)' }}>{fmt(item.priceNum * item.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals — sticky at bottom */}
              <div style={{ flexShrink: 0, padding: '16px 20px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)' }}>Sous-total</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--foreground)' }}>{fmt(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)' }}>Livraison</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: delivery === 0 ? 'var(--accent)' : 'var(--foreground)' }}>
                    {delivery === 0 ? 'Gratuite' : fmt(delivery)}
                  </span>
                </div>
                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '10px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--foreground)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--accent)', fontWeight: 400 }}>{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

        ) : (
          /* ── Success screen ── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center', overflowY: 'auto' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(201,169,110,.1)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.5rem,4vw,2.2rem)', color: 'var(--foreground)', marginBottom: '10px' }}>
              Commande confirmée !
            </h3>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '.95rem', color: 'var(--accent)', marginBottom: '20px' }}>
              Merci, {form.firstName} {form.lastName}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.9, maxWidth: '400px', marginBottom: '28px' }}>
              Votre commande a été reçue. Notre équipe vous contactera au{' '}
              <span style={{ color: 'var(--foreground)' }}>{form.phone}</span>{' '}
              pour confirmer la livraison à{' '}
              <span style={{ color: 'var(--foreground)' }}>{form.city}, {form.wilaya}</span>.<br/>
              Délai estimé : <span style={{ color: 'var(--accent)' }}>3–5 jours ouvrables</span>
            </p>

            {/* Mini receipt */}
            <div style={{ width: '100%', maxWidth: '380px', padding: '16px 18px', border: '1px solid var(--border)', marginBottom: '28px', textAlign: 'left' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.4em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '12px' }}>Récapitulatif</p>
              {items.map(it => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)' }}>{it.name} × {it.qty}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--foreground)' }}>{fmt(it.priceNum * it.qty)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)' }}>Livraison</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: delivery === 0 ? 'var(--accent)' : 'var(--foreground)' }}>
                  {delivery === 0 ? 'Gratuite' : fmt(delivery)}
                </span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--accent)' }}>{fmt(grandTotal)}</span>
              </div>
            </div>

            <button onClick={handleClose} className="btn-gold" style={{ cursor: 'none', fontSize: '10px' }}>
              Retour à la boutique
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .close-modal:hover { border-color:var(--accent) !important; color:var(--accent) !important; }
        input, textarea, select { background-color: #111 !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #111 inset !important;
          -webkit-text-fill-color: var(--foreground) !important;
          caret-color: var(--foreground) !important;
        }
        input::placeholder, textarea::placeholder { color: #4a4540 !important; }
        select option { background: #111; color: var(--foreground); }
        @media (max-width: 640px) {
          .summary-panel { display: none !important; }
        }
      `}</style>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
      <div style={{ width: '3px', height: '14px', background: 'var(--accent)', flexShrink: 0 }} />
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.38em', textTransform: 'uppercase', color: 'var(--accent)' }}>{children}</p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.22em', textTransform: 'uppercase', color: error ? '#e07070' : 'var(--muted)' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: '#e07070', marginTop: '1px' }}>{error}</span>}
    </div>
  );
}

function inp(err: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '11px 13px',
    backgroundColor: '#111',
    border: `1px solid ${err ? '#c05050' : '#2a2520'}`,
    color: '#f5f0eb',
    fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '.85rem',
    outline: 'none', transition: 'border-color .25s',
    borderRadius: 0,
  };
}

function sel(err: boolean): React.CSSProperties {
  return {
    ...inp(err),
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b6560'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    cursor: 'none',
  };
}
