import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const Hackathons = () => {
  const { user, loading } = useContext(AuthContext);
  const [hackathons, setHackathons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchHackathons = async () => {
      try {
        const response = await api.get('/hackathons');
        if (response.data.success) {
          setHackathons(response.data.data);
        }
      } catch (err) {
        setError('Failed to load hackathons.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathons();
  }, [user, loading, navigate]);

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 className="serif text-black" style={{ fontSize: '48px', margin: '0 0 0.5rem 0' }}>Hackathons</h2>
            <p className="text-gray" style={{ fontSize: '18px', margin: 0 }}>Find upcoming hackathons to test your skills.</p>
          </div>
        </div>

        {error && <div style={{ color: '#991B1B', padding: '1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '4px', marginBottom: '2rem' }}>{error}</div>}

        {isLoading ? (
          <p className="text-gray">Loading hackathons...</p>
        ) : hackathons.length === 0 ? (
          <p className="text-gray">No hackathons are currently scheduled.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {hackathons.map((hackathon) => (
              <div 
                key={hackathon._id} 
                className="dashboard-card" 
                style={{ border: '1px solid var(--border-light)', padding: '2rem', background: 'var(--bg-white)', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>{hackathon.name}</h3>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', background: '#F3F4F6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                    {hackathon.status || 'Upcoming'}
                  </span>
                </div>
                
                <p className="text-gray" style={{ fontSize: '14px', marginBottom: '1.5rem', flex: 1 }}>
                  {hackathon.description || "Join this exciting campus hackathon and collaborate with top talent."}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '13px' }}>
                  <div>
                    <strong className="text-black">Start Date:</strong>
                    <div className="text-gray">{new Date(hackathon.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <strong className="text-black">End Date:</strong>
                    <div className="text-gray">{new Date(hackathon.endDate).toLocaleDateString()}</div>
                  </div>
                </div>

                {toastMessage === hackathon._id && (
                  <div style={{ background: '#F3F4F6', color: '#374151', padding: '0.5rem', borderRadius: '4px', fontSize: '13px', textAlign: 'center', marginBottom: '1rem' }}>
                    Registration functionality coming soon!
                  </div>
                )}

                <button 
                  className="cta-button" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setToastMessage(hackathon._id);
                    setTimeout(() => setToastMessage(''), 3000);
                  }}
                >
                  Register Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Hackathons;
