import { API_BASE_URL } from '../config/api';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCartPlus, FaCheck } from 'react-icons/fa';
import styles from './ProductCard.module.css';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onDelete }) => {
  const { user, token } = useAuth();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  // "Added" feedback lives in state now (was: mutating the DOM node's textContent)
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);
  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        if (onDelete) onDelete(product.id);
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      alert('Error deleting product.');
    }
  };

  const handleAddToCart = (e) => {
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
    // Ignore keys pressed on the inner "Add to cart" button so Enter/Space
    // there doesn't also navigate away from the listing.
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

  return (
    <div
      className={styles.card}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={`View details for ${product.name}`}
    >
      <div className={styles.imageWrapper}>
        <img
          src={product.image || '/placeholder.png'}
          alt={product.name}
          className={styles.image}
          loading="lazy"
          onError={handleImageError}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>

        {product.price && (
          <div className={styles.price}>
            KES {Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </div>
        )}

        <span className={`badge badge--success ${styles.stockStatus}`}>In stock</span>

        <button
          type="button"
          className={`btn btn--primary ${styles.addToCartBtn}`}
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? <FaCheck aria-hidden="true" /> : <FaCartPlus aria-hidden="true" />}
          {added ? 'Added' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;