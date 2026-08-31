import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { motion, AnimatePresence } from 'framer-motion'

import SceneCanvas from './SceneCanvas'
import AuthOverlay from './AuthOverlay'
import LandingHeader from './landing/LandingHeader'
import LandingLoader from './landing/LandingLoader'
import SectionExtra from './landing/SectionExtra'
import ArchitectureFlowChart from './landing/ArchitectureFlowChart'
import DevSdkCodeBox from './landing/DevSdkCodeBox'
import HowItWorksStepsBox from './landing/HowItWorksStepsBox'
import { SECTIONS_DATA, CODE_EXAMPLES } from './landing/landingData'
import { StructureFlowCollection } from './ui/StructureFlowCollection'
import './LandingPage.css'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export default function LandingPage({ auth }) {
  const navigate = useNavigate()
  const scrollContainerRef = useRef(null)

  const sectionRefs = useRef([])
  const getSectionRef = (idx) => (el) => { sectionRefs.current[idx] = el }

  const [activeSection, setActiveSection] = useState(0)
  const [heroProgress, setHeroProgress] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [cameraProgress, setCameraProgress] = useState(0)
  const [blackProgress, setBlackProgress] = useState(0)

  const [selectedSdkTab, setSelectedSdkTab] = useState('js')
  const [copied, setCopied] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [canvasMounted, setCanvasMounted] = useState(false)
  const [isSceneReady, setIsSceneReady] = useState(false)
  const [loadPercent, setLoadPercent] = useState(0)

  // ── GSAP ScrollTrigger: Continuous portal journey ──
  useEffect(() => {
    const scroller = scrollContainerRef.current
    if (!scroller) return

    let lastSec = -1
    let lastSp = -1
    let lastCp = -1
    let lastBp = -1

    const ctx = gsap.context(() => {
      SECTIONS_DATA.forEach((_, i) => {
        const ref = sectionRefs.current[i]
        if (!ref) return

        ScrollTrigger.create({
          trigger: ref,
          scroller,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onEnter: () => {
            if (lastSec !== i) {
              lastSec = i
              setActiveSection(i)
            }
          },
          onEnterBack: () => {
            if (lastSec !== i) {
              lastSec = i
              setActiveSection(i)
            }
          },
          onUpdate: (self) => {
            if (self.isActive || (i === 0 && self.progress === 0)) {
              if (lastSec !== i) {
                lastSec = i
                setActiveSection(i)
              }
              if (i === 0) setHeroProgress(self.progress)

              const sectionProg = Math.max(0, Math.min(1, self.progress))
              const globalPortalProgress = i < 6 ? (i + sectionProg) / 6.0 : 1.0

              const sp = Math.min(1, globalPortalProgress / 0.5)
              const cp = globalPortalProgress
              const bp = Math.max(0, Math.min(1, (globalPortalProgress - 0.75) / 0.25))

              if (Math.abs(sp - lastSp) > 0.005) {
                lastSp = sp
                setScrollProgress(sp)
              }
              if (Math.abs(cp - lastCp) > 0.005) {
                lastCp = cp
                setCameraProgress(cp)
              }
              if (Math.abs(bp - lastBp) > 0.005) {
                lastBp = bp
                setBlackProgress(bp)
              }
            }
          },
        })
      })
    }, scrollContainerRef)

    return () => ctx.revert()
  }, [])

  const scrollToSection = useCallback((idx) => {
    const scroller = scrollContainerRef.current
    if (!scroller) return

    const targetEl = sectionRefs.current[idx]
    if (!targetEl) return

    setActiveSection(idx)
    const targetY = idx === 0 ? 0 : targetEl.offsetTop + 15
    gsap.to(scroller, {
      scrollTo: { y: targetY, autoKill: false },
      duration: 0.75,
      ease: 'power3.out',
    })
  }, [])

  useEffect(() => {
    if (auth.justLoggedIn) {
      scrollToSection(0)
      const t = setTimeout(() => auth.dismissJustLoggedIn(), 1200)
      return () => clearTimeout(t)
    }
  }, [auth, scrollToSection])

  useEffect(() => {
    const mountTimeout = setTimeout(() => setCanvasMounted(true), 100)
    let pct = 0
    const pctInterval = setInterval(() => {
      pct += Math.random() * 5 + 2
      if (pct >= 95) { pct = 95; clearInterval(pctInterval) }
      setLoadPercent(Math.round(pct))
    }, 100)

    return () => {
      clearTimeout(mountTimeout)
      clearInterval(pctInterval)
    }
  }, [])

  useEffect(() => {
    if (!isSceneReady) return
    setLoadPercent(100)
    const finishTimeout = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(finishTimeout)
  }, [isSceneReady])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[selectedSdkTab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const section = SECTIONS_DATA[activeSection] || SECTIONS_DATA[0]

  return (
    <div className="app-frame">
      <LandingLoader isLoading={isLoading} loadPercent={loadPercent} />

      <LandingHeader
        auth={auth}
        activeSection={activeSection}
        scrollProgress={scrollProgress}
        onScrollToSection={scrollToSection}
        onScrollToTop={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigate={navigate}
      />



      {/* Fixed 3D Canvas */}
      <div className="canvas-container">
        {canvasMounted && (
          <SceneCanvas
            scrollProgress={scrollProgress}
            cameraProgress={cameraProgress}
            blackProgress={blackProgress}
            activeSection={activeSection}
            onReady={() => setIsSceneReady(true)}
          />
        )}
      </div>

      {/* ThreeUI Nebula Background Layer (Fades in during How It Works portal transition) */}
      {(() => {
        const nebulaOpacity = activeSection < 5 
          ? 0 
          : activeSection >= 6 
            ? 1 
            : Math.max(0, Math.min(1, (blackProgress - 0.55) / 0.45));

        return (
          <div
            className="nebula-bg-wrapper"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2,
              opacity: nebulaOpacity,
              transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: nebulaOpacity > 0.1 ? 'auto' : 'none',
            }}
          >
            <StructureFlowCollection
              variant="nebula"
              hue={0}
              saturation={1.00}
              brightness={0.85}
            />
            {/* Soft Top Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.60) 0%, transparent 25%), radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.58) 100%)',
              }}
            />
          </div>
        )
      })()}

      {/* Fixed Left Information Panel — SAME PANEL FOR ALL SECTIONS */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '6%',
          transform: 'translateY(-50%)',
          width: '40%',
          maxWidth: '480px',
          zIndex: 50,
          pointerEvents: 'auto',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="info-column outfit-landing"
            style={{ width: '100%', height: 'auto' }}
          >
            {section.tag && (
              <span className="tag-label" style={{ color: section.tagColor }}>
                {section.tag}
              </span>
            )}
            <h1 className="title-serif">{section.title}</h1>
            <p className="description-text">{section.desc}</p>

            {/* Genesis CTA Button (Only when logged in) */}
            {section.id === 'genesis' && auth?.isLoggedIn && (
              <div className="interactive-content">
                <button
                  onClick={() => navigate('/dashboard')}
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
                  START BUILDING
                </a>
              </div>
            )}

            {/* Extended section extras */}
            <SectionExtra
              section={section}
              selectedSdkTab={selectedSdkTab}
              setSelectedSdkTab={setSelectedSdkTab}
              copied={copied}
              onCopyCode={handleCopyCode}
              onNavigate={navigate}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Creative Architecture Flowchart (Right side of page for Section 08) */}
      <ArchitectureFlowChart isVisible={section.id === 'architecture'} />

      {/* How It Works Steps Box (Right side of page for Section 05) */}
      <HowItWorksStepsBox isVisible={section.id === 'howItWorks'} />

      {/* Developer SDK Code Box (Right side of page for Section 06) */}
      <DevSdkCodeBox
        isVisible={section.id === 'devApi'}
        selectedSdkTab={selectedSdkTab}
        setSelectedSdkTab={setSelectedSdkTab}
        copied={copied}
        onCopyCode={handleCopyCode}
      />

      {/* Developer Auth Overlay */}
      <AuthOverlay heroProgress={heroProgress} auth={auth} />

      {/* Scrollable Container — All Sections as Scroll Triggers */}
      <div ref={scrollContainerRef} className="scroll-container">
        <div ref={getSectionRef(0)} className="scroll-section-trigger" style={{ height: '250vh', pointerEvents: 'none' }} />
        <div ref={getSectionRef(1)} className="scroll-section-trigger" style={{ height: '350vh', pointerEvents: 'none' }} />
        <div ref={getSectionRef(2)} className="scroll-section-trigger" style={{ height: '160vh', pointerEvents: 'none' }} />
        {SECTIONS_DATA.slice(3).map((s, idx) => (
          <div
            key={s.id}
            ref={getSectionRef(idx + 3)}
            className="scroll-section-trigger"
            style={{ height: '140vh', pointerEvents: 'none' }}
          />
        ))}
      </div>
    </div>
  )
}
