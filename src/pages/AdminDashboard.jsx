import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  fetchCategories, fetchSubcategories, createCategory, updateCategory, deleteCategory,
  fetchProductsForSubcategory, createProduct, updateProduct, deleteProduct, createSubcategory
} from '../utils/api';
import ProductForm from '../components/ProductForm';
import CompanyLogo from '../assets/Company_logo.webp';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for categories by type
  const [fireCategories, setFireCategories] = useState([]);
  const [ictCategories, setIctCategories] = useState([]);
  const [solarCategories, setSolarCategories] = useState([]);
  
  // State for subcategories by category ID
  const [fireSubcategories, setFireSubcategories] = useState({});
  const [ictSubcategories, setIctSubcategories] = useState({});
  const [solarSubcategories, setSolarSubcategories] = useState({});
  
  // State for products by subcategory slug
  const [productsBySubcategory, setProductsBySubcategory] = useState({});
  
  // UI state
  const [activeSection, setActiveSection] = useState('fire');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [productModal, setProductModal] = useState({ open: false, subcategory: null });
  const [loading, setLoading] = useState(false);
  const [categoryModal, setCategoryModal] = useState({ open: false, type: 'fire_safety' });
  const [subcategoryModal, setSubcategoryModal] = useState({ open: false, category: null });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  // Load all categories and subcategories on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch all categories
        const cats = await fetchCategories(token);
        
        // Split by type
        const fire = cats.filter(cat => cat.type === 'fire_safety');
        const ict = cats.filter(cat => cat.type === 'ict');
        const solar = cats.filter(cat => cat.type === 'solar');
        
        setFireCategories(fire);
        setIctCategories(ict);
        setSolarCategories(solar);
        
        // Fetch subcategories for fire categories
        const fireSubs = {};
        for (const cat of fire) {
          const subs = await fetchSubcategories(cat.slug, token);
          fireSubs[cat.id] = subs;
        }
        setFireSubcategories(fireSubs);
        
        // Fetch subcategories for ICT categories
        const ictSubs = {};
        for (const cat of ict) {
          const subs = await fetchSubcategories(cat.slug, token);
          ictSubs[cat.id] = subs;
        }
        setIctSubcategories(ictSubs);
        
        // Fetch subcategories for solar categories
        const solarSubs = {};
        for (const cat of solar) {
          const subs = await fetchSubcategories(cat.slug, token);
          solarSubs[cat.id] = subs;
        }
        setSolarSubcategories(solarSubs);
        
      } catch (e) {
        console.error('Failed to load data:', e);
        setFireCategories([]);
        setIctCategories([]);
        setSolarCategories([]);
        setFireSubcategories({});
        setIctSubcategories({});
        setSolarSubcategories({});
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  // Load products for a subcategory
  const loadProductsForSubcategory = async (subcategorySlug) => {
    try {
      const products = await fetchProductsForSubcategory(subcategorySlug);
      setProductsBySubcategory(prev => ({
        ...prev,
        [subcategorySlug]: products
      }));
    } catch (e) {
      console.error('Failed to load products:', e);
      setProductsBySubcategory(prev => ({
        ...prev,
        [subcategorySlug]: []
      }));
    }
  };

  // Handler for expanding/collapsing a category
  const handleCategoryClick = (catId) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

  // Handler for expanding/collapsing a subcategory
  const handleSubcategoryClick = (subcategory) => {
    const subcategorySlug = typeof subcategory === 'object' && subcategory !== null ? subcategory.slug : subcategory;
    if (expandedSubcategory === subcategorySlug) {
      setExpandedSubcategory(null);
    } else {
      setExpandedSubcategory(subcategorySlug);
      // Load products if not already loaded
      if (!productsBySubcategory[subcategorySlug]) {
        loadProductsForSubcategory(subcategorySlug);
      }
    }
  };

  // Handler for opening the Add Product modal for a subcategory
  const handleShowAddProductModal = (subcategory) => {
    setProductModal({ open: true, subcategory: subcategory.slug });
  };

  // Handler for adding a product
  const handleAddProduct = async (form) => {
    if (!productModal.subcategory) return;
    try {
      const submitForm = { ...form, subcategory: productModal.subcategory };
      const newProduct = await createProduct(submitForm, token);
      
      setProductsBySubcategory(prev => ({
        ...prev,
        [productModal.subcategory]: [
          ...(prev[productModal.subcategory] || []),
          newProduct
        ]
      }));
      
      setProductModal({ open: false, subcategory: null });
    } catch (e) {
      console.error('Failed to create product:', e);
    }
  };

  // Placeholder handlers for edit/delete
  const handleEditCategory = (cat) => { alert(`Edit category: ${cat.name}`); };
  const handleDeleteCategory = (cat) => { if(window.confirm(`Delete category: ${cat.name}?`)){} };
  const handleEditSubcategory = (sub) => { alert(`Edit subcategory: ${sub.name}`); };
  const handleDeleteSubcategory = (sub) => { if(window.confirm(`Delete subcategory: ${sub.name}?`)){} };
  const handleEditProduct = (product) => { alert(`Edit product: ${product.name}`); };
  
  const handleDeleteProduct = async (product, subcategorySlug) => { 
    if(window.confirm(`Delete product: ${product.name}?`)) {
      try {
        await deleteProduct(product.id, token);
        setProductsBySubcategory(prev => ({
          ...prev,
          [subcategorySlug]: prev[subcategorySlug].filter(p => p.id !== product.id)
        }));
      } catch (e) {
        console.error('Failed to delete product:', e);
      }
    }
  };

  // Add handlers for add category/subcategory
  const handleShowAddCategoryModal = (type) => {
    setCategoryModal({ open: true, type });
    setNewCategoryName('');
  };
  
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await createCategory(newCategoryName, token, categoryModal.type);
    setCategoryModal({ open: false, type: 'fire_safety' });
  };
  
  const handleShowAddSubcategoryModal = (category) => {
    setSubcategoryModal({ open: true, category });
    setNewSubcategoryName('');
  };
  
  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim()) return;
    await createSubcategory(subcategoryModal.category.slug, newSubcategoryName, token);
    setSubcategoryModal({ open: false, category: null });
  };

  // Handler for logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get product count for a subcategory
  const getProductCount = (subcategorySlug) => {
    const products = productsBySubcategory[subcategorySlug];
    return products ? products.length : 0;
  };

  // Get total subcategory count for a category
  const getSubcategoryCount = (categoryId, subcategories) => {
    return subcategories[categoryId] ? subcategories[categoryId].length : 0;
  };

  // Render categories and subcategories for a section
  const renderSection = (categories, subcategories, type) => {
    if (loading) {
      return (
        <div className={styles.loading}>
          <div>Loading categories...</div>
        </div>
      );
    }

    const sectionTitles = {
      'fire_safety': 'Fire Safety Categories',
      'ict': 'ICT/Telecommunication Categories',
      'solar': 'Solar Categories'
    };

    if (categories.length === 0) {
      return (
        <div className={styles.emptyState}>
          <h3>No categories found</h3>
          <p>Start by adding your first category for {sectionTitles[type]}</p>
          <div style={{ marginTop: '1rem' }}>
            <button 
              type="button" 
              className={styles.adminButton} 
              onClick={() => handleShowAddCategoryModal(type)}
            >
              + Add First Category
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{sectionTitles[type]}</h2>
          <button 
            type="button" 
            className={styles.adminButton} 
            onClick={() => handleShowAddCategoryModal(type)}
          >
            + Add Category
          </button>
        </div>
        
        {categories.map(cat => (
          <div key={cat.id} className={styles.categoryContainer}>
            <div 
              className={`${styles.categoryHeader} ${expandedCategory === cat.id ? styles.categoryExpanded : ''}`} 
              onClick={() => handleCategoryClick(cat.id)}
            >
              <h3>
                <span className={`${styles.expandIcon} ${expandedCategory === cat.id ? styles.expanded : ''}`}>
                  ▶
                </span>
                {cat.name}
                <span className={styles.productCount}>
                  {getSubcategoryCount(cat.id, subcategories)} subcategories
                </span>
              </h3>
              <div className={styles.buttonRow}>
                <button 
                  type="button" 
                  className={styles.editButton} 
                  onClick={e => {e.stopPropagation(); handleEditCategory(cat);}}
                >
                  Edit
                </button>
                <button 
                  type="button" 
                  className={styles.deleteButton} 
                  onClick={e => {e.stopPropagation(); handleDeleteCategory(cat);}}
                >
                  Delete
                </button>
              </div>
            </div>
            
            {expandedCategory === cat.id && (
              <div className={styles.subcategoryList}>
                <h4>Subcategories:</h4>
                <div className={styles.buttonRow}>
                  <button type="button" className={styles.adminButton} onClick={() => handleShowAddSubcategoryModal(cat)}>
                    + Add Subcategory
                  </button>
                </div>
                <ul>
                  {(subcategories[cat.id] || []).map(sub => (
                    <li key={sub.id} className={styles.subcategoryItem}>
                      <div className={styles.subcategoryHeader}>
                        <div 
                          className={styles.subcategoryName}
                          onClick={() => handleSubcategoryClick(sub.slug)}
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <span className={`${styles.expandIcon} ${expandedSubcategory === sub.slug ? styles.expanded : ''}`}>
                            ▶
                          </span>
                          <h5 style={{ margin: 0 }}>{sub.name}</h5>
                          <span className={styles.productCount}>
                            {getProductCount(sub.slug)} products
                          </span>
                        </div>
                        <div className={styles.buttonRow}>
                          <button type="button" className={styles.adminButton} onClick={() => handleShowAddProductModal(sub)}>
                            + Add Product
                          </button>
                          <button type="button" className={styles.editButton} onClick={() => handleEditSubcategory(sub)}>
                            Edit
                          </button>
                          <button type="button" className={styles.deleteButton} onClick={() => handleDeleteSubcategory(sub)}>
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {expandedSubcategory === sub.slug && (
                        <div className={styles.productsContainer}>
                          {productsBySubcategory[sub.slug] && productsBySubcategory[sub.slug].length > 0 ? (
                            <div className={styles.productGrid}>
                              {productsBySubcategory[sub.slug].map(product => (
                                <div key={product.id} className={styles.productCard}>
                                  <div className={styles.productImageContainer}>
                                    <img
                                      src={product.image ? 
                                        (product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`) 
                                        : '/placeholder.png'
                                      }
                                      alt={product.name}
                                      className={styles.productImage}
                                      onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                                    />
                                  </div>
                                  <div className={styles.productInfo}>
                                    <h6 className={styles.productName}>{product.name}</h6>
                                    <div className={styles.productPrice}>
                                      KES {Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className={styles.productActions}>
                                      <button 
                                        type="button" 
                                        className={styles.editButton} 
                                        onClick={() => handleEditProduct(product)}
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        type="button" 
                                        className={styles.deleteButton} 
                                        onClick={() => handleDeleteProduct(product, sub.slug)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className={styles.emptyProducts}>
                              <p>No products in this subcategory yet.</p>
                              <button 
                                type="button" 
                                className={styles.adminButton} 
                                onClick={() => handleShowAddProductModal(sub)}
                              >
                                Add First Product
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.adminHeader}>
        <div className={styles.adminHeaderLeft}>
          <img src={CompanyLogo} alt="Company Logo" className={styles.adminLogo} />
          <h1 className={styles.adminTitle}>Admin Dashboard</h1>
        </div>
        {user && (
          <div className={styles.adminUserInfo}>
            <span>Welcome, {user.name || user.email}</span>
          </div>
        )}
      </div>
      
      <div className={styles.adminMain}>
        <nav className={styles.adminSidebar}>
          <div className={styles.adminSectionTitle}>Navigation</div>
          <ul className={styles.adminList}>
            <li className={styles.adminListItem}>
              <button 
                className={`${styles.adminNavButton} ${activeSection === 'fire' ? styles.active : ''}`}
                onClick={() => setActiveSection('fire')}
              >
                🔥 Fire Safety
              </button>
            </li>
            <li className={styles.adminListItem}>
              <button 
                className={`${styles.adminNavButton} ${activeSection === 'ict' ? styles.active : ''}`}
                onClick={() => setActiveSection('ict')}
              >
                💻 ICT/Telecommunication
              </button>
            </li>
            <li className={styles.adminListItem}>
              <button 
                className={`${styles.adminNavButton} ${activeSection === 'solar' ? styles.active : ''}`}
                onClick={() => setActiveSection('solar')}
              >
                ☀️ Solar
              </button>
            </li>
            <li className={styles.adminListItem}>
              <button className={styles.logoutButton} onClick={handleLogout}>
                🚪 Logout
              </button>
            </li>
          </ul>
        </nav>
        
        <main className={styles.adminMainContent}>
          {activeSection === 'fire' && renderSection(fireCategories, fireSubcategories, 'fire_safety')}
          {activeSection === 'ict' && renderSection(ictCategories, ictSubcategories, 'ict')}
          {activeSection === 'solar' && renderSection(solarCategories, solarSubcategories, 'solar')}
        </main>
      </div>
      
      {/* Product Modal */}
      {productModal.open && (
        <div className={styles.adminModal}>
          <div className={styles.adminModalContent}>
            <ProductForm
              initialValues={{ subcategory: productModal.subcategory }}
              onSubmit={handleAddProduct}
              onCancel={() => setProductModal({ open: false, subcategory: null })}
              loading={loading}
            />
          </div>
        </div>
      )}
      
      {/* Category Modal */}
      {categoryModal.open && (
        <div className={styles.adminModal}>
          <div className={styles.adminModalContent}>
            <h3>Add New Category</h3>
            <input
              className={styles.adminFormInput}
              type="text"
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              autoFocus
            />
            <div className={styles.buttonRow}>
              <button 
                type="button" 
                className={styles.adminButton} 
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
              >
                Add Category
              </button>
              <button 
                type="button" 
                className={styles.deleteButton} 
                onClick={() => setCategoryModal({ open: false, type: 'fire_safety' })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Subcategory Modal */}
      {subcategoryModal.open && (
        <div className={styles.adminModal}>
          <div className={styles.adminModalContent}>
            <h3>Add New Subcategory</h3>
            <input
              className={styles.adminFormInput}
              type="text"
              placeholder="Enter subcategory name"
              value={newSubcategoryName}
              onChange={e => setNewSubcategoryName(e.target.value)}
              autoFocus
            />
            <div className={styles.buttonRow}>
              <button 
                type="button" 
                className={styles.adminButton} 
                onClick={handleAddSubcategory}
                disabled={!newSubcategoryName.trim()}
              >
                Add Subcategory
              </button>
              <button 
                type="button" 
                className={styles.deleteButton} 
                onClick={() => setSubcategoryModal({ open: false, category: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;