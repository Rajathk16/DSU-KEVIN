import React from 'react';

export function GalleryHeading({
  variant = "rising-diagonal",
  mode = "light",
  font = "sans",
  weight = "400",
  headlineSize = 1.15,
  hue = 0,
  saturation = 1.00,
  brightness = 1.00,
  title = "CAMPUS TEAM SYNTHESIS",
  subtitle = "KEVIN EXPLAINABLE MATCHING ENGINE"
}) {
  return (
    <div 
      className={`gallery-heading-shader variant-${variant} mode-${mode}`}
      style={{
        position: 'relative',
        padding: '2rem 1.5rem',
        background: mode === 'light' ? 'rgba(247, 246, 241, 0.9)' : '#070708',
        borderRadius: '6px',
        border: '1px solid var(--border-medium)',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, rgba(230, 83, 45, ${0.08 * brightness}) 0%, transparent 60%)`,
          pointerEvents: 'none'
        }}
      />
      <div className="mono text-orange uppercase" style={{ fontSize: '11px', letterSpacing: '1.5px', marginBottom: '0.4rem', fontWeight: '700' }}>
        {subtitle}
      </div>
      <h2 className="serif" style={{ fontSize: `${2.2 * headlineSize}rem`, margin: 0, lineHeight: 1.1, color: mode === 'light' ? '#17181b' : '#ffffff' }}>
        {title}
      </h2>
    </div>
  );
}

export default GalleryHeading;
