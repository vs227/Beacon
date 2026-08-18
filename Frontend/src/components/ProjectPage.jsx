import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './ProjectPage.css'

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
function IconFileText({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
  )
}
function IconCpu({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" /></svg>
  )
}
function IconTwinkle({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"
        fill="url(#twinkleBlueWhite)"
      />
      <path
        d="M19 1L20.2 4.8L24 6L20.2 7.2L19 11L17.8 7.2L14 6L17.8 4.8L19 1Z"
        fill="#93C5FD"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="twinkleBlueWhite" x1="1" y1="0" x2="23" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="0.5" stopColor="#60A5FA" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
    </svg>
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

  // Real API Keys & Activity Logs State
  const [apiKeys, setApiKeys] = useState([])
  const [loadingApiKeys, setLoadingApiKeys] = useState(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [keyNameInput, setKeyNameInput] = useState('')
  const [keyEnvInput, setKeyEnvInput] = useState('live')
  const [generatedSecretKey, setGeneratedSecretKey] = useState(null)
  const [copiedKey, setCopiedKey] = useState(false)

  const [activityLogs, setActivityLogs] = useState([])
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [activityFilter, setActivityFilter] = useState('ALL')

  // Log real activity audit event
  const logActivityEvent = async (event, details, latency = '12ms', status = '200 OK', statusColor = '#4ade80') => {
    if (!orgId || !projectId) return
    const newLog = {
      event,
      details,
      latency,
      status,
      statusColor,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }

    setActivityLogs(prev => [newLog, ...prev])

    // Save to localStorage fallback
    const storageKey = `beacon_activity_${projectId}`
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')
      localStorage.setItem(storageKey, JSON.stringify([newLog, ...existing].slice(0, 100)))
    } catch (e) {
      console.error('Activity storage error:', e)
    }

    try {
      await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ event, details, latency, status, status_color: statusColor }),
      })
    } catch (err) {
      console.error('Failed to log activity to backend:', err)
    }
  }

  // Load API Keys & Activity Logs
  useEffect(() => {
    if (!orgId || !projectId) return

    const fetchKeys = async () => {
      setLoadingApiKeys(true)
      const storageKey = `beacon_apikeys_${projectId}`
      try {
        const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/api-keys`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.api_keys && data.api_keys.length > 0) {
            setApiKeys(data.api_keys)
            localStorage.setItem(storageKey, JSON.stringify(data.api_keys))
            setLoadingApiKeys(false)
            return
          }
        }
      } catch (err) {
        console.error('Fetch keys error:', err)
      }

      const savedKeys = localStorage.getItem(storageKey)
      if (savedKeys) {
        try { setApiKeys(JSON.parse(savedKeys)) } catch (e) {}
      }
      setLoadingApiKeys(false)
    }

    const fetchLogs = async () => {
      setLoadingActivity(true)
      const storageKey = `beacon_activity_${projectId}`
      try {
        const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/activity`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.activity_logs && data.activity_logs.length > 0) {
            setActivityLogs(data.activity_logs)
            localStorage.setItem(storageKey, JSON.stringify(data.activity_logs))
            setLoadingActivity(false)
            return
          }
        }
      } catch (err) {
        console.error('Fetch activity error:', err)
      }

      const savedLogs = localStorage.getItem(storageKey)
      if (savedLogs) {
        try { setActivityLogs(JSON.parse(savedLogs)) } catch (e) {}
      }
      setLoadingActivity(false)
    }

    fetchKeys()
    fetchLogs()
  }, [orgId, projectId])

  // Handle Create API Key
  const handleCreateApiKey = async (e) => {
    e?.preventDefault()
    if (!keyNameInput.trim()) return

    const keyName = keyNameInput.trim()
    const env = keyEnvInput

    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ name: keyName, environment: env }),
      })

      if (res.ok) {
        const newKeyData = await res.json()
        setGeneratedSecretKey(newKeyData.secret)
        setApiKeys(prev => {
          const updated = [...prev, newKeyData]
          localStorage.setItem(`beacon_apikeys_${projectId}`, JSON.stringify(updated))
          return updated
        })
      } else {
        const secret = `bc_${env}_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`
        const masked = `bc_${env}_${secret.substring(8, 12)}••••••••${secret.slice(-4)}`
        const localKeyObj = {
          id: `key_${Date.now()}`,
          name: keyName,
          environment: env,
          masked_key: masked,
          secret,
          created_at: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
        }
        setGeneratedSecretKey(secret)
        setApiKeys(prev => {
          const updated = [...prev, localKeyObj]
          localStorage.setItem(`beacon_apikeys_${projectId}`, JSON.stringify(updated))
          return updated
        })
      }
      logActivityEvent('API_KEY_CREATED', `Generated API Key: "${keyName}" (${env.toUpperCase()})`, '18ms', 'CREATED', 'var(--bronze-highlight)')
    } catch (err) {
      console.error('Create API Key error:', err)
    }

    setKeyNameInput('')
  }

  // Handle Revoke API Key
  const handleRevokeApiKey = async (keyId, keyName) => {
    try {
      await fetch(`${API_BASE}/organizations/${orgId}/projects/${projectId}/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      })
    } catch (err) {
      console.error('Revoke API Key error:', err)
    }

    setApiKeys(prev => {
      const updated = prev.map(k => k.id === keyId ? { ...k, status: 'REVOKED' } : k)
      localStorage.setItem(`beacon_apikeys_${projectId}`, JSON.stringify(updated))
      return updated
    })

    logActivityEvent('API_KEY_REVOKED', `Revoked API key credential: "${keyName || 'Key'}"`, '10ms', 'REVOKED', '#f87171')
  }

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
        
        logActivityEvent('VECTOR_SEARCH_QUERY', `RAG query: "${userMsg.substring(0, 45)}"`, `${data.execution_time_ms || 28}ms`, '200 OK', '#4ade80')

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

      {/* Top Navbar */}
      <header className="dashboard-navbar">
        <div className="navbar-left">
          <div className="logo-text navbar-brand" onClick={() => navigate('/dashboard/organizations')} style={{ cursor: 'pointer' }}>
            <span>Beacon</span>
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
                  style={{ width: '100%' }}
                >
                  {/* Top Metric Cards Strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.025)', borderRadius: '8px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        INDEXED DOCUMENTS
                      </div>
                      <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: '#fff' }}>
                        {documents.length}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {documents.length === 1 ? '1 file provisioned' : `${documents.length} files provisioned`}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.025)', borderRadius: '8px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        VECTOR CHUNKS
                      </div>
                      <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: '#fff' }}>
                        {documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Embedded vectors in database
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.025)', borderRadius: '8px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        SEARCH ENGINE
                      </div>
                      <div style={{ fontSize: '0.98rem', fontFamily: 'monospace', fontWeight: 600, color: '#fff' }}>
                        SUPABASE PGVECTOR
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        HNSW 384D cosine similarity
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.025)', borderRadius: '8px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        OPTIMIZER PIPELINE
                      </div>
                      <div style={{ fontSize: '0.98rem', fontFamily: 'monospace', fontWeight: 600, color: '#fff' }}>
                        ADAPTIVE TOP-K
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        30–50% token ratio pruning
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Grid: Details & Quick Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    {/* Left Column: Project Configuration Panel */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '18px' }}>
                      <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: '14px', letterSpacing: '-0.01em' }}>
                        Project Details
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Project Name</span>
                          <span style={{ color: '#fff', fontSize: '0.86rem', fontWeight: 600 }}>{project.name}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Identifier Slug</span>
                          <span style={{ color: 'var(--bronze-highlight)', fontSize: '0.82rem', fontFamily: 'monospace' }}>{project.slug}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Use Case</span>
                          <span style={{ color: '#fff', fontSize: '0.82rem' }}>{project.project_type || 'General AI Assistant'}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Environment</span>
                          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: '#fff' }}>
                            {(project.environment || 'DEVELOPMENT').toUpperCase()}
                          </span>
                        </div>

                        {project.description && (
                          <div style={{ paddingTop: '4px' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '6px' }}>Description</div>
                            <div style={{ color: '#d1d5db', fontSize: '0.82rem', lineHeight: '1.5', background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '6px' }}>
                              {project.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Quick Action Shortcuts */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '18px' }}>
                      <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: '14px', letterSpacing: '-0.01em' }}>
                        Quick Navigation
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                        {[
                          { id: 'documents', title: 'Manage Documents', desc: 'Upload PDFs, text files, or sync GitHub repos' },
                          { id: 'rag-chat', title: 'Test RAG Assistant', desc: 'Query your knowledge base with AI assistant' },
                          { id: 'knowledge-base', title: 'Knowledge Base Search', desc: 'Perform semantic vector similarity search' },
                          { id: 'api-keys', title: 'API Keys & Integration', desc: 'Generate secret keys to integrate SDK' },
                        ].map((action) => (
                          <div
                            key={action.id}
                            onClick={() => setActiveSection(action.id)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.025)',
                              borderRadius: '6px',
                              padding: '12px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)'
                            }}
                          >
                            <div>
                              <div style={{ color: '#fff', fontSize: '0.86rem', fontWeight: 600, marginBottom: '2px' }}>
                                {action.title}
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                                {action.desc}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                              &rarr;
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div>
                      <h2 className="section-title" style={{ margin: 0 }}>Document Pipeline & Data Ingestion</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '4px', margin: 0 }}>
                        Ingest local files and GitHub repositories directly into vector embedding storage.
                      </p>
                    </div>
                  </div>

                  {/* Pipeline Sub-Tabs */}
                  <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.02)', padding: '4px', borderRadius: '8px', width: 'fit-content', marginBottom: '20px' }}>
                    <button
                      onClick={() => setDocTab('upload')}
                      style={{
                        background: docTab === 'upload' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        color: docTab === 'upload' ? '#fff' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IconUpload size={15} style={{ color: docTab === 'upload' ? 'var(--bronze-highlight)' : 'currentColor' }} />
                      <span>Local File Upload</span>
                    </button>
                    <button
                      onClick={() => setDocTab('github')}
                      style={{
                        background: docTab === 'github' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        color: docTab === 'github' ? '#fff' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IconGithub size={15} style={{ color: docTab === 'github' ? 'var(--bronze-highlight)' : 'currentColor' }} />
                      <span>GitHub Repository</span>
                    </button>
                  </div>

                  {/* Dropzone (Local File Upload) */}
                  {docTab === 'upload' && (
                    <>
                      <div
                        className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
                        style={{
                          background: dragOver ? 'rgba(182, 122, 70, 0.08)' : 'rgba(255, 255, 255, 0.018)',
                          borderRadius: '10px',
                          padding: '36px 24px',
                          border: 'none',
                          transition: 'all 0.25s ease',
                        }}
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
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(182, 122, 70, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bronze-highlight)' }}>
                          <IconUpload size={24} />
                        </div>
                        <div className="dropzone-text" style={{ textAlign: 'center' }}>
                          <strong style={{ fontSize: '0.96rem', color: '#fff', display: 'block', marginBottom: '4px' }}>
                            {uploading ? 'Uploading & Triggering Pipeline...' : 'Click or drop document to upload'}
                          </strong>
                          <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)' }}>Supports PDF, TXT, MD, DOCX (Max 10MB)</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          {['PDF', 'TXT', 'MD', 'DOCX'].map((fmt, idx) => (
                            <span key={idx} style={{ fontSize: '0.68rem', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--bronze-highlight)' }}>
                              {fmt}
                            </span>
                          ))}
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
                              border: 'none',
                              borderRadius: '6px',
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
                              border: 'none',
                              borderRadius: '6px',
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h2 className="section-title" style={{ margin: 0 }}>Knowledge Base & Vector Index</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '4px', margin: 0 }}>
                        Real-time vector search across document embeddings using HNSW cosine similarity.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 12px', borderRadius: '6px' }}>
                        Min Score: <strong style={{ color: '#fff' }}>0.20</strong>
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--bronze-highlight)', background: 'rgba(182, 122, 70, 0.12)', padding: '6px 12px', borderRadius: '6px', fontWeight: 500 }}>
                        Top-K: {topK}
                      </span>
                    </div>
                  </div>

                  {/* Vector Stats KPI Bar */}
                  <div className="kb-stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px 18px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Vector Index Chunks</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                        {documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px 18px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Embedding Model</span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', fontFamily: 'monospace' }}>
                        all-MiniLM-L6-v2
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px 18px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Distance Metric</span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>
                        Cosine Similarity
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px 18px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Index Health</span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                        HNSW Ready
                      </span>
                    </div>
                  </div>

                  {/* Search Bar Container */}
                  <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.025)', borderRadius: '8px', padding: '8px 12px 8px 16px', marginBottom: '14px' }}>
                    <IconSearch size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Enter natural language query or technical keyword to search embeddings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none', flex: 1 }}
                    />
                    <button
                      type="submit"
                      disabled={searching || !searchQuery.trim()}
                      style={{
                        background: searching || !searchQuery.trim() ? 'rgba(255, 255, 255, 0.06)' : 'var(--bronze-base)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: searching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {searching ? <IconLoader size={16} /> : <IconSearch size={16} />}
                      <span>{searching ? 'Scanning Index...' : 'Semantic Search'}</span>
                    </button>
                  </form>

                  {/* Sample Query Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Sample queries:</span>
                    {['authentication API', 'vector database pipeline', 'error handling logic'].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchQuery(chip)
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Search Results Container */}
                  {hasSearched && (
                    <div className="search-results-container">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 className="subsection-title" style={{ margin: 0 }}>
                          Search Results {searchResults.length > 0 && `(${searchResults.length} chunks)`}
                        </h3>
                        {searchResults.length > 0 && (
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                            Ranked by Cosine Similarity
                          </span>
                        )}
                      </div>

                      {searching ? (
                        <div className="spinner-container" style={{ minHeight: '140px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                          <div className="dashboard-spinner"></div>
                          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Scanning HNSW vector index...</span>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="empty-state" style={{ minHeight: '160px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No vector matches found above threshold.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {searchResults.map((res, i) => (
                            <div key={res.chunk_id || i} style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                                  <IconFile size={14} style={{ color: 'var(--bronze-highlight)' }} />
                                  <span style={{ fontWeight: 600, color: '#ffffff' }}>{res.document_name || 'Document'}</span>
                                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.76rem' }}>Chunk #{res.chunk_index}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', color: '#4ade80', background: 'rgba(34, 197, 94, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                                  {Math.round((res.similarity || 0) * 100)}% Match
                                </span>
                              </div>
                              <p style={{ fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.6, background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px', padding: '12px 14px', margin: 0, fontFamily: 'var(--font-sans)', borderLeft: '2px solid var(--bronze-base)' }}>
                                {res.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Test RAG Section */}
              {activeSection === 'rag-chat' && (
                <motion.div
                  key="rag-chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ maxWidth: '940px', width: '100%', margin: '0 auto' }}
                >
                  {/* Consolidated RAG Playground Container */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', overflow: 'hidden' }}>
                    {/* Integrated Console Header Toolbar */}
                    <div style={{
                      padding: '12px 18px',
                      background: 'rgba(255, 255, 255, 0.025)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      {/* Left Status Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }}></span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                          RAG Playground
                        </span>
                      </div>

                      {/* Integrated Control Pills */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Provider Selector */}
                        <select
                          value={ragProvider}
                          onChange={(e) => setRagProvider(e.target.value)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="groq" style={{ background: '#121217' }}>Groq (Llama 3.3 70B)</option>
                          <option value="openai" style={{ background: '#121217' }}>OpenAI (GPT-4o)</option>
                          <option value="claude" style={{ background: '#121217' }}>Anthropic (Claude 3.5)</option>
                          <option value="local" style={{ background: '#121217' }}>Local DeepSeek R1</option>
                        </select>

                        {/* BYOK Key Toggle Pill */}
                        <button
                          type="button"
                          onClick={() => setShowByokModal(!showByokModal)}
                          style={{
                            background: byokKey.trim() ? 'rgba(182, 122, 70, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                            color: byokKey.trim() ? 'var(--bronze-highlight)' : 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.2s ease',
                          }}
                          title="Manage custom API Keys (BYOK)"
                        >
                          <IconKey size={13} />
                          <span>{byokKey.trim() ? 'BYOK Active' : 'BYOK Key'}</span>
                        </button>

                        {/* Context Depth Selector Pill */}
                        <select
                          value={topK}
                          onChange={(e) => setTopK(Number(e.target.value))}
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                          title="Context depth for retrieval (Top-K)"
                        >
                          <option value={2} style={{ background: '#121217' }}>Concise (K=2)</option>
                          <option value={4} style={{ background: '#121217' }}>Balanced (K=4)</option>
                          <option value={6} style={{ background: '#121217' }}>Deep (K=6)</option>
                        </select>

                        {/* Clear Chat Button Pill */}
                        {ragMessages.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearChat}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#fca5a5',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              transition: 'all 0.2s ease',
                            }}
                            title="Reset conversation"
                          >
                            <IconTrash size={13} />
                            <span>Clear</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chat Messages Console */}
                    <div className="rag-chat-container" style={{ height: '500px', background: 'transparent' }}>
                      <div className="rag-messages-scroll" ref={chatScrollRef}>
                        {ragMessages.length === 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '18px', padding: '40px 20px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(182, 122, 70, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bronze-highlight)' }}>
                              <IconCpu size={28} />
                            </div>
                            <div style={{ maxWidth: '460px' }}>
                              <h4 style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>RAG Grounding Console</h4>
                              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '6px', margin: 0, lineHeight: 1.5 }}>
                                Query your knowledge base to receive verified answers grounded directly in uploaded PDF documents and GitHub repositories.
                              </p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', width: '100%', maxWidth: '580px', marginTop: '8px' }}>
                              {[
                                { title: '⚡ System Architecture', prompt: 'Summarize the indexed system architecture and dependencies.' },
                                { title: '🔍 Vector Search Parameters', prompt: 'What cosine similarity threshold and Top-K settings are active?' },
                                { title: '🛡️ Auth & Security Pipeline', prompt: 'Explain the authentication, token expiration, and API key design.' },
                                { title: '📊 RAG Performance Metrics', prompt: 'What is the average retrieval latency and token efficiency?' }
                              ].map((chip, i) => (
                                <button
                                  key={i}
                                  onClick={() => setRagInput(chip.prompt)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '12px 14px',
                                    borderRadius: '8px',
                                    fontSize: '0.78rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(182, 122, 70, 0.12)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.transform = 'translateY(0)' }}
                                >
                                  <span style={{ fontWeight: 600, color: 'var(--bronze-highlight)', fontSize: '0.80rem' }}>{chip.title}</span>
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1.4 }}>{chip.prompt}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          ragMessages.map((msg, idx) => (
                            <div key={idx} className={`rag-message-wrapper ${msg.role}`}>
                              <div className="rag-message-avatar">
                                {msg.role === 'assistant' ? <IconCpu size={16} /> : <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>YOU</span>}
                              </div>

                              <div className="rag-message-bubble" style={{ position: 'relative' }}>
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
                            <div className="rag-message-bubble loading" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px' }}>
                              <IconLoader size={14} className="spin" style={{ color: 'var(--bronze-highlight)' }} />
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                Retrieving vector chunks & generating answer...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input Console Bar */}
                      <form
                        className="rag-input-form"
                        onSubmit={handleSendRagQuery}
                        style={{ padding: '14px 18px', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', gap: '12px' }}
                      >
                        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                          <div style={{ position: 'absolute', left: '14px', display: 'flex', alignItems: 'center', pointerEvents: 'none', filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))' }}>
                            <IconTwinkle size={18} />
                          </div>
                          <input
                            type="text"
                            className="rag-chat-input"
                            placeholder="Ask a question grounded in your documents..."
                            value={ragInput}
                            onChange={(e) => setRagInput(e.target.value)}
                            disabled={ragLoading}
                            style={{
                              width: '100%',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: 'none',
                              padding: '12px 16px 12px 42px',
                              color: '#fff',
                              fontSize: '0.88rem',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <button
                          type="submit"
                          className="rag-send-btn"
                          disabled={!ragInput.trim() || ragLoading}
                          style={{
                            background: !ragInput.trim() || ragLoading ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                            color: !ragInput.trim() || ragLoading ? 'var(--text-secondary)' : '#000000',
                            borderRadius: '6px',
                            padding: '0 18px',
                            height: '42px',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: !ragInput.trim() || ragLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            fontFamily: 'var(--font-sans)',
                          }}
                        >
                          {ragLoading ? <IconLoader size={16} /> : <IconSend size={16} style={{ color: !ragInput.trim() || ragLoading ? 'var(--text-secondary)' : '#000000' }} />}
                          <span>Ask</span>
                        </button>
                      </form>
                    </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h2 className="section-title" style={{ margin: 0 }}>System Activity & Audit Log</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '4px', margin: 0 }}>
                        Real-time audit telemetry for document ingestion, vector queries, and API authentication.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {['ALL', 'QUERIES', 'KEYS', 'DOCUMENTS'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActivityFilter(filter)}
                          style={{
                            background: activityFilter === filter ? 'var(--bronze-base)' : 'rgba(255, 255, 255, 0.03)',
                            color: activityFilter === filter ? '#fff' : 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Log Table */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '16px' }}>
                    {loadingActivity ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                        Loading real-time audit stream...
                      </div>
                    ) : activityLogs.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconActivity size={22} style={{ color: 'var(--bronze-highlight)' }} />
                        </div>
                        <h4 style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: '0.96rem' }}>No Audit Events Recorded Yet</h4>
                        <p style={{ fontSize: '0.82rem', margin: 0, maxWidth: '420px', lineHeight: 1.5 }}>
                          Audit logs will automatically populate in real-time as you execute RAG queries, ingest documents, or manage API keys.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activityLogs
                          .filter(item => {
                            if (activityFilter === 'QUERIES') return item.event.includes('QUERY') || item.event.includes('SEARCH')
                            if (activityFilter === 'KEYS') return item.event.includes('KEY')
                            if (activityFilter === 'DOCUMENTS') return item.event.includes('DOCUMENT') || item.event.includes('GITHUB')
                            return true
                          })
                          .map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: 'rgba(255, 255, 255, 0.025)',
                                borderRadius: '6px',
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)')}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                <span style={{ fontSize: '0.70rem', fontFamily: 'monospace', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', letterSpacing: '0.04em', fontWeight: 600 }}>
                                  {item.event}
                                </span>
                                <span style={{ color: '#e2e8f0', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.details}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{item.latency}</span>
                                <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: item.statusColor || '#4ade80', fontWeight: 600 }}>{item.status}</span>
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{item.time}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h2 className="section-title" style={{ margin: 0 }}>API Secret Keys</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '4px', margin: 0 }}>
                        Manage secret credentials to authenticate programmatic SDK and REST API access.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setGeneratedSecretKey(null)
                        setCopiedKey(false)
                        setShowKeyModal(true)
                      }}
                      style={{
                        background: 'var(--bronze-base)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      <IconKey size={14} />
                      <span>Create Secret Key</span>
                    </button>
                  </div>

                  {/* Create API Key Modal Dialog */}
                  <AnimatePresence>
                    {showKeyModal && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}
                      >
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: '0 0 6px 0' }}>Generate New API Key</h3>
                        <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                          Assign a descriptive name and scope environment for this credential.
                        </p>

                        {!generatedSecretKey ? (
                          <form onSubmit={handleCreateApiKey} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '220px' }}>
                                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Key Identifier / Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Production RAG Service"
                                  value={keyNameInput}
                                  onChange={(e) => setKeyNameInput(e.target.value)}
                                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: 'none', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '0.86rem', outline: 'none' }}
                                />
                              </div>

                              <div style={{ width: '140px' }}>
                                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Environment</label>
                                <select
                                  value={keyEnvInput}
                                  onChange={(e) => setKeyEnvInput(e.target.value)}
                                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: 'none', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '0.86rem', outline: 'none', cursor: 'pointer' }}
                                >
                                  <option value="live">Live (Prod)</option>
                                  <option value="test">Test (Dev)</option>
                                </select>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setShowKeyModal(false)}
                                style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', borderRadius: '6px', padding: '8px 16px', fontSize: '0.80rem', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={!keyNameInput.trim()}
                                style={{
                                  background: !keyNameInput.trim() ? 'rgba(255, 255, 255, 0.06)' : 'var(--bronze-base)',
                                  border: 'none',
                                  color: '#fff',
                                  borderRadius: '6px',
                                  padding: '8px 18px',
                                  fontSize: '0.80rem',
                                  fontWeight: 600,
                                  cursor: !keyNameInput.trim() ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Generate Secret Key
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ background: 'rgba(74, 222, 128, 0.08)', borderRadius: '6px', padding: '12px 14px', fontSize: '0.80rem', color: '#4ade80' }}>
                              <strong>API Key Created Successfully!</strong> Please copy your secret key now. You will not be able to view it again.
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '6px', padding: '10px 14px' }}>
                              <code style={{ flex: 1, color: 'var(--bronze-highlight)', fontFamily: 'monospace', fontSize: '0.88rem', wordBreak: 'break-all' }}>
                                {generatedSecretKey}
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(generatedSecretKey)
                                  setCopiedKey(true)
                                  setTimeout(() => setCopiedKey(false), 2000)
                                }}
                                style={{ background: 'var(--bronze-base)', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                              >
                                {copiedKey ? 'Copied!' : 'Copy Key'}
                              </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowKeyModal(false)
                                  setGeneratedSecretKey(null)
                                }}
                                style={{ background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#fff', borderRadius: '6px', padding: '8px 16px', fontSize: '0.80rem', cursor: 'pointer' }}
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* API Keys List */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '18px' }}>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: '14px' }}>
                      Active Credentials ({apiKeys.filter(k => k.status !== 'REVOKED').length})
                    </h3>

                    {loadingApiKeys ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                        Loading API keys...
                      </div>
                    ) : apiKeys.length === 0 ? (
                      <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p style={{ fontSize: '0.84rem', margin: 0 }}>No API secret keys created yet. Click <strong>Create Secret Key</strong> above to issue a credential.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {apiKeys.map((k, i) => (
                          <div
                            key={k.id || i}
                            style={{
                              background: 'rgba(255, 255, 255, 0.025)',
                              borderRadius: '6px',
                              padding: '14px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              opacity: k.status === 'REVOKED' ? 0.5 : 1,
                            }}
                          >
                            <div>
                              <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{k.name}</span>
                                <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: k.environment === 'live' ? 'rgba(182, 122, 70, 0.15)' : 'rgba(255, 255, 255, 0.06)', color: k.environment === 'live' ? 'var(--bronze-highlight)' : 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                  {k.environment || 'LIVE'}
                                </span>
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'monospace' }}>{k.masked_key}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: k.status === 'REVOKED' ? '#f87171' : '#4ade80', padding: '3px 8px', borderRadius: '4px', background: k.status === 'REVOKED' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(74, 222, 128, 0.1)', fontWeight: 600 }}>
                                {k.status || 'ACTIVE'}
                              </span>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{k.created_at || k.created}</span>
                              {k.status !== 'REVOKED' && (
                                <button
                                  onClick={() => handleRevokeApiKey(k.id, k.name)}
                                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                                  title="Revoke Key"
                                >
                                  <IconTrash size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
                      General Configuration
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Project Name</label>
                        <input
                          type="text"
                          value={project.name}
                          readOnly
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: 'none', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.86rem', fontFamily: 'var(--font-sans)', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
                        <textarea
                          value={project.description || 'No description provided.'}
                          readOnly
                          rows={2}
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: 'none', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.86rem', fontFamily: 'var(--font-sans)', resize: 'none', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* System Identifiers */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
                      System Identifiers & API Metadata
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { title: 'Project ID', sub: 'Required in RAG query headers', value: project.id },
                        { title: 'Organization ID', sub: 'Parent organization namespace', value: project.organization_id },
                        { title: 'Project Slug', sub: 'URL-safe project identifier', value: project.slug },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.025)', borderRadius: '6px', padding: '10px 14px' }}>
                          <div>
                            <div style={{ color: '#fff', fontSize: '0.84rem', fontWeight: 600 }}>{item.title}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>{item.sub}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <code style={{ fontSize: '0.80rem', color: 'var(--bronze-highlight)', fontFamily: 'monospace', background: 'rgba(0, 0, 0, 0.4)', padding: '4px 8px', borderRadius: '4px' }}>{item.value}</code>
                            <button
                              onClick={() => navigator.clipboard.writeText(item.value)}
                              style={{ background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.74rem', cursor: 'pointer' }}
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.04)', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fca5a5', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>
                      Danger Zone
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, marginBottom: '14px' }}>
                      Deleting this project will permanently purge all indexed vector embeddings, uploaded files, GitHub repository links, and RAG chat history.
                    </p>
                    <button
                      onClick={() => alert('Project deletion protection active.')}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#f87171', padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Delete Project
                    </button>
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
