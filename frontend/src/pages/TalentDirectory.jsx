import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const TalentDirectory = () => {
  const { user, loading } = useContext(AuthContext);
  const [talents, setTalents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTalent = async () => {
      try {
        setIsLoading(true);
        const url = searchTerm ? `/users?skill=${encodeURIComponent(searchTerm)}` : '/users';
        const response = await api.get(url);
        if (response.data.success) {
          setTalents(response.data.data.users);
        }
      } catch (err) {
        setError('Failed to fetch talent directory.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchTalent();
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [user, loading, navigate, searchTerm]);

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <h2 className="serif text-black" style={{ fontSize: '48px', marginBottom: '1rem' }}>
          Discover Talent
        </h2>
        <p className="text-gray" style={{ marginBottom: '2rem', fontSize: '18px' }}>
          Find students with GitHub-verified skills to collaborate with.
        </p>

        <div style={{ marginBottom: '3rem', maxWidth: '500px' }}>
          <input
            type="text"
            placeholder="Search by verified skill (e.g., Python, React)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              fontSize: '16px',
              border: '1px solid #E5E7EB',
              borderRadius: '4px',
              outline: 'none',
              fontFamily: 'Inter, sans-serif'
            }}
          />
        </div>

        {error && <div style={{ color: '#991B1B', marginBottom: '2rem' }}>{error}</div>}

        {isLoading ? (
          <p className="text-gray">Loading talent...</p>
        ) : talents.length === 0 ? (
          <p className="text-gray">No students found matching that skill.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {talents.map((talent) => (
              <div 
                key={talent._id} 
                className="dashboard-card" 
                style={{ border: '1px solid var(--border-light)', padding: '2rem', background: 'var(--bg-white)', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onClick={() => navigate(`/profile/${talent._id}`)}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{talent.name}</h3>
                    <p className="text-gray" style={{ fontSize: '14px', margin: '0.25rem 0 0 0' }}>{talent.college}</p>
                  </div>
                  <span style={{ fontSize: '12px', background: '#F3F4F6', color: '#4B5563', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                    {talent.github?.username ? `GH: ${talent.github.username}` : 'No GitHub'}
                  </span>
                </div>
                
                <p className="text-gray" style={{ fontSize: '14px', marginBottom: '1.5rem', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {talent.bio || "No bio provided."}
                </p>

                <div>
                  <p className="text-gray" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Top Skills</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {talent.skills?.slice(0, 5).map(skill => (
                      <span key={skill} style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>
                        {skill}
                      </span>
                    ))}
                    {talent.skills?.length > 5 && (
                      <span style={{ color: '#6B7280', fontSize: '11px', alignSelf: 'center' }}>
                        +{talent.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TalentDirectory;
