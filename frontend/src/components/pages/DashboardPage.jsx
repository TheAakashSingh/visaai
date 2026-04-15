// src/components/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Link } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import useUIStore from '@/store/uiStore'
import { analyticsAPI, leadsAPI } from '@/services/api'
import { MetricCard, SkeletonCard, ProgressBar, PageHeader } from '@/components/ui'
import { getSocket } from '@/services/socket'

const COLORS = ['#e8372a', '#60a5fa', '#f5c842', '#34d399', '#a78bfa']

const DOT_COLORS = { whatsapp: '#25D366', voice: '#60a5fa', doc: '#f5c842', crm: '#e8372a', system: '#a78bfa' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg2 border border-[rgba(255,255,255,0.12)] rounded-lg p-3 text-xs shadow-xl">
      <div className="text-[var(--text3)] mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5" style={{ color: p.color }}>
          <span>●</span> {p.name}: <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { liveActivity, addActivity } = useUIStore()
  const [timeRange, setTimeRange] = useState(7)

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsAPI.getDashboard().then(r => r.data.data),
    refetchInterval: 30000,
  })

  const { data: leadTrend, isLoading: trendLoading } = useQuery({
    queryKey: ['lead-trend', timeRange],
    queryFn: () => analyticsAPI.getLeadTrend(timeRange).then(r => r.data.data),
    refetchInterval: 30000,
  })

  const { data: leadStats } = useQuery({
    queryKey: ['lead-stats'],
    queryFn: () => leadsAPI.getStats().then(r => r.data.data),
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (liveActivity.length === 0) {
      const items = [
        { type: 'whatsapp', title: 'New inquiry — Amit Kumar', detail: 'Student visa Canada · +91 98xxx xxxx' },
        { type: 'doc', title: 'Passport OCR processed — Riya Patel', detail: 'DOB: 15-Aug-1998 · Exp: 22-Mar-2030' },
        { type: 'voice', title: 'Inbound call — Suresh Gupta', detail: 'Schengen visa inquiry · 3:42 min' },
        { type: 'crm', title: 'Lead converted — Neha Singh', detail: 'UK work permit · Moved to Processing' },
        { type: 'whatsapp', title: 'Follow-up sent — Rajesh Verma', detail: 'Document reminder via WhatsApp' },
      ]
      items.forEach((item, i) => setTimeout(() => addActivity(item), i * 300))
    }
  }, [])

  const metrics = dashData?.metrics || {}
  const charts = dashData?.charts || {}

  const weeklyData = (leadTrend || []).map(d => ({
    day: d._id?.slice(5) || 'N/A',
    inquiries: d.total || 0,
    converted: d.converted || 0,
  }))

  const visaDistribution = (charts.visaTypeBreakdown || []).map((v, i) => ({
    name: v._id || 'Other',
    value: v.count,
    color: COLORS[i % COLORS.length],
  }))

  const channelData = (charts.channelBreakdown || []).map((c, i) => ({
    name: c._id || 'Unknown',
    value: c.count,
  }))

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'Admin'} 👋`}
        subtitle="Here's what's happening with your visa consultancy today."
        action={
          <div className="flex gap-2">
            {[7, 14, 30].map(d => (
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

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        {dashLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard label="Total Leads" value={metrics.totalLeads ?? 0} change={`${metrics.newToday ?? 0} new today`} icon="👥" delay={0.05} />
            <MetricCard label="Approved Visas" value={metrics.approvedThisMonth ?? 0} change="This month" icon="✅" accent="green" delay={0.1} />
            <MetricCard label="Today's Calls" value={metrics.todayCalls ?? 0} change="Inbound + Outbound" icon="📞" accent="gold" delay={0.15} />
            <MetricCard label="AI Response Rate" value={`${metrics.aiResponseRate ?? 0}%`} change="Automation" icon="🤖" accent="blue" delay={0.2} />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Weekly inquiries */}
        <div className="card col-span-2">
          <div className="card-header">
            <div><div className="card-title">Weekly Inquiry Volume</div><div className="card-sub">Last {timeRange} days</div></div>
            <Link to="/analytics" className="text-xs text-[var(--red2)] font-semibold hover:underline">View All →</Link>
          </div>
          <div className="p-5">
            {trendLoading ? (
              <div className="h-[160px] skeleton rounded-lg" />
            ) : weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyData} barGap={3}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text3)', fontFamily: 'JetBrains Mono' }} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="inquiries" fill="#e8372a" radius={[4,4,0,0]} name="Inquiries" />
                  <Bar dataKey="converted" fill="#34d399" radius={[4,4,0,0]} name="Converted" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-[var(--text3)]">No data available</div>
            )}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[var(--red)]" /><span className="text-xs text-[var(--text3)]">Inquiries</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[var(--green)]" /><span className="text-xs text-[var(--text3)]">Converted</span></div>
            </div>
          </div>
        </div>

        {/* Visa distribution */}
        <div className="card">
          <div className="card-header"><div className="card-title">Visa Distribution</div></div>
          <div className="p-5 flex items-center gap-4">
            {visaDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie data={visaDistribution} cx={50} cy={50} innerRadius={32} outerRadius={50} paddingAngle={2} dataKey="value">
                      {visaDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {visaDistribution.slice(0, 4).map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-xs text-[var(--text2)] flex-1">{item.name}</span>
                      <span className="text-xs font-bold font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--text3)]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Activity + Performance */}
      <div className="grid grid-cols-3 gap-4">
        {/* Live Activity */}
        <div className="card col-span-2">
          <div className="card-header">
            <div><div className="card-title">Live Activity Feed</div><div className="card-sub">Real-time interactions across all channels</div></div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
            </div>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {liveActivity.slice(0, 7).map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: DOT_COLORS[item.type] || '#fff' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{item.title}</div>
                  <div className="text-[11px] text-[var(--text3)] mt-0.5 truncate">{item.detail}</div>
                </div>
                <div className="text-[10px] text-[var(--text3)] font-mono whitespace-nowrap">
                  {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                </div>
              </motion.div>
            ))}
            {liveActivity.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[var(--text3)]">Waiting for activity...</div>
            )}
          </div>
        </div>

        {/* Channel Performance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Channel Performance</div>
            <div className="text-[10px] text-[var(--text3)]">Auto-updated</div>
          </div>
          <div className="p-5">
            <ProgressBar label="WhatsApp Bot" value={metrics.aiResponseRate ?? 96} color="var(--green)" />
            <ProgressBar label="Voice Bot" value={84} color="var(--blue)" />
            <ProgressBar label="OCR Accuracy" value={metrics.ocrAccuracy ?? 99} color="var(--gold)" />
            <ProgressBar label="CRM Sync" value={100} color="var(--red)" />
            <ProgressBar label="Satisfaction" value={92} color="#a78bfa" />
          </div>
        </div>
      </div>
    </div>
  )
}
