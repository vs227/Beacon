import { useEffect, useState } from 'react'
import { Leva, useControls } from 'leva'

export function useDevSettings() {
  // Use Leva useControls hook to define adjustable parameters
  const settings = useControls('Exhibition Config', {
    bloomIntensity: { value: 0.45, min: 0, max: 5, step: 0.05, label: 'Bloom Intensity' },
    bloomThreshold: { value: 0.72, min: 0, max: 1, step: 0.02, label: 'Bloom Threshold' },
    spotlightIntensity: { value: 340, min: 0, max: 500, step: 5, label: 'Spotlight Lux' },
    spotlightColor: { value: '#FFF6EA', label: 'Spotlight Tint' },
    metalness: { value: 0.05, min: 0, max: 1, step: 0.05, label: 'Sculpture Metal' },
    roughness: { value: 0.95, min: 0, max: 1, step: 0.05, label: 'Sculpture Rough' },
    dofAperture: { value: 0.005, min: 0, max: 0.2, step: 0.001, label: 'DoF Aperture' },
    dofFocusDistance: { value: 12.9, min: 1, max: 20, step: 0.1, label: 'DoF Focus Dist' },
  })

  return settings
}

export default function DevControls() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Leva control panel by pressing 'd' or 'D'
      if (e.key === 'd' || e.key === 'D') {
        setVisible((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div style={{ position: 'fixed', zIndex: 99999, display: visible ? 'block' : 'none' }}>
      <Leva hidden={!visible} theme={{
        colors: {
          elevation1: '#18181b',
          elevation2: '#09090b',
          elevation3: '#27272a',
          accent1: '#c5a880',
          accent2: '#a1805b',
          accent3: '#52525b',
          text1: '#ffffff',
          text2: '#a1a1aa',
        }
      }} />
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        background: 'rgba(0,0,0,0.7)',
        color: '#c5a880',
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        border: '1px solid rgba(197, 168, 128, 0.2)'
      }}>
        Press [D] to toggle dev panel
      </div>
    </div>
  )
}
