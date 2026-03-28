// src/components/pages/AnalyticsPage.jsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { analyticsAPI } from '@/services/api'
import { MetricCard, PageHeader, ProgressBar, SkeletonCard } from '@/components/ui'

const COLORS = ['#e8372a', '#60a5fa', '#f5c842', '#34d399', '#a78bfa', '#fb923c']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg2 border border-[rgba(255,255,255,0.12)] rounded-xl p-3 text-xs shadow-2xl min-w-[120px]">
      <div className="text-[var(--text3)] font-mono mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-0.5" style={{ color: p.color }}>
          <span className="flex items-center gap-1"><span>●</span> {p.name}</span>
          <span className="font-bold font-mono">{typeof p.value === 'number' && p.value > 1000 ? `₹${(p.value/1000).toFixed(1)}K` : p.value}</span>
        </div>
      ))}
    </div>
  )
}

const MONTHLY_REVENUE = [
  { month: 'Oct', revenue: 120000, leads: 89 },
  { month: 'Nov', revenue: 180000, leads: 112 },
  { month: 'Dec', revenue: 150000, leads: 98 },
  { month: 'Jan', revenue: 220000, leads: 143 },
  { month: 'Feb', revenue: 280000, leads: 187 },
  { month: 'Mar', revenue: 420000, leads: 247 },
]

const WEEKLY_TREND = [
  { day: 'Mon', inquiries: 42, converted: 14, revenue: 24000 },
  { day: 'Tue', inquiries: 68, converted: 22, revenue: 38000 },
  { day: 'Wed', inquiries: 55, converted: 18, revenue: 31000 },
  { day: 'Thu', inquiries: 89, converted: 31, revenue: 54000 },
  { day: 'Fri', inquiries: 73, converted: 26, revenue: 46000 },
  { day: 'Sat', inquiries: 48, converted: 15, revenue: 27000 },
  { day: 'Sun', inquiries: 36, converted: 11, revenue: 19000 },
]

const VISA_DIST = [
  { name: 'Student', value: 89, color: '#e8372a' },
  { name: 'Work', value: 64, color: '#60a5fa' },
  { name: 'Tourist', value: 54, color: '#f5c842' },
  { name: 'Business', value: 40, color: '#34d399' },
]

const CHANNEL_DIST = [
  { name: 'WhatsApp', value: 142, color: '#25D366' },
  { name: 'Voice', value: 67, color: '#60a5fa' },
  { name: 'Direct', value: 38, color: '#f5c842' },
]

export default function AnalyticsPage() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsAPI.getDashboard().then(r => r.data.data),
    refetchInterval: 60000,
  })

  const metrics = dashData?.metrics || {}

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Reports" subtitle="Data-driven insights to optimize your consultancy performance." />

      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {isLoading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <MetricCard label="Conversion Rate" value={`${metrics.conversionRate ?? 36}%`} change="↑ 4% this month" icon="📈" delay={0.05} />
            <MetricCard label="Avg. Close Time" value="8.2d" change="↓ 1.3 days faster" icon="⚡" accent="green" delay={0.1} />
            <MetricCard label="Revenue / Lead" value="₹1,700" change="↑ ₹230 vs last month" icon="💰" accent="gold" delay={0.15} />
            <MetricCard label="NPS Score" value="72" change="↑ 8 points" icon="⭐" accent="blue" delay={0.2} />
          </>
        )}
      </div>

      {/* Revenue + Weekly */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">📈 Monthly Revenue (₹)</div><div className="card-sub">Last 6 months</div></div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={MONTHLY_REVENUE}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8372a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e8372a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'JetBrains Mono' }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#e8372a" strokeWidth={2} fill="url(#revGrad)" name="Revenue ₹" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div><div className="card-title">📊 Weekly Performance</div><div className="card-sub">Inquiries vs Conversions</div></div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={WEEKLY_TREND} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'JetBrains Mono' }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="inquiries" fill="#e8372a" radius={[3, 3, 0, 0]} name="Inquiries" />
                <Bar dataKey="converted" fill="#34d399" radius={[3, 3, 0, 0]} name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distributions + Goals */}
      <div className="grid grid-cols-3 gap-4">
        {/* Visa Distribution Pie */}
        <div className="card">
          <div className="card-header"><div className="card-title">🥧 Visa Type Split</div></div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={VISA_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                  {VISA_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {VISA_DIST.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-[var(--text2)] flex-1">{item.name}</span>
                  <span className="text-xs font-bold font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Pie */}
        <div className="card">
          <div className="card-header"><div className="card-title">📱 Channel Split</div></div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={CHANNEL_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                  {CHANNEL_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {CHANNEL_DIST.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-[var(--text2)] flex-1">{item.name}</span>
                  <span className="text-xs font-bold font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="card">
          <div className="card-header"><div className="card-title">🎯 Goal Progress</div></div>
          <div className="p-5">
            <ProgressBar label="Monthly Lead Target (300)" value={247} max={300} color="var(--red)" />
            <ProgressBar label="Revenue Target (₹5L)" value={4.2} max={5} color="var(--gold)" />
            <ProgressBar label="Visa Approvals (100)" value={89} max={100} color="var(--green)" />
            <ProgressBar label="Customer Satisfaction" value={92} max={100} color="#a78bfa" />
            <ProgressBar label="CRM Sync Rate" value={100} max={100} color="var(--blue)" />
          </div>
        </div>
      </div>

      {/* Lead Trend Line */}
      <div className="card">
        <div className="card-header">
          <div><div className="card-title">📉 Lead Trend — Last 7 Days</div><div className="card-sub">Daily inquiries and conversions</div></div>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={WEEKLY_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'JetBrains Mono' }} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="inquiries" stroke="#e8372a" strokeWidth={2.5} dot={{ fill: '#e8372a', r: 4 }} name="Inquiries" />
              <Line type="monotone" dataKey="converted" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 4 }} name="Converted" />
              <Line type="monotone" dataKey="revenue" stroke="#f5c842" strokeWidth={2} dot={false} name="Revenue ₹" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-2">
            {[['#e8372a','Inquiries'],['#34d399','Converted'],['#f5c842','Revenue ₹']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5"><span className="w-3 h-0.5" style={{ background: c, display: 'inline-block' }} /><span className="text-xs text-[var(--text3)]">{l}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
