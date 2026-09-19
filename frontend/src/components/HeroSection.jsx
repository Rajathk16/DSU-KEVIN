import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './HeroSection.css';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  return (
    <section className="hero">
      <div className="container flex">
        <div className="hero-left">
          <div className="hero-eyebrow mono text-orange uppercase flex items-center">
            <span className="dot"></span> CAMPUS-ONLY · SKILL EXCHANGE / 001
          </div>
          
          <h1 className="hero-headline">
            <span className="block text-black">YOUR CAMPUS</span>
            <span className="block text-black">HAS THE</span>
            <span className="block text-black">TALENT.</span>
            <span className="block text-orange italic">KEVIN FINDS</span>
            <span className="block text-orange italic">THE MISSING</span>
            <span className="block text-orange italic">PIECE.</span>
          </h1>
          
          <p className="hero-subtext">
            Build teams around what your project needs — not <br/>just who you already know.
          </p>
          
          <div className="hero-actions flex items-center">
            <button className="cta-button" onClick={() => navigate(user ? '/teams?create=true' : '/login')}>
              Build a team <ArrowUpRight size={16} />
            </button>
            <Link to="/talent" className="secondary-link flex items-center">
              Explore talent <ArrowDownRight size={16} />
            </Link>
          </div>
        </div>
        
        <div className="hero-right">
          {/* We'll implement the visualization in a separate component or here later */}
          <div className="visualization-placeholder" style={{ borderRadius: '4px', overflow: 'hidden' }}>
            <div className="vis-header flex justify-between mono" style={{ background: 'var(--text-black)', color: 'var(--bg-white)', padding: '0.5rem 1rem' }}>
              <span className="text-orange"><span className="dot" style={{ background: 'var(--accent-orange)' }}></span> MATCH FOUND · 94%</span>
              <span className="text-gray">07 / 08</span>
            </div>
            <div className="vis-body" style={{ background: 'var(--bg-ivory)', height: '100%', position: 'relative', padding: '2rem' }}>
               
               {/* Center Project Card */}
               <div className="mock-card" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotateY(-10deg)', zIndex: 10 }}>
                  <div className="mock-card-title">PROJECT</div>
                  <div className="mock-card-name" style={{ color: 'var(--accent-orange)' }}>ORION-X</div>
                  <div className="mono text-gray" style={{ fontSize: '8px', marginTop: '1rem' }}>AUTONOMOUS ROVER</div>
               </div>

               {/* Simulated nodes (just visual elements) */}
               <div style={{ position: 'absolute', top: '20%', left: '20%', border: '1px solid var(--border-light)', padding: '0.5rem', background: 'white' }}>
                 <div className="mono" style={{ fontSize: '10px' }}>Arjun (Python)</div>
               </div>
               
               <div style={{ position: 'absolute', bottom: '20%', right: '15%', border: '1px solid var(--accent-orange)', padding: '0.5rem', background: 'white', zIndex: 20, boxShadow: '4px 4px 0 rgba(0,0,0,0.05)' }}>
                 <div className="flex items-center" style={{ gap: '0.5rem' }}>
                   <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-orange)', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>AS</div>
                   <div>
                     <div className="serif text-black" style={{ fontSize: '14px', fontWeight: 'bold' }}>Ananya Sharma</div>
                     <div className="mono text-gray" style={{ fontSize: '8px' }}>Computer Vision · 94%</div>
                   </div>
                 </div>
               </div>

               {/* SVG Connecting lines (placeholder) */}
               <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                 <path d="M 120,100 Q 250,150 250,250" stroke="var(--border-light)" fill="transparent" />
                 <path d="M 250,250 Q 300,350 400,300" stroke="var(--accent-orange)" strokeWidth="2" fill="transparent" />
               </svg>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
