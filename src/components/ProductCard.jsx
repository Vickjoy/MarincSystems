import { API_BASE_URL } from '../config/api';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StatusLED from './StatusLED';
import { getZoneFromType } from '../utils/zones';

/**
 * DatasheetTile — product tile for catalogue and rails.
 * Keeps ProductCard export name for existing imports.
 *
 * No prices are shown anywhere on the tile: customers add items to the quote
 * list and ask for prices on WhatsApp.
 */
const ProductCard = ({ product, onDelete, zoneType }) => {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const zone = getZoneFromType(
    zoneType || product?.category_type || product?.category?.type || product?.type
  );

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        if (onDelete) onDelete(product.id);
      } else {
        alert('Failed to delete product.');
      }
    } catch {
      alert('Error deleting product.');
    }
  };

  const handleAddToQuote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1000);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/placeholder.png';
  };

  const brandSku = [product.brand, product.sku].filter(Boolean).join(' · ');

  return (
    <article
      className={styles.tile}
      style={{ '--zone-color': zone.color }}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="link"
      aria-label={`View details for ${product.name}`}
    >
      <div className={styles.zoneRule} aria-hidden="true" />
      <div className={styles.imagePanel}>
        <img
          src={product.image || '/placeholder.png'}
          alt={product.name}
          className={styles.image}
          loading="lazy"
          width={600}
          height={450}
          onError={handleImageError}
        />
      </div>
      <div className={styles.body}>
        {brandSku && <p className={styles.meta}>{brandSku}</p>}
        <h3 className={styles.name}>{product.name}</h3>

        <StatusLED status="in_stock" className={styles.stock} />

        <button
          type="button"
          className={styles.addBtn}
          onClick={handleAddToQuote}
          aria-label={`Add ${product.name} to quote`}
        >
          <span>{added ? 'Added' : 'Add to quote'}</span>
          <span className={styles.addGlyph} aria-hidden="true">
            {added ? '→' : '+'}
          </span>
        </button>

        {token && onDelete && (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
export { ProductCard as DatasheetTile };