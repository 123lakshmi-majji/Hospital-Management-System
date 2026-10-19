import { useState, useEffect } from 'react'
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from '../../api/adminApi.js'

const emptyForm = {
  name: '',
  age: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  bloodGroup: '',
  emergencyContact: '',
}

export default function PatientsTab() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const res = await getPatients()
      setPatients(res.data)
    } catch (err) {
      setError('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const handleEditClick = (p) => {
    setForm({
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      email: p.email || '',
      address: p.address || '',
      bloodGroup: p.bloodGroup || '',
      emergencyContact: p.emergencyContact || '',
    })
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Delete this patient?')) return
    try {
      await deletePatient(id)
      loadPatients()
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete patient.')
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
      const payload = { ...form, age: Number(form.age) }
      if (editingId) await updatePatient(editingId, payload)
      else await createPatient(payload)
      setShowForm(false)
      loadPatients()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save patient')
    } finally {
      setSaving(false)
    }
  }

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* ============ TOOLBAR — search + Add Patient on ONE line ============ */}
      <div className="tab-toolbar">
        <h5>Patients <span>({patients.length})</span></h5>
        <div className="toolbar-actions-row">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn-gradient-primary toolbar-action-btn"
            onClick={handleAddClick}
          >
            <i className="bi bi-plus-lg"></i>
            Add Patient
          </button>
        </div>
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
            {editingId ? 'Edit Patient' : 'Add New Patient'}
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
            </div>

            <div className="premium-row three">
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
              <div className="premium-input-group">
                <i className="bi bi-123 input-icon"></i>
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  min="0"
                  max="120"
                  required
                  value={form.age}
                  onChange={handleFormChange}
                />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-gender-ambiguous input-icon"></i>
                <select
                  name="gender"
                  required
                  value={form.gender}
                  onChange={handleFormChange}
                >
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
                <input
                  name="bloodGroup"
                  placeholder="Blood Group"
                  value={form.bloodGroup}
                  onChange={handleFormChange}
                />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-telephone-plus input-icon"></i>
                <input
                  name="emergencyContact"
                  placeholder="Emergency Contact"
                  value={form.emergencyContact}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="premium-input-group">
              <i className="bi bi-house input-icon"></i>
              <input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleFormChange}
              />
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
                    {editingId ? 'Update Patient' : 'Create Patient'}
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
          Loading patients...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-person-heart"></i>
          <p>{search ? 'No patients match your search.' : 'No patients found.'}</p>
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
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td><strong>#{p.id}</strong></td>
                  <td><div style={{ fontWeight: 600 }}>{p.name}</div></td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>{p.phone}</td>
                  <td>
                    {p.bloodGroup ? (
                      <span className="status-badge cancelled">{p.bloodGroup}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-group">
                      <button
                        className="row-btn edit"
                        onClick={() => handleEditClick(p)}
                      >
                        <i className="bi bi-pencil"></i>
                        Edit
                      </button>
                      <button
                        className="row-btn delete"
                        onClick={() => handleDeleteClick(p.id)}
                      >
                        <i className="bi bi-trash"></i>
                        Delete
                      </button>
                    </div>
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