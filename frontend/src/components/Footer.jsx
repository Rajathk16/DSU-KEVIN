import React from 'react';
import './Footer.css';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top flex justify-between items-center border-bottom-dark">
          <div className="flex items-center gap-3">
            <div className="footer-logo">K</div>
            <span className="brand-title mono text-white">KEVIN</span>
            <span className="footer-badge mono text-orange uppercase flex items-center gap-1">
              <Sparkles size={10} /> SYSTEM ONLINE
            </span>
          </div>

          <div className="footer-links flex gap-4">
            <Link to="/hackathons" className="footer-link mono text-gray uppercase">Hackathons</Link>
            <Link to="/teams" className="footer-link mono text-gray uppercase">Teams</Link>
            <Link to="/talent" className="footer-link mono text-gray uppercase">Talent</Link>
            <Link to="/dashboard" className="footer-link mono text-gray uppercase">Dashboard</Link>
          </div>
        </div>

        <div className="footer-bottom flex justify-between items-center">
          <div className="mono uppercase text-gray" style={{ fontSize: '11px', letterSpacing: '1px' }}>
            CAMPUS SKILL EXCHANGE & EXPLAINABLE TEAM SYNTHESIS
          </div>

          <div className="flex items-center gap-4">
            <span className="mono uppercase text-gray" style={{ fontSize: '10px' }}>© 2026 KEVIN</span>
            <span className="mono uppercase text-gray" style={{ fontSize: '10px' }}>DSU CAMPUS EDITION</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
