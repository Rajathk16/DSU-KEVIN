import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AuthPages.css';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container flex items-center justify-center" style={{ position: 'relative' }}>
      <Link 
        to="/" 
        style={{ 
          position: 'absolute', 
          top: '2rem', 
          left: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: '#6B7280', 
          textDecoration: 'none',
          fontWeight: '500',
          fontSize: '14px',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>
      <div className="auth-card">
        <div className="auth-brand-badge">
          <div className="logo-box">K</div>
          <span className="mono uppercase text-gray" style={{ fontSize: '11px', letterSpacing: '1px', fontWeight: '700' }}>
            CAMPUS SYNTHESIS
          </span>
        </div>

        <h2 className="serif text-black auth-title">Welcome back.</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '0.4rem' }}>Campus Email</label>
            <input 
              type="email" 
              placeholder="e.g. student@dsu.edu.in" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '0.4rem' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <button type="submit" className="cta-button" style={{ width: '100%', justifyContent: 'center', height: '44px', marginTop: '0.5rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : <>Login to Portal <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="auth-footer text-gray">
          Don't have an account yet? <Link to="/register" className="text-orange">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
