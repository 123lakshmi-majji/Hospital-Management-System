import { useState, useEffect } from 'react'
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../../api/adminApi.js'

const emptyForm = {
  name: '',
  specialization: '',
  phone: '',
  email: '',
  experience: 0,
  department: '',
}

export default function DoctorsTab() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const res = await getDoctors()
      setDoctors(res.data)
    } catch (err) {
      setError('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const handleEditClick = (d) => {
    setForm({
      name: d.name,
      specialization: d.specialization,
      phone: d.phone,
      email: d.email || '',
      experience: d.experience,
      department: d.department || '',
    })
    setEditingId(d.id)
    setShowForm(true)
  }

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Delete this doctor?')) return
    try {
      await deleteDoctor(id)
      loadDoctors()
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete doctor.')
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) await updateDoctor(editingId, form)
      else await createDoctor(form)
      setShowForm(false)
      loadDoctors()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save doctor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="tab-toolbar">
        <h5>Doctors <span>({doctors.length})</span></h5>
        <button className="btn-gradient-primary" onClick={handleAddClick}>
          <i className="bi bi-plus-lg"></i>
          Add Doctor
        </button>
      </div>

      {error && (
        <div className="premium-alert danger">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <div className="form-panel">
          <h6 className="form-panel-title">
            <i className={`bi ${editingId ? 'bi-pencil-square' : 'bi-person-plus-fill'}`}></i>
            {editingId ? 'Edit Doctor' : 'Add New Doctor'}
          </h6>

          <form onSubmit={handleFormSubmit}>
            <div className="premium-row">
              <div className="premium-input-group">
                <i className="bi bi-person input-icon"></i>
                <input
                  name="name"
                  placeholder="Full Name"
                  required
                  value={form.name}
                  onChange={handleFormChange}
                />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-heart-pulse input-icon"></i>
                <input
                  name="specialization"
                  placeholder="Specialization"
                  required
                  value={form.specialization}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="premium-row">
              <div className="premium-input-group">
                <i className="bi bi-telephone input-icon"></i>
                <input
                  name="phone"
                  placeholder="Phone (10 digits)"
                  pattern="\d{10}"
                  required
                  value={form.phone}
                  onChange={handleFormChange}
                />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-envelope input-icon"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="premium-row">
              <div className="premium-input-group">
                <i className="bi bi-calendar-week input-icon"></i>
                <input
                  type="number"
                  name="experience"
                  placeholder="Years of Experience"
                  min="0"
                  required
                  value={form.experience}
                  onChange={handleFormChange}
                />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-building input-icon"></i>
                <input
                  name="department"
                  placeholder="Department"
                  value={form.department}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-panel-actions">
              <button type="submit" className="btn-gradient-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg"></i>
                    {editingId ? 'Update Doctor' : 'Create Doctor'}
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-soft"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <span className="spinner-border spinner-border-sm"></span>
          Loading doctors...
        </div>
      ) : doctors.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-heart-pulse"></i>
          <p>No doctors found. Click "Add Doctor" to create one.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Experience</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td><strong>#{d.id}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                  </td>
                  <td>
                    <span className="status-badge scheduled">{d.specialization}</span>
                  </td>
                  <td>{d.phone}</td>
                  <td>{d.experience} yrs</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="row-btn edit me-1"
                      onClick={() => handleEditClick(d)}
                    >
                      <i className="bi bi-pencil"></i>
                      Edit
                    </button>
                    <button
                      className="row-btn delete"
                      onClick={() => handleDeleteClick(d.id)}
                    >
                      <i className="bi bi-trash"></i>
                      Delete
                    </button>
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