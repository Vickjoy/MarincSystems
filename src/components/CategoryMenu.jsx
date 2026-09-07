// This component is now only used for select-style category dropdowns elsewhere (not in Header navigation)
import React, { useEffect, useState } from 'react';
import styles from './CategoryMenu.module.css';
import { fetchCategories } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CategoryMenu = ({ filterType }) => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        let cats = Array.isArray(data) ? data : [];
        if (filterType) {
          cats = cats.filter(cat => cat.type === filterType);
        }
        setCategories(cats);
      } catch (e) {
        setCategories([]);
      }
    };
    getCategories();
    const handleCategoriesUpdated = () => getCategories();
    window.addEventListener('categoriesUpdated', handleCategoriesUpdated);
    return () => window.removeEventListener('categoriesUpdated', handleCategoriesUpdated);
  }, [filterType]);

  const handleChange = (e) => {
    const selectedSlug = e.target.value;
    if (!selectedSlug) return;
    navigate(`/category/${selectedSlug}`);
  };

  return (
    <select className={styles.select} onChange={handleChange} defaultValue="">
      <option value="">All Categories</option>
      {categories.map(cat => (
        <option key={cat.id} value={cat.slug}>{cat.name}</option>
      ))}
    </select>
  );
};

export default CategoryMenu;