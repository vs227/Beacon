import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LandingHeader from './landing/LandingHeader'
import './Dashboard.css'
import './LandingPage.css'


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
          } catch { }
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


      {/* Top Floating Landing-Style Navbar */}
      <LandingHeader
        auth={auth}
        isDashboard={true}
        activeTab={activeTab}
        selectedOrg={selectedOrg}
        onNavigate={navigate}
      />

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
                style={{ maxWidth: '1120px', width: '100%', margin: '0 auto', padding: '110px 24px 60px 24px' }}
              >
                {/* Developer Workspace Stats Bar - Compact Flex Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '40px',
                  marginBottom: '32px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingBottom: '24px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                      TOTAL ORGANIZATIONS
                    </div>
                    <div style={{ fontSize: '1.15rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.04em' }}>
                      {loadingOrgs ? '-' : orgs.length}
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                      WORKSPACE TIER
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      DEVELOPER FREE TIER
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                      VECTOR DATABASE
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      SUPABASE PGVECTOR
                    </div>
                  </div>
                </div>

                {/* Control Bar: Search Input & New Organization + Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '28px', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '16px', color: 'rgba(255, 255, 255, 0.4)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <IconSearch size={15} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search organizations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(16px)',
                        border: 'none',
                        borderRadius: '100px',
                        padding: '0 20px 0 42px',
                        height: '40px',
                        boxSizing: 'border-box',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontFamily: 'Outfit, sans-serif',
                        letterSpacing: '0.06em',
                        outline: 'none',
                        width: '320px',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(16px)',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontFamily: 'Outfit, sans-serif',
                      lineHeight: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                      e.currentTarget.style.color = '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                    }}
                    title="New organization"
                  >
                    +
                  </button>
                </div>

                {/* Organization Cards Grid */}
                {loadingOrgs ? (
                  <div className="spinner-container">
                    <div className="dashboard-spinner"></div>
                    <span>Loading organization directories...</span>
                  </div>
                ) : orgs.filter(o => o.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="empty-state" style={{ background: 'rgba(255, 255, 255, 0.025)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '54px 20px', borderRadius: '18px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                      {searchQuery ? 'No matching organizations found' : 'No Organizations Found'}
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.88rem', marginBottom: '20px' }}>
                      {searchQuery ? 'Try adjusting your search query.' : 'Create an organization to get started.'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-glassy"
                      >
                        + New organization
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {orgs
                      .filter(o => o.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((org) => (
                        <div
                          key={org.id || org.organization_id}
                          onClick={() => navigate(`/dashboard/org/${org.id || org.organization_id}`)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.035)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '22px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)'
                            e.currentTarget.style.transform = 'translateY(0px)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconOrgCluster size={18} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#fff', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                                {org.name}
                              </h2>
                              <div style={{ fontSize: '0.7rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>ACTIVE WORKSPACE</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                            ➔
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
                style={{ maxWidth: '1120px', width: '100%', margin: '0 auto', padding: '110px 24px 60px 24px' }}
              >
                {/* Developer Projects Stats Bar - Compact Flex Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '40px',
                  marginBottom: '32px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingBottom: '24px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                      TOTAL PROJECTS
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {loadingProjects ? '-' : projects.length}
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                      ACTIVE ORGANIZATION
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedOrg?.name || 'DEFAULT'}
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                      VECTOR DATABASE
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      SUPABASE PGVECTOR
                    </div>
                  </div>
                </div>

                {/* Control Bar: Search Input & New Project + Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <IconSearch size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        boxSizing: 'border-box',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: 'none',
                        borderRadius: '12px',
                        paddingLeft: '44px',
                        paddingRight: '16px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        fontFamily: 'Outfit, sans-serif',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    title="Create Project"
                    style={{
                      height: '40px',
                      width: '40px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '1.2rem',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Projects Cards Grid */}
                {loadingProjects ? (
                  <div className="spinner-container">
                    <div className="dashboard-spinner"></div>
                    <span>Loading projects...</span>
                  </div>
                ) : projects.filter(p => p.name?.toLowerCase().includes(projectSearchQuery.toLowerCase())).length === 0 ? (
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '60px 20px', borderRadius: '16px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '8px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                      {projectSearchQuery ? 'No matching projects found' : 'No Projects Found'}
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>
                      {projectSearchQuery ? 'Try adjusting your search query.' : 'Create a project inside this organization to build indexing and knowledge bases.'}
                    </p>
                    {!projectSearchQuery && (
                      <button
                        onClick={() => setShowProjectModal(true)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.88)',
                          border: 'none',
                          color: '#000',
                          borderRadius: '100px',
                          padding: '10px 24px',
                          fontSize: '0.86rem',
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + New project
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
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
                            background: 'rgba(255, 255, 255, 0.035)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '22px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)'
                            e.currentTarget.style.transform = 'translateY(0px)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconLayers size={18} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#fff', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                                {proj.name}
                              </h2>
                              <div style={{ fontSize: '0.7rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{(proj.project_type || proj.environment || 'DEVELOPMENT').toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                            ➔
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'workspaces' && (
              <motion.div key="workspaces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="dashboard-grid">
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
              <motion.div key="kbs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="dashboard-grid">
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
              <motion.div key="keys" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="keys-tab-container">
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
                style={{ maxWidth: '1120px', width: '100%', margin: '0 auto', padding: '110px 24px 60px 24px' }}
              >
                {/* Developer Account Stats Bar - Compact Flex Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '40px',
                  marginBottom: '32px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingBottom: '24px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                      ACCOUNT STATUS
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      ACTIVE ADMINISTRATOR
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                      AUTHENTICATION
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      BEARER JWT
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                      SECURITY TIER
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      DEVELOPER ENCRYPTED
                    </div>
                  </div>
                </div>

                {/* Profile Card & Info */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.035)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '24px 28px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    {(auth.user?.username || auth.user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                        {auth.user?.username || 'Beacon Developer'}
                      </h2>
                      <span style={{
                        fontSize: '0.68rem',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '4px 10px',
                        borderRadius: '100px'
                      }}>
                        Verified
                      </span>
                    </div>
                    <span style={{ fontSize: '0.86rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.5)' }}>
                      {auth.user?.email}
                    </span>
                  </div>
                </div>

                {/* Account Details & Settings Panel Grid */}
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Public Profile Fields */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.035)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '28px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)'
                  }}>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '20px', letterSpacing: '0.02em' }}>
                      Account & Access Profile
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px' }}>
                          USERNAME / DISPLAY NAME
                        </label>
                        <input
                          type="text"
                          value={auth.user?.username || ''}
                          readOnly
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            color: '#fff',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '0.88rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px' }}>
                          PRIMARY EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          value={auth.user?.email || ''}
                          readOnly
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            color: '#fff',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '0.88rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px' }}>
                          ACCOUNT ROLE
                        </label>
                        <input
                          type="text"
                          value="Workspace Administrator"
                          readOnly
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            color: '#fff',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '0.88rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px' }}>
                          AUTHENTICATION METHOD
                        </label>
                        <input
                          type="text"
                          value="Bearer JWT / OAuth Pass"
                          readOnly
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            color: '#fff',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '0.88rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security & API Credentials Section */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.035)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '28px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)'
                  }}>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '20px', letterSpacing: '0.02em' }}>
                      Security & Access Credentials
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '16px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '14px' }}>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                            User Account Identifier (UUID)
                          </div>
                          <div style={{ fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)' }}>
                            Global unique user reference for API requests
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <code style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.7)', background: 'rgba(0, 0, 0, 0.4)', padding: '6px 12px', borderRadius: '8px' }}>
                            {auth.user?.user_id || 'Generating...'}
                          </code>
                          <button
                            onClick={() => auth.user?.user_id && navigator.clipboard.writeText(auth.user.user_id)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: 'none',
                              borderRadius: '100px',
                              padding: '6px 16px',
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontFamily: 'Outfit, sans-serif',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Copy ID
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '16px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '14px' }}>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                            Active JWT Access Token
                          </div>
                          <div style={{ fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.45)' }}>
                            Current session authorization token
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <code style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.7)', background: 'rgba(0, 0, 0, 0.4)', padding: '6px 12px', borderRadius: '8px' }}>
                            {auth.token ? `${auth.token.substring(0, 24)}...` : 'No Token'}
                          </code>
                          <button
                            onClick={() => auth.token && navigator.clipboard.writeText(auth.token)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: 'none',
                              borderRadius: '100px',
                              padding: '6px 16px',
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontFamily: 'Outfit, sans-serif',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Copy Token
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Danger & Session Actions */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.035)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '24px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)'
                  }}>
                    <div>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#fff', margin: '0 0 4px 0' }}>
                        Session Termination
                      </h3>
                      <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', margin: 0 }}>
                        Revoke active authentication token and log out of workspace.
                      </p>
                    </div>
                    <button
                      onClick={() => auth.logout()}
                      style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: 'none',
                        borderRadius: '100px',
                        padding: '10px 24px',
                        color: '#f87171',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <IconLogOut size={14} />
                      <span>Sign Out Account</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div
          className="dashboard-modal-backdrop"
          onClick={() => { setShowCreateModal(false); setErrorMsg('') }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="dashboard-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.035)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: 'none',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
            }}
          >
            <header className="modal-header" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', margin: 0 }}>New Organization</h2>
              <button className="btn-close-modal" onClick={() => { setShowCreateModal(false); setErrorMsg('') }}>×</button>
            </header>
            <form onSubmit={handleCreateOrg}>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px', display: 'block' }}>ORGANIZATION NAME</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder=""
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px', display: 'block' }}>DESCRIPTION (OPTIONAL)</label>
                <textarea
                  className="form-input textarea"
                  placeholder=""
                  value={newOrgDesc}
                  onChange={(e) => setNewOrgDesc(e.target.value)}
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: '90px' }}
                />
              </div>
              <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: 'none', paddingTop: 0 }}>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setErrorMsg('') }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '10px 24px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'rgba(255, 255, 255, 0.88)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '10px 24px',
                    color: '#000000',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Create Organization
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Project Modal Scoped to Organization */}
      {showProjectModal && (
        <div
          className="dashboard-modal-backdrop"
          onClick={() => setShowProjectModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="dashboard-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.035)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: 'none',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
            }}
          >
            <header className="modal-header" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', margin: 0 }}>New Project</h2>
              <button className="btn-close-modal" onClick={() => setShowProjectModal(false)}>×</button>
            </header>
            <form onSubmit={handleCreateProject}>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px', display: 'block' }}>PROJECT NAME</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder=""
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px', display: 'block' }}>PROJECT DESCRIPTION</label>
                <textarea
                  className="form-input textarea"
                  placeholder=""
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px', display: 'block' }}>PROJECT TYPE / USE CASE</label>
                <select
                  className="form-input"
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(e.target.value)}
                  style={{ background: 'rgba(20, 20, 26, 0.95)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
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
                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px', display: 'block' }}>SPECIFY CUSTOM USE CASE</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder=""
                    value={customProjectType}
                    onChange={(e) => setCustomProjectType(e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px', display: 'block' }}>ENVIRONMENT</label>
                <select
                  className="form-input"
                  value={newProjectEnv}
                  onChange={(e) => setNewProjectEnv(e.target.value)}
                  style={{ background: 'rgba(20, 20, 26, 0.95)', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="Development">Development</option>
                  <option value="Production">Production</option>
                </select>
              </div>

              <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: 'none', paddingTop: 0 }}>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '10px 24px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'rgba(255, 255, 255, 0.88)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '10px 24px',
                    color: '#000000',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
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
