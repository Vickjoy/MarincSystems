import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const contentStyle = {
  marginLeft: 220,
  padding: '2rem',
  minHeight: '100vh',
  background: '#f4f6fa',
};

const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  display: 'block',
  padding: '0.75rem 0',
  fontWeight: 600,
  borderRadius: 6,
  transition: 'background 0.2s',
  cursor: 'pointer',
};

const activeLinkStyle = {
  background: '#1DCD9F',
  color: '#222e3c',
};

const AdminLayout = ({ children }) => {
  return <div>{children}</div>;
};

export default AdminLayout; 