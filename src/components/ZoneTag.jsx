import React from 'react';
import { ZONES } from '../utils/zones';
import styles from './ZoneTag.module.css';

/**
 * Mono zone label with coloured square.
 * @param {'fire'|'ict'|'solar'|string} zone — zone id or custom
 * @param {string} [label] — overrides default zone tag text
 * @param {string} [color] — CSS colour override
 */
const ZoneTag = ({ zone = 'fire', label, color, className = '', onDark = false }) => {
  const zoneDef = ZONES[zone] || null;
  const text = label || zoneDef?.tag || String(zone).toUpperCase();
  const swatch = color || zoneDef?.color || 'var(--red)';

  return (
    <span
      className={`${styles.tag} ${onDark ? styles.onDark : ''} ${className}`.trim()}
      style={{ '--zone-color': swatch }}
    >
      <span className={styles.swatch} aria-hidden="true" />
      <span className={styles.label}>{text}</span>
    </span>
  );
};

export default ZoneTag;
