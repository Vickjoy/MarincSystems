import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !(user.is_staff || user.is_superuser)) {
    // Not an admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 