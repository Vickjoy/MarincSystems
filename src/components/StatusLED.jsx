import React from 'react';
import styles from './StatusLED.module.css';

/**
 * 8px status LED + mono stock text.
 * @param {'in_stock'|'out_of_stock'|string} status
 * @param {string} [label] — override label text
 */
const StatusLED = ({ status = 'in_stock', label, className = '' }) => {
  const inStock = status !== 'out_of_stock' && status !== 'out-of-stock' && status !== false;
  const text = label || (inStock ? 'In stock' : 'Out of stock');

  return (
    <span
      className={`${styles.status} ${inStock ? styles.in : styles.out} ${className}`.trim()}
    >
      <span className={styles.led} aria-hidden="true" />
      <span className={styles.text}>{text}</span>
    </span>
  );
};

export default StatusLED;
