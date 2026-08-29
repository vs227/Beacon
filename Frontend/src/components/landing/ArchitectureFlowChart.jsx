import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CometCard from '../ui/CometCard'

const ARCH_NODES = [
  {
    id: 'client',
    title: 'CLIENT APPLICATION / SDK',
    desc: 'Frontend, AI Agents, or REST API Request',
  },
  {
    id: 'gateway',
    title: 'BEACON GATEWAY',
    desc: 'Authentication, Rate Limiting & Query Router',
    isPrimary: true,
  },
  {
    id: 'retrieval',
    title: 'HYBRID RETRIEVAL ENGINE',
    desc: 'HNSW Vector Search + BM25 Keyword Search',
    isPrimary: true,
  },
  {
    id: 'synthesis',
    title: 'RERANKING & SYNTHESIS',
    desc: 'Cross-Encoder Reranker & Citation Verifier',
  },
  {
    id: 'storage',
    title: 'KNOWLEDGE INDEX DB',
    desc: 'Multi-Tenant Vector & Semantic Store',
  },
]

export default function ArchitectureFlowChart({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
          className="clean-arch-chart"
        >
          <CometCard rotateDepth={12} translateDepth={15}>
            <div className="comet-card-content-stack">
              {ARCH_NODES.map((node) => (
                <div
                  key={node.id}
                  className={`clean-chart-node ${node.isPrimary ? 'node-hl' : ''}`}
                >
                  <span className="clean-node-title">{node.title}</span>
                  <span className="clean-node-desc">{node.desc}</span>
                </div>
              ))}
            </div>
          </CometCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
