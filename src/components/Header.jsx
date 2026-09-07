import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import CompanyLogo from '../assets/Company_logo.webp';
import InstagramIcon from '../assets/Instagram.png';
import LinkedInIcon from '../assets/LinkedIn.png';
import TiktokIcon from '../assets/Tiktok.png';
import FacebookIcon from '../assets/Facebook.png';
import WhatsAppIcon from '../assets/whatsapp.png';
import styles from './Header.module.css';
import { fetchCategories, fetchSubcategories } from '../utils/api';
import { useCart } from '../context/CartContext';
import CartModal from './CartModal';
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaChevronDown, FaBars, FaTimes, FaChevronRight } from "react-icons/fa";

const Header = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null);
  const [mobileExpandedSubcategory, setMobileExpandedSubcategory] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const navigate = useNavigate();
  const allCategoriesRef = useRef();
  const fireRef = useRef();
  const ictRef = useRef();
  const solarRef = useRef();
  const { cartItems } = useCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [isHoveringCartIcon, setIsHoveringCartIcon] = useState(false);
  const [isHoveringCartModal, setIsHoveringCartModal] = useState(false);
  const cartTimeoutRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        setCategories([]);
      }
    };
    loadCategories();
    const handleCategoriesUpdated = () => loadCategories();
    window.addEventListener('categoriesUpdated', handleCategoriesUpdated);
    return () => window.removeEventListener('categoriesUpdated', handleCategoriesUpdated);
  }, []);

  useEffect(() => {
    return () => {
      if (cartTimeoutRef.current) clearTimeout(cartTimeoutRef.current);
    };
  }, []);

  const loadSubcategories = async (categorySlug) => {
    if (subcategoriesMap[categorySlug]) return;
    try {
      const subs = await fetchSubcategories(categorySlug);
      setSubcategoriesMap(prev => ({
        ...prev,
        [categorySlug]: Array.isArray(subs) ? subs : []
      }));
    } catch (e) {
      setSubcategoriesMap(prev => ({
        ...prev,
        [categorySlug]: []
      }));
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        allCategoriesRef.current && !allCategoriesRef.current.contains(e.target) &&
        fireRef.current && !fireRef.current.contains(e.target) &&
        ictRef.current && !ictRef.current.contains(e.target) &&
        solarRef.current && !solarRef.current.contains(e.target)
      ) {
        setOpenDropdown(null);
        setExpandedCategories(new Set());
        setHoveredCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && !e.target.closest(`.${styles.mobileMenu}`) && !e.target.closest(`.${styles.mobileHamburger}`)) {
        setMobileMenuOpen(false);
        setMobileExpandedCategory(null);
        setMobileExpandedSubcategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const handleCartIconMouseEnter = () => {
    if (cartTimeoutRef.current) clearTimeout(cartTimeoutRef.current);
    setIsHoveringCartIcon(true);
    setCartOpen(true);
  };

  const handleCartIconMouseLeave = () => {
    setIsHoveringCartIcon(false);
    cartTimeoutRef.current = setTimeout(() => {
      if (!isHoveringCartModal) setCartOpen(false);
    }, 300);
  };

  const handleCartModalMouseEnter = () => {
    if (cartTimeoutRef.current) clearTimeout(cartTimeoutRef.current);
    setIsHoveringCartModal(true);
  };

  const handleCartModalMouseLeave = () => {
    setIsHoveringCartModal(false);
    cartTimeoutRef.current = setTimeout(() => {
      if (!isHoveringCartIcon) setCartOpen(false);
    }, 300);
  };

  const handleCloseCart = () => {
    setCartOpen(false);
    setIsHoveringCartIcon(false);
    setIsHoveringCartModal(false);
    if (cartTimeoutRef.current) clearTimeout(cartTimeoutRef.current);
  };

  const fireCategories = categories.filter(cat =>
    ['fire_safety','fire','fire-safety','firesafety'].includes(String(cat.type || '').toLowerCase())
  );

  const ictCategories = categories.filter(cat =>
    ['ict','telecom','telecommunication'].includes(String(cat.type || '').toLowerCase())
  );

  const solarCategories = categories.filter(cat =>
    ['solar', 'solar_solutions','solar-solutions'].includes(String(cat.type || '').toLowerCase())
  );

  const allCategoriesCombined = [...fireCategories, ...ictCategories, ...solarCategories];

  const handleDropdownToggle = (dropdownName) => {
    const isOpen = openDropdown === dropdownName;
    setOpenDropdown(isOpen ? null : dropdownName);
    setExpandedCategories(new Set());
    setHoveredCategory(null);

    if (!isOpen) {
      const categoryList =
        dropdownName === 'all' ? allCategoriesCombined :
        dropdownName === 'fire' ? fireCategories :
        dropdownName === 'ict' ? ictCategories :
        dropdownName === 'solar' ? solarCategories : [];

      categoryList.forEach(cat => loadSubcategories(cat.slug));
    }
  };

  const handleCategoryClick = (categorySlug) => {
    setOpenDropdown(null);
    setExpandedCategories(new Set());
    setHoveredCategory(null);
    setMobileMenuOpen(false);
    setMobileExpandedCategory(null);
    setMobileExpandedSubcategory(null);
    navigate(`/category/${categorySlug}`);
  };

  const handleSubcategoryClick = (categorySlug, subcategorySlug) => {
    setOpenDropdown(null);
    setExpandedCategories(new Set());
    setHoveredCategory(null);
    setMobileMenuOpen(false);
    setMobileExpandedCategory(null);
    setMobileExpandedSubcategory(null);
    navigate(`/category/${categorySlug}`, { state: { selectedSubcategory: subcategorySlug } });
  };

  const handleCategoryHover = (categorySlug) => {
    setHoveredCategory(categorySlug);
    loadSubcategories(categorySlug);
  };

  const handleCategoryLeave = () => {
    setTimeout(() => setHoveredCategory(null), 100);
  };

  const handleMobileCategoryClick = (categoryType) => {
    if (mobileExpandedCategory === categoryType) {
      setMobileExpandedCategory(null);
      setMobileExpandedSubcategory(null);
    } else {
      setMobileExpandedCategory(categoryType);
      setMobileExpandedSubcategory(null);
      const categoryList =
        categoryType === 'fire' ? fireCategories :
        categoryType === 'ict' ? ictCategories :
        categoryType === 'solar' ? solarCategories : [];
      categoryList.forEach(cat => loadSubcategories(cat.slug));
    }
  };

  const handleMobileSubcategoryToggle = (categorySlug) => {
    if (mobileExpandedSubcategory === categorySlug) {
      setMobileExpandedSubcategory(null);
    } else {
      setMobileExpandedSubcategory(categorySlug);
      loadSubcategories(categorySlug);
    }
  };

  const handleDropdownMouseLeave = () => {
    setOpenDropdown(null);
    setHoveredCategory(null);
  };

  const renderDesktopSimpleDropdown = (dropdownCategories, isOpen) => {
    if (!isOpen) return null;

    return (
      <div className={styles.megaDropdown} onMouseLeave={handleDropdownMouseLeave}>
        <div className={styles.simpleContainer}>
          {dropdownCategories.map(cat => (
            <button
              key={cat.id}
              className={styles.simpleDropdownItem}
              onClick={() => handleCategoryClick(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMobileCategorySection = (categoryList, categoryType, title) => (
    <div key={categoryType} className={styles.mobileCategorySection}>
      <button
        className={`${styles.mobileCategoryButton} ${mobileExpandedCategory === categoryType ? styles.expanded : ''}`}
        onClick={() => handleMobileCategoryClick(categoryType)}
      >
        <span>{title}</span>
        <FaChevronRight className={`${styles.mobileChevron} ${mobileExpandedCategory === categoryType ? styles.rotated : ''}`} />
      </button>

      {mobileExpandedCategory === categoryType && (
        <div className={styles.mobileSubcategoryContainer}>
          {categoryList.map(cat => {
            const categorySubcategories = subcategoriesMap[cat.slug] || [];
            const hasSubcategories = categorySubcategories.length > 0;

            return (
              <div key={cat.id} className={styles.mobileCategoryWrapper}>
                <div className={styles.mobileCategoryRow}>
                  <button
                    className={styles.mobileCategoryName}
                    onClick={() => handleCategoryClick(cat.slug)}
                  >
                    {cat.name}
                  </button>

                  {hasSubcategories && (
                    <button
                      className={styles.mobileSubcategoryToggle}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMobileSubcategoryToggle(cat.slug);
                      }}
                    >
                      <FaChevronRight
                        className={`${styles.mobileSubChevron} ${mobileExpandedSubcategory === cat.slug ? styles.rotated : ''}`}
                      />
                    </button>
                  )}
                </div>

                {hasSubcategories && mobileExpandedSubcategory === cat.slug && (
                  <div className={styles.mobileSubcategoryList}>
                    {categorySubcategories.map(sub => (
                      <button
                        key={sub.id}
                        className={styles.mobileSubcategoryItem}
                        onClick={() => handleSubcategoryClick(cat.slug, sub.slug)}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <header className={styles.header}>
      {/* Mobile Header Layout */}
      <div className={styles.mobileHeaderLayout}>
        <div className={styles.mobileTopBar}>
          <div className={styles.mobileTopBarContent}>
            <div className={styles.contactInfo}>
              <span className={styles.contactItem}>
                <FaMapMarkerAlt />
                Shelter house, Dai dai Road, South B, Nairobi
              </span>
              <span className={styles.contactItem}>
                <FaPhoneAlt />
                0721247356 / 0117320000
              </span>
              <span className={styles.contactItem}>
                <FaEnvelope />
                info@edgesystems.co.ke
              </span>
            </div>
          </div>
        </div>

        <div className={styles.mobileLogoRow}>
          <Link to="/">
            <img src={CompanyLogo} alt="Edge Systems Logo" className={styles.mobileLogo} />
          </Link>
        </div>

        <div className={styles.mobileSearchRow}>
          <button 
            className={styles.mobileHamburger}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FaBars />
          </button>

          <div className={styles.mobileSearchContainer}>
            <SearchBar />
          </div>

          <button onClick={() => setCartOpen(true)} className={styles.mobileCartButton}>
            🛒
            {cartItems.length > 0 && (
              <span className={styles.cartBadge}>{cartItems.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={styles.desktopHeaderLayout}>
        <div className={styles.topBar}>
          <div className={styles.topBarContent}>
            <span>
              <FaMapMarkerAlt style={{ marginRight: 6 }} />
              Shelter house, Dai dai Road, South B, Ground Floor Apartment GF4, Nairobi
            </span>
            <span>
              <FaPhoneAlt style={{ marginRight: 6 }} />
              0721247356 / 0117320000
            </span>
            <span>
              <FaEnvelope style={{ marginRight: 6 }} />
              info@edgesystems.co.ke
            </span>
          </div>
        </div>

        <div className={styles.mainHeader}>
          <div className={styles.logoContainer}>
            <Link to="/">
              <img src={CompanyLogo} alt="Edge Systems Logo" className={styles.logo} />
            </Link>
          </div>

          <div className={styles.headerActions}>
            <div ref={allCategoriesRef} className={styles.allCategoriesWrapper}>
              <button
                className={styles.allCategoriesButton}
                onClick={() => handleDropdownToggle('all')}
              >
                All Categories
                <FaChevronDown className={styles.allCategoriesChevron} />
              </button>
              {renderDesktopSimpleDropdown(allCategoriesCombined, openDropdown === 'all')}
            </div>

            <SearchBar />

            <button
              onMouseEnter={handleCartIconMouseEnter}
              onMouseLeave={handleCartIconMouseLeave}
              className={styles.cartButton}
              style={{ position: 'relative' }}
            >
              🛒
              {cartItems.length > 0 && (
                <span className={styles.cartBadge}>{cartItems.length}</span>
              )}
            </button>

            <div className={styles.socialMediaIcons}>
              <a href="https://www.linkedin.com/in/edge-systems-903b32222" target="_blank" rel="noopener noreferrer">
                <img src={LinkedInIcon} alt="LinkedIn" />
              </a>
              <a href="https://www.facebook.com/edgesystemslimited" target="_blank" rel="noopener noreferrer">
                <img src={FacebookIcon} alt="Facebook" />
              </a>
              <a href="https://www.instagram.com/edge_systems.co.ke" target="_blank" rel="noopener noreferrer">
                <img src={InstagramIcon} alt="Instagram" />
              </a>
              <a href="https://www.tiktok.com/@edgesystems6" target="_blank" rel="noopener noreferrer">
                <img src={TiktokIcon} alt="TikTok" />
              </a>
              <a href="https://wa.me/254117320000" target="_blank" rel="noopener noreferrer">
                <img src={WhatsAppIcon} alt="WhatsApp" />
              </a>
            </div>
          </div>
        </div>

        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            <li><Link to="/" className={styles.navLink}>Home</Link></li>

            <li ref={fireRef} className={styles.dropdownContainer}>
              <button
                className={styles.dropdownButton}
                onClick={() => handleDropdownToggle('fire')}
              >
                Fire Safety Products & Services
                <FaChevronDown className={styles.navChevron} />
              </button>
              {renderDesktopSimpleDropdown(fireCategories, openDropdown === 'fire')}
            </li>

            <li ref={ictRef} className={styles.dropdownContainer}>
              <button
                className={styles.dropdownButton}
                onClick={() => handleDropdownToggle('ict')}
              >
                ICT/Telecommunication Products & Services
                <FaChevronDown className={styles.navChevron} />
              </button>
              {renderDesktopSimpleDropdown(ictCategories, openDropdown === 'ict')}
            </li>

            <li ref={solarRef} className={styles.dropdownContainer}>
              <Link to="/category/solar-power-solutions" className={styles.navLink}>
                Solar Power Solutions
              </Link>
            </li>

            <li><Link to="/contact" className={styles.navLink}>Contact Us</Link></li>
          </ul>
        </nav>
      </div>

      {mobileMenuOpen && <div className={styles.mobileOverlay} />}

      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <h3>Menu</h3>
          <button 
            className={styles.mobileMenuClose}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.mobileMenuContent}>
          <Link 
            to="/" 
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>

          {renderMobileCategorySection(fireCategories, 'fire', 'Fire Safety Products & Services')}
          {renderMobileCategorySection(ictCategories, 'ict', 'ICT/Telecommunication Products & Services')}

          <Link 
            to="/category/solar-power-solutions" 
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Solar Power Solutions
          </Link>

          <Link 
            to="/contact" 
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact Us
          </Link>
        </div>
      </div>

      {cartOpen && (
        <div
          onMouseEnter={handleCartModalMouseEnter}
          onMouseLeave={handleCartModalMouseLeave}
        >
          <CartModal onClose={handleCloseCart} />
        </div>
      )}
    </header>
  );
};

export default Header;