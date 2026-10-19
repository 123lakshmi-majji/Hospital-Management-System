import { useState, useEffect } from 'react'
import api from '../api/axiosConfig.js'

export default function ProfileModal({ user, onClose }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

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
      // ADMIN and RECEPTIONIST have no separate profile entity
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
    },
    DOCTOR: {
      icon: 'bi-heart-pulse-fill',
      color: 'doctor',
      title: 'Doctor',
      subtitle: 'Medical staff',
    },
    PATIENT: {
      icon: 'bi-person-heart',
      color: 'patient',
      title: 'Patient',
      subtitle: 'Registered patient',
    },
    RECEPTIONIST: {
      icon: 'bi-headset',
      color: 'receptionist',
      title: 'Receptionist',
      subtitle: 'Front desk staff',
    },
  }

  const cfg = roleConfig[user.role] || roleConfig.PATIENT

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`profile-modal-header ${cfg.color}`}>
          <button className="profile-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>

          <div className={`profile-avatar ${cfg.color}`}>
            <i className={`bi ${cfg.icon}`}></i>
          </div>

          <div className="profile-header-text">
            <h3 className="profile-username">{user.username}</h3>
            <span className={`profile-role-chip ${cfg.color}`}>
              <i className={`bi ${cfg.icon}`}></i>
              {user.role}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="profile-modal-body">
          {loading ? (
            <div className="dashboard-loading">
              <span className="spinner-border spinner-border-sm"></span>
              Loading profile...
            </div>
          ) : error ? (
            <div className="premium-alert danger">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Role description */}
              <div className="profile-section">
                <h6 className="profile-section-title">
                  <i className="bi bi-info-circle"></i>
                  {cfg.title}
                </h6>
                <p className="profile-desc">{cfg.subtitle}</p>
              </div>

              {/* Doctor profile details */}
              {user.role === 'DOCTOR' && profile && (
                <div className="profile-section">
                  <h6 className="profile-section-title">
                    <i className="bi bi-clipboard2-pulse"></i>
                    Professional Information
                  </h6>
                  <div className="profile-info-grid">
                    <InfoItem icon="bi-person" label="Name" value={profile.name} />
                    <InfoItem icon="bi-heart-pulse" label="Specialization" value={profile.specialization} />
                    <InfoItem icon="bi-building" label="Department" value={profile.department || '—'} />
                    <InfoItem icon="bi-telephone" label="Phone" value={profile.phone} />
                    <InfoItem icon="bi-envelope" label="Email" value={profile.email || '—'} />
                    <InfoItem icon="bi-calendar-week" label="Experience" value={`${profile.experience} years`} />
                  </div>
                </div>
              )}

              {/* Patient profile details */}
              {user.role === 'PATIENT' && profile && (
                <div className="profile-section">
                  <h6 className="profile-section-title">
                    <i className="bi bi-person-vcard"></i>
                    Personal Information
                  </h6>
                  <div className="profile-info-grid">
                    <InfoItem icon="bi-person" label="Full Name" value={profile.name} />
                    <InfoItem icon="bi-123" label="Age" value={profile.age} />
                    <InfoItem icon="bi-gender-ambiguous" label="Gender" value={profile.gender} />
                    <InfoItem icon="bi-telephone" label="Phone" value={profile.phone} />
                    <InfoItem icon="bi-envelope" label="Email" value={profile.email || '—'} />
                    <InfoItem icon="bi-droplet" label="Blood Group" value={profile.bloodGroup || '—'} />
                    <InfoItem icon="bi-house" label="Address" value={profile.address || '—'} />
                    <InfoItem icon="bi-telephone-plus" label="Emergency" value={profile.emergencyContact || '—'} />
                  </div>
                </div>
              )}

              {/* Admin / Receptionist */}
              {(user.role === 'ADMIN' || user.role === 'RECEPTIONIST') && (
                <div className="profile-section">
                  <h6 className="profile-section-title">
                    <i className="bi bi-person-badge"></i>
                    Account Information
                  </h6>
                  <div className="profile-info-grid">
                    <InfoItem icon="bi-person" label="Username" value={user.username} />
                    <InfoItem icon="bi-shield-check" label="Role" value={user.role} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="profile-modal-footer">
          <button className="premium-btn outline" onClick={onClose} style={{ width: 'auto' }}>
            <i className="bi bi-x-lg"></i>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="profile-info-item">
      <div className="profile-info-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <div>
        <div className="profile-info-label">{label}</div>
        <div className="profile-info-value">{value}</div>
      </div>
    </div>
  )
}