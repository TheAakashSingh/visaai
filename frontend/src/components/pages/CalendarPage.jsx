// src/components/pages/CalendarPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { leadsAPI } from '@/services/api'
import { MetricCard, PageHeader, Spinner } from '@/components/ui'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const qc = useQueryClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['leads-calendar'],
    queryFn: () => leadsAPI.getAll({ limit: 200 }).then(r => r.data),
  })

  const leads = data?.data || []
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const events = leads.filter(l => l.travelDate).map(l => ({
    id: l._id,
    date: new Date(l.travelDate),
    title: l.name,
    type: l.visaType,
    destination: l.destination,
  }))

  const getEventsForDay = (day) => {
    const date = new Date(year, month, day)
    return events.filter(e => 
      e.date.getDate() === day && 
      e.date.getMonth() === month && 
      e.date.getFullYear() === year
    )
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const totalEvents = events.length
  const thisMonthEvents = events.filter(e => e.date.getMonth() === month && e.date.getFullYear() === year).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar & Appointments"
        subtitle="Track visa deadlines, appointments, and follow-ups."
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Events" value={totalEvents} change="All time" icon="📅" delay={0.05} />
        <MetricCard label="This Month" value={thisMonthEvents} change={MONTHS[month]} icon="🗓️" accent="blue" delay={0.1} />
        <MetricCard label="Appointments" value={leads.filter(l => l.status === 'processing').length} change="In progress" icon="📋" accent="gold" delay={0.15} />
        <MetricCard label="Follow-ups" value={leads.filter(l => l.status === 'contacted').length} change="Pending" icon="⏰" accent="red" delay={0.2} />
      </div>

      {/* Calendar */}
      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.07)]">
          <button onClick={prevMonth} className="btn-ghost text-lg">◀</button>
          <h2 className="text-lg font-bold text-white">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="btn-ghost text-lg">▶</button>
        </div>

        {/* Days header */}
        <div className="grid grid-cols-7 border-b border-[rgba(255,255,255,0.07)]">
          {DAYS.map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold uppercase tracking-widest text-[var(--text3)]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {Array(firstDay).fill(0).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-[rgba(255,255,255,0.05)] bg-bg3/30" />
          ))}
          {Array(daysInMonth).fill(0).map((_, i) => {
            const day = i + 1
            const dayEvents = getEventsForDay(day)
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                className={`min-h-[100px] border-b border-r border-[rgba(255,255,255,0.05)] p-2 hover:bg-white/[0.02] transition-colors cursor-pointer ${isToday ? 'bg-[rgba(232,55,42,0.1)]' : ''}`}
                onClick={() => setSelectedDate({ day, events: dayEvents })}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-[var(--red)]' : 'text-[var(--text2)]'}`}>{day}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(e => (
                    <div key={e.id} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 truncate">
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[9px] text-[var(--text3)]">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDate(null)}>
          <div className="card w-[500px] max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-title">{MONTHS[month]} {selectedDate.day}, {year}</div>
              <button className="btn-ghost text-lg" onClick={() => setSelectedDate(null)}>×</button>
            </div>
            <div className="p-5">
              {selectedDate.events.length === 0 ? (
                <div className="text-center py-8 text-[var(--text3)]">
                  <div className="text-4xl mb-2">📅</div>
                  <div>No events on this date</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDate.events.map(e => (
                    <div key={e.id} className="flex items-center gap-3 p-3 bg-bg3 rounded-lg border border-[rgba(255,255,255,0.07)]">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--red)] to-orange-400 flex items-center justify-center text-xs font-bold text-white">
                        {e.title.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{e.title}</div>
                        <div className="text-[10px] text-[var(--text3)] capitalize">{e.type} · {e.destination || 'N/A'}</div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 capitalize">{e.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
