import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LandingHeader({
  auth,
  activeSection,
  scrollProgress = 0,
  onScrollToSection,
  onScrollToTop,
  onNavigate,
  isDashboard = false,
  activeTab = 'organizations',
  selectedOrg = null,
  projectName = null,
  navItems = null,
  onSelectTab = null,
}) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const landingNavItems = [
    { label: 'STEPS', index: 5 },
    { label: 'SDK', index: 6 },
    { label: 'ARCH', index: 8 },
  ]

  const dashboardNavItems = [
    { label: 'ORGANIZATIONS', path: '/dashboard/organizations', tab: 'organizations' },
    ...(selectedOrg ? [{ label: 'PROJECTS', path: `/dashboard/org/${selectedOrg?.id || selectedOrg?.organization_id}`, tab: 'projects' }] : []),
    { label: 'SETTINGS', path: '/dashboard/settings', tab: 'settings' },
  ]

  const NavPill = () => {
    if (navItems && navItems.length > 0) {
      return (
        <ul className="nav-links">
          {navItems.map((item) => {
            const itemId = item.id || item.tab || item.label
            const isActive = activeTab === itemId
            return (
              <li key={itemId}>
                <button
                  onClick={() => {
                    if (item.onClick) item.onClick()
                    else if (onSelectTab) onSelectTab(itemId)
                    else if (item.path && onNavigate) onNavigate(item.path)
                  }}
                  className={`nav-link${isActive ? ' nav-link--active' : ''}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="projNavActivePill"
                      className="nav-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="nav-link-text">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )
    }

    if (isDashboard) {
      return (
        <ul className="nav-links">
          {dashboardNavItems.map((item) => {
            const isActive = activeTab === item.tab
            return (
              <li key={item.label}>
                <button
                  onClick={() => onNavigate(item.path)}
                  className={`nav-link${isActive ? ' nav-link--active' : ''}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="dashNavActivePill"
                      className="nav-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="nav-link-text">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )
    }

    return (
      <ul className="nav-links">
        {auth?.isLoggedIn && (
          <li>
            <button
              onClick={() => onNavigate('/dashboard/organizations')}
              className="nav-link nav-link--dashboard"
            >
              <span className="nav-link-text">Dashboard</span>
            </button>
          </li>
        )}

        {landingNavItems.map((item) => {
          const isActive = activeSection === item.index
          return (
            <li key={item.label}>
              <button
                onClick={() => onScrollToSection?.(item.index)}
                className={`nav-link${isActive ? ' nav-link--active' : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navActivePill"
                    className="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="nav-link-text">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <header className="nav-header" style={{ zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="logo-text" onClick={() => onNavigate ? onNavigate('/dashboard/organizations') : onScrollToTop?.()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Beacon</span>
        {projectName && (
          <>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.9rem' }}>/</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', fontWeight: 500, letterSpacing: 'normal', textTransform: 'none' }}>
              {projectName}
            </span>
          </>
        )}
      </div>

      <div className="navbar-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <NavPill />

        {auth?.isLoggedIn && (
          <>
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
                    style={{ position: 'absolute', right: 0, top: '48px' }}
                  >
                    <div className="dropdown-header">
                      <span className="dropdown-username">{auth.user?.username || 'Explorer'}</span>
                      <span className="dropdown-email">{auth.user?.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item" onClick={() => { setShowProfileDropdown(false); onNavigate('/dashboard/organizations') }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                      <span>Organizations</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowProfileDropdown(false); onNavigate('/dashboard/settings') }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                      <span>Account Settings</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout" onClick={() => { setShowProfileDropdown(false); auth.logout() }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </header>
  )
}
