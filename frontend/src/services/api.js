// src/services/api.js — Extended with new lead fields support
import axios from 'axios'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
        useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    const message = error.response?.data?.message || error.message || 'Request failed'
    if (error.response?.status !== 401) {
      toast.error(message, { style: { background: '#0f1117', color: '#f0f0f2', border: '1px solid rgba(255,255,255,0.12)' } })
    }
    return Promise.reject(error)
  }
)

// ── AUTH ──────────────────────────────────────────────────────
export const authAPI = {
  login:   (data) => api.post('/auth/login', data),
  register:(data) => api.post('/auth/register', data),
  logout:  ()     => api.post('/auth/logout'),
  me:      ()     => api.get('/auth/me'),
  refresh: (rt)   => api.post('/auth/refresh', { refreshToken: rt }),
}

// ── LEADS — full support for service, destination, travel dates, source, numberOfTravellers ──
export const leadsAPI = {
  getAll:  (params) => api.get('/leads', { params }),
  getOne:  (id)     => api.get(`/leads/${id}`),
  create:  (data)   => api.post('/leads', data),
  update:  (id, d)  => api.put(`/leads/${id}`, d),
  delete:  (id)     => api.delete(`/leads/${id}`),
  score:   (id)     => api.post(`/leads/${id}/score`),
  getStats:()       => api.get('/leads/stats/summary'),
  // Quick actions
  sendWhatsApp: (id, msg) => api.post(`/chatbot/send`, { leadId: id, message: msg }),
  generateInvoice: (id) => api.post(`/leads/${id}/invoice`),
}

// ── CHATBOT ───────────────────────────────────────────────────
export const chatbotAPI = {
  chat:            (data)   => api.post('/chatbot/chat', data),
  send:            (data)   => api.post('/chatbot/send', data),
  getConversations:(params) => api.get('/chatbot/conversations', { params }),
  getStats:        ()       => api.get('/chatbot/stats'),
}

// ── VOICE ─────────────────────────────────────────────────────
export const voiceAPI = {
  makeCall:           (data) => api.post('/voice/call', data),
  confirmAppointment: (data) => api.post('/voice/appointment-confirm', data),
  sendStatusUpdate:   (data) => api.post('/voice/status-update', data),
  conductSurvey:      (data) => api.post('/voice/survey', data),
  reengageLead:       (data) => api.post('/voice/reengage', data),
  getLogs:            (p)    => api.get('/voice/logs', { params: p }),
  getStats:           ()     => api.get('/voice/stats'),
}

// ── OCR ───────────────────────────────────────────────────────
export const ocrAPI = {
  processDocument: (formData) => api.post('/ocr/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }),
  getDocuments: (p) => api.get('/ocr/documents', { params: p }),
  getStats:     ()  => api.get('/ocr/stats'),
}

// ── ANALYTICS ─────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: ()    => api.get('/analytics/dashboard'),
  getLeadTrend: (d)   => api.get('/analytics/leads/trend', { params: { days: d } }),
  getRevenue:   (m)   => api.get('/analytics/revenue', { params: { months: m } }),
}

// ── SETTINGS ──────────────────────────────────────────────────
export const settingsAPI = {
  get:    ()    => api.get('/settings'),
  update: (d)   => api.put('/settings', d),
}

// ── KNOWLEDGE ─────────────────────────────────────────────────
export const knowledgeAPI = {
  getAll:  (p)      => api.get('/knowledge', { params: p }),
  create:  (d)      => api.post('/knowledge', d),
  update:  (id, d)  => api.put(`/knowledge/${id}`, d),
  delete:  (id)     => api.delete(`/knowledge/${id}`),
}

// ── CRM ───────────────────────────────────────────────────────
export const crmAPI = {
  syncLead:             (leadId) => api.post(`/crm/sync/${leadId}`),
  syncAll:              ()       => api.post('/crm/sync-all'),
  testConnection:       (p)      => api.post('/crm/test', { provider: p }),
  getStats:             ()       => api.get('/crm/stats'),
  getDormantLeads:      ()       => api.get('/crm/dormant'),
  getInteractionHistory:(leadId) => api.get(`/crm/interaction-history/${leadId}`),
  applyTags:            (leadId) => api.post(`/crm/tag/${leadId}`),
}

export default api
