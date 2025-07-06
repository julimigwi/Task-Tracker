import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // JSON Server expects a GET request for filtering users
      const response = await axios.get('http://localhost:5000/users', {
        params: {
          email: formData.email,
          password: formData.password // Note: In production, never handle passwords like this
        }
      });

      if (response.data.length === 0) {
        throw new Error("Invalid credentials");
      }

      const user = response.data[0];
      
      // For JSON Server, we simulate a token
      const token = "simulated-token-" + user.id;
      
      login(user, token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 
               err.message || 
               "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="https://media.istockphoto.com/id/2176243874/photo/calendar-with-marked-date.webp?a=1&b=1&s=612x612&w=0&k=20&c=7u9oRp1JnNmmqyY0RqecBS6AwcJjztbOpEjw8MDPLNE=" alt="Task Pulse" className="login-logo" />
          <h2>Welcome Back</h2>
          <p>Log in to manage your tasks</p>
        </div>

        {error && (
          <div className="alert error">
            {error}
            {error.includes("credentials") && (
              <div className="retry-suggestion">
                Try: test@example.com / password123
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="test@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="username"
              className={error ? "error-input" : ""}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="password123"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className={error ? "error-input" : ""}
            />
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="btn primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <span>Don't have an account?</span>
          <Link to="/register" className="link">Register</Link>
        </div>
      </div>
    </div>
  );
}