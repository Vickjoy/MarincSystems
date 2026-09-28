import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6';
import ZoneTag from './ZoneTag';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.wordmark} aria-hidden="true">
          Simplifying Solutions.
        </p>

        <div className={styles.grid}>
          <div className={styles.col}>
            <ZoneTag zone="fire" label="ZONE 01 · FIRE SAFETY" onDark />
            <ul className={styles.links}>
              <li><Link to="/category/addressable-fire-alarm-detection-systems">Addressable Fire Alarm</Link></li>
              <li><Link to="/category/conventional-fire-alarm-detection-systems">Conventional Fire Alarm</Link></li>
              <li><Link to="/category/emergency-voice-communication-systems">Emergency Voice Communication</Link></li>
            </ul>
          </div>

          <div className={styles.col}>
            <ZoneTag zone="ict" label="ZONE 02 · ICT & SECURITY" onDark />
            <ul className={styles.links}>
              <li><Link to="/category/giganet-products">Structured Cabling</Link></li>
              <li><Link to="/category/hikvision">Security &amp; Surveillance</Link></li>
              <li><Link to="/category/alcatel-lucent-products">Access Control</Link></li>
            </ul>
          </div>

          <div className={styles.col}>
            <ZoneTag zone="solar" label="ZONE 04 · SOLAR & POWER" onDark />
            <ul className={styles.links}>
              <li><Link to="/category/solar-power-solutions">Solar Power Solutions</Link></li>
              <li><Link to="/contact">Request a survey</Link></li>
            </ul>
          </div>

          <div className={styles.col}>
            <p className={styles.colLabel}>Company</p>
            <ul className={styles.links}>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
            <div className={styles.social}>
              <a href="https://www.facebook.com/share/1EdzJithHP/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://www.instagram.com/marincsystemske" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://www.tiktok.com/@marincsystemske" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <FaTiktok />
              </a>
              <a href="https://wa.me/254721247356" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <FaWhatsapp />
              </a>
            </div>
          </div>

          <div className={styles.offices}>
            <div className={styles.office}>
              <p className={styles.colLabel}>Mombasa · HQ</p>
              <p className={styles.address}>
                Said Bin Seif Building, Meru Road,<br />
                opposite Fantasy Restaurant
              </p>
              <a href="tel:0721247356" className={styles.officeLink}>0721 247 356</a>
              <a
                href="https://maps.google.com/?q=Said+Bin+Seif+Building+Meru+Road+Mombasa"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.officeLink}
              >
                Directions →
              </a>
            </div>
            <div className={styles.office}>
              <p className={styles.colLabel}>Nairobi</p>
              <p className={styles.address}>
                Shelter House, Dai Dai Road,<br />
                South B
              </p>
              <a href="tel:0721247356" className={styles.officeLink}>0721 247 356</a>
              <a
                href="https://maps.google.com/?q=Shelter+House+Dai+Dai+Road+South+B+Nairobi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.officeLink}
              >
                Directions →
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>© {year} Marinc Systems Ltd. All rights reserved.</p>
          <button type="button" className={styles.backToTop} onClick={scrollToTop}>
            Back to top →
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
