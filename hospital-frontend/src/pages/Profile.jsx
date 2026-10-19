import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      if (user.role === 'DOCTOR') {
        const res = await api.get('/api/doctors/me')
        setProfile(res.data)
      } else if (user.role === 'PATIENT') {
        const res = await api.get('/api/patients/me')
        setProfile(res.data)
      }
    } catch (err) {
      console.error('[PROFILE]', err)
      setError(err.response?.data?.message || 'Could not load profile details')
    } finally {
      setLoading(false)
    }
  }

  const roleConfig = {
    ADMIN: {
      icon: 'bi-shield-fill-check',
      color: 'admin',
      title: 'Administrator',
      subtitle: 'Full system access',
      home: '/admin',
    },
    DOCTOR: {
      icon: 'bi-heart-pulse-fill',
      color: 'doctor',
      title: 'Doctor',
      subtitle: 'Medical staff',
      home: '/doctor',
    },
    PATIENT: {
      icon: 'bi-person-heart',
      color: 'patient',
      title: 'Patient',
      subtitle: 'Registered patient',
      home: '/patient',
    },
    RECEPTIONIST: {
      icon: 'bi-headset',
      color: 'receptionist',
      title: 'Receptionist',
      subtitle: 'Front desk staff',
      home: '/receptionist',
    },
  }

  if (!user) return null

  const cfg = roleConfig[user.role] || roleConfig.PATIENT

  return (
    <div className="profile-page">
      {/* HERO HEADER */}
      <section className={`profile-hero ${cfg.color}`}>
        <div className="profile-hero-overlay">
          <div className="profile-hero-content">
            {/* Back button */}
            <button
              className="profile-back-btn"
              onClick={() => navigate(cfg.home)}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Dashboard
            </button>

            {/* Avatar + info */}
            <div className="profile-hero-main">
              <div className="profile-hero-avatar">
                <i className={`bi ${cfg.icon}`}></i>
              </div>
              <div className="profile-hero-text">
                <span className="profile-hero-role-chip">
                  <i className={`bi ${cfg.icon}`}></i>
                  {user.role}
                </span>
                <h1 className="profile-hero-username">{user.username}</h1>
                <p className="profile-hero-subtitle">
                  {cfg.title} · {cfg.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="profile-content">
        <div className="profile-container">
          {loading ? (
            <div className="dashboard-loading">
              <span className="spinner-border spinner-border-sm"></span>
              Loading your profile...
            </div>
          ) : error ? (
            <div className="premium-alert danger">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Doctor profile */}
              {user.role === 'DOCTOR' && profile && (
                <ProfileSection
                  title="Professional Information"
                  icon="bi-clipboard2-pulse"
                  items={[
                    { icon: 'bi-person', label: 'Full Name', value: profile.name },
                    { icon: 'bi-heart-pulse', label: 'Specialization', value: profile.specialization },
                    { icon: 'bi-building', label: 'Department', value: profile.department || '—' },
                    { icon: 'bi-telephone', label: 'Phone', value: profile.phone },
                    { icon: 'bi-envelope', label: 'Email', value: profile.email || '—' },
                    { icon: 'bi-calendar-week', label: 'Experience', value: `${profile.experience} years` },
                  ]}
                />
              )}

              {/* Patient profile */}
              {user.role === 'PATIENT' && profile && (
                <>
                  <ProfileSection
                    title="Personal Information"
                    icon="bi-person-vcard"
                    items={[
                      { icon: 'bi-person', label: 'Full Name', value: profile.name },
                      { icon: 'bi-123', label: 'Age', value: profile.age },
                      { icon: 'bi-gender-ambiguous', label: 'Gender', value: profile.gender },
                      { icon: 'bi-droplet', label: 'Blood Group', value: profile.bloodGroup || '—' },
                    ]}
                  />
                  <ProfileSection
                    title="Contact Details"
                    icon="bi-telephone"
                    items={[
                      { icon: 'bi-telephone', label: 'Phone', value: profile.phone },
                      { icon: 'bi-envelope', label: 'Email', value: profile.email || '—' },
                      { icon: 'bi-telephone-plus', label: 'Emergency Contact', value: profile.emergencyContact || '—' },
                      { icon: 'bi-house', label: 'Address', value: profile.address || '—' },
                    ]}
                  />
                </>
              )}

              {/* Admin / Receptionist */}
              {(user.role === 'ADMIN' || user.role === 'RECEPTIONIST') && (
                <ProfileSection
                  title="Account Information"
                  icon="bi-person-badge"
                  items={[
                    { icon: 'bi-person', label: 'Username', value: user.username },
                    { icon: 'bi-shield-check', label: 'Role', value: user.role },
                    { icon: 'bi-info-circle', label: 'Description', value: cfg.subtitle },
                  ]}
                />
              )}

              {/* Quick actions */}
              <div className="profile-quick-actions">
                <h5 className="profile-section-heading">
                  <i className="bi bi-lightning-charge-fill"></i>
                  Quick Actions
                </h5>
                <div className="profile-actions-grid">
                  <button
                    className="profile-action-btn"
                    onClick={() => navigate(cfg.home)}
                  >
                    <i className="bi bi-speedometer2"></i>
                    <span>Go to Dashboard</span>
                  </button>
                  <button
                    className="profile-action-btn"
                    onClick={() => navigate('/')}
                  >
                    <i className="bi bi-house-door"></i>
                    <span>Home</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileSection({ title, icon, items }) {
  return (
    <div className="profile-card">
      <h5 className="profile-section-heading">
        <i className={`bi ${icon}`}></i>
        {title}
      </h5>
      <div className="profile-info-grid">
        {items.map((item, idx) => (
          <div className="profile-info-item" key={idx}>
            <div className="profile-info-icon">
              <i className={`bi ${item.icon}`}></i>
            </div>
            <div className="profile-info-text">
              <div className="profile-info-label">{item.label}</div>
              <div className="profile-info-value">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}