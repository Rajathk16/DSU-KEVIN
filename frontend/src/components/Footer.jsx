import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <div className="footer-logo"></div>
          <span className="mono uppercase" style={{ fontSize: '12px' }}>KEVIN</span>
        </div>
        
        <div className="mono uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
          CAMPUS SKILL EXCHANGE / TEAM FORMATION
        </div>
        
        <div className="flex items-center" style={{ gap: '2rem' }}>
          <span className="mono uppercase text-gray" style={{ fontSize: '10px' }}>© 2026 KEVIN</span>
          <span className="mono uppercase text-gray" style={{ fontSize: '10px' }}>CAMPUS PRIVACY</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
