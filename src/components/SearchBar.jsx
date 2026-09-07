import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noResults, setNoResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setNoResults(false);
    
    const searchTerm = query.trim();
    if (!searchTerm) return;
    
    setLoading(true);
    
    try {
      // Fetch all products from the database
      let allProducts = [];
      
      // First, get all categories
      const categoriesRes = await fetch('http://127.0.0.1:8000/api/categories/');
      const categories = await categoriesRes.json();
      
      // For each category, get subcategories
      for (const cat of categories) {
        try {
          const subcategoriesRes = await fetch(`http://127.0.0.1:8000/api/categories/${cat.slug}/subcategories/`);
          const subcategories = await subcategoriesRes.json();
          
          // For each subcategory, get products
          for (const sub of subcategories) {
            try {
              const productsRes = await fetch(`http://127.0.0.1:8000/api/subcategories/${sub.slug}/products/`);
              const productsData = await productsRes.json();
              
              // Handle both paginated and non-paginated responses
              const products = productsData.results || productsData;
              
              if (Array.isArray(products)) {
                allProducts = allProducts.concat(products);
              }
            } catch (err) {
              console.error(`Error fetching products for subcategory ${sub.slug}:`, err);
            }
          }
        } catch (err) {
          console.error(`Error fetching subcategories for category ${cat.slug}:`, err);
        }
      }
      
      // Remove duplicates by ID
      const uniqueProducts = Array.from(
        new Map(allProducts.map(p => [p.id, p])).values()
      );
      
      // Perform case-insensitive search across multiple fields
      const searchLower = searchTerm.toLowerCase();
      const matches = uniqueProducts.filter(product => {
        if (!product) return false;
        
        // Search in product name
        const nameMatch = product.name && 
          product.name.toLowerCase().includes(searchLower);
        
        // Search in product description
        const descriptionMatch = product.description && 
          product.description.toLowerCase().includes(searchLower);
        
        // Search in product features
        const featuresMatch = product.features && 
          product.features.toLowerCase().includes(searchLower);
        
        // Search in subcategory name if available
        const subcategoryMatch = product.subcategory_detail?.name &&
          product.subcategory_detail.name.toLowerCase().includes(searchLower);
        
        return nameMatch || descriptionMatch || featuresMatch || subcategoryMatch;
      });
      
      if (matches.length === 0) {
        setNoResults(true);
      } else if (matches.length === 1) {
        // Navigate directly to the product if only one match
        navigate(`/product/${matches[0].slug}`);
      } else {
        // Navigate to search results page with multiple matches
        navigate(`/search?query=${encodeURIComponent(searchTerm)}`, { 
          state: { results: matches } 
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Error searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Search for products..."
          className={styles.input}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setNoResults(false);
            setError('');
          }}
          disabled={loading}
        />
        <button 
          className={styles.button} 
          type="submit" 
          disabled={loading}
          aria-label="Search"
        >
          {loading ? '...' : '🔍'}
        </button>
      </form>
      {noResults && (
        <div className={styles.noResults}>
          No results found for '{query}'
        </div>
      )}
      {error && (
        <div className={styles.error}>{error}</div>
      )}
    </div>
  );
};

export default SearchBar;