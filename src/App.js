import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import TaskDashboard from './components/TaskDashboard';
import TaskForm from './components/TaskForm';
import HomePage from './components/HomePage';
// import NotFound from './components/NotFound';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TaskDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/new"
            element={
              <ProtectedRoute>
                <TaskForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/edit/:id"
            element={
              <ProtectedRoute>
                <TaskDashboard/>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          {/* <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
