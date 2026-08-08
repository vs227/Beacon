import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const auth = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing route */}
        <Route path="/" element={<LandingPage auth={auth} />} />

        {/* Protected Dashboard console route with wildcard sub-routes */}
        <Route
          path="/dashboard/*"
          element={
            auth.isLoggedIn ? (
              <Dashboard auth={auth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}