// src/components/wevisa/WeVisaDashboardPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import useWeVisaStore from '@/store/wevisaStore'
import { wevisaDashboardAPI } from '@/services/wevisaApi'

const QUICK = [
  {path:'/wevisa/crm',          icon:'📋', label:'CRM',                 desc:'Manage leads & contacts',      grad:'from-blue-500 to-blue-700',    bg:'bg-blue-50'},
  {path:'/wevisa/apply',        icon:'📝', label:'Apply for Visa',       desc:'Submit visa applications',     grad:'from-green-500 to-green-700',  bg:'bg-green-50'},
  {path:'/wevisa/dummy-tickets',icon:'🎫', label:'Dummy Tickets',        desc:'Generate flight itineraries',  grad:'from-pink-500 to-pink-700',    bg:'bg-pink-50'},
  {path:'/wevisa/usa-appointment',icon:'📅',label:'USA Appointment',     desc:'Book early US visa slots',     grad:'from-purple-500 to-purple-700',bg:'bg-purple-50'},
  {path:'/wevisa/schengen',     icon:'🗓️', label:'Schengen',             desc:'European visa appointments',   grad:'from-indigo-500 to-indigo-700',bg:'bg-indigo-50'},
  {path:'/wevisa/invoice',      icon:'🧾', label:'Invoice Generator',    desc:'Create professional invoices', grad:'from-teal-500 to-teal-700',    bg:'bg-teal-50'},
]

export default function WeVisaDashboardPage() {
  const {agent} = useWeVisaStore()
  const {data,isLoading} = useQuery({
    queryKey:['wv-dashboard-stats'],
    queryFn:()=>wevisaDashboardAPI.getStats().then(r=>r.data.data),
    refetchInterval:30000,
  })

  const STATS = [
    {icon:'🧾',label:'Invoices Generated',   val:data?.invoicesGenerated??0,   c:'text-blue-600',  bg:'bg-blue-50'},
    {icon:'🎫',label:'Dummy Tickets',         val:data?.dummyTickets??0,        c:'text-pink-600',  bg:'bg-pink-50'},
    {icon:'✈️',label:'USA Appointments',      val:data?.usaAppointments??0,     c:'text-purple-600',bg:'bg-purple-50'},
    {icon:'🗓️',label:'Schengen Appointments', val:data?.schengenAppointments??0,c:'text-indigo-600',bg:'bg-indigo-50'},
    {icon:'👥',label:'CRM Leads',             val:data?.crmLeads??0,            c:'text-green-600', bg:'bg-green-50'},
    {icon:'💰',label:'Total Earnings',        val:data?.totalEarnings?`₹${(data.totalEarnings/1000).toFixed(1)}K`:'₹0',c:'text-orange-600',bg:'bg-orange-50'},
  ]

  return (
    <div className="p-4 lg:p-6">
      {/* Welcome banner */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
        className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 rounded-3xl p-6 sm:p-8 mb-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 opacity-10 flex items-center justify-center text-[80px] sm:text-[120px]">✈️</div>
        <div className="relative z-10">
          <div className="text-sm font-semibold text-blue-200 mb-1">Welcome back 👋</div>
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-2">{agent?.name||'Agent'}!</h1>
          <p className="text-blue-100 text-sm sm:text-base mb-6">Ready to grow your business with WeVisa? Here's your overview.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/wevisa/apply">
              <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all shadow">📝 Apply for Visa</button>
            </Link>
            <Link to="/wevisa/crm">
              <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-900/50 text-white font-bold text-sm hover:bg-blue-900/70 transition-all border border-blue-500/30">👥 View CRM</button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {STATS.map((s,i)=>(
          <motion.div key={s.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${s.bg} flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>{s.icon}</div>
            <div>
              <div className={`text-xl sm:text-2xl font-extrabold ${s.c}`}>{isLoading?'...':s.val}</div>
              <div className="text-[10px] sm:text-xs text-gray-400 font-medium leading-tight">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick access */}
      <h2 className="font-extrabold text-gray-800 text-lg mb-4">🚀 Quick Access</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {QUICK.map((q,i)=>(
          <Link key={q.path} to={q.path}>
            <motion.div initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} transition={{delay:i*.05}}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all cursor-pointer group">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${q.grad} flex items-center justify-center text-white text-lg sm:text-xl mb-3 sm:mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                {q.icon}
              </div>
              <div className="font-bold text-gray-800 text-sm sm:text-base mb-0.5">{q.label}</div>
              <div className="text-xs text-gray-400 hidden sm:block">{q.desc}</div>
              <div className="text-xs text-blue-600 font-semibold mt-2 group-hover:underline">Open →</div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-5">
          <div className="font-bold text-gray-800 mb-1 flex items-center gap-2">💡 Quick Tip</div>
          <p className="text-sm text-gray-600">Generate dummy tickets instantly for visa applications. Each ticket is valid for 30 days and costs just ₹299.</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
          <div className="font-bold text-gray-800 mb-1 flex items-center gap-2">⚡ Express Visas</div>
          <p className="text-sm text-gray-600">Dubai eVisa in 4 hours, Vietnam in 2 hours! High commission + fast processing = happy clients.</p>
        </div>
      </div>
    </div>
  )
}
