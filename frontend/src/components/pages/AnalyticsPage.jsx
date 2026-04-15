// src/components/pages/AnalyticsPage.jsx
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { analyticsAPI, leadsAPI } from '@/services/api'
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

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30)
  
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsAPI.getDashboard().then(r => r.data.data),
    refetchInterval: 60000,
  })

  const { data: leadTrend } = useQuery({
    queryKey: ['lead-trend', timeRange],
    queryFn: () => analyticsAPI.getLeadTrend(timeRange).then(r => r.data.data),
    refetchInterval: 60000,
  })

  const { data: leadStats } = useQuery({
    queryKey: ['lead-stats'],
    queryFn: () => leadsAPI.getStats().then(r => r.data.data),
    refetchInterval: 30000,
  })

  const metrics = dashData?.metrics || {}
  const charts = dashData?.charts || {}
  
  const visaDistribution = (charts.visaTypeBreakdown || []).map((v, i) => ({
    name: v._id || 'Other',
    value: v.count,
    color: COLORS[i % COLORS.length],
  }))
  
  const channelDistribution = (charts.channelBreakdown || []).map((c, i) => ({
    name: c._id || 'Unknown',
    value: c.count,
    color: c._id === 'whatsapp' ? '#25D366' : c._id === 'voice' ? '#60a5fa' : COLORS[i % COLORS.length],
  }))

  const weeklyTrend = (leadTrend || []).map(d => ({
    day: d._id?.slice(5) || 'N/A',
    inquiries: d.total || 0,
    converted: d.converted || 0,
  }))

  const monthlyRevenue = (charts.revenueData || []).map(r => ({
    month: r._id?.slice(5) || 'N/A',
    revenue: r.revenue || 0,
    leads: r.count || 0,
  }))

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics & Reports" 
        subtitle="Data-driven insights to optimize your consultancy performance."
        action={
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <button 
                key={d} 
                onClick={() => setTimeRange(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${timeRange === d ? 'bg-[var(--red)] text-white' : 'bg-bg3 text-[var(--text2)] hover:text-white'}`}
              >
                {d}D
              </button>
            ))}
          </div>
        }
      />

      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {dashLoading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <MetricCard label="Total Leads" value={metrics.totalLeads ?? 0} change={`${metrics.newToday ?? 0} new today`} icon="👥" delay={0.05} />
            <MetricCard label="Conversion Rate" value={`${metrics.conversionRate ?? 0}%`} change="Approved leads" icon="📈" accent="green" delay={0.1} />
            <MetricCard label="Revenue" value={`₹${((charts.revenueData || []).reduce((s, r) => s + (r.revenue || 0), 0) / 100000).toFixed(1)}L`} change="This period" icon="💰" accent="gold" delay={0.15} />
            <MetricCard label="AI Response" value={`${metrics.aiResponseRate ?? 0}%`} change="Automation rate" icon="🤖" accent="blue" delay={0.2} />
          </>
        )}
      </div>

      {/* Revenue + Weekly */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">📈 Monthly Revenue (₹)</div><div className="card-sub">Last {timeRange} days</div></div>
          </div>
          <div className="p-5">
            {monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={monthlyRevenue}>
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
            ) : (
              <div className="h-[180px] flex items-center justify-center text-[var(--text3)]">No revenue data</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div><div className="card-title">📊 Weekly Performance</div><div className="card-sub">Inquiries vs Conversions</div></div>
          </div>
          <div className="p-5">
            {weeklyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyTrend} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'JetBrains Mono' }} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="inquiries" fill="#e8372a" radius={[3, 3, 0, 0]} name="Inquiries" />
                  <Bar dataKey="converted" fill="#34d399" radius={[3, 3, 0, 0]} name="Converted" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-[var(--text3)]">No trend data</div>
            )}
          </div>
        </div>
      </div>

      {/* Distributions + Goals */}
      <div className="grid grid-cols-3 gap-4">
        {/* Visa Distribution Pie */}
        <div className="card">
          <div className="card-header"><div className="card-title">🥧 Visa Type Split</div></div>
          <div className="p-5">
            {visaDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={visaDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                      {visaDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {visaDistribution.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-xs text-[var(--text2)] flex-1">{item.name}</span>
                      <span className="text-xs font-bold font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--text3)]">No visa data</div>
            )}
          </div>
        </div>

        {/* Channel Pie */}
        <div className="card">
          <div className="card-header"><div className="card-title">📱 Channel Split</div></div>
          <div className="p-5">
            {channelDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={channelDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                      {channelDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {channelDistribution.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-xs text-[var(--text2)] flex-1">{item.name}</span>
                      <span className="text-xs font-bold font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--text3)]">No channel data</div>
            )}
          </div>
        </div>

        {/* Goal Progress */}
        <div className="card">
          <div className="card-header"><div className="card-title">🎯 Goal Progress</div></div>
          <div className="p-5">
            <ProgressBar label="Total Leads" value={metrics.totalLeads ?? 0} max={300} color="var(--red)" />
            <ProgressBar label="Approved" value={metrics.approvedThisMonth ?? 0} max={100} color="var(--green)" />
            <ProgressBar label="AI Response" value={metrics.aiResponseRate ?? 0} max={100} color="var(--gold)" />
            <ProgressBar label="OCR Accuracy" value={metrics.ocrAccuracy ?? 0} max={100} color="var(--blue)" />
          </div>
        </div>
      </div>

      {/* Lead Trend Line */}
      <div className="card">
        <div className="card-header">
          <div><div className="card-title">📉 Lead Trend — Last {timeRange} Days</div><div className="card-sub">Daily inquiries and conversions</div></div>
        </div>
        <div className="p-5">
          {weeklyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'JetBrains Mono' }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="inquiries" stroke="#e8372a" strokeWidth={2.5} dot={{ fill: '#e8372a', r: 4 }} name="Inquiries" />
                <Line type="monotone" dataKey="converted" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 4 }} name="Converted" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-[var(--text3)]">No trend data available</div>
          )}
          <div className="flex items-center gap-5 mt-2">
            {[['#e8372a','Inquiries'],['#34d399','Converted']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5"><span className="w-3 h-0.5" style={{ background: c, display: 'inline-block' }} /><span className="text-xs text-[var(--text3)]">{l}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
