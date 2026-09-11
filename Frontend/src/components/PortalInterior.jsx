import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { GlobeCollection } from '../shaders/globe/GlobeCollection'
import '../shaders/threeui.css'

// Portal interior — Energy Orb 3D Globe fitting portal frame
const OPEN_W = 1.20   // portal opening width
const OPEN_H = 2.16   // portal opening height

export default function PortalInterior({ scrollProgress = 0, ...props }) {
  const groupRef = useRef()
  const orbGroupRef = useRef()
  const htmlContainerRef = useRef()
  const ringRefs = useRef([])
  const rimGlowRef = useRef()
  const smoothFade = useRef(0)

  const ringMats = useMemo(() => [
    new THREE.MeshBasicMaterial({ color: '#1E6F5C', transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }),
    new THREE.MeshBasicMaterial({ color: '#52A88B', transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }),
    new THREE.MeshBasicMaterial({ color: '#1E6F5C', transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }),
  ], [])

  const rimMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#1E6F5C', transparent: true, opacity: 0,
    toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // Fade IN: 0.60 → 0.85
    const fadeIn  = Math.max(0, Math.min(1, (scrollProgress - 0.60) / 0.25))
    // Darken to black while scrolling forward: 0.85 → 1.0
    const darkOut = Math.max(0, Math.min(1, (scrollProgress - 0.85) / 0.15))
    const targetFade = fadeIn

    smoothFade.current = THREE.MathUtils.lerp(smoothFade.current, targetFade, 0.12)
    const fade = smoothFade.current

    if (groupRef.current) {
      groupRef.current.visible = fade > 0.001 || targetFade > 0.001
    }

    if (orbGroupRef.current) {
      orbGroupRef.current.position.z = THREE.MathUtils.lerp(-1.80, -0.02, fade)
    }

    if (htmlContainerRef.current) {
      const cssScale = THREE.MathUtils.lerp(0.10, 0.38, fade)
      const opacity = fade * (1 - darkOut)
      const brightness = 1 - darkOut
      htmlContainerRef.current.style.opacity = String(opacity)
      htmlContainerRef.current.style.transform = `scale(${cssScale})`
      htmlContainerRef.current.style.filter = `brightness(${brightness})`
    }

    if (fade <= 0.001 && targetFade <= 0.001) return

    // Rim glow
    if (rimGlowRef.current) {
      rimGlowRef.current.material.opacity = fade * 0.28
    }

    // Energy rings
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return
      const speed = 0.55 + i * 0.25
      const cycle = ((time * speed + i * 1.1) % 3.0) / 3.0
      const alpha = Math.sin(cycle * Math.PI)
      ring.material.opacity = fade * alpha * 0.22
      ring.scale.x = 0.25 + cycle * 0.75
      ring.scale.y = ring.scale.x
      ring.position.z = -0.04 + cycle * 0.06
    })
  })

  return (
    <group ref={groupRef} {...props}>
      {/* ── Energy Orb in 800px container — canvas is 800px, so CSS scale always supersamples → crisp at all distances ── */}
      <group ref={orbGroupRef} position={[0, 0, -1.80]}>
        <Html
          position={[0, 0, 0]}
          center
          style={{
            width: '800px',
            height: '800px',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <div
            ref={htmlContainerRef}
            style={{
              width: '800px',
              height: '800px',
              transformOrigin: 'center center',
              opacity: 0,
              transform: 'scale(0.10)',
            }}
          >
            <GlobeCollection
              variant="energy-orb"
              speed={1.00}
              scale={0.75}
              smokeScale={1.15}
              smokeStrength={1.40}
              smokeSpeed={1.00}
              hue={0}
              saturation={1.50}
              glow={0.20}
              starDensity={0}
              starSpeed={0}
              starSize={0}
              brightness={1.25}
              opacity={1.00}
            />
          </div>
        </Html>
      </group>
    </group>
  )
}

