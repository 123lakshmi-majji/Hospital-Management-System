import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import NotificationBell from './NotificationBell.jsx'

export default function Navbar() {
  const { user, logout, authReady } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleHome = (role) => {
    switch (role) {
      case 'ADMIN': return '/admin'
      case 'DOCTOR': return '/doctor'
      case 'PATIENT': return '/patient'
      case 'RECEPTIONIST': return '/receptionist'
      default: return '/'
    }
  }

  const showUser = authReady && user

  return (
    <nav className="navbar hms-navbar">
      <div className="container">
        <Link className="navbar-brand" to={showUser ? roleHome(showUser.role) : '/'}>
          <span className="brand-logo">
            <i className="bi bi-heart-pulse-fill"></i>
          </span>
          <span>Hospivexa</span>
        </Link>

        <div className="d-flex align-items-center gap-2">
          {showUser ? (
            <>
              <Link className="btn btn-outline-light btn-sm" to={roleHome(showUser.role)}>
                <i className="bi bi-speedometer2 me-1"></i>
                <span className="d-none d-sm-inline">Dashboard</span>
              </Link>

              {/* 🔔 Notification Bell */}
              <NotificationBell />

              <button
                className="navbar-user-btn"
                onClick={() => navigate('/profile')}
                title="View profile"
              >
                <i className="bi bi-person-circle"></i>
                <span className="d-none d-sm-inline">{showUser.username}</span>
              </button>

              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i>
                <span className="d-none d-sm-inline ms-1">Logout</span>
              </button>
            </>
          ) : (
            <Link className="btn btn-outline-light btn-sm" to="/login">
              <i className="bi bi-box-arrow-in-right me-1"></i> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}