import React, { useState, useEffect } from 'react';
import { Title, Meta, Link } from 'react-head';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './ProductDetail.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/ProductForm';
import { useCart } from '../context/CartContext';
import ProductCarousel from '../components/ProductCarousel';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ProductDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showLightbox, setShowLightbox] = useState(false);

  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategorySlug, setSubcategorySlug] = useState('');

  const productSlug = params.slug;

  // ✅ SEO Helper: Generate automatic meta description
  const generateMetaDescription = (product) => {
    if (!product) return '';
    
    if (product.meta_description) {
      return product.meta_description.slice(0, 155);
    }

    const name = product.name || '';
    const brand = product.brand ? `${product.brand} ` : '';
    const description = product.description || '';
    let autoDescription = '';

    if (description && description.length > 0) {
      const firstSentence = description.split('.')[0];
      autoDescription = firstSentence.length > 100 
        ? firstSentence.slice(0, 100) + '...' 
        : firstSentence;
    } else {
      autoDescription = `${brand}${name} for fire safety and security systems`;
    }

    const fullDescription = `${brand}${name} — ${autoDescription}. Available in Kenya at EDGE SYSTEMS LTD.`;
    return fullDescription.slice(0, 155);
  };

  // ✅ SEO Helper: Generate page title
  const generatePageTitle = (product) => {
    if (!product) return 'EDGE SYSTEMS LTD';
    if (product.meta_title) return product.meta_title;
    
    const brand = product.brand ? `${product.brand} ` : '';
    return `${brand}${product.name} | EDGE SYSTEMS LTD`;
  };

  // ✅ SEO Helper: Get canonical URL
  const getCanonicalUrl = (product) => {
    if (!product) return '';
    return `https://edgesystems.co.ke/product/${product.slug}`;
  };

  // Scroll to top when component mounts or when productSlug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productSlug]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}/products/${productSlug}/`, { headers });
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Product not found' : 'Failed to fetch product');
        }
        const productData = await response.json();
        setProduct(productData);

        if (productData.subcategory_detail) {
          setSubcategoryName(productData.subcategory_detail.name || '');
          setSubcategorySlug(productData.subcategory_detail.slug || '');
          if (productData.category) {
            setCategoryName(productData.category.name || '');
            setCategorySlug(productData.category.slug || '');
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productSlug, token]);

  const handleEditSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productSlug}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updatedProduct = await response.json();
      setProduct(updatedProduct);
      setEditMode(false);
      navigate(`/product/${productSlug}`);
    } catch (err) {
      console.error('Error updating product:', err);
      alert(`Error updating product: ${err.message}`);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
  };

  const handleWhatsAppClick = () => {
    if (!product) return;
    const message = `Hi, I'm interested in ${product.name} and would like to ask for prices`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/254117320000?text=${encodedMessage}`;

    if (typeof gtag !== 'undefined') {
      gtag('event', 'whatsapp_inquiry_detail', {
        event_category: 'engagement',
        event_label: product.name,
        product_id: product.id
      });
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(isNaN(value) ? 1 : Math.max(1, value));
  };

  const renderTextList = (text) => {
    if (!text) return null;
    return String(text)
      .split(/\n/)
      .map(item => item.trim())
      .filter(item => item)
      .map((item, idx) => <li key={idx}>{item}</li>);
  };

  // Prepare SEO data
  const pageTitle = loading 
    ? 'Loading... | EDGE SYSTEMS LTD'
    : error 
    ? 'Error | EDGE SYSTEMS LTD'
    : !product 
    ? 'Product Not Found | EDGE SYSTEMS LTD'
    : editMode 
    ? `Edit ${product.name} | EDGE SYSTEMS LTD`
    : generatePageTitle(product);

  const metaDescription = product ? generateMetaDescription(product) : '';
  const canonicalUrl = product ? getCanonicalUrl(product) : '';
  const imageUrl = product?.image || '/placeholder.png';

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Title>{pageTitle}</Title>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Title>{pageTitle}</Title>
        <Meta name="robots" content="noindex" />
        <h2>Error Loading Product</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className={styles.ctaButton}>Return to Home</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <Title>{pageTitle}</Title>
        <Meta name="robots" content="noindex" />
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or may have been removed.</p>
        <button onClick={() => navigate('/')} className={styles.ctaButton}>Browse Products</button>
      </div>
    );
  }

  if (editMode) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <Title>{pageTitle}</Title>
        <Meta name="robots" content="noindex" />
        <ProductForm
          initialValues={product}
          onSubmit={handleEditSubmit}
          onCancel={() => navigate(`/product/${productSlug}`)}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ✅ DYNAMIC SEO META TAGS using react-head */}
      <Title>{pageTitle}</Title>
      
      <Meta name="description" content={metaDescription} />
      
      <Link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph tags */}
      <Meta property="og:title" content={pageTitle} />
      <Meta property="og:description" content={metaDescription} />
      <Meta property="og:image" content={imageUrl} />
      <Meta property="og:url" content={canonicalUrl} />
      <Meta property="og:type" content="product" />
      <Meta property="og:site_name" content="EDGE SYSTEMS LTD" />
      
      {/* Twitter Card tags */}
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={pageTitle} />
      <Meta name="twitter:description" content={metaDescription} />
      <Meta name="twitter:image" content={imageUrl} />

      <Breadcrumbs crumbs={[
        { label: 'Home', path: '/' },
        ...(categoryName && categorySlug ? [{ label: categoryName, path: `/category/${categorySlug}` }] : []),
        ...(subcategoryName && subcategorySlug ? [{ label: subcategoryName, path: `/category/${categorySlug}#${subcategorySlug}` }] : []),
        { label: product.name, path: `/product/${product.slug}` }
      ]} />

      <section className={styles.section}>
        <div className={styles.detailContainer}>
          {/* Left Side: Product Image and Documentation */}
          <div className={styles.leftColumn}>
            <div className={styles.imageArea}>
              <img
                src={product.image}
                alt={product.name}
                className={styles.mainImage}
                onClick={() => setShowLightbox(true)}
                style={{ cursor: 'zoom-in' }}
                onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
              />
              {showLightbox && (
                <div className={styles.lightbox} onClick={() => setShowLightbox(false)}>
                  <img src={product.image} alt={product.name} className={styles.lightboxImage} />
                </div>
              )}
            </div>
            
            {product.documentation_url && (
              <div className={styles.documentation}>
                <b>Documentation:</b>{" "}
                <a href={product.documentation_url} target="_blank" rel="noopener noreferrer">
                  {product.documentation_label || 'View Documentation'}
                </a>
              </div>
            )}
          </div>

          {/* Right Side: Product Info */}
          <div className={styles.rightColumn}>
            <div className={styles.productInfo}>
              <h1 className={styles.productTitle}>{product.name}</h1>
              
              <div className={styles.ctaRow}>
                <div className={styles.quantityArea}>
                  <label htmlFor="quantity" className={styles.label}>Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    min="1"
                    className={styles.quantityInput}
                    onChange={handleQuantityChange}
                  />
                </div>
                <button className={styles.ctaButton} onClick={handleAddToCart}>Add to Cart</button>
                <button 
                  className={styles.askPriceButton}
                  onClick={handleWhatsAppClick}
                  aria-label={`Ask for prices on ${product.name} via WhatsApp`}
                  title="Ask for Prices via WhatsApp"
                >
                  <svg className={styles.whatsappIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..."/>
                  </svg>
                  Ask for Price
                </button>
              </div>
              
              <div className={styles.stockStatus}>
                IN STOCK
              </div>
            </div>
          </div>
        </div>

        {/* Description and Features */}
        <div className={styles.descriptionFeaturesSection}>
          {product.description && (
            <div className={styles.description}>
              <b>Description:</b>
              <p>{product.description}</p>
            </div>
          )}

          {product.features && (
            <div className={styles.featuresStandalone}>
              <b>Features:</b>
              <ul className={styles.featureList}>
                {renderTextList(product.features)}
              </ul>
            </div>
          )}
        </div>

        {/* Specifications Section */}
        {product.spec_tables && product.spec_tables.length > 0 && (
          <div className={styles.fullWidthSections}>
            <div className={styles.specs}>
              <b>Specifications:</b>
              {product.spec_tables.map((table, tableIdx) => (
                <div key={tableIdx} className={styles.specTableWrapper}>
                  {table.title && <h4>{table.title}</h4>}
                  <table className={styles.specTable}>
                    <tbody>
                      {table.rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          <td className={styles.specKey}>{row.key}</td>
                          <td className={styles.specValue}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products Carousel Section */}
        <ProductCarousel productSlug={productSlug} />

      </section>

      {/* ✅ ENHANCED Schema.org structured data with Brand, SKU, and Seller */}
      {product.price && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": imageUrl,
            "description": metaDescription,
            "sku": product.sku || product.slug,
            "mpn": product.sku || product.slug,
            "brand": {
              "@type": "Brand",
              "name": product.brand || "Generic"
            },
            "offers": {
              "@type": "Offer",
              "url": canonicalUrl,
              "priceCurrency": "KES",
              "price": product.price,
              "availability": product.status === 'in_stock' 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "EDGE SYSTEMS LTD"
              }
            }
          })}
        </script>
      )}
    </div>
  );
};

export default ProductDetail;