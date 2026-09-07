import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Admin authentication (existing)
  const [adminUser, setAdminUser] = useState(() => {
    const stored = localStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_access_token'));
  const [adminRefreshToken, setAdminRefreshToken] = useState(() => localStorage.getItem('admin_refresh_token'));

  // User authentication (new)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user_data');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('user_access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('user_refresh_token'));

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('user_access_token');
      const storedUser = localStorage.getItem('user_data');
      
      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const response = await fetch('http://127.0.0.1:8000/api/me/', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // Token is invalid, clear storage
            logout();
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          logout();
        }
      }
    };

    checkAuthStatus();
  }, []);

  const fetchUserInfo = async (accessToken) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/me/', {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user info');
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
      return userData;
    } catch (err) {
      setUser(null);
      localStorage.removeItem('user_data');
      return null;
    }
  };

  const fetchAdminUserInfo = async (accessToken) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/me/', {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
      if (!response.ok) throw new Error('Failed to fetch admin user info');
      const userData = await response.json();
      setAdminUser(userData);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      setAdminUser(null);
      localStorage.removeItem('admin_user');
      return null;
    }
  };

  // User login
  const login = async (accessToken, refreshTokenValue) => {
    setToken(accessToken);
    setRefreshToken(refreshTokenValue);
    localStorage.setItem('user_access_token', accessToken);
    localStorage.setItem('user_refresh_token', refreshTokenValue);
    await fetchUserInfo(accessToken);
  };

  // Admin login
  const adminLogin = async (accessToken, refreshTokenValue) => {
    setAdminToken(accessToken);
    setAdminRefreshToken(refreshTokenValue);
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshTokenValue);
    await fetchAdminUserInfo(accessToken);
  };

  // User logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_access_token');
    localStorage.removeItem('user_refresh_token');
  };

  // Admin logout
  const adminLogout = () => {
    setAdminUser(null);
    setAdminToken(null);
    setAdminRefreshToken(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
  };

  const refreshAccessToken = async () => {
    const storedRefresh = refreshToken || localStorage.getItem('user_refresh_token');
    if (!storedRefresh) return false;
    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: storedRefresh })
      });
      const data = await response.json();
      if (response.ok && data.access) {
        setToken(data.access);
        localStorage.setItem('user_access_token', data.access);
        return data.access;
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    }
  };

  const refreshAdminAccessToken = async () => {
    const storedRefresh = adminRefreshToken || localStorage.getItem('admin_refresh_token');
    if (!storedRefresh) return false;
    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: storedRefresh })
      });
      const data = await response.json();
      if (response.ok && data.access) {
        setAdminToken(data.access);
        localStorage.setItem('admin_access_token', data.access);
        return data.access;
      } else {
        adminLogout();
        return false;
      }
    } catch {
      adminLogout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      // User auth
      user, 
      token, 
      refreshToken, 
      login, 
      logout, 
      fetchUserInfo, 
      refreshAccessToken,
      // Admin auth (backward compatibility)
      adminUser,
      adminToken,
      adminRefreshToken,
      adminLogin,
      adminLogout,
      fetchAdminUserInfo: fetchAdminUserInfo,
      refreshAdminAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};