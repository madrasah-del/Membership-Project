'use client'

import { useState, useEffect } from 'react'
import { Save, UserCircle, Smartphone, Shield, Loader2, CheckCircle2, Briefcase, Store } from 'lucide-react'
import { updateUserSettings } from '@/app/dashboard/settings/actions'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  initialEmail: string
  initialFirstName: string
  initialLastName: string
  initialPhone: string
  initialProfession: string
  initialPosition: string
  initialFunctionalPosition: string
  initialNewsletterOptIn: boolean
  initialWhatsappOptIn: boolean
  initialBusinessOptIn: boolean
  initialBusinessType: string
  initialBusinessName: string
  initialBusinessContact: string
  initialBusinessWebsite: string
  initialBusinessDescription: string
  initialTitle: string
  initialAddress: string
  initialTown: string
  initialPostcode: string
}

export default function SettingsForm(props: SettingsFormProps) {
  const router = useRouter()
  const [phone, setPhone] = useState(props.initialPhone)
  const [profession, setProfession] = useState(props.initialProfession)
  const [position, setPosition] = useState(props.initialPosition)
  const [functionalPosition, setFunctionalPosition] = useState(props.initialFunctionalPosition)
  const [newsletter, setNewsletter] = useState(props.initialNewsletterOptIn)
  const [whatsapp, setWhatsapp] = useState(props.initialWhatsappOptIn)
  
  const [businessOptIn, setBusinessOptIn] = useState(props.initialBusinessOptIn)
  const [businessType, setBusinessType] = useState(props.initialBusinessType)
  const [businessName, setBusinessName] = useState(props.initialBusinessName)
  const [businessContact, setBusinessContact] = useState(props.initialBusinessContact)
  const [businessWebsite, setBusinessWebsite] = useState(props.initialBusinessWebsite)
  const [businessDescription, setBusinessDescription] = useState(props.initialBusinessDescription)
  const [title, setTitle] = useState(props.initialTitle)
  const [address, setAddress] = useState(props.initialAddress)
  const [town, setTown] = useState(props.initialTown)
  const [postcode, setPostcode] = useState(props.initialPostcode)

  const [professionOther, setProfessionOther] = useState('')
  const [functionalOther, setFunctionalOther] = useState('')

  const isProfessionOther = props.initialProfession && !['Accounting/Finance', 'Administrative/Clerical', 'Business/Management', 'Construction/Trades', 'Creative/Design/Media', 'Education/Teaching', 'Engineering', 'Healthcare/Medicine', 'IT/Technology/Software', 'Legal', 'Logistics/Transport', 'Marketing/Sales', 'Public Service/Non-Profit', 'Retail/Wholesale', 'Student', 'Retired', 'Unemployed'].includes(props.initialProfession)
  const isFunctionalOther = props.initialFunctionalPosition && !['Executive/Leadership', 'Management', 'Professional/Specialist', 'Technical/Operations', 'Support/Administrative', 'Self-Employed/Freelance', 'Apprentice/Trainee'].includes(props.initialFunctionalPosition)

  useEffect(() => {
    if (isProfessionOther) {
      setProfession('Other')
      setProfessionOther(props.initialProfession || '')
    }
    if (isFunctionalOther) {
      setFunctionalPosition('Other')
      setFunctionalOther(props.initialFunctionalPosition || '')
    }
  }, [isProfessionOther, isFunctionalOther, props.initialProfession, props.initialFunctionalPosition])

  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const result = await updateUserSettings({
        phone,
        profession: profession === 'Other' ? professionOther : profession,
        position,
        newsletter_opt_in: newsletter,
        whatsapp_opt_in: whatsapp,
        business_opt_in: businessOptIn,
        business_type: businessType,
        business_name: businessName,
        business_website: businessWebsite,
        business_contact: businessContact,
        business_description: businessDescription,
        functional_position: functionalPosition === 'Other' ? functionalOther : functionalPosition,
        title,
        address,
        town,
        postcode,
      })
      if (result.success) {
        setSuccessMsg('Preferences updated successfully.')
        router.refresh()
        setTimeout(() => setSuccessMsg(''), 5000)
      } else {
        setErrorMsg(result.error || 'Failed to save changes')
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6 pb-20">
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
            <input type="email" disabled value={props.initialEmail} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Display Name</label>
            <input type="text" disabled value={`${props.initialFirstName} ${props.initialLastName}`.trim() || 'Not set'} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Title</label>
            <select 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            >
              <option value="">Select Title</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Miss">Miss</option>
              <option value="Dr">Dr</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Street Address</label>
            <input 
              type="text" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Town / City</label>
            <input 
              type="text" 
              value={town} 
              onChange={e => setTown(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Postcode</label>
            <input 
              type="text" 
              value={postcode} 
              onChange={e => setPostcode(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" 
            />
          </div>
        </div>
      </div>

      {/* Professional & Contact Details */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Contact & Professional Details</h2>
              <p className="text-sm text-slate-500">Update your phone number and occupation</p>
            </div>
          </div>
        </div>
        <div className="p-8 grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Profession</label>
            <select 
              value={profession} 
              onChange={e => setProfession(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            >
              <option value="">Select profession</option>
              <option value="Accounting/Finance">Accounting/Finance</option>
              <option value="Administrative/Clerical">Administrative/Clerical</option>
              <option value="Business/Management">Business/Management</option>
              <option value="Construction/Trades">Construction/Trades</option>
              <option value="Creative/Design/Media">Creative/Design/Media</option>
              <option value="Education/Teaching">Education/Teaching</option>
              <option value="Engineering">Engineering</option>
              <option value="Healthcare/Medicine">Healthcare/Medicine</option>
              <option value="IT/Technology/Software">IT/Technology/Software</option>
              <option value="Legal">Legal</option>
              <option value="Logistics/Transport">Logistics/Transport</option>
              <option value="Marketing/Sales">Marketing/Sales</option>
              <option value="Public Service/Non-Profit">Public Service/Non-Profit</option>
              <option value="Retail/Wholesale">Retail/Wholesale</option>
              <option value="Student">Student</option>
              <option value="Retired">Retired</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Other">Other...</option>
            </select>
            {profession === 'Other' && (
              <input 
                type="text"
                placeholder="Please specify profession"
                value={professionOther}
                onChange={e => setProfessionOther(e.target.value)}
                className="w-full mt-2 px-4 py-2 border-2 border-brand-100 rounded-xl outline-none focus:border-brand-500 transition-all font-medium text-sm"
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Position / Job Title</label>
            <input type="text" value={position} onChange={e => setPosition(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Functional Area (Business/Profession)</label>
            <select 
              value={functionalPosition} 
              onChange={e => setFunctionalPosition(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            >
              <option value="">Select area</option>
              <option value="Executive/Leadership">Executive/Leadership</option>
              <option value="Management">Management</option>
              <option value="Professional/Specialist">Professional/Specialist</option>
              <option value="Technical/Operations">Technical/Operations</option>
              <option value="Support/Administrative">Support/Administrative</option>
              <option value="Self-Employed/Freelance">Self-Employed/Freelance</option>
              <option value="Apprentice/Trainee">Apprentice/Trainee</option>
              <option value="Other">Other...</option>
            </select>
            {functionalPosition === 'Other' && (
              <input 
                type="text"
                placeholder="Please specify area"
                value={functionalOther}
                onChange={e => setFunctionalOther(e.target.value)}
                className="w-full mt-2 px-4 py-2 border-2 border-brand-100 rounded-xl outline-none focus:border-brand-500 transition-all font-medium text-sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Business Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Business Directory</h2>
              <p className="text-sm text-slate-500">Optionally promote your business to the membership network</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6 flex flex-col">
            <label className={`block bg-white p-6 rounded-2xl border ${businessOptIn ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200'} shadow-sm flex items-start gap-4 hover:border-brand-300 transition-colors cursor-pointer group`}>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">List my business on the EEIS Notice Board</h3>
                <p className="text-sm text-slate-500 mt-1">Allow other members to discover your services.</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 mt-1 accent-brand-600 outline-none ring-0 border-slate-300 rounded"
                checked={businessOptIn}
                onChange={(e) => setBusinessOptIn(e.target.checked)}
              />
            </label>

            {businessOptIn && (
              <div className="grid sm:grid-cols-2 gap-6 pt-4 animate-fade-in-up">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Business Type</label>
                    <input type="text" placeholder="e.g. Accounting, Plumber, Resturant" value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Business Name</label>
                    <input type="text" placeholder="Your Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Business Contact Email / Phone</label>
                    <input type="text" placeholder="How customers can reach you" value={businessContact} onChange={e => setBusinessContact(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Business Website (Optional)</label>
                    <input type="url" placeholder="https://..." value={businessWebsite} onChange={e => setBusinessWebsite(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Business Description</label>
                    <textarea 
                        rows={3}
                        placeholder="Describe your products or services..." 
                        value={businessDescription} 
                        onChange={e => setBusinessDescription(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" 
                    />
                  </div>
              </div>
            )}
        </div>
      </div>

      {/* Communications */}
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
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-fade-in-up">
            <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {successMsg && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200 flex items-center gap-2 animate-fade-in-up">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {successMsg}
          </div>
      )}

      {/* Save Button (Fixed to bottom right or normal flow) */}
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

