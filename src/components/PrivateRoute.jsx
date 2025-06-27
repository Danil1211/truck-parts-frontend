import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  if (user === null) {
    // Пока user не загрузился — можно показать loader
    return <div>Загрузка...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;

  return children;
}

export default PrivateRoute;
