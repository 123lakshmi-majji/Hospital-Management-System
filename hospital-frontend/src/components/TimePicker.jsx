import { useState, useEffect } from 'react'

/**
 * Custom AM/PM time picker with internal partial-selection state.
 *
 * value: "HH:MM" (24-hour) or "" (empty)
 * onChange: (value24) => void
 */
export default function TimePicker({ value, onChange }) {
  // Internal state for the three parts
  const [hour12, setHour12] = useState('')
  const [minute, setMinute] = useState('')
  const [meridiem, setMeridiem] = useState('AM')

  // Sync from parent when value changes externally
  useEffect(() => {
    if (!value || !value.includes(':')) {
      setHour12('')
      setMinute('')
      setMeridiem('AM')
      return
    }
    const [hStr, mStr] = value.split(':')
    let h = parseInt(hStr, 10)
    let mer = 'AM'
    if (h >= 12) mer = 'PM'
    if (h === 0) h = 12
    else if (h > 12) h = h - 12

    setHour12(String(h))
    setMinute(mStr)
    setMeridiem(mer)
  }, [value])

  // Whenever any part changes, try to build the full 24-hour value
  const build = (h, m, mer) => {
    if (!h || m === '' || !mer) return '' // not complete yet
    let hours = parseInt(h, 10)
    if (isNaN(hours)) return ''

    if (mer === 'AM') {
      if (hours === 12) hours = 0
    } else {
      if (hours !== 12) hours = hours + 12
    }
    const hh = String(hours).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    return `${hh}:${mm}`
  }

  const handleHourChange = (e) => {
    const v = e.target.value
    setHour12(v)
    onChange(build(v, minute, meridiem))
  }

  const handleMinuteChange = (e) => {
    const v = e.target.value
    setMinute(v)
    onChange(build(hour12, v, meridiem))
  }

  const handleMeridiemChange = (mer) => {
    setMeridiem(mer)
    onChange(build(hour12, minute, mer))
  }

  const hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

  return (
    <div className="time-picker-wrap">
      <div className="time-picker-row">
        {/* Hour dropdown */}
        <select
          className="time-picker-select"
          value={hour12}
          onChange={handleHourChange}
        >
          <option value="">HH</option>
          {hours.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <span className="time-picker-sep">:</span>

        {/* Minute dropdown */}
        <select
          className="time-picker-select"
          value={minute}
          onChange={handleMinuteChange}
        >
          <option value="">MM</option>
          {minutes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* AM / PM toggle */}
        <div className="meridiem-toggle">
          <button
            type="button"
            className={`meridiem-btn ${meridiem === 'AM' ? 'active' : ''}`}
            onClick={() => handleMeridiemChange('AM')}
          >
            AM
          </button>
          <button
            type="button"
            className={`meridiem-btn ${meridiem === 'PM' ? 'active' : ''}`}
            onClick={() => handleMeridiemChange('PM')}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  )
}