import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPopularProducts } from '../utils/api';
import { getZoneFromType } from '../utils/zones';
import styles from './PopularProductsCarousel.module.css';

const AUTOPLAY_MS = 4000;
const RESUME_MS = 10000;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const PopularProductsCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(() => !prefersReducedMotion());
  const [isHovered, setIsHovered] = useState(false);
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

  useEffect(() => {
    mounted.current = true;
    loadProducts();
    return () => {
      mounted.current = false;
    };
  }, [loadProducts]);

  // Autoplay: stops while hovered/focused and for reduced-motion users
  useEffect(() => {
    if (!isAutoPlaying || isHovered || products.length < 2) return undefined;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, products.length]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  const pauseAutoPlay = () => {
    if (prefersReducedMotion()) return; // never auto-resume for these users
    setIsAutoPlaying(false);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setIsAutoPlaying(true), RESUME_MS);
  };

  const goToSlide = (index) => { setCurrentIndex(index); pauseAutoPlay(); };
  const goToPrevious = () => {
    setCurrentIndex((p) => (p === 0 ? products.length - 1 : p - 1));
    pauseAutoPlay();
  };
  const goToNext = () => {
    setCurrentIndex((p) => (p === products.length - 1 ? 0 : p + 1));
    pauseAutoPlay();
  };

  const open = (slug) => navigate(`/product/${slug}`);

  const shell = (children) => (
    <section className={styles.carouselSection}>
      <div className={styles.container}>{children}</div>
    </section>
  );

  if (loading) {
    return shell(
      <div className={styles.loading} role="status">
        <div className={styles.loadingSpinner} />
        <p>Loading popular products…</p>
      </div>
    );
  }

  if (error) {
    return shell(
      <div className={styles.error}>
        <p>Unable to load popular products.</p>
        <button type="button" onClick={() => loadProducts(true)} className="btn btn--secondary">
          Try again
        </button>
      </div>
    );
  }

  // Nothing to show: hide the section instead of rendering an empty block on the home page
  if (products.length === 0) return null;

  return shell(
    <>
      <div className={styles.header}>
        <span className={`label-mono ${styles.eyebrow}`}>Customer favourites</span>
        <h2 className={styles.title}>Popular products</h2>
      </div>

      <div
        className={styles.carouselWrapper}
        role="region"
        aria-roledescription="carousel"
        aria-label="Popular products"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <button
          type="button"
          className={`${styles.navButton} ${styles.navButtonLeft}`}
          onClick={goToPrevious}
          aria-label="Previous product"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          className={`${styles.navButton} ${styles.navButtonRight}`}
          onClick={goToNext}
          aria-label="Next product"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <div
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          aria-live={isAutoPlaying && !isHovered ? 'off' : 'polite'}
        >
          {products.map((product, index) => {
            const zone = getZoneFromType(
              product.category_type || product.category?.type || product.type
            );
            const active = index === currentIndex;
            return (
              <div
                key={product.id}
                className={styles.carouselSlide}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${products.length}`}
                aria-hidden={!active}
              >
                <div
                  className={styles.productCard}
                  style={{ '--zone-color': zone.color }}
                  onClick={() => open(product.slug)}
                >
                  <div className={styles.imageWrapper}>
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className={styles.productImage}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      width={600}
                      height={450}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    <span className={`label-mono ${styles.popularBadge}`}>Popular</span>
                  </div>

                  <div className={styles.productContent}>
                    {product.brand && (
                      <span className={`label-mono ${styles.brand}`}>{product.brand}</span>
                    )}
                    <h3 className={styles.productName}>{product.name}</h3>

                    {/* No price on the tile: prices are quoted on request (matches ProductCard) */}
                    <a
                      href={`/product/${product.slug}`}
                      className={`btn btn--primary ${styles.viewButton}`}
                      tabIndex={active ? 0 : -1}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        open(product.slug);
                      }}
                    >
                      View product <span className="btn__arrow" aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.dotsContainer}>
          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to product ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default PopularProductsCarousel;