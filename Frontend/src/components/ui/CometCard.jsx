import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export function CometCard({
  children,
  rotateDepth = 16,
  translateDepth = 25,
  className = '',
}) {
  const cardRef = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 22 })
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 22 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [rotateDepth, -rotateDepth])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-rotateDepth, rotateDepth])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
        rotateX,
        rotateY,
        overflow: 'visible',
      }}
      className={`comet-card-container ${className}`}
    >
      <div
        style={{
          transform: `translateZ(${translateDepth}px)`,
          transformStyle: 'preserve-3d',
          width: '100%',
          overflow: 'visible',
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}
export default CometCard
