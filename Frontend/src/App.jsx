import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import ProjectPage from './components/ProjectPage'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const auth = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing route */}
        <Route path="/" element={<LandingPage auth={auth} />} />

        {/* Project detail page — matched before dashboard wildcard */}
        <Route
          path="/dashboard/org/:orgId/project/:projectId"
          element={
            auth.isLoggedIn ? (
              <ProjectPage auth={auth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

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