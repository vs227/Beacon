import { useMemo } from 'react'
import * as THREE from 'three'

// Static portal frame stone slabs forming stationary rectangular gateway
// Frame inner opening: X[-0.60..+0.60], Y[-1.08..+1.08] (1.20w × 2.16h)
const PORTAL_BLOCKS = [
  { id: 0, pos: new THREE.Vector3(-0.77, -0.81, 0), scale: new THREE.Vector3(0.34, 0.54, 0.38) },
  { id: 1, pos: new THREE.Vector3(-0.77, -0.27, 0), scale: new THREE.Vector3(0.34, 0.54, 0.38) },
  { id: 2, pos: new THREE.Vector3(0.77, -0.81, 0), scale: new THREE.Vector3(0.34, 0.54, 0.38) },
  { id: 3, pos: new THREE.Vector3(-0.22, 1.17, 0), scale: new THREE.Vector3(1.00, 0.22, 0.38) },
  { id: 4, pos: new THREE.Vector3(-0.77, 0.27, 0), scale: new THREE.Vector3(0.34, 0.54, 0.38) },
  { id: 5, pos: new THREE.Vector3(0.77, -0.27, 0), scale: new THREE.Vector3(0.34, 0.54, 0.38) },
  { id: 6, pos: new THREE.Vector3(0.77, 0.27, 0), scale: new THREE.Vector3(0.34, 0.54, 0.38) },
  { id: 7, pos: new THREE.Vector3(-0.77, 0.81, 0), scale: new THREE.Vector3(0.34, 0.54, 0.38) },
  { id: 8, pos: new THREE.Vector3(0.77, 0.81, 0), scale: new THREE.Vector3(0.34, 0.54, 0.38) },
  { id: 9, pos: new THREE.Vector3(0.60, 1.17, 0), scale: new THREE.Vector3(0.44, 0.22, 0.38) },
  { id: 10, pos: new THREE.Vector3(0.00, 1.39, 0), scale: new THREE.Vector3(1.88, 0.20, 0.38) },
  { id: 11, pos: new THREE.Vector3(-0.22, -1.17, 0), scale: new THREE.Vector3(1.20, 0.18, 0.38) },
  { id: 12, pos: new THREE.Vector3(0.55, -1.17, 0), scale: new THREE.Vector3(0.44, 0.18, 0.38) },
]

const BOX_GEOMETRY = new THREE.BoxGeometry(1, 1, 1)

export default function ArtifactSculpture({
  metalness = 0.14,
  roughness = 0.50,
}) {
  // ─── BASALT MATERIAL ─────────────────────────────────────────────────────
  const [colorMap, bumpMap] = useMemo(() => {
    const W = 512, H = 512
    const cc = document.createElement('canvas'); cc.width = W; cc.height = H
    const ctx = cc.getContext('2d')
    ctx.fillStyle = '#323230'; ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 100 + 25
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      const v = Math.random() > 0.45 ? (10 + Math.random() * 12 | 0) : (48 + Math.random() * 22 | 0)
      g.addColorStop(0, `rgba(${v},${v},${v - 2},${Math.random() * 0.30 + 0.05})`)
      g.addColorStop(1, 'rgba(50,50,48,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
    for (let i = 0; i < 55000; i++) {
      const x = Math.random() * W, y = Math.random() * H, v = 20 + (Math.random() * 35 | 0)
      ctx.fillStyle = `rgba(${v},${v},${v},0.10)`
      ctx.fillRect(x, y, Math.random() * 1.0 + 0.4, Math.random() * 1.0 + 0.4)
    }
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * W, y = Math.random() * H, b = 70 + (Math.random() * 110 | 0)
      ctx.fillStyle = `rgba(${b},${b - 3},${b - 8},0.40)`
      ctx.fillRect(x, y, Math.random() * 1.8 + 0.4, Math.random() * 1.8 + 0.4)
    }
    ctx.strokeStyle = 'rgba(10,10,9,0.10)'; ctx.lineWidth = 0.7
    for (let i = 0; i < 16; i++) {
      const y0 = Math.random() * H; ctx.beginPath(); ctx.moveTo(0, y0)
      for (let x = 0; x < W; x += 6) ctx.lineTo(x, y0 + Math.sin(x * 0.035 + i * 1.4) * 7 + (Math.random() - 0.5) * 3)
      ctx.stroke()
    }
    const cTex = new THREE.CanvasTexture(cc)
    cTex.wrapS = cTex.wrapT = THREE.RepeatWrapping; cTex.repeat.set(1.6, 1.6)

    const bc = document.createElement('canvas'); bc.width = W; bc.height = H
    const bx = bc.getContext('2d'); bx.fillStyle = '#808080'; bx.fillRect(0, 0, W, H)
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 70 + 10
      const g = bx.createRadialGradient(x, y, 0, x, y, r); const v = 100 + (Math.random() * 45 | 0)
      g.addColorStop(0, `rgba(${v},${v},${v},0.25)`); g.addColorStop(1, 'rgba(128,128,128,0)')
      bx.fillStyle = g; bx.beginPath(); bx.arc(x, y, r, 0, Math.PI * 2); bx.fill()
    }
    const bTex = new THREE.CanvasTexture(bc)
    bTex.wrapS = bTex.wrapT = THREE.RepeatWrapping; bTex.repeat.set(1.6, 1.6)
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

  return (
    <group>
      {PORTAL_BLOCKS.map((b) => (
        <mesh
          key={b.id}
          position={b.pos}
          scale={b.scale}
          geometry={BOX_GEOMETRY}
          material={stoneMat}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}
