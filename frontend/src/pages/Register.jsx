import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AuthPages.css';
import { Sparkles, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    studentId: ''
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerAndSync } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await registerAndSync(formData);
      setMessage('Registration successful! Please check your email to verify your account before logging in.');
      setFormData({
        name: '',
        email: '',
        password: '',
        college: '',
        studentId: ''
      });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container flex items-center justify-center">
      <div className="auth-card">
        <div className="auth-brand-badge">
          <div className="logo-box">K</div>
          <span className="mono uppercase text-gray" style={{ fontSize: '11px', letterSpacing: '1px', fontWeight: '700' }}>
            CAMPUS SYNTHESIS
          </span>
        </div>

        <h2 className="serif text-black auth-title">Join KEVIN.</h2>
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{ background: '#ECFDF5', color: '#047857', padding: '0.85rem', fontSize: '13px', border: '1px solid #A7F3D0', borderRadius: '4px', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '500' }}>{message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="auth-input" />
          <input type="email" name="email" placeholder="College Email (.edu.in or .ac.in)" value={formData.email} onChange={handleChange} required className="auth-input" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="auth-input" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input type="text" name="college" placeholder="College Name" value={formData.college} onChange={handleChange} required className="auth-input" />
            <input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} required className="auth-input" />
          </div>

          <button type="submit" className="cta-button" style={{ width: '100%', justifyContent: 'center', height: '44px', marginTop: '0.5rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Registering Account...' : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="auth-footer text-gray">
          Already have an account? <Link to="/login" className="text-orange">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
