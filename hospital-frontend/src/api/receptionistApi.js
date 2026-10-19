import api from './axiosConfig.js'

// ---------- Patients ----------
export const getPatients = () => api.get('/api/patients')
export const createPatient = (patient) => api.post('/api/patients', patient)
export const updatePatient = (id, patient) => api.put(`/api/patients/${id}`, patient)

// ---------- Doctors ----------
export const getDoctors = () => api.get('/api/doctors')

// ---------- Appointments ----------
export const getAppointments = () => api.get('/api/appointments')
export const bookAppointment = (payload) => api.post('/api/appointments', payload)
export const updateAppointmentStatus = (id, status) =>
  api.patch(`/api/appointments/${id}/status`, { status })

// ---------- Emergency / Medico-Legal ----------
export const registerEmergency = (payload) => api.post('/api/emergency/register', payload)
export const getEmergencyCases = () => api.get('/api/emergency/cases')

// ✅ ADDED: Fetch booked slots for a specific doctor on a specific date
export const getDoctorBookedSlots = (doctorId, date) => {
  return api.get(`/api/appointments/doctor/${doctorId}/booked-slots?date=${date}`)
}