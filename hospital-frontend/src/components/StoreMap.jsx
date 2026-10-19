import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon (required for react-leaflet v4+)
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

// Custom red icon for user location
const UserIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div class="user-pulse"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export default function StoreMap({
  stores = [],
  center = [16.5062, 80.6480], // Vijayawada as default (center of AP)
  zoom = 7,
  userLocation = null,
  height = 500,
}) {
  return (
    <div className="store-map-wrapper" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: 16 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stores.map((s) => (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            icon={DefaultIcon}
          >
            <Popup>
              <div className="store-popup">
                <strong>{s.name}</strong>
                <div>{s.address}</div>
                <div>{s.city}</div>
                <div>📞 {s.phone}</div>
                {s.openingHours && <div>🕒 {s.openingHours}</div>}
                {s.has24Hours && <div className="store-24h">🟢 Open 24 Hours</div>}
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && (
          <Marker position={userLocation} icon={UserIcon}>
            <Popup>📍 You are here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}