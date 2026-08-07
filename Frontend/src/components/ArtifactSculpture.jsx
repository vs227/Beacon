import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const easeInOutCubic = (x) => x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2, 3)/2
const clamp01        = (x) => Math.max(0, Math.min(1, x))

export default function ArtifactSculpture({
  heroProgress       = 0,   // Section 1: drives rotation (0→1)
  portalFormProgress = 0,   // Section 2: drives portal formation (0→1)
  metalness = 0.14,
  roughness = 0.50,
}) {
  const groupRef   = useRef()
  const meshesRef  = useRef([])
  const accumRot   = useRef(0)
  const smoothProg = useRef(0)

  // ─── BASALT MATERIAL ─────────────────────────────────────────────────────
  const [colorMap, bumpMap] = useMemo(() => {
    const W = 512, H = 512
    const cc = document.createElement('canvas'); cc.width=W; cc.height=H
    const ctx = cc.getContext('2d')
    ctx.fillStyle = '#323230'; ctx.fillRect(0,0,W,H)
    for (let i=0; i<200; i++) {
      const x=Math.random()*W, y=Math.random()*H, r=Math.random()*100+25
      const g=ctx.createRadialGradient(x,y,0,x,y,r)
      const v = Math.random()>0.45 ? (10+Math.random()*12|0) : (48+Math.random()*22|0)
      g.addColorStop(0,`rgba(${v},${v},${v-2},${Math.random()*0.30+0.05})`)
      g.addColorStop(1,'rgba(50,50,48,0)')
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill()
    }
    for (let i=0; i<55000; i++) {
      const x=Math.random()*W, y=Math.random()*H, v=20+(Math.random()*35|0)
      ctx.fillStyle=`rgba(${v},${v},${v},0.10)`
      ctx.fillRect(x,y,Math.random()*1.0+0.4,Math.random()*1.0+0.4)
    }
    for (let i=0; i<500; i++) {
      const x=Math.random()*W, y=Math.random()*H, b=70+(Math.random()*110|0)
      ctx.fillStyle=`rgba(${b},${b-3},${b-8},0.40)`
      ctx.fillRect(x,y,Math.random()*1.8+0.4,Math.random()*1.8+0.4)
    }
    ctx.strokeStyle='rgba(10,10,9,0.10)'; ctx.lineWidth=0.7
    for (let i=0; i<16; i++) {
      const y0=Math.random()*H; ctx.beginPath(); ctx.moveTo(0,y0)
      for (let x=0; x<W; x+=6) ctx.lineTo(x,y0+Math.sin(x*0.035+i*1.4)*7+(Math.random()-0.5)*3)
      ctx.stroke()
    }
    const cTex = new THREE.CanvasTexture(cc)
    cTex.wrapS=cTex.wrapT=THREE.RepeatWrapping; cTex.repeat.set(1.6,1.6)

    const bc=document.createElement('canvas'); bc.width=W; bc.height=H
    const bx=bc.getContext('2d'); bx.fillStyle='#808080'; bx.fillRect(0,0,W,H)
    for (let i=0; i<150; i++) {
      const x=Math.random()*W,y=Math.random()*H,r=Math.random()*70+10
      const g=bx.createRadialGradient(x,y,0,x,y,r); const v=100+(Math.random()*45|0)
      g.addColorStop(0,`rgba(${v},${v},${v},0.25)`); g.addColorStop(1,'rgba(128,128,128,0)')
      bx.fillStyle=g; bx.beginPath(); bx.arc(x,y,r,0,Math.PI*2); bx.fill()
    }
    const bTex = new THREE.CanvasTexture(bc)
    bTex.wrapS=bTex.wrapT=THREE.RepeatWrapping; bTex.repeat.set(1.6,1.6)
    return [cTex, bTex]
  }, [])

  const stoneMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: colorMap, bumpMap, bumpScale: 0.016,
    color: new THREE.Color('#2E2E2C'),
    metalness, roughness,
    clearcoat: 0.15, clearcoatRoughness: 0.42,
    reflectivity: 0.35, envMapIntensity: 0.0,
    emissive: new THREE.Color('#000000'),
  }), [metalness, roughness, colorMap, bumpMap])

  // ─── 13 SCULPTURAL BLOCKS ─────────────────────────────────────────────────
  const blocks = useMemo(() => {
    // Assembled sculpture positions (interlocking brutalist slabs)
    const BASE = [
      { p:[ 0.05,-0.95, 0.05], s:[1.10,0.30,0.62], r:[-0.06, 0.28, 0.08] },
      { p:[-0.32,-0.62, 0.28], s:[0.58,0.78,0.44], r:[ 0.32,-0.38,-0.28] },
      { p:[ 0.40,-0.58,-0.20], s:[0.50,0.70,0.40], r:[-0.24, 0.42, 0.30] },
      { p:[ 0.06,-0.08, 0.00], s:[0.72,0.58,0.54], r:[ 0.15, 0.22,-0.18] },
      { p:[-0.36, 0.08, 0.30], s:[0.55,0.68,0.40], r:[ 0.38,-0.28, 0.36] },
      { p:[ 0.45, 0.04,-0.25], s:[0.32,0.84,0.36], r:[-0.30, 0.50,-0.34] },
      { p:[ 0.12, 0.18, 0.35], s:[0.60,0.38,0.46], r:[ 0.42,-0.18, 0.40] },
      { p:[ 0.08, 0.56, 0.08], s:[0.65,0.40,0.45], r:[-0.35, 0.18, 0.38] },
      { p:[-0.28, 0.70, 0.20], s:[0.42,0.50,0.36], r:[ 0.40,-0.32,-0.40] },
      { p:[ 0.38, 0.68,-0.18], s:[0.28,0.58,0.30], r:[-0.28, 0.45, 0.32] },
      { p:[-0.05, 0.96, 0.05], s:[0.62,0.28,0.40], r:[-0.40, 0.30,-0.42] },
      { p:[-0.22, 1.12, 0.14], s:[0.36,0.24,0.32], r:[ 0.38,-0.38, 0.42] },
      { p:[ 0.26, 1.10,-0.12], s:[0.30,0.28,0.28], r:[-0.35, 0.42,-0.38] },
    ]

    // Portal frame targets — stone slabs intelligently slide into a rectangular gateway
    // Frame inner opening: X[-0.60..+0.60], Y[-1.08..+1.08]  (1.20w × 2.16h)
    // All blocks arrive at rot [0,0,0] — architectural precision
    const PORTAL = [
      { p:[-0.77,-0.81, 0], s:[0.34,0.54,0.38], r:[0,0,0] }, // [0]  left col, bottom
      { p:[-0.77,-0.27, 0], s:[0.34,0.54,0.38], r:[0,0,0] }, // [1]  left col, lower-mid
      { p:[ 0.77,-0.81, 0], s:[0.34,0.54,0.38], r:[0,0,0] }, // [2]  right col, bottom
      { p:[-0.22, 1.17, 0], s:[1.00,0.22,0.38], r:[0,0,0] }, // [3]  top bar, left
      { p:[-0.77, 0.27, 0], s:[0.34,0.54,0.38], r:[0,0,0] }, // [4]  left col, upper-mid
      { p:[ 0.77,-0.27, 0], s:[0.34,0.54,0.38], r:[0,0,0] }, // [5]  right col, lower-mid
      { p:[ 0.77, 0.27, 0], s:[0.34,0.54,0.38], r:[0,0,0] }, // [6]  right col, upper-mid
      { p:[-0.77, 0.81, 0], s:[0.34,0.54,0.38], r:[0,0,0] }, // [7]  left col, top
      { p:[ 0.77, 0.81, 0], s:[0.34,0.54,0.38], r:[0,0,0] }, // [8]  right col, top
      { p:[ 0.60, 1.17, 0], s:[0.44,0.22,0.38], r:[0,0,0] }, // [9]  top bar, right
      { p:[ 0.00, 1.39, 0], s:[1.88,0.20,0.38], r:[0,0,0] }, // [10] crown bar
      { p:[-0.22,-1.17, 0], s:[1.20,0.18,0.38], r:[0,0,0] }, // [11] bottom bar, left
      { p:[ 0.55,-1.17, 0], s:[0.44,0.18,0.38], r:[0,0,0] }, // [12] bottom bar, right
    ]

    return BASE.map((b, i) => ({
      id:          i,
      basePos:     new THREE.Vector3(...b.p),
      baseScale:   new THREE.Vector3(...b.s),
      baseRot:     new THREE.Euler(...b.r),
      portalPos:   new THREE.Vector3(...PORTAL[i].p),
      portalScale: new THREE.Vector3(...PORTAL[i].s),
      portalRot:   new THREE.Euler(...PORTAL[i].r),
    }))
  }, [])

  // ─── ANIMATION LOOP ────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const time  = state.clock.getElapsedTime()
    const mouse = state.mouse

    // ── Smooth progress values via lerping in useFrame ──
    if (!groupRef.current) return
    if (groupRef.current.userData.smoothHero === undefined) {
      groupRef.current.userData.smoothHero = heroProgress
      groupRef.current.userData.smoothPortal = portalFormProgress
    }
    // Smooth progress values to ease start/stop stutter
    groupRef.current.userData.smoothHero = THREE.MathUtils.lerp(groupRef.current.userData.smoothHero, heroProgress, 0.08)
    groupRef.current.userData.smoothPortal = THREE.MathUtils.lerp(groupRef.current.userData.smoothPortal, portalFormProgress, 0.08)

    const sh = groupRef.current.userData.smoothHero
    const sp = groupRef.current.userData.smoothPortal

    // ── Rotation: derived directly and smoothly from scroll progress ──
    const baseRotation = sh * (Math.PI * 3)
    const rotationLock = 1 - easeInOutCubic(sp)
    const currentScrollRot = baseRotation * rotationLock

    // ── Mouse parallax — only when hero is fully active, fades with portal ──
    if (groupRef.current) {
      const tilt = clamp01(1 - sp / 0.12)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.035 * tilt, 0.07)
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -mouse.x * 0.035 * tilt, 0.07)
    }

    // ── Float — fades out as portal transformation starts ───────────────
    const floatMult = clamp01(1 - sp / 0.12)
    const floatY    = Math.sin(time * 1.26) * 0.022 * floatMult

    // ── Portal formation: entirely driven by Section 2 progress ─────────
    const portalFormT = sp  // 0 → 1 smoothed

    blocks.forEach((block) => {
      const mesh = meshesRef.current[block.id]
      if (!mesh) return

      if (portalFormT < 0.001) {
        // ── SECTION 1: Assembled sculpture rotating ─────────────────────
        const tp = block.basePos.clone(); tp.y += floatY
        mesh.position.copy(tp)
        mesh.scale.copy(block.baseScale)
        mesh.rotation.set(
          block.baseRot.x,
          block.baseRot.y + currentScrollRot,
          block.baseRot.z
        )
      } else {
        // ── SECTION 2: Portal formation with per-block stagger ──────────
        // Stagger: each block starts 0.055 later → intelligent sequential feel
        const stagger = block.id * 0.055
        const tLocal  = clamp01((portalFormT - stagger) / (1.0 - stagger * 0.5))
        const et      = easeInOutCubic(tLocal)

        const startPos = block.basePos.clone(); startPos.y += floatY
        mesh.position.lerpVectors(startPos, block.portalPos, et)
        mesh.scale.lerpVectors(block.baseScale, block.portalScale, et)

        const fromRotY = block.baseRot.y + currentScrollRot
        mesh.rotation.x = THREE.MathUtils.lerp(block.baseRot.x, 0, et)
        mesh.rotation.y = THREE.MathUtils.lerp(fromRotY,        0, et)
        mesh.rotation.z = THREE.MathUtils.lerp(block.baseRot.z, 0, et)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {blocks.map((b) => (
        <mesh
          key={b.id}
          ref={(el) => (meshesRef.current[b.id] = el)}
          material={stoneMat}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
    </group>
  )
}
