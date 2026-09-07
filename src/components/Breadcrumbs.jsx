import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

const Breadcrumbs = ({ crumbs }) => {
  return (
    <nav className="container mx-auto px-4 py-2">
      <ol className={styles.container}>
        {crumbs.map((crumb, index) => (
          <li key={index} style={{ display: 'inline', fontWeight: 500 }}>
            {index !== 0 && <span className={styles.separator}>&gt;</span>}
            {crumb.path ? (
              <Link to={crumb.path} className={styles.link}>
                {crumb.label}
              </Link>
            ) : (
              <span style={{ color: '#000000' }}>{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;