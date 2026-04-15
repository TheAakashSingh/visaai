// src/components/wevisa/WeVisaInvoicePage.jsx — Full Invoice Generator
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaInvoiceAPI } from '@/services/wevisaApi'

const DOC_TYPES = ['invoice', 'tax_invoice', 'proforma', 'receipt', 'sales_receipt', 'cash_receipt', 'quote', 'estimate', 'credit_memo', 'credit_note', 'purchase_order', 'delivery_note', 'purchase']
const STATUS_TABS = ['All Documents', 'Overdue', 'Partially Paid', 'Unpaid', 'Paid', 'Refunded', 'Sent by Email', 'Archived']
const STATUS_COLORS = { paid: 'bg-green-100 text-green-700', unpaid: 'bg-yellow-100 text-yellow-700', overdue: 'bg-red-100 text-red-700', partially_paid: 'bg-orange-100 text-orange-700', refunded: 'bg-gray-100 text-gray-500', draft: 'bg-gray-100 text-gray-500', archived: 'bg-gray-100 text-gray-400', sent: 'bg-blue-100 text-blue-700' }

function NewInvoiceModal({ open, onClose }) {
  const [form, setForm] = useState({
    type: 'invoice', clientName: '', clientEmail: '', clientPhone: '', clientGSTIN: '',
    issueDate: new Date().toISOString().split('T')[0], dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 18 }],
    notes: '', terms: 'Payment due within 30 days.',
    businessProfile: { name: '', gstin: '', phone: '', email: '', address: '' },
  })
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: () => wevisaInvoiceAPI.createInvoice(form),
    onSuccess: () => { qc.invalidateQueries(['wevisa-invoices']); qc.invalidateQueries(['wevisa-invoice-stats']); toast.success('Invoice created! 🧾'); onClose() },
  })

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 18 }] })
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })
  const updateItem = (i, field, val) => {
    const items = [...form.items]
    items[i] = { ...items[i], [field]: val }
    setForm({ ...form, items })
  }

  const calcItemTotal = (item) => {
    const base = item.unitPrice * item.quantity * (1 - (item.discount || 0) / 100)
    return base + base * (item.tax || 18) / 100
  }
  const subtotal = form.items.reduce((s, i) => s + i.unitPrice * i.quantity * (1 - (i.discount || 0) / 100), 0)
  const tax = form.items.reduce((s, i) => s + i.unitPrice * i.quantity * (1 - (i.discount || 0) / 100) * (i.tax || 18) / 100, 0)
  const total = subtotal + tax

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-extrabold text-xl text-gray-800">🧾 Create New Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="p-7 space-y-6">
          {/* Invoice type */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Document Type</label>
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.map(t => (
                <button key={t} onClick={() => setForm({ ...form, type: t })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all border ${form.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Business Profile */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="font-bold text-gray-700 text-sm mb-3">🏢 Your Business Details</div>
            <div className="grid grid-cols-3 gap-3">
              <input value={form.businessProfile.name} onChange={e => setForm({ ...form, businessProfile: { ...form.businessProfile, name: e.target.value } })}
                className="col-span-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" placeholder="Business Name" />
              <input value={form.businessProfile.gstin} onChange={e => setForm({ ...form, businessProfile: { ...form.businessProfile, gstin: e.target.value } })}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" placeholder="GSTIN" />
              <input value={form.businessProfile.phone} onChange={e => setForm({ ...form, businessProfile: { ...form.businessProfile, phone: e.target.value } })}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" placeholder="Phone" />
              <input value={form.businessProfile.email} onChange={e => setForm({ ...form, businessProfile: { ...form.businessProfile, email: e.target.value } })}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" placeholder="Email" />
              <input value={form.businessProfile.address} onChange={e => setForm({ ...form, businessProfile: { ...form.businessProfile, address: e.target.value } })}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" placeholder="Address" />
            </div>
          </div>

          {/* Client details */}
          <div>
            <div className="font-bold text-gray-700 text-sm mb-3">👤 Client Details</div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="Client Name *" />
              <input value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="Client Email" />
              <input value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="Phone" />
              <input value={form.clientGSTIN} onChange={e => setForm({ ...form, clientGSTIN: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="GSTIN (optional)" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Issue Date</label>
              <input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="font-bold text-gray-700 text-sm mb-3">📦 Line Items</div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 uppercase px-1">
                <div className="col-span-4">Description</div><div className="col-span-1">Qty</div><div className="col-span-2">Unit Price</div><div className="col-span-1">Disc%</div><div className="col-span-1">Tax%</div><div className="col-span-2">Total</div><div className="col-span-1"></div>
              </div>
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-2 border border-gray-100">
                  <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="col-span-4 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white" placeholder="Service description" />
                  <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} className="col-span-1 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white text-center" min="1" />
                  <input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} className="col-span-2 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white" placeholder="0" />
                  <input type="number" value={item.discount} onChange={e => updateItem(i, 'discount', Number(e.target.value))} className="col-span-1 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white text-center" />
                  <input type="number" value={item.tax} onChange={e => updateItem(i, 'tax', Number(e.target.value))} className="col-span-1 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white text-center" />
                  <div className="col-span-2 text-xs font-bold text-blue-700 text-right pr-1">₹{calcItemTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                  <button onClick={() => removeItem(i)} className="col-span-1 text-red-400 hover:text-red-600 text-center text-sm">×</button>
                </div>
              ))}
              <button onClick={addItem} className="w-full py-2.5 rounded-xl border border-dashed border-blue-300 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-all">+ Add Line Item</button>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">GST/Tax</span><span className="font-semibold text-orange-600">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
            <div className="flex justify-between text-lg font-extrabold border-t border-blue-200 pt-2"><span className="text-gray-800">Total</span><span className="text-blue-700">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 resize-none" placeholder="Additional notes..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Terms & Conditions</label>
              <textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 resize-none" />
            </div>
          </div>

          <button onClick={() => mut.mutate()} disabled={!form.clientName || mut.isPending}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-extrabold text-base hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-xl">
            {mut.isPending ? 'Creating...' : '🧾 Create Invoice'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function WeVisaInvoicePage() {
  const [showNew, setShowNew] = useState(false)
  const [activeStatusTab, setActiveStatusTab] = useState('All Documents')
  const [activeNavTab, setActiveNavTab] = useState('Invoices')
  const [search, setSearch] = useState('')

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['wevisa-invoices'],
    queryFn: () => wevisaInvoiceAPI.getInvoices().then(r => r.data.data || []),
  })
  const { data: statsData } = useQuery({
    queryKey: ['wevisa-invoice-stats'],
    queryFn: () => wevisaInvoiceAPI.getStats().then(r => r.data.data || {}),
  })

  const qc = useQueryClient()
  const deleteMut = useMutation({
    mutationFn: wevisaInvoiceAPI.deleteInvoice,
    onSuccess: () => { qc.invalidateQueries(['wevisa-invoices']); toast.success('Invoice deleted') },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => wevisaInvoiceAPI.updateInvoice(id, data),
    onSuccess: () => qc.invalidateQueries(['wevisa-invoices']),
  })

  const invoices = (invoicesData || []).filter(inv => {
    const matchSearch = inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || inv.clientName?.toLowerCase().includes(search.toLowerCase())
    const matchTab = activeStatusTab === 'All Documents' ||
      (activeStatusTab === 'Paid' && inv.status === 'paid') ||
      (activeStatusTab === 'Unpaid' && inv.status === 'unpaid') ||
      (activeStatusTab === 'Overdue' && inv.status === 'overdue') ||
      (activeStatusTab === 'Partially Paid' && inv.status === 'partially_paid') ||
      (activeStatusTab === 'Refunded' && inv.status === 'refunded') ||
      (activeStatusTab === 'Archived' && inv.status === 'archived')
    return matchSearch && matchTab
  })

  const stats = statsData || {}

  const tabCount = (tab) => {
    if (!invoicesData) return 0
    if (tab === 'All Documents') return invoicesData.length
    const map = { 'Paid': 'paid', 'Unpaid': 'unpaid', 'Overdue': 'overdue', 'Partially Paid': 'partially_paid', 'Refunded': 'refunded', 'Archived': 'archived' }
    return invoicesData.filter(i => i.status === map[tab]).length
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top nav */}
      <div className="bg-blue-900 text-white px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded" />
          <span className="font-extrabold text-sm">WeVisa</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="px-4 py-1.5 rounded-xl bg-white/10 text-white text-sm placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all w-64"
            placeholder="🔍 Search by client number invoice..." />
          <select className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-sm focus:outline-none border-0">
            <option>No Business Profiles</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20">
            + Add Business
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-400 shadow">
            + New Invoice
          </button>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-48 bg-blue-900 text-white min-h-screen p-3 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs">W</div>
            <span className="font-extrabold text-sm">WeVisa</span>
          </div>
          {[
            { icon: '⊞', label: 'Dashboard' },
            { icon: '🧾', label: 'Invoices', active: true },
            { icon: '🛒', label: 'Purchases' },
            { icon: '📊', label: 'Reports' },
            { icon: '👥', label: 'Client Management' },
            { icon: '⚙️', label: 'Settings' },
          ].map(item => (
            <div key={item.label} onClick={() => setActiveNavTab(item.label)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all ${item.label === activeNavTab ? 'bg-white/20 text-white' : 'text-blue-300 hover:bg-white/10'}`}>
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Invoices', value: stats.total ?? 0, icon: '🧾', color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Paid', value: stats.paid ?? 0, icon: '✅', color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Unpaid', value: stats.unpaid ?? 0, icon: '⏳', color: 'text-yellow-700', bg: 'bg-yellow-50' },
              { label: 'Revenue', value: `₹${((stats.revenue || 0) / 1000).toFixed(1)}K`, icon: '💰', color: 'text-purple-700', bg: 'bg-purple-50' },
            ].map((s, i) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl flex-shrink-0`}>{s.icon}</div>
                <div>
                  <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-gray-400">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Doc type quick create */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">New:</div>
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.slice(0, 8).map(type => (
                <button key={type} onClick={() => setShowNew(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all capitalize">
                  📄 {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Status tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {STATUS_TABS.map(tab => (
                <button key={tab} onClick={() => setActiveStatusTab(tab)}
                  className={`px-4 py-3 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border-b-2 ${activeStatusTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    tab === 'Overdue' ? 'bg-red-100 text-red-600' :
                    tab === 'Paid' ? 'bg-green-100 text-green-600' :
                    tab === 'Unpaid' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>{tabCount(tab)}</span>
                </button>
              ))}
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🧾</div>
                <div className="font-bold text-lg text-gray-400">No invoices found</div>
                <div className="text-sm text-gray-300 mt-1">Create your first invoice!</div>
                <button onClick={() => setShowNew(true)} className="mt-4 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg">
                  + Create New Invoice
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"><input type="checkbox" /></th>
                    {['Number', 'Customer', 'Date', 'Due Date', 'Amount', 'Status', 'Type', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((inv, i) => (
                    <motion.tr key={inv._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-5 py-3.5"><input type="checkbox" /></td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-bold text-blue-600">{inv.invoiceNumber}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-semibold text-gray-800">{inv.clientName}</div>
                        <div className="text-[10px] text-gray-400">{inv.clientEmail}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td className="px-4 py-3.5 text-sm font-extrabold text-gray-800">₹{(inv.totalAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-3.5">
                        <select value={inv.status} onChange={e => updateMut.mutate({ id: inv._id, data: { status: e.target.value } })}
                          className={`text-xs px-2.5 py-1.5 rounded-full font-bold border-0 cursor-pointer focus:outline-none capitalize ${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-500'}`}>
                          {['draft','unpaid','paid','partially_paid','overdue','refunded','archived'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-400 capitalize">{inv.type?.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="text-[10px] px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 font-semibold">View</button>
                          <button onClick={() => deleteMut.mutate(inv._id)} className="text-[10px] px-2 py-1 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 font-semibold">Delete</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <NewInvoiceModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  )
}
