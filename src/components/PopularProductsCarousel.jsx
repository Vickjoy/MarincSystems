import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PopularProductsCarousel.module.css';

const PopularProductsCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 PopularProductsCarousel mounted, fetching products...');
    fetchPopularProducts();
  }, []);

  const fetchPopularProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📡 Fetching from: ${API_BASE_URL}/api/products/popular`);
      const response = await fetch(`${API_BASE_URL}/api/products/popular`);
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      console.log('📋 Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('✅ Data received:', data);
      console.log('📦 Number of products:', data.length);
      
      if (!Array.isArray(data)) {
        console.error('❌ Data is not an array:', typeof data);
        throw new Error('Invalid data format received from server');
      }
      
      setProducts(data);
      console.log('✅ Products set in state:', data.length);
      
    } catch (error) {
      console.error('❌ Error fetching popular products:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      setError(error.message);
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
    }
  };

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleProductClick = (productSlug) => {
    navigate(`/product/${productSlug}`);
  };

  console.log('🎨 Render - Loading:', loading, 'Error:', error, 'Products:', products.length);

  if (loading) {
    console.log('🔄 Rendering loading state');
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
    console.log('❌ Rendering error state:', error);
    return (
      <section className={styles.carouselSection}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>Unable to load popular products: {error}</p>
            <button onClick={fetchPopularProducts} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    console.log('⚠️ No products to display');
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

  console.log('✅ Rendering carousel with', products.length, 'products');

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
            style={{
              transform: `translateX(-${currentIndex * 100}%)`
            }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className={styles.carouselSlide}
              >
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
                        console.log('❌ Image failed to load:', product.image);
                        e.target.src = '/placeholder.png';
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded:', product.name);
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