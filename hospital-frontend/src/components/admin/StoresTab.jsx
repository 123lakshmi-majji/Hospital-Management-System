import { useState, useEffect } from 'react'
import {
  getAllStores,
  createStore,
  updateStore,
  deleteStore,
} from '../../api/storeApi.js'
import StoreMap from '../StoreMap.jsx'

const emptyStore = {
  name: '',
  city: '',
  address: '',
  phone: '',
  latitude: '',
  longitude: '',
  openingHours: '',
  has24Hours: false,
  isActive: true,
}

export default function StoresTab() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyStore)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const res = await getAllStores()
      setStores(res.data)
    } catch (err) {
      alert('Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setForm(emptyStore)
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (s) => {
    setForm({
      name: s.name,
      city: s.city,
      address: s.address,
      phone: s.phone,
      latitude: s.latitude,
      longitude: s.longitude,
      openingHours: s.openingHours || '',
      has24Hours: s.has24Hours || false,
      isActive: s.isActive !== false,
    })
    setEditingId(s.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medical store?')) return
    try {
      await deleteStore(id)
      load()
    } catch (err) {
      alert('Failed to delete store')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      }
      if (editingId) await updateStore(editingId, payload)
      else await createStore(payload)
      setShowForm(false)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save store')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="tab-toolbar">
        <h5>Medical Stores <span>({stores.length})</span></h5>
        <button className="btn-gradient-primary" onClick={handleAdd}>
          <i className="bi bi-plus-lg"></i>
          Add Store
        </button>
      </div>

      {/* Map showing all stores */}
      {!loading && stores.length > 0 && (
        <div className="store-map-container">
          <StoreMap stores={stores} zoom={7} height={420} />
        </div>
      )}

      {showForm && (
        <div className="form-panel mt-3">
          <h6 className="form-panel-title">
            <i className={`bi ${editingId ? 'bi-pencil-square' : 'bi-shop'}`}></i>
            {editingId ? 'Edit Store' : 'Add New Store'}
          </h6>
          <form onSubmit={handleSubmit}>
            <div className="premium-row">
              <div className="premium-input-group">
                <i className="bi bi-shop input-icon"></i>
                <input name="name" placeholder="Store Name" required
                  value={form.name} onChange={handleChange} />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-geo input-icon"></i>
                <input name="city" placeholder="City" required
                  value={form.city} onChange={handleChange} />
              </div>
            </div>
            <div className="premium-input-group">
              <i className="bi bi-house input-icon"></i>
              <input name="address" placeholder="Full Address" required
                value={form.address} onChange={handleChange} />
            </div>
            <div className="premium-row">
              <div className="premium-input-group">
                <i className="bi bi-telephone input-icon"></i>
                <input name="phone" placeholder="Phone (10 digits)" pattern="\d{10}" required
                  value={form.phone} onChange={handleChange} />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-clock input-icon"></i>
                <input name="openingHours" placeholder="Opening hours (e.g. 9AM - 9PM)"
                  value={form.openingHours} onChange={handleChange} />
              </div>
            </div>
            <div className="premium-row">
              <div className="premium-input-group">
                <i className="bi bi-crosshair input-icon"></i>
                <input type="number" step="any" name="latitude" placeholder="Latitude (e.g. 16.5062)" required
                  value={form.latitude} onChange={handleChange} />
              </div>
              <div className="premium-input-group">
                <i className="bi bi-crosshair input-icon"></i>
                <input type="number" step="any" name="longitude" placeholder="Longitude (e.g. 80.6480)" required
                  value={form.longitude} onChange={handleChange} />
              </div>
            </div>

            <div className="store-toggles">
              <label className="store-toggle">
                <input type="checkbox" name="has24Hours"
                  checked={form.has24Hours} onChange={handleChange} />
                <span>Open 24 Hours</span>
              </label>
              <label className="store-toggle">
                <input type="checkbox" name="isActive"
                  checked={form.isActive} onChange={handleChange} />
                <span>Active</span>
              </label>
            </div>

            <div className="form-panel-actions">
              <button type="submit" className="btn-gradient-primary" disabled={saving}>
                {saving ? (
                  <><span className="spinner-border spinner-border-sm"></span>Saving...</>
                ) : (
                  <><i className="bi bi-check-lg"></i>{editingId ? 'Update Store' : 'Create Store'}</>
                )}
              </button>
              <button type="button" className="btn-soft" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <span className="spinner-border spinner-border-sm"></span>
          Loading stores...
        </div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-shop"></i>
          <p>No stores yet. Click "Add Store" to create one.</p>
        </div>
      ) : (
        <div className="table-responsive mt-3">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>City</th>
                <th>Phone</th>
                <th>Hours</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td><strong>#{s.id}</strong></td>
                  <td><div style={{ fontWeight: 600 }}>{s.name}</div></td>
                  <td>{s.city}</td>
                  <td>{s.phone}</td>
                  <td>
                    {s.has24Hours
                      ? <span className="status-badge completed"><i className="bi bi-clock-fill"></i> 24h</span>
                      : <span style={{ fontSize: '0.85rem' }}>{s.openingHours || '—'}</span>}
                  </td>
                  <td>
                    {s.isActive ? (
                      <span className="status-badge completed">Active</span>
                    ) : (
                      <span className="status-badge cancelled">Inactive</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="row-btn edit me-1" onClick={() => handleEdit(s)}>
                      <i className="bi bi-pencil"></i>Edit
                    </button>
                    <button className="row-btn delete" onClick={() => handleDelete(s.id)}>
                      <i className="bi bi-trash"></i>Delete
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