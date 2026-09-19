import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const Teams = () => {
  const { user, loading } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTeams = async () => {
      try {
        const response = await api.get('/teams');
        if (response.data.success) {
          setTeams(response.data.data);
        }
      } catch (err) {
        setError('Failed to load teams.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [user, loading, navigate]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', theme: '', maxMembers: 4, guestMembers: [] });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [guestError, setGuestError] = useState('');

  // Check URL query param for ?create=true to auto-open modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') === 'true') {
      setIsModalOpen(true);
      // Remove query param to clean URL
      window.history.replaceState({}, '', '/teams');
    }
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return;
    
    setIsCreating(true);
    setCreateError('');
    try {
      const response = await api.post('/teams', newTeam);
      if (response.data.success) {
        setTeams([response.data.data, ...teams]);
        setIsModalOpen(false);
        setNewTeam({ name: '', description: '', theme: '', maxMembers: 4, guestMembers: [] });
      }
    } catch (err) {
      setCreateError(err.response?.data?.error?.message || 'Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddGuestInput = () => {
    if (newTeam.guestMembers.length + 1 >= newTeam.maxMembers) {
      setGuestError(`Cannot add more members. Max capacity is ${newTeam.maxMembers}`);
      setTimeout(() => setGuestError(''), 3000);
      return;
    }
    setGuestError('');
    setNewTeam({
      ...newTeam,
      guestMembers: [...newTeam.guestMembers, { _uid: `${Date.now()}_${Math.random()}`, name: '', role: '', githubUrl: '' }]
    });
  };

  const handleUpdateGuest = (index, field, value) => {
    const updatedGuests = [...newTeam.guestMembers];
    updatedGuests[index][field] = value;
    setNewTeam({ ...newTeam, guestMembers: updatedGuests });
  };

  const handleRemoveGuestInput = (index) => {
    const updatedGuests = newTeam.guestMembers.filter((_, i) => i !== index);
    setNewTeam({ ...newTeam, guestMembers: updatedGuests });
  };

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '4rem 2rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 className="serif text-black" style={{ fontSize: '48px', margin: '0 0 0.5rem 0' }}>Teams</h2>
            <p className="text-gray" style={{ fontSize: '18px', margin: 0 }}>Discover active teams and join their mission.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="cta-button">Create a Team</button>
        </div>

        {/* Create Team Modal */}
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '24px' }}>Create a New Team</h3>
              
              <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Team Name *</label>
                  <input required type="text" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '4px' }} placeholder="e.g. Code Ninjas" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Theme / Track</label>
                  <input type="text" value={newTeam.theme} onChange={e => setNewTeam({...newTeam, theme: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '4px' }} placeholder="e.g. EdTech, FinTech" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Max Team Size</label>
                  <input type="number" min="1" max="20" value={newTeam.maxMembers} onChange={e => setNewTeam({...newTeam, maxMembers: parseInt(e.target.value) || 4})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                  <textarea value={newTeam.description} onChange={e => setNewTeam({...newTeam, description: e.target.value})} rows="4" style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '4px', resize: 'vertical' }} placeholder="What are you building?" />
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: '500', margin: 0 }}>Team Members</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {guestError && <span style={{ color: '#991B1B', fontSize: '12px' }}>{guestError}</span>}
                      <button type="button" onClick={handleAddGuestInput} style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '18px' }}>+</span> Add Member
                      </button>
                    </div>
                  </div>
                  
                  {newTeam.guestMembers.map((guest, index) => (
                    <div key={guest._uid || index} style={{ padding: '1rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px', marginBottom: '0.5rem', position: 'relative' }}>
                      <button type="button" onClick={() => handleRemoveGuestInput(index)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', paddingRight: '1rem' }}>
                        <input required type="text" placeholder="Name *" value={guest.name} onChange={e => handleUpdateGuest(index, 'name', e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                        <input type="text" placeholder="Role (e.g. Frontend)" value={guest.role} onChange={e => handleUpdateGuest(index, 'role', e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                      </div>
                      <input type="url" placeholder="GitHub URL (optional)" value={guest.githubUrl} onChange={e => handleUpdateGuest(index, 'githubUrl', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                    </div>
                  ))}
                  {newTeam.guestMembers.length === 0 && (
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>No extra members added yet. Click "+ Add Member" to invite guests.</p>
                  )}
                </div>
                
                {createError && <p style={{ color: '#991B1B', margin: 0 }}>{createError}</p>}
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                  <button type="submit" disabled={isCreating} className="cta-button" style={{ flex: 1, justifyContent: 'center' }}>
                    {isCreating ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {error && <div style={{ color: '#991B1B', padding: '1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '4px', marginBottom: '2rem' }}>{error}</div>}

        {isLoading ? (
          <p className="text-gray">Loading teams...</p>
        ) : teams.length === 0 ? (
          <p className="text-gray">No teams have been formed yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {teams.map((team) => (
              <div 
                key={team._id} 
                className="dashboard-card" 
                style={{ border: '1px solid var(--border-light)', padding: '2rem', background: 'var(--bg-white)', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{team.name}</h3>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', background: team.status === 'forming' ? '#D1FAE5' : '#FEF3C7', color: team.status === 'forming' ? '#065F46' : '#92400E', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                    {team.status}
                  </span>
                </div>
                
                <p className="text-gray" style={{ fontSize: '14px', marginBottom: '1.5rem', flex: 1 }}>
                  {team.description || "No description provided."}
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <p className="text-gray" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Team Lead</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{team.owner?.name}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p className="text-gray" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Members ({team.members?.length || 0})</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {team.members?.filter(m => m.user).map(member => (
                      <span key={member.user._id} style={{ background: '#F3F4F6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '12px' }}>
                        {member.user.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button onClick={() => navigate(`/teams/${team._id}`)} className="cta-button" style={{ width: '100%', justifyContent: 'center', background: 'transparent', color: 'var(--accent-orange)', border: '1px solid var(--accent-orange)' }}>
                  View Details
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

export default Teams;
