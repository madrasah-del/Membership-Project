'use client'

import { useState } from 'react'
import { Plus, Users, UserPlus2, Mail, Phone, Briefcase, Trash2, Loader2, ChevronDown, ChevronUp, UserCircle2 } from 'lucide-react'
import { updateUserSettings } from '@/app/dashboard/settings/actions'

interface HouseholdMembersProps {
    dependents: any[]
    currentSettings: any
}

export default function HouseholdMembers({ dependents = [], currentSettings }: HouseholdMembersProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [expandedMember, setExpandedMember] = useState<number | null>(null)
    
    const [newMember, setNewMember] = useState({
        first_name: '',
        last_name: '',
        relationship: '',
        email: '',
        phone: '',
        profession: '',
        functional_position: ''
    })

    const handleAddDependent = async () => {
        if (!newMember.first_name || !newMember.last_name) return
        
        setIsSaving(true)
        try {
            const updatedDependents = [...dependents, newMember]
            const result = await updateUserSettings({
                ...currentSettings,
                dependents: updatedDependents
            })

            if (result.success) {
                window.location.reload()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemoveDependent = async (index: number) => {
        if (!confirm('Are you sure you want to remove this household member?')) return
        
        setIsSaving(true)
        try {
            const updatedDependents = dependents.filter((_, i) => i !== index)
            const result = await updateUserSettings({
                ...currentSettings,
                dependents: updatedDependents
            })

            if (result.success) {
                window.location.reload()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-2xl font-black text-slate-900">Household Members</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {dependents.length} Registered Dependents
                    </p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                    {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Member</>}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white rounded-[2rem] border-2 border-brand-100 p-8 shadow-xl shadow-brand-600/5 animate-scale-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                            <input 
                                type="text" 
                                value={newMember.first_name} 
                                onChange={e => setNewMember({...newMember, first_name: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="Required"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                            <input 
                                type="text" 
                                value={newMember.last_name} 
                                onChange={e => setNewMember({...newMember, last_name: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="Required"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Relationship</label>
                            <select 
                                value={newMember.relationship} 
                                onChange={e => setNewMember({...newMember, relationship: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                            >
                                <option value="">Select...</option>
                                <option value="spouse">Spouse</option>
                                <option value="child">Child</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input 
                                type="email" 
                                value={newMember.email} 
                                onChange={e => setNewMember({...newMember, email: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                            <input 
                                type="tel" 
                                value={newMember.phone} 
                                onChange={e => setNewMember({...newMember, phone: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Profession</label>
                            <input 
                                type="text" 
                                value={newMember.profession} 
                                onChange={e => setNewMember({...newMember, profession: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                                placeholder="Optional"
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex gap-4">
                        <button 
                            onClick={handleAddDependent}
                            disabled={isSaving || !newMember.first_name || !newMember.last_name}
                            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-brand-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus2 className="w-5 h-5" />}
                            Confirm Member
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dependents.length === 0 ? (
                    <div className="md:col-span-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                            <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-600">No household members added</h4>
                        <p className="text-slate-400 mt-2 max-w-sm mx-auto">Add your spouse or children to include them in your society membership.</p>
                        <button onClick={() => setIsAdding(true)} className="mt-6 text-brand-600 font-black uppercase tracking-widest text-[10px] hover:bg-brand-50 px-4 py-2 rounded-lg transition-all">Add First Member</button>
                    </div>
                ) : (
                    dependents.map((member, index) => (
                        <div 
                            key={index} 
                            onClick={() => setExpandedMember(expandedMember === index ? null : index)}
                            className={`bg-white rounded-[2rem] border transition-all cursor-pointer group overflow-hidden animate-fade-in-up
                                ${expandedMember === index ? 'border-brand-500 ring-4 ring-brand-500/5 shadow-2xl' : 'border-slate-200 hover:border-brand-300 hover:shadow-xl'}`} 
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                                        ${expandedMember === index ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-brand-600'}`}>
                                        <UserCircle2 className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-black text-slate-900 truncate">{member.first_name} {member.last_name}</p>
                                        <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{member.relationship}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveDependent(index);
                                            }}
                                            className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {expandedMember === index ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                        <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                                        <span className="truncate">{member.email || 'No email provided'}</span>
                                    </div>
                                    
                                    {expandedMember === index && (
                                        <div className="pt-2 space-y-3 border-t border-slate-50 mt-2 animate-fade-in">
                                            {member.phone && (
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                                    <Phone className="w-4 h-4 text-slate-300 shrink-0" />
                                                    <span>{member.phone}</span>
                                                </div>
                                            )}
                                            {member.profession && (
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                                    <Briefcase className="w-4 h-4 text-brand-300 shrink-0" />
                                                    <span>{member.profession}</span>
                                                </div>
                                            )}
                                            {member.functional_position && (
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 pl-7">
                                                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                        {member.functional_position}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md
                                    ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {member.status || 'Active Member'}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Click for details</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
