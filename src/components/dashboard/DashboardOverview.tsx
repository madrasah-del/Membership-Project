'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Save, Users, Briefcase, Phone, Mail, Store, ArrowRight, UserCircle2 } from 'lucide-react'
import Link from 'next/link'
import HouseholdMembers from './HouseholdMembers'
import EditDetailsModal from './EditDetailsModal'

interface DashboardOverviewProps {
    membership: any
    profile: any
    currentSettings: any
}

export default function DashboardOverview({ membership, profile, currentSettings }: DashboardOverviewProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    if (!membership) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-brand-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Complete Your Application</h2>
                <p className="text-slate-500 max-w-lg mx-auto mb-8 text-lg">
                    You&apos;ve successfully created an account, but you haven&apos;t filled out a membership application yet.
                </p>
                <Link
                    href="/apply"
                    className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-8 rounded-xl shadow-md shadow-brand-600/20 transition-all gap-2 text-lg"
                >
                    Start Application
                </Link>
            </div>
        )
    }

    const dependentsCount = membership.dependents?.length || 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
                {/* Status Card */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-200 overflow-hidden">
                    <div className="p-8 sm:p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-3xl font-black text-slate-900">Account Status</h2>
                            </div>
                            <p className="text-slate-500 font-bold tracking-tight uppercase text-[10px] bg-slate-200/50 w-fit px-2 py-0.5 rounded-md">
                                MEMBER SINCE {new Date(membership.created_at).getFullYear()} • ID: {membership.id.slice(0, 8)}
                            </p>
                        </div>

                        <div className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2.5 shadow-sm ring-1 ring-inset
                            ${membership.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                            membership.status === 'pending_approval' ? 'bg-amber-50 text-amber-700 ring-amber-200' :
                            (membership.status === 'pending_payment' || membership.status === 'pending') ? 'bg-brand-50 text-brand-700 ring-brand-200' :
                            'bg-slate-50 text-slate-700 ring-slate-200'}`}
                        >
                            {membership.status === 'active' && <CheckCircle2 className="w-4 h-4" />}
                            {membership.status === 'pending_approval' && <Clock className="w-4 h-4" />}
                            {(membership.status === 'pending_payment' || membership.status === 'pending') && <AlertCircle className="w-4 h-4" />}
                            <span className="uppercase tracking-[0.1em]">
                                {membership.status === 'active' ? 'Full Member' :
                                membership.status === 'pending_approval' ? 'Committee Review' :
                                (membership.status === 'pending_payment' || membership.status === 'pending') ? 'Action Required' :
                                membership.status}
                            </span>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10">
                        {membership.status === 'active' ? (
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                                <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center shrink-0 border-2 border-emerald-100 shadow-inner">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                                </div>
                                <div className="text-center sm:text-left pt-2">
                                    <h3 className="text-3xl font-black text-slate-900 mb-3 leading-tight">Welcome Back, {membership.first_name}!</h3>
                                    <p className="text-slate-500 leading-relaxed text-lg font-medium max-w-xl">
                                        Your membership is <strong>fully active</strong>. You now have full access to community elections, voting rights, and special member events.
                                    </p>
                                    <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                            <Save className="w-3.5 h-3.5" />
                                            Voting Eligible
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                                            <Users className="w-3.5 h-3.5" />
                                            {dependentsCount + 1} Household Seats
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (membership.status === 'pending_payment' || membership.status === 'pending') ? (
                            <div className="bg-gradient-to-br from-brand-600/5 to-indigo-600/5 p-8 rounded-[2.5rem] border-2 border-brand-100 border-dashed flex flex-col md:flex-row items-center gap-8 group">
                                <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center shrink-0 shadow-xl border border-brand-100 transform group-hover:scale-105 transition-transform duration-500">
                                    <AlertCircle className="w-12 h-12 text-brand-600 animate-pulse" />
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Membership Payment Required</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg font-medium mb-6">Excellent news! Your application is approved. Please pay the annual fee to activate your benefits.</p>
                                    <Link 
                                        href="/dashboard/payments" 
                                        className="bg-brand-600 hover:bg-brand-700 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-brand-600/30 inline-flex items-center justify-center gap-3 active:scale-95 group/btn text-lg w-full sm:w-auto"
                                    >
                                        PAY MEMBERSHIP FEE
                                        <ArrowRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                                <div className="w-24 h-24 rounded-[2rem] bg-amber-50 flex items-center justify-center shrink-0 border-2 border-amber-100 shadow-inner">
                                    <Clock className="w-12 h-12 text-amber-600" />
                                </div>
                                <div className="text-center sm:text-left pt-2">
                                    <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Verification in Progress</h3>
                                    <p className="text-slate-500 leading-relaxed text-lg font-medium max-w-xl">The committee is currently reviewing your details. We perform due diligence to maintain the integrity of our society members.</p>
                                    <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">Expected completion: 2-3 business days</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <HouseholdMembers dependents={membership.dependents} currentSettings={currentSettings} />
            </div>

            {/* Sidebar Stats & Profile */}
            <div className="space-y-6">
                <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden group">
                    {/* Decorative background blur */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl group-hover:bg-brand-500/30 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-center border-b border-white/10 pb-5">
                            <h2 className="text-xl font-black uppercase tracking-widest italic opacity-80">Profile Card</h2>
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-lg border border-white/5 active:scale-95"
                            >
                                Update Details
                            </button>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center shadow-2xl">
                                <UserCircle2 className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black tracking-tight leading-none">{membership.first_name} {membership.last_name}</p>
                                <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified Member
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 pt-2">
                             <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Briefcase className="w-3 h-3 text-brand-400" />
                                        Career & Occupation
                                    </p>
                                    <p className="text-lg font-bold text-white leading-snug">
                                        {membership.profession || 'Not provided'}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {membership.functional_position && (
                                            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
                                                {membership.functional_position}
                                            </span>
                                        )}
                                        {membership.position && (
                                            <span className="text-[10px] font-bold text-brand-300 bg-brand-500/20 px-2 py-0.5 rounded-md border border-brand-500/30">
                                                {membership.position}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-brand-400" />
                                        Contact Info
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold flex items-center gap-2 opacity-90 truncate">
                                            <Mail className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                            {profile?.email}
                                        </p>
                                        <p className="text-sm font-bold flex items-center gap-2 opacity-90">
                                            <Phone className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                            {membership.phone || 'No phone set'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {membership.business_opt_in && (
                                <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/20 backdrop-blur-sm relative overflow-hidden group/biz">
                                     <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-2 -translate-y-2 group-hover/biz:scale-110 transition-transform">
                                         <Store size={40} />
                                     </div>
                                     <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                                         <Store className="w-3 h-3" />
                                         Business Directory Listing
                                     </p>
                                     <p className="text-xl font-black text-white">{membership.business_name}</p>
                                     <p className="text-xs font-bold text-emerald-200 mt-1 opacity-80">{membership.business_type}</p>
                                     <Link href="/notice-board" className="mt-4 text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                                         View on board
                                         <ArrowRight className="w-3 h-3" />
                                     </Link>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-white/10 mt-6 bg-white/5 -mx-8 px-8 pb-8 rounded-b-[2.5rem]">
                            <div className="flex items-center justify-between pt-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Household</p>
                                    <p className="text-3xl font-black text-white">
                                        {dependentsCount + 1}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Total Members</p>
                                </div>
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                     <Users className="w-9 h-9 text-brand-400 opacity-60" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Helper Card for Business examples the user specifically asked for */}
                {!membership.business_opt_in && (
                    <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 flex items-start gap-4">
                        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                            <Store className="w-6 h-6 text-brand-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Have a local business?</h4>
                            <p className="text-slate-500 text-xs mt-1">List your <strong>taxi firm, restaurant, or dry cleaners</strong> in our community directory to reach more people.</p>
                            <button onClick={() => setIsEditModalOpen(true)} className="text-brand-600 text-xs font-black uppercase tracking-widest mt-3 hover:text-brand-700 transition-colors">Setup Now</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit details modal */}
            <EditDetailsModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                initialData={currentSettings}
            />
        </div>
    )
}
