import React from 'react'
import SectionExtra from './SectionExtra'

export default function LandingInfoPanel({
  section,
  selectedSdkTab,
  setSelectedSdkTab,
  copied,
  onCopyCode,
  onNavigate,
  isLoggedIn,
}) {
  if (!section) return null

  return (
    <div className="landing-info-container">
      <div
        key={section.id}
        className="info-column outfit-landing lightweight-fade-in"
      >
        {section.tag && (
          <span className="tag-label" style={{ color: section.tagColor }}>
            {section.tag}
          </span>
        )}
        <h1 className="title-serif">{section.title}</h1>
        <p className="description-text">{section.desc}</p>

        {/* Genesis CTA Button (Only when logged in) */}
        {section.id === 'genesis' && isLoggedIn && (
          <div className="interactive-content">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="btn-glassy"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Original Beyond CTA */}
        {section.id === 'beyond' && section.showCta && (
          <div className="interactive-content">
            <a
              href="https://github.com"
              className="btn-glassy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Begin Your Journey
            </a>
          </div>
        )}

        {/* Extended Section Extra Content */}
        <SectionExtra
          section={section}
          selectedSdkTab={selectedSdkTab}
          setSelectedSdkTab={setSelectedSdkTab}
          copied={copied}
          onCopyCode={onCopyCode}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  )
}
