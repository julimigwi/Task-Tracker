import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import HomePage from './components/HomePage';
import TaskDashboard from './components/TaskDashboard';
import { MockAuthContext } from './components/AuthContext';

// Lazy load auth components (better performance)
// const Login = React.lazy(() => import('./components/Login'));
// const Register = React.lazy(() => import('./components/Register'));

const App = () => {
  return (
    <MockAuthContext>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/login" 
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <Login />
            </React.Suspense>
          } 
        />
        <Route 
          path="/register" 
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <Register />
            </React.Suspense>
          } 
        />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/tasks" element={<TaskDashboard />} />
          {/* Add more protected routes here */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </MockAuthContext>
    
  );
};

export default App;