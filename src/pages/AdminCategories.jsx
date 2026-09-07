import React, { useEffect, useState } from 'react';
import { fetchCategories, fetchSubcategories } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminCategories = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.is_staff && !user?.is_admin) {
      navigate('/');
      return;
    }
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (e) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [user, navigate]);

  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      return;
    }
    const loadSubcategories = async () => {
      setLoading(true);
      try {
        const data = await fetchSubcategories(selectedCategory.slug);
        setSubcategories(data);
      } catch (e) {
        setSubcategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadSubcategories();
  }, [selectedCategory]);

  // Stub handlers
  const handleAddCategory = () => {};
  const handleEditCategory = (cat) => {};
  const handleDeleteCategory = (cat) => {};
  const handleAddSubcategory = () => {};
  const handleEditSubcategory = (sub) => {};
  const handleDeleteSubcategory = (sub) => {};

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
      <h2 style={{ color: '#6096B4', marginBottom: 24 }}>Category & Subcategory Management</h2>
      <div style={{ display: 'flex', gap: 40 }}>
        {/* Category List */}
        <div style={{ flex: 1 }}>
          <h3>Main Categories</h3>
          <button onClick={handleAddCategory} style={{ marginBottom: 12, background: '#1DCD9F', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1rem', fontWeight: 700 }}>+ Add Category</button>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {categories.map(cat => (
              <li key={cat.id} style={{ marginBottom: 8 }}>
                <button onClick={() => setSelectedCategory(cat)} style={{ fontWeight: selectedCategory?.id === cat.id ? 700 : 400, color: selectedCategory?.id === cat.id ? '#1DCD9F' : '#6096B4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{cat.name}</button>
                <button onClick={() => handleEditCategory(cat)} style={{ marginLeft: 8, color: '#6096B4', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDeleteCategory(cat)} style={{ marginLeft: 4, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        {/* Subcategory List */}
        <div style={{ flex: 1 }}>
          <h3>Subcategories</h3>
          {selectedCategory && (
            <>
              <button onClick={handleAddSubcategory} style={{ marginBottom: 12, background: '#1DCD9F', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1rem', fontWeight: 700 }}>+ Add Subcategory</button>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {subcategories.map(sub => (
                  <li key={sub.id} style={{ marginBottom: 8 }}>
                    <span style={{ color: '#6096B4', fontSize: 16 }}>{sub.name}</span>
                    <button onClick={() => handleEditSubcategory(sub)} style={{ marginLeft: 8, color: '#6096B4', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteSubcategory(sub)} style={{ marginLeft: 4, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {!selectedCategory && <p style={{ color: '#aaa' }}>Select a category to view subcategories.</p>}
        </div>
      </div>
      {loading && <p style={{ color: '#6096B4', marginTop: 24 }}>Loading...</p>}
    </div>
  );
};

export default AdminCategories; 