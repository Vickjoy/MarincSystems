import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './UserLogin.module.css';

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await login(data.access, data.refresh);
        const redirectTo = location.state?.from || '/';
        navigate(redirectTo);
      } else {
        setError(data.detail || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email,
          username: registerData.username,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Please login with your credentials.');
        setIsLogin(true);
        setRegisterData({
          email: '',
          username: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setError(data.detail || data.email?.[0] || data.username?.[0] || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated Google Login
  const handleGoogleLogin = () => {
    const currentPath = location.pathname;
    const redirectUrl = encodeURIComponent(location.state?.from || currentPath);
    window.location.href = `http://localhost:8000/accounts/google/login/?next=${redirectUrl}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1>{isLogin ? 'Login' : 'Create Account'}</h1>
          <p>
            {isLogin 
              ? 'Welcome back! Please login to view prices and shop.' 
              : 'Join us to access exclusive pricing and features.'
            }
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
                className={styles.input}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="reg-username">Username</label>
              <input
                type="text"
                id="reg-username"
                value={registerData.username}
                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="reg-password">Password</label>
              <input
                type="password"
                id="reg-password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                required
                className={styles.input}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className={styles.googleButton}
          disabled={loading}
        >
          <FcGoogle size={20} style={{ marginRight: '8px' }} />
          Continue with Google
        </button>

        <div className={styles.toggle}>
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => setIsLogin(false)}
                className={styles.toggleButton}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => setIsLogin(true)}
                className={styles.toggleButton}
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
