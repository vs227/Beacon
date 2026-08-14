import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'


// SVG Icons for horizontal navbar to keep things compact & modern

function IconLayers({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

function IconDatabase({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}

function IconKey({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  )
}

function IconSettings({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconSearch({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconOrgCluster({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="6" r="2" />
      <circle cx="6" cy="17" r="2" />
      <circle cx="18" cy="17" r="2" />
      <path d="M12 8v3M9.5 13.5L7.5 15M14.5 13.5l2 1.5" />
    </svg>
  )
}

function IconLogOut({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconPlus({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconTrash({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

export default function Dashboard({ auth }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedOrg, setSelectedOrg] = useState(() => {
    try {
      const saved = localStorage.getItem('beacon_selected_org')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [activeTab, setActiveTab] = useState('organizations')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Organizations State
  const [orgs, setOrgs] = useState(() => {
    try {
      const saved = localStorage.getItem('beacon_cached_orgs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgDesc, setNewOrgDesc] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Projects State scoped by selected Org
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newProjectType, setNewProjectType] = useState('Customer Support')
  const [customProjectType, setCustomProjectType] = useState('')
  const [newProjectEnv, setNewProjectEnv] = useState('Development')
  const [projectSearchQuery, setProjectSearchQuery] = useState('')

  const API_BASE = ''

  // Cache selectedOrg whenever it changes
  useEffect(() => {
    if (selectedOrg) {
      localStorage.setItem('beacon_selected_org', JSON.stringify(selectedOrg))
    } else {
      localStorage.removeItem('beacon_selected_org')
    }
  }, [selectedOrg])

  // Fetch Organizations
  const fetchOrgs = useCallback(async () => {
    if (!auth.token) return
    setLoadingOrgs(true)
    setErrorMsg('')
    try {
      const res = await fetch(`${API_BASE}/organizations`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrgs(data)
        localStorage.setItem('beacon_cached_orgs', JSON.stringify(data))
      } else if (res.status === 401) {
        auth.logout()
      } else {
        const data = await res.json()
        setErrorMsg(data.detail || 'Failed to fetch organizations')
      }
    } catch (err) {
      setErrorMsg('Failed to connect to organizational services: ' + err.message)
    } finally {
      setLoadingOrgs(false)
    }
  }, [auth])

  useEffect(() => {
    fetchOrgs()
  }, [fetchOrgs])

  // Sync tab & selectedOrg based on URL pathname
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '')
    if (path.startsWith('/dashboard/org/')) {
      const orgId = path.split('/dashboard/org/')[1]?.split('/')[0]
      if (orgId && orgs.length > 0) {
        const found = orgs.find(o => String(o.id) === String(orgId) || String(o.organization_id) === String(orgId) || o.slug === orgId)
        if (found) {
          setSelectedOrg(found)
        }
      }
      setActiveTab('projects')
    } else if (path === '/dashboard/workspaces') {
      setActiveTab('workspaces')
    } else if (path === '/dashboard/knowledge-bases') {
      setActiveTab('knowledge-bases')
    } else if (path === '/dashboard/api-keys') {
      setActiveTab('api-keys')
    } else if (path === '/dashboard/settings') {
      setSelectedOrg(null)
      setActiveTab('settings')
    } else if (path === '/dashboard/org-settings') {
      setActiveTab('org-settings')
    } else if (path === '/dashboard/organizations') {
      setSelectedOrg(null)
      setActiveTab('organizations')
    } else {
      // /dashboard: auto-select first/cached org if available so projects load
      if (orgs.length > 0) {
        const cached = localStorage.getItem('beacon_selected_org')
        let initialOrg = orgs[0]
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            const match = orgs.find(o => String(o.id) === String(parsed.id) || String(o.organization_id) === String(parsed.id) || o.slug === parsed.slug)
            if (match) initialOrg = match
          } catch {}
        }
        setSelectedOrg(initialOrg)
        setActiveTab('projects')
      } else {
        setSelectedOrg(null)
        setActiveTab('organizations')
      }
    }
  }, [location.pathname, orgs])

  // Fetch projects for selected organization
  const fetchProjects = useCallback(async (orgId) => {
    if (!auth.token || !orgId) return
    setLoadingProjects(true)
    setErrorMsg('')
    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      } else if (res.status === 401) {
        auth.logout()
      } else {
        const errData = await res.json()
        setErrorMsg(errData.detail || 'Failed to load projects for organization.')
      }
    } catch (err) {
      setErrorMsg('Failed to connect to project service: ' + err.message)
    } finally {
      setLoadingProjects(false)
    }
  }, [auth])

  // Scope project state changes to selected organization
  useEffect(() => {
    if (selectedOrg) {
      const orgId = selectedOrg.id || selectedOrg.organization_id
      fetchProjects(orgId)
      setActiveTab('projects')
    } else {
      setProjects([])
      setActiveTab('organizations')
    }
  }, [selectedOrg, fetchProjects])

  // Create Organization
  const handleCreateOrg = async (e) => {
    e.preventDefault()
    if (!newOrgName.trim()) return
    setErrorMsg('')
    try {
      const res = await fetch(`${API_BASE}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          name: newOrgName,
          description: newOrgDesc,
        }),
      })
      if (res.ok) {
        const newOrgObj = await res.json()
        setNewOrgName('')
        setNewOrgDesc('')
        setShowCreateModal(false)
        await fetchOrgs()
        const targetId = newOrgObj.id || newOrgObj.organization_id
        if (targetId) {
          navigate(`/dashboard/org/${targetId}`)
        }
      } else {
        const data = await res.json()
        setErrorMsg(data.detail || 'Failed to create organization')
      }
    } catch (err) {
      setErrorMsg('Error creating organization: ' + err.message)
    }
  }

  // Delete Organization
  const handleDeleteOrg = async (orgId) => {
    if (!confirm('Are you sure you want to delete this organization? This will remove all child projects.')) return
    setErrorMsg('')
    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.ok) {
        if (selectedOrg && (selectedOrg.id === orgId || selectedOrg.organization_id === orgId)) {
          navigate('/dashboard/organizations')
        } else {
          fetchOrgs()
        }
      } else {
        const data = await res.json()
        setErrorMsg(data.detail || 'Failed to delete organization')
      }
    } catch (err) {
      setErrorMsg('Error deleting organization: ' + err.message)
    }
  }

  // Create Project via API
  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim() || !selectedOrg) return
    const orgId = selectedOrg.id || selectedOrg.organization_id
    setErrorMsg('')
    const finalProjectType = newProjectType === 'Custom' ? (customProjectType.trim() || 'Custom') : newProjectType
    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc,
          project_type: finalProjectType,
          environment: newProjectEnv,
        }),
      })
      if (res.ok) {
        setNewProjectName('')
        setNewProjectDesc('')
        setNewProjectType('Customer Support')
        setCustomProjectType('')
        setNewProjectEnv('Development')
        setShowProjectModal(false)
        await fetchProjects(orgId)
      } else {
        const data = await res.json()
        setErrorMsg(data.detail || 'Failed to create project')
      }
    } catch (err) {
      setErrorMsg('Error creating project: ' + err.message)
    }
  }

  // Delete Project via API
  const handleDeleteProject = async (projId) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    const orgId = selectedOrg.id || selectedOrg.organization_id
    setErrorMsg('')
    try {
      const res = await fetch(`${API_BASE}/organizations/${orgId}/projects/${projId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.ok) {
        await fetchProjects(orgId)
      } else {
        const data = await res.json()
        setErrorMsg(data.detail || 'Failed to delete project')
      }
    } catch (err) {
      setErrorMsg('Error deleting project: ' + err.message)
    }
  }

  // Workspaces and Knowledge Bases State
  const [workspaces] = useState([])
  const [knowledgeBases] = useState([])

  // API Keys State
  const [apiKeys, setApiKeys] = useState([])
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState('')

  const handleGenerateKey = (e) => {
    e.preventDefault()
    if (!newKeyName.trim()) return
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    const generated = `sk_beacon_${randomHex}`
    const newKeyObj = {
      id: Date.now().toString(),
      name: newKeyName,
      token: `${generated.substring(0, 14)}...${generated.substring(generated.length - 4)}`,
      created: new Date().toISOString().split('T')[0],
    }
    setApiKeys([...apiKeys, newKeyObj])
    setCreatedKey(generated)
    setNewKeyName('')
  }

  return (
    <div className="dashboard-container">


      {/* Top Navbar */}
      <header className="dashboard-navbar">
        <div className="navbar-left">
          <div className="navbar-brand" onClick={() => navigate('/dashboard/organizations')}>
            <span>BEACON</span>
          </div>
        </div>

        {/* Right User profile with Nav Items */}
        <div className="navbar-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className={`nav-item${activeTab === 'organizations' ? ' active' : ''}`}
            onClick={() => navigate('/dashboard/organizations')}
          >
            <span>Organizations</span>
          </button>

          {selectedOrg && (
            <button
              className={`nav-item${activeTab === 'projects' ? ' active' : ''}`}
              onClick={() => navigate(`/dashboard/org/${selectedOrg?.id || selectedOrg?.organization_id}`)}
            >
              <span>Projects</span>
            </button>
          )}

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
                <div
                  className="dropdown-overlay"
                  onClick={() => setShowProfileDropdown(false)}
                />
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
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowProfileDropdown(false)
                      navigate('/dashboard/settings')
                    }}
                  >
                    <IconSettings size={14} />
                    <span>Account Settings</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item logout"
                    onClick={() => {
                      setShowProfileDropdown(false)
                      auth.logout()
                    }}
                  >
                    <IconLogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="dashboard-content">
        {/* Status Error Banners */}
        {errorMsg && (
          <div className="error-banner">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')}>×</button>
          </div>
        )}

        <div className="tab-pane-container">
          <AnimatePresence mode="wait">
            {activeTab === 'organizations' && (
              <motion.div
                key="orgs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ maxWidth: '1080px', width: '100%', margin: '0 auto', padding: '10px 0' }}
              >
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: '24px' }}>
                  Your Organizations
                </h1>

                {/* Control Bar: Search Input (left) & New Organization (right) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <IconSearch size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search for an organization"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '7px 12px 7px 34px',
                        color: '#fff',
                        fontSize: '0.84rem',
                        fontFamily: 'var(--font-sans)',
                        outline: 'none',
                        width: '260px',
                        transition: 'border-color 0.2s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                    />
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      background: 'var(--bronze-base)',
                      border: '1px solid rgba(244, 209, 166, 0.35)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontFamily: 'var(--font-sans)',
                      boxShadow: '0 2px 10px rgba(182, 122, 70, 0.25)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bronze-shadow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bronze-base)')}
                  >
                    <span>+ New organization</span>
                  </button>
                </div>

                {/* Organization Cards Grid */}
                {loadingOrgs ? (
                  <div className="spinner-container">
                    <div className="dashboard-spinner"></div>
                    <span>Loading organization directories...</span>
                  </div>
                ) : orgs.filter(o => o.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="empty-state" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', padding: '44px 20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                      {searchQuery ? 'No matching organizations found' : 'No Organizations Found'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
                      {searchQuery ? 'Try adjusting your search query.' : 'Create an organization to get started.'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                          background: 'var(--bronze-base)',
                          border: '1px solid rgba(244, 209, 166, 0.35)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        + New organization
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '14px' }}>
                    {orgs
                      .filter(o => o.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((org) => (
                        <div
                          key={org.id || org.organization_id}
                          onClick={() => navigate(`/dashboard/org/${org.id || org.organization_id}`)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconOrgCluster size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                                {org.name}
                              </h2>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>Free Plan</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ maxWidth: '1080px', width: '100%', margin: '0 auto', padding: '10px 0' }}
              >
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: '24px' }}>
                  Your Projects
                </h1>

                {/* Control Bar: Search Input (left) & New Project (right) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <IconSearch size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '7px 12px 7px 34px',
                        color: '#fff',
                        fontSize: '0.84rem',
                        fontFamily: 'var(--font-sans)',
                        outline: 'none',
                        width: '260px',
                        transition: 'border-color 0.2s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                    />
                  </div>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    style={{
                      background: 'var(--bronze-base)',
                      border: '1px solid rgba(244, 209, 166, 0.35)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontFamily: 'var(--font-sans)',
                      boxShadow: '0 2px 10px rgba(182, 122, 70, 0.25)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bronze-shadow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bronze-base)')}
                  >
                    <span>+ New project</span>
                  </button>
                </div>

                {/* Projects Cards Grid */}
                {loadingProjects ? (
                  <div className="spinner-container">
                    <div className="dashboard-spinner"></div>
                    <span>Loading projects...</span>
                  </div>
                ) : projects.filter(p => p.name?.toLowerCase().includes(projectSearchQuery.toLowerCase())).length === 0 ? (
                  <div className="empty-state" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', padding: '44px 20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                      {projectSearchQuery ? 'No matching projects found' : 'No Projects Found'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
                      {projectSearchQuery ? 'Try adjusting your search query.' : 'Create a project inside this organization to build indexing and knowledge bases.'}
                    </p>
                    {!projectSearchQuery && (
                      <button
                        onClick={() => setShowProjectModal(true)}
                        style={{
                          background: 'var(--bronze-base)',
                          border: '1px solid rgba(244, 209, 166, 0.35)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        + New project
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '14px' }}>
                    {projects
                      .filter(p => p.name?.toLowerCase().includes(projectSearchQuery.toLowerCase()))
                      .map((proj) => (
                        <div
                          key={proj.id}
                          onClick={() => {
                            const orgId = selectedOrg.id || selectedOrg.organization_id
                            navigate(`/dashboard/org/${orgId}/project/${proj.id}`)
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconLayers size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                                {proj.name}
                              </h2>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{proj.project_type || proj.environment || 'Development'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'workspaces' && (
              <motion.div key="workspaces" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="dashboard-grid">
                {workspaces.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Workspaces Provisioned</h3>
                    <p>Workspaces will appear here once created inside an organization project.</p>
                  </div>
                ) : (
                  workspaces.map((ws) => (
                    <div className="dashboard-card" key={ws.id}>
                      <div className="card-header">
                        <h2 className="card-name">{ws.name}</h2>
                        <span className={`status-badge ${ws.status?.toLowerCase() || 'active'}`}>{ws.status}</span>
                      </div>
                      <p className="card-desc">Managed workspace instance running with distributed vector synapses.</p>
                      <div className="card-stats-row">
                        <div className="card-stat">
                          <span className="label">Index Size</span>
                          <span className="val">{ws.size}</span>
                        </div>
                        <div className="card-stat">
                          <span className="label">Documents</span>
                          <span className="val">{ws.docs}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'knowledge-bases' && (
              <motion.div key="kbs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="dashboard-grid">
                {knowledgeBases.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Knowledge Bases Found</h3>
                    <p>Upload documents or connect data sources to build vector search indices.</p>
                  </div>
                ) : (
                  knowledgeBases.map((kb) => (
                    <div className="dashboard-card" key={kb.id}>
                      <div className="card-header">
                        <h2 className="card-name">{kb.name}</h2>
                        <span className="status-badge type">{kb.type}</span>
                      </div>
                      <p className="card-desc">Source data connection for training and indexing semantic pipelines.</p>
                      <div className="card-stats-row">
                        <div className="card-stat">
                          <span className="label">Status</span>
                          <span className="val">{kb.status}</span>
                        </div>
                        <div className="card-stat">
                          <span className="label">Generated Vectors</span>
                          <span className="val">{kb.vectors?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'api-keys' && (
              <motion.div key="keys" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="keys-tab-container">
                <form className="key-creation-form" onSubmit={handleGenerateKey}>
                  <h3>Generate API Access Key</h3>
                  <div className="form-group-inline">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Production Backend Pipeline"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-submit-key">Generate Key</button>
                  </div>
                </form>

                {createdKey && (
                  <div className="created-key-modal">
                    <h4>✦ API Key Generated Successfully</h4>
                    <p>Copy this token immediately. For security reasons, it will not be displayed again.</p>
                    <div className="key-display-box">
                      <code>{createdKey}</code>
                      <button className="btn-copy" onClick={() => { navigator.clipboard.writeText(createdKey); alert('Copied key to clipboard!') }}>
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {apiKeys.length === 0 ? (
                  <div className="empty-state" style={{ marginTop: '20px' }}>
                    <h3>No API Keys Generated</h3>
                    <p>Generate an API key above to programmatically access your vector clusters.</p>
                  </div>
                ) : (
                  <div className="keys-list-table">
                    <div className="table-header">
                      <span>Key Name</span>
                      <span>Token Reference</span>
                      <span>Created Date</span>
                    </div>
                    {apiKeys.map((key) => (
                      <div className="table-row" key={key.id}>
                        <span className="key-name-val">{key.name}</span>
                        <span className="key-ref-val"><code>{key.token}</code></span>
                        <span className="key-date-val">{key.created}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {(activeTab === 'settings' || activeTab === 'org-settings') && (
              <motion.div
                key="account-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="full-page-settings"
              >
                {/* Page Title & Subtitle */}
                <div className="settings-page-header">
                  <div>
                    <h2 className="settings-page-title">Account Settings</h2>
                    <p className="settings-page-subtitle">
                      Manage your public profile, security credentials, and active session tokens.
                    </p>
                  </div>
                </div>

                {/* Profile Banner */}
                <div className="profile-banner-card">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar-main">
                      {(auth.user?.username || auth.user?.email || 'U')[0].toUpperCase()}
                    </div>
                  </div>

                  <div className="profile-banner-info">
                    <div className="profile-name-row">
                      <h3 className="profile-display-name">{auth.user?.username || 'Beacon Developer'}</h3>
                      <span className="profile-status-pill">Active Administrator</span>
                    </div>
                    <span className="profile-email-text">{auth.user?.email}</span>
                  </div>
                </div>

                {/* Main Settings Panel Grid */}
                <div className="settings-full-grid">
                  {/* Public Profile Section */}
                  <div className="settings-panel">
                    <div className="settings-panel-header">
                      <h3>Public Profile</h3>
                      <span>Information associated with your account</span>
                    </div>

                    <div className="settings-row-2col">
                      <div className="settings-input-group">
                        <label className="settings-field-label">Username / Display Name</label>
                        <input
                          type="text"
                          className="settings-text-input"
                          value={auth.user?.username || ''}
                          readOnly
                        />
                      </div>

                      <div className="settings-input-group">
                        <label className="settings-field-label">Primary Email Address</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="email"
                            className="settings-text-input"
                            value={auth.user?.email || ''}
                            readOnly
                            style={{ paddingRight: '90px' }}
                          />
                          <span className="verified-badge-tag">Verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="settings-row-2col" style={{ marginTop: '16px' }}>
                      <div className="settings-input-group">
                        <label className="settings-field-label">Account Role</label>
                        <input
                          type="text"
                          className="settings-text-input"
                          value="Workspace Administrator"
                          readOnly
                        />
                      </div>

                      <div className="settings-input-group">
                        <label className="settings-field-label">Authentication Method</label>
                        <input
                          type="text"
                          className="settings-text-input"
                          value="Bearer JWT / OAuth Pass"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security & Access Tokens Section */}
                  <div className="settings-panel">
                    <div className="settings-panel-header">
                      <h3>Security & API Credentials</h3>
                      <span>Identifiers and active session access tokens</span>
                    </div>

                    <div className="settings-detail-item">
                      <div>
                        <span className="settings-item-title">User Account Identifier (UUID)</span>
                        <span className="settings-item-desc">Global unique user reference for API requests</span>
                      </div>
                      <div className="settings-code-box">
                        <code>{auth.user?.user_id || 'Generating...'}</code>
                        <button
                          className="copy-code-btn"
                          onClick={() => auth.user?.user_id && navigator.clipboard.writeText(auth.user.user_id)}
                        >
                          Copy ID
                        </button>
                      </div>
                    </div>

                    <div className="settings-detail-item">
                      <div>
                        <span className="settings-item-title">Active JWT Access Token</span>
                        <span className="settings-item-desc">Current session authorization token</span>
                      </div>
                      <div className="settings-code-box">
                        <code>{auth.token ? `${auth.token.substring(0, 32)}...` : 'No Token'}</code>
                        <button
                          className="copy-code-btn"
                          onClick={() => auth.token && navigator.clipboard.writeText(auth.token)}
                        >
                          Copy Token
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger & Session Actions */}
                  <div className="settings-panel danger-panel">
                    <div className="settings-panel-header">
                      <h3 style={{ color: '#fca5a5' }}>Session & Security Actions</h3>
                      <span style={{ color: '#f87171' }}>Active session controls</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <p style={{ color: '#cbd5e1', fontSize: '0.86rem', margin: 0 }}>
                        Terminating your session will revoke your active authentication token and log you out immediately.
                      </p>
                      <button
                        className="btn-danger-delete"
                        onClick={() => auth.logout()}
                      >
                        <IconLogOut size={14} />
                        <span>Sign Out Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="dashboard-modal-backdrop">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="dashboard-modal">
            <header className="modal-header">
              <h2>New Organization</h2>
              <button className="btn-close-modal" onClick={() => { setShowCreateModal(false); setErrorMsg('') }}>×</button>
            </header>
            <form onSubmit={handleCreateOrg}>
              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acme Corporation"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-input textarea"
                  placeholder="Context, workspace ownership goals..."
                  value={newOrgDesc}
                  onChange={(e) => setNewOrgDesc(e.target.value)}
                />
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => { setShowCreateModal(false); setErrorMsg('') }}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Create Organization
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Project Modal Scoped to Organization */}
      {showProjectModal && (
        <div className="dashboard-modal-backdrop">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="dashboard-modal">
            <header className="modal-header">
              <h2>New Project</h2>
              <button className="btn-close-modal" onClick={() => setShowProjectModal(false)}>×</button>
            </header>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Example: Customer Support AI"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Description</label>
                <textarea
                  className="form-input textarea"
                  placeholder="Example: AI assistant for answering customer support queries from our documentation."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Type / Use Case</label>
                <select
                  className="form-input"
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(e.target.value)}
                >
                  <option value="Customer Support">Customer Support</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Internal Knowledge Base">Internal Knowledge Base</option>
                  <option value="Research">Research</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {newProjectType === 'Custom' && (
                <div className="form-group">
                  <label className="form-label">Specify Custom Use Case *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Legal Document Search, Code Assistant..."
                    value={customProjectType}
                    onChange={(e) => setCustomProjectType(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Environment</label>
                <select
                  className="form-input"
                  value={newProjectEnv}
                  onChange={(e) => setNewProjectEnv(e.target.value)}
                >
                  <option value="Development">Development</option>
                  <option value="Production">Production</option>
                </select>
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowProjectModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Create Project
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
