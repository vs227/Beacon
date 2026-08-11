import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const clamp01 = (x) => Math.max(0, Math.min(1, x))

// Portal interior — deep dark emerald void
// Visible once portal is ≥ 60% formed (scrollProgress ≈ 0.37+)
// Portal opening: X[-0.60..+0.60], Y[-1.08..+1.08] in local group space

export default function PortalInterior() {
  // Interior dark emerald void is active from initial page load
  const interiorFade = 1.0

  const voidLayerRefs = useRef([])
  const ringRefs      = useRef([])
  const particlesRef  = useRef()
  const rimGlowRef    = useRef()

  // ─── Materials ────────────────────────────────────────────────────────────
  // Void layers — stacked planes at increasing depth, each lighter (depth illusion)
  const voidMats = useMemo(() => [
    // Back of portal — deepest, darkest
    new THREE.MeshBasicMaterial({ color: '#0B2E23', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
    // Mid layer
    new THREE.MeshBasicMaterial({ color: '#0F3D2F', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
    // Near layer — slightly lighter, creates depth
    new THREE.MeshBasicMaterial({ color: '#153F31', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
    // Front veil — very subtle
    new THREE.MeshBasicMaterial({ color: '#1A4D3A', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
  ], [])

  // Animated energy rings — emerald glow
  const ringMats = useMemo(() => [
    new THREE.MeshBasicMaterial({ color: '#1E6F5C', transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }),
    new THREE.MeshBasicMaterial({ color: '#52A88B', transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }),
    new THREE.MeshBasicMaterial({ color: '#1E6F5C', transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }),
  ], [])

  // Rim glow — soft green outline around portal opening
  const rimMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#1E6F5C', transparent: true, opacity: 0,
    toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }), [])

  // Particles — faint floating motes
  const [positions, velocities] = useMemo(() => {
    const N   = 220
    const pos = new Float32Array(N * 3)
    const vel = []
    for (let i = 0; i < N; i++) {
      pos[i*3+0] = (Math.random() - 0.5) * 1.12
      pos[i*3+1] = (Math.random() - 0.5) * 2.10
      pos[i*3+2] = -(Math.random() * 0.40 + 0.05)  // behind front face
      vel.push({
        vx:    (Math.random() - 0.5) * 0.0015,
        vy:    Math.random() * 0.0025 + 0.0004,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return [pos, vel]
  }, [])

  const particleMat = useMemo(() => new THREE.PointsMaterial({
    color: '#52A88B', size: 0.007, transparent: true, opacity: 0,
    sizeAttenuation: true, toneMapped: false, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const fade = interiorFade * interiorFade  // ease-in

    // ── Void layers — stacked planes simulate infinite depth ──────────────
    voidLayerRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const layerFade = fade * (0.85 - i * 0.08)
      mesh.material.opacity = layerFade
      // Slow subtle breathing per layer
      mesh.material.opacity *= (0.92 + 0.08 * Math.sin(time * 0.4 + i * 0.9))
    })

    // ── Rim glow — soft green halo around portal opening ─────────────────
    if (rimGlowRef.current) {
      rimGlowRef.current.material.opacity = fade * 0.28
    }

    // ── Energy rings — concentric, expand and cycle ───────────────────────
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return
      const speed  = 0.55 + i * 0.25
      const cycle  = ((time * speed + i * 1.1) % 3.0) / 3.0  // 0→1
      const alpha  = Math.sin(cycle * Math.PI)                 // 0→1→0
      ring.material.opacity = fade * alpha * 0.22
      ring.scale.x = 0.25 + cycle * 0.75
      ring.scale.y = ring.scale.x
      ring.position.z = -0.04 + cycle * 0.06
    })

    // ── Particles ──────────────────────────────────────────────────────────
    if (particlesRef.current?.geometry) {
      particleMat.opacity = fade * 0.65
      const posArr = particlesRef.current.geometry.attributes.position.array
      for (let i = 0; i < velocities.length; i++) {
        const v = velocities[i]
        posArr[i*3+0] += v.vx + Math.sin(time * 0.35 + v.phase) * 0.0006
        posArr[i*3+1] += v.vy
        if (posArr[i*3+1] >  1.05) { posArr[i*3+1] = -1.05; posArr[i*3+0] = (Math.random()-0.5)*1.10 }
        if (posArr[i*3+0] >  0.56) posArr[i*3+0] = -0.56
        if (posArr[i*3+0] < -0.56) posArr[i*3+0] =  0.56
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  if (interiorFade <= 0.001) return null

  const OPEN_W = 1.20   // portal opening width
  const OPEN_H = 2.16   // portal opening height

  return (
    <group>
      {/* ── Void depth layers ── */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`void-${i}`}
          ref={(el) => (voidLayerRefs.current[i] = el)}
          position={[0, 0, -(i * 0.15 + 0.05)]}
        >
          <planeGeometry args={[OPEN_W, OPEN_H]} />
          <primitive object={voidMats[i]} attach="material" />
        </mesh>
      ))}

      {/* ── Rim glow — thin ring following portal inner edge ── */}
      <mesh ref={rimGlowRef} position={[0, 0, 0.02]}>
        <ringGeometry args={[0.80, 0.88, 64]} />
        <primitive object={rimMat} attach="material" />
      </mesh>

      {/* ── Energy rings ── */}
      {[0, 1, 2].map((i) => (
        <mesh key={`ring-${i}`} ref={(el) => (ringRefs.current[i] = el)} position={[0, 0, 0.01]}>
          <ringGeometry args={[0.18, 0.22 + i * 0.04, 64]} />
          <primitive object={ringMats[i]} attach="material" />
        </mesh>
      ))}

      {/* ── Floating particles inside void ── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <primitive object={particleMat} attach="material" />
      </points>
    </group>
  )
}
