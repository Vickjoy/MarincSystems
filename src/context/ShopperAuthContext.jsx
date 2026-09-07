import React, { createContext, useContext, useState } from 'react';

const ShopperAuthContext = createContext();

export const useShopperAuth = () => useContext(ShopperAuthContext);

export const ShopperAuthProvider = ({ children }) => {
  const [shopper, setShopper] = useState(() => {
    const stored = localStorage.getItem('shopper_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('shopper_access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('shopper_refresh_token'));

  const fetchShopperInfo = async (accessToken) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/me/', {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      });
      if (!response.ok) throw new Error('Failed to fetch shopper info');
      const data = await response.json();
      setShopper(data);
      localStorage.setItem('shopper_user', JSON.stringify(data));
      return data;
    } catch (err) {
      setShopper(null);
      localStorage.removeItem('shopper_user');
      return null;
    }
  };

  const login = async (accessToken, refreshTokenValue) => {
    setToken(accessToken);
    setRefreshToken(refreshTokenValue);
    localStorage.setItem('shopper_access_token', accessToken);
    localStorage.setItem('shopper_refresh_token', refreshTokenValue);
    await fetchShopperInfo(accessToken);
  };

  const logout = () => {
    setShopper(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('shopper_user');
    localStorage.removeItem('shopper_access_token');
    localStorage.removeItem('shopper_refresh_token');
  };

  const value = { shopper, token, refreshToken, login, logout, fetchShopperInfo };
  return <ShopperAuthContext.Provider value={value}>{children}</ShopperAuthContext.Provider>;
};


