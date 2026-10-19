import api from './axiosConfig.js'

// Patient history
export const getMyTransactions = () => api.get('/api/transactions/my')
export const payTransaction = (id, method) =>
  api.post(`/api/transactions/${id}/pay`, { method })

// Doctor history
export const getDoctorTransactions = () => api.get('/api/transactions/doctor')
export const getDoctorStats = () => api.get('/api/transactions/doctor/stats')

// Admin history
export const getAllTransactions = () => api.get('/api/transactions/admin')
export const getAdminStats = () => api.get('/api/transactions/admin/stats')