// src/components/wevisa/WeVisaAuthPage.jsx — Login + Register
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaAuthAPI } from '@/services/wevisaApi'
import useWeVisaStore from '@/store/wevisaStore'

const FEATURES = [
  { icon: '📋', title: 'Visa Processing', desc: 'Fast and reliable visa services for 100+ countries' },
  { icon: '🎨', title: 'Custom Flyer Design', desc: 'Promote your brand with professional marketing tools' },
  { icon: '📊', title: 'CRM & Business Tools', desc: 'Manage clients, leads and deals efficiently' },
  { icon: '🧾', title: 'Invoice Generator', desc: 'Professional GST-compliant invoicing system' },
  { icon: '🎫', title: 'Dummy Tickets', desc: 'Generate dummy flight tickets instantly' },
  { icon: '📅', title: 'Appointment Booking', desc: 'USA & Schengen early appointment services' },
]

export default function WeVisaAuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loginTab, setLoginTab] = useState('email')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useWeVisaStore()

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', agencyName: '', agencyType: 'individual', city: '', state: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const { data } = await wevisaAuthAPI.login(loginForm)
      setAuth(data.data.agent, data.data.accessToken, data.data.refreshToken)
      toast.success(`Welcome back, ${data.data.agent.name}! 🎉`)
      navigate('/wevisa/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(msg)
    }
    finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (registerForm.password !== registerForm.confirmPassword) return toast.error('Passwords do not match')
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.phone || !registerForm.agencyName) return toast.error('Please fill all required fields')
    setLoading(true)
    try {
      const { data } = await wevisaAuthAPI.register(registerForm)
      setAuth(data.data.agent, data.data.accessToken, data.data.refreshToken)
      toast.success(`Welcome to WeVisa, ${data.data.agent.name}! 🎉`)
      navigate('/wevisa/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
    }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Left panel */}
      <div className="flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white flex flex-col justify-center px-14 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-x-8 translate-y-16" />
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-extrabold text-xl shadow">W</div>
            <div>
              <div className="font-extrabold text-2xl leading-none">We<span className="text-orange-400">Visa</span></div>
              <div className="text-[10px] text-blue-300 uppercase tracking-widest">B2B Agent Portal</div>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight mb-3">
            {mode === 'login' ? 'Welcome Back!' : 'Become a Partner Agent'}
          </h1>
          <p className="text-blue-200 text-base mb-10">
            {mode === 'login'
              ? 'Access your travel agency dashboard exclusively for travel professionals.'
              : "India's leading B2B visa platform. Grow your agency with competitive commissions."}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3 bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm border border-white/10">
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <div>
                  <div className="font-bold text-sm">{f.title}</div>
                  <div className="text-[11px] text-blue-200 mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-6">
            <div className="text-center"><div className="text-2xl font-extrabold">₹500+</div><div className="text-xs text-blue-300">Per Visa</div></div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-extrabold">1000+</div><div className="text-xs text-blue-300">Partner Agents</div></div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-extrabold">100+</div><div className="text-xs text-blue-300">Countries</div></div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-extrabold">24/7</div><div className="text-xs text-blue-300">Support</div></div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-[480px] flex items-center justify-center px-10 py-10 bg-white">
        <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
          {/* Toggle */}
          <div className="flex gap-1 p-1.5 bg-gray-100 rounded-2xl mb-8">
            {[{ key: 'login', label: '🔑 Agent Login' }, { key: 'register', label: '🚀 Become a Partner' }].map(m => (
              <button key={m.key} onClick={() => setMode(m.key)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m.key ? 'bg-white text-blue-700 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'login' ? (
            <>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Agent Login</h2>
              <p className="text-sm text-gray-400 mb-6">Access your travel agency dashboard</p>

              {/* Login tabs */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {['email', 'phone'].map(t => (
                  <button key={t} onClick={() => setLoginTab(t)}
                    className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${loginTab === t ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {t === 'email' ? '📧 Email Login' : '📱 Phone Login'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">{loginTab === 'email' ? 'Email Address' : 'Phone Number'}</label>
                  <input type={loginTab === 'email' ? 'email' : 'tel'}
                    value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50 transition-colors"
                    placeholder={loginTab === 'email' ? 'agent@youragency.com' : '+91 98765 43210'} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Password</label>
                  <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50 transition-colors" placeholder="••••••••" />
                </div>
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-blue-600 font-semibold hover:underline">Forgot password?</button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-extrabold text-base hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-xl transition-all">
                  {loading ? 'Signing in...' : '→ Sign In to Dashboard'}
                </button>
              </form>

              <div className="mt-5 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                <p className="text-xs text-gray-500">New to WeVisa?{' '}
                  <button onClick={() => setMode('register')} className="text-blue-600 font-bold hover:underline">Become a Partner Agent →</button>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Partner Registration</h2>
              <p className="text-sm text-gray-400 mb-6">Join 1000+ travel agents on WeVisa platform</p>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Full Name *</label>
                    <input value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50" placeholder="Rajiv Sharma" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Phone *</label>
                    <input value={registerForm.phone} onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Email *</label>
                  <input type="email" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50" placeholder="agent@youragency.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Agency Name *</label>
                  <input value={registerForm.agencyName} onChange={e => setRegisterForm({ ...registerForm, agencyName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50" placeholder="Sharma Travel Agency" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Type</label>
                    <select value={registerForm.agencyType} onChange={e => setRegisterForm({ ...registerForm, agencyType: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50">
                      <option value="individual">Individual</option><option value="agency">Agency</option><option value="franchise">Franchise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">City</label>
                    <input value={registerForm.city} onChange={e => setRegisterForm({ ...registerForm, city: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">State</label>
                    <input value={registerForm.state} onChange={e => setRegisterForm({ ...registerForm, state: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50" placeholder="Maharashtra" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Password *</label>
                    <input type="password" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50" placeholder="Min 6 characters" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Confirm Password *</label>
                    <input type="password" value={registerForm.confirmPassword} onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-gray-50" placeholder="Repeat password" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold text-base hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 shadow-xl transition-all mt-2">
                  {loading ? 'Creating account...' : '🚀 Become a Partner Agent'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Already a partner?{' '}
                <button onClick={() => setMode('login')} className="text-blue-600 font-bold hover:underline">Sign In →</button>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
