import api from './axiosConfig.js'

// ---------- Dashboard ----------
export const getDashboardStats = () => api.get('/api/admin/dashboard')

// ---------- Doctors ----------
export const getDoctors = () => api.get('/api/doctors')
export const getDoctorById = (id) => api.get(`/api/doctors/${id}`)
export const createDoctor = (doctor) => api.post('/api/doctors', doctor)
export const updateDoctor = (id, doctor) => api.put(`/api/doctors/${id}`, doctor)
export const deleteDoctor = (id) => api.delete(`/api/doctors/${id}`)

// ---------- Patients ----------
export const getPatients = () => api.get('/api/patients')
export const getPatientById = (id) => api.get(`/api/patients/${id}`)
export const createPatient = (patient) => api.post('/api/patients', patient)
export const updatePatient = (id, patient) => api.put(`/api/patients/${id}`, patient)
export const deletePatient = (id) => api.delete(`/api/patients/${id}`)

// ---------- Appointments ----------
export const getAppointments = () => api.get('/api/appointments')
export const updateAppointmentStatus = (id, status) =>
  api.patch(`/api/appointments/${id}/status`, { status })