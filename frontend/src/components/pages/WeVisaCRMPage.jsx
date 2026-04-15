// src/components/pages/WeVisaCRMPage.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'

const TABS = ['Dashboard', 'Leads', 'Contacts', 'Deals', 'Calendar', 'Tasks', 'Travel agents', 'Integrations']

const INTEGRATIONS = [
  {
    icon: '📧',
    title: 'Gmail Integration',
    desc: 'Connect Gmail to send and receive emails directly from your CRM',
    sub: 'Manage all your email communications in one place',
    action: 'Connect',
    color: 'text-red-500',
  },
  {
    icon: '📘',
    title: 'Facebook Lead Ads Integration',
    desc: 'Connect Facebook to automatically import leads',
    sub: 'Never synced',
    action: 'Connect',
    color: 'text-blue-600',
  },
  {
    icon: '💬',
    title: 'WhatsApp Integration',
    desc: 'Connect WhatsApp to send messages directly to your leads',
    sub: "Configure your WhatsApp Business API to enable lead communication",
    action: 'Configure',
    color: 'text-green-600',
  },
]

const PIPELINE_STAGES = ['New Leads', 'Contacted', 'Documents', 'Payment', 'Applied', 'Completed']

const TASKS = [
  { text: 'Follow up with Priya about visa requirements', date: 'Apr 16', priority: 'High Priority' },
  { text: 'Send insurance quote to Rahul', date: 'Apr 16', priority: 'Medium Priority' },
  { text: "Review Adkain's application", date: 'Apr 16', priority: 'Low Priority' },
]

const ACTIVITIES = [
  { icon: '💬', text: 'Sent message to Vijay Sharma', time: '2 hours ago', color: 'bg-blue-50' },
  { icon: '📄', text: 'Received documents from Rahul Mehta', time: 'Yesterday', color: 'bg-yellow-50' },
  { icon: '📅', text: 'Meeting scheduled with Vijay Kumar', time: '...', color: 'bg-green-50' },
]

const METRICS = [
  { label: 'Total Leads', value: 0, icon: '👥', change: '5% ↑' },
  { label: 'New Leads', value: 0, icon: '👤', change: '12% ↑' },
  { label: 'Open Deals', value: 0, icon: '💲', change: '5% ↑' },
  { label: 'Deal Value', value: '$0', icon: '💲', change: '8% ↑' },
  { label: 'Meetings', value: 0, icon: '📅', change: '2% ↑' },
  { label: 'Tasks Completed', value: 0, icon: '✅', change: '15% ↑' },
]

const APRIL_DAYS = [
  [null, null, null, 1, 2, 3, 4],
  [5, 6, 7, 8, 9, 10, 11],
  [12, 13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24, 25],
  [26, 27, 28, 29, 30, null, null],
]

export default function WeVisaCRMPage() {
  const [activeTab, setActiveTab] = useState('Dashboard')

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'Dashboard' && '⊞ '}
              {tab === 'Leads' && '👥 '}
              {tab === 'Contacts' && '👤 '}
              {tab === 'Deals' && '💲 '}
              {tab === 'Calendar' && '📅 '}
              {tab === 'Tasks' && '✅ '}
              {tab === 'Travel agents' && '🏢 '}
              {tab === 'Integrations' && '🔗 '}
              {tab}
            </button>
          ))}
          <div className="ml-auto flex gap-2 py-2">
            <button className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300">⚙ WhatsApp Settings</button>
            <button className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">+ Add New Lead</button>
          </div>
        </div>
      </div>

      {activeTab === 'Dashboard' && (
        <div className="p-6">
          {/* Integrations */}
          <div className="space-y-3 mb-6">
            {INTEGRATIONS.map(int => (
              <div key={int.title} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-start gap-3">
                  <span className={`text-xl ${int.color}`}>{int.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{int.title}</div>
                    <div className="text-xs text-gray-500">{int.desc}</div>
                    <div className="text-xs text-gray-400">{int.sub}</div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-all flex items-center gap-1.5">
                  🔗 {int.action}
                </button>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            {METRICS.map((m, i) => (
              <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{m.icon}</span>
                  <span className="text-xs text-green-500 font-semibold">{m.change}</span>
                </div>
                <div className="text-2xl font-extrabold text-gray-800">{m.value}</div>
                <div className="text-xs text-gray-400 mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* Pipeline */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="font-bold text-gray-800 mb-4">Lead Pipeline</div>
              <div className="grid grid-cols-6 gap-2">
                {PIPELINE_STAGES.map(stage => (
                  <div key={stage} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                      <span className="text-xs text-gray-500">{stage}</span>
                      <span className="w-5 h-5 rounded-full border border-gray-200 text-xs flex items-center justify-center">0</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">No leads in this stage</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column: Tasks + Calendar */}
            <div className="space-y-4">
              {/* Calendar */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">◀</span>
                  <span className="text-sm font-bold text-gray-700">April 2026</span>
                  <span className="text-xs text-gray-400">▶</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-400 mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="font-semibold">{d}</div>)}
                </div>
                {APRIL_DAYS.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
                    {week.map((day, di) => (
                      <div key={di} className={`w-7 h-7 flex items-center justify-center rounded-full mx-auto ${day === 16 ? 'bg-blue-600 text-white font-bold' : day ? 'text-gray-600 hover:bg-gray-100 cursor-pointer' : 'text-gray-200'}`}>
                        {day || ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-gray-800">Upcoming Tasks</span>
                  <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {TASKS.map(task => (
                    <div key={task.text} className="flex items-start gap-2">
                      <input type="checkbox" className="mt-0.5 accent-blue-600" />
                      <div>
                        <div className="text-xs text-gray-700 font-medium">{task.text}</div>
                        <div className="text-[10px] text-gray-400">📅 {task.date} · <span className={`font-semibold ${task.priority.includes('High') ? 'text-red-400' : task.priority.includes('Medium') ? 'text-yellow-500' : 'text-green-500'}`}>{task.priority}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="font-bold text-sm text-gray-800 mb-3">Recent Activities</div>
                <div className="space-y-2">
                  {ACTIVITIES.map(a => (
                    <div key={a.text} className="flex items-start gap-2">
                      <div className={`w-7 h-7 rounded-full ${a.color} flex items-center justify-center text-sm`}>{a.icon}</div>
                      <div>
                        <div className="text-xs text-gray-700 font-medium">{a.text}</div>
                        <div className="text-[10px] text-gray-400">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Travel agents' && <WeVisaTravelAgentsTab />}
      {activeTab !== 'Dashboard' && activeTab !== 'Travel agents' && (
        <div className="p-8 text-center text-gray-400 mt-16">
          <div className="text-5xl mb-4">🚧</div>
          <div className="text-lg font-semibold">{activeTab} — Coming Soon</div>
        </div>
      )}
    </div>
  )
}

function WeVisaTravelAgentsTab() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Travel Agents Management</h2>
          <p className="text-sm text-gray-400">Manage your travel agents and their leads</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow flex items-center gap-2">
          + Add Travel agent
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5">
          <input
            className="w-72 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
            placeholder="Search agents by name, phone or company..."
          />
        </div>
        <div className="text-center py-20">
          <div className="text-gray-400 font-semibold text-lg">No agents found</div>
          <div className="text-gray-300 text-sm mt-1">No travel agents have been added yet.</div>
        </div>
      </div>
    </div>
  )
}
