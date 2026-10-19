import api from './axiosConfig.js'

export const getAllStores = () => api.get('/api/stores')
export const getStoreById = (id) => api.get(`/api/stores/${id}`)
export const getNearbyStores = (lat, lng, radius = 50) =>
  api.get(`/api/stores/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
export const createStore = (store) => api.post('/api/stores', store)
export const updateStore = (id, store) => api.put(`/api/stores/${id}`, store)
export const deleteStore = (id) => api.delete(`/api/stores/${id}`)