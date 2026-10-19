import api from './axiosConfig.js'

// ✅ Login API
export const loginUser = (credentials) => api.post('/api/auth/login', credentials)

// ✅ Patient Registration API
export const registerPatient = (data) => api.post('/api/auth/register/patient', data)

// ✅ Staff Registration API (Doctor / Receptionist)
export const registerStaff = (data) => api.post('/api/auth/register/staff', data)