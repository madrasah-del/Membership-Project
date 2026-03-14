'use client'

import { useState } from 'react'
import { Save, UserCircle, Smartphone, Shield, Loader2, CheckCircle2 } from 'lucide-react'
import { updateCommunicationPreferences } from '@/app/dashboard/settings/actions'

interface SettingsFormProps {
  initialEmail: string
  initialFirstName: string
  initialLastName: string
  initialNewsletterOptIn: boolean
  initialWhatsappOptIn: boolean
}

export default function SettingsForm({
  initialEmail,
  initialFirstName,
  initialLastName,
  initialNewsletterOptIn,
  initialWhatsappOptIn,
}: SettingsFormProps) {
  const [newsletter, setNewsletter] = useState(initialNewsletterOptIn)
  const [whatsapp, setWhatsapp] = useState(initialWhatsappOptIn)
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const result = await updateCommunicationPreferences(newsletter, whatsapp)
      if (result.success) {
        setSuccessMsg('Preferences updated successfully.')
        setTimeout(() => setSuccessMsg(''), 5000)
      } else {
        setErrorMsg(result.error || 'Failed to save changes')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      {/* Profile Section */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
              <UserCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personal Info</h2>
              <p className="text-sm text-slate-500">View your email and basic details</p>
            </div>
          </div>
        </div>
        <div className="p-8 grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <input type="email" disabled value={initialEmail} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Display Name</label>
            <input type="text" disabled value={`${initialFirstName} ${initialLastName}`.trim() || 'Not set'} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid sm:grid-cols-2 gap-6">
        <label className={`block bg-white p-6 rounded-3xl border ${newsletter ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200'} shadow-sm flex items-start gap-4 hover:border-brand-300 transition-colors cursor-pointer group`}>
          <div className="flex-1 flex items-start gap-4">
            <div className={`w-10 h-10 ${newsletter ? 'bg-brand-100 text-brand-600' : 'bg-blue-50 text-blue-600'} rounded-xl flex items-center justify-center transition-transform`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Newsletter</h3>
              <p className="text-sm text-slate-500 mt-1">Receive EEIS news and announcements by email</p>
            </div>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5 mt-1 accent-brand-600 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
          />
        </label>

        <label className={`block bg-white p-6 rounded-3xl border ${whatsapp ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200'} shadow-sm flex items-start gap-4 hover:border-brand-300 transition-colors cursor-pointer group`}>
          <div className="flex-1 flex items-start gap-4">
            <div className={`w-10 h-10 ${whatsapp ? 'bg-brand-100 text-brand-600' : 'bg-green-50 text-green-600'} rounded-xl flex items-center justify-center transition-transform`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">WhatsApp Group</h3>
              <p className="text-sm text-slate-500 mt-1">Opt in to join the official EEIS WhatsApp community</p>
            </div>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5 mt-1 accent-brand-600 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            checked={whatsapp}
            onChange={(e) => setWhatsapp(e.target.checked)}
          />
        </label>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
            <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {successMsg && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {successMsg}
          </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
