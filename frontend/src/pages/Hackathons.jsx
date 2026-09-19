import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { Calendar, Clock, Trophy, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const Hackathons = () => {
  const { user, loading } = useContext(AuthContext);
  const [hackathons, setHackathons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
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

  const filteredHackathons = hackathons.filter(h => {
    if (filterStatus === 'ALL') return true;
    return (h.status || 'Upcoming').toUpperCase() === filterStatus;
  });

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="mono text-orange uppercase flex items-center gap-1" style={{ fontSize: '11px', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: '600' }}>
              <Sparkles size={14} /> CAMPUS COMPETITIONS
            </div>
            <h2 className="serif text-black" style={{ fontSize: '48px', margin: 0, lineHeight: 1 }}>Hackathons & Challenges</h2>
            <p className="text-gray" style={{ fontSize: '17px', margin: '0.5rem 0 0 0' }}>Find upcoming hackathons to test your skills and form verified squads.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: '#EFECE6', padding: '4px', borderRadius: '4px' }}>
            {['ALL', 'UPCOMING', 'ACTIVE'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-mono)',
                  background: filterStatus === status ? 'var(--text-black)' : 'transparent',
                  color: filterStatus === status ? 'var(--bg-white)' : 'var(--text-gray)',
                  transition: 'all 0.2s ease'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={{ color: '#991B1B', padding: '1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '4px', marginBottom: '2rem' }}>{error}</div>}

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-gray)' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--accent-orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}></div>
            <p className="mono" style={{ fontSize: '13px' }}>Loading campus hackathons...</p>
          </div>
        ) : filteredHackathons.length === 0 ? (
          <div style={{ padding: '4rem 2rem', background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '6px', textAlign: 'center' }}>
            <Trophy size={36} className="text-gray" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 className="serif" style={{ fontSize: '24px', marginBottom: '0.5rem' }}>No Hackathons Found</h3>
            <p className="text-gray" style={{ fontSize: '14px' }}>Check back soon for new announcements or change your active status filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {filteredHackathons.map((hackathon, index) => (
              <div 
                key={hackathon._id} 
                className={`dashboard-card interactive-card stagger-${(index % 4) + 1}`}
                style={{ 
                  border: '1px solid var(--border-light)', 
                  borderRadius: '6px',
                  padding: '2rem', 
                  background: 'var(--bg-white)', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-orange)' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>{hackathon.name}</h3>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', background: 'var(--accent-orange-light)', color: 'var(--accent-orange)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                    {hackathon.status || 'Upcoming'}
                  </span>
                </div>
                
                <p className="text-gray" style={{ fontSize: '14px', marginBottom: '1.75rem', flex: 1, lineHeight: 1.6 }}>
                  {hackathon.description || "Join this exciting campus hackathon and collaborate with top talent."}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--bg-ivory)', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} className="text-orange" />
                    <div>
                      <div className="mono text-gray" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Starts</div>
                      <div className="text-black" style={{ fontWeight: '600' }}>{new Date(hackathon.startDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} className="text-gray" />
                    <div>
                      <div className="mono text-gray" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Ends</div>
                      <div className="text-black" style={{ fontWeight: '600' }}>{new Date(hackathon.endDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {toastMessage === hackathon._id && (
                  <div style={{ background: '#ECFDF5', color: '#065F46', padding: '0.6rem', borderRadius: '4px', fontSize: '13px', textAlign: 'center', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #A7F3D0' }}>
                    <CheckCircle2 size={16} /> Registration Interest Noted!
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
                  Register SQUAD <ArrowRight size={16} />
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
