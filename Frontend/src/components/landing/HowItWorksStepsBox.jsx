import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CometCard from '../ui/CometCard'

const STEPS = [
  {
    num: '01',
    label: 'INGEST',
    text: 'Bring your data.',
    color: '#C86F52',
  },
  {
    num: '02',
    label: 'PROCESS',
    text: 'Turn data into searchable knowledge.',
    color: '#52A88B',
  },
  {
    num: '03',
    label: 'RETRIEVE',
    text: 'Find the context that matters.',
    color: '#52A88B',
  },
  {
    num: '04',
    label: 'BUILD',
    text: 'Put it into your AI application.',
    color: '#C86F52',
  },
]

export default function HowItWorksStepsBox({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
          className="minimal-steps-panel"
        >
          <CometCard rotateDepth={12} translateDepth={15}>
            <div className="comet-card-content-stack">
              {STEPS.map((step) => (
                <div key={step.label} className="minimal-step-item">
                  <div className="minimal-step-head">
                    <span className="minimal-step-title">{step.label}</span>
                  </div>
                  <p className="minimal-step-desc">{step.text}</p>
                </div>
              ))}
            </div>
          </CometCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
