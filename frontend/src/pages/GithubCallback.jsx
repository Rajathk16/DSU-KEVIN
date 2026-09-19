import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const GithubCallback = () => {
  const [status, setStatus] = useState('Syncing GitHub profile...');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (loading) return; // Wait until authentication state is resolved

    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      
      if (!code) {
        setStatus('No authorization code provided.');
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }

      try {
        await api.post('/github/oauth', { code });
        setStatus('Successfully synced your GitHub profile! Redirecting...');
        // We might want to refresh the user context here, but for now just redirect
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (err) {
        setStatus('Failed to sync GitHub profile: ' + (err.response?.data?.error?.message || err.message));
        setTimeout(() => navigate('/dashboard'), 4000);
      }
    };

    if (user) {
      handleCallback();
    } else {
      setStatus('You must be logged in to sync GitHub.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [location, navigate, user, loading]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-ivory)' }}>
      <div className="auth-card text-center">
        <h2 className="serif text-black" style={{ marginBottom: '1rem' }}>GitHub Integration</h2>
        <p className="mono text-gray">{status}</p>
      </div>
    </div>
  );
};

export default GithubCallback;
