// src/components/wevisa/WeVisaInvoicePage.jsx — Full Invoice Generator
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaInvoiceAPI } from '@/services/wevisaApi'

const ii  = { color:'#111827', backgroundColor:'#f9fafb', caretColor:'#111827' }
const inp = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors'
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5'

const DOC_TYPES = ['invoice','tax_invoice','proforma','receipt','sales_receipt','cash_receipt','quote','estimate','credit_memo','credit_note','purchase_order','delivery_note','purchase']
const STATUS_TABS = ['All Documents','Overdue','Partially Paid','Unpaid','Paid','Refunded','Sent by Email','Archived']
const SCLR = {paid:'bg-green-100 text-green-700',unpaid:'bg-yellow-100 text-yellow-700',overdue:'bg-red-100 text-red-700',partially_paid:'bg-orange-100 text-orange-700',refunded:'bg-gray-100 text-gray-500',draft:'bg-gray-100 text-gray-500',archived:'bg-gray-100 text-gray-400',sent:'bg-blue-100 text-blue-700'}
const NAV_ITEMS = [{icon:'⊞',label:'Dashboard'},{icon:'🧾',label:'Invoices',active:true},{icon:'🛒',label:'Purchases'},{icon:'📊',label:'Reports'},{icon:'👥',label:'Client Management'},{icon:'⚙️',label:'Settings'}]

function NewInvoiceModal({open,onClose}) {
  const [f,setF] = useState({
    type:'invoice',clientName:'',clientEmail:'',clientPhone:'',clientGSTIN:'',
    issueDate:new Date().toISOString().split('T')[0],dueDate:'',
    items:[{description:'',quantity:1,unitPrice:0,discount:0,tax:18}],
    notes:'',terms:'Payment due within 30 days.',
    businessProfile:{name:'',gstin:'',phone:'',email:'',address:''},
  })
  const qc = useQueryClient()
  const m = useMutation({
    mutationFn:()=>wevisaInvoiceAPI.createInvoice(f),
    onSuccess:()=>{qc.invalidateQueries(['wv-invoices']);qc.invalidateQueries(['wv-inv-stats']);toast.success('Invoice created! 🧾');onClose()},
  })

  const addItem  = ()=>setF({...f,items:[...f.items,{description:'',quantity:1,unitPrice:0,discount:0,tax:18}]})
  const remItem  = i=>setF({...f,items:f.items.filter((_,idx)=>idx!==i)})
  const updItem  = (i,k,v)=>{const it=[...f.items];it[i]={...it[i],[k]:v};setF({...f,items:it})}
  const sub      = f.items.reduce((s,i)=>s+i.unitPrice*i.quantity*(1-(i.discount||0)/100),0)
  const tax      = f.items.reduce((s,i)=>s+i.unitPrice*i.quantity*(1-(i.discount||0)/100)*(i.tax||18)/100,0)
  const total    = sub+tax

  if(!open) return null
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl z-10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-extrabold text-xl text-gray-800">🧾 Create New Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="overflow-y-auto flex-1 p-7 space-y-6">
          {/* Type */}
          <div>
            <label className={lbl}>Document Type</label>
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.map(t=>(
                <button key={t} onClick={()=>setF({...f,type:t})}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all border ${f.type===t?'bg-blue-600 text-white border-blue-600':'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                  {t.replace(/_/g,' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Business */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="font-bold text-gray-700 text-sm mb-3">🏢 Your Business Details</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <input value={f.businessProfile.name} onChange={e=>setF({...f,businessProfile:{...f.businessProfile,name:e.target.value}})} className={`${inp} col-span-2`} style={ii} placeholder="Business Name"/>
              <input value={f.businessProfile.gstin} onChange={e=>setF({...f,businessProfile:{...f.businessProfile,gstin:e.target.value}})} className={inp} style={ii} placeholder="GSTIN"/>
              <input value={f.businessProfile.phone} onChange={e=>setF({...f,businessProfile:{...f.businessProfile,phone:e.target.value}})} className={inp} style={ii} placeholder="Phone"/>
              <input value={f.businessProfile.email} onChange={e=>setF({...f,businessProfile:{...f.businessProfile,email:e.target.value}})} className={inp} style={ii} placeholder="Email"/>
              <input value={f.businessProfile.address} onChange={e=>setF({...f,businessProfile:{...f.businessProfile,address:e.target.value}})} className={inp} style={ii} placeholder="Address"/>
            </div>
          </div>

          {/* Client */}
          <div>
            <div className="font-bold text-gray-700 text-sm mb-3">👤 Client Details</div>
            <div className="grid grid-cols-2 gap-3">
              <input value={f.clientName} onChange={e=>setF({...f,clientName:e.target.value})} className={inp} style={ii} placeholder="Client Name *"/>
              <input value={f.clientEmail} onChange={e=>setF({...f,clientEmail:e.target.value})} className={inp} style={ii} placeholder="Client Email"/>
              <input value={f.clientPhone} onChange={e=>setF({...f,clientPhone:e.target.value})} className={inp} style={ii} placeholder="Phone"/>
              <input value={f.clientGSTIN} onChange={e=>setF({...f,clientGSTIN:e.target.value})} className={inp} style={ii} placeholder="GSTIN (optional)"/>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Issue Date</label><input type="date" value={f.issueDate} onChange={e=>setF({...f,issueDate:e.target.value})} className={inp} style={ii}/></div>
            <div><label className={lbl}>Due Date</label><input type="date" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})} className={inp} style={ii}/></div>
          </div>

          {/* Items */}
          <div>
            <div className="font-bold text-gray-700 text-sm mb-3">📦 Line Items</div>
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 uppercase px-1 mb-1">
              <div className="col-span-4">Description</div><div className="col-span-1">Qty</div><div className="col-span-2">Unit Price</div><div className="col-span-1">Disc%</div><div className="col-span-1">Tax%</div><div className="col-span-2">Total</div><div className="col-span-1"></div>
            </div>
            {f.items.map((item,i)=>{
              const rowTotal = item.unitPrice*item.quantity*(1-(item.discount||0)/100)*(1+(item.tax||18)/100)
              return(
                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-2 border border-gray-100 mb-2">
                  <input value={item.description} onChange={e=>updItem(i,'description',e.target.value)} className="col-span-4 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white" style={ii} placeholder="Service description"/>
                  <input type="number" value={item.quantity} onChange={e=>updItem(i,'quantity',Number(e.target.value))} className="col-span-1 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white text-center" style={ii} min="1"/>
                  <input type="number" value={item.unitPrice} onChange={e=>updItem(i,'unitPrice',Number(e.target.value))} className="col-span-2 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white" style={ii} placeholder="0"/>
                  <input type="number" value={item.discount} onChange={e=>updItem(i,'discount',Number(e.target.value))} className="col-span-1 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white text-center" style={ii}/>
                  <input type="number" value={item.tax} onChange={e=>updItem(i,'tax',Number(e.target.value))} className="col-span-1 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white text-center" style={ii}/>
                  <div className="col-span-2 text-xs font-bold text-blue-700 text-right pr-1">₹{rowTotal.toFixed(0)}</div>
                  <button onClick={()=>remItem(i)} className="col-span-1 text-red-400 hover:text-red-600 text-center text-base leading-none">×</button>
                </div>
              )
            })}
            <button onClick={addItem} className="w-full py-2.5 rounded-xl border border-dashed border-blue-300 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-all">+ Add Line Item</button>
          </div>

          {/* Totals */}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₹{sub.toFixed(0)}</span></div>
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">GST/Tax</span><span className="font-semibold text-orange-600">₹{tax.toFixed(0)}</span></div>
            <div className="flex justify-between text-lg font-extrabold border-t border-blue-200 pt-2"><span className="text-gray-800">Total</span><span className="text-blue-700">₹{total.toFixed(0)}</span></div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Notes</label><textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none" style={ii} placeholder="Additional notes..."/></div>
            <div><label className={lbl}>Terms</label><textarea value={f.terms} onChange={e=>setF({...f,terms:e.target.value})} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none" style={ii}/></div>
          </div>

          <button onClick={()=>m.mutate()} disabled={!f.clientName||m.isPending}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-extrabold text-base hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-xl">
            {m.isPending?'Creating...':'🧾 Create Invoice'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function WeVisaInvoicePage() {
  const [showNew,setShowNew]         = useState(false)
  const [statusTab,setStatusTab]     = useState('All Documents')
  const [navTab,setNavTab]           = useState('Invoices')
  const [search,setSearch]           = useState('')
  const qc = useQueryClient()

  const {data:invoices=[],isLoading} = useQuery({queryKey:['wv-invoices'],queryFn:()=>wevisaInvoiceAPI.getInvoices().then(r=>r.data.data||[])})
  const {data:stats={}}              = useQuery({queryKey:['wv-inv-stats'],queryFn:()=>wevisaInvoiceAPI.getStats().then(r=>r.data.data||{})})

  const delM = useMutation({mutationFn:wevisaInvoiceAPI.deleteInvoice,onSuccess:()=>{qc.invalidateQueries(['wv-invoices']);toast.success('Invoice deleted')}})
  const updM = useMutation({mutationFn:({id,d})=>wevisaInvoiceAPI.updateInvoice(id,d),onSuccess:()=>qc.invalidateQueries(['wv-invoices'])})

  const filtered = invoices.filter(inv=>{
    const ms = inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase())||inv.clientName?.toLowerCase().includes(search.toLowerCase())
    const statusMap = {'Paid':'paid','Unpaid':'unpaid','Overdue':'overdue','Partially Paid':'partially_paid','Refunded':'refunded','Archived':'archived','Sent by Email':'sent'}
    const mt = statusTab==='All Documents'||inv.status===statusMap[statusTab]
    return ms&&mt
  })

  const tabCount = tab=>{
    const m = {'Paid':'paid','Unpaid':'unpaid','Overdue':'overdue','Partially Paid':'partially_paid','Refunded':'refunded','Archived':'archived'}
    if(tab==='All Documents') return invoices.length
    return invoices.filter(i=>i.status===m[tab]).length
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-blue-900 text-white px-4 lg:px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-xs font-extrabold">W</div>
          <span className="font-extrabold text-sm">WeVisa</span>
        </div>
        <div className="flex-1"/>
        <div className="flex items-center gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} className="px-4 py-1.5 rounded-xl bg-white/10 text-white text-sm placeholder:text-white/50 focus:outline-none focus:bg-white/20 w-48 sm:w-64" placeholder="🔍 Search client or invoice..." style={{color:'white',caretColor:'white'}}/>
          <button onClick={()=>setShowNew(true)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-400 shadow flex-shrink-0">+ New Invoice</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden sm:flex w-48 bg-blue-900 text-white flex-col flex-shrink-0 p-3 space-y-1">
          {NAV_ITEMS.map(item=>(
            <button key={item.label} onClick={()=>setNavTab(item.label)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all w-full text-left ${item.label===navTab?'bg-white/20 text-white':'text-blue-300 hover:bg-white/10'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              {l:'Total Invoices',v:stats.total??0,   icon:'🧾',c:'text-blue-700',   bg:'bg-blue-50'},
              {l:'Paid',          v:stats.paid??0,    icon:'✅',c:'text-green-700',  bg:'bg-green-50'},
              {l:'Unpaid',        v:stats.unpaid??0,  icon:'⏳',c:'text-yellow-700', bg:'bg-yellow-50'},
              {l:'Revenue',       v:'₹'+((stats.revenue||0)/1000).toFixed(1)+'K', icon:'💰',c:'text-purple-700',bg:'bg-purple-50'},
            ].map(s=>(
              <div key={s.l} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl flex-shrink-0`}>{s.icon}</div>
                <div><div className={`text-xl sm:text-2xl font-extrabold ${s.c}`}>{s.v}</div><div className="text-[10px] text-gray-400">{s.l}</div></div>
              </div>
            ))}
          </div>

          {/* Quick create */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">New:</div>
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.slice(0,8).map(type=>(
                <button key={type} onClick={()=>setShowNew(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all capitalize">
                  📄 {type.replace(/_/g,' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Invoice table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Status tabs */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {STATUS_TABS.map(tab=>(
                <button key={tab} onClick={()=>setStatusTab(tab)}
                  className={`px-4 py-3 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border-b-2 flex-shrink-0 ${statusTab===tab?'border-blue-600 text-blue-600 bg-blue-50/50':'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${tab==='Overdue'?'bg-red-100 text-red-600':tab==='Paid'?'bg-green-100 text-green-600':tab==='Unpaid'?'bg-yellow-100 text-yellow-600':'bg-gray-100 text-gray-500'}`}>
                    {tabCount(tab)}
                  </span>
                </button>
              ))}
            </div>

            {isLoading?(
              <div className="p-8 text-center text-gray-400">Loading invoices...</div>
            ):filtered.length===0?(
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🧾</div>
                <div className="font-bold text-lg text-gray-400">No invoices found</div>
                <div className="text-sm text-gray-300 mt-1">Create your first invoice!</div>
                <button onClick={()=>setShowNew(true)} className="mt-4 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg">+ Create Invoice</button>
              </div>
            ):(
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3"><input type="checkbox" className="accent-blue-600"/></th>
                      {['Number','Customer','Date','Due Date','Amount','Status','Type','Actions'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((inv,i)=>(
                      <motion.tr key={inv._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*.03}} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-5 py-3.5"><input type="checkbox" className="accent-blue-600"/></td>
                        <td className="px-4 py-3.5"><div className="text-sm font-bold text-blue-600">{inv.invoiceNumber}</div></td>
                        <td className="px-4 py-3.5">
                          <div className="text-sm font-semibold text-gray-800">{inv.clientName}</div>
                          <div className="text-[10px] text-gray-400">{inv.clientEmail}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{inv.issueDate?new Date(inv.issueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{inv.dueDate?new Date(inv.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'}</td>
                        <td className="px-4 py-3.5 text-sm font-extrabold text-gray-800">₹{(inv.totalAmount||0).toFixed(0)}</td>
                        <td className="px-4 py-3.5">
                          <select value={inv.status} onChange={e=>updM.mutate({id:inv._id,d:{status:e.target.value}})}
                            className="text-xs px-2.5 py-1.5 rounded-full font-bold border-0 cursor-pointer focus:outline-none capitalize" style={{color:'inherit',backgroundColor:'inherit'}}>
                            {['draft','unpaid','paid','partially_paid','overdue','refunded','archived'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400 capitalize">{inv.type?.replace(/_/g,' ')}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="text-[10px] px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 font-semibold">View</button>
                            <button onClick={()=>delM.mutate(inv._id)} className="text-[10px] px-2 py-1 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 font-semibold">Del</button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewInvoiceModal open={showNew} onClose={()=>setShowNew(false)}/>
    </div>
  )
}
