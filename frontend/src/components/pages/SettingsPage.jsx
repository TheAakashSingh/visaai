// src/components/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { settingsAPI } from '@/services/api'
import { PageHeader, Toggle, Spinner } from '@/components/ui'

const TABS = ['General', 'WhatsApp', 'Voice', 'CRM', 'AI', 'Notifications']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General')
  const [settings, setSettings] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.get().then(r => r.data.data),
  })

  useEffect(() => { if (data) setSettings(data) }, [data])

  const saveMut = useMutation({
    mutationFn: (d) => settingsAPI.update(d),
    onSuccess: () => toast.success('Settings saved successfully! ✅'),
  })

  const set = (path, value) => {
    setSettings(prev => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...(obj[keys[i]] || {}) }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const save = () => { if (settings) saveMut.mutate(settings) }

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" subtitle="Configure your AI system and integrations." />
        <div className="flex items-center justify-center py-20"><Spinner size={32} /></div>
      </div>
    )
  }

  const S = settings

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your AI system, integrations, and preferences." />

      <div className="grid grid-cols-4 gap-4">
        {/* Sidebar tabs */}
        <div className="card p-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-0.5 ${
                activeTab === tab
                  ? 'bg-[rgba(232,55,42,0.15)] text-[var(--red2)] border border-[rgba(232,55,42,0.2)]'
                  : 'text-[var(--text2)] hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab === 'General' && '⚙️ '}
              {tab === 'WhatsApp' && '💬 '}
              {tab === 'Voice' && '📞 '}
              {tab === 'CRM' && '🔗 '}
              {tab === 'AI' && '🤖 '}
              {tab === 'Notifications' && '🔔 '}
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card col-span-3">
          {/* General */}
          {activeTab === 'General' && (
            <div>
              <div className="card-header"><div className="card-title">⚙️ General Settings</div></div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Company Name</label>
                    <input className="input w-full" value={S.company?.name || ''} onChange={e => set('company.name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Contact Email</label>
                    <input className="input w-full" type="email" value={S.company?.email || ''} onChange={e => set('company.email', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input className="input w-full" value={S.company?.phone || ''} onChange={e => set('company.phone', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">City</label>
                    <input className="input w-full" placeholder="Delhi, India" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Business Address</label>
                  <input className="input w-full" value={S.company?.address || ''} onChange={e => set('company.address', e.target.value)} placeholder="Connaught Place, New Delhi — 110001" />
                </div>
                <button className="btn-primary" onClick={save} disabled={saveMut.isPending}>
                  {saveMut.isPending ? <Spinner size={14} color="#fff" /> : '💾 Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp */}
          {activeTab === 'WhatsApp' && (
            <div>
              <div className="card-header"><div className="card-title">💬 WhatsApp Configuration</div></div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">WhatsApp Business Phone ID</label>
                  <input className="input w-full font-mono" value={S.whatsapp?.phoneId || ''} onChange={e => set('whatsapp.phoneId', e.target.value)} placeholder="123456789012345" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Meta Access Token</label>
                  <input className="input w-full font-mono" type="password" placeholder="EAAxxxxx..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Webhook Verify Token</label>
                  <input className="input w-full font-mono" placeholder="your_custom_verify_token" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Default Language</label>
                  <select className="input w-full" value={S.whatsapp?.defaultLanguage || 'auto'} onChange={e => set('whatsapp.defaultLanguage', e.target.value)}>
                    <option value="auto">Auto-detect (English + Hindi)</option>
                    <option value="en">English Only</option>
                    <option value="hi">Hindi Only</option>
                  </select>
                </div>
                <div className="p-4 bg-bg3 rounded-xl border border-[rgba(255,255,255,0.07)]">
                  <div className="text-xs font-semibold mb-2 text-[var(--text2)]">Webhook URL (add to Meta Developer Console)</div>
                  <div className="font-mono text-xs text-[var(--red2)] break-all">
                    {window.location.origin.replace('5173', '3001')}/webhooks/whatsapp
                  </div>
                </div>
                <button className="btn-primary" onClick={save} disabled={saveMut.isPending}>
                  {saveMut.isPending ? <Spinner size={14} color="#fff" /> : '💾 Save & Restart Bot'}
                </button>
              </div>
            </div>
          )}

          {/* Voice */}
          {activeTab === 'Voice' && (
            <div>
              <div className="card-header"><div className="card-title">📞 Voice Bot Configuration</div></div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Twilio Account SID</label>
                    <input className="input w-full font-mono" type="password" placeholder="ACxxxxxxxxxxxxxxxx" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Twilio Auth Token</label>
                    <input className="input w-full font-mono" type="password" placeholder="••••••••••••••••" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Twilio Phone Number</label>
                    <input className="input w-full font-mono" value={S.voice?.twilioNumber || ''} onChange={e => set('voice.twilioNumber', e.target.value)} placeholder="+1xxxxxxxxxx" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Bot Name</label>
                    <input className="input w-full" value={S.voice?.botName || 'Priya'} onChange={e => set('voice.botName', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">TwiML App Callback URL</label>
                  <div className="p-3 bg-bg3 rounded-lg border border-[rgba(255,255,255,0.07)] font-mono text-xs text-[var(--red2)]">
                    {window.location.origin.replace('5173', '3001')}/webhooks/voice/inbound
                  </div>
                </div>
                <button className="btn-primary" onClick={save} disabled={saveMut.isPending}>
                  {saveMut.isPending ? <Spinner size={14} color="#fff" /> : '💾 Save Voice Config'}
                </button>
              </div>
            </div>
          )}

          {/* CRM */}
          {activeTab === 'CRM' && (
            <div>
              <div className="card-header"><div className="card-title">🔗 CRM Integration</div></div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">CRM Platform</label>
                  <select className="input w-full" value={S.crm?.provider || 'none'} onChange={e => set('crm.provider', e.target.value)}>
                    <option value="none">None</option>
                    <option value="zoho">Zoho CRM</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="custom">Custom API</option>
                  </select>
                </div>
                {S.crm?.provider !== 'none' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">API Endpoint</label>
                      <input className="input w-full font-mono" value={S.crm?.apiEndpoint || ''} onChange={e => set('crm.apiEndpoint', e.target.value)} placeholder="https://www.zohoapis.in/crm/v3" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">API Key / Client ID</label>
                      <input className="input w-full font-mono" type="password" placeholder="••••••••••••••••" />
                    </div>
                  </>
                )}
                <button className="btn-primary" onClick={save} disabled={saveMut.isPending}>
                  {saveMut.isPending ? <Spinner size={14} color="#fff" /> : '🔗 Test & Save Connection'}
                </button>
              </div>
            </div>
          )}

          {/* AI */}
          {activeTab === 'AI' && (
            <div>
              <div className="card-header"><div className="card-title">🤖 AI Configuration</div></div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">AI Model</label>
                  <select className="input w-full" value={S.ai?.model || 'gpt-4-turbo-preview'} onChange={e => set('ai.model', e.target.value)}>
                    <option value="gpt-4-turbo-preview">GPT-4 Turbo (Recommended)</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                  </select>
                </div>
                <Toggle label="Hindi Language Support" description="Enable bilingual AI responses (EN + HI)" value={S.ai?.hindiEnabled ?? true} onChange={v => set('ai.hindiEnabled', v)} />
                <Toggle label="Auto Lead Scoring" description="AI automatically scores new leads" value={S.ai?.autoScore ?? true} onChange={v => set('ai.autoScore', v)} />
                <button className="btn-primary" onClick={save} disabled={saveMut.isPending}>
                  {saveMut.isPending ? <Spinner size={14} color="#fff" /> : '💾 Save AI Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'Notifications' && (
            <div>
              <div className="card-header"><div className="card-title">🔔 Notification Preferences</div></div>
              <Toggle label="New Lead Alert" description="Get notified when a new lead is created" value={S.notifications?.newLead ?? true} onChange={v => set('notifications.newLead', v)} />
              <Toggle label="Document Received" description="Alert when a document is shared" value={S.notifications?.documentReceived ?? true} onChange={v => set('notifications.documentReceived', v)} />
              <Toggle label="Call Completed" description="Notification after each AI call" value={S.notifications?.callCompleted ?? true} onChange={v => set('notifications.callCompleted', v)} />
              <Toggle label="Email Notifications" description="Receive daily summary emails" value={S.notifications?.email ?? true} onChange={v => set('notifications.email', v)} />
              <div className="p-4">
                <button className="btn-primary" onClick={save} disabled={saveMut.isPending}>
                  {saveMut.isPending ? <Spinner size={14} color="#fff" /> : '💾 Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <div className="card-header"><div className="card-title">🟢 System Status</div></div>
        <div className="grid grid-cols-4 divide-x divide-[rgba(255,255,255,0.07)]">
          {[
            { name: 'WhatsApp Bot', status: S.whatsapp?.enabled ? 'online' : 'offline' },
            { name: 'Voice Bot', status: S.voice?.enabled ? 'online' : 'offline' },
            { name: 'OCR Service', status: S.ocr?.enabled ? 'online' : 'degraded' },
            { name: 'AI Engine', status: 'online' },
          ].map(({ name, status }) => (
            <div key={name} className="p-5 text-center">
              <div className={`text-xl mb-1 ${status === 'online' ? '🟢' : status === 'degraded' ? '🟡' : '🔴'}`}>
                {status === 'online' ? '🟢' : status === 'degraded' ? '🟡' : '🔴'}
              </div>
              <div className="text-xs font-semibold">{name}</div>
              <div className={`text-[10px] capitalize mt-0.5 ${status === 'online' ? 'text-green-400' : status === 'degraded' ? 'text-yellow-400' : 'text-red-400'}`}>{status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
