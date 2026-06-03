'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';

type Step = 'form' | 'confirm';

const WILAYAS = [
  'Tunis','Ariana','Ben Arous','Manouba','Nabeul','Zaghouan','Bizerte','Béja',
  'Jendouba','Kef','Siliana','Sousse','Monastir','Mahdia','Sfax','Kairouan',
  'Kasserine','Sidi Bouzid','Gabès','Médenine','Tataouine','Gafsa','Tozeur','Kébili',
];

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ',') + ' TND';

export default function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, setCartOpen } = useCart();
  const { addOrder, articles } = useAdmin();

  const subtotal = items.reduce((s, it) => s + it.priceNum * it.qty, 0);
  const delivery  = subtotal >= 100000 ? 0 : 8000;
  const grandTotal = subtotal + delivery;

  const [step, setStep] = useState<Step>('form');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', city: '', wilaya: '', notes: '',
  });

  // per-item size/color selections (keyed by cartKey)
  const [itemSelections, setItemSelections] = useState<Record<string, { size: string; color: string }>>(() => {
    const init: Record<string, { size: string; color: string }> = {};
    items.forEach(it => { init[it.cartKey] = { size: it.size || '', color: it.color || '' }; });
    return init;
  });

  if (!open) return null;

  const getSel = (cartKey: string) => itemSelections[cartKey] || { size: '', color: '' };
  const setSel = (cartKey: string, key: 'size' | 'color', val: string) =>
    setItemSelections(prev => ({ ...prev, [cartKey]: { ...getSel(cartKey), [key]: val } }));

  // find article data for an item (to get available sizes/colors)
  const getArticle = (id: string) => articles.find(a => a.id === id);

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

  const handleSubmit = async () => {
    if (!validate()) return;
    await addOrder({
      customer: form,
      items: items.map(it => {
        const sel = getSel(it.cartKey);
        return { id: it.id, name: it.name, category: it.category, price: it.price, priceNum: it.priceNum, qty: it.qty, image: it.image, size: sel.size || undefined, color: sel.color || undefined };
      }),
      subtotal, delivery, total: grandTotal,
    });
    setStep('confirm');
  };

  const handleClose = () => {
    setStep('form');
    setErrors({});
    onClose();
  };

  return (
    <>
      <div onClick={handleClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)' }} />

      <div style={{
        position: 'fixed', zIndex: 81, top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'min(980px, 96vw)', height: 'min(90vh, 780px)',
        background: '#0d0d0d', border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#0d0d0d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', rowGap: '8px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '1.5rem', color: 'var(--foreground)', lineHeight: 1 }}>
              {step === 'form' ? 'Passer la commande' : 'Commande confirmée'}
            </h2>
            {step === 'form' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, color: '#0a0a0a' }}>1</div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--foreground)' }}>Informations</span>
                </div>
                <div style={{ width: '28px', height: '1px', background: 'var(--border)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, color: 'var(--muted)' }}>2</div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>Récapitulatif</span>
                </div>
              </div>
            )}
          </div>
          <button onClick={handleClose} className="close-modal"
            style={{ background: 'none', border: '1px solid var(--border)', cursor: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all .3s', flexShrink: 0, padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        {step === 'form' ? (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

            {/* LEFT — form */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
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
                      placeholder="Instructions spéciales..." rows={2}
                      style={{ ...inp(false), resize: 'none', lineHeight: 1.6 }} />
                  </Field>
                </div>

                {/* Size & Color per item */}
                {items.some(it => { const a = getArticle(it.id); return (a?.sizes?.length ?? 0) > 0 || (a?.colors?.length ?? 0) > 0; }) && (
                  <div style={{ marginBottom: '16px' }}>
                    <SectionTitle>Taille & Couleur</SectionTitle>
                    {items.map(item => {
                      const article = getArticle(item.id);
                      const sel = getSel(item.cartKey);
                      const hasSizes = (article?.sizes?.length ?? 0) > 0;
                      const hasColors = (article?.colors?.length ?? 0) > 0;
                      if (!hasSizes && !hasColors) return null;
                      return (
                        <div key={item.cartKey} style={{ marginBottom: '14px', padding: '12px 14px', background: '#111', border: '1px solid #2a2520' }}>
                          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '.88rem', color: 'var(--foreground)', marginBottom: '10px' }}>{item.name}</p>
                          {hasSizes && (
                            <div style={{ marginBottom: '10px' }}>
                              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '7px', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                                Taille {sel.size && <span style={{ color: 'var(--accent)' }}>· {sel.size}</span>}
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {article!.sizes.map(s => (
                                  <button key={s} type="button" onClick={() => setSel(item.cartKey, 'size', sel.size === s ? '' : s)}
                                    style={{
                                      fontFamily: 'var(--font-sans)', fontSize: '9px', padding: '5px 12px', cursor: 'pointer',
                                      background: sel.size === s ? 'var(--accent)' : 'none',
                                      border: `1px solid ${sel.size === s ? 'var(--accent)' : '#3a3530'}`,
                                      color: sel.size === s ? '#0a0a0a' : '#6b6560',
                                      fontWeight: sel.size === s ? 700 : 400, transition: 'all .2s',
                                    }}>{s}</button>
                                ))}
                              </div>
                            </div>
                          )}
                          {hasColors && (
                            <div>
                              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '7px', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                                Couleur {sel.color && <span style={{ color: 'var(--accent)' }}>· {sel.color}</span>}
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {article!.colors.map(c => (
                                  <button key={c} type="button" onClick={() => setSel(item.cartKey, 'color', sel.color === c ? '' : c)}
                                    style={{
                                      fontFamily: 'var(--font-sans)', fontSize: '9px', padding: '5px 12px', cursor: 'pointer',
                                      background: sel.color === c ? 'rgba(201,169,110,.15)' : 'none',
                                      border: `1px solid ${sel.color === c ? 'var(--accent)' : '#3a3530'}`,
                                      color: sel.color === c ? 'var(--accent)' : '#6b6560',
                                      transition: 'all .2s',
                                    }}>{c}</button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              <div style={{ flexShrink: 0, padding: '16px 28px 20px', borderTop: '1px solid var(--border)', background: '#0d0d0d' }}>
                <button onClick={handleSubmit} className="btn-gold"
                  style={{ width: '100%', padding: '15px', fontSize: '10px', cursor: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none' }}>
                  Confirmer la commande
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            {/* RIGHT — order summary with size/color selectors */}
            <div style={{ width: '300px', flexShrink: 0, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: '#0a0a0a', overflow: 'hidden' }} className="summary-panel">
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.4em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px' }}>Votre commande</p>

                {items.map(item => {
                  const sel = getSel(item.cartKey);
                  return (
                    <div key={item.cartKey} style={{ display: 'flex', gap: '10px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: '50px', height: '64px', flexShrink: 0, position: 'relative', overflow: 'hidden', background: '#1a1208' }}>
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="50px" />
                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 700, color: '#0a0a0a' }}>{item.qty}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '.88rem', color: 'var(--foreground)', marginBottom: '4px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h4>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          {sel.size && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', padding: '1px 6px', border: '1px solid #2a2520', color: '#6b6560' }}>{sel.size}</span>}
                          {sel.color && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', padding: '1px 6px', border: '1px solid rgba(201,169,110,.3)', color: 'var(--accent)' }}>{sel.color}</span>}
                        </div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '.76rem', color: 'var(--accent)' }}>{fmt(item.priceNum * item.qty)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
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
          /* Success screen */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.5rem,4vw,2.2rem)', color: 'var(--foreground)', marginBottom: '10px' }}>
              Commande confirmée !
            </h3>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '.95rem', color: 'var(--accent)', marginBottom: '20px' }}>
              Merci, {form.firstName} {form.lastName}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.9, maxWidth: '400px', marginBottom: '28px' }}>
              Votre commande a été reçue. Livraison à{' '}
              <span style={{ color: 'var(--foreground)' }}>{form.city}, {form.wilaya}</span>.
            </p>

            <div style={{ width: '100%', maxWidth: '380px', padding: '16px 18px', border: '1px solid var(--border)', marginBottom: '28px', textAlign: 'left' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.4em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '12px' }}>Récapitulatif</p>
              {items.map(it => {
                const sel = getSel(it.cartKey);
                return (
                  <div key={it.cartKey} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)' }}>{it.name} × {it.qty}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--foreground)' }}>{fmt(it.priceNum * it.qty)}</span>
                    </div>
                    {(sel.size || sel.color) && (
                      <div style={{ display: 'flex', gap: '5px', marginTop: '3px' }}>
                        {sel.size && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', padding: '1px 6px', border: '1px solid #2a2520', color: '#6b6560' }}>{sel.size}</span>}
                        {sel.color && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', padding: '1px 6px', border: '1px solid rgba(201,169,110,.3)', color: 'var(--accent)' }}>{sel.color}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', marginTop: '4px' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)' }}>Livraison</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: delivery === 0 ? 'var(--accent)' : 'var(--foreground)' }}>{delivery === 0 ? 'Gratuite' : fmt(delivery)}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--accent)' }}>{fmt(grandTotal)}</span>
              </div>
            </div>

            <button onClick={handleClose} className="btn-gold" style={{ cursor: 'none', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Retour à la boutique
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .close-modal:hover { border-color:var(--accent) !important; color:var(--accent) !important; }
        input, textarea, select { background-color: #111 !important; }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #111 inset !important;
          -webkit-text-fill-color: var(--foreground) !important;
          caret-color: var(--foreground) !important;
        }
        input::placeholder, textarea::placeholder { color: #4a4540 !important; }
        select option { background: #111; color: var(--foreground); }
        @media (max-width: 640px) { .summary-panel { display: none !important; } }
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
    width: '100%', padding: '11px 13px', backgroundColor: '#111',
    border: `1px solid ${err ? '#c05050' : '#2a2520'}`, color: '#f5f0eb',
    fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '.85rem',
    outline: 'none', transition: 'border-color .25s', borderRadius: 0,
  };
}

function sel(err: boolean): React.CSSProperties {
  return {
    ...inp(err), appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b6560'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'none',
  };
}
