import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AuthPages.css';

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
  const navigate = useNavigate();

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
        <h2 className="serif text-black auth-title">Join KEVIN.</h2>
        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{ background: '#F0FDF4', color: '#166534', padding: '0.75rem', fontSize: '12px', border: '1px solid #BBF7D0', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="auth-input" />
          <input type="email" name="email" placeholder="College Email (.edu.in or .ac.in)" value={formData.email} onChange={handleChange} required className="auth-input" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="auth-input" />
          <input type="text" name="college" placeholder="College Name" value={formData.college} onChange={handleChange} required className="auth-input" />
          <input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} required className="auth-input" />
          <button type="submit" className="cta-button" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer text-gray">
          Already have an account? <a href="/login" className="text-orange">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
