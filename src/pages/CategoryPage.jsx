import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductCard from '../components/ProductCard';
import { fetchCategories, fetchSubcategories, fetchProductsForSubcategory } from '../utils/api';
import { getZoneFromType } from '../utils/zones';
import styles from './CategoryPage.module.css';

import FireSafetyImg from '../assets/FireSafety.jpg';
import ICTImg from '../assets/ICT.webp';
import SolarImg from '../assets/Solare.webp';

const matchesAny = (type, name, types, words) =>
  types.includes(type) || words.some((w) => name.includes(w));

// Pure helper: lives outside the component so effects can depend on it safely
const getCategoryDisplay = (category, fallbackName) => {
  if (!category) return { image: null, displayName: fallbackName };

  const type = String(category.type || '').toLowerCase();
  const name = String(category.name || '').toLowerCase();
  let image = null;

  if (matchesAny(type, name, ['fire_safety', 'fire', 'fire-safety', 'firesafety'], ['fire'])) image = FireSafetyImg;
  else if (matchesAny(type, name, ['ict', 'telecom', 'telecommunication'], ['ict', 'telecom'])) image = ICTImg;
  else if (matchesAny(type, name, ['solar', 'solar_solutions', 'solar-solutions'], ['solar'])) image = SolarImg;

  return { image, displayName: category.name };
};

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const targetSub = location.state?.selectedSubcategory || location.hash?.substring(1) || '';

  // Category by slug
  useEffect(() => {
    let cancelled = false;
    setCategory(null);
    setSubcategories([]);
    setSelectedSubcategory(null);

    fetchCategories()
      .then((cats) => { if (!cancelled) setCategory(cats.find((c) => c.slug === slug) || null); })
      .catch(() => { if (!cancelled) setCategory(null); });

    return () => { cancelled = true; };
  }, [slug]);

  // Subcategories. Selection is preserved on refresh events; the hash only
  // picks the initial one, so a 'subcategoriesUpdated' event no longer resets the user.
  useEffect(() => {
    if (!category) return undefined;
    let cancelled = false;

    const getSubs = async () => {
      try {
        const subs = await fetchSubcategories(category.slug);
        if (cancelled) return;
        const filtered = subs.filter(
          (s) => s.category === category.id || s.category === category.slug || !s.category
        );
        setSubcategories(filtered);
        setSelectedSubcategory((current) => {
          if (current && filtered.some((s) => s.id === current.id)) return current;
          return filtered.find((s) => s.slug === targetSub) || filtered[0] || null;
        });
      } catch {
        if (!cancelled) { setSubcategories([]); setSelectedSubcategory(null); }
      }
    };

    getSubs();
    window.addEventListener('subcategoriesUpdated', getSubs);
    return () => {
      cancelled = true;
      window.removeEventListener('subcategoriesUpdated', getSubs);
    };
  }, [category, targetSub]);

  // Products for the selected subcategory (ignores stale responses)
  useEffect(() => {
    if (!selectedSubcategory) { setProducts([]); return undefined; }
    let cancelled = false;

    setLoading(true);
    setError('');
    fetchProductsForSubcategory(selectedSubcategory.slug)
      .then((data) => {
        if (cancelled) return;
        setProducts(data?.results || (Array.isArray(data) ? data : []));
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setError('Could not load products for this subcategory.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [selectedSubcategory]);

  const categoryDisplay = getCategoryDisplay(category, slug);
  const zone = getZoneFromType(category?.type);

  // Preload the hero image
  useEffect(() => {
    setImageLoaded(false);
    if (!categoryDisplay.image) { setImageLoaded(true); return undefined; }
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = categoryDisplay.image;
    return () => { img.onload = null; };
  }, [categoryDisplay.image]);

  const handleSubcategorySelect = (sub) => {
    setSelectedSubcategory(sub);
    navigate(`/category/${slug}#${sub.slug}`, { replace: true });
  };

  const crumbs = [
    { label: 'Home', path: '/' },
    { label: category ? category.name : slug, path: `/category/${slug}` },
    ...(selectedSubcategory ? [{ label: selectedSubcategory.name, path: '#' }] : []),
  ];

  const renderSubButtons = (isPill) =>
    subcategories.map((sub) => {
      const active = selectedSubcategory?.id === sub.id;
      const base = isPill ? styles.categoryPill : styles.subcategoryButton;
      const on = isPill ? styles.activePill : styles.active;
      return (
        <button
          key={sub.id}
          type="button"
          className={`${base} ${active ? on : ''}`}
          aria-current={active ? 'true' : undefined}
          onClick={() => handleSubcategorySelect(sub)}
        >
          {sub.name}
        </button>
      );
    });

  const renderContent = () => {
    if (!selectedSubcategory) {
      return (
        <div className={styles.selectPrompt}>
          <span className={`label-mono ${styles.stateLabel}`}>Catalogue</span>
          <h3>Select a category</h3>
          <p>Choose a subcategory to view the available products.</p>
        </div>
      );
    }
    if (error) return <div className={styles.errorMessage} role="alert"><p>{error}</p></div>;
    if (loading) {
      return (
        <div className={styles.loadingState} role="status">
          <div className={styles.loadingSpinner} />
          <p>Loading products…</p>
        </div>
      );
    }
    if (products.length === 0) {
      return (
        <div className={styles.emptyState}>
          <span className={`label-mono ${styles.stateLabel}`}>0 products</span>
          <h3>No products available</h3>
          <p>No products are currently listed in {selectedSubcategory.name}.</p>
        </div>
      );
    }
    return (
      <>
        <div className={styles.categoryHeader}>
          <h2>{selectedSubcategory.name}</h2>
          <p className={styles.quotationMessage}>
            Add products to your quote list and request a quotation for your selected items.
          </p>
        </div>
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} zoneType={category?.type} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className={styles.pageWrapper} style={{ '--zone-color': zone.color }}>
      <header className={styles.heroSection}>
        {categoryDisplay.image && (
          <div
            className={styles.heroBackground}
            style={{
              backgroundImage: `url(${categoryDisplay.image})`,
              opacity: imageLoaded ? 1 : 0,
            }}
            aria-hidden="true"
          />
        )}
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <span className={`label-mono ${styles.heroEyebrow}`}>Product category</span>
          <h1 className={styles.heroTitle}>{categoryDisplay.displayName}</h1>
        </div>
      </header>

      <div className={styles.breadcrumbWrapper}>
        <Breadcrumbs crumbs={crumbs} />
      </div>

      <section className={styles.mainSection}>
        <div className={styles.containerLayout}>
          <aside className={styles.sidebar} aria-label="Subcategories">
            <div className={styles.sidebarContent}>
              <h2 className={styles.sidebarTitle}>Product categories</h2>
              <div className={styles.subcategoryList}>
                {subcategories.length === 0
                  ? <div className={styles.noSubcategories}>No subcategories available</div>
                  : renderSubButtons(false)}
              </div>
            </div>
          </aside>

          <main className={styles.mainContent}>
            {subcategories.length > 0 && (
              <nav className={styles.mobileCategories} aria-label="Subcategories">
                <div className={styles.mobileCategoryPills}>{renderSubButtons(true)}</div>
              </nav>
            )}
            {renderContent()}
          </main>
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;