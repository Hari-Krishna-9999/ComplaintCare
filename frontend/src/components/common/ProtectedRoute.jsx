import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getUser();

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
