// src/App.jsx — Complete routing for VisaAI Pro + WeVisa Platform
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

import useAuthStore from '@/store/authStore'
import useWeVisaStore from '@/store/wevisaStore'
import { initSocket } from '@/services/socket'

// ─── VisaAI Pro ──────────────────────────────────────────────
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoginPage       from '@/components/pages/LoginPage'
import DashboardPage   from '@/components/pages/DashboardPage'
import LeadsPage       from '@/components/pages/LeadsPage'
import ChatbotPage     from '@/components/pages/ChatbotPage'
import VoicePage       from '@/components/pages/VoicePage'
import OCRPage         from '@/components/pages/OCRPage'
import AIAssistantPage from '@/components/pages/AIAssistantPage'
import KnowledgePage   from '@/components/pages/KnowledgePage'
import AnalyticsPage   from '@/components/pages/AnalyticsPage'
import SettingsPage    from '@/components/pages/SettingsPage'
import CRMPage         from '@/components/pages/CRMPage'

// ─── WeVisa Platform ─────────────────────────────────────────
import WeVisaLandingPage      from '@/components/wevisa/WeVisaLandingPage'
import WeVisaAuthPage         from '@/components/wevisa/WeVisaAuthPage'
import WeVisaLayout           from '@/components/wevisa/WeVisaLayout'
import WeVisaDashboardPage    from '@/components/wevisa/WeVisaDashboardPage'
import WeVisaCRMPage          from '@/components/wevisa/WeVisaCRMPage'
import WeVisaApplyPage        from '@/components/wevisa/WeVisaApplyPage'
import WeVisaDummyTicketsPage from '@/components/wevisa/WeVisaDummyTicketsPage'
import WeVisaUSAAppointmentPage from '@/components/wevisa/WeVisaUSAAppointmentPage'
import WeVisaSchengenPage     from '@/components/wevisa/WeVisaSchengenPage'
import WeVisaInvoicePage      from '@/components/wevisa/WeVisaInvoicePage'
import WeVisaProfilePage      from '@/components/wevisa/WeVisaProfilePage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false } },
})

// Guards
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
const WeVisaProtectedRoute = ({ children }) => {
  const isAuthenticated = useWeVisaStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/wevisa/login" replace />
}
const WeVisaPublicRoute = ({ children }) => {
  const isAuthenticated = useWeVisaStore(s => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/wevisa/dashboard" replace /> : children
}

export default function App() {
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user?._id) initSocket(user._id)
  }, [isAuthenticated, user])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>

            {/* ── VisaAI Pro ── */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index           element={<DashboardPage />} />
              <Route path="leads"    element={<LeadsPage />} />
              <Route path="chatbot"  element={<ChatbotPage />} />
              <Route path="voice"    element={<VoicePage />} />
              <Route path="ocr"      element={<OCRPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="knowledge"    element={<KnowledgePage />} />
              <Route path="analytics"    element={<AnalyticsPage />} />
              <Route path="settings"     element={<SettingsPage />} />
              <Route path="crm"          element={<CRMPage />} />
            </Route>

            {/* ── WeVisa Public ── */}
            <Route path="/wevisa" element={<WeVisaLandingPage />} />
            <Route path="/wevisa/login"    element={<WeVisaPublicRoute><WeVisaAuthPage /></WeVisaPublicRoute>} />
            <Route path="/wevisa/register" element={<WeVisaPublicRoute><WeVisaAuthPage /></WeVisaPublicRoute>} />

            {/* ── WeVisa Protected ── */}
            <Route path="/wevisa/*" element={<WeVisaProtectedRoute><WeVisaLayout /></WeVisaProtectedRoute>}>
              <Route index element={<Navigate to="/wevisa/dashboard" replace />} />
              <Route path="dashboard"       element={<WeVisaDashboardPage />} />
              <Route path="crm"             element={<WeVisaCRMPage />} />
              <Route path="apply"           element={<WeVisaApplyPage />} />
              <Route path="dummy-tickets"   element={<WeVisaDummyTicketsPage />} />
              <Route path="usa-appointment" element={<WeVisaUSAAppointmentPage />} />
              <Route path="schengen"        element={<WeVisaSchengenPage />} />
              <Route path="invoice"         element={<WeVisaInvoicePage />} />
              <Route path="profile"         element={<WeVisaProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f1117',
            color: '#f0f0f2',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#0a0b0f' } },
          error:   { iconTheme: { primary: '#e8372a', secondary: '#0a0b0f' } },
        }}
      />
    </QueryClientProvider>
  )
}
