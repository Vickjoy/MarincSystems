import React from 'react';
import styles from './CropFrame.module.css';

/**
 * Wraps media with print-style L-shaped crop marks.
 */
const CropFrame = ({ children, className = '', as: Tag = 'div' }) => {
  return (
    <Tag className={`${styles.frame} ${className}`.trim()}>
      <span className={`${styles.mark} ${styles.tl}`} aria-hidden="true" />
      <span className={`${styles.mark} ${styles.tr}`} aria-hidden="true" />
      <span className={`${styles.mark} ${styles.bl}`} aria-hidden="true" />
      <span className={`${styles.mark} ${styles.br}`} aria-hidden="true" />
      <div className={styles.inner}>{children}</div>
    </Tag>
  );
};

export default CropFrame;
