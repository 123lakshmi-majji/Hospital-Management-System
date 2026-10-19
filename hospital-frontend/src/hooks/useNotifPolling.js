import { useEffect, useRef } from 'react'
import { useNotifications } from '../context/NotificationContext.jsx'

export function useNotifPolling({
  fetchData,
  ready = () => true,
  watchers = [],
  intervalMs = 5000,
  tag = 'notif',
}) {
  const { add } = useNotifications()
  const prevRef = useRef(null)

  // 🔧 Keep callbacks fresh — this fixes the stale closure problem
  const fetchDataRef = useRef(fetchData)
  const readyRef = useRef(ready)
  const watchersRef = useRef(watchers)
  const addRef = useRef(add)
  const intervalRef = useRef(intervalMs)

  // Update refs on EVERY render
  fetchDataRef.current = fetchData
  readyRef.current = ready
  watchersRef.current = watchers
  addRef.current = add
  intervalRef.current = intervalMs

  useEffect(() => {
    console.log(`[${tag}] 🚀 Polling hook mounted`)

    const tick = async () => {
      const isReady = readyRef.current()
      if (!isReady) {
        console.log(`[${tag}] ⏸ Not ready yet`)
        return
      }

      try {
        const curr = await fetchDataRef.current()
        console.log(`[${tag}] 📥 Poll tick`, {
          hasPrev: !!prevRef.current,
          curr,
        })

        if (prevRef.current) {
          watchersRef.current.forEach((w, i) => {
            try {
              const result = w(curr, prevRef.current)
              if (result && result.message) {
                console.log(`[${tag}] 🔔 Watcher ${i} FIRED:`, result.message)
                addRef.current(result.message, result.type || 'info')
              }
            } catch (e) {
              console.warn(`[${tag}] ⚠ Watcher ${i} error`, e)
            }
          })
        } else {
          console.log(`[${tag}] 📌 Baseline snapshot stored`)
        }
        prevRef.current = curr
      } catch (e) {
        console.warn(`[${tag}] ❌ Fetch error`, e)
      }
    }

    tick()
    const id = setInterval(tick, intervalRef.current)

    return () => {
      clearInterval(id)
      console.log(`[${tag}] 🛑 Polling hook unmounted`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}