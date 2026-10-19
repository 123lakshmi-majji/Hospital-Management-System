import { useState, useEffect } from 'react'
import { getDashboardStats } from '../api/adminApi.js'
import { getAllTransactions } from '../api/transactionApi.js'
import DoctorsTab from '../components/admin/DoctorsTab.jsx'
import PatientsTab from '../components/admin/PatientsTab.jsx'
import AppointmentsTab from '../components/admin/AppointmentsTab.jsx'
import StoresTab from '../components/admin/StoresTab.jsx'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('doctors')

  // ✅ Toast Notification State
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    loadStats()
  }, [])

  // ✅ Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: '', type: 'success' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const loadStats = async () => {
    try {
      setLoading(true)
      const [statsRes, txnRes] = await Promise.all([
        getDashboardStats(),
        getAllTransactions().catch(() => ({ data: [] }))
      ])
      setStats(statsRes.data)
      setTransactions(txnRes.data)
    } catch (err) {
      console.error('[ADMIN DASHBOARD]', err)
      setError('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  // Financial Calculations
  const paidTransactions = transactions.filter((t) => t.status === 'PAID')
  const totalRevenue = paidTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  
  const todayStr = new Date().toISOString().split('T')[0]
  const todayRevenue = paidTransactions
    .filter((t) => t.paidAt?.startsWith(todayStr))
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  // Doctor-wise earnings breakdown
  const doctorEarnings = paidTransactions.reduce((acc, t) => {
    const docName = t.doctor?.name || 'Unknown Doctor'
    const docSpec = t.doctor?.specialization || '—'
    if (!acc[docName]) {
      acc[docName] = { name: docName, specialization: docSpec, amount: 0, count: 0 }
    }
    acc[docName].amount += (t.amount || 0)
    acc[docName].count += 1
    return acc
  }, {})
  const doctorStatsArray = Object.values(doctorEarnings).sort((a, b) => b.amount - a.amount)

  const tabs = [
    { id: 'doctors', label: 'Doctors', icon: 'bi-heart-pulse' },
    { id: 'patients', label: 'Patients', icon: 'bi-people' },
    { id: 'appointments', label: 'Appointments', icon: 'bi-calendar2-week' },
    { id: 'stores', label: 'Medical Stores', icon: 'bi-shop' },
    { id: 'revenue', label: 'Revenue & Billing', icon: 'bi-cash-coin' }, 
  ]

  return (
    <div className="dashboard-page">
      
      {/* ✅ Custom Toast Notification UI */}
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
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">
              Full administrative control of Hospivexa
            </p>
          </div>
          <span className="dashboard-role-badge">
            <i className="bi bi-shield-fill-check"></i>
            ADMIN
          </span>
        </div>

        {error && (
          <div className="premium-alert danger" style={{ marginBottom: '1.5rem' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="dashboard-loading">
            <span className="spinner-border spinner-border-sm"></span>
            Loading statistics...
          </div>
        ) : stats ? (
          <div className="stat-grid">
            {/* Revenue Stat Cards */}
            <StatCard icon="bi-currency-rupee" label="Total Revenue" value={`₹${totalRevenue}`} variant="completed" />
            <StatCard icon="bi-graph-up-arrow" label="Today's Revenue" value={`₹${todayRevenue}`} variant="scheduled" />
            
            {/* Existing Stat Cards */}
            <StatCard icon="bi-people-fill" label="Total Users" value={stats.totalUsers} variant="users" />
            <StatCard icon="bi-heart-pulse-fill" label="Doctors" value={stats.totalDoctors} variant="doctors" />
            <StatCard icon="bi-person-heart" label="Patients" value={stats.totalPatients} variant="patients" />
            <StatCard icon="bi-calendar2-week-fill" label="Appointments" value={stats.totalAppointments} variant="appointments" />
            <StatCard icon="bi-clock-history" label="Scheduled" value={stats.scheduledAppointments} variant="scheduled" />
            <StatCard icon="bi-check-circle-fill" label="Completed" value={stats.completedAppointments} variant="completed" />
            <StatCard icon="bi-x-circle-fill" label="Cancelled" value={stats.cancelledAppointments} variant="cancelled" />
          </div>
        ) : null}

        {/* Tabs Content */}
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
              </button>
            ))}
          </div>

          <div className="tab-content">
            {/* ✅ PASSED showToast to child components */}
            {activeTab === 'doctors' && <DoctorsTab showToast={showToast} />}
            {activeTab === 'patients' && <PatientsTab showToast={showToast} />}
            {activeTab === 'appointments' && <AppointmentsTab onStatsChange={loadStats} showToast={showToast} />}
            {activeTab === 'stores' && <StoresTab showToast={showToast} />}
            
            {/* Revenue Tab Content */}
            {activeTab === 'revenue' && (
              <RevenueTab 
                paidTransactions={paidTransactions} 
                doctorStatsArray={doctorStatsArray} 
              />
            )}
          </div>
        </div>
      </div>
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

function RevenueTab({ paidTransactions, doctorStatsArray }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  const filteredTransactions = selectedDoctor
    ? paidTransactions.filter((t) => t.doctor?.name === selectedDoctor)
    : paidTransactions

  return (
    <div>
      <div className="row g-4">
        {/* Left Side: Doctor Earnings Breakdown */}
        <div className="col-md-5">
          <div className="tab-toolbar">
            <h5>Doctor Earnings <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>(Click to filter)</span></h5>
          </div>
          {doctorStatsArray.length === 0 ? (
             <div className="empty-state" style={{ padding: '2rem 1rem' }}>
               <i className="bi bi-pie-chart"></i>
               <p>No revenue data yet.</p>
             </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Patients</th>
                    <th>Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorStatsArray.map((doc, idx) => (
                    <tr 
                      key={idx}
                      onClick={() => setSelectedDoctor(selectedDoctor === doc.name ? null : doc.name)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedDoctor === doc.name ? '#f3e8ff' : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: selectedDoctor === doc.name ? 'var(--hms-violet)' : 'inherit' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--hms-muted)' }}>{doc.specialization}</div>
                      </td>
                      <td>{doc.count}</td>
                      <td><span className="fw-bold text-success">₹{doc.amount}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: All Transactions (Filtered) */}
        <div className="col-md-7">
          <div className="tab-toolbar">
            <h5>
              {selectedDoctor ? `${selectedDoctor}'s Transactions` : 'All Successful Transactions'}{' '}
              <span>({filteredTransactions.length})</span>
            </h5>
            {selectedDoctor && (
              <button 
                className="btn-soft" 
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }} 
                onClick={() => setSelectedDoctor(null)}
              >
                <i className="bi bi-x-lg me-1"></i> Clear Filter
              </button>
            )}
          </div>
          
          {filteredTransactions.length === 0 ? (
             <div className="empty-state" style={{ padding: '2rem 1rem' }}>
               <i className="bi bi-receipt"></i>
               <p>No transactions found for this doctor.</p>
             </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Patient</th>
                    <th>Method</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.receiptNumber || `TXN-${t.id}`}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--hms-muted)' }}>
                          {t.paidAt ? t.paidAt.substring(0, 10) : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.patient?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--hms-muted)' }}>{t.patient?.phone}</div>
                      </td>
                      <td>
                        <span className="status-badge scheduled" style={{ fontSize: '0.75rem' }}>
                          {t.paymentMethod || 'UPI'}
                        </span>
                      </td>
                      <td><span className="fw-bold text-success">₹{t.amount}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}