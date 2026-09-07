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
  CATEGORIES: 'edgeSystemsCategories',
  SUBCATEGORIES: 'edgeSystemsSubcategories',
  PRODUCTS: 'edgeSystemsProducts'
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
  
  const url = `http://127.0.0.1:8000/api/subcategories/${subcategorySlug}/products/?page=${page}&page_size=${pageSize}`;
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
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setSubcategories([]);
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

  // Breadcrumbs logic
  const crumbs = [
    { label: 'Home', path: '/' },
    isSearchResults
      ? { label: `Search Results`, path: location.pathname }
      : { label: location.pathname.startsWith('/fire-safety') ? 'Fire Safety' : 'ICT', path: location.pathname.startsWith('/fire-safety') ? '/fire-safety' : '/ict' },
    ...(isSearchResults ? [] : [{ label: category ? category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '', path: location.pathname }]),
    ...(subCategory && !isSearchResults ? [{ label: subCategory.name, path: '#' }] : [])
  ];

  return (
    <div>
      <Breadcrumbs crumbs={crumbs} />
      <section className={styles.section}>
        <div className={styles.container} style={{ display: 'flex', gap: '2rem' }}>
          {/* Sidebar with subcategories - hide for search results */}
          {!isSearchResults && (
            <aside style={{ minWidth: 220 }}>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>Subcategories</h3>
              {loadingSubcategories ? (
                <div style={{ color: 'white' }}>Loading subcategories...</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {subcategories.length === 0 && <li style={{ color: 'white' }}>No subcategories</li>}
                  {subcategories.map(sub => (
                    <li key={sub.id}>
                      <button
                        style={{
                          background: subCategory?.id === sub.id ? '#1DCD9F' : 'white',
                          color: subCategory?.id === sub.id ? 'white' : '#6096B4',
                          border: 'none',
                          borderRadius: 4,
                          padding: '0.5rem 1rem',
                          marginBottom: 8,
                          width: '100%',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                        onClick={() => setSubCategory(sub)}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {/* Debug button for development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={clearCache}
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '0.5rem 1rem',
                    marginTop: '1rem',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Clear Cache
                </button>
              )}
            </aside>
          )}
          
          {/* Main content: Product Grid */}
          <div style={{ flex: 1 }}>
            <h2 className={styles.title}>
              {isSearchResults 
                ? `Search Results` 
                : category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Products'
              }
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
                  <div style={{ 
                    color: 'white', 
                    textAlign: 'center', 
                    gridColumn: '1 / -1',
                    padding: '2rem'
                  }}>
                    Loading more products...
                  </div>
                )}
                {!hasMore && !loading && products.length > 0 && !isSearchResults && (
                  <p style={{ 
                    color: 'white', 
                    textAlign: 'center', 
                    marginTop: 16,
                    gridColumn: '1 / -1'
                  }}>
                    No more products.
                  </p>
                )}
              </div>
            ) : (
              !loading && (
                <p style={{ 
                  color: 'white', 
                  textAlign: 'center', 
                  marginTop: 32, 
                  fontSize: 18 
                }}>
                  {isSearchResults ? 'No results found.' : 'No products in this subcategory yet.'}
                </p>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductList;