import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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

  // Semantic Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)


  const API_BASE = ''

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

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <IconLayers size={15} /> },
    { id: 'documents', label: 'Documents', icon: <IconFile size={15} /> },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: <IconDatabase size={15} /> },
    { id: 'activity', label: 'Activity', icon: <IconActivity size={15} /> },
    { id: 'api-keys', label: 'API Keys', icon: <IconKey size={15} /> },
    { id: 'settings', label: 'Settings', icon: <IconSettings size={15} /> },
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
          <div className="navbar-brand" onClick={() => navigate('/dashboard/organizations')}>
            <span>BEACON</span>
          </div>

          <div className="navbar-breadcrumb">
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-org" onClick={() => navigate('/dashboard/organizations')}>Organizations</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-org" onClick={() => navigate(`/dashboard/org/${orgId}`)}>Projects</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-org" style={{ color: '#fff', cursor: 'default' }}>
              {project?.name || 'Project'}
            </span>
          </div>
        </div>

        {/* Right User profile */}
        <div className="navbar-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            className="user-avatar-btn"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            aria-label="User menu"
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

      {/* Project Layout: Sidebar + Content */}
      <div className="project-layout">

        {/* Left Sidebar */}
        <aside className="project-sidebar">
          <button className="sidebar-back-btn" onClick={() => navigate(`/dashboard/org/${orgId}`)}>
            <IconArrowLeft size={14} />
            <span>Back to Projects</span>
          </button>

          <div className="sidebar-project-info">
            <h3 className="sidebar-project-name">{project?.name || 'Loading...'}</h3>
            {project?.environment && (
              <span className={`status-badge ${project.environment.toLowerCase() === 'production' ? 'active' : 'type'}`}>
                {project.environment}
              </span>
            )}
          </div>

          <nav className="sidebar-nav">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav-item${activeSection === item.id ? ' active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="project-content">
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
                  className="project-section"
                >
                  <h2 className="section-title">Project Overview</h2>

                  <div className="project-meta-grid">
                    <div className="meta-card">
                      <div className="meta-label">Project Name</div>
                      <div className="meta-value">{project.name}</div>
                    </div>
                    <div className="meta-card">
                      <div className="meta-label">Slug</div>
                      <div className="meta-value mono">{project.slug}</div>
                    </div>
                    <div className="meta-card">
                      <div className="meta-label">Use Case</div>
                      <div className="meta-value">{project.project_type || 'Not set'}</div>
                    </div>
                    <div className="meta-card">
                      <div className="meta-label">Environment</div>
                      <div className="meta-value">
                        <span className={`status-badge ${project.environment?.toLowerCase() === 'production' ? 'active' : 'type'}`}>
                          {project.environment || 'Development'}
                        </span>
                      </div>
                    </div>
                    <div className="meta-card">
                      <div className="meta-label">Total Documents</div>
                      <div className="meta-value">{documents.length}</div>
                    </div>
                    <div className="meta-card">
                      <div className="meta-label">Total Chunks</div>
                      <div className="meta-value">{documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)}</div>
                    </div>
                  </div>

                  {project.description && (
                    <div className="project-description-block">
                      <div className="meta-label">Description</div>
                      <p className="project-description-text">{project.description}</p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="quick-actions">
                    <h3 className="subsection-title">Quick Actions</h3>
                    <div className="actions-grid">
                      <button className="action-card" onClick={() => setActiveSection('documents')}>
                        <IconUpload size={20} />
                        <span>Upload Documents</span>
                        <p>Add files to build your knowledge index</p>
                      </button>
                      <button className="action-card" onClick={() => setActiveSection('knowledge-base')}>
                        <IconDatabase size={20} />
                        <span>Knowledge Base</span>
                        <p>Search & query indexed content</p>
                      </button>
                      <button className="action-card" onClick={() => setActiveSection('api-keys')}>
                        <IconKey size={20} />
                        <span>API Keys</span>
                        <p>Generate keys for API access</p>
                      </button>
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

                      {githubError && (
                        <div className="upload-error" style={{ marginTop: '14px' }}>
                          <IconAlertCircle size={16} />
                          <span>{githubError}</span>
                        </div>
                      )}

                      {/* Detected Files Tree Selector */}
                      {githubScanResult && (
                        <div className="github-tree-container">
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
                  <h2 className="section-title">Knowledge Base & Semantic Search</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
                    Query your indexed vector embeddings using cosine similarity.
                  </p>

                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="search-bar-container">
                    <IconSearch size={16} />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Ask a question or search key phrases across documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="btn-create" disabled={searching || !searchQuery.trim()}>
                      {searching ? <IconLoader size={14} /> : <span>Search</span>}
                    </button>
                  </form>

                  {/* Search Results */}
                  {hasSearched && (
                    <div className="search-results-container" style={{ marginTop: '28px' }}>
                      <h3 className="subsection-title">
                        Search Results {searchResults.length > 0 && `(${searchResults.length})`}
                      </h3>

                      {searching ? (
                        <div className="spinner-container" style={{ minHeight: '120px' }}>
                          <div className="dashboard-spinner"></div>
                          <span>Generating embeddings & querying vector index...</span>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="empty-state" style={{ minHeight: '160px' }}>
                          <p>No matching text chunks found in indexed documents.</p>
                        </div>
                      ) : (
                        <div className="results-list">
                          {searchResults.map((res, i) => (
                            <div key={res.chunk_id || i} className="search-result-card">
                              <div className="result-header">
                                <span className="doc-source-badge">
                                  <IconFile size={12} />
                                  <span>{res.document_name || 'Document'} (Chunk #{res.chunk_index})</span>
                                </span>
                                <span className="similarity-badge">
                                  {Math.round((res.similarity || 0) * 100)}% match
                                </span>
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
                >
                  <h2 className="section-title">Project Settings</h2>

                  <div className="settings-section">
                    <h3>General</h3>
                    <div className="settings-field">
                      <span className="label">Project ID</span>
                      <span className="value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{project.id}</span>
                    </div>
                    <div className="settings-field">
                      <span className="label">Organization ID</span>
                      <span className="value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{project.organization_id}</span>
                    </div>
                    <div className="settings-field">
                      <span className="label">Slug</span>
                      <span className="value">{project.slug}</span>
                    </div>
                  </div>

                  <div className="settings-section" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <h3 style={{ color: '#fca5a5' }}>Danger Zone</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Deleting this project will permanently remove all documents, knowledge bases, and API keys associated with it.
                    </p>
                    <button
                      className="btn-modal-cancel"
                      style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                    >
                      Delete Project
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  )
}
