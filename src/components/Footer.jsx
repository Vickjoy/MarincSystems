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

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <ZoneTag zone="fire" label="ZONE 01 · FIRE SAFETY" onDark />
            <ul className={styles.links}>
              <li><FooterLink to="/category/addressable-fire-alarm-detection-systems">Addressable Fire Alarm</FooterLink></li>
              <li><FooterLink to="/category/conventional-fire-alarm-detection-systems">Conventional Fire Alarm</FooterLink></li>
              <li><FooterLink to="/category/emergency-voice-communication-systems">Emergency Voice Communication</FooterLink></li>
            </ul>
          </div>

          <div className={styles.col}>
            <ZoneTag zone="ict" label="ZONE 02 · ICT & SECURITY" onDark />
            <ul className={styles.links}>
              <li><FooterLink to="/category/giganet-products">Structured Cabling</FooterLink></li>
              <li><FooterLink to="/category/hikvision">Security &amp; Surveillance</FooterLink></li>
              <li><FooterLink to="/category/alcatel-lucent-products">Access Control</FooterLink></li>
            </ul>
          </div>

          <div className={styles.col}>
            <p className={styles.colLabel}>Company</p>
            <ul className={styles.links}>
              <li><FooterLink to="/">Home</FooterLink></li>
              <li><FooterLink to="/about">About</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
            </ul>
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
          </div>

          <div className={styles.offices}>
            <div className={styles.office}>
              <p className={styles.colLabel}>Mombasa · HQ</p>
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
            <div className={styles.office}>
              <p className={styles.colLabel}>Nairobi</p>
              <p className={styles.address}>
                Shelter House, Dai Dai Road,<br />
                South B
              </p>
              {CONTACT.phones.map((p) => (
                <a key={p.tel} href={`tel:${p.tel}`} className={styles.officeLink}>{p.display}</a>
              ))}
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