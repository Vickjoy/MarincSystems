import React, { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './Login.module.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CompanyLogo from '../assets/Company_logo.webp';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, fetchUserInfo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Call your custom login endpoint
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      // If login succeeds
      if (response.ok && data.access && data.refresh) {
        // Store tokens
        await login(data.access, data.refresh);

        // Fetch user info
        const user = await fetchUserInfo(data.access);

        // Redirect based on role
        if (user && (user.is_staff || user.is_superuser)) {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      } else {
        // Backend returned an error
        setError(data.detail || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <div>
      <section className={styles.section}>
        <div className={styles.container}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <img
              src={CompanyLogo}
              alt="Company Logo"
              style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            />
            <h2 className={styles.title}>Admin Login</h2>
          </div>
          <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="username">Username</label>
              <input
                id="username"
                className={styles.input}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input
                id="password"
                className={styles.input}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <div style={{ color: '#e74c3c', marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>
                {error}
              </div>
            )}
            <button className={styles.button} type="submit">Login</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Login;
