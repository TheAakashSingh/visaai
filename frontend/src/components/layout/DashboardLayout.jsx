// src/components/layout/DashboardLayout.jsx
import React, { useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import clsx from 'clsx'

import useAuthStore from '@/store/authStore'
import useUIStore from '@/store/uiStore'
import { authAPI } from '@/services/api'
import { getSocket } from '@/services/socket'

const NAV = [
  { path: '/', label: 'Dashboard', icon: '⚡', exact: true },
  { path: '/leads', label: 'Leads', icon: '👥', badge: 'leads' },
  { path: '/crm', label: 'CRM Integration', icon: '🔗' },
  { path: '/chatbot', label: 'WhatsApp Bot', icon: '💬', badge: 'live' },
  { path: '/voice', label: 'Voice Bot', icon: '📞' },
  null, // divider
  { path: '/ocr', label: 'Document OCR', icon: '🔍' },
  { path: '/ai-assistant', label: 'AI Assistant', icon: '🤖' },
  { path: '/knowledge', label: 'Knowledge Base', icon: '📚' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
  null,
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar, addActivity } = useUIStore()
  const location = useLocation()

  // Real-time socket events
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handlers = {
      'lead:new': (lead) => {
        toast.success(`New lead: ${lead.name}`, { icon: '👤' })
        addActivity({ type: 'whatsapp', title: `New lead — ${lead.name}`, detail: `${lead.visaType} • ${lead.destination || 'N/A'}` })
      },
      'call:started': (call) => {
        addActivity({ type: 'voice', title: `Call started`, detail: `${call.type} • ${call.toNumber || call.fromNumber}` })
      },
      'ocr:complete': (doc) => {
        toast.success('Document processed!', { icon: '📄' })
        addActivity({ type: 'doc', title: 'Document OCR complete', detail: doc.originalName })
      },
      'message:new': (msg) => {
        addActivity({ type: 'whatsapp', title: 'New WhatsApp message', detail: msg.preview || 'Incoming message' })
      },
    }

    Object.entries(handlers).forEach(([evt, fn]) => socket.on(evt, fn))
    return () => { Object.entries(handlers).forEach(([evt, fn]) => socket.off(evt, fn)) }
  }, [])

  const pageTitle = NAV.filter(Boolean).find((n) =>
    n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path) && n.path !== '/'
  )?.label || 'Dashboard'

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <motion.nav
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed top-0 left-0 bottom-0 z-50 bg-bg2 border-r border-[rgba(255,255,255,0.07)] flex flex-col overflow-hidden"
        style={{ minWidth: sidebarOpen ? 260 : 0 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[rgba(255,255,255,0.07)]">
          <div className="w-9 h-9 bg-[var(--red)] rounded-xl flex items-center justify-center text-lg shadow-[0_0_20px_rgba(232,55,42,0.3)] flex-shrink-0">
            ✈
          </div>
          <div>
            <div className="font-syne font-extrabold text-base leading-none">
              Visa<span className="text-[var(--red)]">AI</span>
            </div>
            <div className="text-[10px] text-[var(--text3)] tracking-widest uppercase mt-0.5">Pro Platform</div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3">
          {NAV.map((item, i) => {
            if (!item) return <div key={i} className="mx-4 my-2 border-t border-[rgba(255,255,255,0.05)]" />
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx('nav-item', isActive && 'active')}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--red)] rounded-r" />
                )}
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge === 'live' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    Live
                  </span>
                )}
                {item.badge === 'leads' && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[var(--red)] text-white">
                    24
                  </span>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-2.5 p-3 bg-bg3 rounded-lg border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--red)] to-orange-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</div>
              <div className="text-[10px] text-[var(--text3)]">{user?.role || 'Admin'} · Pro Plan</div>
            </div>
            <button
              onClick={() => { logout(); window.location.href = '/login' }}
              className="opacity-0 group-hover:opacity-100 text-[var(--text3)] hover:text-[var(--red)] transition-all text-sm"
              title="Logout"
            >
              ⏻
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Main area */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 260 : 0 }}
      >
        {/* Header */}
        <header className="h-16 bg-bg2 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-4 px-6 sticky top-0 z-40">
          <button onClick={toggleSidebar} className="btn-ghost text-lg">
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <h1 className="font-syne font-bold text-base flex-1">
            {pageTitle}
            <span className="text-[var(--text3)] font-normal text-sm ml-2 font-dm">Overview</span>
          </h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
            All Systems Active
          </div>
          <button
            className="relative w-9 h-9 bg-bg3 border border-[rgba(255,255,255,0.07)] rounded-lg flex items-center justify-center text-base hover:border-[rgba(255,255,255,0.12)] transition-colors"
            onClick={() => toast('🔔 3 new notifications', { icon: '🔔' })}
          >
            🔔
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--red)] text-white text-[9px] font-bold flex items-center justify-center">3</span>
          </button>
          <NavLink to="/leads">
            <button className="btn-primary text-xs py-2">
              + New Lead
            </button>
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 p-7 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}