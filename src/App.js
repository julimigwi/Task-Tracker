import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import TaskDashboard from './components/TaskDashboard';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
// import NotFound from './components/NotFound';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={< Login/>} />
          <Route path="/register" element={<Register/>} />
          
          {/* Main Dashboard Route */}
          <Route path="/" element={
            <ProtectedRoute>
              <TaskDashboard />
            </ProtectedRoute>
          }>
            {/* Nested Task Routes */}
            <Route index element={<TaskList />} />
            <Route path="tasks">
              <Route path="new" element={<TaskForm />} />
              <Route path="edit/:id" element={<TaskForm />} />
            </Route>
          </Route>
          
          {/* Fallback Routes */}
          {/* <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;