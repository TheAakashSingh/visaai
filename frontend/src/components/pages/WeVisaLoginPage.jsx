// src/components/pages/WeVisaLoginPage.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

export default function WeVisaLoginPage() {
  const [tab, setTab] = useState('email')
  const [form, setForm] = useState({ email: 'das@gmail.com', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleDevMode = () => {
    navigate('/wevisa-dashboard')
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/wevisa-dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Dev Mode Banner */}
      <div className="bg-yellow-500 text-white text-center py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
        <span>🚧</span>
        <span>Development Mode: Authentication Temporarily Disabled</span>
        <span>🚧</span>
      </div>

      <div className="flex min-h-[calc(100vh-44px)]">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col justify-center px-16 py-12 bg-white">
          <div className="mb-10">
            <div className="font-extrabold text-2xl text-blue-900 mb-8">We<span className="text-blue-600">Visa</span> <span className="text-sm text-gray-400 font-normal">Logo</span></div>
            <h2 className="text-3xl font-extrabold text-blue-900 mb-2">Travel Agent & Agency Portal</h2>
            <p className="text-gray-500">Exclusively for travel professionals to manage visa services</p>
          </div>
          <div className="space-y-6">
            {[
              { icon: '📋', title: 'Visa Processing', desc: 'Fast and reliable visa services' },
              { icon: '📋', title: 'Custom Flyer Design Tool', desc: 'Promote your brand easily' },
              { icon: '📋', title: 'CRM & Business Tools', desc: 'Manage clients efficiently' },
              { icon: '📋', title: 'Invoice Generator', desc: 'Professional invoicing system' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg">{item.icon}</div>
                <div>
                  <div className="font-semibold text-gray-800">{item.title}</div>
                  <div className="text-sm text-gray-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-extrabold text-gray-800 mb-1">Agent Login</h3>
              <p className="text-sm text-gray-500 mb-6">Access your travel agency dashboard (Agents & Agencies Only)</p>

              {/* Dev Mode Alert */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="font-semibold text-yellow-700 text-sm mb-1">
                  Development Mode Active: <span className="text-yellow-600 font-normal">Skip login and access dashboard directly</span>
                </div>
                <button
                  onClick={handleDevMode}
                  className="w-full mt-2 py-3 rounded-xl bg-yellow-500 text-white font-bold text-sm hover:bg-yellow-600 transition-all"
                >
                  Enter Agent Dashboard (Dev Mode)
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR USE REGULAR LOGIN</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {['email', 'phone'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all border ${tab === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-transparent hover:border-gray-300'}`}
                  >
                    {t === 'email' ? 'Email Login' : 'Phone Login'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {tab === 'email' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-blue-50/30 transition-colors"
                        placeholder="das@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Don't have an account?{' '}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Become a Partner Agent</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
