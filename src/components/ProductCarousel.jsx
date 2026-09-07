import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCarousel.module.css';

const ProductCarousel = ({ productSlug }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://127.0.0.1:8000/api/products/${productSlug}/related/`
        );
        if (!response.ok) throw new Error('Failed to fetch related products');
        const data = await response.json();
        setRelatedProducts(data);
        setCurrentIndex(0); // Reset to first slide when products change
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      fetchRelatedProducts();
    }
  }, [productSlug]);

  const getVisibleCount = () => {
    if (window.innerWidth >= 1200) return 4;
    if (window.innerWidth >= 768) return 3;
    if (window.innerWidth >= 480) return 2;
    return 1;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    const handleResize = () => {
      const newVisibleCount = getVisibleCount();
      if (newVisibleCount !== visibleCount) {
        setVisibleCount(newVisibleCount);
        // Adjust current index if needed
        const newMaxIndex = Math.max(0, relatedProducts.length - newVisibleCount);
        if (currentIndex > newMaxIndex) {
          setCurrentIndex(newMaxIndex);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visibleCount, currentIndex, relatedProducts.length]);

  const maxIndex = Math.max(0, relatedProducts.length - visibleCount);

  const handlePrev = () => {
    if (!isTransitioning && currentIndex > 0) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleNext = () => {
    if (!isTransitioning && currentIndex < maxIndex) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goToSlide = (index) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, maxIndex, isTransitioning]);

  if (loading) {
    return (
      <div className={styles.carouselContainer}>
        <h2 className={styles.title}>Related Products</h2>
        <div className={styles.loading}>Loading related products...</div>
      </div>
    );
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className={styles.carouselContainer}>
      <h2 className={styles.title}>Related Products</h2>
      
      <div className={styles.carouselWrapper}>
        {currentIndex > 0 && (
          <button
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            onClick={handlePrev}
            disabled={isTransitioning}
            aria-label="Previous products"
          >
            &#8249;
          </button>
        )}

        <div className={styles.carouselTrack} ref={carouselRef}>
          <div
            className={styles.carouselInner}
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className={styles.productCard}
                style={{ flex: `0 0 ${100 / visibleCount}%` }}
              >
                <Link to={`/product/${product.slug}`} className={styles.cardLink}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className={styles.productImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {currentIndex < maxIndex && (
          <button
            className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={handleNext}
            disabled={isTransitioning}
            aria-label="Next products"
          >
            &#8250;
          </button>
        )}
      </div>

      {maxIndex > 0 && (
        <div className={styles.indicators}>
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              className={`${styles.indicator} ${
                idx === currentIndex ? styles.indicatorActive : ''
              }`}
              onClick={() => goToSlide(idx)}
              disabled={isTransitioning}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;