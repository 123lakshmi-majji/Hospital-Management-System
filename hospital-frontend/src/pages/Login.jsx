import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axiosConfig.js'
import { useAuth } from '../context/AuthContext.jsx'
import { loginUser } from '../api/authApi.js'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { user, login, authReady } = useAuth()
  const navigate = useNavigate()

  // If already logged in, redirect to role dashboard
  useEffect(() => {
    if (authReady && user) {
      if (user.role === 'ADMIN') navigate('/admin', { replace: true })
      else if (user.role === 'DOCTOR') navigate('/doctor', { replace: true })
      else if (user.role === 'PATIENT') navigate('/patient', { replace: true })
      else if (user.role === 'RECEPTIONIST') navigate('/receptionist', { replace: true })
    }
  }, [authReady, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { username, password })
      const { token, username: u, role } = res.data
      login(token, u, role)

      if (role === 'ADMIN') navigate('/admin')
      else if (role === 'DOCTOR') navigate('/doctor')
      else if (role === 'PATIENT') navigate('/patient')
      else if (role === 'RECEPTIONIST') navigate('/receptionist')
      else navigate('/')
    } catch (err) {
      if (err.message === 'Network Error') setError('Cannot connect to server. Is the backend running?')
      else if (err.response?.data?.message) setError(err.response.data.message)
      else setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // While checking auth state, show a small loader
  if (!authReady) {
    return (
      <div className="premium-auth-page">
        <div className="dashboard-loading">
          <span className="spinner-border spinner-border-sm"></span>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="premium-auth-page">
      <div className="premium-auth-card">
        <div className="premium-brand-panel">
          <div className="premium-brand-icon">
            <i className="bi bi-heart-pulse-fill"></i>
          </div>
          <div className="premium-brand-content">
            <h2 className="premium-brand-title">Welcome Back to Hospivexa</h2>
            <p className="premium-brand-subtitle">
              Sign in to access your personalized hospital dashboard.
            </p>
            <ul className="premium-feature-list">
              <li><i className="bi bi-shield-lock"></i>Secure JWT authentication</li>
              <li><i className="bi bi-people"></i>Role-based access control</li>
              <li><i className="bi bi-activity"></i>Real-time medical records</li>
            </ul>
          </div>
          <div className="premium-brand-footer">
            © 2026 Hospivexa · Hospital Management System
          </div>
        </div>

        <div className="premium-form-panel">
          <h1 className="premium-form-title">Sign In</h1>
          <p className="premium-form-subtitle">Enter your credentials to continue</p>

          {error && (
            <div className="premium-alert danger">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="premium-input-group">
              <i className="bi bi-person input-icon"></i>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="premium-input-group">
              <i className="bi bi-lock input-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>

            <button type="submit" className="premium-btn primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="premium-divider">NEW HERE?</div>

          <Link to="/signup/patient" className="premium-btn outline">
            <i className="bi bi-person-plus"></i>
            Register as Patient
          </Link>

          <div className="premium-footer-link">
            <Link to="/">
              <i className="bi bi-arrow-left me-1"></i>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}