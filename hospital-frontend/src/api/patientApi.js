import api from './axiosConfig.js'

// ---------- Patient profile ----------
export const getMyProfile = () => api.get('/api/patients/me')

// ---------- Doctors (for booking) ----------
export const getAllDoctors = () => api.get('/api/doctors')

// ---------- Appointments ----------
export const bookAppointment = (payload) => api.post('/api/appointments', payload)
export const getMyAppointments = (patientId) =>
  api.get(`/api/appointments/patient/${patientId}`)
export const updateAppointmentStatus = (id, status) =>
  api.patch(`/api/appointments/${id}/status`, { status })

// ---------- Medical Records ----------
export const getMyMedicalRecords = (patientId) =>
  api.get(`/api/medical-records/patient/${patientId}`)

// ---------- Prescriptions ----------
export const getMyPrescriptions = (patientId) =>
  api.get(`/api/prescriptions/patient/${patientId}`)

// ✅ FIXED: Added the missing '/api' at the beginning of the URL
export const getDoctorBookedSlots = (doctorId, date) => {
  return api.get(`/api/appointments/doctor/${doctorId}/booked-slots?date=${date}`)
}