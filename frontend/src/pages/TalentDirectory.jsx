import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { Search, Sparkles, GitBranch, ExternalLink, UserCheck } from 'lucide-react';

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
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [user, loading, navigate, searchTerm]);

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="mono text-orange uppercase flex items-center gap-1" style={{ fontSize: '11px', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: '600' }}>
            <Sparkles size={14} /> VERIFIED STUDENT TALENT
          </div>
          <h2 className="serif text-black" style={{ fontSize: '48px', margin: '0 0 0.5rem 0', lineHeight: 1 }}>
            Talent Directory
          </h2>
          <p className="text-gray" style={{ fontSize: '17px', margin: 0, maxWidth: '600px' }}>
            Discover campus peers with GitHub-verified repositories, skills, and contribution graphs.
          </p>
        </div>

        {/* Enhanced Search Input */}
        <div style={{ marginBottom: '3rem', maxWidth: '540px', position: 'relative' }}>
          <Search size={20} className="text-gray" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by skill (e.g. Python, React, PyTorch, Rust)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1.25rem 1rem 3.25rem',
              fontSize: '15px',
              border: '1px solid var(--border-medium)',
              borderRadius: '6px',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              background: 'var(--bg-white)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.25s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-orange)';
              e.target.style.boxShadow = '0 0 0 4px var(--accent-orange-light)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-medium)';
              e.target.style.boxShadow = 'var(--shadow-sm)';
            }}
          />
        </div>

        {error && <div style={{ color: '#991B1B', padding: '1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '4px', marginBottom: '2rem' }}>{error}</div>}

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-gray)' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--accent-orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}></div>
            <p className="mono" style={{ fontSize: '13px' }}>Searching campus directory...</p>
          </div>
        ) : talents.length === 0 ? (
          <div style={{ padding: '4rem 2rem', background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '6px', textAlign: 'center' }}>
            <UserCheck size={36} className="text-gray" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 className="serif" style={{ fontSize: '24px', marginBottom: '0.5rem' }}>No Talent Found</h3>
            <p className="text-gray" style={{ fontSize: '14px' }}>Try searching for a different skill term like "React", "Node", or "Python".</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {talents.map((talent, index) => {
              const initials = talent.name ? talent.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
              return (
                <div 
                  key={talent._id} 
                  className={`dashboard-card interactive-card stagger-${(index % 4) + 1}`}
                  style={{ 
                    border: '1px solid var(--border-light)', 
                    borderRadius: '6px',
                    padding: '2rem', 
                    background: 'var(--bg-white)', 
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => navigate(`/profile/${talent._id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '50%', 
                        background: 'var(--accent-orange)', 
                        color: 'white', 
                        fontWeight: '700', 
                        fontSize: '14px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px var(--accent-orange-glow)'
                      }}>
                        {initials}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, fontFamily: 'var(--font-serif)' }}>{talent.name}</h3>
                        <p className="text-gray" style={{ fontSize: '13px', margin: '0.1rem 0 0 0' }}>{talent.college || 'DSU Student'}</p>
                      </div>
                    </div>
                    
                    {talent.github?.username ? (
                      <span className="mono flex items-center gap-1" style={{ fontSize: '10px', background: '#F3F4F6', color: '#111827', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        <GitBranch size={12} /> {talent.github.username}
                      </span>
                    ) : (
                      <span className="mono" style={{ fontSize: '10px', background: '#F9FAFB', color: '#9CA3AF', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        Standard
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray" style={{ fontSize: '14px', marginBottom: '1.5rem', height: '42px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5, flex: 1 }}>
                    {talent.bio || "No custom bio provided yet."}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                    <p className="mono text-gray" style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Top Verified Skills</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {talent.skills?.slice(0, 5).map(skill => (
                        <span key={skill} className="skill-chip">
                          {skill}
                        </span>
                      ))}
                      {talent.skills?.length > 5 && (
                        <span className="mono text-gray" style={{ fontSize: '10px', alignSelf: 'center' }}>
                          +{talent.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TalentDirectory;
