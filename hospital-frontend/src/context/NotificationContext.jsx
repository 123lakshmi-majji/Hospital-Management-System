import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axiosConfig.js'
import { useAuth } from './AuthContext.jsx'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!user) {
      setNotifications([])
      return
    }

    let cancelled = false
    console.log('[notif] 🚀 Polling /api/notifications/my')

    const fetchNotifs = async () => {
      try {
        const res = await api.get('/api/notifications/my')
        if (cancelled) return
        console.log(`[notif] 📥 Received ${res.data.length} notifications`)
        setNotifications(res.data)
      } catch (err) {
        if (!cancelled) console.warn('[notif] ❌ Fetch failed', err.message)
      }
    }

    fetchNotifs()
    const id = setInterval(fetchNotifs, 4000)

    return () => {
      cancelled = true
      clearInterval(id)
      console.log('[notif] 🛑 Stopped polling')
    }
  }, [user])

  const clear = async () => {
    try {
      await api.delete('/api/notifications/my')
      setNotifications([])
      console.log('[notif] 🧹 Cleared all')
    } catch (err) {
      console.warn('[notif] Clear failed', err)
    }
  }

  const markAllRead = async () => {
    try {
      await api.post('/api/notifications/my/mark-read')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.warn('[notif] Mark-read failed', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{ notifications, clear, markAllRead, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}