import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register({ onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/users", {
        name,
        email,
        password,
      });
      alert("Registration successful!");
      setName("");
      setEmail("");
      setPassword("");
      navigate("/login");   // Redirect to login page
    } catch (error) {
      console.error(error);
      alert("Error during registration");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleRegister} className="form-box">
        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Name"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <button type="submit" className="btn">Register</button>

        <p className="switch-text">
          Already have an account?{" "}
          <span className="switch-link" onClick={onSwitch}>Login</span>
        </p>
      </form>
    </div>
  );
}

