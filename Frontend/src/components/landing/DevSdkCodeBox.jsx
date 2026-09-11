import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CometCard from '../ui/CometCard'

function CodeHighlighter({ lang }) {
  if (lang === 'js') {
    return (
      <>
        <span className="syn-keyword">import</span> {'{ '}
        <span className="syn-class">Beacon</span> {'}'}{' '}
        <span className="syn-keyword">from</span>{' '}
        <span className="syn-string">"@beacon/sdk"</span>;<br />
        <br />
        <span className="syn-keyword">const</span>{' '}
        <span className="syn-var">beacon</span> ={' '}
        <span className="syn-keyword">new</span>{' '}
        <span className="syn-class">Beacon</span>({'{'}
        <br />
        {'  '}
        <span className="syn-prop">apiKey</span>:{' '}
        <span className="syn-var">process</span>.
        <span className="syn-var">env</span>.
        <span className="syn-const">BEACON_API_KEY</span>
        <br />
        {'}'});<br />
        <br />
        <span className="syn-keyword">const</span>{' '}
        <span className="syn-var">context</span> ={' '}
        <span className="syn-keyword">await</span>{' '}
        <span className="syn-var">beacon</span>.
        <span className="syn-fn">retrieve</span>({'{'}
        <br />
        {'  '}
        <span className="syn-prop">knowledgeBase</span>:{' '}
        <span className="syn-string">"company-docs"</span>,<br />
        {'  '}
        <span className="syn-prop">query</span>:{' '}
        <span className="syn-string">"How does authentication work?"</span>
        <br />
        {'}'});
      </>
    )
  }

  if (lang === 'python') {
    return (
      <>
        <span className="syn-keyword">from</span>{' '}
        <span className="syn-var">beacon</span>{' '}
        <span className="syn-keyword">import</span>{' '}
        <span className="syn-class">Beacon</span>
        <br />
        <span className="syn-keyword">import</span>{' '}
        <span className="syn-var">os</span>
        <br />
        <br />
        <span className="syn-var">beacon</span> ={' '}
        <span className="syn-class">Beacon</span>(
        <span className="syn-prop">api_key</span>=
        <span className="syn-var">os</span>.
        <span className="syn-fn">getenv</span>(
        <span className="syn-string">"BEACON_API_KEY"</span>))
        <br />
        <br />
        <span className="syn-var">context</span> ={' '}
        <span className="syn-var">beacon</span>.
        <span className="syn-fn">retrieve</span>(<br />
        {'    '}
        <span className="syn-prop">knowledge_base</span>=
        <span className="syn-string">"company-docs"</span>,<br />
        {'    '}
        <span className="syn-prop">query</span>=
        <span className="syn-string">"How does authentication work?"</span>
        <br />)
      </>
    )
  }

  if (lang === 'curl') {
    return (
      <>
        <span className="syn-cmd">curl</span>{' '}
        <span className="syn-flag">-X</span> POST{' '}
        <span className="syn-string">"https://api.beacon.ai/v1/retrieve"</span>{' '}
        {"\\"}<br />
        {'  '}
        <span className="syn-flag">-H</span>{' '}
        <span className="syn-string">"Authorization: Bearer $BEACON_API_KEY"</span>{' '}
        {"\\"}<br />
        {'  '}
        <span className="syn-flag">-H</span>{' '}
        <span className="syn-string">"Content-Type: application/json"</span>{' '}
        {"\\"}<br />
        {'  '}
        <span className="syn-flag">-d</span>{" '{"}
        <br />
        {'    '}
        <span className="syn-prop">"knowledgeBase"</span>:{' '}
        <span className="syn-string">"company-docs"</span>,<br />
        {'    '}
        <span className="syn-prop">"query"</span>:{' '}
        <span className="syn-string">"How does authentication work?"</span>
        <br />
        {'  '}{"'}'"}
      </>
    )
  }

  return null
}

export default function DevSdkCodeBox({
  isVisible,
  selectedSdkTab,
  setSelectedSdkTab,
  copied,
  onCopyCode,
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
          className="sdk-code-panel-wrapper"
        >
          <CometCard rotateDepth={12} translateDepth={15} className="sdk-code-panel">
            {/* Top Bar with Language Tabs & Copy Button */}
            <div className="sdk-panel-header">
              <div className="sdk-tabs">
                <button
                  className={`sdk-tab-btn ${selectedSdkTab === 'js' ? 'active' : ''}`}
                  onClick={() => setSelectedSdkTab('js')}
                >
                  JS
                </button>
                <button
                  className={`sdk-tab-btn ${selectedSdkTab === 'python' ? 'active' : ''}`}
                  onClick={() => setSelectedSdkTab('python')}
                >
                  Python
                </button>
                <button
                  className={`sdk-tab-btn ${selectedSdkTab === 'curl' ? 'active' : ''}`}
                  onClick={() => setSelectedSdkTab('curl')}
                >
                  cURL
                </button>
              </div>

              <button className="sdk-copy-btn" onClick={onCopyCode}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            {/* Formatted Code View */}
            <div className="sdk-code-content">
              <pre className="sdk-code-pre">
                <code>
                  <CodeHighlighter lang={selectedSdkTab} />
                </code>
              </pre>
            </div>
          </CometCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
