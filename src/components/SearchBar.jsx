import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import styles from './SearchBar.module.css';

/**
 * Header search. Submitting goes to /search?query=... and the results page
 * (ProductList) runs the search, so results survive a page refresh and the
 * back button.
 */
const SearchBar = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the box in sync with the URL while on the results page
  useEffect(() => {
    if (location.pathname === '/search') {
      setQuery(new URLSearchParams(location.search).get('query') || '');
    }
  }, [location.pathname, location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    navigate(`/search?query=${encodeURIComponent(term)}`);
    if (onSearch) onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.form} ${className}`.trim()}
      role="search"
    >
      <input
        type="search"
        className={styles.input}
        placeholder="Search products…"
        aria-label="Search products"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className={styles.button} aria-label="Search">
        <FaSearch />
      </button>
    </form>
  );
};

export default SearchBar;