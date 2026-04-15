// src/components/pages/ContactsPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { leadsAPI } from '@/services/api'
import { MetricCard, StatusBadge, Modal, PageHeader, EmptyState, Spinner } from '@/components/ui'

export default function ContactsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editContact, setEditContact] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', role: '', notes: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', search],
    queryFn: () => leadsAPI.getAll({ limit: 100, search }).then(r => r.data),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => leadsAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['contacts']); setShowModal(false); setEditContact(null); toast.success('Contact updated!') },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMut.mutate({ id: editContact._id, data: form })
  }

  const contacts = data?.data || []
  const uniqueContacts = contacts.filter((c, i, arr) => arr.findIndex(x => x.email === c.email) === i)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        subtitle="Manage your client contacts and communication history."
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Contacts" value={uniqueContacts.length} change="Unique emails" icon="👥" delay={0.05} />
        <MetricCard label="With Email" value={uniqueContacts.filter(c => c.email).length} change="Email available" icon="📧" accent="blue" delay={0.1} />
        <MetricCard label="Companies" value={new Set(uniqueContacts.map(c => c.company).filter(Boolean)).size} change="Unique companies" icon="🏢" accent="gold" delay={0.15} />
        <MetricCard label="Active" value={uniqueContacts.filter(c => c.status !== 'dormant').length} change="In system" icon="✅" accent="green" delay={0.2} />
      </div>

      {/* Search & Table */}
      <div className="card">
        <div className="p-4 border-b border-[rgba(255,255,255,0.07)]">
          <input
            className="input w-full"
            placeholder="🔍 Search contacts by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {['Contact', 'Email', 'Company', 'Visa Type', 'Destination', 'Status', 'Last Contact', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="skeleton h-4 w-20 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : uniqueContacts.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon="👥" title="No contacts found" description="Contacts will appear here as you add leads" /></td></tr>
              ) : (
                uniqueContacts.map((contact, i) => (
                  <motion.tr
                    key={contact._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--red)] to-orange-400 flex items-center justify-center text-xs font-bold text-white">
                          {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{contact.name}</div>
                          <div className="text-[10px] text-[var(--text3)] font-mono">{contact.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[var(--text2)]">{contact.email || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-[var(--text2)]">{contact.company || '—'}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold capitalize">{contact.visaType}</td>
                    <td className="px-4 py-3.5 text-xs text-[var(--text2)]">{contact.destination || '—'}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={contact.status} /></td>
                    <td className="px-4 py-3.5 text-[11px] text-[var(--text3)] font-mono">
                      {contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => { setEditContact(contact); setForm({ name: contact.name, phone: contact.phone, email: contact.email || '', company: contact.company || '', role: contact.role || '', notes: contact.notes || '' }); setShowModal(true) }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.07)] text-[var(--text2)] hover:border-blue-500 hover:text-blue-400 transition-all"
                      >
                        Edit
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditContact(null) }} title="Edit Contact" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Name</label>
              <input className="input w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Phone</label>
              <input className="input w-full" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Email</label>
              <input className="input w-full" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Company</label>
              <input className="input w-full" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Role</label>
              <input className="input w-full" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Client, Partner, etc." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Notes</label>
            <textarea className="input w-full h-20 resize-none" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-outline" onClick={() => { setShowModal(false); setEditContact(null) }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={updateMut.isPending}>
              {updateMut.isPending ? <Spinner size={14} color="#fff" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
