import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const STAGES = [
  {
    id: 'question',
    code: '01',
    label: 'QUESTION',
    subtitle: 'Query Tokenization',
    metric: '128 Tokens',
    desc: 'Real-time prompt decomposition & intent extraction across multi-modal queries.',
  },
  {
    id: 'ingest',
    code: '02',
    label: 'INGEST',
    subtitle: 'Zero-Copy Chunking',
    metric: '4.2 MB/s',
    desc: 'Preserves document semantic boundaries with zero context boundary loss.',
  },
  {
    id: 'embed',
    code: '03',
    label: 'EMBED',
    subtitle: 'High-Dim Vectors',
    metric: '1536 Dims',
    desc: 'Generates normalized dense embeddings aligned to uniform vector space.',
  },
  {
    id: 'index',
    code: '04',
    label: 'INDEX',
    subtitle: 'HNSW Graph Mapping',
    metric: '1.2B Vectors',
    desc: 'Sub-millisecond graph indexing with 99.9% recall efficiency.',
  },
  {
    id: 'retrieve',
    code: '05',
    label: 'RETRIEVE',
    subtitle: 'Citation Reranking',
    metric: '< 0.8ms',
    desc: 'Strict citation verification & hybrid keyword-vector reranking.',
  },
  {
    id: 'answer',
    code: '06',
    label: 'ANSWER',
    subtitle: 'Grounded Synthesis',
    metric: '99.9% Accuracy',
    desc: 'Auditable Fact-based LLM generation with zero hallucination guarantee.',
  },
]

export default function ProcessingPipeline({ activeStageId = 'index' }) {
  const [activeStage, setActiveStage] = useState(activeStageId)

  useEffect(() => {
    setActiveStage(activeStageId)
  }, [activeStageId])

  const activeIndex = STAGES.findIndex(s => s.id === activeStage)
  const currentIndex = activeIndex >= 0 ? activeIndex : 3 // Default INDEX (index 3)

  return (
    <div className="processing-pipeline-container">
      {/* Architectural Theme Corner Notches */}
      <span className="pipeline-corner corner-tl" />
      <span className="pipeline-corner corner-tr" />
      <span className="pipeline-corner corner-bl" />
      <span className="pipeline-corner corner-br" />

      {/* Atmospheric Ambient Core Glows */}
      <div className="pipeline-ambient-glows">
        <div className="ambient-copper-pool" />
        <div className="ambient-emerald-pool" style={{ left: `${(currentIndex / (STAGES.length - 1)) * 100}%` }} />
      </div>

      {/* Pure Horizontal Processing Workflow Track */}
      <div className="pipeline-track-wrapper">
        {/* Base Copper Track Line */}
        <div className="copper-track-line" />

        {/* Emerald Energy Trail (extending up to active stage + forward through RETRIEVE) */}
        <div
          className="emerald-energy-trail"
          style={{
            width: `${((currentIndex + 1) / STAGES.length) * 100}%`,
          }}
        />

        {/* Luminous Pulse Node at Active Stage */}
        <motion.div
          className="active-luminous-glow"
          animate={{
            left: `${(currentIndex / (STAGES.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Stage Nodes Grid */}
        <div className="pipeline-nodes-grid">
          {STAGES.map((stage, idx) => {
            const isActive = idx === currentIndex
            const isPassed = idx < currentIndex
            const isTrail = idx === currentIndex + 1 // RETRIEVE stage in emerald trail

            let nodeState = 'dim'
            if (isActive) nodeState = 'active'
            else if (isTrail) nodeState = 'trail'
            else if (isPassed) nodeState = 'passed'

            return (
              <div key={stage.id} className={`pipeline-node-item node-${nodeState}`}>
                {/* Node Ring & Core Indicator */}
                <div className="node-indicator-wrapper">
                  <div className="node-outer-ring">
                    <div className="node-core-dot" />
                  </div>
                  {isActive && <div className="node-pulse-ring" />}
                </div>

                {/* Node Text Label & Subtitle */}
                <div className="node-content">
                  <span className="node-code">{stage.code}</span>
                  <span className="node-label">{stage.label}</span>
                  <span className="node-subtitle">{stage.subtitle}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
