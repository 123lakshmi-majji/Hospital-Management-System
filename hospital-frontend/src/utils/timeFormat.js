/**
 * Convert a 24-hour time string (e.g. "10:30", "10:30:00") to 12-hour format
 * with AM/PM.
 */
export function formatTime12(timeStr) {
  if (!timeStr) return '—'
  const parts = String(timeStr).split(':')
  if (parts.length < 2) return timeStr

  let hours = parseInt(parts[0], 10)
  const minutes = parts[1]
  if (isNaN(hours)) return timeStr

  const meridiem = hours >= 12 ? 'PM' : 'AM'
  if (hours === 0) hours = 12
  else if (hours > 12) hours = hours - 12

  const hh = String(hours).padStart(2, '0')
  return `${hh}:${minutes} ${meridiem}`
}

export function getMeridiem(timeStr) {
  if (!timeStr) return ''
  const parts = String(timeStr).split(':')
  const hours = parseInt(parts[0], 10)
  if (isNaN(hours)) return ''
  return hours >= 12 ? 'PM' : 'AM'
}

/**
 * Returns a human-friendly countdown to an appointment.
 *
 * @param {string} dateStr  "2026-10-15"
 * @param {string} timeStr  "10:30:00" (24-hour)
 * @returns {object}  { label, variant, diffMs }
 *   label   — "In 2h 15m", "In 3 days", "Started", "Missed" etc.
 *   variant — "urgent" | "soon" | "upcoming" | "past" | "started"
 */
export function timeUntilAppointment(dateStr, timeStr) {
  if (!dateStr || !timeStr) {
    return { label: '—', variant: 'past', diffMs: 0 }
  }

  // Build a JS Date from "YYYY-MM-DD" + "HH:MM:SS"
  const parts = String(timeStr).split(':')
  const hh = parts[0] || '00'
  const mm = parts[1] || '00'
  const ss = parts[2] || '00'

  const apptDate = new Date(`${dateStr}T${hh}:${mm}:${ss}`)

  if (isNaN(apptDate.getTime())) {
    return { label: '—', variant: 'past', diffMs: 0 }
  }

  const now = new Date()
  const diffMs = apptDate.getTime() - now.getTime()

  // ────── PAST ──────
  if (diffMs < 0) {
    const pastMs = -diffMs
    const pastMinutes = Math.floor(pastMs / 60000)

    // If within the last 60 minutes → appointment already started
    if (pastMinutes < 60) {
      return {
        label: 'Started now',
        variant: 'started',
        diffMs,
      }
    }

    // Otherwise, missed/completed
    return {
      label: 'Past',
      variant: 'past',
      diffMs,
    }
  }

  // ────── UPCOMING ──────
  const totalMinutes = Math.floor(diffMs / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  let label = ''
  let variant = 'upcoming'

  if (days >= 1) {
    label = `In ${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours}h` : ''}`
    variant = days === 1 ? 'soon' : 'upcoming'
  } else if (hours >= 1) {
    label = `In ${hours}h ${minutes}m`
    variant = hours < 6 ? 'soon' : 'upcoming'
  } else {
    label = `In ${minutes} min`
    variant = 'urgent'
  }

  return { label, variant, diffMs }
}