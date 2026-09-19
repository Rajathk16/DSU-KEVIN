import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';
import { ArrowUpRight } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar border-bottom">
      <div className="container flex items-center justify-between">
        <div className="navbar-left flex items-center">
          <Link to="/" className="flex items-center" style={{ textDecoration: 'none' }}>
            <div className="logo-box">K</div>
            <span className="brand-name text-black">KEVIN</span>
          </Link>
          <span className="mono uppercase text-gray" style={{ marginLeft: '1rem', fontSize: '0.75rem', letterSpacing: '1px' }}>
            CAMPUS TEAM SYNTHESIS
          </span>
        </div>
        
        <div className="navbar-right flex items-center">
          <ul className="nav-links flex">
            <li><Link to="/hackathons">Hackathons</Link></li>
            <li><Link to="/teams">Teams</Link></li>
            <li><Link to="/talent">Talent</Link></li>
            {user ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><button onClick={handleLogout} className="text-gray" style={{ fontSize: '14px', fontWeight: '500' }}>Logout</button></li>
              </>
            ) : (
              <li><Link to="/login">Login</Link></li>
            )}
          </ul>
          
          <Link to={user ? "/teams?create=true" : "/login"} className="cta-button" style={{ textDecoration: 'none' }}>
            Build a team <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
