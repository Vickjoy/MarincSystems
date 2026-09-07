import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useShopperAuth } from '../context/ShopperAuthContext';

const ShopperLoginModal = ({ open, onClose, onSuccess }) => {
  const { login, fetchShopperInfo } = useShopperAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok && data.access && data.refresh) {
          await login(data.access, data.refresh);
          await fetchShopperInfo(data.access);
          if (onSuccess) onSuccess();
          onClose();
        } else {
          setError(data.detail || 'Login failed. Please check your credentials.');
        }
      } else {
        const regResp = await fetch('http://127.0.0.1:8000/api/auth/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const regData = await regResp.json();
        if (!regResp.ok) {
          setError(regData.detail || 'Registration failed. Please try again.');
        } else {
          if (regData.access && regData.refresh) {
            await login(regData.access, regData.refresh);
            await fetchShopperInfo(regData.access);
          } else {
            const loginResp = await fetch('http://127.0.0.1:8000/api/auth/login/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });
            const loginData = await loginResp.json();
            if (loginResp.ok && loginData.access && loginData.refresh) {
              await login(loginData.access, loginData.refresh);
              await fetchShopperInfo(loginData.access);
            } else {
              setError(loginData.detail || 'Registered, but automatic login failed. Please login.');
              setMode('login');
              return;
            }
          }
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (err) {
      setError('Request failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 8, width: '100%', maxWidth: 420 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>{mode === 'login' ? 'Login to view prices' : 'Create an account to view prices'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="shopper-username" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Username</label>
            <input id="shopper-username" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: 8 }} />
          </div>
          {mode === 'register' && (
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="shopper-email" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input id="shopper-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8 }} />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="shopper-password" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Password</label>
            <input id="shopper-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8 }} />
          </div>
          {error && <div style={{ color: '#e74c3c', marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ padding: '8px 12px', background: '#eee', border: 0, borderRadius: 4 }}>
              {mode === 'login' ? 'New here? Register' : 'Have an account? Login'}
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 12px', background: '#eee', border: 0, borderRadius: 4 }} disabled={submitting}>Cancel</button>
              <button type="submit" style={{ padding: '8px 12px', background: '#1DCD9F', color: 'white', border: 0, borderRadius: 4 }} disabled={submitting}>
                {mode === 'login' ? (submitting ? 'Logging in...' : 'Login') : (submitting ? 'Registering...' : 'Register')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopperLoginModal;


