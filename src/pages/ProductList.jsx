import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, fetchSubcategories } from '../utils/api';
import { getZoneFromType } from '../utils/zones';
// NOTE: search.js must live in src/utils (it imports ./api and ./zones)
import { searchProducts } from '../utils/search';
import styles from './ProductList.module.css';

/* ---------- Cache (localStorage, 15 min) ---------- */

const CACHE_DURATION = 15 * 60 * 1000;
const PAGE_SIZE = 40;
const CACHE_KEYS = {
  CATEGORIES: 'marincSystemsCategories',
  SUBCATEGORIES: 'marincSystemsSubcategories',
  PRODUCTS: 'marincSystemsProducts',
};

const getCacheKey = (key, params = '') => `${key}${params ? `_${params}` : ''}`;

const clearCacheByPrefix = (prefix, mustInclude) => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix) && (!mustInclude || k.includes(mustInclude)))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* storage unavailable */ }
};

const getCachedData = (cacheKey) => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) return data;
    localStorage.removeItem(cacheKey);
    return null;
  } catch {
    try { localStorage.removeItem(cacheKey); } catch { /* ignore */ }
    return null;
  }
};

const setCachedData = (cacheKey, data) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      Object.values(CACHE_KEYS).forEach((key) => clearCacheByPrefix(key));
    }
  }
};

const withCache = async (cacheKey, loader) => {
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  const data = await loader();
  setCachedData(cacheKey, data);
  return data;
};

const fetchCategoriesWithCache = () =>
  withCache(getCacheKey(CACHE_KEYS.CATEGORIES), fetchCategories);

const fetchSubcategoriesWithCache = (categorySlug) =>
  withCache(getCacheKey(CACHE_KEYS.SUBCATEGORIES, categorySlug), () => fetchSubcategories(categorySlug));

const fetchProductsWithCache = (subcategorySlug, page, pageSize = PAGE_SIZE) =>
  withCache(getCacheKey(CACHE_KEYS.PRODUCTS, `${subcategorySlug}_${page}_${pageSize}`), async () => {
    const url = `${API_BASE_URL}/api/subcategories/${subcategorySlug}/products/?page=${page}&page_size=${pageSize}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Products request failed (${response.status})`);
    return response.json();
  });

/* ---------- Component ---------- */

const ProductList = () => {
  const { categorySlug, slug } = useParams();
  const category = categorySlug || slug || '';
  const location = useLocation();
  const { token } = useAuth(); // eslint-disable-line no-unused-vars

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subCategory, setSubCategory] = useState(null);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchError, setSearchError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const observer = useRef(null);

  // Search mode is driven by /search?query=... so it survives refresh and back/forward
  const isSearchResults = location.pathname.startsWith('/search');
  const searchQuery = new URLSearchParams(location.search).get('query') || '';

  const selectedCategory = categories.find((c) => c.slug === category) || null;
  const zone = getZoneFromType(selectedCategory?.type);

  /* Categories (browse mode) */
  useEffect(() => {
    if (isSearchResults) return undefined;
    let cancelled = false;
    setLoading(true);

    fetchCategoriesWithCache()
      .then((data) => { if (!cancelled) setCategories(Array.isArray(data) ? data : data?.results || []); })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        if (!cancelled) { setCategories([]); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [isSearchResults]);

  /* Search (search mode) */
  useEffect(() => {
    if (!isSearchResults) return undefined;
    let cancelled = false;

    setLoading(true);
    setSearchError('');
    setProducts([]);
    setSubcategories([]);
    setSubCategory(null);
    setHasMore(false);

    searchProducts(searchQuery)
      .then((results) => { if (!cancelled) setProducts(results); })
      .catch((error) => {
        console.error('Search failed:', error);
        if (!cancelled) setSearchError('Search is unavailable right now. Please try again.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [isSearchResults, searchQuery]);

  /* Subcategories (browse mode). A category change resets selection and list. */
  useEffect(() => {
    if (isSearchResults) return undefined;

    setSubCategory(null);
    setProducts([]);
    setPage(1);
    setHasMore(true);

    if (!category || !selectedCategory) {
      setSubcategories([]);
      return undefined;
    }

    let cancelled = false;
    setLoadingSubcategories(true);

    fetchSubcategoriesWithCache(selectedCategory.slug)
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.results || [];
        setSubcategories(list);
        setSubCategory(list[0] || null);
        // No subcategory means no product fetch will run, so stop the spinner here
        if (list.length === 0) setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching subcategories:', error);
        if (cancelled) return;
        setSubcategories([]);
        setLoading(false);
      })
      .finally(() => { if (!cancelled) setLoadingSubcategories(false); });

    return () => { cancelled = true; };
    // selectedCategory is derived from categories + category; depend on its slug only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, selectedCategory?.slug, isSearchResults]);

  /* Products for the selected subcategory + page (ignores stale responses) */
  useEffect(() => {
    if (isSearchResults || !subCategory?.slug) return undefined;
    let cancelled = false;
    setLoading(true);

    fetchProductsWithCache(subCategory.slug, page)
      .then((data) => {
        if (cancelled) return;
        const items = data?.results || (Array.isArray(data) ? data : []);
        setProducts((prev) => {
          if (page === 1) return items;
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...items.filter((p) => !seen.has(p.id))];
        });
        setHasMore(data?.next !== null && data?.next !== undefined);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        if (!cancelled) setHasMore(false);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [subCategory, page, isSearchResults, reloadKey]);

  /* Admin edits elsewhere dispatch 'productsUpdated': drop cache and reload page 1 */
  useEffect(() => {
    if (isSearchResults) return undefined;
    const onProductsUpdated = () => {
      if (subCategory) clearCacheByPrefix(CACHE_KEYS.PRODUCTS, subCategory.slug);
      setPage(1);
      setReloadKey((k) => k + 1);
    };
    window.addEventListener('productsUpdated', onProductsUpdated);
    return () => window.removeEventListener('productsUpdated', onProductsUpdated);
  }, [subCategory, isSearchResults]);

  /* Infinite scroll */
  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) setPage((prev) => prev + 1);
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => () => observer.current?.disconnect(), []);

  const handleSelectSubcategory = (sub) => {
    if (sub.id === subCategory?.id) return;
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setSubCategory(sub);
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (subCategory) clearCacheByPrefix(CACHE_KEYS.PRODUCTS, subCategory.slug);
  };

  const clearCache = () => {
    Object.values(CACHE_KEYS).forEach((key) => clearCacheByPrefix(key));
    window.location.reload();
  };

  const categoryLabel =
    selectedCategory?.name ||
    (category ? category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : '');

  const crumbs = [
    { label: 'Home', path: '/' },
    ...(isSearchResults
      ? [{ label: 'Search results', path: location.pathname + location.search }]
      : [
          { label: categoryLabel, path: location.pathname },
          ...(subCategory ? [{ label: subCategory.name, path: '#' }] : []),
        ]),
  ];

  const renderEmpty = () => {
    if (isSearchResults) {
      if (loading) return <div className={styles.loadingMessage} role="status">Searching…</div>;
      if (searchError) return <p className={styles.noProductsMessage} role="alert">{searchError}</p>;
      if (!searchQuery.trim()) {
        return <p className={styles.noProductsMessage}>Type a product name, brand or model in the search box.</p>;
      }
      return (
        <p className={styles.noProductsMessage}>
          No products found for “{searchQuery}”. Try a shorter word, a brand name or a model number.
        </p>
      );
    }
    if (loading) return <div className={styles.loadingMessage} role="status">Loading products…</div>;
    return <p className={styles.noProductsMessage}>No products in this subcategory yet.</p>;
  };

  return (
    <div>
      <Breadcrumbs crumbs={crumbs} />
      <section className={styles.section} style={{ '--zone-color': zone.color }}>
        <div className={styles.categoryContainer}>
          {!isSearchResults && (
            <aside className={styles.stickySidebar} aria-label="Subcategories">
              <div className={styles.sidebarContent}>
                <h3 className={styles.sidebarTitle}>Subcategories</h3>
                {loadingSubcategories ? (
                  <div className={styles.noSubcategories}>Loading subcategories…</div>
                ) : (
                  <ul className={styles.subcategoryList}>
                    {subcategories.length === 0 && (
                      <li className={styles.noSubcategories}>No subcategories</li>
                    )}
                    {subcategories.map((sub) => {
                      const isActive = subCategory?.id === sub.id;
                      return (
                        <li key={sub.id}>
                          <button
                            type="button"
                            className={`${styles.subcategoryButton} ${isActive ? styles.active : ''}`}
                            aria-current={isActive ? 'true' : undefined}
                            onClick={() => handleSelectSubcategory(sub)}
                          >
                            {sub.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {process.env.NODE_ENV === 'development' && (
                <button type="button" onClick={clearCache} className={styles.debugButton}>
                  Clear cache
                </button>
              )}
            </aside>
          )}

          <div className={styles.mainContent}>
            <h2 className={styles.categoryTitle}>
              {isSearchResults
                ? searchQuery ? `Search results for “${searchQuery}”` : 'Search results'
                : `${categoryLabel} products`}
            </h2>

            {isSearchResults && !loading && products.length > 0 && (
              <p className={styles.resultCount}>
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            )}

            {products.length > 0 ? (
              <div className={styles.productsGrid}>
                {products.map((product, idx) => {
                  const card = (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onDelete={handleDelete}
                      zoneType={isSearchResults ? undefined : selectedCategory?.type}
                    />
                  );
                  if (idx === products.length - 1 && !isSearchResults) {
                    return <div ref={lastProductRef} key={product.id}>{card}</div>;
                  }
                  return card;
                })}

                {loading && !isSearchResults && (
                  <div className={styles.loadingMessage} role="status">Loading more products…</div>
                )}
                {!hasMore && !loading && !isSearchResults && (
                  <p className={styles.endMessage}>You’ve reached the end of this list.</p>
                )}
              </div>
            ) : (
              renderEmpty()
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductList;