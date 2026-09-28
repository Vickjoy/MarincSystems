import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6';
import ZoneTag from './ZoneTag';
import { CONTACT } from '../config/contact';

// Jump straight to the top of the destination page (no smooth-scroll delay)
const jumpToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};

// Every footer link goes through this so the next page always opens at the top,
// even when the visitor is already on that page.
const FooterLink = ({ to, children }) => (
  <Link to={to} onClick={jumpToTop}>
    {children}
  </Link>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.wordmark} aria-hidden="true">
          Simplifying Solutions.
        </p>

        <div className={styles.grid}>
          <div className={styles.col}>
            <div className={styles.colHead}>
              <ZoneTag zone="fire" label="ZONE 01 · FIRE SAFETY" onDark />
            </div>
            <ul className={styles.links}>
              <li><FooterLink to="/category/addressable-fire-alarm-detection-systems">Addressable Fire Alarm</FooterLink></li>
              <li><FooterLink to="/category/conventional-fire-alarm-detection-systems">Conventional Fire Alarm</FooterLink></li>
              <li><FooterLink to="/category/emergency-voice-communication-systems">Emergency Voice Communication</FooterLink></li>
            </ul>
          </div>

          <div className={styles.col}>
            <div className={styles.colHead}>
              <ZoneTag zone="ict" label="ZONE 02 · ICT & SECURITY" onDark />
            </div>
            <ul className={styles.links}>
              <li><FooterLink to="/category/giganet-products">Structured Cabling</FooterLink></li>
              <li><FooterLink to="/category/hikvision">Security &amp; Surveillance</FooterLink></li>
              <li><FooterLink to="/category/alcatel-lucent-products">Access Control</FooterLink></li>
            </ul>
          </div>

          <div className={styles.col}>
            <div className={styles.colHead}>
              <p className={styles.colLabel}>Company</p>
            </div>
            <ul className={styles.links}>
              <li><FooterLink to="/">Home</FooterLink></li>
              <li><FooterLink to="/about">About</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
            </ul>
          </div>

          <div className={styles.col}>
            <div className={styles.colHead}>
              <p className={styles.colLabel}>Mombasa · HQ</p>
            </div>
            <p className={styles.address}>
              Said Bin Seif Building, Meru Road,<br />
              opposite Fantasy Restaurant
            </p>
            {CONTACT.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className={styles.officeLink}>{p.display}</a>
            ))}
            <a
              href="https://maps.google.com/?q=Said+Bin+Seif+Building+Meru+Road+Mombasa"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.officeLink}
            >
              Directions →
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.social}>
            <a href={CONTACT.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href={CONTACT.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href={CONTACT.social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok />
            </a>
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>
          <p className={styles.copy}>© {year} Marinc Systems Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
