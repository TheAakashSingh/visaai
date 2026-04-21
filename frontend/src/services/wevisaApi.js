// src/services/wevisaApi.js — All APIs: Agent + Admin + Public (fully dynamic)
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// ── Agent API instance ────────────────────────────────────────
const wevisaApi = axios.create({ baseURL: `${API_BASE}/wevisa`, timeout: 30000, headers: { 'Content-Type': 'application/json' } })

wevisaApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('wevisa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

wevisaApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const rt = localStorage.getItem('wevisa_refresh_token')
        if (rt) {
          const { data } = await axios.post(`${API_BASE}/wevisa/auth/refresh`, { refreshToken: rt })
          localStorage.setItem('wevisa_token', data.data.accessToken)
          localStorage.setItem('wevisa_refresh_token', data.data.refreshToken)
          original.headers.Authorization = `Bearer ${data.data.accessToken}`
          return wevisaApi(original)
        }
      } catch {
        localStorage.removeItem('wevisa_token')
        localStorage.removeItem('wevisa_refresh_token')
        window.location.href = '/wevisa/login'
      }
    }
    const msg = error.response?.data?.message || error.message || 'Request failed'
    if (error.response?.status !== 401) toast.error(msg)
    return Promise.reject(error)
  }
)

// ── Admin API instance (uses VisaAI Pro JWT — same /login session) ──
const adminApi = axios.create({ baseURL: `${API_BASE}/wevisa-admin`, timeout: 30000, headers: { 'Content-Type': 'application/json' } })

adminApi.interceptors.request.use((config) => {
  // Zustand persist stores with key 'visaai-auth'
  try {
    const raw    = localStorage.getItem('visaai-auth')
    const parsed = raw ? JSON.parse(raw) : null
    const token  = parsed?.state?.accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {}
  return config
})

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.message || error.message || 'Request failed'
    if (error.response?.status !== 401) toast.error(msg)
    return Promise.reject(error)
  }
)

// ── Public API instance (no auth, for landing page) ───────────
const publicApi = axios.create({ baseURL: `${API_BASE}/wevisa-admin/public`, timeout: 15000 })

// ══════════════════════════════════════════════════════════════
// AGENT APIs
// ══════════════════════════════════════════════════════════════
export const wevisaAuthAPI = {
  register:      (d)     => wevisaApi.post('/auth/register', d),
  login:         (d)     => wevisaApi.post('/auth/login', d),
  me:            ()      => wevisaApi.get('/auth/me'),
  updateProfile: (d)     => wevisaApi.put('/auth/profile', d),
  logout:        ()      => wevisaApi.post('/auth/logout'),
}

export const wevisaDashboardAPI = {
  getStats: () => wevisaApi.get('/dashboard/stats'),
}

export const wevisaCRMAPI = {
  getLeads:   (p)     => wevisaApi.get('/crm/leads', { params: p }),
  createLead: (d)     => wevisaApi.post('/crm/leads', d),
  updateLead: (id, d) => wevisaApi.put(`/crm/leads/${id}`, d),
  deleteLead: (id)    => wevisaApi.delete(`/crm/leads/${id}`),
  getStats:   ()      => wevisaApi.get('/crm/stats'),
  getTasks:   ()      => wevisaApi.get('/crm/tasks'),
  createTask: (d)     => wevisaApi.post('/crm/tasks', d),
  updateTask: (id, d) => wevisaApi.put(`/crm/tasks/${id}`, d),
}

export const wevisaServicesAPI = {
  getPackages:              (p) => wevisaApi.get('/packages', { params: p }),
  getApplications:          ()  => wevisaApi.get('/applications'),
  createApplication:        (d) => wevisaApi.post('/applications', d),
  getUSAAppointments:       ()  => wevisaApi.get('/usa-appointments'),
  createUSAAppointment:     (d) => wevisaApi.post('/usa-appointments', d),
  getSchengenAppointments:  ()  => wevisaApi.get('/schengen-appointments'),
  createSchengenAppointment:(d) => wevisaApi.post('/schengen-appointments', d),
  getDummyTickets:          ()  => wevisaApi.get('/dummy-tickets'),
  generateDummyTicket:      (d) => wevisaApi.post('/dummy-tickets', d),
}

export const wevisaInvoiceAPI = {
  getInvoices:   (p)      => wevisaApi.get('/invoices', { params: p }),
  createInvoice: (d)      => wevisaApi.post('/invoices', d),
  updateInvoice: (id, d)  => wevisaApi.put(`/invoices/${id}`, d),
  deleteInvoice: (id)     => wevisaApi.delete(`/invoices/${id}`),
  getStats:      ()       => wevisaApi.get('/invoices/stats'),
}

// ══════════════════════════════════════════════════════════════
// PUBLIC APIs — no auth, landing page & agent portal fetch these
// Reflects admin changes in real-time
// ══════════════════════════════════════════════════════════════
export const publicAPI = {
  getCountries:         (p) => publicApi.get('/countries', { params: p }),
  getPackages:          (p) => publicApi.get('/packages',  { params: p }),
  getUSAPricing:        ()  => publicApi.get('/usa-pricing'),
  getDummyTicketPricing:()  => publicApi.get('/dummy-ticket-pricing'),
}

// ══════════════════════════════════════════════════════════════
// ADMIN APIs — VisaAI Pro admin manages WeVisa platform
// Changes here reflect on landing page + agent portal instantly
// ══════════════════════════════════════════════════════════════
export const wevisaAdminAPI = {
  getStats: () => adminApi.get('/dashboard/stats'),

  // Countries — adds to landing page country section
  getCountries:  (p)      => adminApi.get('/countries', { params: p }),
  createCountry: (d)      => adminApi.post('/countries', d),
  updateCountry: (id, d)  => adminApi.put(`/countries/${id}`, d),
  deleteCountry: (id)     => adminApi.delete(`/countries/${id}`),

  // Packages — prices appear on landing page + agent Apply page
  getPackages:   (p)      => adminApi.get('/packages', { params: p }),
  createPackage: (d)      => adminApi.post('/packages', d),
  updatePackage: (id, d)  => adminApi.put(`/packages/${id}`, d),
  deletePackage: (id)     => adminApi.delete(`/packages/${id}`),

  // Pricing controls
  getUSAPricing:    ()    => adminApi.get('/usa-pricing'),
  updateUSAPricing: (d)   => adminApi.put('/usa-pricing', d),
  getDummyPricing:  ()    => adminApi.get('/dummy-ticket-pricing'),

  // Agent management
  getAgents:   (p)        => adminApi.get('/agents', { params: p }),
  updateAgent: (id, d)    => adminApi.put(`/agents/${id}`, d),

  // Application management
  getApplications:   (p)  => adminApi.get('/applications', { params: p }),
  updateApplication: (id, d) => adminApi.put(`/applications/${id}`, d),

  // Appointment & ticket views
  getUSAAppointments:       () => adminApi.get('/usa-appointments'),
  updateUSAAppointment: (id,d) => adminApi.put(`/usa-appointments/${id}`, d),
  getSchengenAppointments:  () => adminApi.get('/schengen-appointments'),
  getDummyTickets:          () => adminApi.get('/dummy-tickets'),

  // Document types
  getDocumentTypes:    ()      => adminApi.get('/document-types'),
  createDocumentType:  (d)     => adminApi.post('/document-types', d),
  updateDocumentType:  (id, d) => adminApi.put(`/document-types/${id}`, d),
}

export default wevisaApi
