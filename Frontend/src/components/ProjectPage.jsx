import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CreativeBackground from './CreativeBackground'

/* ─── Inline SVG Icons ─── */
function IconArrowLeft({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
  )
}
function IconLayers({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
  )
}
function IconDatabase({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>
  )
}
function IconKey({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
  )
}
function IconSettings({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  )
}
function IconUpload({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
  )
}
function IconFile({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
  )
}
function IconCpu({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" /></svg>
  )
}
function IconSend({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
  )
}
function IconActivity({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
  )
}
function IconLogOut({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
  )
}
function IconTrash({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
  )
}
function IconSearch({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
  )
}
function IconCheckCircle({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  )
}
function IconAlertCircle({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  )
}
function IconLoader({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin-icon"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
  )
}
function IconGithub({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
  )
}
function IconRefresh({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
  )
}

const API_BASE = ''

export default function ProjectPage({ auth }) {
  const navigate = useNavigate()
  const { orgId, projectId } = useParams()
  const fileInputRef = useRef(null)

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Documents & Ingestion State
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  // GitHub Repository Pipeline State
  const [docTab, setDocTab] = useState('upload') // 'upload' | 'github'
  const [githubUrl, setGithubUrl] = useState('')
  const [scanningGithub, setScanningGithub] = useState(false)
  const [githubScanResult, setGithubScanResult] = useState(null)
  const [selectedGithubFiles, setSelectedGithubFiles] = useState([])
  const [importingGithub, setImportingGithub] = useState(false)
  const [githubError, setGithubError] = useState('')
  const [syncingRepoUrl, setSyncingRepoUrl] = useState('')

  // GitHub Repo Picker State (for GitHub-authenticated users)
  const [userRepos, setUserRepos] = useState([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [repoSearchFilter, setRepoSearchFilter] = useState('')
  const [reposFetched, setReposFetched] = useState(false)
  const isGithubUser = auth.user?.auth_provider === 'github'

  // Semantic Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // RAG AI Assistant State
  const [ragMessages, setRagMessages] = useState([])
  const [ragInput, setRagInput] = useState('')
  const [ragLoading, setRagLoading] = useState(false)
  const [ragProvider, setRagProvider] = useState('groq')
  const [byokKey, setByokKey] = useState('')
  const [showByokModal, setShowByokModal] = useState(false)
  const [topK, setTopK] = useState(4)

  const chatScrollRef = useRef(null)

  // Load saved project chat history from localStorage on load or project switch
  useEffect(() => {
    if (!projectId) return
    const storageKey = `beacon_rag_chat_${projectId}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRagMessages(parsed.map(m => ({ ...m, typing: false })))
          return
        }
      } catch (err) {
        console.error('Failed to parse saved chat history:', err)
      }
    }
    setRagMessages([
      {
        role: 'assistant',
        content: 'Welcome to Beacon Assistant. How can I help resolve your query today?',
        sources: [],
      }
    ])
  }, [projectId])

  // Save chat history to localStorage whenever ragMessages updates
  useEffect(() => {
    if (!projectId || ragMessages.length === 0) return
    const storageKey = `beacon_rag_chat_${projectId}`
    const cleanMessages = ragMessages.map(m => {
      const { typing, ...rest } = m
      return rest
    })
    localStorage.setItem(storageKey, JSON.stringify(cleanMessages))
  }, [ragMessages, projectId])

  // Handle Clear Chat
  const handleClearChat = () => {
    if (!projectId) return
    const storageKey = `beacon_rag_chat_${projectId}`
    localStorage.removeItem(storageKey)
    setRagMessages([
      {
        role: 'assistant',
        content: 'Welcome to Beacon Assistant. How can I help resolve your query today?',
        sources: [],
      }
    ])
  }

  // Auto-scroll chat to bottom as messages arrive or type out
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [ragMessages, ragLoading])

// Formatter for AI output: renders bold headers and styled bullet points
function renderFormattedMessage(text) {
  if (!text) return null

  const lines = text.split('\n')
  return lines.map((line, idx) => {
    const cleanLine = line.trim()
    if (!cleanLine) return <div key={idx} style={{ height: '4px' }} />

    // Check if line is a bullet point (*, -, •)
    const bulletMatch = cleanLine.match(/^[*\-•]\s+(.*)/)
    const isBullet = Boolean(bulletMatch)
    const lineContent = isBullet ? bulletMatch[1] : cleanLine

    // Parse bold text **bold**
    const parts = lineContent.split(/(\*\*.*?\*\*)/g)
    const formattedContent = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })

    if (isBullet) {
      return (
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '4px 0 4px 4px' }}>
          <span style={{ color: 'var(--bronze-highlight, #f4d1a6)', fontSize: '0.85rem', lineHeight: '1.4' }}>•</span>
          <span style={{ flex: 1, lineHeight: '1.45' }}>{formattedContent}</span>
        </div>
      )
    }

    return (
      <div key={idx} style={{ margin: '3px 0', lineHeight: '1.45' }}>
        {formattedContent}
      </div>
    )
  })
}

  // Realistic Human Live Typing Animation
  const typeTextHumanLike = async (fullText, assistantIndex) => {
    let currentText = ''
    let idx = 0

    while (idx < fullText.length) {
      // Reveal 1 to 2 characters per keystroke tick
      const char = fullText[idx]
      const nextChar = fullText[idx + 1] || ''
      const increment = (char === ' ' || char === '\n') ? 1 : Math.min(2, fullText.length - idx)
      
      idx += increment
      currentText = fullText.slice(0, idx)

      setRagMessages(prev => {
        const copy = [...prev]
        if (copy[assistantIndex]) {
          copy[assistantIndex] = { ...copy[assistantIndex], content: currentText, typing: idx < fullText.length }
        }
        return copy
      })

      // Calculate realistic human typing pause:
      let delay = Math.floor(Math.random() * 15) + 18 // Base keystroke: 18-33ms

      // Human pause on punctuation marks
      if (['.', '!', '?', '\n'].includes(char)) {
        delay = Math.floor(Math.random() * 80) + 140 // Pause on sentence ends / line breaks
      } else if ([',', ';', ':', '-'].includes(char)) {
        delay = Math.floor(Math.random() * 40) + 70  // Slight pause on commas & clauses
      }

      await new Promise(res => setTimeout(res, delay))
    }

    // Ensure final state is clean and typing indicator is turned off
    setRagMessages(prev => {
      const copy = [...prev]
      if (copy[assistantIndex]) {
        copy[assistantIndex] = { ...copy[assistantIndex], content: fullText, typing: false }
      }
      return copy
    })
  }

  // Handle RAG AI Query
  const handleSendRagQuery = async (e) => {
    e?.preventDefault()
    if (!ragInput.trim() || ragLoading) return

    const userMsg = ragInput.trim()
    setRagInput('')

    const updatedMessages = [...ragMessages, { role: 'user', content: userMsg }]
    setRagMessages(updatedMessages)
    setRagLoading(true)

    // Build chat history (last 3 chat turns = up to 6 prior user & assistant messages)
    const validPriorMessages = ragMessages.filter(
      m => m.content && m.content.trim() && !m.typing
    )
    const historyForApi = validPriorMessages.slice(-6).map(m => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          query: userMsg,
          top_k: topK,
          min_score: 0.20,
          llm_provider: ragProvider,
          custom_api_key: byokKey.trim() || undefined,
          history: historyForApi.length > 0 ? historyForApi : undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const fullAnswer = data.answer || 'No response.'
        
        // Hide loading spinner and insert initial empty assistant message
        setRagLoading(false)
        
        setRagMessages(prev => {
          const assistantIndex = prev.length
          // Add placeholder message
          const withPlaceholder = [
            ...prev,
            {
              role: 'assistant',
              content: '',
              typing: true,
              sources: data.sources || [],
              confidence: data.confidence_score,
              provider: data.provider_used,
              model: data.model_used,
              tokens: data.token_usage,
              executionTime: data.execution_time_ms,
            }
          ]
          // Trigger dynamic typing
          typeTextHumanLike(fullAnswer, assistantIndex)
          return withPlaceholder
        })
      } else {
        const err = await res.json()
        setRagLoading(false)
        setRagMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Error: ${err.detail || 'RAG Query failed.'}`,
            sources: [],
          }
        ])
      }
    } catch (err) {
      setRagLoading(false)
      setRagMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Connection Error: ${err.message}`,
          sources: [],
        }
      ])
    }
  }

  // Fetch Project
  const fetchProject = useCallback(async () => {
    if (!auth.token || !orgId || !projectId) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProject(data)
      } else if (res.status === 401) {
        auth.logout()
      }
    } catch (err) {
      console.error('Failed to fetch project:', err)
    } finally {
      setLoading(false)
    }
  }, [auth, orgId, projectId])

  // Fetch Documents
  const fetchDocuments = useCallback(async () => {
    if (!auth.token || !orgId || !projectId) return
    setLoadingDocs(true)
    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/documents`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setLoadingDocs(false)
    }
  }, [auth, orgId, projectId])

  useEffect(() => {
    fetchProject()
    fetchDocuments()
  }, [fetchProject, fetchDocuments])

  // Auto-poll documents while any document is pending/processing
  useEffect(() => {
    const hasProcessing = documents.some(d => d.status === 'pending' || d.status === 'processing')
    if (!hasProcessing) return

    const interval = setInterval(() => {
      fetchDocuments()
    }, 3000)

    return () => clearInterval(interval)
  }, [documents, fetchDocuments])

  // Handle File Upload
  const handleUploadFile = async (file) => {
    if (!file) return
    setUploading(true)
    setUploadError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      })

      if (res.ok) {
        const doc = await res.json()
        setDocuments(prev => [doc, ...prev])
      } else {
        const errData = await res.json()
        setUploadError(errData.detail || 'Failed to upload document')
      }
    } catch (err) {
      setUploadError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // Handle File Delete
  const handleDeleteDoc = async (docId) => {
    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId))
      }
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  // Handle GitHub Scan
  const handleScanGithubRepo = async (e) => {
    e.preventDefault()
    if (!githubUrl.trim()) return
    setScanningGithub(true)
    setGithubError('')
    setGithubScanResult(null)

    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/documents/github-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ repo_url: githubUrl }),
      })

      if (res.ok) {
        const data = await res.json()
        setGithubScanResult(data)
        // Default pre-select only .md files as requested
        const mdFiles = data.files.filter(f => f.extension === 'md' || f.path.toLowerCase().endsWith('.md')).map(f => f.path)
        setSelectedGithubFiles(mdFiles.length > 0 ? mdFiles : data.files.map(f => f.path))
      } else {
        const errData = await res.json()
        setGithubError(errData.detail || 'Failed to scan repository')
      }
    } catch (err) {
      setGithubError('Scan failed: ' + err.message)
    } finally {
      setScanningGithub(false)
    }
  }

  // Fetch GitHub Repos for authenticated GitHub users
  const fetchUserRepos = useCallback(async () => {
    if (!auth.token || !isGithubUser || !orgId || !projectId) return
    setLoadingRepos(true)
    setGithubError('')
    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/documents/github-repos`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUserRepos(data.repos || [])
        setReposFetched(true)
      } else {
        const errData = await res.json()
        setGithubError(errData.detail || 'Failed to load repositories')
      }
    } catch (err) {
      setGithubError('Failed to fetch repos: ' + err.message)
    } finally {
      setLoadingRepos(false)
    }
  }, [auth.token, isGithubUser, orgId, projectId])

  // Auto-fetch repos when GitHub tab is opened by a GitHub-authenticated user
  useEffect(() => {
    if (docTab === 'github' && isGithubUser && !reposFetched && !loadingRepos) {
      fetchUserRepos()
    }
  }, [docTab, isGithubUser, reposFetched, loadingRepos, fetchUserRepos])

  // Select a repo from the picker and auto-scan it
  const handleSelectRepoFromPicker = async (repoUrl) => {
    setGithubUrl(repoUrl)
    setGithubScanResult(null)
    setScanningGithub(true)
    setGithubError('')

    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/documents/github-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ repo_url: repoUrl }),
      })

      if (res.ok) {
        const data = await res.json()
        setGithubScanResult(data)
        const mdFiles = data.files.filter(f => f.extension === 'md' || f.path.toLowerCase().endsWith('.md')).map(f => f.path)
        setSelectedGithubFiles(mdFiles.length > 0 ? mdFiles : data.files.map(f => f.path))
      } else {
        const errData = await res.json()
        setGithubError(errData.detail || 'Failed to scan repository')
      }
    } catch (err) {
      setGithubError('Scan failed: ' + err.message)
    } finally {
      setScanningGithub(false)
    }
  }

  // Handle Toggle GitHub File Selection
  const handleToggleGithubFile = (filePath) => {
    setSelectedGithubFiles(prev =>
      prev.includes(filePath) ? prev.filter(p => p !== filePath) : [...prev, filePath]
    )
  }

  // Handle Select All / Deselect All
  const handleSelectAllGithubFiles = (selectAll) => {
    if (selectAll && githubScanResult) {
      setSelectedGithubFiles(githubScanResult.files.map(f => f.path))
    } else {
      setSelectedGithubFiles([])
    }
  }

  // Handle Import & Index Selected Files
  const handleImportGithubFiles = async () => {
    if (!githubScanResult || selectedGithubFiles.length === 0) return
    setImportingGithub(true)
    setGithubError('')

    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/documents/github-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          repo_url: githubScanResult.repo_url,
          selected_files: selectedGithubFiles,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.document && data.document.id) {
          setDocuments(prev => {
            const exists = prev.some(d => d.id === data.document.id)
            return exists ? prev.map(d => d.id === data.document.id ? data.document : d) : [data.document, ...prev]
          })
        }
        setGithubScanResult(null)
        setGithubUrl('')
        fetchDocuments()
      } else {
        const errData = await res.json()
        setGithubError(errData.detail || 'Failed to import files')
      }
    } catch (err) {
      setGithubError('Import failed: ' + err.message)
    } finally {
      setImportingGithub(false)
    }
  }

  // Handle Sync / Re-Index GitHub Repo
  const handleSyncGithubRepo = async (repoUrl) => {
    setSyncingRepoUrl(repoUrl)
    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/documents/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ repo_url: repoUrl }),
      })

      if (res.ok) {
        fetchDocuments()
      }
    } catch (err) {
      console.error('Failed to sync repo:', err)
    } finally {
      setSyncingRepoUrl('')
    }
  }


  // Handle Semantic Search
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    setHasSearched(true)

    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ query: searchQuery, top_k: 5 }),
      })

      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
      }
    } catch (err) {
      console.error('Semantic search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'rag-chat', label: 'Test RAG' },
    { id: 'knowledge-base', label: 'Knowledge Base' },
    { id: 'activity', label: 'Activity' },
    { id: 'api-keys', label: 'API Keys' },
    { id: 'settings', label: 'Settings' },
  ]

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="dashboard-container">
      {/* Creative Dynamic Atmospheric Background */}
      <CreativeBackground />

      {/* Top Navbar */}
      <header className="dashboard-navbar">
        <div className="navbar-left">
          <div className="navbar-brand" onClick={() => navigate('/dashboard/organizations')}>
            <span>BEACON</span>
          </div>
        </div>

        {/* Right User profile & Navigation Tabs */}
        <div className="navbar-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeSection === item.id ? ' active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.label}</span>
            </button>
          ))}

          <button
            className="user-avatar-btn"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            aria-label="User menu"
            style={{ marginLeft: '6px' }}
          >
            <div className="user-avatar">
              {auth.user?.username?.[0]?.toUpperCase() || auth.user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>

          <AnimatePresence>
            {showProfileDropdown && (
              <>
                <div className="dropdown-overlay" onClick={() => setShowProfileDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="profile-dropdown"
                >
                  <div className="dropdown-header">
                    <span className="dropdown-username">{auth.user?.username || 'Explorer'}</span>
                    <span className="dropdown-email">{auth.user?.email}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/dashboard/settings') }}>
                    <IconSettings size={14} /><span>Account Settings</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={() => { setShowProfileDropdown(false); auth.logout() }}>
                    <IconLogOut size={14} /><span>Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ width: '100%', padding: '36px 32px 24px 32px', boxSizing: 'border-box' }}>
        {/* Back to Projects link on far left under BEACON logo */}
        <div style={{ marginBottom: '24px', marginTop: '6px' }}>
          <button
            onClick={() => navigate(`/dashboard/org/${orgId}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.84rem',
              padding: 0,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <IconArrowLeft size={14} />
            <span>Back to Projects</span>
          </button>
        </div>

        {/* Centered Container for Project Details & Tabs */}
        <div style={{ maxWidth: '1080px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              {project?.name || 'Project'}
            </h1>

            {/* Test RAG Controls - Right Aligned under Top Navbar Tabs */}
            {activeSection === 'rag-chat' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Provider Selector */}
                <select
                  className="provider-select-pill"
                  value={ragProvider}
                  onChange={(e) => setRagProvider(e.target.value)}
                  style={{ borderRadius: '0px' }}
                >
                  <option value="groq">Groq (Llama 3.3 70B)</option>
                  <option value="openai">OpenAI (GPT-4o mini)</option>
                  <option value="gemini">Google Gemini (Flash)</option>
                  <option value="anthropic">Anthropic (Claude 3.5)</option>
                  <option value="custom">Custom Endpoint / Local LLM</option>
                </select>

                {/* BYOK Key Toggle */}
                <button
                  className={`byok-toggle-btn ${byokKey.trim() ? 'active-key' : ''}`}
                  onClick={() => setShowByokModal(!showByokModal)}
                  style={{ borderRadius: '0px' }}
                >
                  <IconKey size={14} />
                  <span>{byokKey.trim() ? 'BYOK Active' : 'BYOK Key'}</span>
                </button>

                {/* Context Depth Selector */}
                <select
                  className="provider-select-pill"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  title="Context depth for query resolution"
                  style={{ borderRadius: '0px' }}
                >
                  <option value={2}>Concise (K=2)</option>
                  <option value={4}>Balanced (K=4)</option>
                  <option value={6}>Deep (K=6)</option>
                </select>

                {/* Clear Chat Button */}
                <button
                  className="byok-toggle-btn"
                  onClick={handleClearChat}
                  title="Clear conversation history for this project"
                  style={{ borderRadius: '0px', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                >
                  <IconTrash size={14} />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>
          {loading ? (
            <div className="spinner-container">
              <div className="dashboard-spinner"></div>
              <span>Loading project...</span>
            </div>
          ) : !project ? (
            <div className="empty-state">
              <h3>Project Not Found</h3>
              <p>This project may have been deleted or you don't have access.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">

              {/* Overview Section */}
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ maxWidth: '720px' }}
                >
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: '24px' }}>
                    Project Overview
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Project Name</span>
                      <span style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{project.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Slug</span>
                      <span style={{ color: 'var(--bronze-highlight)', fontSize: '0.88rem', fontFamily: 'monospace', fontWeight: 500 }}>{project.slug}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Use Case</span>
                      <span style={{ color: '#fff', fontSize: '0.88rem' }}>{project.project_type || 'General AI Assistant'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Environment</span>
                      <span className={`status-badge ${project.environment?.toLowerCase() === 'production' ? 'active' : 'type'}`}>
                        {project.environment || 'Development'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Total Documents</span>
                      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{documents.length}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Total Chunks</span>
                      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)}</span>
                    </div>

                    {project.description && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Description</span>
                        <p style={{ color: '#e0e0e0', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>{project.description}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Documents Section */}
              {activeSection === 'documents' && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="project-section"
                >
                  <h2 className="section-title">Document Pipeline</h2>

                  {/* Pipeline Sub-Tabs */}
                  <div className="doc-pipeline-tabs">
                    <button
                      className={`pipeline-tab-btn ${docTab === 'upload' ? 'active' : ''}`}
                      onClick={() => setDocTab('upload')}
                    >
                      <IconUpload size={16} />
                      <span>Local File Upload</span>
                    </button>
                    <button
                      className={`pipeline-tab-btn ${docTab === 'github' ? 'active' : ''}`}
                      onClick={() => setDocTab('github')}
                    >
                      <IconGithub size={16} />
                      <span>GitHub Repository</span>
                    </button>
                  </div>

                  {/* Dropzone (Local File Upload) */}
                  {docTab === 'upload' && (
                    <>
                      <div
                        className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setDragOver(false)
                          if (e.dataTransfer.files?.[0]) handleUploadFile(e.dataTransfer.files[0])
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.txt,.md,.docx"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadFile(e.target.files[0])
                          }}
                        />
                        <IconUpload size={32} />
                        <div className="dropzone-text">
                          <strong>{uploading ? 'Uploading & Triggering Pipeline...' : 'Click or drop document to upload'}</strong>
                          <span>Supports PDF, TXT, MD, DOCX (Max 10MB)</span>
                        </div>
                      </div>

                      {uploadError && (
                        <div className="upload-error">
                          <IconAlertCircle size={16} />
                          <span>{uploadError}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* GitHub Repository Pipeline */}
                  {docTab === 'github' && (
                    <div className="github-scan-card">

                      {/* ── Step 1: GitHub Repo Picker (for GitHub-authenticated users) ── */}
                      {isGithubUser && !githubScanResult && (
                        <>
                          {/* Repo search filter */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '0px',
                              padding: '10px 14px',
                            }}>
                              <IconSearch size={16} />
                              <input
                                type="text"
                                placeholder="Search your repositories..."
                                value={repoSearchFilter}
                                onChange={(e) => setRepoSearchFilter(e.target.value)}
                                style={{
                                  flex: 1,
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  color: '#fff',
                                  fontSize: '0.88rem',
                                  fontFamily: 'var(--font-body)',
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="github-scan-btn"
                              onClick={fetchUserRepos}
                              disabled={loadingRepos}
                              style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}
                            >
                              <IconRefresh size={14} className={loadingRepos ? 'spin-icon' : ''} />
                              <span>{loadingRepos ? 'Loading...' : 'Refresh'}</span>
                            </button>
                          </div>

                          {/* Repo list */}
                          {loadingRepos ? (
                            <div className="spinner-container" style={{ minHeight: '200px' }}>
                              <div className="dashboard-spinner"></div>
                              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Loading your GitHub repositories...</span>
                            </div>
                          ) : userRepos.length === 0 && reposFetched ? (
                            <div className="empty-state" style={{ minHeight: '160px' }}>
                              <IconGithub size={24} />
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>No repositories found. Try refreshing or paste a URL manually below.</p>
                            </div>
                          ) : (
                            <div style={{
                              maxHeight: '380px',
                              overflowY: 'auto',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '0px',
                            }}>
                              {userRepos
                                .filter(r => {
                                  if (!repoSearchFilter.trim()) return true
                                  const q = repoSearchFilter.toLowerCase()
                                  return r.name.toLowerCase().includes(q) || r.full_name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)
                                })
                                .map((repo) => (
                                  <div
                                    key={repo.full_name}
                                    onClick={() => handleSelectRepoFromPicker(repo.html_url)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '12px 16px',
                                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                                      cursor: 'pointer',
                                      transition: 'background 0.15s ease',
                                      gap: '12px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                        <IconGithub size={14} />
                                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{repo.name}</span>
                                        <span style={{
                                          fontSize: '0.68rem',
                                          padding: '1px 7px',
                                          borderRadius: '10px',
                                          border: `1px solid ${repo.private ? 'rgba(251, 191, 36, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`,
                                          color: repo.private ? '#fbbf24' : '#4ade80',
                                          fontWeight: 500,
                                        }}>
                                          {repo.private ? 'Private' : 'Public'}
                                        </span>
                                        {repo.fork && (
                                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>fork</span>
                                        )}
                                      </div>
                                      {repo.description && (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {repo.description}
                                        </p>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                      {repo.language && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--bronze-highlight, #f4d1a6)', display: 'inline-block' }}></span>
                                          {repo.language}
                                        </span>
                                      )}
                                      {repo.stargazers_count > 0 && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                          ★ {repo.stargazers_count}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}

                          {/* Manual URL fallback */}
                          <div style={{ marginTop: '18px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                              Or paste a repository URL manually
                            </span>
                            <form onSubmit={handleScanGithubRepo} className="github-url-form">
                              <input
                                type="text"
                                className="github-input"
                                placeholder="https://github.com/owner/repo"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                              />
                              <button type="submit" className="github-scan-btn" disabled={scanningGithub}>
                                {scanningGithub ? <IconLoader size={16} /> : <IconGithub size={16} />}
                                <span>{scanningGithub ? 'Scanning...' : 'Scan'}</span>
                              </button>
                            </form>
                          </div>
                        </>
                      )}

                      {/* ── Non-GitHub users: original URL paste flow ── */}
                      {!isGithubUser && !githubScanResult && (
                        <form onSubmit={handleScanGithubRepo} className="github-url-form">
                          <input
                            type="text"
                            className="github-input"
                            placeholder="Paste GitHub Repository URL (e.g. https://github.com/owner/repo)"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                          />
                          <button type="submit" className="github-scan-btn" disabled={scanningGithub}>
                            {scanningGithub ? <IconLoader size={16} /> : <IconGithub size={16} />}
                            <span>{scanningGithub ? 'Scanning Tree...' : 'Scan Repository'}</span>
                          </button>
                        </form>
                      )}

                      {/* Scanning spinner */}
                      {scanningGithub && (
                        <div className="spinner-container" style={{ minHeight: '120px', marginTop: '16px' }}>
                          <div className="dashboard-spinner"></div>
                          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Scanning repository tree...</span>
                        </div>
                      )}

                      {githubError && (
                        <div className="upload-error" style={{ marginTop: '14px' }}>
                          <IconAlertCircle size={16} />
                          <span>{githubError}</span>
                        </div>
                      )}

                      {/* ── Step 2: Detected Files Tree Selector (unchanged) ── */}
                      {githubScanResult && (
                        <div className="github-tree-container">
                          {/* Back to repo list button for GitHub users */}
                          {isGithubUser && (
                            <button
                              type="button"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                padding: '0 0 12px 0',
                                transition: 'color 0.2s ease',
                              }}
                              onClick={() => { setGithubScanResult(null); setGithubUrl(''); }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                            >
                              <IconArrowLeft size={13} />
                              <span>Back to repositories</span>
                            </button>
                          )}

                          <div className="github-tree-header">
                            <div>
                              <span className="github-tree-title">
                                {githubScanResult.owner}/{githubScanResult.repo} ({githubScanResult.branch} @ {githubScanResult.commit_sha})
                              </span>
                              <span className="doc-meta">Detected {githubScanResult.total_detected} supported files</span>
                            </div>
                            <div className="github-tree-actions">
                              <button
                                type="button"
                                className="github-text-btn"
                                onClick={() => {
                                  if (githubScanResult) {
                                    const mdOnly = githubScanResult.files.filter(f => f.extension === 'md' || f.path.toLowerCase().endsWith('.md')).map(f => f.path);
                                    setSelectedGithubFiles(mdOnly);
                                  }
                                }}
                              >
                                Select .md Only
                              </button>
                              <span style={{ color: '#475569' }}>|</span>
                              <button
                                type="button"
                                className="github-text-btn"
                                onClick={() => handleSelectAllGithubFiles(true)}
                              >
                                Select All
                              </button>
                              <span style={{ color: '#475569' }}>|</span>
                              <button
                                type="button"
                                className="github-text-btn"
                                onClick={() => handleSelectAllGithubFiles(false)}
                              >
                                Clear All
                              </button>
                            </div>
                          </div>

                          <div className="github-file-list">
                            {githubScanResult.files.map((file) => {
                              const isChecked = selectedGithubFiles.includes(file.path)
                              return (
                                <div
                                  key={file.path}
                                  className="github-file-row"
                                  onClick={() => handleToggleGithubFile(file.path)}
                                >
                                  <div className="github-file-left">
                                    <input
                                      type="checkbox"
                                      className="github-checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleGithubFile(file.path)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="github-file-path">{file.path}</span>
                                  </div>
                                  <div className="github-file-right">
                                    <span className={`github-ext-badge ${file.extension}`}>
                                      {file.extension}
                                    </span>
                                    <span className="github-file-size">
                                      {formatBytes(file.size_bytes)}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className="github-import-footer">
                            <button
                              type="button"
                              className="btn-create-org"
                              disabled={importingGithub || selectedGithubFiles.length === 0}
                              onClick={handleImportGithubFiles}
                              style={{ width: 'auto', padding: '10px 24px' }}
                            >
                              {importingGithub ? <IconLoader size={16} /> : <IconDatabase size={16} />}
                              <span>
                                {importingGithub
                                  ? 'Streaming & Ingesting...'
                                  : `Import & Index Selected (${selectedGithubFiles.length} Files)`}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Document List */}
                  <div className="doc-list-container" style={{ marginTop: '32px' }}>
                    <h3 className="subsection-title">Indexed Documents & Repositories ({documents.length})</h3>

                    {loadingDocs ? (
                      <div className="spinner-container">
                        <div className="dashboard-spinner"></div>
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="empty-state" style={{ minHeight: '180px' }}>
                        <IconFile size={24} />
                        <p style={{ fontSize: '0.85rem' }}>No documents or repositories indexed yet. Upload a file or connect GitHub above.</p>
                      </div>
                    ) : (
                      <div className="doc-table">
                        {documents.map((doc) => (
                          <div key={doc.id} className="doc-row">
                            <div className="doc-info">
                              {doc.file_type === 'github' ? <IconGithub size={18} /> : <IconFile size={18} />}
                              <div>
                                <span className="doc-name">{doc.file_name}</span>
                                <span className="doc-meta">
                                  {doc.file_size_bytes > 0 ? formatBytes(doc.file_size_bytes) + ' • ' : ''}
                                  {doc.chunk_count || 0} chunks • {formatDate(doc.created_at)}
                                </span>
                                {doc.status === 'failed' && doc.error_message && (
                                  <span style={{ color: '#fca5a5', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                                    Error: {doc.error_message}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="doc-actions">
                              {/* Sync Now Button for GitHub repos */}
                              {doc.file_type === 'github' && (
                                <button
                                  className="sync-repo-btn"
                                  disabled={syncingRepoUrl === doc.storage_path}
                                  onClick={() => handleSyncGithubRepo(doc.storage_path)}
                                  title="Check latest GitHub commit & re-index"
                                >
                                  <IconRefresh size={12} className={syncingRepoUrl === doc.storage_path ? 'spin-icon' : ''} />
                                  <span>{syncingRepoUrl === doc.storage_path ? 'Syncing...' : 'Sync Now'}</span>
                                </button>
                              )}

                              {/* Status Badge */}
                              <span className={`doc-status-badge ${doc.status}`}>
                                {doc.status === 'processing' || doc.status === 'pending' ? (
                                  <>
                                    <IconLoader size={12} />
                                    <span>Processing...</span>
                                  </>
                                ) : doc.status === 'completed' ? (
                                  <>
                                    <IconCheckCircle size={12} />
                                    <span>Indexed</span>
                                  </>
                                ) : (
                                  <>
                                    <IconAlertCircle size={12} />
                                    <span>Failed</span>
                                  </>
                                )}
                              </span>

                              <button className="btn-delete-card" onClick={() => handleDeleteDoc(doc.id)}>
                                <IconTrash size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

              )}

              {/* Knowledge Base Section */}
              {activeSection === 'knowledge-base' && (
                <motion.div
                  key="knowledge-base"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="project-section"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h2 className="section-title" style={{ margin: 0 }}>Knowledge Base & Semantic Search</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px', margin: 0 }}>
                        Real-time vector search across document embeddings using cosine similarity.
                      </p>
                    </div>
                  </div>

                  {/* Vector Stats Metric Bar */}
                  <div className="kb-stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                    <div className="kb-stat-card">
                      <span className="kb-stat-label">Vector Index Chunks</span>
                      <span className="kb-stat-value">{documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)}</span>
                    </div>
                    <div className="kb-stat-card">
                      <span className="kb-stat-label">Embedding Model</span>
                      <span className="kb-stat-value" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>MiniLM-L6-v2</span>
                    </div>
                    <div className="kb-stat-card">
                      <span className="kb-stat-label">Distance Metric</span>
                      <span className="kb-stat-value" style={{ fontSize: '0.85rem' }}>Cosine Similarity</span>
                    </div>
                    <div className="kb-stat-card">
                      <span className="kb-stat-label">Vector Status</span>
                      <span className="kb-stat-value" style={{ fontSize: '0.82rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                        Active & Synced
                      </span>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="search-bar-container">
                    <IconSearch size={18} style={{ color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Enter natural language queries, questions, or key phrases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="kb-search-btn" disabled={searching || !searchQuery.trim()}>
                      {searching ? <IconLoader size={16} /> : <IconSearch size={16} />}
                      <span>{searching ? 'Querying...' : 'Semantic Search'}</span>
                    </button>
                  </form>

                  {/* Search Results */}
                  {hasSearched && (
                    <div className="search-results-container" style={{ marginTop: '28px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 className="subsection-title" style={{ margin: 0 }}>
                          Search Results {searchResults.length > 0 && `(${searchResults.length} chunks)`}
                        </h3>
                        {searchResults.length > 0 && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Sorted by similarity match
                          </span>
                        )}
                      </div>

                      {searching ? (
                        <div className="spinner-container" style={{ minHeight: '140px', background: '#101015', borderRadius: '0px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                          <div className="dashboard-spinner"></div>
                          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Generating vector embeddings & scanning HNSW index...</span>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="empty-state" style={{ minHeight: '160px', background: '#101015', borderRadius: '0px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                          <p style={{ color: 'var(--text-secondary)' }}>No matching text chunks found in indexed documents.</p>
                        </div>
                      ) : (
                        <div className="results-list">
                          {searchResults.map((res, i) => (
                            <div key={res.chunk_id || i} className="search-result-card">
                              <div className="result-header">
                                <div className="doc-source-badge">
                                  <IconFile size={14} />
                                  <span style={{ fontWeight: 600, color: '#ffffff' }}>{res.document_name || 'Document'}</span>
                                  <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>(Chunk #{res.chunk_index})</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span className="similarity-badge">
                                    {Math.round((res.similarity || 0) * 100)}% Match
                                  </span>
                                </div>
                              </div>
                              <p className="result-content">{res.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

               {/* AI Assistant RAG Section */}
              {/* Test RAG Section */}
              {activeSection === 'rag-chat' && (
                <motion.div
                  key="rag-chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ maxWidth: '840px', width: '100%', margin: '0 auto' }}
                >

                  {/* BYOK Modal Dropdown */}
                  <AnimatePresence>
                    {showByokModal && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="byok-modal-panel"
                        style={{ marginBottom: '16px', borderRadius: '0px' }}
                      >
                        <div className="byok-header">
                          <h4>Bring Your Own Key (BYOK)</h4>
                          <span className="byok-subtitle">
                            Provide your custom API key for {ragProvider.toUpperCase()} or any compatible LLM endpoint.
                          </span>
                        </div>
                        <div className="byok-input-row">
                          <input
                            type="password"
                            className="search-input"
                            placeholder={`Enter custom ${ragProvider.toUpperCase()} API key...`}
                            value={byokKey}
                            onChange={(e) => setByokKey(e.target.value)}
                            style={{ borderRadius: '0px' }}
                          />
                          {byokKey && (
                            <button className="btn-modal-cancel" onClick={() => setByokKey('')} style={{ borderRadius: '0px' }}>Clear</button>
                          )}
                          <button className="btn-modal-submit" onClick={() => setShowByokModal(false)} style={{ borderRadius: '0px' }}>Save Key</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Chat Container */}
                  <div className="rag-chat-container">
                    <div className="rag-messages-scroll" ref={chatScrollRef}>
                      {ragMessages.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.7, textAlign: 'center', gap: '8px' }}>
                          <IconCpu size={32} style={{ color: 'var(--bronze-highlight)', marginBottom: '8px' }} />
                          <h4 style={{ color: '#fff', margin: 0, fontWeight: 500, fontSize: '0.95rem' }}>RAG Engine Ready</h4>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>Ask any question grounded in your indexed knowledge base.</p>
                        </div>
                      ) : (
                        ragMessages.map((msg, idx) => (
                          <div key={idx} className={`rag-message-wrapper ${msg.role}`}>
                            <div className="rag-message-avatar">
                              {msg.role === 'assistant' ? <IconCpu size={16} /> : 'U'}
                            </div>

                            <div className="rag-message-bubble">
                              <div className="rag-message-content">
                                {renderFormattedMessage(msg.content)}
                                {msg.typing && <span className="typing-cursor">▌</span>}
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {ragLoading && (
                        <div className="rag-message-wrapper assistant">
                          <div className="rag-message-avatar">
                            <IconCpu size={16} />
                          </div>
                          <div className="rag-message-bubble loading" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', minWidth: '56px' }}>
                            <span className="dot-typing"></span>
                            <span className="dot-typing"></span>
                            <span className="dot-typing"></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input Bar */}
                    <form className="rag-input-form" onSubmit={handleSendRagQuery}>
                      <input
                        type="text"
                        className="rag-chat-input"
                        placeholder="Type your query or request..."
                        value={ragInput}
                        onChange={(e) => setRagInput(e.target.value)}
                        disabled={ragLoading}
                        style={{ borderRadius: '0px' }}
                      />
                      <button
                        type="submit"
                        className="rag-send-btn"
                        disabled={!ragInput.trim() || ragLoading}
                        style={{ borderRadius: '0px' }}
                      >
                        {ragLoading ? <IconLoader size={16} /> : <IconSend size={16} />}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Activity Section */}
              {activeSection === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="project-section"
                >
                  <h2 className="section-title">Activity Log</h2>
                  <div className="empty-state">
                    <IconActivity size={32} />
                    <h3>No Activity Yet</h3>
                    <p>Project activity and query logs will appear here as you use the API.</p>
                  </div>
                </motion.div>
              )}

              {/* API Keys Section */}
              {activeSection === 'api-keys' && (
                <motion.div
                  key="api-keys"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="project-section"
                >
                  <h2 className="section-title">API Keys</h2>
                  <div className="empty-state">
                    <IconKey size={32} />
                    <h3>No Project API Keys</h3>
                    <p>Generate API keys scoped to this project for secure access.</p>
                    <button className="btn-create">
                      <IconKey size={14} />
                      <span>Generate Key</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Settings Section */}
              {activeSection === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="project-section"
                  style={{ maxWidth: '820px' }}
                >
                  <h2 className="section-title">Project Settings</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '24px' }}>
                    Manage environment configurations, metadata identifiers, and system parameters for this project.
                  </p>

                  {/* General Configuration */}
                  <div className="settings-card">
                    <div className="settings-card-header">
                      <h3>General Configuration</h3>
                      <span>Basic details and runtime environment settings</span>
                    </div>

                    <div className="settings-form-group">
                      <label className="settings-label">Project Name</label>
                      <input
                        type="text"
                        className="github-input"
                        value={project.name}
                        readOnly
                        style={{ background: '#09090e', cursor: 'default' }}
                      />
                    </div>

                    <div className="settings-form-group">
                      <label className="settings-label">Description</label>
                      <textarea
                        className="github-input"
                        value={project.description || 'No description provided.'}
                        readOnly
                        rows={2}
                        style={{ background: '#09090e', resize: 'none', cursor: 'default' }}
                      />
                    </div>

                    <div className="settings-grid-2">
                      <div className="settings-form-group">
                        <label className="settings-label">Environment</label>
                        <div className="settings-pill-display">
                          <span className={`status-badge ${project.environment?.toLowerCase() === 'production' ? 'active' : 'type'}`}>
                            {project.environment || 'Development'}
                          </span>
                        </div>
                      </div>

                      <div className="settings-form-group">
                        <label className="settings-label">Use Case / Type</label>
                        <div className="settings-pill-display">
                          <span style={{ color: '#ffffff', fontSize: '0.86rem', fontWeight: 500 }}>
                            {project.project_type || 'General AI Assistant'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Identifiers */}
                  <div className="settings-card" style={{ marginTop: '20px' }}>
                    <div className="settings-card-header">
                      <h3>System Identifiers & API Metadata</h3>
                      <span>Unique keys for SDK and backend integration</span>
                    </div>

                    <div className="settings-field-row">
                      <div>
                        <span className="settings-field-title">Project ID</span>
                        <span className="settings-field-sub">Required in RAG query headers</span>
                      </div>
                      <div className="settings-code-box">
                        <code>{project.id}</code>
                        <button
                          className="copy-code-btn"
                          onClick={() => navigator.clipboard.writeText(project.id)}
                          title="Copy Project ID"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="settings-field-row">
                      <div>
                        <span className="settings-field-title">Organization ID</span>
                        <span className="settings-field-sub">Parent organization namespace</span>
                      </div>
                      <div className="settings-code-box">
                        <code>{project.organization_id}</code>
                        <button
                          className="copy-code-btn"
                          onClick={() => navigator.clipboard.writeText(project.organization_id)}
                          title="Copy Organization ID"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="settings-field-row">
                      <div>
                        <span className="settings-field-title">Project Slug</span>
                        <span className="settings-field-sub">URL-safe project identifier</span>
                      </div>
                      <div className="settings-code-box">
                        <code>{project.slug}</code>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="settings-card danger-zone-card" style={{ marginTop: '24px' }}>
                    <div className="settings-card-header">
                      <h3 style={{ color: '#fca5a5' }}>Danger Zone</h3>
                      <span style={{ color: '#f87171' }}>Irreversible workspace operations</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                      Deleting this project will permanently purge all indexed vector embeddings, uploaded files, GitHub repository links, and RAG chat history. This action cannot be undone.
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-danger-delete"
                        onClick={() => alert('Project deletion protection enabled.')}
                      >
                        <IconTrash size={14} />
                        <span>Delete Project</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  )
}
