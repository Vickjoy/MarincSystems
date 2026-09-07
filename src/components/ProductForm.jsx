import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const defaultValues = {
  name: '',
  price: '',
  description: '',
  features: '', // ✅ New field
  image: '',
  specifications: '',
  documentation: '',
  status: 'in_stock',
  subcategory: '',
};

const fieldStyle = { marginBottom: 16 };

const ProductForm = ({ initialValues = {}, onSubmit, onCancel, loading, subcategories = [], categories = [] }) => {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileName, setImageFileName] = useState('');
  const { token } = useAuth();
  const [allCategories, setAllCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [specRows, setSpecRows] = useState(() => {
    if (initialValues.specifications) {
      return initialValues.specifications.split('\n').map(line => {
        const [key, ...rest] = line.split(':');
        return { key, value: rest.join(':') };
      });
    }
    return [{ key: '', value: '' }];
  });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/products/all-categories/')
      .then(res => res.json())
      .then(data => setAllCategories(data));
    fetch('http://127.0.0.1:8000/api/products/all-subcategories/')
      .then(res => res.json())
      .then(data => setAllSubcategories(data));
  }, []);

  const selectedCategoryId = form.category || (initialValues.category ? String(initialValues.category.id || initialValues.category) : '');
  const filteredSubcategories = selectedCategoryId
    ? allSubcategories.filter(sub => sub && String(sub.category) === String(selectedCategoryId))
    : [];

  const handleSpecChange = (idx, field, value) => {
    setSpecRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleAddSpecRow = () => setSpecRows(rows => [...rows, { key: '', value: '' }]);
  const handleRemoveSpecRow = idx => setSpecRows(rows => rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image' && files.length > 0) {
      setForm(f => ({ ...f, image: files[0] }));
      setImageFileName(files[0].name);
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.name) {
      setError('Name is required.');
      return;
    }

    if (!form.subcategory) {
      setError('Subcategory is required.');
      return;
    }

    const specString = specRows
      .filter(row => row.key && row.value)
      .map(row => `${row.key}:${row.value}`)
      .join('\n');

    const submitForm = { ...form, specifications: specString, subcategory: form.subcategory };
    onSubmit(submitForm, token);
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 480, margin: '0 auto', color: '#111', maxHeight: '80vh', overflowY: 'auto', boxSizing: 'border-box' }}>
      <h3 style={{ marginBottom: 16, textAlign: 'center', color: '#111' }}>{initialValues.id ? 'Edit Product' : 'Add Product'}</h3>

      <div style={fieldStyle}>
        <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', color: '#111' }} placeholder="Product Name" />
      </div>

      <div style={fieldStyle}>
        <select name="category" value={form.category || ''} onChange={handleChange} style={{ width: '100%', color: '#111' }} required>
          <option value="">Select Category</option>
          {allCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <select name="subcategory" value={form.subcategory || ''} onChange={handleChange} style={{ width: '100%', color: '#111' }} required>
          <option value="">Select Subcategory</option>
          {filteredSubcategories.map(sub => (
            <option key={sub.id || sub.slug} value={sub.id || sub.slug}>{sub.name}</option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <input name="price" type="number" value={form.price} onChange={handleChange} style={{ width: '100%', color: '#111' }} placeholder="Price (KES)" />
      </div>

      <div style={fieldStyle}>
        <textarea name="description" value={form.description} onChange={handleChange} style={{ width: '100%', color: '#111' }} rows={2} placeholder="Description" />
      </div>

      {/* ✅ Features field */}
      <div style={fieldStyle}>
        <textarea name="features" value={form.features} onChange={handleChange} style={{ width: '100%', color: '#111' }} rows={2} placeholder="Features" />
      </div>

      <div style={fieldStyle}>
        <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Specifications</label>
        <table style={{ width: '100%', marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', width: '40%' }}>Key</th>
              <th style={{ textAlign: 'left', width: '50%' }}>Value</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {specRows.map((row, idx) => (
              <tr key={idx}>
                <td><input type="text" value={row.key} onChange={e => handleSpecChange(idx, 'key', e.target.value)} style={{ width: '95%' }} /></td>
                <td><input type="text" value={row.value} onChange={e => handleSpecChange(idx, 'value', e.target.value)} style={{ width: '95%' }} /></td>
                <td><button type="button" onClick={() => handleRemoveSpecRow(idx)} disabled={specRows.length === 1}>-</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={handleAddSpecRow}>Add Row</button>
      </div>

      <div style={fieldStyle}>
        <input name="documentation" value={form.documentation} onChange={handleChange} style={{ width: '100%', color: '#111' }} placeholder="Documentation" />
      </div>

      <div style={fieldStyle}>
        <select name="status" value={form.status} onChange={handleChange} style={{ width: '100%', color: '#111' }}>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <input name="image" type="file" accept="image/*" onChange={handleChange} style={{ width: '100%' }} />
        {imageFileName && <div style={{ fontSize: 13, color: '#6096B4', marginTop: 4 }}>{imageFileName}</div>}
        {imagePreview && <img src={imagePreview} alt="preview" style={{ width: 80, marginTop: 8, borderRadius: 4 }} />}
        {!imagePreview && form.image && typeof form.image === 'string' && (
          <img src={`http://127.0.0.1:8000${form.image}`} alt="preview" style={{ width: 80, marginTop: 8, borderRadius: 4 }} />
        )}
      </div>

      {error && <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{error}</div>}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
        <button type="submit" disabled={loading} style={{ background: '#1DCD9F', color: '#fff', padding: '0.5rem 1.5rem', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>
          {loading ? 'Saving...' : (initialValues.id ? 'Update' : 'Add')}
        </button>
        <button type="button" onClick={onCancel} style={{ background: '#eee', color: '#333', padding: '0.5rem 1.5rem', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
