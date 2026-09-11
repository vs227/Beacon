import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LandingLoader({ isLoading, loadPercent }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          className="loader-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="loader-wrapper">
            <span className="loader-percent">{loadPercent}%</span>
            <span className="loader">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className={`loader-dot${i < Math.round((loadPercent / 100) * 16) ? ' filled' : ''}`}
                />
              ))}
            </span>
            <span className="loader-label">Loading Content</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
