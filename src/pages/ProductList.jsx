import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './ProductList.module.css';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/ProductForm';
import { fetchCategories, fetchSubcategories } from '../utils/api';

// Cache configuration
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const CACHE_KEYS = {
  CATEGORIES: 'marincSystemsCategories',
  SUBCATEGORIES: 'marincSystemsSubcategories',
  PRODUCTS: 'marincSystemsProducts'
};

// Cache utility functions
const getCacheKey = (key, params = '') => `${key}${params ? `_${params}` : ''}`;

const getCachedData = (cacheKey) => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    localStorage.removeItem(cacheKey);
    return null;
  }
};

const setCachedData = (cacheKey, data) => {
  try {
    const cacheObject = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
  } catch (error) {
    console.error('Error setting cache:', error);
    // Handle storage quota exceeded
    if (error.name === 'QuotaExceededError') {
      // Clear old cache entries
      Object.values(CACHE_KEYS).forEach(key => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(key));
        keys.forEach(k => localStorage.removeItem(k));
      });
    }
  }
};

// Enhanced API functions with caching
const fetchCategoriesWithCache = async () => {
  const cacheKey = getCacheKey(CACHE_KEYS.CATEGORIES);
  const cached = getCachedData(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await fetchCategories();
  setCachedData(cacheKey, data);
  return data;
};

const fetchSubcategoriesWithCache = async (categorySlug) => {
  const cacheKey = getCacheKey(CACHE_KEYS.SUBCATEGORIES, categorySlug);
  const cached = getCachedData(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await fetchSubcategories(categorySlug);
  setCachedData(cacheKey, data);
  return data;
};

const fetchProductsWithCache = async (subcategorySlug, page = 1, pageSize = 40) => {
  const cacheKey = getCacheKey(CACHE_KEYS.PRODUCTS, `${subcategorySlug}_${page}_${pageSize}`);
  const cached = getCachedData(cacheKey);

  if (cached) {
    return cached;
  }

  const url = `${API_BASE_URL}/api/subcategories/${subcategorySlug}/products/?page=${page}&page_size=${pageSize}`;
  const response = await fetch(url);
  const data = await response.json();

  setCachedData(cacheKey, data);
  return data;
};

const ProductList = () => {
  const { categorySlug, slug } = useParams();
  const category = categorySlug || slug || '';
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subCategory, setSubCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const { user, token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // If search results are passed via location.state, use them
  const isSearchResults = location.pathname.startsWith('/search');
  const searchResults = location.state && location.state.results;

  useEffect(() => {
    if (isSearchResults && Array.isArray(searchResults)) {
      setProducts(searchResults);
      setLoading(false);
      setSubcategories([]);
      return;
    }

    setLoading(true);
    // Fetch categories on mount with caching
    const getCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchCategoriesWithCache();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    getCategories();
  }, [isSearchResults, searchResults]);

  // Only fetch subcategories/products if not search results
  useEffect(() => {
    if (isSearchResults) return;
    if (!category) {
      setSubcategories([]);
      return;
    }

    const selectedCategory = categories.find(cat => cat.slug === category);
    if (!selectedCategory) {
      setSubcategories([]);
      return;
    }

    const getSubcategories = async () => {
      setLoadingSubcategories(true);
      try {
        const data = await fetchSubcategoriesWithCache(selectedCategory.slug);
        setSubcategories(data);
        // Auto-select the first subcategory if none is selected
        if ((!subCategory || !subCategory.slug) && Array.isArray(data) && data.length > 0) {
          setSubCategory(data[0]);
        }
        // FIX: with no subcategory, fetchProducts never runs, so `loading`
        // would stay true forever and the empty state could never show.
        if (Array.isArray(data) && data.length === 0) setLoading(false);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setSubcategories([]);
        setLoading(false); // FIX: same as above
      } finally {
        setLoadingSubcategories(false);
      }
    };
    getSubcategories();
  }, [category, categories, isSearchResults]);

  // Only fetch products if not search results
  const fetchProducts = useCallback(async (reset = false) => {
    if (isSearchResults) return;
    // Only fetch when a subcategory is selected
    if (!subCategory || !subCategory.slug) return;

    setLoading(true);
    try {
      const data = await fetchProductsWithCache(subCategory.slug, page, 40);

      if (reset) {
        setProducts(data.results || data);
      } else {
        setProducts(prev => [...prev, ...(data.results || data)]);
      }
      setHasMore(data.next !== null && data.next !== undefined);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [category, subCategory, page, isSearchResults]);

  // Reset products and page when category or subCategory changes
  useEffect(() => {
    if (isSearchResults) return;
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [category, subCategory, isSearchResults]);

  // Fetch products when page, category, or subCategory changes
  useEffect(() => {
    if (isSearchResults) return;
    fetchProducts(page === 1);

    const handleProductsUpdated = () => {
      // Clear relevant product cache when products are updated
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(CACHE_KEYS.PRODUCTS) &&
        subCategory && key.includes(subCategory.slug)
      );
      keys.forEach(key => localStorage.removeItem(key));
      fetchProducts(true);
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);
    return () => window.removeEventListener('productsUpdated', handleProductsUpdated);
    // eslint-disable-next-line
  }, [category, subCategory, page, isSearchResults]);

  // Infinite scroll observer
  const lastProductRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Handle product deletion
  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    // Clear relevant cache when a product is deleted
    if (subCategory) {
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(CACHE_KEYS.PRODUCTS) && key.includes(subCategory.slug)
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
  };

  // Function to clear all cache (useful for debugging or force refresh)
  const clearCache = () => {
    Object.values(CACHE_KEYS).forEach(cacheKey => {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(cacheKey));
      keys.forEach(key => localStorage.removeItem(key));
    });
    window.location.reload();
  };

  const categoryLabel = category
    ? category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : '';

  // Breadcrumbs logic
  const crumbs = [
    { label: 'Home', path: '/' },
    isSearchResults
      ? { label: `Search Results`, path: location.pathname }
      : { label: location.pathname.startsWith('/fire-safety') ? 'Fire Safety' : 'ICT', path: location.pathname.startsWith('/fire-safety') ? '/fire-safety' : '/ict' },
    ...(isSearchResults ? [] : [{ label: categoryLabel, path: location.pathname }]),
    ...(subCategory && !isSearchResults ? [{ label: subCategory.name, path: '#' }] : [])
  ];

  return (
    <div>
      <Breadcrumbs crumbs={crumbs} />
      <section className={styles.section}>
        <div className={styles.categoryContainer}>
          {/* Sidebar with subcategories - hide for search results */}
          {!isSearchResults && (
            <aside className={styles.stickySidebar}>
              <div className={styles.sidebarContent}>
                <h3 className={styles.sidebarTitle}>Subcategories</h3>
                {loadingSubcategories ? (
                  <div className={styles.noSubcategories}>Loading subcategories...</div>
                ) : (
                  <ul className={styles.subcategoryList}>
                    {subcategories.length === 0 && (
                      <li className={styles.noSubcategories}>No subcategories</li>
                    )}
                    {subcategories.map(sub => {
                      const isActive = subCategory?.id === sub.id;
                      return (
                        <li key={sub.id}>
                          <button
                            type="button"
                            className={`${styles.subcategoryButton} ${isActive ? styles.active : ''}`}
                            aria-current={isActive ? 'true' : undefined}
                            onClick={() => setSubCategory(sub)}
                          >
                            {sub.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Debug button for development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={clearCache}
                  className={styles.debugButton}
                >
                  Clear cache
                </button>
              )}
            </aside>
          )}

          {/* Main content: Product Grid */}
          <div className={styles.mainContent}>
            <h2 className={styles.categoryTitle}>
              {isSearchResults ? 'Search Results' : `${categoryLabel} Products`}
            </h2>

            {/* Product Grid: Only show if there are products */}
            {products.length > 0 ? (
              <div className={styles.productsGrid}>
                {products.map((product, idx) => {
                  if (products.length === idx + 1 && !isSearchResults) {
                    return (
                      <div ref={lastProductRef} key={product.id}>
                        <ProductCard product={product} onDelete={handleDelete} />
                      </div>
                    );
                  } else {
                    return <ProductCard key={product.id} product={product} onDelete={handleDelete} />;
                  }
                })}
                {loading && (
                  <div className={styles.loadingMessage}>Loading more products...</div>
                )}
                {!hasMore && !loading && products.length > 0 && !isSearchResults && (
                  <p className={styles.endMessage}>You've reached the end of this list.</p>
                )}
              </div>
            ) : loading ? (
              <div className={styles.loadingMessage}>Loading products...</div>
            ) : (
              <p className={styles.noProductsMessage}>
                {isSearchResults ? 'No results found.' : 'No products in this subcategory yet.'}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductList;