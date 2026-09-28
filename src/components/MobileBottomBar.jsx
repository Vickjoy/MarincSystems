import React from 'react';
import styles from './MobileBottomBar.module.css';
import { CONTACT } from '../config/contact';

const MobileBottomBar = ({ onQuoteOpen, quoteCount = 0 }) => {
  return (
    <nav className={styles.bar} aria-label="Quick actions">
      <a className={styles.action} href={`tel:${CONTACT.phones[0].tel}`}>
        <span className={styles.label}>Call</span>
      </a>
      <a
        className={styles.action}
        href={CONTACT.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={styles.label}>WhatsApp</span>
      </a>
      <button type="button" className={styles.action} onClick={onQuoteOpen}>
        <span className={styles.label}>
          Quote List
          {quoteCount > 0 && <span className={styles.count}>{quoteCount}</span>}
        </span>
      </button>
    </nav>
  );
};

export default MobileBottomBar;