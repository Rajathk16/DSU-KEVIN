import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container flex items-center justify-center" style={{ flex: 1, padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '540px', background: 'var(--bg-white)', padding: '3.5rem 2rem', borderRadius: '8px', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-md)' }}>
          <div className="mono text-orange" style={{ fontSize: '14px', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '1rem' }}>
            ERROR 404
          </div>
          <h1 className="serif text-black" style={{ fontSize: '42px', marginBottom: '1rem' }}>
            Page Not Found
          </h1>
          <p className="text-gray" style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '2rem' }}>
            The campus coordinate you are looking for does not exist, has been moved, or is temporarily unavailable.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/" className="cta-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home size={16} /> Return to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
