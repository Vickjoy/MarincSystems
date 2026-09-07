import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { fetchCategories, fetchSubcategories, fetchProductsForSubcategory } from '../utils/api';
import styles from './CategoryPage.module.css';
import ProductCard from '../components/ProductCard';

// Import category images
import FireSafetyImg from '../assets/FireSafety.jpg';
import ICTImg from '../assets/ICT.webp';
import SolarImg from '../assets/Solare.webp';

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

  // Get category-specific image and display name
  const getCategoryDisplay = (category) => {
    if (!category) return { image: null, displayName: slug };

    const categoryType = String(category.type || '').toLowerCase();
    const categoryName = category.name.toLowerCase();

    if (
      ['fire_safety', 'fire', 'fire-safety', 'firesafety'].includes(categoryType) ||
      categoryName.includes('fire')
    ) {
      return { image: FireSafetyImg, displayName: category.name };
    }

    if (
      ['ict', 'telecom', 'telecommunication'].includes(categoryType) ||
      categoryName.includes('ict') ||
      categoryName.includes('telecom')
    ) {
      return { image: ICTImg, displayName: category.name };
    }

    if (
      ['solar', 'solar_solutions', 'solar-solutions'].includes(categoryType) ||
      categoryName.includes('solar')
    ) {
      return { image: SolarImg, displayName: category.name };
    }

    return { image: null, displayName: category.name };
  };

  // Fetch category by slug
  useEffect(() => {
    const getCategory = async () => {
      try {
        const cats = await fetchCategories();
        const found = cats.find((cat) => cat.slug === slug);
        setCategory(found || null);
        setSubcategories([]);
        setSelectedSubcategory(null);
        setImageLoaded(false); // Reset image loaded state
      } catch {
        setCategory(null);
        setSubcategories([]);
        setSelectedSubcategory(null);
      }
    };
    getCategory();
  }, [slug]);

  // Fetch subcategories for this category
  useEffect(() => {
    if (!category) return;

    const getSubs = async () => {
      try {
        const subs = await fetchSubcategories(category.slug);
        const filtered = subs.filter(
          (sub) =>
            sub.category === category.id ||
            sub.category === category.slug ||
            !sub.category ||
            sub.category === category
        );
        setSubcategories(filtered);

        // Determine which subcategory to show
        const targetSubcategorySlug =
          location.state?.selectedSubcategory || location.hash?.substring(1);

        if (targetSubcategorySlug) {
          const targetSubcategory = filtered.find((sub) => sub.slug === targetSubcategorySlug);
          setSelectedSubcategory(targetSubcategory || filtered[0] || null);
        } else {
          // Default to first subcategory if available
          setSelectedSubcategory(filtered[0] || null);
        }
      } catch {
        setSubcategories([]);
        setSelectedSubcategory(null);
      }
    };

    getSubs();

    const handleSubcategoriesUpdated = () => getSubs();
    window.addEventListener('subcategoriesUpdated', handleSubcategoriesUpdated);

    return () => window.removeEventListener('subcategoriesUpdated', handleSubcategoriesUpdated);
  }, [category, location.state?.selectedSubcategory, location.hash]);

  // Fetch products for selected subcategory
  useEffect(() => {
    if (!selectedSubcategory) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError('');
    fetchProductsForSubcategory(selectedSubcategory.slug)
      .then((data) => {
        const items = data?.results ? data.results : Array.isArray(data) ? data : [];
        setProducts(items);
        setError('');
      })
      .catch(() => {
        setProducts([]);
        setError('Could not load products for this subcategory.');
      })
      .finally(() => setLoading(false));
  }, [selectedSubcategory]);

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    navigate(`/category/${slug}#${subcategory.slug}`, { replace: true });
  };

  // Preload image for better quality
  useEffect(() => {
    const categoryDisplay = getCategoryDisplay(category);
    if (categoryDisplay.image) {
      const img = new Image();
      img.src = categoryDisplay.image;
      img.onload = () => setImageLoaded(true);
    } else {
      setImageLoaded(true);
    }
  }, [category]);

  const categoryDisplay = getCategoryDisplay(category);

  const crumbs = [
    { label: 'Home', path: '/' },
    { label: category ? category.name : slug, path: `/category/${slug}` },
    ...(selectedSubcategory ? [{ label: selectedSubcategory.name, path: '#' }] : []),
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Banner Section */}
      <div className={styles.heroSection}>
        <div
          className={styles.heroBackground}
          style={{
            backgroundImage: categoryDisplay.image ? `url(${categoryDisplay.image})` : 'none',
            backgroundColor: categoryDisplay.image ? 'transparent' : '#6096B4',
            opacity: imageLoaded ? 1 : 0.8,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{categoryDisplay.displayName}</h1>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className={styles.breadcrumbWrapper}>
        <Breadcrumbs crumbs={crumbs} />
      </div>

      {/* Main Content */}
      <section className={styles.mainSection}>
        <div className={styles.containerLayout}>
          {/* Desktop Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarContent}>
              <h3 className={styles.sidebarTitle}>Product Categories</h3>
              <div className={styles.subcategoryList}>
                {subcategories.length === 0 ? (
                  <div className={styles.noSubcategories}>No subcategories available</div>
                ) : (
                  subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      className={`${styles.subcategoryButton} ${
                        selectedSubcategory?.id === sub.id ? styles.active : ''
                      }`}
                      onClick={() => handleSubcategorySelect(sub)}
                    >
                      {sub.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <main className={styles.mainContent}>
            {/* Mobile Category Pills - Horizontal Scrollable */}
            <div className={styles.mobileCategories}>
              <div className={styles.mobileCategoryPills}>
                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    className={`${styles.categoryPill} ${
                      selectedSubcategory?.id === sub.id ? styles.activePill : ''
                    }`}
                    onClick={() => handleSubcategorySelect(sub)}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            {!selectedSubcategory ? (
              <div className={styles.selectPrompt}>
                <div className={styles.selectPromptIcon}>📋</div>
                <h3>Select a Category</h3>
                <p>Please select a subcategory to view available products.</p>
              </div>
            ) : error ? (
              <div className={styles.errorMessage}>
                <p>{error}</p>
              </div>
            ) : loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <div>
                <div className={styles.categoryHeader}>
                  <h2>{selectedSubcategory.name}</h2>
                  <p className={styles.quotationMessage}>
                    Add products to your cart and request a quotation for your selected items.
                  </p>
                </div>
                <div className={styles.productsGrid}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📦</div>
                <h3>No Products Available</h3>
                <p>No products are currently available in {selectedSubcategory.name}.</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;