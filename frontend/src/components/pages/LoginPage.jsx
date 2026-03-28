// src/components/pages/LoginPage.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '@/services/api'
import useAuthStore from '@/store/authStore'

export default function LoginPage() {
  const [form, setForm] = useState({ email: 'admin@singhjitech.com', password: 'admin123' })
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fn = mode === 'login' ? authAPI.login : authAPI.register
      const { data } = await fn(form)
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken)
      toast.success(`Welcome, ${data.data.user.name}! 🎉`)
      navigate('/')
    } catch (err) {
      // Error toast handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--red)] opacity-[0.04] blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-500 opacity-[0.03] blur-[100px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{ backgroundImage: 'linear-gradient(var(--border2) 1px, transparent 1px), linear-gradient(90deg, var(--border2) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[var(--red)] rounded-2xl text-3xl mb-4 shadow-[0_0_40px_rgba(232,55,42,0.4)]"
          >
            ✈
          </motion.div>
          <h1 className="font-syne font-extrabold text-3xl">
            Visa<span className="text-gradient">AI</span> Pro
          </h1>
          <p className="text-[var(--text3)] text-sm mt-1">Intelligent Visa Assistance Platform</p>
        </div>

        {/* Card */}
        <div className="card border-[rgba(255,255,255,0.1)] shadow-2xl">
          <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-bg3 rounded-lg mb-6">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200 capitalize
                    ${mode === m ? 'bg-[var(--red)] text-white shadow' : 'text-[var(--text2)] hover:text-white'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Company Name</label>
                  <input
                    className="input w-full"
                    placeholder="SinghJi Tech Consultancy"
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required={mode === 'register'}
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  className="input w-full"
                  type="email"
                  placeholder="admin@singhjitech.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Password</label>
                <input
                  className="input w-full"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  mode === 'login' ? '→ Sign In to Dashboard' : '→ Create Account'
                )}
              </button>
            </form>

            <div className="mt-4 p-3 bg-bg3 rounded-lg border border-[rgba(255,255,255,0.05)]">
              <p className="text-xs text-[var(--text3)] text-center">
                Demo: <span className="text-[var(--text2)] font-mono">admin@singhjitech.com</span> / <span className="text-[var(--text2)] font-mono">admin123</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text3)] mt-4">
          Powered by SinghJi Tech · AI-Powered Visa Platform
        </p>
      </motion.div>
    </div>
  )
}
