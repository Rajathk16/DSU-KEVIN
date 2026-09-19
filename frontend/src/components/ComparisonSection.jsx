import React, { useState } from 'react';
import './ComparisonSection.css';
import { ChevronRight, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const ComparisonSection = () => {
  const [hoveredElementId, setHoveredElementId] = useState(null);

  const usualWay = [
    { id: 'u0', text: "Student looking for project", detail: "Broadcasts messages to unstructured channels" },
    { id: 'u1', text: "WhatsApp / Discord / group chat", detail: "Low response rate & buried requests" },
    { id: 'u2', text: "“Anyone interested in AI?”", detail: "Vague recruitment criteria without stack proof" },
    { id: 'u3', text: "Manual searching & awkward DMs", detail: "Time-consuming self-promotion" },
    { id: 'u4', text: "Unknown skill level & ghosting", detail: "High risk of incomplete project delivery" },
    { id: 'u5', text: "Mismatched Team", detail: "Unbalanced skill distribution" }
  ];

  const kevinWay = [
    { id: 'k0', text: "Project Requirements Defined", detail: "Target roles & required tech stack input" },
    { id: 'k1', text: "Automated Skill Gap Analysis", detail: "Calculates missing core competencies" },
    { id: 'k2', text: "Verified Campus Students", detail: "Filtered by active campus profile" },
    { id: 'k3', text: "GitHub Evidence & Commit History", detail: "Empirical proof of real code contributions" },
    { id: 'k4', text: "Explainable Match Score (90%+)", detail: "Transparent AI algorithm recommendations" },
    { id: 'k5', text: "Optimal High-Performance Team", detail: "Balanced, ready-to-ship squad" }
  ];

  return (
    <section className="comparison-section reveal-on-scroll">
      <div className="container">
        <div className="comparison-header-main text-center">
          <span className="mono text-orange uppercase section-tag flex items-center justify-center gap-1">
            <Sparkles size={14} /> METHODOLOGY COMPARISON
          </span>
          <h2 className="serif section-headline">Why Campus Teams Switch to KEVIN</h2>
        </div>

        <div className="comparison-grid">
          {/* Left Column: The Usual Way */}
          <div className="compare-col compare-usual reveal-on-scroll stagger-1">
            <div className="compare-header flex justify-between items-center">
              <div className="flex items-center">
                <div className="badge badge-outline">
                  <XCircle size={14} className="text-gray" />
                </div>
                <h3 className="serif text-black col-title">The usual way</h3>
              </div>
              <span className="mono text-gray label-tiny uppercase">GUESSWORK</span>
            </div>
            
            <div className="compare-list">
              {usualWay.map((item, index) => {
                const isItemHovered = hoveredElementId === item.id;
                return (
                  <div key={item.id} className="compare-row flex justify-between items-center">
                    <div 
                      className={`item-element-box usual-element ${isItemHovered ? 'element-highlight-usual' : ''}`}
                      onMouseEnter={() => setHoveredElementId(item.id)}
                      onMouseLeave={() => setHoveredElementId(null)}
                    >
                      <span className="mono text-gray row-num">0{index + 1}</span>
                      <div>
                        <span className="row-text text-gray">{item.text}</span>
                        <span className="row-subdetail text-gray mono">{item.detail}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`text-gray chev ${isItemHovered ? 'chev-active' : ''}`} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="divider-vertical"></div>

          {/* Right Column: The KEVIN Way */}
          <div className="compare-col compare-kevin reveal-on-scroll stagger-2">
            <div className="compare-header flex justify-between items-center">
              <div className="flex items-center">
                <div className="badge badge-filled">
                  <CheckCircle size={14} className="text-white" />
                </div>
                <h3 className="serif text-black col-title">The KEVIN way</h3>
              </div>
              <span className="mono text-orange label-tiny uppercase">EXPLAINABLE MATCH</span>
            </div>
            
            <div className="compare-list">
              {kevinWay.map((item, index) => {
                const isItemHovered = hoveredElementId === item.id;
                return (
                  <div key={item.id} className="compare-row flex justify-between items-center">
                    <div 
                      className={`item-element-box kevin-element ${isItemHovered ? 'element-highlight-kevin' : ''}`}
                      onMouseEnter={() => setHoveredElementId(item.id)}
                      onMouseLeave={() => setHoveredElementId(null)}
                    >
                      <span className="mono text-orange row-num">0{index + 1}</span>
                      <div>
                        <span className={`row-text ${index >= 3 ? 'fw-bold text-orange' : 'text-black'}`}>
                          {item.text}
                        </span>
                        <span className="row-subdetail text-gray mono">{item.detail}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`text-orange chev ${isItemHovered ? 'chev-active' : ''}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
