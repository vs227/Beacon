import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Smooth ease curves for scroll transitions
const easeInOutCubic = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
const clamp01 = (x) => Math.max(0, Math.min(1, x))

// Pseudo-random noise function to generate natural angular facets and carved rock details
function getRockNoise(segmentIdx, cornerIdx) {
  const n1 = Math.sin(segmentIdx * 2.3 + cornerIdx * 3.7) * 0.026
  const n2 = Math.cos(segmentIdx * 1.15 - cornerIdx * 2.3) * 0.016
  return n1 + n2
}

// Compute the center coordinates of the morphing stone slab at coordinate u (0..1)
// Multi-Step Architectural Transformation Pipeline:
// Step 1 (0.00–0.15): Grounded rotating monolith
// Step 2 (0.15–0.45): Helical expansion & core light exposure
// Step 3 (0.35–0.70): Intermediate levitation orbit & spatial arrangement
// Step 4 (0.65–1.00): Precision portal frame alignment & final snap
function getMorphedPoint(slabIdx, totalSlabs, u, scrollProgress, rotationAngle) {
  // Step 1 & 2: Expansion & Helical Unwind
  const t_expand = clamp01((scrollProgress - 0.15) / 0.30)
  // Step 3: Intermediate Levitation Orbit
  const t_orbit  = clamp01((scrollProgress - 0.35) / 0.35)
  // Step 4: Final Portal Alignment & Snap
  const t_align  = clamp01((scrollProgress - 0.65) / 0.35)

  // 1. Initial Helical State (cylinder)
  const turns = 0.60 - 0.25 * easeInOutCubic(t_expand)
  const baseRadius = 0.54
  const maxRadius = 0.92
  const radius = baseRadius + (maxRadius - baseRadius) * easeInOutCubic(t_expand)

  const isVertical = slabIdx === 0 || slabIdx === 1
  const height = isVertical ? 2.98 : 1.88

  const phaseOffset = (slabIdx / totalSlabs) * Math.PI * 2
  const angle = u * Math.PI * 2 * turns + phaseOffset + rotationAngle

  const y_center = 0.70
  const y_cyl = (u - 0.5) * height + y_center
  const x_cyl = Math.cos(angle) * radius
  const z_cyl = Math.sin(angle) * radius

  // 2. Step 3: Intermediate Floating Orbit Target
  // Slabs hover in a balanced, semi-aligned structural arrangement in 3D space
  let x_orbit = x_cyl
  let y_orbit = y_cyl
  let z_orbit = z_cyl

  if (slabIdx === 0) { // Right pillar preliminary position
    x_orbit = 0.82
    y_orbit = (u - 0.5) * 2.80 + 0.75
    z_orbit = Math.sin(u * Math.PI) * 0.35
  } else if (slabIdx === 1) { // Left pillar preliminary position
    x_orbit = -0.82
    y_orbit = (u - 0.5) * 2.80 + 0.65
    z_orbit = -Math.sin(u * Math.PI) * 0.35
  } else if (slabIdx === 2) { // Top beam floating overhead
    x_orbit = (u - 0.5) * 2.0
    y_orbit = 2.40 + Math.sin(u * Math.PI) * 0.20
    z_orbit = 0.25
  } else if (slabIdx === 3) { // Bottom beam hovering near pedestal
    x_orbit = (u - 0.5) * 2.0
    y_orbit = -0.50 - Math.sin(u * Math.PI) * 0.15
    z_orbit = -0.25
  }

  // Blend from Cylinder -> Intermediate Orbit
  const t1 = easeInOutCubic(t_orbit)
  const x_mid = x_cyl + (x_orbit - x_cyl) * t1
  const y_mid = y_cyl + (y_orbit - y_cyl) * t1
  const z_mid = z_cyl + (z_orbit - z_cyl) * t1

  // 3. Step 4: Final Precision Rectangular Portal Target
  let x_rect = 0, y_rect = 0, z_rect = 0
  if (slabIdx === 0) { // Right vertical pillar
    x_rect = 0.77
    y_rect = (u - 0.5) * 2.98 + 0.70
    z_rect = 0
  } else if (slabIdx === 1) { // Left vertical pillar
    x_rect = -0.77
    y_rect = (u - 0.5) * 2.98 + 0.70
    z_rect = 0
  } else if (slabIdx === 2) { // Top beam
    x_rect = (u - 0.5) * 1.88
    y_rect = 2.19
    z_rect = 0
  } else if (slabIdx === 3) { // Bottom base beam
    x_rect = (u - 0.5) * 1.88
    y_rect = -0.63
    z_rect = 0
  }

  // Blend from Intermediate Orbit -> Final Rectangular Portal
  const t2 = easeInOutCubic(t_align)
  return new THREE.Vector3(
    x_mid + (x_rect - x_mid) * t2,
    y_mid + (y_rect - y_mid) * t2,
    z_mid + (z_rect - z_mid) * t2
  )
}

// Re-evaluate vertices and normals in-place for high-performance WebGL rendering.
// Generates a flat-shaded, blocky stone column geometry with beveled joints.
function updateExtrudedGeometry(geometry, slabIdx, totalSlabs, scrollProgress, rotationAngle, segments = 7) {
  const positions = geometry.attributes.position.array
  const normals = geometry.attributes.normal.array
  
  // Heavy rectangular stone blocks
  const W = 0.36
  const H = 0.28
  
  // Frame calculation helper
  function getPathFrame(u) {
    const P = getMorphedPoint(slabIdx, totalSlabs, u, scrollProgress, rotationAngle)
    const u_next = u < 0.99 ? u + 0.01 : u
    const u_prev = u >= 0.01 ? u - 0.01 : u
    const P_next = getMorphedPoint(slabIdx, totalSlabs, u_next, scrollProgress, rotationAngle)
    const P_prev = getMorphedPoint(slabIdx, totalSlabs, u_prev, scrollProgress, rotationAngle)
    const tangent = new THREE.Vector3().subVectors(P_next, P_prev).normalize()
    
    let tempRef = new THREE.Vector3(0, 0, 1)
    if (Math.abs(tangent.dot(tempRef)) > 0.92) {
      tempRef.set(0, 1, 0)
    }
    const normal = new THREE.Vector3().crossVectors(tangent, tempRef).normalize()
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize()
    
    return { P, tangent, normal, binormal }
  }

  let writeIdx = 0

  const offsets = [
    { nw: -0.5, bh: -0.5 },
    { nw:  0.5, bh: -0.5 },
    { nw:  0.5, bh:  0.5 },
    { nw: -0.5, bh:  0.5 }
  ]

  const v_start = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
  const v_end = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
  const edge1 = new THREE.Vector3()
  const edge2 = new THREE.Vector3()
  const faceNormal = new THREE.Vector3()

  for (let i = 0; i < segments; i++) {
    const u0 = i / segments
    const u1 = (i + 1) / segments

    const F0 = getPathFrame(u0)
    const F1 = getPathFrame(u1)

    // Contract the ends of each segment slightly to create beveled joints
    const scale = 0.91

    for (let c = 0; c < 4; c++) {
      const off = offsets[c]
      const n0 = getRockNoise(i, c) * 0.38
      const n1 = getRockNoise(i + 1, c) * 0.38

      v_start[c].copy(F0.P)
        .addScaledVector(F0.normal, off.nw * W * scale + n0)
        .addScaledVector(F0.binormal, off.bh * H * scale + n0)

      v_end[c].copy(F1.P)
        .addScaledVector(F1.normal, off.nw * W * scale + n1)
        .addScaledVector(F1.binormal, off.bh * H * scale + n1)
    }

    // Helper to write a flat-shaded quad face
    function writeQuad(a, b, c, d) {
      // Triangle 1: a, b, c
      positions[writeIdx]     = a.x; positions[writeIdx + 1] = a.y; positions[writeIdx + 2] = a.z
      positions[writeIdx + 3] = b.x; positions[writeIdx + 4] = b.y; positions[writeIdx + 5] = b.z
      positions[writeIdx + 6] = c.x; positions[writeIdx + 7] = c.y; positions[writeIdx + 8] = c.z

      // Triangle 2: a, c, d
      positions[writeIdx + 9]  = a.x; positions[writeIdx + 10] = a.y; positions[writeIdx + 11] = a.z
      positions[writeIdx + 12] = c.x; positions[writeIdx + 13] = c.y; positions[writeIdx + 14] = c.z
      positions[writeIdx + 15] = d.x; positions[writeIdx + 16] = d.y; positions[writeIdx + 17] = d.z

      // Calculate flat face normal
      edge1.subVectors(b, a)
      edge2.subVectors(c, a)
      faceNormal.crossVectors(edge1, edge2).normalize()

      for (let n = 0; n < 6; n++) {
        const offset = writeIdx + n * 3
        normals[offset]     = faceNormal.x
        normals[offset + 1] = faceNormal.y
        normals[offset + 2] = faceNormal.z
      }

      writeIdx += 18
    }

    // Face 0: Start Cap (facing backwards)
    writeQuad(v_start[3], v_start[2], v_start[1], v_start[0])

    // Face 1: End Cap (facing forwards)
    writeQuad(v_end[0], v_end[1], v_end[2], v_end[3])

    // Face 2: Bottom Face
    writeQuad(v_start[0], v_start[1], v_end[1], v_end[0])

    // Face 3: Right Face
    writeQuad(v_start[1], v_start[2], v_end[2], v_end[1])

    // Face 4: Top Face
    writeQuad(v_start[2], v_start[3], v_end[3], v_end[2])

    // Face 5: Left Face
    writeQuad(v_start[3], v_start[0], v_end[0], v_end[3])
  }

  geometry.attributes.position.needsUpdate = true
  geometry.attributes.normal.needsUpdate = true
  geometry.computeBoundingSphere()
  geometry.computeBoundingBox()
}

// ─── Circular Stepped Pedestal (Always Fixed - rests under the bottom beam) ──
function Pedestal({ material }) {
  // Pillar slab bottoms are at local y = -0.79.
  // Tier tops must flush at -0.79 so stones sit cleanly on the pedestal.
  // Tier 1 (outer): center = -0.79 - 0.04 = -0.83, top = -0.79
  // Tier 2 (inner): center = -0.79 + 0.04 = -0.75, top = -0.71 (sits above, gives stepped look)
  return (
    <group>
      {/* Tier 1 — wide outer ring, top flush at y = -0.79 */}
      <mesh position={[0, -0.83, 0]} material={material} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.82, 0.08, 64]} />
      </mesh>
      {/* Tier 2 — narrower inner step, sits on top */}
      <mesh position={[0, -0.75, 0]} material={material} castShadow receiveShadow>
        <cylinderGeometry args={[0.66, 0.68, 0.08, 64]} />
      </mesh>
    </group>
  )
}

// ─── Concentrated Emerald Energy Spark ──────────────────────────────────────
// Small (~0.22 diameter) focused energy point — NOT a large glowing ball.
// Layers: deep glass sphere → hot white center → teal corona → faint rings → radial tendrils
function EmeraldCore({ time, scrollProgress }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const fadeOut = 1.0 - clamp01((scrollProgress - 0.20) / 0.40)

  // Deep emerald glass sphere — small, concentrated, dark with inner glow
  const coreMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#021408'),
    emissive: new THREE.Color('#0BFF6A'),         // Bright emerald emissive
    emissiveIntensity: 1.4,                       // Was 0.45 — now visibly lit
    metalness: 0.0,
    roughness: 0.06,
    transmission: 0.78,
    thickness: 0.22,
    ior: 1.65,
    clearcoat: 0.9,
    clearcoatRoughness: 0.06,
    transparent: true,
    opacity: 1.0,
  }), [])

  // Soft halo — BackSide shell just outside the sphere
  const haloMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#0B7A45'),
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  }), [])

  useFrame(() => {
    if (!meshRef.current) return
    // Subtle breathing pulse — very small amplitude so spark stays concentrated
    const pulse = (1.0 + Math.sin(time * 4.2) * 0.025) * fadeOut
    meshRef.current.scale.setScalar(pulse)
    if (glowRef.current) {
      const hp = (1.0 + Math.sin(time * 3.1 + 1.1) * 0.06) * fadeOut
      glowRef.current.scale.setScalar(hp)
      glowRef.current.material.opacity = 0.09 * fadeOut * (0.80 + Math.sin(time * 1.8) * 0.20)
    }
  })

  if (fadeOut <= 0.001) return null

  return (
    <group position={[0, 0.70, 0]}>

      {/* ─── CORE SPHERE — 0.11 radius = 0.22 diameter, concentrated spark ─── */}
      <mesh ref={meshRef} material={coreMat}>
        <sphereGeometry args={[0.11, 48, 48]} />
      </mesh>

      {/* Soft halo shell just outside sphere */}
      <mesh ref={glowRef} material={haloMat}>
        <sphereGeometry args={[0.17, 24, 24]} />
      </mesh>

      {/* ─── HOT-POINT LAYERS — concentrated energy at center ─── */}
      {/* White-hot filament — innermost point of the spark */}
      <mesh>
        <sphereGeometry args={[0.010, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={1.0 * fadeOut}
          blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* Bright teal corona around the filament */}
      <mesh>
        <sphereGeometry args={[0.022, 14, 14]} />
        <meshBasicMaterial color="#80FFD0" transparent opacity={0.90 * fadeOut}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Emerald mid-bloom — larger, brighter */}
      <mesh>
        <sphereGeometry args={[0.048, 18, 18]} />
        <meshBasicMaterial color="#22FF80" transparent opacity={0.65 * fadeOut}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Wide soft emerald fill — makes sphere surface glow */}
      <mesh>
        <sphereGeometry args={[0.10, 24, 24]} />
        <meshBasicMaterial color="#10C865" transparent opacity={0.30 * fadeOut}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* ─── CONCENTRIC ENERGY RINGS ─── */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.14, 0.003, 6, 48]} />
        <meshBasicMaterial color="#12C870" transparent opacity={0.22 * fadeOut}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.20, 0.002, 6, 64]} />
        <meshBasicMaterial color="#0B7A45" transparent opacity={0.12 * fadeOut}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* ─── RADIAL ENERGY TENDRILS — 6 thin short cylinders radiating outward ─── */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const len = 0.055 + (i % 3) * 0.018  // slight variation in length
        const ox = Math.cos(rad) * (0.11 + len / 2)
        const oz = Math.sin(rad) * (0.11 + len / 2)
        return (
          <mesh key={i} position={[ox, 0, oz]} rotation={[0, -rad + Math.PI / 2, Math.PI / 2]}>
            <cylinderGeometry args={[0.0025, 0.001, len, 4]} />
            <meshBasicMaterial color="#28EE8A" transparent
              opacity={(0.55 - i * 0.05) * fadeOut}
              blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        )
      })}

      {/* ─── TIGHT POINT LIGHT — illuminates immediate inner stone faces ─── */}
      <pointLight
        intensity={5.0 * fadeOut}
        color="#30FFB0"
        distance={0.60}
        decay={2.0}
      />
    </group>
  )
}

// ─── Thin Vertical Emerald Beam ───────────────────────────────────────────────
// Very thin axis beam with soft falloff — secondary accent, NOT the primary light.
function CentralBeam({ scrollProgress, time }) {
  const fadeOut = 1.0 - clamp01((scrollProgress - 0.20) / 0.40)
  if (fadeOut <= 0.001) return null

  return (
    <group position={[0, 0.70, 0]}>
      {/* Ultra-thin beam — just a visual axis thread, very low opacity */}
      <mesh>
        <cylinderGeometry args={[0.006, 0.006, 2.2, 8]} />
        <meshBasicMaterial
          color="#0FBF74"
          transparent
          opacity={0.07 * fadeOut}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Slightly wider soft glow around the beam axis */}
      <mesh>
        <cylinderGeometry args={[0.022, 0.022, 1.6, 8]} />
        <meshBasicMaterial
          color="#0A7A48"
          transparent
          opacity={0.04 * fadeOut}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ─── Fine Energy Sparks near Core ────────────────────────────────────────────
// Very few (~8) micro-sparks — bright near core, fade fast, no large cloud.
function InnerLightParticles({ scrollProgress, time }) {
  const COUNT = 8  // Extremely sparse — just a few nearby sparks
  const pointsRef = useRef()
  const fadeOut = 1.0 - clamp01((scrollProgress - 0.20) / 0.40)

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const vels = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      // Start tightly clustered very close to core
      const r = 0.04 + Math.random() * 0.08
      const theta = Math.random() * Math.PI * 2
      pos[i * 3 + 0] = Math.cos(theta) * r
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.30  // Short vertical range only
      pos[i * 3 + 2] = Math.sin(theta) * r
      vels[i] = 0.006 + Math.random() * 0.008  // Slow drift
    }
    return { positions: pos, velocities: vels }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  const material = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color('#3EFFA0'),
    size: 0.012,  // Very small sparks
    transparent: true,
    opacity: 0.55 * fadeOut,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), [fadeOut])

  useFrame(() => {
    if (!pointsRef.current || fadeOut <= 0.001) return
    const attr = pointsRef.current.geometry.getAttribute('position')
    for (let i = 0; i < COUNT; i++) {
      let y = attr.getY(i)
      y += velocities[i]
      if (y > 0.18) {  // Reset when they drift too far — keep them near the core
        y = -0.18
        const r = 0.04 + Math.random() * 0.08
        const theta = Math.random() * Math.PI * 2
        attr.setX(i, Math.cos(theta) * r)
        attr.setZ(i, Math.sin(theta) * r)
      }
      attr.setY(i, y)
    }
    attr.needsUpdate = true
  })

  if (fadeOut <= 0.001) return null
  return <points ref={pointsRef} geometry={geometry} material={material} position={[0, 0.70, 0]} />
}

// ─── Minimal Signal Dust ─────────────────────────────────────────────────────
// Only 6 barely-visible micro-particles tracing the slab edges — extremely subtle.
const SIGNAL_TEMP = new THREE.Vector3()

function SignalParticles({ scrollProgress, rotationAngle }) {
  const COUNT = 6  // Minimal — just a trace presence
  const pointsRef = useRef()

  const { positions, progressOffsets, slabIndices } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const offsets = new Float32Array(COUNT)
    const indices = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      offsets[i] = Math.random()
      indices[i] = i % 4
    }
    return { positions: pos, progressOffsets: offsets, slabIndices: indices }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  const material = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color('#3AE890'),
    size: 0.009,  // Tiny — not prominent
    transparent: true,
    opacity: 0.18,  // Very faint
    depthWrite: false,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  }), [])

  const smoothProgress = useRef(0)

  useFrame(() => {
    if (!pointsRef.current) return
    const attr = pointsRef.current.geometry.getAttribute('position')
    smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.18)
    for (let i = 0; i < COUNT; i++) {
      progressOffsets[i] = (progressOffsets[i] + 0.0010) % 1.0
      const pt = getMorphedPoint(slabIndices[i], 4, progressOffsets[i], smoothProgress.current, rotationAngle)
      attr.setXYZ(i, pt.x, pt.y, pt.z)
    }
    attr.needsUpdate = true
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ArtifactSculpture({
  scrollProgress = 0,
  portalFade = 0,
}) {
  const SLABS = 4
  const SEGMENTS = 7 // Reduced to 7 segments for highly blocky, stacked stone blocks
  const timeRef = useRef(0)
  const rotationAngleRef = useRef(0)

  // A. Procedural Weathered Architectural Stone Texture
  const [colorMap, bumpMap] = useMemo(() => {
    const W = 512, H = 512
    const cc = document.createElement('canvas'); cc.width = W; cc.height = H
    const ctx = cc.getContext('2d')

    // Warm dark charcoal-brown base — natural architectural stone, NOT pure black
    ctx.fillStyle = '#2A2520'; ctx.fillRect(0, 0, W, H)

    // Large-scale tonal mass — uneven grain variation across the slab face
    const masses = ['44,38,30', '34,29,22', '56,48,38', '24,20,15', '50,43,34', '38,32,25']
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = 70 + Math.random() * 200
      const rgb = masses[Math.floor(Math.random() * masses.length)]
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(${rgb},0.50)`)
      g.addColorStop(0.55, `rgba(${rgb},0.18)`)
      g.addColorStop(1, 'rgba(35,30,22,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }

    // Mineral inclusions — warm grey/brown pockets throughout the stone
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = 6 + Math.random() * 50
      const v = 50 + Math.random() * 50 | 0
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(${v},${v - 4},${v - 9},0.28)`)
      g.addColorStop(1, 'rgba(36,31,24,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }

    // Fine surface pitting and grit — micro-porosity
    for (let i = 0; i < 16000; i++) {
      const x = Math.random() * W, y = Math.random() * H
      const v = 14 + (Math.random() * 38 | 0)
      ctx.fillStyle = `rgba(${v},${v - 2},${v - 4},0.11)`
      ctx.fillRect(x, y, Math.random() * 1.4 + 0.3, Math.random() * 1.4 + 0.3)
    }

    // Natural fracture lines — aged cracks, darker at valley, slight lighter edge
    ctx.lineWidth = 0.9
    for (let c = 0; c < 30; c++) {
      let x = Math.random() * W, y = Math.random() * H
      ctx.strokeStyle = `rgba(${15 + Math.random() * 18 | 0},${12 + Math.random() * 12 | 0},${8 + Math.random() * 8 | 0},0.70)`
      ctx.beginPath(); ctx.moveTo(x, y)
      for (let s = 0; s < 7; s++) {
        x += (Math.random() - 0.5) * 52; y += (Math.random() - 0.5) * 52
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      // Bright edge alongside crack
      ctx.strokeStyle = 'rgba(110,96,78,0.25)'
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.lineWidth = 0.9
    }

    // Feldspar/mica glints — bright mineral chips catching light
    for (let i = 0; i < 250; i++) {
      const x = Math.random() * W, y = Math.random() * H
      const b = 80 + (Math.random() * 100 | 0)
      ctx.fillStyle = `rgba(${b},${b - 5},${b - 12},0.55)`
      const sw = Math.random() * 2.8 + 0.4
      ctx.fillRect(x, y, sw, sw * (0.3 + Math.random() * 0.7))
    }

    const cTex = new THREE.CanvasTexture(cc)
    cTex.wrapS = cTex.wrapT = THREE.RepeatWrapping; cTex.repeat.set(1.8, 1.4)

    // Bump map — deep relief: pores, crack valleys, undulating planar surface
    const bc = document.createElement('canvas'); bc.width = W; bc.height = H
    const bx = bc.getContext('2d'); bx.fillStyle = '#808080'; bx.fillRect(0, 0, W, H)

    // Large surface undulation — strong raised/sunken variation for faceted rock feel
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 100 + 22
      const isRaised = Math.random() > 0.38
      const v = isRaised ? (175 + (Math.random() * 80 | 0)) : (20 + (Math.random() * 40 | 0))
      const g = bx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(${v},${v},${v},0.75)`); g.addColorStop(1, 'rgba(128,128,128,0)')
      bx.fillStyle = g; bx.beginPath(); bx.arc(x, y, r, 0, Math.PI * 2); bx.fill()
    }

    // Deep pore pits — more numerous, fully black
    for (let i = 0; i < 750; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = 0.8 + Math.random() * 7
      bx.fillStyle = 'rgba(0,0,0,0.90)'
      bx.beginPath(); bx.arc(x, y, r, 0, Math.PI * 2); bx.fill()
    }

    // Crack depth — wide dark valleys with bright raised edges
    for (let c = 0; c < 30; c++) {
      let x = Math.random() * W, y = Math.random() * H
      // Deep dark valley
      bx.strokeStyle = 'rgba(0,0,0,0.95)'
      bx.lineWidth = 3.0
      bx.beginPath(); bx.moveTo(x, y)
      for (let s = 0; s < 7; s++) {
        x += (Math.random() - 0.5) * 52; y += (Math.random() - 0.5) * 52
        bx.lineTo(x, y)
      }
      bx.stroke()
      // Bright chip/raised edge beside the crack
      bx.strokeStyle = 'rgba(230,230,230,0.45)'
      bx.lineWidth = 1.2
      bx.stroke()
    }

    // High-frequency micro-surface grain
    for (let i = 0; i < 12000; i++) {
      const x = Math.random() * W, y = Math.random() * H
      const v = 50 + (Math.random() * 150 | 0)
      bx.fillStyle = `rgba(${v},${v},${v},0.13)`
      bx.fillRect(x, y, Math.random() * 2.0 + 0.3, Math.random() * 2.0 + 0.3)
    }

    const bTex = new THREE.CanvasTexture(bc)
    bTex.wrapS = bTex.wrapT = THREE.RepeatWrapping; bTex.repeat.set(1.8, 1.4)
    return [cTex, bTex]
  }, [])

  // B. Natural Aged Architectural Stone — warm charcoal-brown, rough, no metalness
  const stoneMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: colorMap,
    bumpMap,
    bumpScale: 0.12,            // Very deep relief — coarse chiseled rock surface
    color: new THREE.Color('#38312A'),
    metalness: 0.0,
    roughness: 0.95,            // Fully matte — maximum diffuse scatter, zero gloss
    reflectivity: 0.06,         // Negligible specular
    clearcoat: 0.0,
    side: THREE.DoubleSide,
  }), [colorMap, bumpMap])

  // C. Pre-allocate non-indexed geometries for morphing slabs
  const geometries = useMemo(() => {
    return Array.from({ length: SLABS }, () => {
      const geo = new THREE.BufferGeometry()
      const vertexCount = SEGMENTS * 36
      const posArray = new Float32Array(vertexCount * 3)
      const normArray = new Float32Array(vertexCount * 3)
      
      geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
      geo.setAttribute('normal', new THREE.BufferAttribute(normArray, 3))
      
      return geo
    })
  }, [])

  useEffect(() => {
    return () => geometries.forEach(g => g.dispose())
  }, [geometries])

  const smoothProgress = useRef(0)

  useFrame((state, delta) => {
    timeRef.current = state.clock.elapsedTime
    const dt = Math.min(delta, 0.1)

    // Smooth progress with lerp for fluid, multi-stage scroll transition
    smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.08)
    
    // Idle rotation: always spin slowly when at rest (scrollProgress ≈ 0).
    // Scroll-driven speed factor (0–20% scroll = full spin, 20–40% = decelerates to 0).
    const scrollSpeedFactor = 1.0 - clamp01((smoothProgress.current - 0.20) / 0.20)

    // Idle constant baseline speed (always-on gentle rotation even without scrolling)
    // Scroll speed adds on top; as scroll advances past 20%, idle takes over smoothly.
    const idleSpeed   = 0.72   // radians/sec – ~1 full rotation every 8.7s
    const scrollSpeed = 0.75   // radians/sec – extra boost during scroll phase
    rotationAngleRef.current += dt * (idleSpeed + scrollSpeed * scrollSpeedFactor)

    geometries.forEach((geo, i) => {
      updateExtrudedGeometry(geo, i, SLABS, smoothProgress.current, rotationAngleRef.current, SEGMENTS)
    })
  })

  const fadeOut = 1.0 - clamp01((scrollProgress - 0.20) / 0.40)

  return (
    <group>
      {/* 4 interlocking stone slabs forming abstract monument -> rectangular portal */}
      {geometries.map((geo, i) => (
        <mesh
          key={i}
          geometry={geo}
          material={stoneMat}
          castShadow
          receiveShadow
        />
      ))}

      {/* Stepped circular pedestal (Always Fixed resting on concrete platform) */}
      <Pedestal material={stoneMat} />

      {/* Recessed emerald green central core */}
      <EmeraldCore time={timeRef.current} scrollProgress={scrollProgress} />

      {/* Volumetric light beam and laser core */}
      <CentralBeam scrollProgress={scrollProgress} time={timeRef.current} />

      {/* Rising particles inside the light beam */}
      <InnerLightParticles scrollProgress={scrollProgress} time={timeRef.current} />

      {/* Secondary ambient fill — soft emerald spill onto inner stone faces */}
      {/* Intentionally moderate — white spotlight remains primary */}
      {fadeOut > 0.001 && (
        <pointLight
          position={[0, 0.70, 0]}
          intensity={2.8 * fadeOut}
          color="#18FF88"
          distance={2.2}
          decay={2.0}
        />
      )}

      {/* Subtle flowing signal dust */}
      <SignalParticles scrollProgress={scrollProgress} rotationAngle={rotationAngleRef.current} />
    </group>
  )
}
