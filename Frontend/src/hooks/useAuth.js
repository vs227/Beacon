import { useEffect, useMemo, useState, useCallback } from 'react'

const TOKEN_KEY = 'beacon_token'
const USER_KEY = 'beacon_user'

// Fetch base URL. Using relative URLs lets the Vite dev proxy handle requests
// (see vite.config.js), so it works in dev AND any hosted env without changes.
export const API_BASE = ''

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  if (!token || token === 'beacon_session_active' || token.startsWith('demo_')) {
    return false
  }
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return true
      }
    }
  } catch {
    // Ignore parsing issues, rely on backend check
  }
  return false
}

/**
 * Hook that:
 *   1. On mount, reads ?token= from the URL (GitHub OAuth redirect)
 *      → saves to localStorage, cleans the URL so it doesn't linger
 *   2. Exposes token, user, login(), logout(), register(), githubLogin()
 *   3. Auto-fetches /me whenever a token is present (to keep user info fresh)
 *   4. Automatically logs out user if token is expired or responds with 401
 */
export function useAuth() {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(TOKEN_KEY) || ''
    if (saved && isTokenExpired(saved)) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      return ''
    }
    return saved
  })
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY) || ''
    if (savedToken && isTokenExpired(savedToken)) {
      return null
    }
    return readUser()
  })
  const [pending, setPending] = useState(false)
  const [lastError, setLastError] = useState('')
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  // 1) Consume OAuth callback query params (once on mount)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (!urlToken) return

    localStorage.setItem(TOKEN_KEY, urlToken)
    setToken(urlToken)
    setJustLoggedIn(true)

    const email = params.get('email')
    const username = params.get('username')
    const authType = params.get('auth')
    if (email) {
      const partial = {
        email,
        username: username || email.split('@')[0],
        auth_provider: authType || 'email',
        github_username: authType === 'github' ? username : '',
      }
      localStorage.setItem(USER_KEY, JSON.stringify(partial))
      setUser(partial)
    }

    // Strip auth query params from address bar / history
    const cleaned = window.location.pathname + (window.location.hash || '')
    window.history.replaceState({}, document.title, cleaned)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken('')
    setUser(null)
    setLastError('')
    setJustLoggedIn(false)
  }, [])

  // 2) Validate token & keep user info fresh by hitting /me when we have a token
  useEffect(() => {
    if (!token) { 
      setUser(null) 
      return 
    }

    if (isTokenExpired(token)) {
      logout()
      return
    }

    // Skip /me network check for local dev/synthetic session tokens
    if (token === 'beacon_session_active' || token.startsWith('demo_')) {
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const contentType = res.headers.get('content-type') || ''
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json()
          if (!cancelled && data.user) {
            setUser(data.user)
            localStorage.setItem(USER_KEY, JSON.stringify(data.user))
          }
        } else if (res.status === 401) {
          // Token expired or invalid — automatically log out
          if (!cancelled) logout()
        }
      } catch {
        // Network issues: retain cached session token & user
      }
    })()
    return () => { cancelled = true }
  }, [token, logout])

  const register = useCallback(async ({ username, email, password }) => {
    setPending(true)
    setLastError('')
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      return { ok: true, email, password }
    } catch (err) {
      setLastError(err.message)
      return { ok: false, error: err.message }
    } finally {
      setPending(false)
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setPending(true)
    setLastError('')
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      // Rate limit hit — show a specific friendly message
      if (res.status === 429) {
        throw new Error('🔒 Too many login attempts. Please wait a minute and try again.')
      }

      if (!res.ok) throw new Error(data.detail || 'Login failed')
      const newToken = data.access_token || 'beacon_session_active'
      localStorage.setItem(TOKEN_KEY, newToken)
      setToken(newToken)
      
      const userData = data.user || { email, username: email.split('@')[0] }
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setUser(userData)
      
      setJustLoggedIn(true)
      return { ok: true }
    } catch (err) {
      setLastError(err.message)
      return { ok: false, error: err.message }
    } finally {
      setPending(false)
    }
  }, [])

  const githubLogin = useCallback(() => {
    // Backend handles the redirect chain:
    //   /auth/github → GitHub authorize → /auth/github/callback → FRONTEND_AFTER_AUTH?token=...
    window.location.href = `${API_BASE}/auth/github`
  }, [])

  const dismissJustLoggedIn = useCallback(() => setJustLoggedIn(false), [])

  return useMemo(() => ({
    token,
    user,
    pending,
    lastError,
    justLoggedIn,
    dismissJustLoggedIn,
    isLoggedIn: !!token,
    login,
    register,
    logout,
    githubLogin,
  }), [token, user, pending, lastError, justLoggedIn, dismissJustLoggedIn, login, register, logout, githubLogin])
}
