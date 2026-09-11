import React from 'react'
import { CODE_EXAMPLES } from './landingData'

export default function SectionExtra({
  section,
  selectedSdkTab,
  setSelectedSdkTab,
  copied,
  onCopyCode,
  onNavigate,
}) {
  if (!section) return null

  if (section.callout) {
    return (
      <div className="section-callout-card">
        <p>{section.callout}</p>
      </div>
    )
  }

  if (section.showFlow) {
    return (
      <div className="section-flow-row">
        <span className="flow-node">YOUR DATA</span>
        <span className="flow-sep">➔</span>
        <span className="flow-node beacon-hl">BEACON</span>
        <span className="flow-sep">➔</span>
        <span className="flow-node">YOUR AI APP</span>
      </div>
    )
  }

  if (section.showSteps) {
    return null
  }

  if (section.showCodeTabs) {
    return null
  }

  if (section.showArch) {
    return null
  }

  if (section.showFinalCta) {
    return (
      <div className="interactive-content" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button onClick={() => onNavigate('/dashboard')} className="btn-glassy">
          START BUILDING
        </button>
        <a href="https://github.com" className="btn-void" target="_blank" rel="noopener noreferrer">
          READ THE DOCS
        </a>
      </div>
    )
  }

  return null
}
