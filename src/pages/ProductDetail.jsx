import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useRef } from 'react';
import { Title, Meta, Link } from 'react-head';
import { FaWhatsapp } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductForm from '../components/ProductForm';
import ProductCarousel from '../components/ProductCarousel';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getZoneFromType } from '../utils/zones';
import styles from './ProductDetail.module.css';

const API_URL = `${API_BASE_URL}/api`;
const SITE_NAME = 'Marinc Systems Ltd';
const SITE_URL = 'https://marincsystems.co.ke';


/* ---------- SEO helpers (pure, module scope) ---------- */

const generateMetaDescription = (product) => {
  if (!product) return '';
  if (product.meta_description) return product.meta_description.slice(0, 155);

  const name = product.name || '';
  const brand = product.brand ? `${product.brand} ` : '';
  const description = product.description || '';

  let autoDescription;
  if (description) {
    const firstSentence = description.split('.')[0];
    autoDescription = firstSentence.length > 100 ? `${firstSentence.slice(0, 100)}...` : firstSentence;
  } else {
    autoDescription = `${brand}${name} for fire safety and security systems`;
  }

  return `${brand}${name} — ${autoDescription}. Available in Kenya at ${SITE_NAME}.`.slice(0, 155);
};

const generatePageTitle = (product) => {
  if (!product) return SITE_NAME;
  if (product.meta_title) return product.meta_title;
  const brand = product.brand ? `${product.brand} ` : '';
  return `${brand}${product.name} | ${SITE_NAME}`;
};

const getCanonicalUrl = (product) => (product ? `${SITE_URL}/product/${product.slug}` : '');

const absoluteUrl = (url) => (/^https?:\/\//i.test(url) ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`);

/* ---------- Component ---------- */

const ProductDetail = () => {
  const { slug: productSlug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const addedTimer = useRef(null);

  // Scroll to top and reset UI state when the product changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveTab('description');
    setQuantity(1);
    setShowLightbox(false);
  }, [productSlug]);

  // Fetch product. Resets state on slug change so the previous product never
  // flashes, and ignores stale responses.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProduct(null);

    (async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`${API_URL}/products/${productSlug}/`, { headers });
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Product not found' : 'Failed to fetch product');
        }
        const data = await response.json();
        if (!cancelled) setProduct(data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [productSlug, token]);

  // Lightbox: Escape closes, page doesn't scroll behind it
  useEffect(() => {
    if (!showLightbox) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setShowLightbox(false); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showLightbox]);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const handleEditSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/products/${productSlug}/`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());

      setProduct(await response.json());
      setEditMode(false);
      navigate(`/product/${productSlug}`);
    } catch (err) {
      console.error('Error updating product:', err);
      alert(`Error updating product: ${err.message}`);
    }
  };

  const handleAddToQuote = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      image: product.image,
      quantity,
    });
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1500);
  };

  const handleWhatsAppClick = () => {
    if (!product) return;
    const message = `Hi, I'm interested in ${product.name} and would like to ask for prices`;
    const whatsappUrl = `https://wa.me/254113808073?text=${encodeURIComponent(message)}`;

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'whatsapp_inquiry_detail', {
        event_category: 'engagement',
        event_label: product.name,
        product_id: product.id,
      });
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(Number.isNaN(value) ? 1 : Math.max(1, value));
  };

  const renderTextList = (text) =>
    String(text || '')
      .split(/\n/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item, idx) => <li key={idx}>{item}</li>);

  /* ----- derived data ----- */

  const category = product?.category;
  const subcategory = product?.subcategory_detail;
  const zone = getZoneFromType(category?.type || product?.category_type || product?.type);

  const pageTitle = loading
    ? `Loading... | ${SITE_NAME}`
    : error
    ? `Error | ${SITE_NAME}`
    : !product
    ? `Product Not Found | ${SITE_NAME}`
    : editMode
    ? `Edit ${product.name} | ${SITE_NAME}`
    : generatePageTitle(product);

  const metaDescription = generateMetaDescription(product);
  const canonicalUrl = getCanonicalUrl(product);
  const imageUrl = absoluteUrl(product?.image || '/placeholder.png');

  /* ----- early returns ----- */

  if (loading) {
    return (
      <div className={styles.loadingContainer} role="status">
        <Title>{pageTitle}</Title>
        <p>Loading product details…</p>
      </div>
    );
  }

  if (error || !product) {
    const notFound = !error || error === 'Product not found';
    return (
      <div className={styles.errorContainer}>
        <Title>{pageTitle}</Title>
        <Meta name="robots" content="noindex" />
        <h2>{notFound ? 'Product not found' : 'Error loading product'}</h2>
        <p>
          {notFound
            ? "The product you're looking for doesn't exist or may have been removed."
            : error}
        </p>
        <button type="button" onClick={() => navigate('/')} className="btn btn--primary">
          {notFound ? 'Browse products' : 'Return to home'}
        </button>
      </div>
    );
  }

  if (editMode) {
    return (
      <div style={{ padding: 'var(--space-6) 0' }}>
        <Title>{pageTitle}</Title>
        <Meta name="robots" content="noindex" />
        <ProductForm
          initialValues={product}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditMode(false)}
        />
      </div>
    );
  }

  /* ----- tabs ----- */

  const hasSpecs = Array.isArray(product.spec_tables) && product.spec_tables.length > 0;
  const tabs = [
    product.description && { id: 'description', label: 'Description' },
    product.features && { id: 'features', label: 'Features' },
    hasSpecs && { id: 'specifications', label: 'Specifications' },
  ].filter(Boolean);

  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : tabs[0]?.id;

  const handleTabKeyDown = (e, idx) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let nextIdx = idx;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
    if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIdx = 0;
    if (e.key === 'End') nextIdx = tabs.length - 1;
    setActiveTab(tabs[nextIdx].id);
    document.getElementById(`tab-${tabs[nextIdx].id}`)?.focus();
  };

  const brandSku = [product.brand, product.sku].filter(Boolean).join(' · ');

  // Prices are quoted on request, so the schema describes the product only (no
  // Offer with a price that visitors can't see). Escaping "<" keeps the JSON-LD
  // safe inside a <script> tag.
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: imageUrl,
    description: metaDescription,
    sku: product.sku || product.slug,
    mpn: product.sku || product.slug,
    url: canonicalUrl,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
  }).replace(/</g, '\\u003c');

  return (
    <div className={styles.container} style={{ '--zone-color': zone.color }}>
      <Title>{pageTitle}</Title>
      <Meta name="description" content={metaDescription} />
      <Link rel="canonical" href={canonicalUrl} />

      <Meta property="og:title" content={pageTitle} />
      <Meta property="og:description" content={metaDescription} />
      <Meta property="og:image" content={imageUrl} />
      <Meta property="og:url" content={canonicalUrl} />
      <Meta property="og:type" content="product" />
      <Meta property="og:site_name" content={SITE_NAME} />

      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={pageTitle} />
      <Meta name="twitter:description" content={metaDescription} />
      <Meta name="twitter:image" content={imageUrl} />

      <Breadcrumbs
        crumbs={[
          { label: 'Home', path: '/' },
          ...(category?.name && category?.slug
            ? [{ label: category.name, path: `/category/${category.slug}` }]
            : []),
          ...(subcategory?.name && subcategory?.slug && category?.slug
            ? [{ label: subcategory.name, path: `/category/${category.slug}#${subcategory.slug}` }]
            : []),
          { label: product.name, path: `/product/${product.slug}` },
        ]}
      />

      <section className={styles.section}>
        <div className={styles.detailContainer}>
          {/* Left: image + documentation */}
          <div className={styles.leftColumn}>
            <div className={styles.imageArea}>
              <img
                src={product.image || '/placeholder.png'}
                alt={product.name}
                className={styles.mainImage}
                width={420}
                height={320}
                onClick={() => setShowLightbox(true)}
                onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
              />
            </div>

            {showLightbox && (
              <div
                className={styles.lightbox}
                role="dialog"
                aria-modal="true"
                aria-label={`${product.name} enlarged`}
                onClick={() => setShowLightbox(false)}
              >
                <button
                  type="button"
                  className={styles.lightboxClose}
                  onClick={() => setShowLightbox(false)}
                  aria-label="Close image"
                  autoFocus
                >
                  ×
                </button>
                <img
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  className={styles.lightboxImage}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {product.documentation_url && (
              <div className={styles.documentation}>
                <b>Documentation</b>
                <a href={product.documentation_url} target="_blank" rel="noopener noreferrer">
                  {product.documentation_label || 'View documentation'}
                </a>
              </div>
            )}
          </div>

          {/* Right: info + tabs */}
          <div className={styles.rightColumn}>
            <div className={styles.productInfo}>
              {brandSku && <p className={`label-mono ${styles.meta}`}>{brandSku}</p>}
              <h1 className={styles.productTitle}>{product.name}</h1>

              <span className={`badge badge--success ${styles.stockStatus}`}>In stock</span>

              <div className={styles.ctaRow}>
                <div className={styles.quantityArea}>
                  <label htmlFor="quantity" className={styles.label}>Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    min="1"
                    inputMode="numeric"
                    className={styles.quantityInput}
                    onChange={handleQuantityChange}
                  />
                </div>

                <button
                  type="button"
                  className={`btn btn--primary ${styles.ctaButton}`}
                  onClick={handleAddToQuote}
                >
                  {added ? 'Added' : 'Add to quote'}
                  <span className="btn__arrow" aria-hidden="true">{added ? '✓' : '+'}</span>
                </button>

                <button
                  type="button"
                  className={`btn ${styles.askPriceButton}`}
                  onClick={handleWhatsAppClick}
                  aria-label={`Ask for prices on ${product.name} via WhatsApp`}
                >
                  <FaWhatsapp className={styles.whatsappIcon} aria-hidden="true" />
                  Ask for price
                </button>
              </div>
            </div>

            {tabs.length > 0 && (
              <div className={styles.tabs}>
                <div className={styles.tabList} role="tablist" aria-label="Product information">
                  {tabs.map((tab, idx) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`tab-${tab.id}`}
                      aria-selected={currentTab === tab.id}
                      aria-controls={`panel-${tab.id}`}
                      tabIndex={currentTab === tab.id ? 0 : -1}
                      className={`${styles.tab} ${currentTab === tab.id ? styles.tabActive : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                      onKeyDown={(e) => handleTabKeyDown(e, idx)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div
                  className={styles.tabPanel}
                  role="tabpanel"
                  id={`panel-${currentTab}`}
                  aria-labelledby={`tab-${currentTab}`}
                  tabIndex={0}
                >
                  {currentTab === 'description' && (
                    <p className={styles.descriptionText}>{product.description}</p>
                  )}

                  {currentTab === 'features' && (
                    <ul className={styles.featureList}>{renderTextList(product.features)}</ul>
                  )}

                  {currentTab === 'specifications' && (
                    <div>
                      {product.spec_tables.map((table, tableIdx) => (
                        <div key={tableIdx} className={styles.specTableWrapper}>
                          {table.title && <h4 className={styles.specTitle}>{table.title}</h4>}
                          <table className={styles.specTable}>
                            <tbody>
                              {(table.rows || []).map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                  <th scope="row" className={styles.specKey}>{row.key}</th>
                                  <td className={styles.specValue}>{row.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <ProductCarousel productSlug={productSlug} />
      </section>

      <script type="application/ld+json">{structuredData}</script>
    </div>
  );
};

export default ProductDetail;