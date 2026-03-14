'use client'

import { useState } from 'react'
import { X, Save, Loader2, Phone, Briefcase, Store } from 'lucide-react'
import { updateUserSettings } from '@/app/dashboard/settings/actions'

interface EditDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    initialData: {
        phone: string
        profession: string
        position: string
        functional_position: string
        newsletter_opt_in: boolean
        whatsapp_opt_in: boolean
        business_opt_in: boolean
        business_type: string
        business_name: string
        business_website: string
        business_contact: string
        business_description: string
    }
}

export default function EditDetailsModal({ isOpen, onClose, initialData }: EditDetailsModalProps) {
    const [phone, setPhone] = useState(initialData.phone)
    const [profession, setProfession] = useState(initialData.profession)
    const [position, setPosition] = useState(initialData.position)
    const [functionalPosition, setFunctionalPosition] = useState(initialData.functional_position)
    
    // Business fields
    const [businessOptIn, setBusinessOptIn] = useState(initialData.business_opt_in)
    const [businessName, setBusinessName] = useState(initialData.business_name)
    const [businessType, setBusinessType] = useState(initialData.business_type)
    const [businessWebsite, setBusinessWebsite] = useState(initialData.business_website)
    const [businessContact, setBusinessContact] = useState(initialData.business_contact)
    const [businessDescription, setBusinessDescription] = useState(initialData.business_description)

    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSave = async () => {
        setIsSaving(true)
        setError('')

        try {
            const result = await updateUserSettings({
                ...initialData,
                phone,
                profession,
                position,
                functional_position: functionalPosition,
                business_opt_in: businessOptIn,
                business_name: businessName,
                business_type: businessType,
                business_website: businessWebsite,
                business_contact: businessContact,
                business_description: businessDescription
            })

            if (result.success) {
                onClose()
                window.location.reload()
            } else {
                setError(result.error || 'Failed to update details')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-white/20">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900">Edit Your Profile</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors font-bold">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 italic">
                            {error}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="w-4 h-4 text-brand-500" />
                                Phone Number
                            </label>
                            <input 
                                type="tel" 
                                value={phone} 
                                onChange={e => setPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="+44..."
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-brand-500" />
                                Profession
                            </label>
                            <input 
                                type="text" 
                                value={profession} 
                                onChange={e => setProfession(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="e.g. Doctor"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-brand-500" />
                                Functional Area
                            </label>
                            <input 
                                type="text" 
                                value={functionalPosition} 
                                onChange={e => setFunctionalPosition(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="e.g. Engineering"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-brand-500" />
                                Job Title
                            </label>
                            <input 
                                type="text" 
                                value={position} 
                                onChange={e => setPosition(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="e.g. Senior Consultant"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Store className="w-5 h-5 text-brand-600" />
                                Business Listing
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Visible in Directory</span>
                                <input 
                                    type="checkbox" 
                                    checked={businessOptIn} 
                                    onChange={e => setBusinessOptIn(e.target.checked)}
                                    className="w-5 h-5 accent-brand-600 rounded-md cursor-pointer"
                                />
                            </div>
                        </div>
                        
                        {businessOptIn ? (
                            <div className="space-y-4 animate-fade-in-up">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Name</label>
                                        <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="e.g. Speedy Taxis" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Type</label>
                                        <input type="text" value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="e.g. Taxi Firm, Restaurant" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website / Contact Info</label>
                                    <input type="text" value={businessWebsite} onChange={e => setBusinessWebsite(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="https://..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Description</label>
                                    <textarea 
                                        value={businessDescription} 
                                        onChange={e => setBusinessDescription(e.target.value)} 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium min-h-[80px] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" 
                                        placeholder="Describe your services to the community..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-500 font-medium italic">
                                Enable business listing to showcase your business to other society members on the notice board.
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 px-4 rounded-2xl font-black text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 uppercase tracking-widest text-xs"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
