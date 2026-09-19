import React from 'react';
import './ComparisonSection.css';
import { ChevronRight } from 'lucide-react';

const ComparisonSection = () => {
  const usualWay = [
    "Student",
    "WhatsApp / Discord / group chat",
    "“Anyone interested?”",
    "Manual searching",
    "Unknown skill level",
    "Team"
  ];

  const kevinWay = [
    "Project",
    "Required skills",
    "Team skill gap",
    "Verified students",
    "GitHub evidence",
    "Explainable match",
    "Team"
  ];

  return (
    <section className="comparison-section">
      <div className="container">
        <div className="comparison-grid">
          {/* Left Column */}
          <div className="compare-col">
            <div className="compare-header flex justify-between items-center">
              <div className="flex items-center">
                <div className="badge badge-outline">A</div>
                <h3 className="serif text-black" style={{ fontSize: '24px', marginLeft: '12px' }}>The usual way</h3>
              </div>
              <span className="mono text-gray label-tiny uppercase">GUESSWORK</span>
            </div>
            
            <div className="compare-list">
              {usualWay.map((item, index) => (
                <div key={index} className="compare-row flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="mono text-gray row-num">0{index + 1}</span>
                    <span className="row-text text-gray">{item}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray chev" />
                </div>
              ))}
            </div>
          </div>

          <div className="divider-vertical"></div>

          {/* Right Column */}
          <div className="compare-col">
            <div className="compare-header flex justify-between items-center">
              <div className="flex items-center">
                <div className="badge badge-filled">B</div>
                <h3 className="serif text-black" style={{ fontSize: '24px', marginLeft: '12px' }}>The KEVIN way</h3>
              </div>
              <span className="mono text-orange label-tiny uppercase">EXPLAINABLE</span>
            </div>
            
            <div className="compare-list">
              {kevinWay.map((item, index) => (
                <div key={index} className="compare-row flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="mono text-orange row-num">0{index + 1}</span>
                    <span className={`row-text text-black ${index === 4 || index === 5 ? 'fw-600' : ''}`}>
                      {item}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-orange chev" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
