'use client'

import { useState, useEffect } from 'react'
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
        title: string
        address: string
        town: string
        postcode: string
    }
}

export default function EditDetailsModal({ isOpen, onClose, initialData }: EditDetailsModalProps) {
    const [phone, setPhone] = useState(initialData.phone)
    const [profession, setProfession] = useState(initialData.profession)
    const [position, setPosition] = useState(initialData.position)
    const [functionalPosition, setFunctionalPosition] = useState(initialData.functional_position)
    const [title, setTitle] = useState(initialData.title || '')
    const [address, setAddress] = useState(initialData.address || '')
    const [town, setTown] = useState(initialData.town || '')
    const [postcode, setPostcode] = useState(initialData.postcode || '')
    
    // Business fields
    const [businessOptIn, setBusinessOptIn] = useState(initialData.business_opt_in)
    const [businessName, setBusinessName] = useState(initialData.business_name)
    const [businessType, setBusinessType] = useState(initialData.business_type)
    const [businessWebsite, setBusinessWebsite] = useState(initialData.business_website)
    const [businessContact, setBusinessContact] = useState(initialData.business_contact)
    const [businessDescription, setBusinessDescription] = useState(initialData.business_description)

    const [professionOther, setProfessionOther] = useState('')
    const [functionalOther, setFunctionalOther] = useState('')

    const isProfessionOther = initialData.profession && !['Accounting/Finance', 'Administrative/Clerical', 'Business/Management', 'Construction/Trades', 'Creative/Design/Media', 'Education/Teaching', 'Engineering', 'Healthcare/Medicine', 'IT/Technology/Software', 'Legal', 'Logistics/Transport', 'Marketing/Sales', 'Public Service/Non-Profit', 'Retail/Wholesale', 'Student', 'Retired', 'Unemployed'].includes(initialData.profession)
    const isFunctionalOther = initialData.functional_position && !['Executive/Leadership', 'Management', 'Professional/Specialist', 'Technical/Operations', 'Support/Administrative', 'Self-Employed/Freelance', 'Apprentice/Trainee'].includes(initialData.functional_position)

    useEffect(() => {
        if (isProfessionOther) {
            setProfession('Other')
            setProfessionOther(initialData.profession || '')
        }
        if (isFunctionalOther) {
            setFunctionalPosition('Other')
            setFunctionalOther(initialData.functional_position || '')
        }
    }, [isProfessionOther, isFunctionalOther, initialData.profession, initialData.functional_position])

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
                profession: profession === 'Other' ? professionOther : profession,
                position,
                functional_position: functionalPosition === 'Other' ? functionalOther : functionalPosition,
                business_opt_in: businessOptIn,
                business_name: businessName,
                business_type: businessType,
                business_website: businessWebsite,
                business_contact: businessContact,
                business_description: businessDescription,
                title,
                address,
                town,
                postcode
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
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Title
                            </label>
                            <select 
                                value={title} 
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                            >
                                <option value="">Select Title</option>
                                <option value="Mr">Mr</option>
                                <option value="Mrs">Mrs</option>
                                <option value="Ms">Ms</option>
                                <option value="Miss">Miss</option>
                                <option value="Dr">Dr</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Street Address
                            </label>
                            <input 
                                type="text" 
                                value={address} 
                                onChange={e => setAddress(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="123 Example St"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Town / City
                            </label>
                            <input 
                                type="text" 
                                value={town} 
                                onChange={e => setTown(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="Epsom"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Postcode
                            </label>
                            <input 
                                type="text" 
                                value={postcode} 
                                onChange={e => setPostcode(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="KT11..."
                            />
                        </div>

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
                            <select 
                                value={profession} 
                                onChange={e => setProfession(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
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
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-brand-500" />
                                Functional Area
                            </label>
                            <select 
                                value={functionalPosition} 
                                onChange={e => setFunctionalPosition(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
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
