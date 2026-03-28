// src/App.jsx
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

import useAuthStore from '@/store/authStore'
import { initSocket } from '@/services/socket'
import DashboardLayout from '@/components/layout/DashboardLayout'

import CRMPage from '@/components/pages/CRMPage'

// Pages
import LoginPage from '@/components/pages/LoginPage'
import DashboardPage from '@/components/pages/DashboardPage'
import LeadsPage from '@/components/pages/LeadsPage'
import ChatbotPage from '@/components/pages/ChatbotPage'
import VoicePage from '@/components/pages/VoicePage'
import OCRPage from '@/components/pages/OCRPage'
import AIAssistantPage from '@/components/pages/AIAssistantPage'
import KnowledgePage from '@/components/pages/KnowledgePage'
import AnalyticsPage from '@/components/pages/AnalyticsPage'
import SettingsPage from '@/components/pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false },
  },
})

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      initSocket(user._id)
    }
  }, [isAuthenticated, user])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route
              path="/"
              element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
            >
              <Route index element={<DashboardPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="chatbot" element={<ChatbotPage />} />
              <Route path="voice" element={<VoicePage />} />
              <Route path="ocr" element={<OCRPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="knowledge" element={<KnowledgePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="crm" element={<CRMPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: { background: '#0f1117', color: '#f0f0f2', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' },
          success: { iconTheme: { primary: '#34d399', secondary: '#0a0b0f' } },
          error: { iconTheme: { primary: '#e8372a', secondary: '#0a0b0f' } },
        }}
      />
    </QueryClientProvider>
  )
}