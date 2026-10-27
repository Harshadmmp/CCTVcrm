import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a technician tries to access admin-only pages
  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/technician-portal" replace />;
  }

  // If logged in as technician and tries to access dashboard root
  if (currentUser.role === 'technician' && location.pathname === '/') {
    return <Navigate to="/technician-portal" replace />;
  }

  return children;
};

export default ProtectedRoute;

