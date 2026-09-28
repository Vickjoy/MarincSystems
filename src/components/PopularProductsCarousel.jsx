import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPopularProducts } from '../utils/api';
import styles from './PopularProductsCarousel.module.css';

const AUTOPLAY_MS = 4000;
const RESUME_MS = 10000;

const PopularProductsCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);
  const resumeTimer = useRef(null);
  const mounted = useRef(true);
  const navigate = useNavigate();

  const loadProducts = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchPopularProducts({ force });
      if (!mounted.current) return;
      setProducts(list);
      setCurrentIndex(0);
    } catch (err) {
      if (!mounted.current) return;
      console.error('Error fetching popular products:', err);
      setError(err.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  // Initial fetch (shared/cached in api.js, so StrictMode double-mount costs one request)
  useEffect(() => {
    mounted.current = true;
    loadProducts();
    return () => {
      mounted.current = false;
    };
  }, [loadProducts]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || products.length < 2) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
    }, AUTOPLAY_MS);

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length]);

  // Clear pending "resume autoplay" timer on unmount
  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  // Pause autoplay after user interaction, resume later (one timer only)
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setIsAutoPlaying(true), RESUME_MS);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    pauseAutoPlay();
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
    pauseAutoPlay();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
    pauseAutoPlay();
  };

  const handleProductClick = (productSlug) => {
    navigate(`/product/${productSlug}`);
  };

  if (loading) {
    return (
      <section className={styles.carouselSection}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading popular products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.carouselSection}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>Unable to load popular products: {error}</p>
            <button onClick={() => loadProducts(true)} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className={styles.carouselSection}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>No popular products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.carouselSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Popular Products</h2>
        </div>

        <div className={styles.carouselWrapper} ref={carouselRef}>
          {/* Navigation Arrows */}
          <button
            className={`${styles.navButton} ${styles.navButtonLeft}`}
            onClick={goToPrevious}
            aria-label="Previous product"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            className={`${styles.navButton} ${styles.navButtonRight}`}
            onClick={goToNext}
            aria-label="Next product"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Carousel Track */}
          <div
            className={styles.carouselTrack}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {products.map((product) => (
              <div key={product.id} className={styles.carouselSlide}>
                <div
                  className={styles.productCard}
                  onClick={() => handleProductClick(product.slug)}
                >
                  <div className={styles.imageWrapper}>
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className={styles.productImage}
                      onError={(e) => {
                        // Prevent an infinite onError loop if the placeholder is also missing
                        e.target.onerror = null;
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    <div className={styles.popularBadge}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Popular
                    </div>
                  </div>

                  <div className={styles.productContent}>
                    {product.brand && (
                      <span className={styles.brand}>{product.brand}</span>
                    )}
                    <h3 className={styles.productName}>{product.name}</h3>

                    {product.price && !product.price_requires_login && (
                      <div className={styles.price}>
                        KES {Number(product.price).toLocaleString('en-KE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    )}

                    {product.price_requires_login && (
                      <div className={styles.priceHidden}>
                        Login to view price
                      </div>
                    )}

                    <button className={styles.viewButton}>
                      View Product
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Navigation */}
          <div className={styles.dotsContainer}>
            {products.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularProductsCarousel;