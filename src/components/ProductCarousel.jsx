import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getZoneFromType } from '../utils/zones';
import styles from './ProductCarousel.module.css';

const getVisibleCount = () => {
  if (typeof window === 'undefined') return 4;
  if (window.innerWidth >= 1200) return 4;
  if (window.innerWidth >= 768) return 3;
  if (window.innerWidth >= 480) return 2;
  return 1;
};

const ProductCarousel = ({ productSlug }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  useEffect(() => {
    if (!productSlug) return undefined;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/products/${productSlug}/related/`);
        if (!response.ok) throw new Error('Failed to fetch related products');
        const data = await response.json();
        if (cancelled) return;
        setRelatedProducts(Array.isArray(data) ? data : data.results || []);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error fetching related products:', error);
        if (!cancelled) setRelatedProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [productSlug]);

  // Resize: update the count, then clamp the index in the same pass
  useEffect(() => {
    const onResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const maxIndex = Math.max(0, relatedProducts.length - visibleCount);
  const safeIndex = Math.min(currentIndex, maxIndex);

  const prev = useCallback(() => setCurrentIndex((i) => Math.max(0, Math.min(i, maxIndex) - 1)), [maxIndex]);
  const next = useCallback(() => setCurrentIndex((i) => Math.min(maxIndex, i + 1)), [maxIndex]);

  // Arrow keys only while focus is inside the carousel (not hijacked page-wide)
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  if (loading) {
    return (
      <div className={styles.carouselContainer}>
        <h2 className={styles.title}>Related products</h2>
        <div className={styles.loading} role="status">Loading related products…</div>
      </div>
    );
  }

  if (relatedProducts.length === 0) return null;

  return (
    <div className={styles.carouselContainer}>
      <h2 className={styles.title}>Related products</h2>

      <div
        className={styles.carouselWrapper}
        role="region"
        aria-roledescription="carousel"
        aria-label="Related products"
        onKeyDown={handleKeyDown}
      >
        {safeIndex > 0 && (
          <button type="button" className={`${styles.navButton} ${styles.navButtonPrev}`}
            onClick={prev} aria-label="Previous products">
            &#8249;
          </button>
        )}

        <div className={styles.carouselTrack}>
          <div
            className={styles.carouselInner}
            style={{ transform: `translateX(-${safeIndex * (100 / visibleCount)}%)` }}
          >
            {relatedProducts.map((product, i) => {
              const zone = getZoneFromType(
                product.category_type || product.category?.type || product.type
              );
              const inView = i >= safeIndex && i < safeIndex + visibleCount;
              return (
                <div
                  key={product.id}
                  className={styles.productCard}
                  style={{ flex: `0 0 ${100 / visibleCount}%` }}
                  aria-hidden={!inView}
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className={styles.cardLink}
                    style={{ '--zone-color': zone.color }}
                    tabIndex={inView ? 0 : -1}
                  >
                    <div className={styles.imageWrapper}>
                      <img
                        src={product.image || '/placeholder.png'}
                        alt=""
                        className={styles.productImage}
                        loading="lazy"
                        width={400}
                        height={300}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                      />
                    </div>
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{product.name}</h3>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {safeIndex < maxIndex && (
          <button type="button" className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={next} aria-label="Next products">
            &#8250;
          </button>
        )}
      </div>

      {maxIndex > 0 && (
        <div className={styles.indicators}>
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.indicator} ${idx === safeIndex ? styles.indicatorActive : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === safeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;