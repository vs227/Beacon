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

        {/* Original Genesis CTA */}
        {section.id === 'genesis' && isLoggedIn && (
          <button
            onClick={() => onNavigate('/dashboard/organizations')}
            className="btn-terracotta"
            style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Get Started</span>
            <span style={{ opacity: 0.7 }}>➔</span>
          </button>
        )}

        {/* Original Beyond CTA */}
        {section.id === 'beyond' && section.showCta && (
          <div className="interactive-content">
            <a
              href="https://github.com"
              className="btn-terracotta"
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
