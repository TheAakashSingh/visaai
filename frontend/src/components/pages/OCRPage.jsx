// src/components/pages/OCRPage.jsx
import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { ocrAPI, leadsAPI } from '@/services/api'
import { MetricCard, PageHeader, StatusBadge, Spinner, EmptyState } from '@/components/ui'

export default function OCRPage() {
  const qc = useQueryClient()
  const [ocrResult, setOcrResult] = useState(null)
  const [selectedLeadId, setSelectedLeadId] = useState('')

  const { data: statsData, isLoading: statsLoading } = useQuery({ 
    queryKey: ['ocr-stats'], 
    queryFn: () => ocrAPI.getStats().then(r => r.data.data) 
  })
  const { data: docsData, isLoading: docsLoading } = useQuery({ 
    queryKey: ['ocr-documents'], 
    queryFn: () => ocrAPI.getDocuments({ limit: 15 }).then(r => r.data) 
  })
  const { data: leadsData } = useQuery({
    queryKey: ['leads-list'],
    queryFn: () => leadsAPI.getAll({ limit: 100 }).then(r => r.data)
  })
  
  const docs = docsData?.data || []
  const stats = statsData || {}
  const leads = leadsData?.data || []

  const processMut = useMutation({
    mutationFn: ({ file, leadId }) => {
      const fd = new FormData()
      fd.append('document', file)
      fd.append('document_type', 'auto')
      if (leadId) fd.append('leadId', leadId)
      return ocrAPI.processDocument(fd)
    },
    onSuccess: (res) => {
      setOcrResult(res.data.data)
      qc.invalidateQueries(['ocr-documents'])
      qc.invalidateQueries(['ocr-stats'])
      toast.success('Document processed successfully! 📄')
    },
    onError: () => toast.error('OCR processing failed. Please try again.'),
  })

  const onDrop = useCallback((files) => {
    if (files.length > 0) processMut.mutate({ file: files[0], leadId: selectedLeadId })
  }, [selectedLeadId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'application/pdf': [] }, maxSize: 10485760, multiple: false,
  })

  const ocr = ocrResult?.ocr || null
  const alerts = ocrResult?.alerts || []

  return (
    <div className="space-y-6">
      <PageHeader title="Smart Document OCR" subtitle="AI-powered optical character recognition for passports & visa documents." />
      <div className="grid grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
        ) : (
          <>
            <MetricCard label="Docs Processed" value={stats.total ?? 0} change="All time" icon="📄" delay={0.05} />
            <MetricCard label="Accuracy Rate" value={`${stats.accuracyRate ?? 0}%`} change="Google Vision" icon="🎯" accent="green" delay={0.1} />
            <MetricCard label="Avg Process Time" value={`${stats.avgProcessTime ?? 0}s`} change="Per document" icon="⚡" accent="gold" delay={0.15} />
            <MetricCard label="Passports Read" value={stats.passports ?? 0} change="Successfully" icon="🛂" accent="blue" delay={0.2} />
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Upload */}
        <div className="card">
          <div className="card-header"><div className="card-title">📁 Document Processor</div><div className="card-sub">Google Vision API + AI</div></div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Link to Lead (optional)</label>
              <select className="input w-full" value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)}>
                <option value="">-- No lead selected --</option>
                {leads.map(l => <option key={l._id} value={l._id}>{l.name} — {l.phone}</option>)}
              </select>
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-[var(--red)] bg-[rgba(232,55,42,0.05)]' : 'border-[rgba(255,255,255,0.12)] hover:border-[var(--red)] hover:bg-[rgba(232,55,42,0.03)]'}`}
            >
              <input {...getInputProps()} />
              {processMut.isPending ? (
                <div className="flex flex-col items-center gap-3">
                  <Spinner size={36} /><div className="text-sm font-medium">Processing document...</div>
                  <div className="text-xs text-[var(--text3)]">AI OCR analyzing image</div>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-3">📁</div>
                  <div className="text-sm font-semibold mb-1">{isDragActive ? 'Drop here!' : 'Drop passport or visa document'}</div>
                  <div className="text-xs text-[var(--text3)]">Supports JPG, PNG, PDF · Max 10MB<br/>Click to browse files</div>
                </>
              )}
            </div>

            {/* OCR Result */}
            <AnimatePresence>
              {ocr && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-bg3 rounded-xl border border-[rgba(255,255,255,0.07)] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
                    <span className="text-xs font-semibold text-green-400">✅ Extracted Data — {ocrResult?.document?.type || 'Document'}</span>
                    <span className="text-[10px] text-[var(--text3)] font-mono">Confidence: {ocr.confidence ? (ocr.confidence * 100).toFixed(0) : 0}%</span>
                  </div>
                  <div className="p-4 font-mono text-[11px] leading-relaxed space-y-1">
                    {[['Full Name', ocr.full_name],['Date of Birth', ocr.date_of_birth],['Document No', ocr.document_number],['Issue Date', ocr.issue_date],['Expiry Date', ocr.expiry_date],['Nationality', ocr.nationality],['Gender', ocr.gender],['Place of Issue', ocr.place_of_issue]].filter(([,v]) => v).map(([k,v]) => (
                      <div key={k} className="flex gap-3">
                        <span className="text-green-400 w-28 flex-shrink-0">{k}:</span>
                        <span className="text-[var(--text2)]">{v}</span>
                      </div>
                    ))}
                  </div>
                  {alerts.length > 0 && (
                    <div className="px-4 pb-3 space-y-1">
                      {alerts.map((a, i) => (
                        <div key={i} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${a.includes('EXPIRED') ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                          {a.includes('EXPIRED') ? '❌' : '⚠️'} {a}
                        </div>
                      ))}
                      <div className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 bg-green-500/15 text-green-400">✅ CRM entry created automatically</div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="card">
          <div className="card-header"><div className="card-title">📋 Processed Documents</div><div className="card-sub">{docs.length} documents</div></div>
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {docsLoading ? Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5"><div className="skeleton h-4 w-full" /></div>
            )) : docs.length === 0 ? (
              <EmptyState icon="📄" title="No documents yet" description="Upload a passport or document to get started" />
            ) : docs.map((doc, i) => (
              <motion.div key={doc._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <span className="text-xl">{doc.type === 'passport' ? '🛂' : doc.type === 'bank_statement' ? '🏦' : '📄'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{doc.originalName || doc.type}</div>
                  <div className="text-[10px] text-[var(--text3)]">{doc.ocrData?.fullName || 'Processing...'}</div>
                </div>
                <StatusBadge status={doc.validationStatus || 'pending'} className="text-[10px] py-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
