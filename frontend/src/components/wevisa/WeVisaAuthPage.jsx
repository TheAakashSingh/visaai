// src/components/wevisa/WeVisaAuthPage.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaAuthAPI } from '@/services/wevisaApi'
import useWeVisaStore from '@/store/wevisaStore'

const FEATURES = [
  { icon: '📋', title: 'Visa Processing',       desc: 'Fast & reliable for 100+ countries' },
  { icon: '🎨', title: 'Flyer Design Tool',      desc: 'Promote your brand easily' },
  { icon: '📊', title: 'CRM & Business Tools',   desc: 'Manage clients efficiently' },
  { icon: '🧾', title: 'Invoice Generator',      desc: 'Professional invoicing system' },
  { icon: '🎫', title: 'Dummy Tickets',          desc: 'Instant generation · ₹299' },
  { icon: '📅', title: 'Appointment Booking',    desc: 'USA & Schengen early slots' },
]

/* shared input style — always dark text on light bg */
const INPUT = 'w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-800 text-sm bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors'
const SELECT = 'w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-800 text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer'
const LABEL  = 'block text-xs font-bold text-gray-600 mb-1.5'

export default function WeVisaAuthPage() {
  const [mode,     setMode]     = useState('login')
  const [loginTab, setLoginTab] = useState('email')
  const [loading,  setLoading]  = useState(false)
  const navigate  = useNavigate()
  const { setAuth } = useWeVisaStore()

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [reg, setReg] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', agencyName: '', agencyType: 'individual', city: '', state: '',
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const { data } = await wevisaAuthAPI.login(loginForm)
      setAuth(data.data.agent, data.data.accessToken, data.data.refreshToken)
      toast.success(`Welcome back, ${data.data.agent.name}! 🎉`)
      navigate('/wevisa/dashboard')
    } catch {}
    finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (reg.password !== reg.confirmPassword) return toast.error('Passwords do not match')
    if (!reg.name || !reg.email || !reg.password || !reg.phone || !reg.agencyName) return toast.error('Please fill all required fields')
    setLoading(true)
    try {
      const { data } = await wevisaAuthAPI.register(reg)
      setAuth(data.data.agent, data.data.accessToken, data.data.refreshToken)
      toast.success(`Welcome to WeVisa, ${data.data.agent.name}! 🎉`)
      navigate('/wevisa/dashboard')
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div className="wv-root min-h-screen bg-gray-50 font-sans flex flex-col lg:flex-row">

      {/* ─ Left panel (hidden on small screens) ─ */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white flex-col justify-center px-14 py-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-x-20 -translate-y-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-orange-500/10 translate-y-10 blur-3xl" />
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
              ? 'Access your travel agency dashboard. Exclusively for travel professionals.'
              : "India's leading B2B visa platform. Grow your agency with competitive commissions."}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3 bg-white/10 rounded-2xl p-3.5 border border-white/10">
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <div>
                  <div className="font-bold text-sm">{f.title}</div>
                  <div className="text-[11px] text-blue-200 mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-6 flex-wrap">
            {[['₹500+','Per Visa'],['1000+','Partner Agents'],['100+','Countries'],['24/7','Support']].map(([v,l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-extrabold">{v}</div>
                <div className="text-xs text-blue-300">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─ Right panel ─ */}
      <div className="flex-1 lg:max-w-[480px] flex items-center justify-center px-5 sm:px-10 py-10 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-blue-700 flex items-center justify-center text-white font-extrabold text-sm">W</div>
            <span className="font-extrabold text-xl text-blue-900">We<span className="text-orange-500">Visa</span></span>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 p-1.5 bg-gray-100 rounded-2xl mb-7">
            {[['login','🔑 Agent Login'],['register','🚀 Become Partner']].map(([k,l]) => (
              <button key={k} onClick={() => setMode(k)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === k ? 'bg-white text-blue-700 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                {l}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Agent Login</h2>
                <p className="text-sm text-gray-400 mb-6">Access your travel agency dashboard</p>

                {/* Login type tabs */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[['email','📧 Email Login'],['phone','📱 Phone Login']].map(([t,l]) => (
                    <button key={t} onClick={() => setLoginTab(t)}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${loginTab === t ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {l}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={LABEL}>{loginTab === 'email' ? 'Email Address' : 'Phone Number'}</label>
                    <input
                      type={loginTab === 'email' ? 'email' : 'tel'}
                      value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      className={INPUT}
                      placeholder={loginTab === 'email' ? 'agent@youragency.com' : '+91 98765 43210'}
                      style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Password</label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      className={INPUT}
                      placeholder="••••••••"
                      style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}
                    />
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
              </motion.div>
            ) : (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Partner Registration</h2>
                <p className="text-sm text-gray-400 mb-5">Join 1000+ travel agents on WeVisa</p>

                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Full Name *</label>
                      <input value={reg.name} onChange={e => setReg({...reg, name: e.target.value})} className={INPUT} placeholder="Rajiv Sharma" style={{ color: '#1f2937', backgroundColor: '#f9fafb' }} />
                    </div>
                    <div>
                      <label className={LABEL}>Phone *</label>
                      <input value={reg.phone} onChange={e => setReg({...reg, phone: e.target.value})} className={INPUT} placeholder="+91 98765 43210" style={{ color: '#1f2937', backgroundColor: '#f9fafb' }} />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Email *</label>
                    <input type="email" value={reg.email} onChange={e => setReg({...reg, email: e.target.value})} className={INPUT} placeholder="agent@youragency.com" style={{ color: '#1f2937', backgroundColor: '#f9fafb' }} />
                  </div>
                  <div>
                    <label className={LABEL}>Agency Name *</label>
                    <input value={reg.agencyName} onChange={e => setReg({...reg, agencyName: e.target.value})} className={INPUT} placeholder="Sharma Travel Agency" style={{ color: '#1f2937', backgroundColor: '#f9fafb' }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={LABEL}>Type</label>
                      <select value={reg.agencyType} onChange={e => setReg({...reg, agencyType: e.target.value})} className={SELECT} style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}>
                        <option value="individual">Individual</option>
                        <option value="agency">Agency</option>
                        <option value="franchise">Franchise</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>City</label>
                      <input value={reg.city} onChange={e => setReg({...reg, city: e.target.value})} className={INPUT} placeholder="Mumbai" style={{ color: '#1f2937', backgroundColor: '#f9fafb' }} />
                    </div>
                    <div>
                      <label className={LABEL}>State</label>
                      <input value={reg.state} onChange={e => setReg({...reg, state: e.target.value})} className={INPUT} placeholder="MH" style={{ color: '#1f2937', backgroundColor: '#f9fafb' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Password *</label>
                      <input type="password" value={reg.password} onChange={e => setReg({...reg, password: e.target.value})} className={INPUT} placeholder="Min 6 chars" style={{ color: '#1f2937', backgroundColor: '#f9fafb' }} />
                    </div>
                    <div>
                      <label className={LABEL}>Confirm *</label>
                      <input type="password" value={reg.confirmPassword} onChange={e => setReg({...reg, confirmPassword: e.target.value})} className={INPUT} placeholder="Repeat" style={{ color: '#1f2937', backgroundColor: '#f9fafb' }} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold text-base hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 shadow-xl transition-all mt-1">
                    {loading ? 'Creating account...' : '🚀 Become a Partner Agent'}
                  </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-4">
                  Already a partner?{' '}
                  <button onClick={() => setMode('login')} className="text-blue-600 font-bold hover:underline">Sign In →</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
