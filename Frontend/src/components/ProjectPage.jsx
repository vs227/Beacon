import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LandingHeader from './landing/LandingHeader'
import { StructureFlowCollection } from './ui/StructureFlowCollection'
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
function IconLock({ size = 16, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
  )
}
function IconPlus({ size = 16, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
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
function IconZap({ size = 16, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
  )
}
function IconSend({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
  )
}
function IconUser({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
  )
}
function IconRefresh({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
  )
}
function IconX({ size = 16, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
  const [tokenUsageLogs, setTokenUsageLogs] = useState([])
  const [ragInput, setRagInput] = useState('')
  const [ragLoading, setRagLoading] = useState(false)
  const [ragProvider, setRagProvider] = useState('groq')
  const [byokKey, setByokKey] = useState(() => localStorage.getItem('beacon_byok_key') || '')
  const [showByokModal, setShowByokModal] = useState(false)
  const [topK, setTopK] = useState(4)
  const [nowTimestamp, setNowTimestamp] = useState(Date.now())

  // Real-time 1-second ticker to decay tokens automatically as 60s passes
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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
        try { setApiKeys(JSON.parse(savedKeys)) } catch (e) { }
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
        try { setActivityLogs(JSON.parse(savedLogs)) } catch (e) { }
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
      logActivityEvent('API_KEY_CREATED', `Generated API Key: "${keyName}" (${env.toUpperCase()})`, '18ms', 'CREATED', '#ffffff')
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
  const ragInputRef = useRef(null)
  const messagesEndRef = useRef(null)

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
    setTimeout(() => ragInputRef.current?.focus(), 50)
  }

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant', block: 'end' })
    }
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [])

  // Always auto-scroll chat to bottom as messages arrive, type out, or when switching tabs
  useEffect(() => {
    if (activeSection === 'rag-chat') {
      scrollToBottom()
      const t1 = setTimeout(scrollToBottom, 50)
      const t2 = setTimeout(scrollToBottom, 150)
      const t3 = setTimeout(scrollToBottom, 350)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
  }, [ragMessages, ragLoading, activeSection, scrollToBottom])

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
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', lineHeight: '1.4' }}>•</span>
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

  // High-Speed Smooth Live Typing Animation (60fps chunked rendering)
  const typeTextHumanLike = async (fullText, assistantIndex) => {
    if (!fullText) return

    let idx = 0
    const totalLen = fullText.length
    // Chunk size dynamically scales with response length for uniform high speed (4-10 chars per frame step)
    const chunkSize = Math.max(4, Math.ceil(totalLen / 50))

    while (idx < totalLen) {
      idx = Math.min(totalLen, idx + chunkSize)
      const currentText = fullText.slice(0, idx)

      setRagMessages(prev => {
        const copy = [...prev]
        if (copy[assistantIndex]) {
          copy[assistantIndex] = { ...copy[assistantIndex], content: currentText, typing: idx < totalLen }
        }
        return copy
      })

      // Fast, non-laggy frame delay (10ms)
      await new Promise(res => setTimeout(res, 10))
    }

    setRagMessages(prev => {
      const copy = [...prev]
      if (copy[assistantIndex]) {
        copy[assistantIndex] = { ...copy[assistantIndex], content: fullText, typing: false }
      }
      return copy
    })
  }

  // Derived token telemetry (Tokens Per Minute — 60s rolling window)
  const lastAssistantMessage = [...ragMessages].reverse().find(m => m.role === 'assistant' && m.tokens)
  const lastQueryTokens = lastAssistantMessage ? lastAssistantMessage.tokens : null

  // Rolling 1-minute (60s) Tokens Per Minute (TPM) calculation using persistent token log history
  const recent1MinUsage = tokenUsageLogs.filter(
    item => item.timestamp && (nowTimestamp - item.timestamp < 60000)
  )
  const tpmFromLogs = recent1MinUsage.reduce((sum, item) => sum + (item.tokens || 0), 0)

  // Fallback to ragMessages for initial stored messages
  const recent1MinMessages = ragMessages.filter(
    m => m.role === 'assistant' && m.tokens && m.timestamp && (nowTimestamp - m.timestamp < 60000)
  )
  const tpmFromMessages = recent1MinMessages.reduce((sum, msg) => sum + (msg.tokens?.total_tokens || 0), 0)
  const tpmTokens = Math.max(tpmFromLogs, tpmFromMessages)

  const TPM_LIMIT = 6000

  const isGenerating = ragLoading || ragMessages.some(m => m.typing)
  const isFreeTier = !byokKey.trim() && ragProvider !== 'gemini'
  const isChatLocked = isFreeTier && (tpmTokens >= TPM_LIMIT)

  // Always default focus to input box when on RAG chat tab or when generation completes
  useEffect(() => {
    if (activeSection === 'rag-chat' && !isGenerating && !isChatLocked) {
      const timer = setTimeout(() => {
        ragInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [activeSection, isGenerating, isChatLocked])

  // Handle RAG AI Query
  const handleSendRagQuery = async (e) => {
    e?.preventDefault()
    if (!ragInput.trim() || ragLoading || isGenerating || isChatLocked) return

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

        // Clean raw technical error strings into user-friendly admin notification
        let cleanAnswer = fullAnswer
        if (cleanAnswer.includes('LLM generation failed') || cleanAnswer.includes('rate limit') || cleanAnswer.includes('Tokens/Min')) {
          cleanAnswer = '⚠️ Token limit reached. Please contact your administrator to upgrade tokens or add a BYOK API key.'
        }

        // Track token usage in persistent rolling log (decoupled from visible chat history)
        if (data.token_usage?.total_tokens) {
          setTokenUsageLogs(prev => [
            ...prev.filter(item => Date.now() - item.timestamp < 60000),
            { timestamp: Date.now(), tokens: data.token_usage.total_tokens }
          ])
        }

        // Hide loading spinner immediately before adding assistant response
        setRagLoading(false)

        setRagMessages(prev => {
          const assistantIndex = prev.length
          setTimeout(() => typeTextHumanLike(cleanAnswer, assistantIndex), 0)
          return [
            ...prev,
            {
              role: 'assistant',
              content: '',
              typing: true,
              timestamp: Date.now(),
              sources: data.sources || [],
              confidence: data.confidence_score,
              provider: data.provider_used,
              model: data.model_used,
              tokens: data.token_usage,
              executionTime: data.execution_time_ms,
            }
          ]
        })
      } else {
        const err = await res.json()
        setRagLoading(false)
        setRagMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: '⚠️ Token limit reached. Please contact your administrator to upgrade tokens or add a BYOK API key.',
            sources: [],
          }
        ])
      }
    } catch (err) {
      setRagMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Token limit reached. Please contact your administrator.',
          sources: [],
        }
      ])
    } finally {
      setRagLoading(false)
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

      {/* Dynamic 3D Crisp White Nebula Background Layer for all sections EXCEPT Test RAG */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          opacity: activeSection !== 'rag-chat' ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'opacity',
        }}
      >
        <StructureFlowCollection
          variant="nebula"
          hue={0}
          saturation={0}
          brightness={0.55}
          style={{ filter: 'brightness(1.0) contrast(1.1)' }}
        />
        {/* Soft Ambient White Tint & Dark Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.70) 100%), radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Dynamic 3D Original Cosmic Violet Nebula Background Layer SPECIFICALLY for Test RAG section */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          opacity: activeSection === 'rag-chat' ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'opacity',
        }}
      >
        <StructureFlowCollection
          variant="nebula"
          hue={0}
          saturation={0.92}
          brightness={0.53}
        />
        {/* Soft Ambient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.65) 100%), radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.75) 100%)',
          }}
        />
      </div>

      {/* Top Floating Landing-Style Navbar with Project Tabs */}
      <LandingHeader
        auth={auth}
        isDashboard={true}
        activeTab={activeSection}
        navItems={navItems}
        onSelectTab={setActiveSection}
        projectName={project?.name}
        onNavigate={navigate}
      />

      {/* Main Content Area */}
      <main style={{
        width: '100%',
        padding: '110px 32px 32px 32px',
        boxSizing: 'border-box',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        overflowY: activeSection === 'rag-chat' ? 'hidden' : 'auto'
      }}>
        {/* Back to Projects Link */}
        <div style={{ maxWidth: '1080px', width: '100%', margin: '0 auto 36px auto', flexShrink: 0 }}>
          <button
            onClick={() => navigate(`/dashboard/org/${orgId}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.45)',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: 0,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)')}
          >
            <IconArrowLeft size={14} />
            <span>Back to Projects</span>
          </button>
        </div>

        {/* Centered Container for Project Details & Tabs */}
        <div style={{
          maxWidth: '1080px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: activeSection === 'rag-chat' ? 'hidden' : 'visible'
        }}>

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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{ width: '100%' }}
                >
                  {/* Top Metric Strip - Minimal Horizontal Telemetry Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '36px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '24px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                        INDEXED DOCUMENTS
                      </div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {documents.length} FILES
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />

                    <div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                        VECTOR CHUNKS
                      </div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)} EMBEDDINGS
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />

                    <div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                        VECTOR DATABASE
                      </div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        SUPABASE PGVECTOR
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />

                    <div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                        OPTIMIZER PIPELINE
                      </div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        ADAPTIVE TOP-K (384D)
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Grid: Details & Quick Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px' }}>
                    {/* Left Column: Project Configuration Panel - Flat Layout */}
                    <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.05)', paddingLeft: '18px' }}>
                      <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '14px', letterSpacing: '-0.01em' }}>
                        Project Details
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif' }}>Project Name</span>
                          <span style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>{project.name}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif' }}>Identifier Slug</span>
                          <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.82rem', fontFamily: 'monospace' }}>{project.slug}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif' }}>Use Case</span>
                          <span style={{ color: '#fff', fontSize: '0.84rem', fontFamily: 'Outfit, sans-serif' }}>{project.project_type || 'General AI Assistant'}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif' }}>Environment</span>
                          <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', background: 'rgba(255, 255, 255, 0.06)', color: '#fff', letterSpacing: '0.08em' }}>
                            {(project.environment || 'DEVELOPMENT').toUpperCase()}
                          </span>
                        </div>

                        {project.description && (
                          <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>Description</div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.84rem', fontFamily: 'Outfit, sans-serif', lineHeight: '1.5' }}>
                              {project.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Quick Action Shortcuts - Flat Layout */}
                    <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.05)', paddingLeft: '18px' }}>
                      <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '14px', letterSpacing: '-0.01em' }}>
                        Quick Navigation
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                              padding: '12px 0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              transition: 'opacity 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.75'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1'
                            }}
                          >
                            <div>
                              <div style={{ color: '#fff', fontSize: '0.86rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: '2px' }}>
                                {action.title}
                              </div>
                              <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif' }}>
                                {action.desc}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'Outfit, sans-serif' }}>
                              ➔
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="project-section"
                >


                  {/* Pipeline Sub-Tabs */}
                  <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.025)', padding: '4px', borderRadius: '100px', width: 'fit-content', marginBottom: '24px' }}>
                    <button
                      onClick={() => setDocTab('upload')}
                      style={{
                        background: docTab === 'upload' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                        color: docTab === 'upload' ? '#fff' : 'rgba(255, 255, 255, 0.45)',
                        border: 'none',
                        borderRadius: '100px',
                        padding: '8px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        fontFamily: 'Outfit, sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IconUpload size={15} style={{ color: docTab === 'upload' ? '#fff' : 'currentColor' }} />
                      <span>Local File Upload</span>
                    </button>
                    <button
                      onClick={() => setDocTab('github')}
                      style={{
                        background: docTab === 'github' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                        color: docTab === 'github' ? '#fff' : 'rgba(255, 255, 255, 0.45)',
                        border: 'none',
                        borderRadius: '100px',
                        padding: '8px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        fontFamily: 'Outfit, sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IconGithub size={15} style={{ color: docTab === 'github' ? '#fff' : 'currentColor' }} />
                      <span>GitHub Repository</span>
                    </button>
                  </div>

                  {/* Dropzone (Local File Upload) */}
                  {docTab === 'upload' && (
                    <>
                      <div
                        className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
                        style={{
                          background: dragOver ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '16px',
                          padding: '36px 24px',
                          border: '1px dashed rgba(255, 255, 255, 0.12)',
                          transition: 'all 0.25s ease',
                          cursor: 'pointer',
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
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <IconUpload size={22} />
                        </div>
                        <div className="dropzone-text" style={{ textAlign: 'center' }}>
                          <strong style={{ fontSize: '0.92rem', fontFamily: 'Outfit, sans-serif', color: '#fff', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                            {uploading ? 'Uploading & Triggering Pipeline...' : 'Click or drop document to upload'}
                          </strong>
                          <span style={{ fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)' }}>Supports PDF, TXT, MD, DOCX (Max 10MB)</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          {['PDF', 'TXT', 'MD', 'DOCX'].map((fmt, idx) => (
                            <span key={idx} style={{ fontSize: '0.66rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.7)' }}>
                              {fmt}
                            </span>
                          ))}
                        </div>
                      </div>

                      {uploadError && (
                        <div className="upload-error" style={{ background: 'rgba(239, 68, 68, 0.12)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#f87171', fontFamily: 'Outfit, sans-serif' }}>
                          <IconAlertCircle size={16} />
                          <span>{uploadError}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* GitHub Repository Pipeline */}
                  {docTab === 'github' && (
                    <div className="github-scan-card" style={{ width: '100%' }}>

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
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '10px 14px',
                            }}>
                              <IconSearch size={16} style={{ color: 'rgba(255, 255, 255, 0.45)' }} />
                              <input
                                type="text"
                                value={repoSearchFilter}
                                onChange={(e) => setRepoSearchFilter(e.target.value)}
                                style={{
                                  flex: 1,
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  color: '#fff',
                                  fontSize: '0.88rem',
                                  fontFamily: 'Outfit, sans-serif',
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={fetchUserRepos}
                              disabled={loadingRepos}
                              style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: 'none',
                                borderRadius: '100px',
                                color: '#fff',
                                padding: '10px 18px',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                fontFamily: 'Outfit, sans-serif',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                whiteSpace: 'nowrap',
                              }}
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
                                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.6)', display: 'inline-block' }}></span>
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
                          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '18px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', display: 'block', marginBottom: '10px' }}>
                              Or paste a repository URL manually
                            </span>
                            <form onSubmit={handleScanGithubRepo} className="github-url-form" style={{ display: 'flex', gap: '10px' }}>
                              <input
                                type="text"
                                className="github-input"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                style={{
                                  flex: 1,
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: 'none',
                                  borderRadius: '12px',
                                  padding: '10px 14px',
                                  color: '#fff',
                                  fontFamily: 'Outfit, sans-serif',
                                  fontSize: '0.86rem',
                                  outline: 'none',
                                }}
                              />
                              <button
                                type="submit"
                                disabled={scanningGithub}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  border: 'none',
                                  borderRadius: '100px',
                                  color: '#fff',
                                  padding: '10px 20px',
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  fontFamily: 'Outfit, sans-serif',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {scanningGithub ? <IconLoader size={16} /> : <IconGithub size={16} />}
                                <span>{scanningGithub ? 'Scanning...' : 'Scan'}</span>
                              </button>
                            </form>
                          </div>
                        </>
                      )}

                      {/* ── Non-GitHub users: original URL paste flow ── */}
                      {!isGithubUser && !githubScanResult && (
                        <form onSubmit={handleScanGithubRepo} className="github-url-form" style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="text"
                            className="github-input"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            style={{
                              flex: 1,
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '10px 14px',
                              color: '#fff',
                              fontFamily: 'Outfit, sans-serif',
                              fontSize: '0.86rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="submit"
                            disabled={scanningGithub}
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: 'none',
                              borderRadius: '100px',
                              color: '#fff',
                              padding: '10px 20px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              fontFamily: 'Outfit, sans-serif',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {scanningGithub ? <IconLoader size={16} /> : <IconGithub size={16} />}
                            <span>{scanningGithub ? 'Scanning Tree...' : 'Scan Repository'}</span>
                          </button>
                        </form>
                      )}

                      {/* Scanning spinner */}
                      {scanningGithub && (
                        <div className="spinner-container" style={{ minHeight: '120px', marginTop: '16px' }}>
                          <div className="dashboard-spinner"></div>
                          <span style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif' }}>Scanning repository tree...</span>
                        </div>
                      )}

                      {githubError && (
                        <div className="upload-error" style={{ marginTop: '14px', background: 'rgba(239, 68, 68, 0.12)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#f87171', fontFamily: 'Outfit, sans-serif' }}>
                          <IconAlertCircle size={16} />
                          <span>{githubError}</span>
                        </div>
                      )}

                      {/* ── Step 2: Detected Files Tree Selector ── */}
                      {githubScanResult && (
                        <div className="github-tree-container" style={{ background: 'transparent', border: 'none', padding: 0 }}>
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
                                color: 'rgba(255, 255, 255, 0.45)',
                                cursor: 'pointer',
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: '0.78rem',
                                fontWeight: 500,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                padding: '0 0 16px 0',
                                transition: 'color 0.2s ease',
                              }}
                              onClick={() => { setGithubScanResult(null); setGithubUrl(''); }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)')}
                            >
                              <IconArrowLeft size={13} />
                              <span>Back to repositories</span>
                            </button>
                          )}

                          <div className="github-tree-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '14px', marginBottom: '14px' }}>
                            <div>
                              <span className="github-tree-title" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.94rem' }}>
                                {githubScanResult.owner}/{githubScanResult.repo} ({githubScanResult.branch} @ {githubScanResult.commit_sha})
                              </span>
                              <span className="doc-meta" style={{ fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.78rem', marginLeft: '10px' }}>
                                Detected {githubScanResult.total_detected} supported files
                              </span>
                            </div>
                            <div className="github-tree-actions" style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (githubScanResult) {
                                    const mdOnly = githubScanResult.files.filter(f => f.extension === 'md' || f.path.toLowerCase().endsWith('.md')).map(f => f.path);
                                    setSelectedGithubFiles(mdOnly);
                                  }
                                }}
                                style={{ background: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', cursor: 'pointer' }}
                              >
                                Select .md Only
                              </button>
                              <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
                              <button
                                type="button"
                                onClick={() => handleSelectAllGithubFiles(true)}
                                style={{ background: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', cursor: 'pointer' }}
                              >
                                Select All
                              </button>
                              <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
                              <button
                                type="button"
                                onClick={() => handleSelectAllGithubFiles(false)}
                                style={{ background: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', cursor: 'pointer' }}
                              >
                                Clear All
                              </button>
                            </div>
                          </div>

                          <div className="github-file-list" style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '14px', padding: '8px', border: 'none', maxHeight: '340px', overflowY: 'auto' }}>
                            {githubScanResult.files.map((file) => {
                              const isChecked = selectedGithubFiles.includes(file.path)
                              return (
                                <div
                                  key={file.path}
                                  className="github-file-row"
                                  onClick={() => handleToggleGithubFile(file.path)}
                                  style={{ background: isChecked ? 'rgba(255, 255, 255, 0.04)' : 'transparent', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer' }}
                                >
                                  <div className="github-file-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                      type="checkbox"
                                      className="github-checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleGithubFile(file.path)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="github-file-path" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.84rem', color: '#fff' }}>{file.path}</span>
                                  </div>
                                  <div className="github-file-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '0.70rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', background: 'rgba(255, 255, 255, 0.06)', color: '#fff', textTransform: 'uppercase' }}>
                                      {file.extension}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)' }}>
                                      {formatBytes(file.size_bytes)}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className="github-import-footer" style={{ marginTop: '18px' }}>
                            <button
                              type="button"
                              disabled={importingGithub || selectedGithubFiles.length === 0}
                              onClick={handleImportGithubFiles}
                              style={{
                                width: 'auto',
                                background: 'rgba(255, 255, 255, 0.88)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '100px',
                                padding: '12px 24px',
                                fontSize: '0.84rem',
                                fontWeight: 600,
                                fontFamily: 'Outfit, sans-serif',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
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
                    <h3 className="subsection-title" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                      Indexed Documents & Repositories ({documents.length})
                    </h3>

                    {loadingDocs ? (
                      <div className="spinner-container">
                        <div className="dashboard-spinner"></div>
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="empty-state" style={{ minHeight: '160px', background: 'transparent', textAlign: 'center', padding: '30px 0' }}>
                        <IconFile size={24} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '8px' }} />
                        <p style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)' }}>No documents or repositories indexed yet. Upload a file or connect GitHub above.</p>
                      </div>
                    ) : (
                      <div className="doc-table" style={{ display: 'flex', flexDirection: 'column' }}>
                        {documents.map((doc) => (
                          <div key={doc.id} className="doc-row" style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            padding: '14px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                            <div className="doc-info" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              {doc.file_type === 'github' ? <IconGithub size={18} style={{ color: '#fff' }} /> : <IconFile size={18} style={{ color: '#fff' }} />}
                              <div>
                                <span className="doc-name" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.88rem', color: '#fff', display: 'block' }}>{doc.file_name}</span>
                                <span className="doc-meta" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                                  {doc.file_size_bytes > 0 ? formatBytes(doc.file_size_bytes) + ' • ' : ''}
                                  {doc.chunk_count || 0} chunks • {formatDate(doc.created_at)}
                                </span>
                                {doc.status === 'failed' && doc.error_message && (
                                  <span style={{ color: '#fca5a5', fontSize: '0.75rem', fontFamily: 'Outfit, sans-serif', display: 'block', marginTop: '4px' }}>
                                    Error: {doc.error_message}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="doc-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {/* Sync Now Button for GitHub repos */}
                              {doc.file_type === 'github' && (
                                <button
                                  className="sync-repo-btn"
                                  disabled={syncingRepoUrl === doc.storage_path}
                                  onClick={() => handleSyncGithubRepo(doc.storage_path)}
                                  title="Check latest GitHub commit & re-index"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: 'none',
                                    borderRadius: '100px',
                                    color: '#fff',
                                    padding: '6px 14px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    fontFamily: 'Outfit, sans-serif',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <IconRefresh size={12} className={syncingRepoUrl === doc.storage_path ? 'spin-icon' : ''} />
                                  <span>{syncingRepoUrl === doc.storage_path ? 'Syncing...' : 'Sync Now'}</span>
                                </button>
                              )}

                              {/* Status Badge */}
                              <span className={`doc-status-badge ${doc.status}`} style={{
                                fontSize: '0.72rem',
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 600,
                                padding: '4px 10px',
                                borderRadius: '100px',
                                background: doc.status === 'completed' ? 'rgba(74, 222, 128, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                                color: doc.status === 'completed' ? '#4ade80' : '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}>
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

                              <button
                                className="btn-delete-card"
                                onClick={() => handleDeleteDoc(doc.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'rgba(239, 68, 68, 0.7)',
                                  cursor: 'pointer',
                                  padding: '6px',
                                  borderRadius: '6px',
                                  transition: 'color 0.2s ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239, 68, 68, 0.7)')}
                              >
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="project-section"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h2 className="section-title" style={{ margin: 0, fontFamily: 'Outfit, sans-serif' }}>Knowledge Base & Vector Index</h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 14px', borderRadius: '100px' }}>
                        Min Score: <strong style={{ color: '#fff' }}>0.20</strong>
                      </span>
                      <span style={{ fontSize: '0.74rem', fontFamily: 'Outfit, sans-serif', color: '#fff', background: 'rgba(255, 255, 255, 0.06)', padding: '6px 14px', borderRadius: '100px', fontWeight: 600 }}>
                        Top-K: {topK}
                      </span>
                    </div>
                  </div>

                  {/* Vector Stats KPI Bar - Minimal Horizontal Telemetry Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '36px',
                    marginBottom: '28px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingBottom: '24px',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                        VECTOR INDEX CHUNKS
                      </div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)} EMBEDDINGS
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />

                    <div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                        EMBEDDING MODEL
                      </div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        ALL-MINILM-L6-V2 (384D)
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />

                    <div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                        DISTANCE METRIC
                      </div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        COSINE SIMILARITY
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />

                    <div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                        INDEX HEALTH
                      </div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        HNSW READY
                      </div>
                    </div>
                  </div>

                  {/* Search Bar Container */}
                  <form onSubmit={handleSearch} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(255, 255, 255, 0.035)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    borderRadius: '16px',
                    padding: '8px 12px 8px 16px',
                    marginBottom: '14px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
                  }}>
                    <IconSearch size={18} style={{ color: 'rgba(255, 255, 255, 0.45)', flexShrink: 0 }} />
                    <input
                      type="text"
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.88rem', fontFamily: 'Outfit, sans-serif', outline: 'none', flex: 1 }}
                    />
                    <button
                      type="submit"
                      disabled={searching || !searchQuery.trim()}
                      style={{
                        background: searching || !searchQuery.trim() ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.88)',
                        color: searching || !searchQuery.trim() ? 'rgba(255, 255, 255, 0.3)' : '#000',
                        border: 'none',
                        borderRadius: '100px',
                        padding: '10px 20px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        fontFamily: 'Outfit, sans-serif',
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
                    <span style={{ fontSize: '0.74rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)' }}>Sample queries:</span>
                    {['authentication API', 'vector database pipeline', 'error handling logic'].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchQuery(chip)
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.035)',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontFamily: 'Outfit, sans-serif',
                          padding: '4px 12px',
                          borderRadius: '100px',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Search Results Container */}
                  {hasSearched && (
                    <div className="search-results-container">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 className="subsection-title" style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                          Search Results {searchResults.length > 0 && `(${searchResults.length} chunks)`}
                        </h3>
                        {searchResults.length > 0 && (
                          <span style={{ fontSize: '0.76rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)' }}>
                            Ranked by Cosine Similarity
                          </span>
                        )}
                      </div>

                      {searching ? (
                        <div className="spinner-container" style={{ minHeight: '140px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px' }}>
                          <div className="dashboard-spinner"></div>
                          <span style={{ fontSize: '0.86rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)' }}>Scanning HNSW vector index...</span>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="empty-state" style={{ minHeight: '160px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px' }}>
                          <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem' }}>No vector matches found above threshold.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {searchResults.map((res, i) => (
                            <div key={res.chunk_id || i} style={{
                              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                              padding: '16px 0',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                                  <IconFile size={14} style={{ color: '#fff' }} />
                                  <span style={{ fontWeight: 600, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>{res.document_name || 'Document'}</span>
                                  <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', fontSize: '0.76rem' }}>Chunk #{res.chunk_index}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#4ade80', background: 'rgba(34, 197, 94, 0.12)', padding: '3px 10px', borderRadius: '100px' }}>
                                  {Math.round((res.similarity || 0) * 100)}% Match
                                </span>
                              </div>
                              <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{ maxWidth: '980px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                  {/* Consolidated RAG Playground Container - Minimalist Layout */}
                  <div className="rag-playground-card" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '0',
                    padding: '0',
                  }}>
                    {/* Integrated Console Header Toolbar at TOP */}
                    <div className="rag-header-toolbar" style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: 'transparent' }}>
                      {/* Integrated Telemetry & Clear Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* TPM Telemetry Badge Pill */}
                        <div
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '100px',
                            padding: '5px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: tpmTokens >= 6000 ? '#f87171' : 'rgba(255, 255, 255, 0.45)',
                            fontFamily: 'Outfit, sans-serif'
                          }}
                          title="Rolling 1-minute token usage limit"
                        >
                          <span>{byokKey.trim() ? 'Unmetered' : (ragProvider === 'gemini' ? '1M TPM' : `${tpmTokens.toLocaleString()} / 6k TPM`)}</span>
                          
                          {/* Modern Visual Progress Meter Line */}
                          {!byokKey.trim() && ragProvider !== 'gemini' && (
                            <div style={{
                              width: '54px',
                              height: '4px',
                              borderRadius: '2px',
                              background: 'rgba(0, 0, 0, 0.7)',
                              overflow: 'hidden',
                              marginLeft: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${Math.min(100, Math.max(3, (tpmTokens / 6000) * 100))}%`,
                                background: tpmTokens >= 6000 
                                  ? '#f87171' 
                                  : '#ffffff',
                                borderRadius: '2px',
                                transition: 'width 0.4s ease, background 0.3s ease'
                              }} />
                            </div>
                          )}
                        </div>

                        {/* Clear Chat Cross Icon Pill */}
                        {ragMessages.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearChat}
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              color: 'rgba(255, 255, 255, 0.45)',
                              border: 'none',
                              borderRadius: '100px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            title="Clear conversation"
                          >
                            <IconX size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="rag-chat-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
                      {/* Messages Scroll Area */}
                      <div className="rag-messages-scroll" ref={chatScrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        {ragMessages.length === 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '20px', padding: '40px 20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                              <IconCpu size={24} />
                            </div>
                            <div style={{ maxWidth: '460px' }}>
                              <h4 style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: '1.05rem', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>Grounding Assistant</h4>
                              <p style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', marginTop: '6px', margin: 0, lineHeight: 1.55 }}>
                                Query your knowledge base to receive verified answers grounded directly in uploaded PDF documents and GitHub repositories.
                              </p>
                            </div>
                            <div className="rag-prompts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', width: '100%', maxWidth: '620px', marginTop: '8px' }}>
                              {[
                                { title: 'System Architecture', prompt: 'Summarize the indexed system architecture and dependencies.' },
                                { title: 'Vector Search Parameters', prompt: 'What cosine similarity threshold and Top-K settings are active?' },
                                { title: 'Auth & Security Pipeline', prompt: 'Explain the authentication, token expiration, and API key design.' },
                                { title: 'RAG Performance Metrics', prompt: 'What is the average retrieval latency and token efficiency?' }
                              ].map((chip, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    if (!isGenerating && !isChatLocked) {
                                      setRagInput(chip.prompt)
                                      setTimeout(() => ragInputRef.current?.focus(), 20)
                                    }
                                  }}
                                  disabled={isGenerating || isChatLocked}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.04)',
                                    color: isGenerating || isChatLocked ? 'rgba(255, 255, 255, 0.3)' : '#fff',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    fontSize: '0.78rem',
                                    fontFamily: 'Outfit, sans-serif',
                                    textAlign: 'left',
                                    cursor: isGenerating || isChatLocked ? 'not-allowed' : 'pointer',
                                    opacity: isGenerating || isChatLocked ? 0.6 : 1,
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isGenerating && !isChatLocked) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isGenerating && !isChatLocked) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                                  }}
                                >
                                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif' }}>{chip.title}</span>
                                  <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.76rem', lineHeight: 1.4, fontFamily: 'Outfit, sans-serif' }}>{chip.prompt}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          ragMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                gap: '12px',
                                marginBottom: '16px',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                alignItems: 'flex-start'
                              }}
                            >
                              {msg.role === 'user' && (
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: 'rgba(255, 255, 255, 0.12)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  flexShrink: 0,
                                }}>
                                  <IconUser size={14} />
                                </div>
                              )}

                              <div style={{
                                maxWidth: msg.role === 'user' ? '75%' : '80%',
                                background: msg.role === 'user' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.04)',
                                padding: '12px 16px',
                                borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '2px 14px 14px 14px',
                                color: '#fff',
                                fontSize: '0.88rem',
                                lineHeight: '1.55',
                                fontFamily: 'Outfit, sans-serif'
                              }}>
                                {msg.role === 'assistant' && !msg.content ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 4px' }}>
                                    <span className="dot-typing"></span>
                                    <span className="dot-typing"></span>
                                    <span className="dot-typing"></span>
                                  </div>
                                ) : (
                                  <>
                                    {renderFormattedMessage(msg.content)}
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        )}

                        {ragLoading && (
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px 16px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.04)',
                              borderRadius: '2px 14px 14px 14px'
                            }}>
                              <span className="dot-typing"></span>
                              <span className="dot-typing"></span>
                              <span className="dot-typing"></span>
                            </div>
                          </div>
                        )}
                        {/* Auto-scroll anchor target */}
                        <div ref={messagesEndRef} style={{ float: 'left', clear: 'both', height: '1px', width: '100%' }} />
                      </div>

                      {/* Locked Banner Notification */}
                      {isChatLocked && (
                        <div style={{
                          padding: '12px 20px',
                          background: 'rgba(239, 68, 68, 0.10)',
                          borderTop: '1px solid rgba(239, 68, 68, 0.15)',
                          color: '#fca5a5',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontFamily: 'Outfit, sans-serif'
                        }}>
                          <IconLock size={14} style={{ color: '#f87171', flexShrink: 0 }} />
                          <span><strong>Chat Locked:</strong> Token limit reached. Switch provider, add a BYOK key, or contact your admin to continue.</span>
                        </div>
                      )}

                      {/* Chat Input Console Form */}
                      <form
                        className="rag-input-form"
                        onSubmit={handleSendRagQuery}
                        style={{
                          padding: '16px 20px',
                          background: 'rgba(255, 255, 255, 0.01)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                          <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: isChatLocked ? '#f87171' : 'rgba(255, 255, 255, 0.45)' }}>
                            {isChatLocked ? <IconLock size={18} /> : <IconTwinkle size={18} />}
                          </div>
                          <input
                            ref={ragInputRef}
                            autoFocus
                            type="text"
                            className="rag-chat-input"
                            value={ragInput}
                            onChange={(e) => setRagInput(e.target.value)}
                            disabled={isGenerating || isChatLocked}
                            style={{
                              width: '100%',
                              borderRadius: '100px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              padding: '12px 20px 12px 46px',
                              color: isChatLocked ? '#f87171' : '#fff',
                              fontSize: '0.88rem',
                              fontFamily: 'Outfit, sans-serif',
                              outline: 'none',
                              cursor: (isGenerating || isChatLocked) ? 'not-allowed' : 'text',
                              opacity: (isGenerating || isChatLocked) ? 0.7 : 1,
                            }}
                          />
                        </div>
                        <button
                          type="submit"
                          className="rag-send-btn"
                          disabled={!ragInput.trim() || isGenerating || isChatLocked}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: !ragInput.trim() || isGenerating || isChatLocked ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                            color: !ragInput.trim() || isGenerating || isChatLocked ? 'rgba(255, 255, 255, 0.3)' : '#000000',
                            padding: 0,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: !ragInput.trim() || isGenerating || isChatLocked ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                          }}
                          title={isGenerating ? "Generating response..." : isChatLocked ? "Chat Locked" : "Send Query"}
                        >
                          {isGenerating ? (
                            <IconLoader size={18} className="spin" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                          ) : isChatLocked ? (
                            <IconLock size={18} style={{ color: '#f87171' }} />
                          ) : (
                            <IconSend size={18} />
                          )}
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="project-section"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h2 className="section-title" style={{ margin: 0, fontFamily: 'Outfit, sans-serif' }}>Audit Log</h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {['ALL', 'QUERIES', 'KEYS', 'DOCUMENTS'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActivityFilter(filter)}
                          style={{
                            background: activityFilter === filter ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.035)',
                            color: activityFilter === filter ? '#000' : 'rgba(255, 255, 255, 0.6)',
                            border: 'none',
                            borderRadius: '100px',
                            padding: '6px 14px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            fontFamily: 'Outfit, sans-serif',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Log List - Flat Layout */}
                  <div>
                    {loadingActivity ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', fontSize: '0.84rem' }}>
                        Loading real-time audit stream...
                      </div>
                    ) : activityLogs.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconActivity size={22} style={{ color: '#fff' }} />
                        </div>
                        <h4 style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: '0.96rem', fontFamily: 'Outfit, sans-serif' }}>No Audit Events Recorded Yet</h4>
                        <p style={{ fontSize: '0.82rem', margin: 0, maxWidth: '420px', lineHeight: 1.5, fontFamily: 'Outfit, sans-serif' }}>
                          Audit logs will automatically populate in real-time as you execute RAG queries, ingest documents, or manage API keys.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                borderRadius: '10px',
                                padding: '14px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                <span style={{ fontSize: '0.70rem', fontFamily: 'Outfit, sans-serif', padding: '4px 10px', borderRadius: '100px', background: 'rgba(255, 255, 255, 0.06)', color: '#fff', letterSpacing: '0.04em', fontWeight: 600 }}>
                                  {item.event}
                                </span>
                                <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.details}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.74rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)' }}>{item.latency}</span>
                                <span style={{ fontSize: '0.74rem', fontFamily: 'Outfit, sans-serif', color: item.statusColor || '#4ade80', fontWeight: 600 }}>{item.status}</span>
                                <span style={{ fontSize: '0.74rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)' }}>{item.time}</span>
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="project-section"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h2 className="section-title" style={{ margin: 0, fontFamily: 'Outfit, sans-serif' }}>API</h2>
                    </div>
                    <button
                      onClick={() => {
                        setGeneratedSecretKey(null)
                        setCopiedKey(false)
                        setShowKeyModal(true)
                      }}
                      title="Create Secret Key"
                      style={{
                        background: 'rgba(255, 255, 255, 0.88)',
                        border: 'none',
                        color: '#000',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IconPlus size={18} />
                    </button>
                  </div>

                  {/* Create API Key Modal Dialog */}
                  <AnimatePresence>
                    {showKeyModal && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.035)',
                          backdropFilter: 'blur(24px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                          borderRadius: '20px',
                          padding: '24px',
                          marginBottom: '20px',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'Outfit, sans-serif', margin: '0 0 6px 0' }}>Generate New API Key</h3>
                        <p style={{ fontSize: '0.80rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', margin: '0 0 18px 0' }}>
                          Assign a descriptive name and scope environment for this credential.
                        </p>

                        {!generatedSecretKey ? (
                          <form onSubmit={handleCreateApiKey} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '220px' }}>
                                <label style={{ display: 'block', fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>Key Identifier / Name</label>
                                <input
                                  type="text"
                                  value={keyNameInput}
                                  onChange={(e) => setKeyNameInput(e.target.value)}
                                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '0.86rem', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
                                />
                              </div>

                              <div style={{ width: '150px' }}>
                                <label style={{ display: 'block', fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>Environment</label>
                                <select
                                  value={keyEnvInput}
                                  onChange={(e) => setKeyEnvInput(e.target.value)}
                                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '0.86rem', fontFamily: 'Outfit, sans-serif', outline: 'none', cursor: 'pointer' }}
                                >
                                  <option value="live" style={{ background: '#121217' }}>Live (Prod)</option>
                                  <option value="test" style={{ background: '#121217' }}>Test (Dev)</option>
                                </select>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setShowKeyModal(false)}
                                style={{ background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#fff', borderRadius: '100px', padding: '8px 20px', fontSize: '0.80rem', fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={!keyNameInput.trim()}
                                style={{
                                  background: !keyNameInput.trim() ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.88)',
                                  border: 'none',
                                  color: !keyNameInput.trim() ? 'rgba(255, 255, 255, 0.3)' : '#000',
                                  borderRadius: '100px',
                                  padding: '8px 22px',
                                  fontSize: '0.80rem',
                                  fontWeight: 600,
                                  fontFamily: 'Outfit, sans-serif',
                                  cursor: !keyNameInput.trim() ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Generate Secret Key
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ background: 'rgba(74, 222, 128, 0.1)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.80rem', fontFamily: 'Outfit, sans-serif', color: '#4ade80' }}>
                              <strong>API Key Created Successfully!</strong> Please copy your secret key now. You will not be able to view it again.
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', padding: '12px 16px' }}>
                              <code style={{ flex: 1, color: '#fff', fontFamily: 'monospace', fontSize: '0.88rem', wordBreak: 'break-all' }}>
                                {generatedSecretKey}
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(generatedSecretKey)
                                  setCopiedKey(true)
                                  setTimeout(() => setCopiedKey(false), 2000)
                                }}
                                style={{ background: 'rgba(255, 255, 255, 0.88)', border: 'none', color: '#000', borderRadius: '100px', padding: '8px 18px', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', flexShrink: 0 }}
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
                                style={{ background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#fff', borderRadius: '100px', padding: '8px 20px', fontSize: '0.80rem', fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* API Keys List - Flat Layout */}
                  <div>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '14px' }}>
                      Active Credentials ({apiKeys.filter(k => k.status !== 'REVOKED').length})
                    </h3>

                    {loadingApiKeys ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', fontSize: '0.84rem' }}>
                        Loading API keys...
                      </div>
                    ) : apiKeys.length === 0 ? (
                      <div style={{ padding: '30px 0', textAlign: 'center', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif' }}>
                        <p style={{ fontSize: '0.84rem', margin: 0 }}>No API secret keys created yet. Click <strong>+</strong> above to issue a credential.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {apiKeys.map((k, i) => (
                          <div
                            key={k.id || i}
                            style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                              borderRadius: '10px',
                              padding: '14px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              opacity: k.status === 'REVOKED' ? 0.5 : 1,
                            }}
                          >
                            <div>
                              <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{k.name}</span>
                                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '100px', background: k.environment === 'live' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.06)', color: '#fff', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
                                  {k.environment || 'LIVE'}
                                </span>
                              </div>
                              <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.78rem', fontFamily: 'monospace' }}>{k.masked_key}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: k.status === 'REVOKED' ? '#f87171' : '#4ade80', padding: '4px 10px', borderRadius: '100px', background: k.status === 'REVOKED' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(74, 222, 128, 0.1)', fontWeight: 600 }}>
                                {k.status || 'ACTIVE'}
                              </span>
                              <span style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif' }}>{k.created_at || k.created}</span>
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="project-section"
                  style={{ maxWidth: '820px', borderLeft: '1px solid rgba(255, 255, 255, 0.05)', paddingLeft: '20px' }}
                >
                  <h2 className="section-title" style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '28px', fontSize: '1.2rem', fontWeight: 600 }}>Project Settings</h2>

                  {/* RAG Model & Retrieval Configuration */}
                  <div style={{
                    paddingBottom: '28px',
                    marginBottom: '28px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>
                      RAG Model & Retrieval Parameters
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif', marginBottom: '18px' }}>
                      Configure default AI LLM provider models and document context retrieval depth (Top-K chunks) for RAG responses.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', marginBottom: '6px', fontWeight: 500 }}>
                          AI Model Provider
                        </label>
                        <select
                          value={ragProvider}
                          onChange={(e) => setRagProvider(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            fontSize: '0.84rem',
                            fontFamily: 'Outfit, sans-serif',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="groq" style={{ background: '#121217' }}>Groq (GPT-OSS 120B)</option>
                          <option value="qwen" style={{ background: '#121217' }}>Groq (Qwen 3.8 27B)</option>
                          <option value="gemini" style={{ background: '#121217' }}>Gemini (2.0 Flash)</option>
                          <option value="openai" style={{ background: '#121217' }}>OpenAI (GPT-4o)</option>
                          <option value="claude" style={{ background: '#121217' }}>Anthropic (Claude 3.5)</option>
                          <option value="local" style={{ background: '#121217' }}>Local DeepSeek R1</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', marginBottom: '6px', fontWeight: 500 }}>
                          Retrieval Depth (Top-K Chunks)
                        </label>
                        <select
                          value={topK}
                          onChange={(e) => setTopK(Number(e.target.value))}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            fontSize: '0.84rem',
                            fontFamily: 'Outfit, sans-serif',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value={2} style={{ background: '#121217' }}>Concise (K=2 chunks)</option>
                          <option value={4} style={{ background: '#121217' }}>Balanced (K=4 chunks)</option>
                          <option value={6} style={{ background: '#121217' }}>Deep (K=6 chunks)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* General Configuration */}
                  <div style={{
                    paddingBottom: '28px',
                    marginBottom: '28px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '16px' }}>
                      General Configuration
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>Project Name</label>
                        <input
                          type="text"
                          value={project.name}
                          readOnly
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: 'none', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.86rem', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>Description</label>
                        <textarea
                          value={project.description || 'No description provided.'}
                          readOnly
                          rows={2}
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: 'none', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.86rem', fontFamily: 'Outfit, sans-serif', resize: 'none', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom LLM API Keys (BYOK) */}
                  <div style={{
                    paddingBottom: '28px',
                    marginBottom: '28px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                          Custom LLM API Keys (BYOK)
                        </h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif', marginTop: '4px', margin: 0 }}>
                          Provide your own API keys (Groq, OpenAI, or Gemini) for unmetered execution and bypassing free tier rate limits.
                        </p>
                      </div>
                      {byokKey.trim() && (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(74, 222, 128, 0.12)', color: '#4ade80', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                          ✓ KEY ACTIVE
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="password"
                        value={byokKey}
                        onChange={(e) => {
                          setByokKey(e.target.value)
                          localStorage.setItem('beacon_byok_key', e.target.value)
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          color: '#fff',
                          fontSize: '0.86rem',
                          fontFamily: 'monospace',
                          outline: 'none'
                        }}
                      />
                      {byokKey.trim() && (
                        <button
                          onClick={() => {
                            setByokKey('')
                            localStorage.removeItem('beacon_byok_key')
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#f87171',
                            border: 'none',
                            borderRadius: '100px',
                            padding: '10px 18px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontFamily: 'Outfit, sans-serif',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Remove Key
                        </button>
                      )}
                    </div>
                  </div>

                  {/* System Identifiers */}
                  <div style={{
                    paddingBottom: '28px',
                    marginBottom: '28px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '16px' }}>
                      System Identifiers & API Metadata
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {[
                        { title: 'Project ID', sub: 'Required in RAG query headers', value: project.id },
                        { title: 'Organization ID', sub: 'Parent organization namespace', value: project.organization_id },
                        { title: 'Project Slug', sub: 'URL-safe project identifier', value: project.slug },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <div>
                            <div style={{ color: '#fff', fontSize: '0.84rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>{item.title}</div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.74rem', fontFamily: 'Outfit, sans-serif' }}>{item.sub}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <code style={{ fontSize: '0.80rem', color: '#fff', fontFamily: 'monospace', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 10px', borderRadius: '6px' }}>{item.value}</code>
                            <button
                              onClick={() => navigator.clipboard.writeText(item.value)}
                              style={{ background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '100px', fontSize: '0.74rem', fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div style={{
                    paddingTop: '8px'
                  }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fca5a5', fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>
                      Danger Zone
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', margin: 0, marginBottom: '16px' }}>
                      Deleting this project will permanently purge all indexed vector embeddings, uploaded files, GitHub repository links, and RAG chat history.
                    </p>
                    <button
                      onClick={() => alert('Project deletion protection active.')}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#f87171', padding: '10px 20px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}
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
