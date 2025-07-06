import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.get(`http://localhost:5000/users?email=${email}&password=${password}`);
      if (res.data.length > 0) {
        login(res.data[0]);
        navigate("/");
      } else {
        alert("Invalid credentials!");
      }
    } catch (error) {
      console.error(error);
      alert("Error during login");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleLogin} className="form-box">
        <h2>Welcome Back</h2>

        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn">Login</button>

        <p className="switch-text">
          Don't have an account?{" "}
          <a href="/register" className="switch-link">Register</a>
        </p>
      </form>
    </div>
  );
}
