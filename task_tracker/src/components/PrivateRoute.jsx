import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>; // Handle async auth
  return user ? children : <Navigate to="/login" state={{ from: location.pathname }} />;
};

export default PrivateRoute;