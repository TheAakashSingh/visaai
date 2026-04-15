// src/components/wevisa/WeVisaLayout.jsx
import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import useWeVisaStore from '@/store/wevisaStore'
import { wevisaAuthAPI } from '@/services/wevisaApi'

const NAV = [
  { path: '/wevisa/dashboard', label: 'Dashboard', icon: '⊞', color: 'from-blue-600 to-blue-700' },
  { path: '/wevisa/crm', label: 'CRM', icon: '📋', color: 'from-blue-600 to-blue-700' },
  { path: '/wevisa/apply', label: 'Apply for Visa', icon: '📝', color: 'from-green-500 to-green-600' },
  { path: '/wevisa/dummy-tickets', label: 'Dummy Tickets', icon: '🎫', color: 'from-pink-500 to-pink-600' },
  { path: '/wevisa/usa-appointment', label: 'USA Early Appointment', icon: '📅', color: 'from-purple-600 to-purple-700' },
  { path: '/wevisa/schengen', label: 'Schengen Appointments', icon: '🗓️', color: 'from-blue-500 to-blue-600' },
  { path: '/wevisa/invoice', label: 'Invoice Generator', icon: '🧾', color: 'from-teal-500 to-teal-600' },
]

export default function WeVisaLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { agent, logout } = useWeVisaStore()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    try { await wevisaAuthAPI.logout() } catch {}
    logout()
    toast.success('Logged out successfully')
    navigate('/wevisa/login')
  }

  const currentPage = NAV.find(n => location.pathname.startsWith(n.path))

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-extrabold text-sm shadow">W</div>
            <div>
              <div className="font-extrabold text-lg leading-none text-blue-900">We<span className="text-orange-500">Visa</span></div>
              <div className="text-[9px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">Agent Portal</div>
            </div>
          </div>

          {/* Agent info */}
          <div className="mx-3 mt-3 mb-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {agent?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AG'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-800 truncate">{agent?.name || 'Agent'}</div>
                <div className="text-[10px] text-blue-600 font-semibold truncate">{agent?.agencyName || 'WeVisa Tours'}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {NAV.map(item => {
              const isActive = location.pathname.startsWith(item.path)
              return (
                <Link key={item.path} to={item.path}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <span className="text-base w-5 text-center">{item.icon}</span>
                    <span className="flex-1 leading-tight">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Bottom profile */}
          <div className="p-3 border-t border-gray-100">
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-all text-left">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {agent?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AG'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-800 truncate">{agent?.name || 'Agent'}</div>
                  <div className="text-[10px] text-gray-400 truncate">{agent?.email || ''}</div>
                </div>
                <span className="text-gray-400 text-xs">⚙</span>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
                    <Link to="/wevisa/profile" onClick={() => setProfileOpen(false)}>
                      <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 cursor-pointer">👤 My Profile</div>
                    </Link>
                    <div className="border-t border-gray-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 cursor-pointer">
                      🚪 Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 ml-60 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-6 py-3.5 flex items-center justify-between">
            <div>
              <h1 className="font-extrabold text-lg text-gray-800">{currentPage?.label || 'Dashboard'}</h1>
              <p className="text-xs text-gray-400">WeVisa Agent Portal</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Active Agent
              </div>
              <Link to="/wevisa/profile">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
                  {agent?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AG'}
                </div>
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
