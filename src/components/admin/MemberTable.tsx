'use client'

import { useState } from 'react'
import { CheckCircle2, Search, Filter, XCircle, Clock, Users } from 'lucide-react'
import Link from 'next/link'

interface Member {
    id: string
    first_name: string
    last_name: string
    title?: string
    profession?: string
    status: string
    town: string
    postcode: string
    photo_url?: string
    created_at: string
    profiles: Record<string, unknown> | Array<Record<string, unknown>>
}

interface Props {
    memberships: Member[]
}

export default function MemberTable({ memberships }: Props) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredMembers = memberships.filter(member => {
        const fullSearch = `${member.first_name} ${member.last_name} ${member.town} ${member.postcode} ${member.status}`.toLowerCase()
        return fullSearch.includes(searchTerm.toLowerCase())
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm shadow-emerald-500/10"><CheckCircle2 className="w-3 h-3" /> Active</span>
            case 'pending_payment':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/50 shadow-sm shadow-amber-500/10"><Clock className="w-3 h-3" /> Unpaid</span>
            case 'pending_approval':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/50 shadow-sm shadow-blue-500/10"><Clock className="w-3 h-3" /> Reviewing</span>
            case 'rejected':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/50 shadow-sm shadow-red-500/10"><XCircle className="w-3 h-3" /> Rejected</span>
            default:
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">{status}</span>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Member Directory</h1>
                    <p className="text-slate-500 text-lg">Real-time overview of the EEIS society membership base.</p>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none lg:min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search members..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden outline outline-4 outline-white/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                <th className="px-8 py-5">Full Profile</th>
                                <th className="px-8 py-5">Contact Vector</th>
                                <th className="px-8 py-5">Current Status</th>
                                <th className="px-8 py-5">Onboarding Date</th>
                                <th className="px-8 py-5 text-right">Utility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            {member.photo_url ? (
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md ring-2 ring-white ring-offset-2 ring-offset-slate-50">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={member.photo_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-lg shadow-inner ring-2 ring-white group-hover:scale-105 transition-transform">
                                                    {member.first_name?.[0]}{member.last_name?.[0]}
                                                </div>
                                            )}
                                             <div>
                                                <Link 
                                                    href={`/admin/members/${member.id}`}
                                                    className="font-bold text-slate-900 text-base leading-tight group-hover:text-brand-600 transition-colors"
                                                >
                                                    {member.title ? `${member.title} ` : ''}{member.first_name} {member.last_name}
                                                </Link>
                                                <p className="text-xs text-slate-400 mt-0.5">{member.profession || 'No profession listed'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-slate-700 font-medium">
                                            {Array.isArray(member.profiles)
                                                ? (member.profiles[0] as Record<string, unknown>)?.email as string
                                                : (member.profiles as Record<string, unknown>)?.email as string}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1">{member.town}, {member.postcode}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        {getStatusBadge(member.status)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">
                                                {new Date(member.created_at).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Joined</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Link 
                                            href={`/admin/members/${member.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all text-xs font-bold"
                                        >
                                            View Profile
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Users className="w-12 h-12 text-slate-200" />
                                            <p className="text-slate-400 font-medium">No members found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-slate-50/30 border-t border-slate-100 p-6 flex items-center justify-between">
                    <p className="text-sm text-slate-500 font-medium">
                        Displaying <span className="text-slate-900 font-bold">{filteredMembers.length}</span> results
                    </p>
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed">Previous</button>
                        <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">Next Page</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
