import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AuthPages.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container flex items-center justify-center">
      <div className="auth-card">
        <h2 className="serif text-black auth-title">Welcome back.</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input 
            type="email" 
            placeholder="College Email (.edu or .ac.in)" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" className="cta-button" style={{ width: '100%', justifyContent: 'center' }}>
            Login
          </button>
        </form>
        <p className="auth-footer text-gray">
          Don't have an account? <a href="/register" className="text-orange">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
