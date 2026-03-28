// src/components/pages/KnowledgePage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { knowledgeAPI } from '@/services/api'
import { PageHeader, Modal, Spinner } from '@/components/ui'

const COUNTRIES = [
  { name: 'Canada', flag: '🍁', types: 'Student · Work · PR · Visitor' },
  { name: 'Germany', flag: '🇩🇪', types: 'Work · Student · Job Seeker' },
  { name: 'United Kingdom', flag: '🇬🇧', types: 'Skilled Worker · Student · Visit' },
  { name: 'Australia', flag: '🇦🇺', types: 'Skilled · Student · Partner' },
  { name: 'United States', flag: '🇺🇸', types: 'F1 · H1B · B1/B2 · Green Card' },
  { name: 'Schengen', flag: '🇪🇺', types: 'Tourist · Business · Transit' },
  { name: 'UAE', flag: '🇦🇪', types: 'Work · Visit · Freelance' },
  { name: 'New Zealand', flag: '🇳🇿', types: 'Skilled Migrant · Student · WHV' },
  { name: 'Singapore', flag: '🇸🇬', types: 'EP · S Pass · Student · Visit' },
  { name: 'Japan', flag: '🇯🇵', types: 'Student · Work · Tourist' },
]

const DETAILS = {
  'Canada': { requirements: ['Letter of Acceptance from DLI', 'IELTS 6.0+ Academic', 'Proof of funds CAD 10,000+/year', 'Valid passport (6+ months)', 'Biometrics enrollment'], fee: 'CAD 150', processing: '8-16 weeks', successRate: '91%', tips: 'Apply early — summer intake is highly competitive. GIC (Guaranteed Investment Certificate) is recommended for financial proof.' },
  'Germany': { requirements: ['Recognized qualification/degree', 'German language B1/B2', 'Blocked account EUR 11,208', 'Job offer or Ausbildung contract', 'Health insurance'], fee: 'EUR 75', processing: '4-8 weeks', successRate: '87%', tips: 'Job Seeker Visa allows 6 months to search for work in Germany. Sehr gut option for IT professionals.' },
  'United Kingdom': { requirements: ['Certificate of Sponsorship (CoS)', 'Salary min GBP 26,200/year', 'IELTS B1 English', 'Valid passport', 'TB test if required'], fee: 'GBP 719', processing: '3-8 weeks', successRate: '90%', tips: 'Post-Brexit, EU and non-EU applicants are treated equally. Graduate visa allows 2 years post-study work.' },
  'Australia': { requirements: ['CoE from Australian institution', 'IELTS 5.5-6.0+', 'Funds AUD 21,041/year', 'OSHC health insurance', 'GTE statement'], fee: 'AUD 620', processing: '4-12 weeks', successRate: '86%', tips: 'Genuine Temporary Entrant (GTE) requirement is crucial. Strong ties to India improve success rate.' },
  'United States': { requirements: ['I-20 from SEVIS school', 'IELTS 6.5+ or TOEFL 80+', 'Funds USD 20,000+/year', 'SEVIS fee USD 350', 'Embassy interview'], fee: 'USD 160', processing: '2-8 weeks', successRate: '78%', tips: 'Embassy interview preparation is critical. Show strong ties to India (property, family, job offer after study).' },
  'Schengen': { requirements: ['Travel insurance EUR 30,000 min', 'Hotel/accommodation bookings', 'Return flight tickets', 'Bank statements 3-6 months', 'EUR 85-100/day proof'], fee: 'EUR 80', processing: '15 working days', successRate: '94%', tips: 'Apply at the embassy of your main destination. Rejection from one Schengen country affects future applications.' },
  'UAE': { requirements: ['Job offer from UAE employer', 'Company-sponsored application', 'Medical fitness test', 'Emirates ID after arrival', 'Clean criminal record'], fee: 'AED 1,000-2,000', processing: '2-4 weeks', successRate: '92%', tips: 'Dubai free zones offer easier business setup. Freelance permits available for IT/media professionals.' },
  'New Zealand': { requirements: ['Offer from NZ institution', 'Funds NZD 15,000/year', 'IELTS 5.5-6.5', 'Health insurance', 'Medical exam if required'], fee: 'NZD 330', processing: '4-6 weeks', successRate: '87%', tips: 'Working Holiday Visa for 18-30 year olds allows 12 months work+travel. Post-study work visa available.' },
  'Singapore': { requirements: ['Job offer from Singapore employer', 'Relevant degree/qualification', 'Salary min SGD 4,500 (EP)', 'Company sponsorship', 'Clean background'], fee: 'SGD 105', processing: '3-8 weeks', successRate: '85%', tips: 'Employment Pass (EP) for professionals. S Pass for mid-skilled. COMPASS points system introduced in 2023.' },
  'Japan': { requirements: ['Certificate of Eligibility (CoE)', 'Admission letter from institution', 'Proof of funds', 'Valid passport', 'Application form'], fee: 'JPY 3,000', processing: '4-8 weeks', successRate: '89%', tips: 'Study Japanese language — N4/N5 level greatly improves employment prospects. Part-time work allowed 28hrs/week.' },
}

export default function KnowledgePage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ country: '', visaType: '', title: '', content: '', category: 'requirement', tags: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge'],
    queryFn: () => knowledgeAPI.getAll().then(r => r.data.data),
  })

  const createMut = useMutation({
    mutationFn: (d) => knowledgeAPI.create({ ...d, tags: d.tags.split(',').map(t => t.trim()) }),
    onSuccess: () => { qc.invalidateQueries(['knowledge']); setShowAdd(false); toast.success('Knowledge entry added!') },
  })

  const deleteMut = useMutation({
    mutationFn: (id) => knowledgeAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['knowledge']); toast.success('Entry deleted') },
  })

  const detail = selected ? DETAILS[selected] : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        subtitle="Country-specific visa rules & FAQs powering your AI system."
        action={<button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Entry</button>}
      />

      <div className="grid grid-cols-3 gap-4">
        {/* Country grid */}
        <div className="card col-span-2">
          <div className="card-header">
            <div><div className="card-title">🌍 Country Visa Guides</div><div className="card-sub">Click to explore visa rules</div></div>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {COUNTRIES.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(c.name)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selected === c.name
                    ? 'border-[var(--red)] bg-[rgba(232,55,42,0.08)]'
                    : 'border-[rgba(255,255,255,0.07)] bg-bg3 hover:border-[rgba(255,255,255,0.15)] hover:bg-bg3'
                }`}
              >
                <div className="text-2xl mb-2">{c.flag}</div>
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="text-[10px] text-[var(--text3)] mt-0.5">{c.types}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📖 {selected || 'Select Country'}</div>
          </div>
          <AnimatePresence mode="wait">
            {detail ? (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-5 space-y-4"
              >
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text3)] mb-2">Requirements</div>
                  <ul className="space-y-1.5">
                    {detail.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[var(--text2)]">
                        <span className="text-[var(--red)] mt-0.5 flex-shrink-0">•</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[['Fee', detail.fee], ['Processing', detail.processing], ['Success', detail.successRate]].map(([k, v]) => (
                    <div key={k} className="bg-bg3 rounded-lg p-2.5 text-center border border-[rgba(255,255,255,0.05)]">
                      <div className="text-[9px] text-[var(--text3)] uppercase tracking-wider mb-0.5">{k}</div>
                      <div className="text-xs font-bold text-[var(--text)]">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="text-[10px] font-semibold text-yellow-400 mb-1">💡 Pro Tip</div>
                  <div className="text-xs text-[var(--text2)] leading-relaxed">{detail.tips}</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="text-4xl mb-3 opacity-20">🌏</div>
                <div className="text-sm text-[var(--text3)]">Select a country to view<br />detailed visa information</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* DB Entries */}
      {!isLoading && data?.length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">📚 Database Entries</div><div className="card-sub">{data.length} knowledge items</div></div>
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {data.slice(0, 8).map((item) => (
              <div key={item._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02]">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.title || item.country}</div>
                  <div className="text-xs text-[var(--text3)] truncate">{item.content?.substring(0, 80)}...</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[var(--text3)]">{item.category}</span>
                <button onClick={() => deleteMut.mutate(item._id)} className="text-xs text-[var(--text3)] hover:text-red-400 transition-colors">🗑</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Knowledge Entry" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Country *</label>
              <input className="input w-full" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required placeholder="Canada" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Visa Type</label>
              <input className="input w-full" value={form.visaType} onChange={e => setForm({ ...form, visaType: e.target.value })} placeholder="student" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Title *</label>
              <input className="input w-full" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Canada Student Visa Requirements" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Category</label>
              <select className="input w-full" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {['requirement', 'faq', 'process', 'fee', 'timeline'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Content *</label>
            <textarea className="input w-full h-28 resize-none" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required placeholder="Detailed visa information..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
            <input className="input w-full" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="canada, student, ielts" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMut.isPending}>
              {createMut.isPending ? <Spinner size={14} color="#fff" /> : 'Add Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
