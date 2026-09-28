import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './QuoteDrawer.module.css';

const QuoteDrawer = ({ onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0 || !name.trim() || !phone.trim()) return;

    setSubmitting(true);

    let message = `Quote request from ${name.trim()}`;
    if (company.trim()) message += ` (${company.trim()})`;
    message += `\nPhone: ${phone.trim()}\n\nItems:\n`;

    cartItems.forEach((item, index) => {
      const sku = item.sku ? ` [${item.sku}]` : '';
      message += `${index + 1}. ${item.name || `Product #${item.id}`}${sku} × ${item.quantity || 1}\n`;
    });

    const whatsappUrl = `https://wa.me/254721247356?text=${encodeURIComponent(message)}`;
    clearCart();
    window.open(whatsappUrl, '_blank');
    setSubmitting(false);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Quote list</p>
            <h2 id="quote-drawer-title" className={styles.title}>
              Your quote list
            </h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close quote list">
            ×
          </button>
        </header>

        <div className={styles.body}>
          {cartItems.length === 0 ? (
            <p className={styles.empty}>Your quote list is empty. Browse the catalogue and add products.</p>
          ) : (
            <ul className={styles.list}>
              {cartItems.map((item) => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemMain}>
                    <p className={styles.itemMeta}>
                      {[item.brand, item.sku].filter(Boolean).join(' · ') || '—'}
                    </p>
                    <p className={styles.itemName}>{item.name || `Product #${item.id}`}</p>
                    <div className={styles.qtyRow}>
                      <label htmlFor={`qty-${item.id}`} className={styles.qtyLabel}>
                        Qty
                      </label>
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min={1}
                        className={styles.qtyInput}
                        value={item.quantity || 1}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10);
                          if (!Number.isNaN(n)) updateQuantity(item.id, n);
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {cartItems.length > 0 && (
            <form className={styles.form} onSubmit={handleSubmit}>
              <p className={styles.formIntro}>Send this list and we will respond with pricing.</p>
              <div className="field">
                <label htmlFor="quote-name">Name</label>
                <input
                  id="quote-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="field">
                <label htmlFor="quote-company">Company</label>
                <input
                  id="quote-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                />
              </div>
              <div className="field">
                <label htmlFor="quote-phone">Phone</label>
                <input
                  id="quote-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                />
              </div>
              <button
                type="submit"
                className={`btn btn--primary ${styles.submit}`}
                disabled={submitting}
              >
                Send quote request
                <span className="btn__arrow" aria-hidden="true">→</span>
              </button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
};

export default QuoteDrawer;
