// src/services/wevisaApi.js — Complete WeVisa API Service
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const wevisaApi = axios.create({
  baseURL: `${API_BASE}/wevisa`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach WeVisa agent token
wevisaApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('wevisa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor
wevisaApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('wevisa_refresh_token')
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE}/wevisa/auth/refresh`, { refreshToken })
          localStorage.setItem('wevisa_token', data.data.accessToken)
          localStorage.setItem('wevisa_refresh_token', data.data.refreshToken)
          original.headers.Authorization = `Bearer ${data.data.accessToken}`
          return wevisaApi(original)
        }
      } catch {
        localStorage.removeItem('wevisa_token')
        localStorage.removeItem('wevisa_refresh_token')
        localStorage.removeItem('wevisa_agent')
        window.location.href = '/wevisa/login'
      }
    }
    const msg = error.response?.data?.message || error.message || 'Request failed'
    if (error.response?.status !== 401) toast.error(msg)
    return Promise.reject(error)
  }
)

export const wevisaAuthAPI = {
  register: (d) => wevisaApi.post('/auth/register', d),
  login: (d) => wevisaApi.post('/auth/login', d),
  me: () => wevisaApi.get('/auth/me'),
  updateProfile: (d) => wevisaApi.put('/auth/profile', d),
  logout: () => wevisaApi.post('/auth/logout'),
}

export const wevisaDashboardAPI = {
  getStats: () => wevisaApi.get('/dashboard/stats'),
}

export const wevisaCRMAPI = {
  getLeads: (p) => wevisaApi.get('/crm/leads', { params: p }),
  createLead: (d) => wevisaApi.post('/crm/leads', d),
  updateLead: (id, d) => wevisaApi.put(`/crm/leads/${id}`, d),
  deleteLead: (id) => wevisaApi.delete(`/crm/leads/${id}`),
  getStats: () => wevisaApi.get('/crm/stats'),
  getTasks: () => wevisaApi.get('/crm/tasks'),
  createTask: (d) => wevisaApi.post('/crm/tasks', d),
  updateTask: (id, d) => wevisaApi.put(`/crm/tasks/${id}`, d),
}

export const wevisaServicesAPI = {
  getApplications: () => wevisaApi.get('/applications'),
  createApplication: (d) => wevisaApi.post('/applications', d),
  getUSAAppointments: () => wevisaApi.get('/usa-appointments'),
  createUSAAppointment: (d) => wevisaApi.post('/usa-appointments', d),
  getSchengenAppointments: () => wevisaApi.get('/schengen-appointments'),
  createSchengenAppointment: (d) => wevisaApi.post('/schengen-appointments', d),
  getDummyTickets: () => wevisaApi.get('/dummy-tickets'),
  generateDummyTicket: (d) => wevisaApi.post('/dummy-tickets', d),
  getPackages: (country) => wevisaApi.get('/packages', { params: { country } }),
}

export const wevisaInvoiceAPI = {
  getInvoices: (p) => wevisaApi.get('/invoices', { params: p }),
  createInvoice: (d) => wevisaApi.post('/invoices', d),
  updateInvoice: (id, d) => wevisaApi.put(`/invoices/${id}`, d),
  deleteInvoice: (id) => wevisaApi.delete(`/invoices/${id}`),
  getStats: () => wevisaApi.get('/invoices/stats'),
}

export default wevisaApi
