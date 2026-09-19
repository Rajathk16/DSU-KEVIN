import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { Users, Plus, X, Sparkles, ArrowUpRight, ShieldCheck, UserPlus, Layers } from 'lucide-react';

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="mono text-orange uppercase flex items-center gap-1" style={{ fontSize: '11px', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: '600' }}>
              <Sparkles size={14} /> EXPLAINABLE TEAM SYNTHESIS
            </div>
            <h2 className="serif text-black" style={{ fontSize: '48px', margin: '0 0 0.5rem 0', lineHeight: 1 }}>Campus Teams</h2>
            <p className="text-gray" style={{ fontSize: '17px', margin: 0 }}>Discover active project teams, evaluate skill gaps, and apply to join.</p>
          </div>
          
          <button onClick={() => setIsModalOpen(true)} className="cta-button" style={{ height: '44px' }}>
            <Plus size={18} /> Create a Team
          </button>
        </div>

        {/* Animated Create Team Modal */}
        {isModalOpen && (
          <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(23, 24, 27, 0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="modal-content" style={{ background: 'var(--bg-white)', padding: '2.5rem', borderRadius: '8px', width: '100%', maxWidth: '540px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <h3 className="serif" style={{ margin: 0, fontSize: '26px' }}>Create a New Team</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-gray)', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '13px' }}>Team Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={newTeam.name} 
                    onChange={e => setNewTeam({...newTeam, name: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: '4px', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-sans)' }} 
                    placeholder="e.g. Orion Robotics AI" 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '13px' }}>Theme / Track</label>
                    <input 
                      type="text" 
                      value={newTeam.theme} 
                      onChange={e => setNewTeam({...newTeam, theme: e.target.value})} 
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: '4px', outline: 'none', fontSize: '14px' }} 
                      placeholder="e.g. EdTech, Hardware" 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '13px' }}>Max Team Size</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="20" 
                      value={newTeam.maxMembers} 
                      onChange={e => setNewTeam({...newTeam, maxMembers: parseInt(e.target.value) || 4})} 
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: '4px', outline: 'none', fontSize: '14px' }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '13px' }}>Project Description</label>
                  <textarea 
                    value={newTeam.description} 
                    onChange={e => setNewTeam({...newTeam, description: e.target.value})} 
                    rows="3" 
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: '4px', outline: 'none', resize: 'vertical', fontSize: '14px' }} 
                    placeholder="Describe your vision, core tech stack, and what missing roles you need filled..." 
                  />
                </div>

                <div style={{ background: 'var(--bg-ivory)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ fontWeight: '600', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <UserPlus size={15} className="text-orange" /> Initial Squad Members
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {guestError && <span style={{ color: '#991B1B', fontSize: '11px' }}>{guestError}</span>}
                      <button type="button" onClick={handleAddGuestInput} style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        + Add Member
                      </button>
                    </div>
                  </div>
                  
                  {newTeam.guestMembers.map((guest, index) => (
                    <div key={guest._uid || index} style={{ padding: '0.85rem', background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '4px', marginBottom: '0.5rem', position: 'relative' }}>
                      <button type="button" onClick={() => handleRemoveGuestInput(index)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                        <X size={14} />
                      </button>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', paddingRight: '1rem' }}>
                        <input required type="text" placeholder="Name *" value={guest.name} onChange={e => handleUpdateGuest(index, 'name', e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px' }} />
                        <input type="text" placeholder="Role (e.g. Frontend)" value={guest.role} onChange={e => handleUpdateGuest(index, 'role', e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px' }} />
                      </div>
                      <input type="url" placeholder="GitHub URL (optional)" value={guest.githubUrl} onChange={e => handleUpdateGuest(index, 'githubUrl', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px' }} />
                    </div>
                  ))}
                  {newTeam.guestMembers.length === 0 && (
                    <p style={{ fontSize: '12px', color: 'var(--text-gray)', margin: 0 }}>No extra members added yet. Click "+ Add Member" to invite team mates.</p>
                  )}
                </div>
                
                {createError && <p style={{ color: '#991B1B', margin: 0, fontSize: '13px' }}>{createError}</p>}
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
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
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-gray)' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--accent-orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}></div>
            <p className="mono" style={{ fontSize: '13px' }}>Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div style={{ padding: '4rem 2rem', background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '6px', textAlign: 'center' }}>
            <Users size={36} className="text-gray" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 className="serif" style={{ fontSize: '24px', marginBottom: '0.5rem' }}>No Teams Formed Yet</h3>
            <p className="text-gray" style={{ fontSize: '14px', marginBottom: '1.5rem' }}>Be the first campus leader to initialize a project team.</p>
            <button onClick={() => setIsModalOpen(true)} className="cta-button">Create First Team</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {teams.map((team, index) => (
              <div 
                key={team._id} 
                className={`dashboard-card interactive-card stagger-${(index % 4) + 1}`}
                style={{ 
                  border: '1px solid var(--border-light)', 
                  borderRadius: '6px',
                  padding: '2rem', 
                  background: 'var(--bg-white)', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>{team.name}</h3>
                    {team.theme && (
                      <span className="mono text-gray" style={{ fontSize: '11px', textTransform: 'uppercase', marginTop: '0.2rem', display: 'inline-block' }}>
                        {team.theme}
                      </span>
                    )}
                  </div>
                  <span style={{ 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    background: team.status === 'forming' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                    color: team.status === 'forming' ? '#047857' : '#B45309', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '999px', 
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-mono)' 
                  }}>
                    {team.status}
                  </span>
                </div>
                
                <p className="text-gray" style={{ fontSize: '14px', marginBottom: '1.5rem', flex: 1, lineHeight: 1.6 }}>
                  {team.description || "No description provided for this project team."}
                </p>

                <div style={{ background: 'var(--bg-ivory)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="mono text-gray" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Team Lead</span>
                    <span className="mono text-gray" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Capacity</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--text-black)', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {team.owner?.name ? team.owner.name[0].toUpperCase() : 'O'}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>{team.owner?.name || 'Owner'}</span>
                    </div>
                    <span className="mono text-orange" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      {team.members?.length || 0} / {team.maxMembers || 4}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {team.members?.filter(m => m.user).map(member => (
                      <span key={member.user._id} style={{ background: '#F3F4F6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>
                        {member.user.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/teams/${team._id}`)} 
                  className="cta-button" 
                  style={{ width: '100%', justifyContent: 'center', background: 'transparent', color: 'var(--accent-orange)', border: '1px solid var(--accent-orange)' }}
                >
                  View Team Details <ArrowUpRight size={16} />
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
