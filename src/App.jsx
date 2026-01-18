import { useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Featured from './pages/Featured.jsx'
import Properties from './pages/Properties.jsx'
import PropertyForm from './pages/PropertyForm.jsx'
import Queries from './pages/Queries.jsx'
import Ratings from './pages/Ratings.jsx'
import Users from './pages/Users.jsx'
import { clearAdminToken, getAdminToken } from './services/token'

function App() {
  const [token, setToken] = useState(() => getAdminToken())
  const isAuthed = useMemo(() => Boolean(token), [token])

  return (
    <BrowserRouter>
      <AppRoutes
        isAuthed={isAuthed}
        onLoggedIn={(tok) => setToken(tok)}
        onLogout={() => {
          clearAdminToken()
          setToken('')
        }}
      />
    </BrowserRouter>
  )
}

export default App

function AppRoutes({ isAuthed, onLoggedIn, onLogout }) {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthed ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AdminLogin
              onLoggedIn={(tok) => {
                onLoggedIn(tok)
                navigate('/dashboard', { replace: true })
              }}
            />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthed ? (
            <Dashboard
              onLogout={() => {
                onLogout()
                navigate('/login', { replace: true })
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/properties"
        element={
          isAuthed ? (
            <Properties
              onLogout={() => {
                onLogout()
                navigate('/login', { replace: true })
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/properties/new"
        element={
          isAuthed ? (
            <PropertyForm
              onLogout={() => {
                onLogout()
                navigate('/login', { replace: true })
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/properties/:id/edit"
        element={
          isAuthed ? (
            <PropertyForm
              onLogout={() => {
                onLogout()
                navigate('/login', { replace: true })
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/queries"
        element={
          isAuthed ? (
            <Queries
              onLogout={() => {
                onLogout()
                navigate('/login', { replace: true })
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/ratings"
        element={
          isAuthed ? (
            <Ratings
              onLogout={() => {
                onLogout()
                navigate('/login', { replace: true })
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/featured"
        element={
          isAuthed ? (
            <Featured
              onLogout={() => {
                onLogout()
                navigate('/login', { replace: true })
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/users"
        element={
          isAuthed ? (
            <Users
              onLogout={() => {
                onLogout()
                navigate('/login', { replace: true })
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/" element={<Navigate to={isAuthed ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to={isAuthed ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
