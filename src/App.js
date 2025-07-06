import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from './components/AuthContext';
import './App.css';

// Basic Components (defined in App.js for simplicity)
const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogin = () => {
    // Demo login - replace with real auth
    login({ id: 1, name: 'User' });
    navigate('/');
  };

  return (
    <div className="auth-page">
      <h2>Login</h2>
      <button onClick={handleLogin}>Log In (Demo)</button>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  
  return (
    <div className="auth-page">
      <h2>Register</h2>
      <button onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  );
};

const TaskDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <div className="dashboard">
      <header>
        <h1>Task Dashboard</h1>
        <button onClick={logout}>Logout</button>
        <p>Welcome, {user?.name}</p>
      </header>
      <nav>
        <a href="/tasks/new">Create Task</a>
      </nav>
      {/* Task list would go here */}
    </div>
  );
};

const TaskForm = () => {
  const navigate = useNavigate();
  
  return (
    <div className="task-form">
      <h2>Create/Edit Task</h2>
      <button onClick={() => navigate('/')}>Back to Dashboard</button>
    </div>
  );
};

const NotFound = () => <h2>404 - Page Not Found</h2>;

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <TaskDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/tasks/new" element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          } />
          
          <Route path="/tasks/edit/:id" element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          } />
          
          {/* Fallback Routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

// Simplified AuthProvider (for completeness)
const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  
  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default App;