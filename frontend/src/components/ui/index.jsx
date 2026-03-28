// src/components/ui/index.jsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

// ── MetricCard ──────────────────────────────────────────────
export function MetricCard({ label, value, change, icon, accent = 'red', delay = 0, onClick }) {
  const colors = {
    red: { bar: 'var(--red)', change: '#34d399', dim: 'rgba(232,55,42,0.1)' },
    green: { bar: '#34d399', change: '#34d399', dim: 'rgba(52,211,153,0.1)' },
    gold: { bar: '#f5c842', change: '#f5c842', dim: 'rgba(245,200,66,0.1)' },
    blue: { bar: '#60a5fa', change: '#60a5fa', dim: 'rgba(96,165,250,0.1)' },
  }
  const c = colors[accent] || colors.red

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className="metric-card p-5 cursor-pointer"
      style={{ '--top-bar': c.bar }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{ background: c.bar }}
      />
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text3)]">{label}</div>
      <div
        className="font-syne font-extrabold text-[2.1rem] leading-none my-2 tracking-tight"
        style={{ color: accent !== 'red' ? c.bar : 'var(--text)' }}
      >
        {value}
      </div>
      {change && (
        <div className="text-xs font-semibold flex items-center gap-1" style={{ color: c.change }}>
          {change}
        </div>
      )}
      {icon && (
        <span className="absolute top-4 right-4 text-3xl opacity-10">{icon}</span>
      )}
    </motion.div>
  )
}

// ── StatusBadge ──────────────────────────────────────────────
const STATUS_STYLES = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  contacted: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  processing: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  documents_submitted: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  approved: 'bg-green-500/15 text-green-400 border-green-500/25',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/25',
  dormant: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  pending: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/25',
  hot: 'bg-red-500/15 text-red-400 border-red-500/25',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  low: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
}
export function StatusBadge({ status, className }) {
  return (
    <span className={clsx('status-badge border capitalize', STATUS_STYLES[status] || STATUS_STYLES.pending, className)}>
      {status?.replace('_', ' ')}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
export function Skeleton({ className }) {
  return <div className={clsx('skeleton', className)} />
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className={clsx('card w-full relative z-10 shadow-2xl', sizes[size])}
          >
            <div className="card-header">
              <h2 className="card-title text-base">{title}</h2>
              <button onClick={onClose} className="btn-ghost text-lg leading-none">×</button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── ProgressBar ───────────────────────────────────────────────
export function ProgressBar({ label, value, color = 'var(--red)', max = 100 }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="mb-3.5">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-[var(--text2)]">{label}</span>
        <span className="text-xs font-bold font-mono" style={{ color }}>{typeof value === 'number' ? `${pct}%` : value}</span>
      </div>
      <div className="h-1.5 bg-bg3 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

// ── PageHeader ─────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-syne font-extrabold text-2xl tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--text3)] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── EmptyState ─────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-3 opacity-30">{icon}</div>
      <h3 className="font-semibold text-base mb-1 text-[var(--text2)]">{title}</h3>
      <p className="text-sm text-[var(--text3)] max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── LoadingSpinner ─────────────────────────────────────────────
export function Spinner({ size = 16, color = 'var(--red)' }) {
  return (
    <div
      className="rounded-full border-2 border-t-transparent animate-spin"
      style={{ width: size, height: size, borderColor: `${color}30`, borderTopColor: color }}
    />
  )
}

// ── Toggle ─────────────────────────────────────────────────────
export function Toggle({ value, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {description && <div className="text-xs text-[var(--text3)] mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={clsx(
          'w-10 h-5 rounded-full relative transition-all duration-200 flex-shrink-0',
          value ? 'bg-[var(--red)]' : 'bg-[rgba(255,255,255,0.1)]'
        )}
      >
        <motion.div
          animate={{ left: value ? '22px' : '3px' }}
          transition={{ duration: 0.2 }}
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
          style={{ position: 'absolute' }}
        />
      </button>
    </div>
  )
}
