import api from './axiosConfig.js'

// ---------- Doctor profile ----------
export const getMyDoctorProfile = () => api.get('/api/doctors/me')

// ---------- Appointments ----------
export const getMyAppointments = (doctorId) =>
  api.get(`/api/appointments/doctor/${doctorId}`)
export const updateAppointmentStatus = (id, status) =>
  api.patch(`/api/appointments/${id}/status`, { status })

// ---------- Medical Records ----------
export const createMedicalRecord = (appointmentId, record) =>
  api.post(`/api/medical-records?appointmentId=${appointmentId}`, record)
export const getMedicalRecordsByPatient = (patientId) =>
  api.get(`/api/medical-records/patient/${patientId}`)

// ---------- Prescriptions ----------
export const createPrescription = (appointmentId, prescription) =>
  api.post(`/api/prescriptions?appointmentId=${appointmentId}`, prescription)
export const getPrescriptionsByPatient = (patientId) =>
  api.get(`/api/prescriptions/patient/${patientId}`)

// ---------- Emergency Cases (broadcast to all doctors) ----------
export const getEmergencyCases = () => api.get('/api/emergency/cases')