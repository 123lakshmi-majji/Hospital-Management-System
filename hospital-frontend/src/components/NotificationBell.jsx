import { useState, useEffect, useRef } from 'react'
import { useNotifications } from '../context/NotificationContext.jsx'

export default function NotificationBell() {
  const { notifications, unreadCount, clear, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handle = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0) setTimeout(() => markAllRead(), 700)
  }

  const timeAgo = (iso) => {
    if (!iso) return ''
    const ts = new Date(iso).getTime()
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const iconFor = (type) => {
    const map = {
      appointment: 'bi-calendar-check-fill',
      prescription: 'bi-capsule',
      record: 'bi-file-medical-fill',
      emergency: 'bi-exclamation-triangle-fill',
      user: 'bi-person-plus-fill',
      success: 'bi-check-circle-fill',
      warning: 'bi-exclamation-circle-fill',
      info: 'bi-info-circle-fill',
    }
    return map[type] || 'bi-bell-fill'
  }

  return (
    <div className="notification-bell-wrap" ref={wrapRef}>
      <button type="button" className="notification-bell" onClick={toggle} title="Notifications">
        <i className="bi bi-send-fill"></i>
        {unreadCount > 0 && <span className="notification-dot"></span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <div className="notification-title">
              <i className="bi bi-bell-fill"></i>
              Notifications
              {notifications.length > 0 && (
                <span className="notification-count">{notifications.length}</span>
              )}
            </div>
            {notifications.length > 0 && (
              <button type="button" className="notification-clear" onClick={clear}>
                <i className="bi bi-trash3"></i>
                Clear
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <i className="bi bi-inbox"></i>
                <p>No notifications yet</p>
                <small>You'll see updates here</small>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notification-item ${n.type}`}>
                  <div className={`notification-icon ${n.type}`}>
                    <i className={`bi ${iconFor(n.type)}`}></i>
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}