import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import CompanyLogo from '../assets/MarincLogo.jpg';
import styles from './Header.module.css';
import { fetchCategories, fetchSubcategories } from '../utils/api';
import { useCart } from '../context/CartContext';
import QuoteDrawer from './QuoteDrawer';
import MobileBottomBar from './MobileBottomBar';
import SearchBar from './SearchBar';
import ZoneTag from './ZoneTag';
import { filterByZone, ZONES } from '../utils/zones';
import { CONTACT } from '../config/contact';
import {
  FaChevronDown,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6';

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

  const zoneLists = { fire: fireCategories, ict: ictCategories };

  const openMenu = (zoneId) => {
    setOpenDropdown(zoneId);
    // Only the categories actually shown in the mega menu (first 9)
    (zoneLists[zoneId] || []).slice(0, 9).forEach((cat) => loadSubcategories(cat.slug));
  };

  const handleDropdownToggle = (zoneId) => {
    if (openDropdown === zoneId) setOpenDropdown(null);
    else openMenu(zoneId);
  };

  // Hover-to-open only on devices that really hover (avoids double-toggle on touch)
  const handleHoverOpen = (zoneId) => {
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      openMenu(zoneId);
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
    }
  };

  const handleMobileSubToggle = (catSlug) => {
    const next = mobileExpandedSubcategory === catSlug ? null : catSlug;
    setMobileExpandedSubcategory(next);
    if (next) loadSubcategories(catSlug);
  };

  // Where the "Fire Safety" / "ICT & Security" label itself takes the visitor
  const zoneLink = (zoneId) => {
    const first = (zoneLists[zoneId] || [])[0];
    return first ? `/category/${first.slug}` : '/';
  };

  const navClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navActive : ''}`.trim();

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
        aria-expanded={mobileExpandedCategory === categoryType}
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

  const renderZoneNavItem = (zoneId, label, ref) => (
    <li
      ref={ref}
      className={styles.navItem}
      onMouseEnter={() => handleHoverOpen(zoneId)}
    >
      <div
        className={`${styles.zoneItem} ${styles[zoneId === 'fire' ? 'zoneFire' : 'zoneIct']} ${
          openDropdown === zoneId ? styles.zoneOpen : ''
        }`}
      >
        <Link to={zoneLink(zoneId)} className={styles.zoneLabel} onClick={closeAll}>
          {label}
        </Link>
        <button
          type="button"
          className={styles.zoneToggle}
          onClick={() => handleDropdownToggle(zoneId)}
          aria-expanded={openDropdown === zoneId}
          aria-label={`Show ${label} categories`}
        >
          <FaChevronDown className={styles.chevron} />
        </button>
      </div>
      {renderMegaMenu(zoneId, zoneLists[zoneId], openDropdown === zoneId)}
    </li>
  );

  return (
    <>
      {/* Top bar: contact details + social */}
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.topbarContact}>
            <span className={styles.topbarItem}>
              <FaPhoneAlt className={styles.topbarIcon} aria-hidden="true" />
              <a href={`tel:${CONTACT.phones[0].tel}`}>{CONTACT.phones[0].display}</a>
              <span className={styles.topbarSep} aria-hidden="true">/</span>
              <a href={`tel:${CONTACT.phones[1].tel}`}>{CONTACT.phones[1].display}</a>
            </span>
            <a
              href={`mailto:${CONTACT.email}`}
              className={`${styles.topbarItem} ${styles.topbarEmail}`}
            >
              <FaEnvelope className={styles.topbarIcon} aria-hidden="true" />
              {CONTACT.email}
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Shelter+House+Dai+Dai+Road+South+B+Nairobi"
              target= "blank"
              rel="noopener noreferrer"
              className={styles.topbarItem}

            >  
              <FaMapMarkerAlt className={styles.topbarIcon} aria-hidden="true" />
              Said Bin Seif Building, Meru Road, Opposite Fantasy Restaurant
            </a>

          </div>
           
          <div className={styles.topbarSocial}>
            <a href={CONTACT.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href={CONTACT.social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok />
            </a>
            <a href={CONTACT.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>

      <header className={`${styles.header} ${scrolled ? styles.condensed : ''}`}>
        <div className={styles.bar}>
          <Link to="/" className={styles.logoLink} onClick={closeAll}>
            <img src={CompanyLogo} alt="Marinc Systems" className={styles.logo} />
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <NavLink to="/" end className={navClass} onClick={closeAll}>Home</NavLink>
              </li>

              {renderZoneNavItem('fire', 'Fire Safety', fireRef)}
              {renderZoneNavItem('ict', 'ICT & Security', ictRef)}

              <li className={styles.navItem}>
                <NavLink to="/services" className={navClass} onClick={closeAll}>Services</NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink to="/about" className={navClass} onClick={closeAll}>About</NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink to="/contact" className={navClass} onClick={closeAll}>Contact</NavLink>
              </li>
            </ul>
          </nav>

          <div className={styles.actions}>
            <div className={styles.searchDesktop}>
              <SearchBar onSearch={closeAll} />
            </div>
            <button
              type="button"
              className={styles.quoteBtn}
              onClick={() => setQuoteOpen(true)}
            >
              Quote List
              {quoteCount > 0 && <span className={styles.quoteCount}>{quoteCount}</span>}
            </button>
          </div>

          {/* Mobile / tablet controls */}
          <div className={styles.mobileControls}>
            <button
              type="button"
              className={styles.quoteBtn}
              onClick={() => setQuoteOpen(true)}
            >
              Quote
              {quoteCount > 0 && <span className={styles.quoteCount}>{quoteCount}</span>}
            </button>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
          </div>
        </div>

        {/* Search row for tablet / mobile */}
        <div className={styles.searchRow}>
          <SearchBar onSearch={closeAll} />
        </div>
      </header>

      {/* Full-screen mobile menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-modal="true" aria-label="Menu">
          <div className={styles.mobileMenuHeader}>
            <img src={CompanyLogo} alt="Marinc Systems" className={styles.mobileMenuLogo} />
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
            <Link to="/" className={styles.mobileFlat} onClick={closeAll}>Home</Link>
            {renderMobileSection(fireCategories, 'fire', 'Fire Safety', 'fire')}
            {renderMobileSection(ictCategories, 'ict', 'ICT & Security', 'ict')}
            <Link to="/services" className={styles.mobileFlat} onClick={closeAll}>Services</Link>
            <Link to="/about" className={styles.mobileFlat} onClick={closeAll}>About</Link>
            <Link to="/contact" className={styles.mobileFlat} onClick={closeAll}>Contact</Link>
            {CONTACT.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className={styles.mobileFlat}>
                Call {p.display}
              </a>
            ))}
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileFlat}
            >
              WhatsApp {CONTACT.phones[0].display}
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