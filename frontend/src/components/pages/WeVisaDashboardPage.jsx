// src/components/pages/WeVisaDashboardPage.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

const SIDEBAR_ITEMS = [
  { label: 'CRM', icon: '📋', path: '/wevisa-dashboard/crm', color: 'bg-blue-600' },
  { label: 'Apply for Visa', icon: '📝', path: '/wevisa-dashboard/apply', color: 'bg-green-500' },
  { label: 'Dummy Tickets', icon: '🎫', path: '/wevisa-dashboard/dummy-tickets', color: 'bg-pink-500' },
  { label: 'USA Early Appointment', icon: '📅', path: '/wevisa-dashboard/usa-appointment', color: 'bg-purple-600' },
  { label: 'Schengen Appointments', icon: '📅', path: '/wevisa-dashboard/schengen', color: 'bg-blue-500' },
  { label: 'Invoice Generator', icon: '📋', path: '/wevisa-dashboard/invoice', color: 'bg-green-600' },
]

const STATS = [
  { icon: '📋', label: 'Invoices Generated', value: '...' },
  { icon: '🎫', label: 'Dummy Tickets', value: '...' },
  { icon: '✈️', label: 'USA Appointments', value: '...' },
  { icon: '🗓️', label: 'Schengen Appointments', value: '...' },
]

export default function WeVisaDashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const isRoot = location.pathname === '/wevisa-dashboard' || location.pathname === '/wevisa-dashboard/'

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Dev Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white text-center py-2 text-xs font-semibold flex items-center justify-center gap-2">
        <span className="text-yellow-100">ⓘ</span>
        DEVELOPMENT MODE - Agent authentication disabled for testing
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-8 bottom-0 w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 font-bold">Logo</div>
          <span className="font-extrabold text-xl text-blue-900">We<span className="text-blue-600">Visa</span></span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map(item => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link key={item.path} to={item.path}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-bold ${isActive ? item.color + ' text-white shadow' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 mt-8">
        {/* Top bar - agent info */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-xl">👤</span>
            </div>
            <div>
              <div className="font-extrabold text-xl text-gray-800">John Doe</div>
              <div className="text-sm text-gray-400">agentdemo@email.com</div>
              <div className="text-sm text-blue-600 font-semibold">WeVisa Tours</div>
            </div>
          </div>
          <button className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all">
            Profile <span>▾</span>
          </button>
        </div>

        {/* Page content */}
        {isRoot ? (
          <div className="p-8">
            {/* Welcome card */}
            <div className="bg-gradient-to-br from-blue-800 to-blue-600 rounded-3xl p-10 mb-8 text-white">
              <h1 className="text-4xl font-extrabold mb-2">Welcome, Agent!</h1>
              <p className="text-blue-100 text-lg">Ready to grow your business with WeVisa?</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-5 mb-8">
              {STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl">{s.icon}</div>
                  <div>
                    <div className="text-2xl font-extrabold text-gray-700">...</div>
                    <div className="text-xs text-gray-400 font-medium">{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total Earnings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl">💲</div>
              <div>
                <div className="text-2xl font-extrabold text-gray-700">...</div>
                <div className="text-xs text-gray-400 font-medium">Total Earnings</div>
              </div>
            </div>

            {/* Quick access */}
            <div className="grid grid-cols-3 gap-5">
              {SIDEBAR_ITEMS.slice(0, 6).map((item, i) => (
                <Link key={item.path} to={item.path}>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white text-lg mb-3`}>{item.icon}</div>
                    <div className="font-bold text-gray-800">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-1">Manage →</div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  )
}
