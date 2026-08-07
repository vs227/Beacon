import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Lucide v1.29 (your installed version) does not export Github, LogOut, User
// as named exports reliably. We use inline SVGs so the app always renders
// regardless of icon library version.

function IconGithub({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function IconUser({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconLogOut({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

// heroProgress: 0→1 from the hero section's scroll progress.
// auth: the object returned by hooks/useAuth.js (token, user, login, register, githubLogin, logout, isLoggedIn, lastError, pending)
export default function AuthOverlay({ heroProgress = 0, auth }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('register')
  const [response, setResponse] = useState(null)
  const [isError, setIsError] = useState(false)

  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Fade out as hero section scrolls — fully gone by heroProgress 0.40
  const fadeEnd = 0.40
  const rawT = Math.min(heroProgress / fadeEnd, 1)
  const opacity = 1 - rawT
  const translateY = rawT * -60

  const isHidden = opacity <= 0

  const show = (text, err = false) => {
    setResponse(text)
    setIsError(err)
  }

  // Mirror backend errors (from auth.lastError) into the response banner
  useEffect(() => {
    if (auth?.lastError) show(auth.lastError, true)
  }, [auth?.lastError])

  async function doRegister() {
    if (!regUsername || !regEmail || !regPassword) {
      show('Please fill in all fields', true)
      return
    }
    if (regUsername.length < 3) {
      show('Username must be at least 3 characters', true)
      return
    }
    if (regUsername.length > 30) {
      show('Username must be 30 characters or fewer', true)
      return
    }
    if (regPassword.length < 8) {
      show('Password must be at least 8 characters', true)
      return
    }

    const res = await auth.register({
      username: regUsername,
      email: regEmail,
      password: regPassword,
    })

    if (res.ok) {
      setLoginEmail(regEmail)
      setLoginPassword(regPassword)
      setTab('login')
      show('✓ Account created! Signing you in…', false)
      const loginRes = await auth.login({
        email: regEmail,
        password: regPassword,
      })
      if (loginRes.ok) {
        setRegUsername('')
        setRegEmail('')
        setRegPassword('')
        navigate('/dashboard/organizations', { replace: true })
      }
    }
  }

  async function doLogin() {
    if (!loginEmail || !loginPassword) {
      show('Please fill in all fields', true)
      return
    }
    const res = await auth.login({ email: loginEmail, password: loginPassword })
    if (res.ok) {
      show('✓ Logged in — welcome home!', false)
      setLoginEmail('')
      setLoginPassword('')
      navigate('/dashboard/organizations', { replace: true })
    }
  }

  function doGithub() {
    auth.githubLogin()
  }

  if (isHidden || auth?.isLoggedIn) return null

  return (
    <div
      className="auth-overlay-wrapper"
      style={{
        position: 'absolute',
        top: '50%',
        right: '6%',
        transform: `translateY(calc(-50% + ${translateY}px))`,
        zIndex: 200,
        opacity,
        pointerEvents: opacity < 0.15 ? 'none' : 'auto',
        transition: 'opacity 80ms linear',
      }}
    >
      <AnimatePresence mode="wait">
        {auth?.isLoggedIn ? (
          <motion.div
            key="logged-in"
            className="auth-overlay auth-overlay--welcome"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="auth-logo" style={{ marginBottom: '10px' }}>
              Welcome to Beacon
            </div>
            <div className="auth-avatar-row">
              <div className="auth-avatar">
                <IconUser />
              </div>
              <div className="auth-welcome-user">
                <div className="auth-welcome-name">
                  {auth.user?.username || auth.user?.email?.split('@')[0] || 'Explorer'}
                </div>
                <div className="auth-welcome-email">
                  {auth.user?.email || 'Signed in'}
                </div>
              </div>
            </div>

            <div className="auth-welcome-hint" style={{ marginBottom: '14px' }}>
              Your session is active. Enter your console workspace anytime.
            </div>

            <button 
              className="auth-btn-primary" 
              onClick={() => navigate('/dashboard')}
              style={{ marginBottom: '10px' }}
            >
              Enter Console Dashboard ➔
            </button>

            <button className="auth-btn-logout" onClick={auth.logout}>
              <IconLogOut />
              Sign out
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="auth-overlay"
            className="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="auth-logo" style={{ marginBottom: '14px' }}>
              Sign in to BEACON
            </div>

            <div className="auth-tabs">
              <button
                className={`auth-tab${tab === 'register' ? ' active' : ''}`}
                onClick={() => { setTab('register'); setResponse(null) }}
              >
                Register
              </button>
              <button
                className={`auth-tab${tab === 'login' ? ' active' : ''}`}
                onClick={() => { setTab('login'); setResponse(null) }}
              >
                Login
              </button>
            </div>

            <AnimatePresence mode="wait">
              {tab === 'register' && (
                <motion.div
                  key="reg"
                  className="auth-form"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <input
                    className="auth-input"
                    placeholder="Username"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                  />
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="Email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                  />
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="Password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                  />
                  <button
                    className="auth-btn-primary"
                    onClick={doRegister}
                    disabled={auth?.pending}
                  >
                    {auth?.pending ? 'Creating…' : 'Create Account'}
                  </button>
                </motion.div>
              )}
              {tab === 'login' && (
                <motion.div
                  key="log"
                  className="auth-form"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                  />
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                  />
                  <button
                    className="auth-btn-primary"
                    onClick={doLogin}
                    disabled={auth?.pending}
                  >
                    {auth?.pending ? 'Logging in…' : 'Login'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="auth-divider"><span>OR</span></div>

            <button className="auth-btn-github" onClick={doGithub}>
              <IconGithub />
              Continue with GitHub
            </button>

            {response && (
              <motion.div
                className="auth-response"
                style={{ color: isError ? '#ef4444' : '#22c55e' }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
              >
                {response}
              </motion.div>
            )}

            <div className="auth-scroll-hint">Scroll to explore ↓</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
