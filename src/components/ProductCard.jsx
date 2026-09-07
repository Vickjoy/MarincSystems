import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onDelete }) => {
  const { user, token } = useAuth();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${product.id}/`, {
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
    
    const link = e.currentTarget;
    link.textContent = 'Added';
    
    setTimeout(() => {
      link.textContent = 'Add to Cart';
    }, 1000);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleKeyDown = (e) => {
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
        
        <div className={styles.stockStatus}>
          In Stock
        </div>
        
        <a
          href="#"
          className={styles.addToCartLink}
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </a>
      </div>
    </div>
  );
};

export default ProductCard;