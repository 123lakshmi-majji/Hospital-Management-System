import { useState, useEffect } from 'react'
import { getNearbyStores } from '../../api/storeApi.js'
import StoreMap from '../StoreMap.jsx'

// Common AP cities for manual selection
const AP_CITIES = [
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
  { name: 'Guntur', lat: 16.3067, lng: 80.4365 },
  { name: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  { name: 'Nellore', lat: 14.4426, lng: 79.9865 },
  { name: 'Rajahmundry', lat: 17.0005, lng: 81.8040 },
  { name: 'Kurnool', lat: 15.8281, lng: 78.0373 },
  { name: 'Anantapur', lat: 14.6819, lng: 77.6006 },
]

export default function NearbyStoresTab() {
  const [nearbyStores, setNearbyStores] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [radius, setRadius] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [locationLabel, setLocationLabel] = useState('')

  const loadNearby = async (lat, lng, r = radius) => {
    setLoading(true)
    setError('')
    try {
      const res = await getNearbyStores(lat, lng, r)
      setNearbyStores(res.data)
      setUserLocation([lat, lng])
    } catch (err) {
      setError('Could not load nearby stores')
    } finally {
      setLoading(false)
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support geolocation. Please select a city below.')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLabel('Your current location')
        loadNearby(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        setLoading(false)
        setError('Location permission denied. Please select a city below.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const selectCity = (city) => {
    setLocationLabel(city.name)
    loadNearby(city.lat, city.lng)
  }

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius)
    if (userLocation) loadNearby(userLocation[0], userLocation[1], newRadius)
  }

  return (
    <div>
      <div className="tab-toolbar">
        <h5>Find Nearby Medical Stores</h5>
      </div>

      {/* Location picker */}
      <div className="nearby-controls">
        <button className="btn-gradient-primary" onClick={useMyLocation}>
          <i className="bi bi-crosshair"></i>
          Use My Location
        </button>

        <div className="radius-selector">
          <label>Radius:</label>
          <select value={radius} onChange={(e) => handleRadiusChange(Number(e.target.value))}>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
            <option value={200}>200 km</option>
            <option value={500}>500 km</option>
          </select>
        </div>
      </div>

      {/* City quick-pick */}
      <div className="city-chips">
        <span className="city-chips-label">Or pick a city:</span>
        {AP_CITIES.map((c) => (
          <button
            key={c.name}
            className={`city-chip ${locationLabel === c.name ? 'active' : ''}`}
            onClick={() => selectCity(c)}
          >
            <i className="bi bi-geo-alt"></i>
            {c.name}
          </button>
        ))}
      </div>

      {error && (
        <div className="premium-alert danger" style={{ marginTop: '1rem' }}>
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="dashboard-loading">
          <span className="spinner-border spinner-border-sm"></span>
          Finding stores near you...
        </div>
      )}

      {!loading && !userLocation && (
        <div className="empty-state">
          <i className="bi bi-geo-alt"></i>
          <p>Click "Use My Location" or pick a city to see nearby stores.</p>
        </div>
      )}

      {!loading && userLocation && (
        <>
          {/* Map */}
          <div className="store-map-container mt-3">
            <StoreMap
              stores={nearbyStores.map((row) => row.store)}
              center={userLocation}
              zoom={8}
              userLocation={userLocation}
              height={450}
            />
          </div>

          {/* Results header */}
          <div className="nearby-results-header">
            <h6>
              <i className="bi bi-shop"></i>
              {nearbyStores.length} store{nearbyStores.length !== 1 ? 's' : ''} found within {radius} km
              {locationLabel && <span className="nearby-location-label"> · {locationLabel}</span>}
            </h6>
          </div>

          {/* Store cards */}
          {nearbyStores.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-shop"></i>
              <p>No stores within {radius} km. Try increasing the radius.</p>
            </div>
          ) : (
            <div className="nearby-store-grid">
              {nearbyStores.map((row) => {
                const s = row.store
                return (
                  <div key={s.id} className="nearby-store-card">
                    <div className="nearby-store-header">
                      <div className="nearby-store-icon">
                        <i className="bi bi-shop"></i>
                      </div>
                      <div>
                        <h6 className="nearby-store-name">{s.name}</h6>
                        <span className="nearby-store-city">
                          <i className="bi bi-geo-alt-fill"></i> {s.city}
                        </span>
                      </div>
                    </div>

                    <div className="nearby-store-distance">
                      <i className="bi bi-signpost-2"></i>
                      <strong>{row.distanceKm} km away</strong>
                    </div>

                    <div className="nearby-store-info">
                      <div><i className="bi bi-house-door"></i> {s.address}</div>
                      <div><i className="bi bi-telephone"></i> {s.phone}</div>
                      <div>
                        <i className="bi bi-clock"></i>{' '}
                        {s.has24Hours
                          ? <span className="store-24h-badge">Open 24 Hours</span>
                          : s.openingHours || 'Timings not set'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}