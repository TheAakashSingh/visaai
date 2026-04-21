// src/App.jsx — Complete routing: Admin Panel (dark) + WeVisa Agent Portal (light)
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

import useAuthStore from '@/store/authStore'
import useWeVisaStore from '@/store/wevisaStore'
import { initSocket } from '@/services/socket'

// ─── Admin Panel (VisaAI Pro — dark theme, company/admin use) ─
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
import WeVisaManagePage    from '@/components/pages/WeVisaManagePage'  // ← WeVisa management inside admin

// ─── WeVisa B2B Agent Portal (light theme, agent use at /wevisa) ─
import WeVisaLandingPage        from '@/components/wevisa/WeVisaLandingPage'
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

// ── Route Guards ──────────────────────────────────────────────
// Admin panel guard — uses VisaAI Pro auth (admin@company.com login)
const AdminRoute = ({ children }) => {
  const ok = useAuthStore(s => s.isAuthenticated)
  return ok ? children : <Navigate to="/login" replace />
}

// WeVisa agent portal guard — uses separate WeVisa agent auth
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

            {/* ══════ ADMIN PANEL ══════
                - Login at /login  (company admin, dark theme)
                - Dashboard at /   (VisaAI Pro SaaS panel)
                - Includes WeVisa platform management at /wevisa-manage
            */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/" element={<AdminRoute><DashboardLayout /></AdminRoute>}>
              <Route index                  element={<DashboardPage />} />
              <Route path="leads"           element={<LeadsPage />} />
              <Route path="contacts"        element={<ContactsPage />} />
              <Route path="deals"           element={<DealsPage />} />
              <Route path="calendar"        element={<CalendarPage />} />
              <Route path="chatbot"         element={<ChatbotPage />} />
              <Route path="voice"           element={<VoicePage />} />
              <Route path="ocr"             element={<OCRPage />} />
              <Route path="ai-assistant"    element={<AIAssistantPage />} />
              <Route path="knowledge"       element={<KnowledgePage />} />
              <Route path="analytics"       element={<AnalyticsPage />} />
              <Route path="settings"        element={<SettingsPage />} />
              <Route path="crm"             element={<CRMPage />} />
              {/* WeVisa B2B platform management (admin controls countries, packages, agents) */}
              <Route path="wevisa-manage"   element={<WeVisaManagePage />} />
            </Route>

            {/* ══════ WEVISA AGENT PORTAL ══════
                - Landing at /wevisa         (public marketing page)
                - Login at /wevisa/login     (agent login, separate from admin)
                - Register at /wevisa/register
                - Dashboard at /wevisa/dashboard  (agent's own portal)
                - All agent features: CRM, Apply, Tickets, Appointments, Invoice
            */}
            <Route path="/wevisa"          element={<WeVisaLandingPage />} />
            <Route path="/wevisa/login"    element={<WeVisaPublic><WeVisaAuthPage /></WeVisaPublic>} />
            <Route path="/wevisa/register" element={<WeVisaPublic><WeVisaAuthPage /></WeVisaPublic>} />

            {/* Protected agent routes */}
            <Route path="/wevisa/*" element={<WeVisaRoute><WeVisaLayout /></WeVisaRoute>}>
              <Route index                   element={<Navigate to="/wevisa/dashboard" replace />} />
              <Route path="dashboard"        element={<WeVisaDashboardPage />} />
              <Route path="crm"              element={<WeVisaCRMPage />} />
              <Route path="apply"            element={<WeVisaApplyPage />} />
              <Route path="dummy-tickets"    element={<WeVisaDummyTicketsPage />} />
              <Route path="usa-appointment"  element={<WeVisaUSAAppointmentPage />} />
              <Route path="schengen"         element={<WeVisaSchengenPage />} />
              <Route path="invoice"          element={<WeVisaInvoicePage />} />
              <Route path="profile"          element={<WeVisaProfilePage />} />
            </Route>

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
