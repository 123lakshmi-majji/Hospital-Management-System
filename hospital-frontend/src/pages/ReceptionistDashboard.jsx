import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getPatients,
  createPatient,
  updatePatient,
  getDoctors,
  getAppointments,
  bookAppointment,
  updateAppointmentStatus,
  registerEmergency,
  getDoctorBookedSlots,
} from '../api/receptionistApi.js'
import { getAllTransactions } from '../api/transactionApi.js'
import { generateBill } from '../utils/generateBill.js'
import { formatTime12 } from '../utils/timeFormat.js'

const emptyPatient = {
  name: '',
  age: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  bloodGroup: '',
  emergencyContact: '',
}

const emptyAppt = {
  patientId: '',
  doctorId: '',
  appointmentDate: '',
  appointmentTime: '',
  reason: '',
}

const emptyEmergency = {
  name: 'Unknown',
  age: '',
  gender: 'Male',
  phone: '',
  bloodGroup: '',
  address: '',
  incidentLocation: '',
  incidentDateTime: '',
  injuryDescription: '',
  broughtBy: '',
  broughtByPhone: '',
  informantName: '',
  informantPhone: '',
  isMedicoLegal: true,
  policeStation: '',
  firNumber: '',
  attendingDoctor: '',
  emergencyNotes: '',
}

export default function ReceptionistDashboard() {
  const navigate = useNavigate()

  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [transactions, setTransactions] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('patients')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [billingSearchTerm, setBillingSearchTerm] = useState('')

  const [toast, setToast] = useState({ message: '', type: 'success' })

  const [showPatientModal, setShowPatientModal] = useState(false)
  const [editingPatientId, setEditingPatientId] = useState(null)
  const [patientForm, setPatientForm] = useState(emptyPatient)

  const [showApptModal, setShowApptModal] = useState(false)
  const [apptForm, setApptForm] = useState(emptyAppt)
  const [apptError, setApptError] = useState('')

  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyForm, setEmergencyForm] = useState(emptyEmergency)
  const [emergencyError, setEmergencyError] = useState('')
  const [emergencySuccess, setEmergencySuccess] = useState(null)

  const [apptFilter, setApptFilter] = useState('ALL')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAll()
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
    if (apptForm.doctorId && apptForm.appointmentDate) {
      setLoadingSlots(true)
      getDoctorBookedSlots(apptForm.doctorId, apptForm.appointmentDate)
        .then((res) => {
          setBookedSlots(res.data)
        })
        .catch((err) => {
          console.error("Failed to fetch slots", err)
          setBookedSlots([]) 
        })
        .finally(() => setLoadingSlots(false))
    } else {
      setBookedSlots([])
    }
  }, [apptForm.doctorId, apptForm.appointmentDate])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [p, d, a, t] = await Promise.all([
        getPatients(),
        getDoctors(),
        getAppointments(),
        getAllTransactions().catch(() => ({ data: [] })),
      ])
      setPatients(p.data)
      setDoctors(d.data)
      setAppointments(a.data)
      setTransactions(t.data)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPatient = () => {
    setPatientForm(emptyPatient)
    setEditingPatientId(null)
    setShowPatientModal(true)
  }

  const handleEditPatient = (p) => {
    setPatientForm({
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      email: p.email || '',
      address: p.address || '',
      bloodGroup: p.bloodGroup || '',
      emergencyContact: p.emergencyContact || '',
    })
    setEditingPatientId(p.id)
    setShowPatientModal(true)
  }

  const handlePatientChange = (e) => {
    const { name, value } = e.target
    setPatientForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePatientSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...patientForm, age: Number(patientForm.age) }
      if (editingPatientId) await updatePatient(editingPatientId, payload)
      else await createPatient(payload)
      setShowPatientModal(false)
      showToast(editingPatientId ? 'Patient updated successfully!' : 'Patient registered successfully!')
      loadAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save patient', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const handleBookClick = () => {
    setApptForm(emptyAppt)
    setApptError('')
    setShowApptModal(true)
  }

  const handleApptChange = (e) => {
    const { name, value } = e.target
    if (name === 'doctorId') {
      setApptForm((prev) => ({ ...prev, doctorId: value, appointmentDate: '', appointmentTime: '' }))
    } else {
      setApptForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleDateSelect = (date) => {
    setApptForm({ ...apptForm, appointmentDate: date, appointmentTime: '' })
  }

  const isSlotBooked = (timeValue) => {
    return bookedSlots.some((bookedTime) => {
      return bookedTime.substring(0, 5) === timeValue
    })
  }

  const isSlotPast = (timeValue) => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    
    if (apptForm.appointmentDate > todayStr) return false
    if (apptForm.appointmentDate < todayStr) return true

    const [hours, minutes] = timeValue.split(':')
    const slotDate = new Date()
    slotDate.setHours(Number(hours), Number(minutes), 0, 0)

    return slotDate < now
  }

  const handleApptSubmit = async (e) => {
    e.preventDefault()
    setApptError('')

    if (!apptForm.patientId) return setApptError('Please select a patient')
    if (!apptForm.doctorId) return setApptError('Please select a doctor')
    if (!apptForm.appointmentDate) return setApptError('Please select a date')
    if (!apptForm.appointmentTime) return setApptError('Please select a time slot')

    setSaving(true)
    try {
      await bookAppointment({
        patientId: Number(apptForm.patientId),
        doctorId: Number(apptForm.doctorId),
        appointmentDate: apptForm.appointmentDate,
        appointmentTime: apptForm.appointmentTime + ':00',
        reason: apptForm.reason,
      })
      setShowApptModal(false)
      loadAll()
      showToast('Appointment booked! Collect payment from the Billing tab.')
    } catch (err) {
      setApptError(err.response?.data?.message || 'Could not book appointment. Slot may be taken.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelAppt = async (id) => {
    try {
      await updateAppointmentStatus(id, 'CANCELLED')
      showToast('Appointment cancelled successfully!')
      loadAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'danger')
    }
  }

  const handleCollectPayment = (txn) => {
    navigate('/payment', {
      state: {
        transactionId: txn.id,
        amount: txn.amount,
        doctorName: txn.doctor?.name || 'Doctor',
        patientName: txn.patient?.name || 'Patient',
        date: txn.appointment?.appointmentDate,
        time: formatTime12(txn.appointment?.appointmentTime || '00:00:00'),
        redirectTo: '/receptionist',
      },
    })
  }

  const handleDownloadBill = (txn) => {
    generateBill({
      receiptNumber: txn.receiptNumber || `TXN-${txn.id}`,
      patientName: txn.patient?.name,
      doctorName: txn.doctor?.name,
      doctorSpecialization: txn.doctor?.specialization,
      appointmentDate: txn.appointment?.appointmentDate,
      appointmentTime: txn.appointment?.appointmentTime,
      amount: txn.amount,
      paymentMethod: txn.paymentMethod,
      status: txn.status,
      paidAt: txn.paidAt,
    })
  }

  const handleEmergencyOpen = () => {
    setEmergencyForm(emptyEmergency)
    setEmergencyError('')
    setEmergencySuccess(null)
    setShowEmergencyModal(true)
  }

  const handleEmergencyChange = (e) => {
    const { name, value, type, checked } = e.target
    setEmergencyForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleEmergencySubmit = async (e) => {
    e.preventDefault()
    setEmergencyError('')
    setSaving(true)
    try {
      const payload = {
        ...emergencyForm,
        age: Number(emergencyForm.age),
        incidentDateTime: emergencyForm.incidentDateTime
          ? emergencyForm.incidentDateTime + ':00'
          : null,
      }
      const res = await registerEmergency(payload)
      setEmergencySuccess(res.data)
      loadAll()
    } catch (err) {
      setEmergencyError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {})[0] ||
          'Could not register emergency case'
      )
    } finally {
      setSaving(false)
    }
  }

  const closeEmergencyModal = () => {
    setShowEmergencyModal(false)
    setEmergencySuccess(null)
  }

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAppointments =
    apptFilter === 'ALL'
      ? appointments
      : appointments.filter((a) => a.status === apptFilter)

  const filteredTransactions = transactions.filter((t) => {
    const term = billingSearchTerm.toLowerCase()
    return (
      (t.receiptNumber || `TXN-${t.id}`).toLowerCase().includes(term) ||
      t.patient?.name?.toLowerCase().includes(term) ||
      t.doctor?.name?.toLowerCase().includes(term)
    )
  })

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

  const scheduledCount = appointments.filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
  ).length
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length
  const emergencyCount = patients.filter((p) => p.isEmergency).length
  
  const pendingTxnsCount = transactions.filter((t) => t.status === 'PENDING').length

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

  const tabs = [
    { id: 'patients', label: 'Patients', icon: 'bi-people', count: patients.length },
    { id: 'appointments', label: 'Appointments', icon: 'bi-calendar2-week', count: appointments.length },
    { id: 'doctors', label: 'Doctors', icon: 'bi-heart-pulse', count: doctors.length },
    { id: 'billing', label: 'Billing & Payments', icon: 'bi-receipt', count: pendingTxnsCount },
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
            <h1 className="dashboard-title">Receptionist Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage patients, appointments, and doctor schedules
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              className="emergency-btn"
              onClick={handleEmergencyOpen}
              title="Register emergency / medico-legal case"
            >
              <span className="emergency-pulse"></span>
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>Emergency</span>
            </button>

            <button className="btn-gradient-primary" onClick={handleBookClick}>
              <i className="bi bi-calendar-plus"></i>
              Book Appointment
            </button>

            <span className="dashboard-role-badge receptionist-badge">
              <i className="bi bi-headset"></i>
              RECEPTIONIST
            </span>
          </div>
        </div>

        {error && (
          <div className="premium-alert danger" style={{ marginBottom: '1.5rem' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="stat-grid">
          <StatCard icon="bi-people-fill" label="Total Patients" value={patients.length} variant="patients" />
          <StatCard icon="bi-heart-pulse-fill" label="Doctors" value={doctors.length} variant="doctors" />
          <StatCard icon="bi-clock-history" label="Pending" value={scheduledCount} variant="scheduled" />
          <StatCard icon="bi-cash-coin" label="Pending Payments" value={pendingTxnsCount} variant="cancelled" />
          <StatCard icon="bi-exclamation-triangle-fill" label="Emergency Cases" value={emergencyCount} variant="emergency" />
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
                <span className="pill-tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'patients' && (
              <div>
                <div className="tab-toolbar">
                  <h5>Patients <span>({patients.length})</span></h5>
                  <div className="toolbar-actions-row">
                    <div className="search-box">
                      <i className="bi bi-search"></i>
                      <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      className="btn-gradient-primary toolbar-action-btn"
                      onClick={handleAddPatient}
                    >
                      <i className="bi bi-person-plus"></i>
                      Register Patient
                    </button>
                  </div>
                </div>

                {filteredPatients.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-person-heart"></i>
                    <p>{searchTerm ? 'No patients match your search.' : 'No patients yet.'}</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Age</th>
                          <th>Gender</th>
                          <th>Phone</th>
                          <th>Blood</th>
                          <th>Type</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.map((p) => (
                          <tr key={p.id}>
                            <td><strong>#{p.id}</strong></td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{p.name}</div>
                              {p.mlcNumber && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--hms-muted)' }}>
                                  {p.mlcNumber}
                                </div>
                              )}
                            </td>
                            <td>{p.age}</td>
                            <td>{p.gender}</td>
                            <td>{p.phone}</td>
                            <td>
                              {p.bloodGroup ? (
                                <span className="status-badge cancelled">{p.bloodGroup}</span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>—</span>
                              )}
                            </td>
                            <td>
                              {p.isMedicoLegal ? (
                                <span className="mlc-badge">
                                  <i className="bi bi-shield-exclamation"></i>
                                  MLC
                                </span>
                              ) : p.isEmergency ? (
                                <span className="emergency-row-badge">
                                  <i className="bi bi-exclamation-triangle-fill"></i>
                                  Emergency
                                </span>
                              ) : (
                                <span className="status-badge scheduled">Regular</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="row-btn edit"
                                onClick={() => handleEditPatient(p)}
                              >
                                <i className="bi bi-pencil"></i>
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <div className="tab-toolbar">
                  <h5>Appointments <span>({appointments.length})</span></h5>
                  <div className="appt-filters">
                    {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((f) => (
                      <button
                        key={f}
                        className={`filter-chip ${apptFilter === f ? 'active' : ''}`}
                        onClick={() => setApptFilter(f)}
                      >
                        {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredAppointments.length === 0 ? (
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
                        {filteredAppointments.map((a) => (
                          <tr key={a.id}>
                            <td><strong>#{a.id}</strong></td>
                            <td><div style={{ fontWeight: 600 }}>{a.patient?.name}</div></td>
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
                            <td>{a.reason}</td>
                            <td>
                              <span className={`status-badge ${statusClass(a.status)}`}>
                                <i className={`bi ${statusIcon(a.status)}`}></i>
                                {a.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') ? (
                                <button
                                  className="row-btn delete"
                                  onClick={() => handleCancelAppt(a.id)}
                                >
                                  <i className="bi bi-x-lg"></i>
                                  Cancel
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
            )}

            {activeTab === 'doctors' && (
              <div>
                <div className="tab-toolbar">
                  <h5>Doctors <span>({doctors.length})</span></h5>
                </div>

                {doctors.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-heart-pulse"></i>
                    <p>No doctors registered yet.</p>
                  </div>
                ) : (
                  <div className="doctor-cards-grid">
                    {doctors.map((d) => (
                      <div key={d.id} className="doctor-card">
                        <div className="doctor-card-avatar">
                          <i className="bi bi-person-badge"></i>
                        </div>
                        <h6 className="doctor-card-name">{d.name}</h6>
                        <span className="doctor-card-spec">{d.specialization}</span>
                        <div className="doctor-card-info">
                          <div><i className="bi bi-telephone"></i> {d.phone}</div>
                          {d.department && (
                            <div><i className="bi bi-building"></i> {d.department}</div>
                          )}
                          <div><i className="bi bi-calendar-week"></i> {d.experience} years</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <div className="tab-toolbar">
                  <h5>Billing & Payments <span>({filteredTransactions.length})</span></h5>
                  <div className="toolbar-actions-row">
                    <div className="search-box">
                      <i className="bi bi-search"></i>
                      <input
                        type="text"
                        placeholder="Search receipt, patient, doctor..."
                        value={billingSearchTerm}
                        onChange={(e) => setBillingSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-receipt"></i>
                    <p>{billingSearchTerm ? 'No transactions match your search.' : 'No transactions found.'}</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Receipt #</th>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((t) => (
                          <tr key={t.id}>
                            <td><strong>{t.receiptNumber || `TXN-${t.id}`}</strong></td>
                            <td>{t.patient?.name}</td>
                            <td>{t.doctor?.name}</td>
                            <td><span className="fw-bold text-success">₹{t.amount}</span></td>
                            <td>
                              <span className={`status-badge ${t.status === 'PAID' ? 'completed' : 'scheduled'}`}>
                                {t.status === 'PENDING' ? 'INCOMPLETE' : t.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {t.status === 'PENDING' ? (
                                <button 
                                  className="row-btn complete" 
                                  onClick={() => handleCollectPayment(t)}
                                >
                                  <i className="bi bi-cash-coin"></i> Collect Payment
                                </button>
                              ) : (
                                <button 
                                  className="row-btn history" 
                                  onClick={() => handleDownloadBill(t)}
                                >
                                  <i className="bi bi-download"></i> Bill
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPatientModal && (
        <div className="profile-modal-overlay" onClick={() => setShowPatientModal(false)}>
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640 }}
          >
            <div className="profile-modal-header receptionist">
              <button
                className="profile-modal-close"
                onClick={() => setShowPatientModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="profile-avatar receptionist">
                <i className="bi bi-person-plus-fill"></i>
              </div>
              <div className="profile-header-text">
                <h3 className="profile-username">
                  {editingPatientId ? 'Edit Patient' : 'Register Patient'}
                </h3>
                <span className="profile-role-chip receptionist">
                  <i className="bi bi-clipboard2-pulse"></i>
                  {editingPatientId ? `Patient #${editingPatientId}` : 'New Registration'}
                </span>
              </div>
            </div>
            <div className="profile-modal-body">
              <form onSubmit={handlePatientSubmit}>
                <div className="premium-section-header">Personal Info</div>
                <div className="premium-row">
                  <div className="premium-input-group">
                    <i className="bi bi-person input-icon"></i>
                    <input name="name" placeholder="Full Name" required
                      value={patientForm.name} onChange={handlePatientChange} />
                  </div>
                  <div className="premium-input-group">
                    <i className="bi bi-telephone input-icon"></i>
                    <input name="phone" placeholder="Phone (10 digits)" pattern="\d{10}" required
                      value={patientForm.phone} onChange={handlePatientChange} />
                  </div>
                </div>

                <div className="premium-row three">
                  <div className="premium-input-group">
                    <i className="bi bi-envelope input-icon"></i>
                    <input type="email" name="email" placeholder="Email (optional)"
                      value={patientForm.email} onChange={handlePatientChange} />
                  </div>
                  <div className="premium-input-group">
                    <i className="bi bi-123 input-icon"></i>
                    <input type="number" name="age" placeholder="Age" min="0" max="120" required
                      value={patientForm.age} onChange={handlePatientChange} />
                  </div>
                  <div className="premium-input-group">
                    <i className="bi bi-gender-ambiguous input-icon"></i>
                    <select name="gender" required value={patientForm.gender} onChange={handlePatientChange}>
                      <option value="">Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="premium-row">
                  <div className="premium-input-group">
                    <i className="bi bi-droplet input-icon"></i>
                    <input name="bloodGroup" placeholder="Blood Group"
                      value={patientForm.bloodGroup} onChange={handlePatientChange} />
                  </div>
                  <div className="premium-input-group">
                    <i className="bi bi-telephone-plus input-icon"></i>
                    <input name="emergencyContact" placeholder="Emergency Contact"
                      value={patientForm.emergencyContact} onChange={handlePatientChange} />
                  </div>
                </div>

                <div className="premium-input-group">
                  <i className="bi bi-house input-icon"></i>
                  <input name="address" placeholder="Address"
                    value={patientForm.address} onChange={handlePatientChange} />
                </div>

                <div className="form-panel-actions">
                  <button type="submit" className="btn-gradient-primary" disabled={saving}>
                    {saving ? (
                      <><span className="spinner-border spinner-border-sm"></span>Saving...</>
                    ) : (
                      <><i className="bi bi-check-lg"></i>{editingPatientId ? 'Update Patient' : 'Register Patient'}</>
                    )}
                  </button>
                  <button type="button" className="btn-soft" onClick={() => setShowPatientModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showApptModal && (
        <div className="profile-modal-overlay" onClick={() => setShowApptModal(false)}>
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 650 }}
          >
            <div className="profile-modal-header receptionist">
              <button className="profile-modal-close" onClick={() => setShowApptModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="profile-avatar receptionist">
                <i className="bi bi-calendar-plus"></i>
              </div>
              <div className="profile-header-text">
                <h3 className="profile-username">Book Appointment</h3>
                <span className="profile-role-chip receptionist">
                  <i className="bi bi-headset"></i>
                  Reception Desk
                </span>
              </div>
            </div>
            <div className="profile-modal-body">
              {apptError && (
                <div className="premium-alert danger">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{apptError}</span>
                </div>
              )}
              <form onSubmit={handleApptSubmit}>
                
                <div className="premium-row" style={{ marginBottom: '1.5rem' }}>
                  <div className="premium-input-group">
                    <i className="bi bi-person-heart input-icon"></i>
                    <select name="patientId" required value={apptForm.patientId} onChange={handleApptChange}>
                      <option value="">1. Choose patient</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (ID: {p.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="premium-input-group">
                    <i className="bi bi-heart-pulse input-icon"></i>
                    <select name="doctorId" required value={apptForm.doctorId} onChange={handleApptChange}>
                      <option value="">2. Choose doctor</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {apptForm.doctorId && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label fw-bold mb-2">3. Select Date</label>
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
                            border: apptForm.appointmentDate === dateObj.fullDate ? '2px solid var(--hms-violet)' : '1px solid #e2e8f0',
                            background: apptForm.appointmentDate === dateObj.fullDate ? '#faf5ff' : '#fff',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{dateObj.dayName}</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: apptForm.appointmentDate === dateObj.fullDate ? 'var(--hms-violet)' : '#1e293b' }}>{dateObj.dayNum}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{dateObj.month}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {apptForm.appointmentDate && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label fw-bold mb-2 d-flex justify-content-between">
                      <span>4. Select Time Slot</span>
                      {loadingSlots && <span className="spinner-border spinner-border-sm text-primary"></span>}
                    </label>
                    <div className="d-flex flex-wrap gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {generateTimeSlots().map((slot) => {
                        const isPast = isSlotPast(slot.value)
                        const booked = isSlotBooked(slot.value)
                        const isSelected = apptForm.appointmentTime === slot.value

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
                                setApptForm({ ...apptForm, appointmentTime: slot.value })
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

                {apptForm.appointmentTime && (
                  <div className="premium-input-group" style={{ marginBottom: '1.5rem' }}>
                    <i className="bi bi-chat-left-text input-icon"></i>
                    <input name="reason" placeholder="Reason for visit" required
                      value={apptForm.reason} onChange={handleApptChange} />
                  </div>
                )}

                <div className="form-panel-actions">
                  <button type="submit" className="btn-gradient-primary w-100" disabled={saving || !apptForm.appointmentTime}>
                    {saving ? (
                      <><span className="spinner-border spinner-border-sm"></span> Booking...</>
                    ) : (
                      <><i className="bi bi-check-lg"></i> Confirm Booking</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEmergencyModal && (
        <div className="profile-modal-overlay" onClick={closeEmergencyModal}>
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 760 }}
          >
            <div className="profile-modal-header emergency">
              <button className="profile-modal-close" onClick={closeEmergencyModal}>
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="profile-avatar emergency">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div className="profile-header-text">
                <h3 className="profile-username">Emergency / Medico-Legal Case</h3>
                <span className="profile-role-chip emergency">
                  <i className="bi bi-shield-exclamation"></i>
                  Register Immediately
                </span>
              </div>
            </div>

            <div className="profile-modal-body">
              {emergencySuccess ? (
                <div>
                  <div className="mlc-success-card">
                    <div className="mlc-success-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h4 className="mlc-success-title">Emergency Case Registered</h4>
                    <p className="mlc-success-subtitle">
                      Patient is registered but has <strong>no login access</strong>. 
                      A password must be set later if the patient wishes to log in.
                    </p>

                    <div className="mlc-success-grid">
                      <div className="mlc-success-item">
                        <div className="mlc-success-label">Patient ID</div>
                        <div className="mlc-success-value">#{emergencySuccess.id}</div>
                      </div>
                      <div className="mlc-success-item">
                        <div className="mlc-success-label">MLC Number</div>
                        <div className="mlc-success-value mlc-highlight">
                          {emergencySuccess.mlcNumber || '—'}
                        </div>
                      </div>
                      <div className="mlc-success-item">
                        <div className="mlc-success-label">Name</div>
                        <div className="mlc-success-value">{emergencySuccess.name}</div>
                      </div>
                      <div className="mlc-success-item">
                        <div className="mlc-success-label">Registered At</div>
                        <div className="mlc-success-value">
                          {emergencySuccess.registeredAt?.substring(0, 16).replace('T', ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="mlc-success-actions">
                      <button className="btn-gradient-primary" onClick={closeEmergencyModal}>
                        <i className="bi bi-check-lg"></i>
                        Done
                      </button>
                      <button
                        className="btn-soft"
                        onClick={() => {
                          setEmergencySuccess(null)
                          setEmergencyForm(emptyEmergency)
                        }}
                      >
                        <i className="bi bi-plus-lg me-1"></i>
                        Register Another
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="emergency-warning">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <div>
                      <strong>Emergency Protocol</strong>
                      <p>
                        Fill only what is known. Use <strong>"Unknown"</strong> if the patient is unidentified.
                        The system generates an MLC number automatically.
                      </p>
                    </div>
                  </div>

                  {emergencyError && (
                    <div className="premium-alert danger">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      <span>{emergencyError}</span>
                    </div>
                  )}

                  <form onSubmit={handleEmergencySubmit}>
                    <div className="premium-section-header">Patient Identity</div>
                    <div className="premium-row">
                      <div className="premium-input-group">
                        <i className="bi bi-person input-icon"></i>
                        <input name="name" placeholder="Name (or 'Unknown')" required
                          value={emergencyForm.name} onChange={handleEmergencyChange} />
                      </div>
                      <div className="premium-input-group">
                        <i className="bi bi-123 input-icon"></i>
                        <input type="number" name="age" placeholder="Estimated Age" min="0" max="120" required
                          value={emergencyForm.age} onChange={handleEmergencyChange} />
                      </div>
                    </div>

                    <div className="premium-row three">
                      <div className="premium-input-group">
                        <i className="bi bi-gender-ambiguous input-icon"></i>
                        <select name="gender" required
                          value={emergencyForm.gender} onChange={handleEmergencyChange}>
                          <option value="">Gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="premium-input-group">
                        <i className="bi bi-telephone input-icon"></i>
                        <input name="phone" placeholder="Contact Number (10 digits)" pattern="\d{10}" required
                          value={emergencyForm.phone} onChange={handleEmergencyChange} />
                      </div>
                      <div className="premium-input-group">
                        <i className="bi bi-droplet input-icon"></i>
                        <input name="bloodGroup" placeholder="Blood Group"
                          value={emergencyForm.bloodGroup} onChange={handleEmergencyChange} />
                      </div>
                    </div>

                    <div className="premium-section-header">Incident Details</div>
                    <div className="premium-row">
                      <div className="premium-input-group">
                        <i className="bi bi-geo-alt input-icon"></i>
                        <input name="incidentLocation" placeholder="Location of incident"
                          value={emergencyForm.incidentLocation} onChange={handleEmergencyChange} />
                      </div>
                      <div className="premium-input-group">
                        <i className="bi bi-calendar-event input-icon"></i>
                        <input type="datetime-local" name="incidentDateTime"
                          value={emergencyForm.incidentDateTime} onChange={handleEmergencyChange} />
                      </div>
                    </div>

                    <div className="premium-input-group">
                      <i className="bi bi-bandaid input-icon"></i>
                      <input name="injuryDescription" placeholder="Visible injuries / condition on arrival"
                        value={emergencyForm.injuryDescription} onChange={handleEmergencyChange} />
                    </div>

                    <div className="premium-section-header">Brought By / Informant</div>
                    <div className="premium-row">
                      <div className="premium-input-group">
                        <i className="bi bi-person-walking input-icon"></i>
                        <input name="broughtBy" placeholder="Brought by (person/ambulance/police)"
                          value={emergencyForm.broughtBy} onChange={handleEmergencyChange} />
                      </div>
                      <div className="premium-input-group">
                        <i className="bi bi-telephone-plus input-icon"></i>
                        <input name="broughtByPhone" placeholder="Brought-by contact"
                          value={emergencyForm.broughtByPhone} onChange={handleEmergencyChange} />
                      </div>
                    </div>

                    <div className="premium-row">
                      <div className="premium-input-group">
                        <i className="bi bi-person-lines-fill input-icon"></i>
                        <input name="informantName" placeholder="Informant name (if any)"
                          value={emergencyForm.informantName} onChange={handleEmergencyChange} />
                      </div>
                      <div className="premium-input-group">
                        <i className="bi bi-telephone input-icon"></i>
                        <input name="informantPhone" placeholder="Informant phone"
                          value={emergencyForm.informantPhone} onChange={handleEmergencyChange} />
                      </div>
                    </div>

                    <div className="premium-section-header">
                      Medico-Legal Details
                    </div>

                    <div className="mlc-toggle-row">
                      <label className="mlc-toggle">
                        <input
                          type="checkbox"
                          name="isMedicoLegal"
                          checked={emergencyForm.isMedicoLegal}
                          onChange={handleEmergencyChange}
                        />
                        <span className="mlc-toggle-slider"></span>
                        <span className="mlc-toggle-label">
                          <i className="bi bi-shield-exclamation me-1"></i>
                          This is a Medico-Legal Case (MLC)
                        </span>
                      </label>
                    </div>

                    {emergencyForm.isMedicoLegal && (
                      <div className="premium-row">
                        <div className="premium-input-group">
                          <i className="bi bi-building-check input-icon"></i>
                          <input name="policeStation" placeholder="Police Station"
                            value={emergencyForm.policeStation} onChange={handleEmergencyChange} />
                        </div>
                        <div className="premium-input-group">
                          <i className="bi bi-file-earmark-text input-icon"></i>
                          <input name="firNumber" placeholder="FIR Number"
                            value={emergencyForm.firNumber} onChange={handleEmergencyChange} />
                        </div>
                      </div>
                    )}

                    <div className="premium-section-header">Attending Doctor</div>
                    <div className="premium-input-group">
                      <i className="bi bi-heart-pulse input-icon"></i>
                      <select name="attendingDoctor" required
                        value={emergencyForm.attendingDoctor} onChange={handleEmergencyChange}>
                        <option value="">Select attending doctor *</option>
                        {doctors.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name} — {d.specialization}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="premium-input-group">
                      <i className="bi bi-journal-text input-icon"></i>
                      <textarea
                        name="emergencyNotes"
                        placeholder="Additional notes (e.g. triage, vitals, allergies known)"
                        rows={3}
                        value={emergencyForm.emergencyNotes}
                        onChange={handleEmergencyChange}
                        style={{
                          width: '100%',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '0.85rem 1rem 0.85rem 2.85rem',
                          fontSize: '0.95rem',
                          background: '#f8fafc',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div className="form-panel-actions">
                      <button
                        type="submit"
                        className="emergency-submit-btn"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm"></span>
                            Registering...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            Register Emergency Case
                          </>
                        )}
                      </button>
                      <button type="button" className="btn-soft" onClick={closeEmergencyModal}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
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