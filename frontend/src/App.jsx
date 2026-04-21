// src/App.jsx — Complete routing: WeVisa Landing + Admin + Agent Portal
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

import useAuthStore from '@/store/authStore'
import useWeVisaStore from '@/store/wevisaStore'
import { initSocket } from '@/services/socket'

// ─── WeVisa Landing Page (public) ─
import WeVisaLandingPage from '@/components/pages/WeVisaLandingPage'

// ─── Admin Panel (VisaAI Pro — dark theme) ──
import DashboardLayout     from '@/components/layout/DashboardLayout'
import LoginPage           from '@/components/pages/LoginPage'
import DashboardPage       from '@/components/pages/DashboardPage'
import LeadsPage           from '@/components/pages/LeadsPage'
import ContactsPage        from '@/components/pages/ContactsPage'
import DealsPage           from '@/components/pages/DealsPage'
import CalendarPage        from '@/components/pages/CalendarPage'
import ChatbotPage         from '@/components/pages/ChatbotPage'
import VoicePage           from '@/components/pages/VoicePage'
import OCRPage             from '@/components/pages/OCRPage'
import AIAssistantPage     from '@/components/pages/AIAssistantPage'
import KnowledgePage       from '@/components/pages/KnowledgePage'
import AnalyticsPage       from '@/components/pages/AnalyticsPage'
import SettingsPage        from '@/components/pages/SettingsPage'
import CRMPage             from '@/components/pages/CRMPage'
import WeVisaManagePage    from '@/components/pages/WeVisaManagePage'

// ─── WeVisa Agent Portal ─
import WeVisaAuthPage           from '@/components/wevisa/WeVisaAuthPage'
import WeVisaLayout             from '@/components/wevisa/WeVisaLayout'
import WeVisaDashboardPage      from '@/components/wevisa/WeVisaDashboardPage'
import WeVisaCRMPage            from '@/components/wevisa/WeVisaCRMPage'
import WeVisaApplyPage          from '@/components/wevisa/WeVisaApplyPage'
import WeVisaDummyTicketsPage   from '@/components/wevisa/WeVisaDummyTicketsPage'
import WeVisaUSAAppointmentPage from '@/components/wevisa/WeVisaUSAAppointmentPage'
import WeVisaSchengenPage       from '@/components/wevisa/WeVisaSchengenPage'
import WeVisaInvoicePage        from '@/components/wevisa/WeVisaInvoicePage'
import WeVisaProfilePage        from '@/components/wevisa/WeVisaProfilePage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false } },
})

// ── Route Guards ──
const AdminRoute = ({ children }) => {
  const ok = useAuthStore(s => s.isAuthenticated)
  return ok ? children : <Navigate to="/admin" replace />
}

const WeVisaRoute = ({ children }) => {
  const ok = useWeVisaStore(s => s.isAuthenticated)
  return ok ? children : <Navigate to="/wevisa/login" replace />
}
const WeVisaPublic = ({ children }) => {
  const ok = useWeVisaStore(s => s.isAuthenticated)
  return ok ? <Navigate to="/wevisa/dashboard" replace /> : children
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

            {/* ── PUBLIC: WeVisa Landing Page ── */}
            <Route path="/" element={<WeVisaLandingPage />} />
            <Route path="/index.html" element={<WeVisaLandingPage />} />

            {/* ── ADMIN AUTH ── */}
            <Route path="/admin" element={isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />} />

            {/* ── ADMIN PANEL ── */}
            <Route path="/admin/dashboard" element={<AdminRoute><DashboardLayout /></AdminRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="deals" element={<DealsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="chatbot" element={<ChatbotPage />} />
              <Route path="voice" element={<VoicePage />} />
              <Route path="ocr" element={<OCRPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="knowledge" element={<KnowledgePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="crm" element={<CRMPage />} />
              <Route path="wevisa-manage" element={<WeVisaManagePage />} />
            </Route>

            {/* ── WEVISA PUBLIC ── */}
            <Route path="/wevisa" element={<WeVisaLandingPage />} />
            <Route path="/wevisa/login" element={<WeVisaPublic><WeVisaAuthPage /></WeVisaPublic>} />
            <Route path="/wevisa/register" element={<WeVisaPublic><WeVisaAuthPage /></WeVisaPublic>} />

            {/* ── WEVISA PROTECTED ── */}
            <Route path="/wevisa/*" element={<WeVisaRoute><WeVisaLayout /></WeVisaRoute>}>
              <Route index element={<Navigate to="/wevisa/dashboard" replace />} />
              <Route path="dashboard" element={<WeVisaDashboardPage />} />
              <Route path="crm" element={<WeVisaCRMPage />} />
              <Route path="apply" element={<WeVisaApplyPage />} />
              <Route path="dummy-tickets" element={<WeVisaDummyTicketsPage />} />
              <Route path="usa-appointment" element={<WeVisaUSAAppointmentPage />} />
              <Route path="schengen" element={<WeVisaSchengenPage />} />
              <Route path="invoice" element={<WeVisaInvoicePage />} />
              <Route path="profile" element={<WeVisaProfilePage />} />
            </Route>

            {/* ── LEGACY: Redirect old paths ── */}
            <Route path="/login" element={<Navigate to="/admin" replace />} />
            <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

            {/* ── CATCH-ALL ── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AnimatePresence>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: { background: '#0f1117', color: '#f0f0f2', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', fontSize: '13px' },
          success: { iconTheme: { primary: '#34d399', secondary: '#0a0b0f' } },
          error:   { iconTheme: { primary: '#e8372a', secondary: '#0a0b0f' } },
        }}
      />
    </QueryClientProvider>
  )
}