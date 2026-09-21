import { API_BASE_URL } from '../config/api';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronUp } from 'react-icons/fa';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6';

const Footer = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllBlogs, setShowAllBlogs] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/blogs/footer/`)
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching footer blogs:', err);
        setLoading(false);
      });
  }, []);

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${API_BASE_URL}${imageUrl}`;
    return imageUrl;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const truncateTitle = (title, maxLength = 50) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const initialDisplayCount = 3;
  const displayedBlogs = showAllBlogs ? blogs : blogs.slice(0, initialDisplayCount);
  const hasMoreBlogs = blogs.length > initialDisplayCount;

  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.footer}>
        {/* Company Info */}
        <div className={styles.footerColumn}>
          <h3 className={styles.sectionTitle}>Marinc Systems Limited</h3>
          <p className={styles.companyDescription}>
            Your trusted partner for fire safety, networking & ICT solutions, and solar energy systems in Kenya.
            Protecting lives, connecting businesses, and powering the future.
          </p>
          <div className={styles.socialLinks}>
            <a href="https://www.facebook.com/share/1EdzJithHP/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://www.instagram.com/marincsystemske?stkn=MTE5ODJxcXlmaHcxMw==" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://www.tiktok.com/@marincsystemske?_r=1&_t=ZS-99ntiuRObX5" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="TikTok">
              <FaTiktok />
            </a>
            <a href="https://wa.me/254113808073" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.footerColumn}>
          <h3 className={styles.sectionTitle}>Quick Links</h3>
          <ul className={styles.quickLinks} role="navigation" aria-label="Quick Links">
            <li><Link to="/" className={styles.quickLink} onClick={scrollToTop}>Home</Link></li>
            <li><Link to="/about" className={styles.quickLink} onClick={scrollToTop}>About Us</Link></li>
            <li><Link to="/contact" className={styles.quickLink} onClick={scrollToTop}>Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className={styles.footerColumn}>
          <h3 className={styles.sectionTitle}>Contact Us</h3>
          <ul className={styles.contactInfo}>
            <li className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <span>Said Bin Seif Building, Meru Road, Mombasa, Opp. Fantasy Restaurant</span>
            </li>
            <li className={styles.contactItem}>
              <FaPhoneAlt className={styles.contactIcon} />
              <span>+254 721 247 356 / +254 111 808073</span>
            </li>
            <li className={styles.contactItem}>
              <FaEnvelope className={styles.contactIcon} />
              <span>info@marincsystems.co.ke</span>
            </li>
          </ul>
        </div>

        {/* Latest Blog Posts */}
        <div className={styles.footerColumn}>
          <h3 className={styles.sectionTitle}>Latest Updates</h3>
          {loading ? (
            <p className={styles.blogLoading}>Loading...</p>
          ) : blogs.length > 0 ? (
            <div className={styles.blogSection}>
              <ul className={styles.blogList}>
                {displayedBlogs.map((blog) => (
                  <li key={blog.id} className={styles.blogItem}>
                    <Link to={`/blog/${blog.slug}`} className={styles.blogLink} onClick={scrollToTop}>
                      <img src={getFullImageUrl(blog.image)} alt={blog.title} className={styles.blogIcon} />
                      <span className={styles.blogTitle}>{truncateTitle(blog.title)}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {hasMoreBlogs && (
                <button
                  onClick={() => setShowAllBlogs(!showAllBlogs)}
                  className={styles.toggleButton}
                  aria-expanded={showAllBlogs}
                >
                  {showAllBlogs ? (
                    <span>Show Less</span>
                  ) : (
                    <span>Show More ({blogs.length - initialDisplayCount} more)</span>
                  )}
                  <FaChevronUp className={`${styles.toggleIcon} ${showAllBlogs ? '' : styles.toggleIconDown}`} />
                </button>
              )}
            </div>
          ) : (
            <p className={styles.noBlog}>No updates available</p>
          )}
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className={styles.copyrightBar}>
        <p className={styles.copyrightText}>
          © {new Date().getFullYear()} Marinc Systems Ltd. All rights reserved.
        </p>
        <button className={styles.backToTop} onClick={scrollToTop} aria-label="Back to top">
          <FaChevronUp />
        </button>
      </div>
    </footer>
  );
};

export default Footer;