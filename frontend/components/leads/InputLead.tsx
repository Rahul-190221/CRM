'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, Trash2, AlertCircle, CheckCircle2, Calendar, ChevronDown, ArrowLeft } from 'lucide-react'
import { createLead, getBDMsForAssignment as getBDMs, importLeadsFromCSV } from '@/lib/api/leads'
import type { LeadSource, ServiceInterest, BDM } from '@/types/admin'

interface FollowUpEntry {
  id: number
  date: string
  note: string
  nextFollowUpDate: string
}

const leadSources: LeadSource[] = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Walk-in', 'Phone', 'Other']
const serviceInterests: ServiceInterest[] = ['IELTS', 'PTE', 'GRE', 'TOEFL', 'Study Abroad', 'Visa Processing']

interface InputLeadProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const fieldClass = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACE39]/50 focus:border-[#FACE39] transition-all'
const labelClass = 'block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1.5'

export default function InputLead({ onSuccess, onCancel }: InputLeadProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    source: '' as LeadSource | '',
    serviceInterest: '' as ServiceInterest | '',
    assignedTo: '',
    notes: ''
  })

  const [followUps, setFollowUps] = useState<FollowUpEntry[]>([
    { id: 1, date: '', note: '', nextFollowUpDate: '' }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [bdms, setBdms] = useState<BDM[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchBDMs = async () => {
      try {
        const data = await getBDMs()
        setBdms(data)
      } catch (err) {
        console.error('Failed to fetch BDMs:', err)
      }
    }
    fetchBDMs()
  }, [])

  const handleAddFollowUp = () => {
    setFollowUps([...followUps, { id: Date.now(), date: '', note: '', nextFollowUpDate: '' }])
  }

  const handleRemoveFollowUp = (id: number) => {
    if (followUps.length > 1) setFollowUps(followUps.filter(f => f.id !== id))
  }

  const handleFollowUpChange = (id: number, field: keyof FollowUpEntry, value: string) => {
    setFollowUps(followUps.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const leadData = {
        ...formData,
        source: formData.source as LeadSource,
        serviceInterest: formData.serviceInterest as ServiceInterest,
        followUps: followUps
          .filter(f => f.date || f.note || f.nextFollowUpDate)
          .map(f => ({ date: f.date, note: f.note, nextFollowUpDate: f.nextFollowUpDate })),
        lifecycleStage: 'Intake' as const
      }
      await createLead(leadData)
      setSuccess('Lead created successfully!')
      setTimeout(() => { onSuccess?.() }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to create lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImportCSV = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsImporting(true)
        setError(null)
        setSuccess(null)
        try {
          const result = await importLeadsFromCSV(file)
          setSuccess(`Successfully imported ${result.imported} leads${result.failed > 0 ? `. ${result.failed} failed.` : '.'}`)
          if (result.imported > 0) setTimeout(() => { onSuccess?.() }, 2000)
        } catch (err: any) {
          setError(err.message || 'Failed to import CSV')
        } finally {
          setIsImporting(false)
        }
      }
    }
    input.click()
  }

  return (
    <div className="w-full">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#00000F]/85">Input Lead</h1>
            <p className="text-sm text-gray-400 mt-0.5">Add a new lead manually or import from CSV</p>
          </div>
        </div>
        <button
          onClick={handleImportCSV}
          disabled={isImporting}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all bg-white shadow-sm disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {isImporting ? 'Importing…' : 'Import from CSV'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 sm:px-8 py-4 border-b border-[#00000F]/[0.04] bg-[#fafafa]">
            <h2 className="text-sm font-semibold text-[#00000F]/75">Contact Information</h2>
            <p className="text-xs text-gray-400 mt-0.5">Basic details about the lead</p>
          </div>
          <div className="px-4 sm:px-8 py-4 sm:py-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-4">
            <div>
              <label className={labelClass}>Full Name <span className="text-red-400 normal-case">*</span></label>
              <input
                type="text"
                placeholder="Enter lead name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Email <span className="text-red-400 normal-case">*</span></label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number <span className="text-red-400 normal-case">*</span></label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Lead Source <span className="text-red-400 normal-case">*</span></label>
              <div className="relative">
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                  className={fieldClass + ' appearance-none pr-10 cursor-pointer'}
                  required
                >
                  <option value="">Select source</option>
                  {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Service & Assignment */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 sm:px-8 py-4 border-b border-[#00000F]/[0.04] bg-[#fafafa]">
            <h2 className="text-sm font-semibold text-[#00000F]/75">Service & Assignment</h2>
            <p className="text-xs text-gray-400 mt-0.5">Service interest and BDM assignment</p>
          </div>
          <div className="px-4 sm:px-8 py-4 sm:py-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-4">
            <div>
              <label className={labelClass}>Service Interest <span className="text-red-400 normal-case">*</span></label>
              <div className="relative">
                <select
                  value={formData.serviceInterest}
                  onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value as ServiceInterest })}
                  className={fieldClass + ' appearance-none pr-10 cursor-pointer'}
                  required
                >
                  <option value="">Select service</option>
                  {serviceInterests.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Assign to BDM <span className="text-red-400 normal-case">*</span></label>
              <div className="relative">
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className={fieldClass + ' appearance-none pr-10 cursor-pointer'}
                  required
                >
                  <option value="">Select BDM</option>
                  {bdms.map(bdm => <option key={bdm._id} value={bdm._id}>{bdm.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Notes <span className="text-red-400 normal-case">*</span></label>
              <textarea
                placeholder="Add any additional notes about this lead…"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className={fieldClass + ' resize-none'}
                required
              />
            </div>
          </div>
        </div>

        {/* Follow-Up Details */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 sm:px-8 py-4 border-b border-[#00000F]/[0.04] bg-[#fafafa]">
            <h2 className="text-sm font-semibold text-[#00000F]/75">Follow-Up Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Schedule follow-up appointments</p>
          </div>
          <div className="px-4 sm:px-8 py-4 sm:py-5 space-y-5">
            {followUps.map((followUp, index) => (
              <div key={followUp.id}>
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#FACE39]/10 border border-[#FACE39]/30 rounded-lg text-xs font-bold text-yellow-700">
                    Follow Up {index + 1}
                  </span>
                  {followUps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFollowUp(followUp.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>Date <span className="text-red-400 normal-case">*</span></label>
                    <div className="relative">
                      <input
                        type="date"
                        value={followUp.date}
                        onChange={(e) => handleFollowUpChange(followUp.id, 'date', e.target.value)}
                        className={fieldClass + ' pr-10'}
                        required
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Note <span className="text-red-400 normal-case">*</span></label>
                    <input
                      type="text"
                      placeholder="Add follow-up note"
                      value={followUp.note}
                      onChange={(e) => handleFollowUpChange(followUp.id, 'note', e.target.value)}
                      className={fieldClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Next Follow-Up Date <span className="text-red-400 normal-case">*</span></label>
                    <div className="relative">
                      <input
                        type="date"
                        value={followUp.nextFollowUpDate}
                        onChange={(e) => handleFollowUpChange(followUp.id, 'nextFollowUpDate', e.target.value)}
                        className={fieldClass + ' pr-10'}
                        required
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddFollowUp}
              className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Follow-Up
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pb-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gray-900 rounded-xl text-sm font-bold text-white hover:bg-black transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving…' : 'Save Lead'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancel
          </button>
        </div>

      </form>

      {/* Toast Messages */}
      {(error || success) && (
        <div className="fixed bottom-8 right-8 max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4">
          {error && (
            <div className="bg-white border border-red-100 text-red-700 px-5 py-4 rounded-2xl shadow-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-white border border-green-100 text-green-700 px-5 py-4 rounded-2xl shadow-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
              <p className="text-sm font-semibold">{success}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
