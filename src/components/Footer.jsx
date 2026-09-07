import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InstagramIcon from '../assets/Instagram.png';
import LinkedInIcon from '../assets/LinkedIn.png';
import TiktokIcon from '../assets/Tiktok.png';
import FacebookIcon from '../assets/Facebook.png';
import WhatsAppIcon from '../assets/whatsapp.png';
import styles from './Footer.module.css';

const Footer = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllBlogs, setShowAllBlogs] = useState(false);

  useEffect(() => {
    // Fetch latest blogs for footer
    fetch('http://127.0.0.1:8000/api/blogs/footer/')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched blogs:', data);
        setBlogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching footer blogs:', err);
        setLoading(false);
      });
  }, []);

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    
    return imageUrl;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Truncate title to fit nicely
  const truncateTitle = (title, maxLength = 50) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // Show 3 blogs initially
  const initialDisplayCount = 3;
  const displayedBlogs = showAllBlogs ? blogs : blogs.slice(0, initialDisplayCount);
  const hasMoreBlogs = blogs.length > initialDisplayCount;

  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.footer}>
        {/* First Column - Company Info */}
        <div className={styles.footerColumn}>
          <h3 className={styles.sectionTitle}>Edge Systems Limited</h3>
          <p className={styles.companyDescription}>
            Your trusted partner for fire safety, networking & ICT solutions, and solar energy systems in Kenya. 
            Protecting lives, connecting businesses, and powering the future.
          </p>
          <div className={styles.socialLinks}>
            <a 
              href="https://www.linkedin.com/in/edge-systems-903b32222?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialLink}
              aria-label="LinkedIn"
            >
              <img src={LinkedInIcon} alt="LinkedIn" className={styles.socialIcon} />
            </a>
            <a 
              href="https://www.facebook.com/edgesystemslimited" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialLink}
              aria-label="Facebook"
            >
              <img src={FacebookIcon} alt="Facebook" className={styles.socialIcon} />
            </a>
            <a 
              href="https://www.instagram.com/edge_systems.co.ke?utm_source=qr&igsh=aHpldnhnZnRmYjM3" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialLink}
              aria-label="Instagram"
            >
              <img src={InstagramIcon} alt="Instagram" className={styles.socialIcon} />
            </a>
            <a 
              href="https://www.tiktok.com/@edgesystems6?_t=ZM-8yCr3l8iIwn&_r=1" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialLink}
              aria-label="TikTok"
            >
              <img src={TiktokIcon} alt="TikTok" className={styles.socialIcon} />
            </a>
            <a 
              href="https://wa.me/254117320000" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialLink}
              aria-label="WhatsApp"
            >
              <img src={WhatsAppIcon} alt="WhatsApp" className={styles.socialIcon} />
            </a>
          </div>
        </div>

        {/* Second Column - Quick Links */}
        <div className={styles.footerColumn}>
          <h3 className={styles.sectionTitle}>Quick Links</h3>
          <ul className={styles.quickLinks} role="navigation" aria-label="Quick Links">
            <li>
              <Link 
                to="/" 
                className={styles.quickLink} 
                onClick={scrollToTop}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={styles.quickLink} 
                onClick={scrollToTop}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={styles.quickLink} 
                onClick={scrollToTop}
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Third Column - Contact Info */}
        <div className={styles.footerColumn}>
          <h3 className={styles.sectionTitle}>Contact Us</h3>
          <ul className={styles.contactInfo}>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>📍</span>
              <span>Shelter house, Dai dai Road, South B, Ground Floor Apartment GF4, Nairobi</span>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>☎️</span>
              <span>+254 721 247 356 / 0117320000</span>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>📧</span>
              <span>info@edgesystems.co.ke</span>
            </li>
          </ul>
        </div>

        {/* Fourth Column - Latest Blog Posts (Small Icon + Title) */}
        <div className={styles.footerColumn}>
          <h3 className={styles.sectionTitle}>Latest Updates</h3>
          {loading ? (
            <p className={styles.blogLoading}>Loading...</p>
          ) : blogs.length > 0 ? (
            <div className={styles.blogSection}>
              <ul className={styles.blogList}>
                {displayedBlogs.map((blog) => (
                  <li key={blog.id} className={styles.blogItem}>
                    <Link 
                      to={`/blog/${blog.slug}`} 
                      className={styles.blogLink}
                      onClick={scrollToTop}
                    >
                      <img 
                        src={getFullImageUrl(blog.image)} 
                        alt={blog.title}
                        className={styles.blogIcon}
                      />
                      <span className={styles.blogTitle}>
                        {truncateTitle(blog.title)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* Show More / Show Less Button */}
              {hasMoreBlogs && (
                <button 
                  onClick={() => setShowAllBlogs(!showAllBlogs)}
                  className={styles.toggleButton}
                  aria-expanded={showAllBlogs}
                >
                  {showAllBlogs ? (
                    <>
                      <span>Show Less</span>
                      <span className={styles.toggleIcon}>▲</span>
                    </>
                  ) : (
                    <>
                      <span>Show More ({blogs.length - initialDisplayCount} more)</span>
                      <span className={styles.toggleIcon}>▼</span>
                    </>
                  )}
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
          © 2025 Edge Systems Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;