import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const PublicProfile = () => {
  const { id } = useParams();
  const { user, loading } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteTip, setShowInviteTip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        if (response.data.success) {
          setProfile(response.data.data.user);
        }
      } catch (err) {
        setError('Failed to load profile or user does not exist.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, user, loading, navigate]);

  if (loading || isLoading) {
    return (
      <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
          <p>Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
          <div style={{ color: '#991B1B', padding: '1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '4px' }}>
            {error || 'User not found'}
          </div>
          <button onClick={() => navigate('/talent')} className="cta-button" style={{ marginTop: '2rem' }}>Back to Directory</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <button onClick={() => navigate('/talent')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit' }}>
          &larr; Back to Directory
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', alignItems: 'start' }}>
          {/* Profile Sidebar */}
          <div className="dashboard-card" style={{ border: '1px solid var(--border-light)', padding: '2rem', background: 'var(--bg-white)', position: 'sticky', top: '2rem' }}>
            <h2 className="serif text-black" style={{ fontSize: '32px', margin: '0 0 0.5rem 0' }}>{profile.name}</h2>
            <p className="text-gray" style={{ fontSize: '16px', margin: '0 0 2rem 0' }}>{profile.college}</p>
            
            <div style={{ marginBottom: '2rem' }}>
              <p className="text-gray" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Bio</p>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{profile.bio || "This student hasn't written a bio yet."}</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p className="text-gray" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>GitHub Profile</p>
              {profile.github?.username ? (
                <a href={`https://github.com/${profile.github.username}`} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', color: 'var(--accent-orange)', textDecoration: 'none' }}>
                  @{profile.github.username}
                </a>
              ) : (
                <p className="text-gray" style={{ fontSize: '14px' }}>Not connected</p>
              )}
            </div>

            {showInviteTip && (
              <div style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '0.75rem', borderRadius: '4px', fontSize: '13px', marginBottom: '1rem', lineHeight: '1.4' }}>
                To invite this user, navigate to your <strong>Teams</strong> page, open your team details, and click "Find Teammates" to use the AI Matcher.
              </div>
            )}

            <button 
              className="cta-button" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setShowInviteTip(true)}
            >
              Invite to Team
            </button>
          </div>

          {/* Evidence Area */}
          <div>
            <h3 className="mono uppercase text-gray" style={{ marginBottom: '2rem' }}>Verified Skills & Evidence</h3>
            
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {profile.skills?.map(skill => (
                  <span key={skill} style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '14px', fontWeight: '600' }}>
                    {skill}
                  </span>
                ))}
                {(!profile.skills || profile.skills.length === 0) && (
                  <p className="text-gray">No verified skills.</p>
                )}
              </div>
            </div>

            {profile.github?.repositories && profile.github.repositories.length > 0 && (
              <div>
                <h4 style={{ fontSize: '18px', marginBottom: '1.5rem' }}>GitHub Repositories ({profile.github.repositories.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {profile.github.repositories.map((repo) => (
                    <div key={repo.url} style={{ border: '1px solid #E5E7EB', padding: '1.5rem', borderRadius: '8px', background: 'var(--bg-white)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <a href={repo.url} target="_blank" rel="noreferrer" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-orange)', textDecoration: 'none' }}>
                          {repo.repository}
                        </a>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '14px', color: '#6B7280' }}>
                          <span>{repo.language || 'Mixed'}</span>
                          <span>⭐ {repo.stars}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {repo.topics?.map(topic => (
                          <span key={topic} style={{ background: '#F3F4F6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '12px' }}>
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublicProfile;
