import { useState, useEffect } from 'react'
import {
  getMyDoctorProfile,
  getMyAppointments,
  createMedicalRecord,
  createPrescription,
  getMedicalRecordsByPatient,
  getPrescriptionsByPatient,
  updateAppointmentStatus,
  getEmergencyCases,
} from '../api/doctorApi.js'
import { formatTime12 } from '../utils/timeFormat.js'

export default function DoctorDashboard() {
  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [emergencyCases, setEmergencyCases] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('scheduled')

  const [showEmergencyModal, setShowEmergencyModal] = useState(false)

  // Toast Notification State
  const [toast, setToast] = useState({ message: '', type: 'success' })

  // Forms
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [showPrescForm, setShowPrescForm] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [recordForm, setRecordForm] = useState({ diagnosis: '', treatment: '', notes: '' })
  const [prescForm, setPrescForm] = useState({ medicine: '', dosage: '', duration: '', instructions: '' })
  const [saving, setSaving] = useState(false)

  // History modal
  const [historyAppt, setHistoryAppt] = useState(null)
  const [historyRecords, setHistoryRecords] = useState([])
  const [historyPrescriptions, setHistoryPrescriptions] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadEmergency, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: '', type: 'success' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const p = await getMyDoctorProfile()
      setProfile(p.data)
      
      const a = await getMyAppointments(p.data.id)
      setAppointments(a.data)
      
      // ✅ FILTER: Only show emergency cases assigned to THIS doctor
      const e = await getEmergencyCases()
      const myEmergencyCases = e.data.filter(
        (c) => c.attendingDoctor === p.data.name
      )
      setEmergencyCases(myEmergencyCases)

    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not load your doctor profile. Ask admin to link your account.'
      )
    } finally {
      setLoading(false)
    }
  }

  const loadEmergency = async () => {
    try {
      const e = await getEmergencyCases()
      // ✅ FILTER: Only show emergency cases assigned to THIS doctor
      if (profile?.name) {
        const myEmergencyCases = e.data.filter(
          (c) => c.attendingDoctor === profile.name
        )
        setEmergencyCases(myEmergencyCases)
      }
    } catch (err) {
      // silently ignore
    }
  }

  const sortNewestFirst = (list) => [...list].sort((a, b) => b.id - a.id)

  const scheduledList = sortNewestFirst(
    appointments.filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
  )
  const completedList = sortNewestFirst(
    appointments.filter((a) => a.status === 'COMPLETED')
  )
  const cancelledList = sortNewestFirst(
    appointments.filter((a) => a.status === 'CANCELLED')
  )

  const handleMarkCompleted = async (id) => {
    try {
      await updateAppointmentStatus(id, 'COMPLETED')
      showToast('Appointment marked as completed!')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', 'danger')
    }
  }

  const openRecordForm = (appt) => {
    setSelectedAppt(appt)
    setRecordForm({ diagnosis: '', treatment: '', notes: '' })
    setShowRecordForm(true)
  }

  const openPrescForm = (appt) => {
    setSelectedAppt(appt)
    setPrescForm({ medicine: '', dosage: '', duration: '', instructions: '' })
    setShowPrescForm(true)
  }

  const submitRecord = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createMedicalRecord(selectedAppt.id, recordForm)
      setShowRecordForm(false)
      showToast('Medical record saved successfully!')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save record', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const submitPresc = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createPrescription(selectedAppt.id, prescForm)
      setShowPrescForm(false)
      showToast('Prescription saved successfully!')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save prescription', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const openHistory = async (appt) => {
    setHistoryAppt(appt)
    setHistoryLoading(true)
    try {
      const [r, p] = await Promise.all([
        getMedicalRecordsByPatient(appt.patient.id),
        getPrescriptionsByPatient(appt.patient.id),
      ])
      setHistoryRecords(r.data)
      setHistoryPrescriptions(p.data)
    } catch (err) {
      setHistoryRecords([])
      setHistoryPrescriptions([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const closeHistory = () => {
    setHistoryAppt(null)
    setHistoryRecords([])
    setHistoryPrescriptions([])
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

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-loading">
            <span className="spinner-border spinner-border-sm"></span>
            Loading your dashboard...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="premium-alert danger">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'scheduled', label: 'Scheduled', icon: 'bi-clock-history', count: scheduledList.length },
    { id: 'completed', label: 'Completed', icon: 'bi-check-circle-fill', count: completedList.length },
    { id: 'cancelled', label: 'Cancelled', icon: 'bi-x-circle-fill', count: cancelledList.length },
  ]

  return (
    <div className="dashboard-page">
      
      {/* Toast Notification UI */}
      {toast.message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'danger' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <i className={`bi ${toast.type === 'danger' ? 'bi-exclamation-circle-fill' : toast.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`}></i>
          <span style={{ fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Doctor Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome, {profile?.name} — {profile?.specialization}
            </p>
          </div>
          <span className="dashboard-role-badge doctor-badge">
            <i className="bi bi-heart-pulse-fill"></i>
            DOCTOR
          </span>
        </div>

        {/* 🚨 EMERGENCY ALERT BANNER */}
        {emergencyCases.length > 0 && (
          <div
            className="doctor-emergency-banner"
            onClick={() => setShowEmergencyModal(true)}
            role="button"
            title="Click to view emergency cases"
          >
            <span className="doctor-emergency-pulse"></span>
            <div className="doctor-emergency-icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div className="doctor-emergency-text">
              <strong>🚨 {emergencyCases.length} EMERGENCY CASE{emergencyCases.length > 1 ? 'S' : ''} PENDING</strong>
              <span>Click to view details and respond immediately</span>
            </div>
            <i className="bi bi-chevron-right doctor-emergency-arrow"></i>
          </div>
        )}

        {/* Stats */}
        <div className="stat-grid">
          <StatCard icon="bi-calendar2-week-fill" label="Total Appointments" value={appointments.length} variant="appointments" />
          <StatCard icon="bi-clock-history" label="Pending" value={scheduledList.length} variant="scheduled" />
          <StatCard icon="bi-check-circle-fill" label="Completed" value={completedList.length} variant="completed" />
          <StatCard icon="bi-exclamation-triangle-fill" label="Emergency Cases" value={emergencyCases.length} variant="cancelled" />
        </div>

        {/* Content card with tabs */}
        <div className="content-card">
          <div className="pill-tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`pill-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <i className={`bi ${t.icon}`}></i>
                {t.label}
                {t.count !== null && <span className="pill-tab-count">{t.count}</span>}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'scheduled' && (
              <AppointmentsList
                appointments={scheduledList}
                emptyIcon="bi-calendar2-week"
                emptyText="No pending appointments. You're all caught up!"
                onComplete={handleMarkCompleted}
                onRecord={openRecordForm}
                onPrescribe={openPrescForm}
                onHistory={openHistory}
                statusClass={statusClass}
                statusIcon={statusIcon}
                showActions={true}
              />
            )}

            {activeTab === 'completed' && (
              <AppointmentsList
                appointments={completedList}
                emptyIcon="bi-check-circle"
                emptyText="No completed appointments yet."
                onHistory={openHistory}
                statusClass={statusClass}
                statusIcon={statusIcon}
                showActions={false}
              />
            )}

            {activeTab === 'cancelled' && (
              <AppointmentsList
                appointments={cancelledList}
                emptyIcon="bi-x-circle"
                emptyText="No cancelled appointments."
                onHistory={openHistory}
                statusClass={statusClass}
                statusIcon={statusIcon}
                showActions={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* 🚨 EMERGENCY CASES MODAL */}
      {showEmergencyModal && (
        <div className="profile-modal-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 800 }}
          >
            <div className="profile-modal-header emergency">
              <button className="profile-modal-close" onClick={() => setShowEmergencyModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="profile-avatar emergency">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div className="profile-header-text">
                <h3 className="profile-username">Emergency Cases</h3>
                <span className="profile-role-chip emergency">
                  <i className="bi bi-shield-exclamation"></i>
                  {emergencyCases.length} Active Case{emergencyCases.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="profile-modal-body" style={{ backgroundColor: '#f8fafc' }}>
              {emergencyCases.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-check-circle"></i>
                  <p>No emergency cases right now.</p>
                </div>
              ) : (
                <div className="emergency-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[...emergencyCases].sort((a, b) => b.id - a.id).map((c) => (
                    <div 
                      key={c.id} 
                      style={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderLeft: '6px solid #ef4444',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <i className="bi bi-person-fill-exclamation" style={{ color: '#ef4444', fontSize: '1.25rem' }}></i>
                          <strong style={{ fontSize: '1.15rem', color: '#1e293b' }}>{c.name}</strong>
                          {c.mlcNumber && (
                            <span style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #fecaca' }}>
                              {c.mlcNumber}
                            </span>
                          )}
                        </div>
                        <span style={{ backgroundColor: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                          HIGH PRIORITY
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                        <div><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Age</span><br/><strong style={{ fontSize: '1rem' }}>{c.age} yrs</strong></div>
                        <div><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Gender</span><br/><strong style={{ fontSize: '1rem' }}>{c.gender}</strong></div>
                        <div><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Phone</span><br/><strong style={{ fontSize: '1rem' }}>{c.phone}</strong></div>
                        <div><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Blood Group</span><br/><strong style={{ fontSize: '1rem', color: '#ef4444' }}>{c.bloodGroup || '—'}</strong></div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem' }}>
                        {c.incidentLocation && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <i className="bi bi-geo-alt-fill" style={{ color: '#ef4444', marginTop: '2px' }}></i>
                            <span><strong style={{ color: '#334155' }}>Incident:</strong> {c.incidentLocation}</span>
                          </div>
                        )}
                        {c.injuryDescription && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <i className="bi bi-bandaid-fill" style={{ color: '#ef4444', marginTop: '2px' }}></i>
                            <span><strong style={{ color: '#334155' }}>Injury:</strong> {c.injuryDescription}</span>
                          </div>
                        )}
                        {c.broughtBy && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <i className="bi bi-person-walking" style={{ color: '#64748b', marginTop: '2px' }}></i>
                            <span><strong style={{ color: '#334155' }}>Brought by:</strong> {c.broughtBy} {c.broughtByPhone && `(${c.broughtByPhone})`}</span>
                          </div>
                        )}
                        {c.isMedicoLegal && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <i className="bi bi-shield-exclamation" style={{ color: '#ef4444', marginTop: '2px' }}></i>
                            <span>
                              <strong style={{ color: '#334155' }}>MLC:</strong> Yes
                              {c.policeStation && ` · Police Station: ${c.policeStation}`}
                              {c.firNumber && ` · FIR: ${c.firNumber}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {c.emergencyNotes && (
                        <div style={{ marginTop: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                          <strong style={{ color: '#b45309', display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>EMERGENCY NOTES</strong>
                          <span style={{ fontSize: '0.95rem', color: '#78350f' }}>{c.emergencyNotes}</span>
                        </div>
                      )}

                      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small style={{ color: '#94a3b8' }}>
                          <i className="bi bi-clock me-1"></i>
                          Registered {c.registeredAt?.substring(0, 16).replace('T', ' ')}
                        </small>
                        <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
                          Needs Immediate Attention
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECORD FORM MODAL */}
      {showRecordForm && selectedAppt && (
        <div className="profile-modal-overlay" onClick={() => setShowRecordForm(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="profile-modal-header doctor">
              <button className="profile-modal-close" onClick={() => setShowRecordForm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="profile-avatar doctor">
                <i className="bi bi-file-medical"></i>
              </div>
              <div className="profile-header-text">
                <h3 className="profile-username">Add Medical Record</h3>
                <span className="profile-role-chip doctor">
                  <i className="bi bi-person"></i>
                  {selectedAppt.patient?.name}
                </span>
              </div>
            </div>
            <div className="profile-modal-body">
              <div className="patient-quick-info">
                <div className="patient-quick-info-item">
                  <i className="bi bi-123"></i>
                  <div>
                    <span>Age</span>
                    <strong>{selectedAppt.patient?.age} yrs</strong>
                  </div>
                </div>
                <div className="patient-quick-info-item">
                  <i className="bi bi-gender-ambiguous"></i>
                  <div>
                    <span>Gender</span>
                    <strong>{selectedAppt.patient?.gender}</strong>
                  </div>
                </div>
                <div className="patient-quick-info-item">
                  <i className="bi bi-droplet"></i>
                  <div>
                    <span>Blood</span>
                    <strong>{selectedAppt.patient?.bloodGroup || '—'}</strong>
                  </div>
                </div>
              </div>

              <form onSubmit={submitRecord}>
                <div className="premium-input-group">
                  <i className="bi bi-clipboard2-pulse input-icon"></i>
                  <input placeholder="Diagnosis *" required
                    value={recordForm.diagnosis}
                    onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })} />
                </div>
                <div className="premium-input-group">
                  <i className="bi bi-prescription2 input-icon"></i>
                  <input placeholder="Treatment"
                    value={recordForm.treatment}
                    onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })} />
                </div>
                <div className="premium-input-group">
                  <i className="bi bi-journal-text input-icon"></i>
                  <textarea placeholder="Notes" rows={3}
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1rem 0.85rem 2.85rem', fontSize: '0.95rem', background: '#f8fafc', resize: 'vertical' }} />
                </div>
                <div className="form-panel-actions">
                  <button type="submit" className="btn-gradient-success" disabled={saving}>
                    {saving ? (<><span className="spinner-border spinner-border-sm"></span>Saving...</>) : (<><i className="bi bi-check-lg"></i>Save Record</>)}
                  </button>
                  <button type="button" className="btn-soft" onClick={() => setShowRecordForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PRESCRIPTION FORM MODAL */}
      {showPrescForm && selectedAppt && (
        <div className="profile-modal-overlay" onClick={() => setShowPrescForm(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="profile-modal-header doctor">
              <button className="profile-modal-close" onClick={() => setShowPrescForm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="profile-avatar doctor">
                <i className="bi bi-capsule"></i>
              </div>
              <div className="profile-header-text">
                <h3 className="profile-username">Add Prescription</h3>
                <span className="profile-role-chip doctor">
                  <i className="bi bi-person"></i>
                  {selectedAppt.patient?.name}
                </span>
              </div>
            </div>
            <div className="profile-modal-body">
              <div className="patient-quick-info">
                <div className="patient-quick-info-item">
                  <i className="bi bi-123"></i>
                  <div>
                    <span>Age</span>
                    <strong>{selectedAppt.patient?.age} yrs</strong>
                  </div>
                </div>
                <div className="patient-quick-info-item">
                  <i className="bi bi-gender-ambiguous"></i>
                  <div>
                    <span>Gender</span>
                    <strong>{selectedAppt.patient?.gender}</strong>
                  </div>
                </div>
                <div className="patient-quick-info-item">
                  <i className="bi bi-droplet"></i>
                  <div>
                    <span>Blood</span>
                    <strong>{selectedAppt.patient?.bloodGroup || '—'}</strong>
                  </div>
                </div>
              </div>

              <div className="dosage-hint">
                <i className="bi bi-info-circle-fill"></i>
                <span>
                  Consider dosage based on patient's <strong>age ({selectedAppt.patient?.age} yrs)</strong> and{' '}
                  <strong>gender ({selectedAppt.patient?.gender})</strong>.
                </span>
              </div>

              <form onSubmit={submitPresc}>
                <div className="premium-input-group">
                  <i className="bi bi-capsule input-icon"></i>
                  <input placeholder="Medicine *" required
                    value={prescForm.medicine}
                    onChange={(e) => setPrescForm({ ...prescForm, medicine: e.target.value })} />
                </div>
                <div className="premium-row">
                  <div className="premium-input-group">
                    <i className="bi bi-cup-hot input-icon"></i>
                    <input placeholder="Dosage (e.g. 500mg twice daily)"
                      value={prescForm.dosage}
                      onChange={(e) => setPrescForm({ ...prescForm, dosage: e.target.value })} />
                  </div>
                  <div className="premium-input-group">
                    <i className="bi bi-calendar-week input-icon"></i>
                    <input placeholder="Duration (e.g. 7 days)"
                      value={prescForm.duration}
                      onChange={(e) => setPrescForm({ ...prescForm, duration: e.target.value })} />
                  </div>
                </div>
                <div className="premium-input-group">
                  <i className="bi bi-journal-text input-icon"></i>
                  <textarea placeholder="Instructions" rows={3}
                    value={prescForm.instructions}
                    onChange={(e) => setPrescForm({ ...prescForm, instructions: e.target.value })}
                    style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1rem 0.85rem 2.85rem', fontSize: '0.95rem', background: '#f8fafc', resize: 'vertical' }} />
                </div>
                <div className="form-panel-actions">
                  <button type="submit" className="btn-gradient-success" disabled={saving}>
                    {saving ? (<><span className="spinner-border spinner-border-sm"></span>Saving...</>) : (<><i className="bi bi-check-lg"></i>Save Prescription</>)}
                  </button>
                  <button type="button" className="btn-soft" onClick={() => setShowPrescForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT HISTORY MODAL */}
      {historyAppt && (
        <div className="profile-modal-overlay" onClick={closeHistory}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="profile-modal-header doctor">
              <button className="profile-modal-close" onClick={closeHistory}>
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="profile-avatar doctor">
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="profile-header-text">
                <h3 className="profile-username">{historyAppt.patient?.name}</h3>
                <span className="profile-role-chip doctor">
                  <i className="bi bi-person"></i>
                  {historyAppt.patient?.age} yrs · {historyAppt.patient?.gender}
                </span>
              </div>
            </div>
            <div className="profile-modal-body">
              {historyLoading ? (
                <div className="dashboard-loading">
                  <span className="spinner-border spinner-border-sm"></span>
                  Loading history...
                </div>
              ) : (
                <>
                  <div className="history-section">
                    <h6 className="history-section-title">
                      <i className="bi bi-file-medical"></i>
                      Medical Records <span>({historyRecords.length})</span>
                    </h6>
                    {historyRecords.length === 0 ? (
                      <p className="history-empty">No medical records for this patient.</p>
                    ) : (
                      <div className="history-grid">
                        {historyRecords.map((r) => (
                          <div key={r.id} className="history-card record-card">
                            <div className="history-card-header">
                              <strong>{r.diagnosis}</strong>
                              <span className="history-date">{r.createdAt?.substring(0, 10)}</span>
                            </div>
                            {r.treatment && (<p className="history-field"><strong>Treatment:</strong> {r.treatment}</p>)}
                            {r.notes && (<p className="history-field"><strong>Notes:</strong> {r.notes}</p>)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="history-section mt-4">
                    <h6 className="history-section-title">
                      <i className="bi bi-capsule"></i>
                      Prescriptions <span>({historyPrescriptions.length})</span>
                    </h6>
                    {historyPrescriptions.length === 0 ? (
                      <p className="history-empty">No prescriptions for this patient.</p>
                    ) : (
                      <div className="history-grid">
                        {historyPrescriptions.map((p) => (
                          <div key={p.id} className="history-card presc-card">
                            <div className="history-card-header">
                              <strong><i className="bi bi-capsule me-1"></i>{p.medicine}</strong>
                            </div>
                            {p.dosage && (<p className="history-field"><strong>Dosage:</strong> {p.dosage}</p>)}
                            {p.duration && (<p className="history-field"><strong>Duration:</strong> {p.duration}</p>)}
                            {p.instructions && (<p className="history-field"><strong>Instructions:</strong> {p.instructions}</p>)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ==========================================================
   Sub-components
   ========================================================== */

function StatCard({ icon, label, value, variant }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className={`stat-icon ${variant}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  )
}

function AppointmentsList({
  appointments, emptyIcon, emptyText, onComplete, onRecord, onPrescribe, onHistory, statusClass, statusIcon, showActions,
}) {
  if (appointments.length === 0) {
    return (
      <div className="empty-state">
        <i className={`bi ${emptyIcon}`}></i>
        <p>{emptyText}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="tab-toolbar">
        <h5>Appointments <span>({appointments.length})</span></h5>
      </div>

      <div className="table-responsive">
        <table className="admin-table doctor-appointments-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th style={{ width: '240px' }}>Patient</th>
              <th style={{ width: '160px' }}>Schedule</th>
              <th>Reason</th>
              <th style={{ width: '150px' }}>Status</th>
              <th style={{ textAlign: 'right', width: '380px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td><strong>#{a.id}</strong></td>

                <td>
                  <div className="doctor-patient-cell">
                    <span className="doctor-patient-name">{a.patient?.name}</span>
                    <div className="doctor-patient-chips">
                      <span className="age-cell">{a.patient?.age} yrs</span>
                      <span className={`gender-chip ${a.patient?.gender === 'Male' ? 'male' : a.patient?.gender === 'Female' ? 'female' : 'other'}`}>
                        <i className={`bi ${a.patient?.gender === 'Male' ? 'bi-gender-male' : a.patient?.gender === 'Female' ? 'bi-gender-female' : 'bi-gender-ambiguous'}`}></i>
                        {a.patient?.gender}
                      </span>
                      {a.patient?.bloodGroup && (
                        <span className="patient-blood-chip">{a.patient.bloodGroup}</span>
                      )}
                    </div>
                  </div>
                </td>

                <td>
                  <div className="doctor-schedule-cell">
                    <div className="doctor-schedule-date">
                      <i className="bi bi-calendar-event"></i>
                      {a.appointmentDate}
                    </div>
                    <span className="time-chip">
                      <i className="bi bi-clock"></i>
                      {formatTime12(a.appointmentTime)}
                    </span>
                  </div>
                </td>

                <td>
                  <span className="doctor-reason-text">{a.reason}</span>
                </td>

                <td>
                  <span className={`status-badge ${statusClass(a.status)}`}>
                    <i className={`bi ${statusIcon(a.status)}`}></i>
                    {a.status}
                  </span>
                </td>

                <td style={{ textAlign: 'right' }}>
                  <div className="action-group">
                    <button className="row-btn history" onClick={() => onHistory(a)}>
                      <i className="bi bi-clock-history"></i>History
                    </button>
                    {showActions && (
                      <>
                        <button className="row-btn record" onClick={() => onRecord(a)}>
                          <i className="bi bi-file-medical"></i>Record
                        </button>
                        <button className="row-btn edit" onClick={() => onPrescribe(a)}>
                          <i className="bi bi-capsule"></i>Prescribe
                        </button>
                        <button className="row-btn complete" onClick={() => onComplete(a.id)}>
                          <i className="bi bi-check-lg"></i>Complete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}