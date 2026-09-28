import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CompanyLogo from '../assets/MarincLogo.jpg';
import styles from './Header.module.css';
import { fetchCategories, fetchSubcategories } from '../utils/api';
import { useCart } from '../context/CartContext';
import QuoteDrawer from './QuoteDrawer';
import MobileBottomBar from './MobileBottomBar';
import ZoneTag from './ZoneTag';
import { filterByZone, ZONES } from '../utils/zones';
import { FaChevronDown, FaBars, FaTimes, FaChevronRight, FaPhoneAlt } from 'react-icons/fa';

const PHONE_DISPLAY = '0721 247 356';
const PHONE_TEL = '0721247356';

const Header = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null);
  const [mobileExpandedSubcategory, setMobileExpandedSubcategory] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const navigate = useNavigate();
  const fireRef = useRef();
  const ictRef = useRef();
  const loadingSubs = useRef(new Set()); // slugs currently being fetched
  const { cartItems, getTotalItems } = useCart();
  const quoteCount = getTotalItems ? getTotalItems() : cartItems.length;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading categories:', err);
        // Keep whatever we already have instead of wiping the menu
      }
    };
    loadCategories();
    const handleCategoriesUpdated = () => loadCategories();
    window.addEventListener('categoriesUpdated', handleCategoriesUpdated);
    return () => window.removeEventListener('categoriesUpdated', handleCategoriesUpdated);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        fireRef.current && !fireRef.current.contains(e.target) &&
        ictRef.current && !ictRef.current.contains(e.target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const loadSubcategories = async (categorySlug) => {
    if (subcategoriesMap[categorySlug] || loadingSubs.current.has(categorySlug)) return;
    loadingSubs.current.add(categorySlug);
    try {
      const subs = await fetchSubcategories(categorySlug);
      setSubcategoriesMap((prev) => ({
        ...prev,
        [categorySlug]: Array.isArray(subs) ? subs : [],
      }));
    } catch (err) {
      // Do NOT store [] here. Leaving it unset lets the next menu open retry.
      console.error(`Error loading subcategories for ${categorySlug}:`, err);
    } finally {
      loadingSubs.current.delete(categorySlug);
    }
  };

  const fireCategories = filterByZone(categories, 'fire');
  const ictCategories = filterByZone(categories, 'ict');
  const solarCategories = filterByZone(categories, 'solar');

  const handleDropdownToggle = (dropdownName) => {
    const isOpen = openDropdown === dropdownName;
    setOpenDropdown(isOpen ? null : dropdownName);
    if (!isOpen) {
      const list = dropdownName === 'fire' ? fireCategories : ictCategories;
      // Only the categories actually shown in the mega menu (first 9)
      list.slice(0, 9).forEach((cat) => loadSubcategories(cat.slug));
    }
  };

  const closeAll = () => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    setMobileExpandedCategory(null);
    setMobileExpandedSubcategory(null);
  };

  const handleCategoryClick = (categorySlug) => {
    closeAll();
    navigate(`/category/${categorySlug}`);
  };

  const handleSubcategoryClick = (categorySlug, subcategorySlug) => {
    closeAll();
    navigate(`/category/${categorySlug}`, { state: { selectedSubcategory: subcategorySlug } });
  };

  const handleMobileCategoryClick = (categoryType) => {
    if (mobileExpandedCategory === categoryType) {
      setMobileExpandedCategory(null);
      setMobileExpandedSubcategory(null);
    } else {
      setMobileExpandedCategory(categoryType);
      setMobileExpandedSubcategory(null);
      // Subcategories for mobile are loaded lazily when a category row is expanded
    }
  };

  const handleMobileSubToggle = (catSlug) => {
    const next = mobileExpandedSubcategory === catSlug ? null : catSlug;
    setMobileExpandedSubcategory(next);
    if (next) loadSubcategories(catSlug);
  };

  const renderMegaMenu = (zoneId, categoryList, isOpen) => {
    if (!isOpen) return null;
    const zone = ZONES[zoneId];
    const columns = categoryList.slice(0, 9);

    return (
      <div
        className={styles.megaMenu}
        style={{ '--zone-color': zone.color }}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <div className={styles.megaRule} aria-hidden="true" />
        <div className={styles.megaInner}>
          <ZoneTag zone={zoneId} className={styles.megaTag} />
          <div className={styles.megaColumns}>
            {columns.map((cat) => {
              const subs = subcategoriesMap[cat.slug] || [];
              return (
                <div key={cat.id} className={styles.megaCol}>
                  <button
                    type="button"
                    className={styles.megaCat}
                    onClick={() => handleCategoryClick(cat.slug)}
                  >
                    {cat.name}
                    <span className={styles.megaArrow} aria-hidden="true">→</span>
                  </button>
                  {subs.length > 0 && (
                    <ul className={styles.megaSubs}>
                      {subs.slice(0, 6).map((sub) => (
                        <li key={sub.id}>
                          <button
                            type="button"
                            className={styles.megaSub}
                            onClick={() => handleSubcategoryClick(cat.slug, sub.slug)}
                          >
                            {sub.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
          {categoryList.length === 0 && (
            <p className={styles.megaEmpty}>Categories loading…</p>
          )}
        </div>
      </div>
    );
  };

  const renderMobileSection = (categoryList, categoryType, title, zoneId) => (
    <div key={categoryType} className={styles.mobileSection}>
      <button
        type="button"
        className={`${styles.mobileRow} ${mobileExpandedCategory === categoryType ? styles.mobileRowOpen : ''}`}
        style={{ '--zone-color': ZONES[zoneId]?.color }}
        onClick={() => handleMobileCategoryClick(categoryType)}
      >
        <span className={styles.mobileRowLabel}>
          <span className={styles.mobileSwatch} aria-hidden="true" />
          {title}
        </span>
        <FaChevronRight
          className={`${styles.mobileChevron} ${mobileExpandedCategory === categoryType ? styles.rotated : ''}`}
        />
      </button>

      {mobileExpandedCategory === categoryType && (
        <div className={styles.mobileExpand}>
          {categoryList.map((cat) => {
            const subs = subcategoriesMap[cat.slug] || [];
            return (
              <div key={cat.id} className={styles.mobileCatBlock}>
                <div className={styles.mobileCatRow}>
                  <button
                    type="button"
                    className={styles.mobileCatName}
                    onClick={() => handleCategoryClick(cat.slug)}
                  >
                    {cat.name}
                  </button>
                  <button
                    type="button"
                    className={styles.mobileSubToggle}
                    onClick={() => handleMobileSubToggle(cat.slug)}
                    aria-label={`Expand ${cat.name}`}
                  >
                    <FaChevronRight
                      className={`${styles.mobileChevron} ${mobileExpandedSubcategory === cat.slug ? styles.rotated : ''}`}
                    />
                  </button>
                </div>
                {mobileExpandedSubcategory === cat.slug && (
                  <ul className={styles.mobileSubList}>
                    {subs.map((sub) => (
                      <li key={sub.id}>
                        <button
                          type="button"
                          className={styles.mobileSubItem}
                          onClick={() => handleSubcategoryClick(cat.slug, sub.slug)}
                        >
                          {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Optional campaign / emergency strip */}
      <div className={styles.emergencyStrip}>
        <span className={styles.emergencyDot} aria-hidden="true" />
        <span>24-HOUR CALL-OUT · </span>
        <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
      </div>

      <header className={`${styles.header} ${scrolled ? styles.condensed : ''}`}>
        <div className={styles.bar}>
          <Link to="/" className={styles.logoLink} onClick={closeAll}>
            <img src={CompanyLogo} alt="Marinc Systems" className={styles.logo} />
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <ul className={styles.navList}>
              <li ref={fireRef} className={styles.navItem}>
                <button
                  type="button"
                  className={`${styles.navLink} ${styles.zoneFire}`}
                  onClick={() => handleDropdownToggle('fire')}
                  aria-expanded={openDropdown === 'fire'}
                >
                  Fire Safety
                  <FaChevronDown className={styles.chevron} />
                </button>
                {renderMegaMenu('fire', fireCategories, openDropdown === 'fire')}
              </li>

              <li ref={ictRef} className={styles.navItem}>
                <button
                  type="button"
                  className={`${styles.navLink} ${styles.zoneIct}`}
                  onClick={() => handleDropdownToggle('ict')}
                  aria-expanded={openDropdown === 'ict'}
                >
                  ICT &amp; Security
                  <FaChevronDown className={styles.chevron} />
                </button>
                {renderMegaMenu('ict', ictCategories, openDropdown === 'ict')}
              </li>

              <li className={styles.navItem}>
                <Link
                  to="/category/solar-power-solutions"
                  className={`${styles.navLink} ${styles.zoneSolar}`}
                >
                  Solar &amp; Power
                </Link>
              </li>

              <li className={styles.navItem}>
                <Link to="/services" className={styles.navLink}>Services</Link>
              </li>

              <li className={styles.navItem}>
                <Link to="/about" className={styles.navLink}>About</Link>
              </li>
            </ul>
          </nav>

          <div className={styles.actions}>
            <a href={`tel:${PHONE_TEL}`} className={styles.phone}>
              <FaPhoneAlt className={styles.phoneIcon} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <button
              type="button"
              className={styles.quoteBtn}
              onClick={() => setQuoteOpen(true)}
            >
              Quote List
              {quoteCount > 0 && (
                <span className={styles.quoteCount}>{quoteCount}</span>
              )}
            </button>
          </div>

          {/* Mobile controls */}
          <div className={styles.mobileControls}>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
            <button
              type="button"
              className={styles.quoteBtn}
              onClick={() => setQuoteOpen(true)}
            >
              Quote
              {quoteCount > 0 && (
                <span className={styles.quoteCount}>{quoteCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-modal="true" aria-label="Menu">
          <div className={styles.mobileMenuHeader}>
            <img src={CompanyLogo} alt="" className={styles.mobileMenuLogo} />
            <button
              type="button"
              className={styles.mobileClose}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>
          <div className={styles.mobileMenuBody}>
            {renderMobileSection(fireCategories, 'fire', 'Fire Safety', 'fire')}
            {renderMobileSection(ictCategories, 'ict', 'ICT & Security', 'ict')}
            {renderMobileSection(solarCategories, 'solar', 'Solar & Power', 'solar')}
            <Link to="/services" className={styles.mobileFlat} onClick={closeAll}>Services</Link>
            <Link to="/about" className={styles.mobileFlat} onClick={closeAll}>About</Link>
            <Link to="/contact" className={styles.mobileFlat} onClick={closeAll}>Contact</Link>
            <a href={`tel:${PHONE_TEL}`} className={styles.mobileFlat}>
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      )}

      {quoteOpen && <QuoteDrawer onClose={() => setQuoteOpen(false)} />}

      <MobileBottomBar
        onQuoteOpen={() => setQuoteOpen(true)}
        quoteCount={quoteCount}
      />
    </>
  );
};

export default Header;