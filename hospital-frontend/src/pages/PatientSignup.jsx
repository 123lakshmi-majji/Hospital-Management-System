import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerPatient } from '../api/authApi.js'

export default function PatientSignup() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // ✅ Password Match Validation
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please try again.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...payload } = form
      await registerPatient(payload)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Username may be taken.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // ✅ Outer page background - perfectly centers the card
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '2rem' 
    }}>
      
      {/* ✅ The Main Card */}
      <div style={{ 
        display: 'flex', 
        maxWidth: '1000px', 
        width: '100%', 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        overflow: 'hidden', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        height: 'auto', 
        maxHeight: '90vh'
      }}>
        
        {/* LEFT SIDE: Branding (Purple Panel) */}
        <div style={{ 
          flex: '4', 
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '3rem' 
        }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <i className="bi bi-person-heart" style={{ fontSize: '2rem' }}></i>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>Patient Registration</h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, marginBottom: '2rem', lineHeight: 1.5 }}>
            Create your patient account to easily book appointments and access your medical records.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
            <li><i className="bi bi-calendar-check me-2"></i> Easy online booking</li>
            <li><i className="bi bi-file-medical me-2"></i> Access medical history</li>
            <li><i className="bi bi-capsule me-2"></i> View prescriptions</li>
          </ul>
        </div>

        {/* RIGHT SIDE: Form */}
        <div style={{ flex: '6', padding: '3rem', overflowY: 'auto' }}>
          
          <div className="mb-4">
            <h2 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Create Patient Account</h2>
            <p className="text-muted">Join Hospivexa to manage your health</p>
          </div>

          {error && (
            <div className="premium-alert danger mb-3">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* SECTION 1: Credentials */}
            <h6 style={{ color: '#4f46e5', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <i className="bi bi-person-lock me-2"></i> Account Credentials
            </h6>
            <div className="premium-row">
              <div className="premium-input-group">
                <i className="bi bi-person input-icon"></i>
                <input name="username" placeholder="Username *" required value={form.username} onChange={handleChange} />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-telephone input-icon"></i>
                <input name="phone" placeholder="Phone (10 digits) *" pattern="\d{10}" required value={form.phone} onChange={handleChange} />
              </div>
            </div>
            
            <div className="premium-row">
              <div className="premium-input-group">
                <i className="bi bi-lock input-icon"></i>
                <input type="password" name="password" placeholder="Password *" required value={form.password} onChange={handleChange} />
              </div>
              {/* ✅ Confirm Password Field */}
              <div className="premium-input-group">
                <i className="bi bi-lock-fill input-icon"></i>
                <input type="password" name="confirmPassword" placeholder="Confirm Password *" required value={form.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            {/* SECTION 2: Personal Info */}
            <h6 style={{ color: '#4f46e5', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem' }}>
              <i className="bi bi-person-lines-fill me-2"></i> Personal Information
            </h6>
            
            <div className="premium-input-group">
              <i className="bi bi-person-vcard input-icon"></i>
              <input name="name" placeholder="Full Name *" required value={form.name} onChange={handleChange} />
            </div>

            <div className="premium-row three">
              <div className="premium-input-group">
                <i className="bi bi-envelope input-icon"></i>
                <input type="email" name="email" placeholder="Email (optional)" value={form.email} onChange={handleChange} />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-123 input-icon"></i>
                <input type="number" name="age" placeholder="Age *" required value={form.age} onChange={handleChange} />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-gender-ambiguous input-icon"></i>
                <select name="gender" required value={form.gender} onChange={handleChange}>
                  <option value="">Gender *</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="premium-row">
              <div className="premium-input-group">
                <i className="bi bi-droplet input-icon"></i>
                <input name="bloodGroup" placeholder="Blood Group (e.g. O+)" value={form.bloodGroup} onChange={handleChange} />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-telephone-plus input-icon"></i>
                <input name="emergencyContact" placeholder="Emergency Contact" value={form.emergencyContact} onChange={handleChange} />
              </div>
            </div>

            <div className="premium-input-group">
              <i className="bi bi-house input-icon"></i>
              <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
            </div>

            <button type="submit" className="btn-gradient-primary w-100 mt-4 py-3" disabled={loading} style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span> Creating Account...</> : 'Register as Patient'}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted mb-0">Already have an account? <Link to="/login" style={{ fontWeight: 600, color: '#4f46e5' }}>Log in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}