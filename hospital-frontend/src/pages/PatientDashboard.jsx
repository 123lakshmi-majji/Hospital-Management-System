import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMyProfile,
  getAllDoctors,
  bookAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getMyMedicalRecords,
  getMyPrescriptions,
  getDoctorBookedSlots,
} from '../api/patientApi.js'
import { getMyTransactions } from '../api/transactionApi.js'
import { generateBill } from '../utils/generateBill.js'
import { generateMedicalRecordPDF, generatePrescriptionPDF } from '../utils/generateMedicalDocs.js'
import NearbyStoresTab from '../components/patient/NearbyStoresTab.jsx'
import { formatTime12, timeUntilAppointment } from '../utils/timeFormat.js'

export default function PatientDashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [records, setRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [transactions, setTransactions] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('appointments')

  const [, setTick] = useState(0)
  const [apptFilter, setApptFilter] = useState('ALL')

  const [showBooking, setShowBooking] = useState(false)
  const [booking, setBooking] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
  })
  const [savingBooking, setSavingBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [toast, setToast] = useState({ message: '', type: 'success' })

  const [viewRecord, setViewRecord] = useState(null)
  const [viewPrescription, setViewPrescription] = useState(null)

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: '', type: 'success' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  useEffect(() => {
    if (booking.doctorId && booking.appointmentDate) {
      setLoadingSlots(true)
      getDoctorBookedSlots(booking.doctorId, booking.appointmentDate)
        .then((res) => {
          setBookedSlots(res.data)
        })
        .catch((err) => {
          console.error("❌ FAILED TO FETCH SLOTS:", err)
          setBookedSlots([]) 
        })
        .finally(() => setLoadingSlots(false))
    } else {
      setBookedSlots([])
    }
  }, [booking.doctorId, booking.appointmentDate])

  const loadAll = async () => {
    try {
      setLoading(true)
      const p = await getMyProfile()
      setProfile(p.data)

      const [appts, docs, recs, prescs, txns] = await Promise.all([
        getMyAppointments(p.data.id),
        getAllDoctors(),
        getMyMedicalRecords(p.data.id),
        getMyPrescriptions(p.data.id),
        getMyTransactions(),
      ])

      setAppointments(appts.data)
      setDoctors(docs.data)
      setRecords(recs.data)
      setPrescriptions(prescs.data)
      setTransactions(txns.data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not load your data. Please contact the receptionist.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await updateAppointmentStatus(id, 'CANCELLED')
      showToast('Appointment cancelled successfully!', 'success')
      loadAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'danger')
    }
  }

  const handleDoctorSelect = (e) => {
    setBooking({ ...booking, doctorId: e.target.value, appointmentDate: '', appointmentTime: '' })
  }

  const handleDateSelect = (date) => {
    setBooking({ ...booking, appointmentDate: date, appointmentTime: '' })
  }

  const handleBookingChange = (e) => {
    const { name, value } = e.target
    setBooking((prev) => ({ ...prev, [name]: value }))
  }

  const isSlotBooked = (timeValue) => {
    return bookedSlots.some((bookedTime) => {
      return bookedTime.substring(0, 5) === timeValue
    })
  }

  const isSlotPast = (timeValue) => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    
    if (booking.appointmentDate > todayStr) return false
    if (booking.appointmentDate < todayStr) return true

    const [hours, minutes] = timeValue.split(':')
    const slotDate = new Date()
    slotDate.setHours(Number(hours), Number(minutes), 0, 0)

    return slotDate < now
  }

  const handleBookSubmit = async (e) => {
    e.preventDefault()
    setBookingError('')
    
    if (!booking.doctorId) return setBookingError('Please select a doctor')
    if (!booking.appointmentDate) return setBookingError('Please select a date')
    if (!booking.appointmentTime) return setBookingError('Please select a time slot')

    setSavingBooking(true)
    try {
      const res = await bookAppointment({
        patientId: profile.id,
        doctorId: Number(booking.doctorId),
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime + ':00', 
        reason: booking.reason,
      })

      const newAppointmentId = res.data.id

      const txnRes = await getMyTransactions()
      const pendingTxn = txnRes.data.find(
        (t) => t.status === 'PENDING' && t.appointment?.id === newAppointmentId
      )

      setShowBooking(false)
      setBooking({ doctorId: '', appointmentDate: '', appointmentTime: '', reason: '' }) 
      loadAll()

      if (pendingTxn) {
        navigate('/payment', {
          state: {
            transactionId: pendingTxn.id,
            amount: pendingTxn.amount,
            doctorName: pendingTxn.doctor.name,
            patientName: profile.name,
            date: booking.appointmentDate,
            time: formatTime12(booking.appointmentTime),
            redirectTo: '/patient',
          },
        })
      } else {
        showToast('Appointment booked successfully!', 'success')
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Could not book appointment. Slot may be taken.')
    } finally {
      setSavingBooking(false)
    }
  }

  const total = appointments.length
  const scheduledCount = appointments.filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
  ).length
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length

  const filteredAppts =
    apptFilter === 'ALL'
      ? appointments
      : appointments.filter((a) => a.status === apptFilter)

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
    { id: 'appointments', label: 'Appointments', icon: 'bi-calendar2-week', count: appointments.length },
    { id: 'payments', label: 'My Payments', icon: 'bi-wallet2', count: transactions.length },
    { id: 'records', label: 'Medical Records', icon: 'bi-file-medical', count: records.length },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'bi-capsule', count: prescriptions.length },
    { id: 'stores', label: 'Nearby Stores', icon: 'bi-shop' },
  ]

  return (
    <div className="dashboard-page">
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
            <h1 className="dashboard-title">Patient Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back, {profile?.name}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn-gradient-primary" onClick={() => setShowBooking(true)}>
              <i className="bi bi-plus-lg"></i>
              Book Appointment
            </button>
            <span className="dashboard-role-badge patient-badge">
              <i className="bi bi-person-heart"></i>
              PATIENT
            </span>
          </div>
        </div>

        <NextAppointmentBanner appointments={appointments} />

        <div className="stat-grid">
          <StatCard icon="bi-calendar2-week-fill" label="Total Appointments" value={total} variant="appointments" />
          <StatCard icon="bi-clock-history" label="Upcoming" value={scheduledCount} variant="scheduled" />
          <StatCard icon="bi-check-circle-fill" label="Completed" value={completedCount} variant="completed" />
          <StatCard icon="bi-x-circle-fill" label="Cancelled" value={cancelledCount} variant="cancelled" />
        </div>

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
                {t.count !== undefined && (
                  <span className="pill-tab-count">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'appointments' && (
              <AppointmentsTab
                appointments={filteredAppts}
                filter={apptFilter}
                setFilter={setApptFilter}
                onCancel={handleCancel}
                statusClass={statusClass}
                statusIcon={statusIcon}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsTab 
                transactions={transactions} 
                patientName={profile?.name} 
                navigate={navigate} 
              />
            )}

            {activeTab === 'records' && (
              <RecordsTab records={records} onView={setViewRecord} />
            )}

            {activeTab === 'prescriptions' && (
              <PrescriptionsTab
                prescriptions={prescriptions}
                onView={setViewPrescription}
              />
            )}

            {activeTab === 'stores' && <NearbyStoresTab />}
          </div>
        </div>
      </div>

      {showBooking && (
        <div className="profile-modal-overlay" onClick={() => setShowBooking(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="profile-modal-header patient">
              <button className="profile-modal-close" onClick={() => setShowBooking(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="profile-avatar patient">
                <i className="bi bi-calendar-plus"></i>
              </div>
              <div className="profile-header-text">
                <h3 className="profile-username">Book Appointment</h3>
                <span className="profile-role-chip patient">
                  <i className="bi bi-person-heart"></i>
                  {profile?.name}
                </span>
              </div>
            </div>
            
            <div className="profile-modal-body">
              {bookingError && (
                <div className="premium-alert danger">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{bookingError}</span>
                </div>
              )}
              
              <form onSubmit={handleBookSubmit}>
                <div className="premium-input-group" style={{ marginBottom: '1.5rem' }}>
                  <i className="bi bi-heart-pulse input-icon"></i>
                  <select name="doctorId" required value={booking.doctorId} onChange={handleDoctorSelect}>
                    <option value="">1. Choose a doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                    ))}
                  </select>
                </div>

                {booking.doctorId && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label fw-bold mb-2">2. Select Date</label>
                    <div className="d-flex gap-2 overflow-auto pb-2">
                      {getNextFourDays().map((dateObj) => (
                        <div
                          key={dateObj.fullDate}
                          onClick={() => handleDateSelect(dateObj.fullDate)}
                          style={{
                            flex: '1 0 80px',
                            padding: '10px',
                            textAlign: 'center',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: booking.appointmentDate === dateObj.fullDate ? '2px solid var(--hms-violet)' : '1px solid #e2e8f0',
                            background: booking.appointmentDate === dateObj.fullDate ? '#faf5ff' : '#fff',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{dateObj.dayName}</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: booking.appointmentDate === dateObj.fullDate ? 'var(--hms-violet)' : '#1e293b' }}>{dateObj.dayNum}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{dateObj.month}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {booking.appointmentDate && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label fw-bold mb-2 d-flex justify-content-between">
                      <span>3. Select Time Slot</span>
                      {loadingSlots && <span className="spinner-border spinner-border-sm text-primary"></span>}
                    </label>
                    <div className="d-flex flex-wrap gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {generateTimeSlots().map((slot) => {
                        const isPast = isSlotPast(slot.value)
                        const booked = isSlotBooked(slot.value)
                        const isSelected = booking.appointmentTime === slot.value

                        let btnStyle = {
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          color: '#475569',
                          transition: 'all 0.2s'
                        }

                        if (isPast) {
                          btnStyle = { ...btnStyle, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }
                        } else if (booked) {
                          btnStyle = { ...btnStyle, background: '#d1fae5', color: '#047857', borderColor: '#10b981', cursor: 'pointer' }
                        } else if (isSelected) {
                          btnStyle = { ...btnStyle, background: 'var(--hms-violet)', color: '#fff', border: 'none' }
                        }

                        return (
                          <button
                            key={slot.value}
                            type="button"
                            style={btnStyle}
                            onClick={() => {
                              if (isPast) {
                                showToast('This time slot has already passed today. Please choose a future slot.', 'warning')
                              } else if (booked) {
                                showToast('This slot is already booked by another patient. Please choose another time.', 'warning')
                              } else {
                                setBooking({ ...booking, appointmentTime: slot.value })
                              }
                            }}
                          >
                            {slot.label} {booked && '✓'} {isPast && '✕'}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {booking.appointmentTime && (
                  <div className="premium-input-group" style={{ marginBottom: '1.5rem' }}>
                    <i className="bi bi-chat-left-text input-icon"></i>
                    <input name="reason" placeholder="Reason for visit" required value={booking.reason} onChange={handleBookingChange} />
                  </div>
                )}

                <div className="form-panel-actions">
                  <button type="submit" className="btn-gradient-primary w-100" disabled={savingBooking || !booking.appointmentTime}>
                    {savingBooking ? (
                      <><span className="spinner-border spinner-border-sm"></span> Booking...</>
                    ) : (
                      <><i className="bi bi-check-lg"></i> Proceed to Pay</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {viewRecord && (
        <div className="profile-modal-overlay" onClick={() => setViewRecord(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="profile-modal-header patient">
              <button className="profile-modal-close" onClick={() => setViewRecord(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="profile-avatar patient">
                <i className="bi bi-file-medical"></i>
              </div>
              <div className="profile-header-text">
                <h3 className="profile-username">Medical Record</h3>
                <span className="profile-role-chip patient">
                  <i className="bi bi-calendar"></i>
                  {viewRecord.createdAt?.substring(0, 10)}
                </span>
              </div>
            </div>
            <div className="profile-modal-body">
              <div className="record-detail">
                <div className="record-detail-row">
                  <div className="record-detail-label">Diagnosis</div>
                  <div className="record-detail-value">{viewRecord.diagnosis}</div>
                </div>
                <div className="record-detail-row">
                  <div className="record-detail-label">Treatment</div>
                  <div className="record-detail-value">{viewRecord.treatment || '—'}</div>
                </div>
                <div className="record-detail-row">
                  <div className="record-detail-label">Notes</div>
                  <div className="record-detail-value">{viewRecord.notes || '—'}</div>
                </div>
                <div className="record-detail-row">
                  <div className="record-detail-label">Doctor</div>
                  <div className="record-detail-value">{viewRecord.doctor?.name}</div>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  className="btn-gradient-primary w-100" 
                  onClick={() => generateMedicalRecordPDF({
                    patientName: profile?.name,
                    patientAge: profile?.age,
                    doctorName: viewRecord.doctor?.name,
                    specialization: viewRecord.doctor?.specialization,
                    date: viewRecord.createdAt,
                    healthProblem: viewRecord.diagnosis || '—',
                    treatment: viewRecord.treatment,
                    notes: viewRecord.notes
                  })}
                >
                  <i className="bi bi-download me-2"></i> Download Record (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewPrescription && (
        <div className="profile-modal-overlay" onClick={() => setViewPrescription(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="profile-modal-header patient">
              <button className="profile-modal-close" onClick={() => setViewPrescription(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="profile-avatar patient">
                <i className="bi bi-capsule"></i>
              </div>
              <div className="profile-header-text">
                <h3 className="profile-username">{viewPrescription.medicine}</h3>
                <span className="profile-role-chip patient">
                  <i className="bi bi-person-badge"></i>
                  {viewPrescription.doctor?.name}
                </span>
              </div>
            </div>
            <div className="profile-modal-body">
              <div className="record-detail">
                <div className="record-detail-row">
                  <div className="record-detail-label">Dosage</div>
                  <div className="record-detail-value">{viewPrescription.dosage || '—'}</div>
                </div>
                <div className="record-detail-row">
                  <div className="record-detail-label">Duration</div>
                  <div className="record-detail-value">{viewPrescription.duration || '—'}</div>
                </div>
                <div className="record-detail-row">
                  <div className="record-detail-label">Instructions</div>
                  <div className="record-detail-value">{viewPrescription.instructions || '—'}</div>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  className="btn-gradient-primary w-100" 
                  onClick={() => generatePrescriptionPDF({
                    patientName: profile?.name,
                    patientAge: profile?.age,
                    doctorName: viewPrescription.doctor?.name,
                    specialization: viewPrescription.doctor?.specialization,
                    date: viewPrescription.createdAt,
                    healthProblem: viewPrescription.diagnosis || viewPrescription.reason || '—',
                    medicine: viewPrescription.medicine,
                    dosage: viewPrescription.dosage,
                    duration: viewPrescription.duration,
                    instructions: viewPrescription.instructions
                  })}
                >
                  <i className="bi bi-download me-2"></i> Download Prescription (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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

function NextAppointmentBanner({ appointments }) {
  const upcoming = appointments
    .filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
    .map((a) => {
      const t = timeUntilAppointment(a.appointmentDate, a.appointmentTime)
      return { ...a, ...t }
    })
    .filter((a) => a.variant === 'urgent' || a.variant === 'soon' || a.variant === 'upcoming' || a.variant === 'started')
    .sort((a, b) => Math.abs(a.diffMs) - Math.abs(b.diffMs))

  if (upcoming.length === 0) return null

  const next = upcoming[0]
  const isUrgent = next.variant === 'urgent' || next.variant === 'started'
  const isSoon = next.variant === 'soon'

  return (
    <div className={`next-appt-banner ${isUrgent ? 'urgent' : isSoon ? 'soon' : 'upcoming'}`}>
      <div className="next-appt-icon">
        <i className={`bi ${isUrgent ? 'bi-alarm-fill' : 'bi-calendar-event-fill'}`}></i>
      </div>
      <div className="next-appt-content">
        <div className="next-appt-label">
          {next.variant === 'started' ? 'Appointment Starting Now' : 'Your Next Appointment'}
        </div>
        <div className="next-appt-info">
          <strong>{next.doctor?.name}</strong>
          <span className="next-appt-dot">·</span>
          <span>{next.appointmentDate}</span>
          <span className="next-appt-dot">·</span>
          <span>{formatTime12(next.appointmentTime)}</span>
        </div>
      </div>
      <div className={`next-appt-countdown ${isUrgent ? 'urgent' : isSoon ? 'soon' : 'upcoming'}`}>
        <i className="bi bi-hourglass-split"></i>
        {next.label}
      </div>
    </div>
  )
}

function AppointmentsTab({ appointments, filter, setFilter, onCancel, statusClass, statusIcon }) {
  return (
    <div>
      <div className="tab-toolbar">
        <h5>My Appointments <span>({appointments.length})</span></h5>
        <div className="appt-filters">
          {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-calendar2-x"></i>
          <p>No appointments match this filter.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Countdown</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => {
                const cd = timeUntilAppointment(a.appointmentDate, a.appointmentTime)
                const isScheduled = a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
                const showCountdown = isScheduled

                return (
                  <tr key={a.id}>
                    <td><strong>#{a.id}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.doctor?.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--hms-muted)' }}>
                        {a.doctor?.specialization}
                      </div>
                    </td>
                    <td>{a.appointmentDate}</td>
                    <td>
                      <span className="time-chip">
                        <i className="bi bi-clock"></i>
                        {formatTime12(a.appointmentTime)}
                      </span>
                    </td>
                    <td>
                      {showCountdown ? (
                        <span className={`countdown-chip ${cd.variant}`}>
                          <i className={`bi ${
                            cd.variant === 'urgent' ? 'bi-alarm-fill' :
                            cd.variant === 'started' ? 'bi-play-circle-fill' :
                            cd.variant === 'soon' ? 'bi-hourglass-split' :
                            'bi-hourglass'
                          }`}></i>
                          {cd.label}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                    <td>{a.reason}</td>
                    <td>
                      <span className={`status-badge ${statusClass(a.status)}`}>
                        <i className={`bi ${statusIcon(a.status)}`}></i>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isScheduled ? (
                        <button className="row-btn delete" onClick={() => onCancel(a.id)}>
                          <i className="bi bi-x-lg"></i>
                          Cancel
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function PaymentsTab({ transactions, patientName, navigate }) {
  const handleDownloadBill = (t) => {
    generateBill({
      receiptNumber: t.receiptNumber || `TXN-${t.id}`,
      patientName: patientName || t.patient?.name || 'Patient',
      doctorName: t.doctor?.name,
      doctorSpecialization: t.doctor?.specialization,
      appointmentDate: t.appointment?.appointmentDate,
      appointmentTime: t.appointment?.appointmentTime,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      status: t.status,
      paidAt: t.paidAt,
    })
  }

  const handleProceedToPay = (t) => {
    navigate('/payment', {
      state: {
        transactionId: t.id,
        amount: t.amount,
        doctorName: t.doctor?.name,
        patientName: patientName || t.patient?.name,
        date: t.appointment?.appointmentDate,
        time: formatTime12(t.appointment?.appointmentTime || '00:00:00'),
        redirectTo: '/patient',
      },
    })
  }

  return (
    <div>
      <div className="tab-toolbar">
        <h5>My Payments <span>({transactions.length})</span></h5>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-wallet2"></i>
          <p>No transaction history found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Doctor</th>
                <th>Appointment Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.receiptNumber}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.doctor?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--hms-muted)' }}>
                      {t.doctor?.specialization}
                    </div>
                  </td>
                  <td>{t.appointment?.appointmentDate || '—'}</td>
                  <td><span className="fw-bold text-primary">₹{t.amount}</span></td>
                  <td>
                    <span className={`status-badge ${t.status === 'PAID' ? 'completed' : t.status === 'PENDING' ? 'scheduled' : 'cancelled'}`}>
                      {t.status === 'PENDING' ? 'INCOMPLETE' : t.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {t.status === 'PAID' ? (
                      <button
                        className="row-btn history"
                        onClick={() => handleDownloadBill(t)}
                      >
                        <i className="bi bi-download"></i> Bill
                      </button>
                    ) : t.status === 'PENDING' ? (
                      <button
                        className="row-btn complete"
                        onClick={() => handleProceedToPay(t)}
                      >
                        <i className="bi bi-credit-card"></i> Pay Now
                      </button>
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

function RecordsTab({ records, onView }) {
  if (records.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-file-medical"></i>
        <p>No medical records yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="tab-toolbar">
        <h5>Medical Records <span>({records.length})</span></h5>
      </div>
      <div className="history-grid">
        {records.map((r) => (
          <div key={r.id} className="history-card record-card clickable" onClick={() => onView(r)}>
            <div className="history-card-header">
              <strong>{r.diagnosis}</strong>
              <span className="history-date">{r.createdAt?.substring(0, 10)}</span>
            </div>
            {r.treatment && (
              <p className="history-field">
                <strong>Treatment:</strong> {r.treatment}
              </p>
            )}
            {r.notes && (
              <p className="history-field">
                <strong>Notes:</strong> {r.notes}
              </p>
            )}
            <div className="history-card-doctor">
              <i className="bi bi-person-badge me-1"></i>
              {r.doctor?.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PrescriptionsTab({ prescriptions, onView }) {
  if (prescriptions.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-capsule"></i>
        <p>No prescriptions yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="tab-toolbar">
        <h5>Prescriptions <span>({prescriptions.length})</span></h5>
      </div>
      <div className="history-grid">
        {prescriptions.map((p) => (
          <div
            key={p.id}
            className="history-card presc-card clickable"
            onClick={() => onView(p)}
          >
            <div className="history-card-header">
              <strong><i className="bi bi-capsule me-1"></i>{p.medicine}</strong>
            </div>
            {p.dosage && (
              <p className="history-field">
                <strong>Dosage:</strong> {p.dosage}
              </p>
            )}
            {p.duration && (
              <p className="history-field">
                <strong>Duration:</strong> {p.duration}
              </p>
            )}
            <div className="history-card-doctor">
              <i className="bi bi-person-badge me-1"></i>
              {p.doctor?.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getNextFourDays() {
  const days = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  for (let i = 0; i < 4; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const fullDate = d.toISOString().split('T')[0]
    days.push({
      fullDate,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()]
    })
  }
  return days
}

function generateTimeSlots() {
  const slots = []
  for (let hour = 9; hour <= 21; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === 21 && min > 0) break 
      
      const hh = hour.toString().padStart(2, '0')
      const mm = min.toString().padStart(2, '0')
      const value = `${hh}:${mm}`
      
      // ✅ ADDED: Skip 1:00 PM and 1:30 PM
      if (value === '13:00' || value === '13:30') continue;
      
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
      const label = `${displayHour.toString().padStart(2, '0')}:${mm} ${ampm}`
      
      slots.push({ value, label })
    }
  }
  return slots
}