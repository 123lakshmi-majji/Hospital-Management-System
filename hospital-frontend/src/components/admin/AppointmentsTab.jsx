import { useState, useEffect } from 'react'
import { getAppointments, updateAppointmentStatus } from '../../api/adminApi.js'
import { formatTime12 } from '../../utils/timeFormat.js'

// ✅ ADDED: Receive showToast prop from AdminDashboard
export default function AppointmentsTab({ onStatsChange, showToast }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const res = await getAppointments()
      setAppointments(res.data)
    } catch (err) {
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  // ✅ REMOVED window.confirm, using showToast instead
  const handleCancel = async (id) => {
    try {
      await updateAppointmentStatus(id, 'CANCELLED')
      if (showToast) showToast('Appointment cancelled successfully!', 'success')
      loadAppointments()
      if (onStatsChange) onStatsChange()
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to cancel', 'danger')
    }
  }

  // ✅ REMOVED window.confirm, using showToast instead
  const handleComplete = async (id) => {
    try {
      await updateAppointmentStatus(id, 'COMPLETED')
      if (showToast) showToast('Appointment marked as completed!', 'success')
      loadAppointments()
      if (onStatsChange) onStatsChange()
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to complete', 'danger')
    }
  }

  const statusClass = (status) => {
    const map = {
      SCHEDULED: 'scheduled',
      CONFIRMED: 'confirmed',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    }
    return map[status] || 'scheduled'
  }

  const statusIcon = (status) => {
    const map = {
      SCHEDULED: 'bi-clock',
      CONFIRMED: 'bi-check-circle',
      COMPLETED: 'bi-check-circle-fill',
      CANCELLED: 'bi-x-circle',
    }
    return map[status] || 'bi-clock'
  }

  const filtered = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter)

  return (
    <div>
      <div className="tab-toolbar">
        <h5>Appointments <span>({appointments.length})</span></h5>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--hms-muted)', fontWeight: 600 }}>
            Filter:
          </label>
          <select
            className="premium-input-group"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '0.55rem 1rem',
              border: '1.5px solid var(--hms-border)',
              borderRadius: '10px',
              background: '#f8fafc',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--hms-text)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="premium-alert danger">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <span className="spinner-border spinner-border-sm"></span>
          Loading appointments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-calendar2-x"></i>
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td><strong>#{a.id}</strong></td>
                  <td><div style={{ fontWeight: 600 }}>{a.patient?.name}</div></td>
                  <td>{a.doctor?.name}</td>
                  <td>{a.appointmentDate}</td>
                  <td>
                    <span className="time-chip">
                      <i className="bi bi-clock"></i>
                      {formatTime12(a.appointmentTime)}
                    </span>
                  </td>
                  <td>{a.reason}</td>
                  <td>
                    <span className={`status-badge ${statusClass(a.status)}`}>
                      <i className={`bi ${statusIcon(a.status)}`}></i>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') ? (
                      <div className="action-group">
                        <button
                          className="row-btn complete"
                          onClick={() => handleComplete(a.id)}
                        >
                          <i className="bi bi-check-lg"></i>
                          Complete
                        </button>
                        <button
                          className="row-btn delete"
                          onClick={() => handleCancel(a.id)}
                        >
                          <i className="bi bi-x-lg"></i>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}