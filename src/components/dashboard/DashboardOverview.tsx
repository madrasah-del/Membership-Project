'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Save, Users, Briefcase, Phone, Mail, Store, ArrowRight, UserCircle2, Landmark, ShieldCheck, MapPin, CreditCard } from 'lucide-react'
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
                {/* Status/Payment Alert Banner */}
                {membership.status !== 'active' && (
                    <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center gap-8 group animate-scale-in
                        ${(membership.status === 'pending_payment' || membership.status === 'pending' || membership.status === 'approved') 
                            ? 'bg-brand-600/5 border-brand-100 border-dashed' 
                            : 'bg-amber-50/50 border-amber-100 border-dashed'}`}>
                        
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-xl border transform group-hover:scale-105 transition-transform duration-500
                            ${(membership.status === 'pending_payment' || membership.status === 'pending' || membership.status === 'approved')
                                ? 'bg-white border-brand-100'
                                : 'bg-white border-amber-100'}`}>
                            {(membership.status === 'pending_payment' || membership.status === 'pending' || membership.status === 'approved') ? (
                                <AlertCircle className="w-10 h-10 text-brand-600 animate-pulse" />
                            ) : (
                                <Clock className="w-10 h-10 text-amber-600" />
                            )}
                        </div>

                        <div className="text-center md:text-left flex-1">
                            {(membership.status === 'pending_payment' || membership.status === 'pending' || membership.status === 'approved') ? (
                                <>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Final Step: Payment Required</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg font-medium mb-6">Your application is approved! Please pay the annual fee to activate your membership.</p>
                                    <Link 
                                        href="/dashboard/payments" 
                                        className="bg-brand-600 hover:bg-brand-700 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-brand-600/30 inline-flex items-center justify-center gap-3 active:scale-95 group/btn text-lg w-full sm:w-auto text-center"
                                    >
                                        PROCEED TO PAYMENT
                                        <ArrowRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Application Under Review</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg font-medium">Our committee is currently reviewing your details. We&apos;ll notify you by email once your application is approved for payment.</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Address Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:border-brand-300 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-brand-50 p-3 rounded-2xl group-hover:bg-brand-100 transition-colors">
                                <Mail className="w-6 h-6 text-brand-600" />
                            </div>
                            <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] font-black text-brand-600 hover:text-white hover:bg-brand-600 border border-brand-200 uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all">Edit Address</button>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Registered Address</h4>
                        <div className="space-y-1">
                            <p className="font-black text-slate-900 leading-tight text-xl">{membership.address || <span className="text-slate-300 italic">No address set</span>}</p>
                            <p className="text-lg font-bold text-slate-500">{membership.town || 'No town set'}</p>
                            <p className="text-sm font-black text-brand-600 tracking-wider uppercase mt-2 inline-block bg-brand-50 px-2 py-1 rounded-md">{membership.postcode || 'No postcode'}</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</p>
                                <p className="text-base font-bold text-slate-700">{membership.phone || 'Not set'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Professional Profile Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                                <Briefcase className="w-6 h-6 text-indigo-600" />
                            </div>
                            <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] font-black text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all">Update Work</button>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Professional Profile</h4>
                        <div className="space-y-2">
                            <p className="text-xl font-black text-slate-900 leading-tight underline decoration-indigo-200 underline-offset-4 decoration-4">{membership.profession || 'Profession not set'}</p>
                            <p className="text-lg font-bold text-slate-500 italic">“{membership.position || 'No job title set'}”</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {membership.functional_position && (
                                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-wider shadow-sm">
                                        {membership.functional_position}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Membership Type</p>
                                <p className="text-base font-bold text-slate-700 capitalize">{membership.membership_type || 'Individual'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Household Members Section */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Household Members</h3>
                            <p className="text-slate-500 font-medium">Linked family members on your account</p>
                        </div>
                    </div>
                    <HouseholdMembers dependents={membership.dependents} currentSettings={currentSettings} />
                </div>
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
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/5 active:scale-95"
                            >
                                Edit Details
                            </button>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center shadow-2xl">
                                <UserCircle2 className="w-10 h-10 text-white" />
                            </div>
                             <div>
                                <p className="text-2xl font-black tracking-tight leading-none">
                                    {membership.title ? `${membership.title} ` : ''}{membership.first_name} {membership.last_name}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <p className="text-brand-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-brand-500/10 w-fit px-2 py-1 rounded">
                                        {membership.status === 'active' ? 'Active Member' : 'Account Pending'}
                                    </p>
                                    <div className="flex items-center gap-1 text-[9px] font-black text-indigo-300 bg-white/5 px-2 py-1 rounded">
                                        <Users className="w-3 h-3" />
                                        {dependentsCount + 1} Member{dependentsCount + 1 !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-2">
                             <div className="space-y-5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                                        Primary Occupation
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-white leading-snug">
                                            {membership.profession || 'Not provided'}
                                        </p>
                                        {(membership.position || membership.functional_position) && (
                                            <p className="text-sm font-medium text-slate-400 italic">
                                                {membership.position || membership.functional_position}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-brand-400" />
                                        Registered Address
                                    </p>
                                    <div className="text-sm font-bold opacity-90 space-y-1 text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-brand-400 mt-1 shrink-0" />
                                            <div>
                                                <p>{membership.address}</p>
                                                <p>{membership.town}</p>
                                                <p className="text-brand-400 font-black tracking-widest uppercase mt-1">{membership.postcode}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(membership.status === 'pending_payment' || membership.status === 'approved' || membership.status === 'pending') && (
                            <Link 
                                href="/dashboard/payments?pay=true"
                                className="group/pay block w-full text-center bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-brand-50 transition-all shadow-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                <CreditCard className="w-4 h-4 text-brand-600 group-hover/pay:scale-110 transition-transform" />
                                Pay Annual Membership Fee
                            </Link>
                        )}
                    </div>
                </div>

                {/* Business Promotion Card */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm overflow-hidden relative group h-full flex flex-col">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-500 transform group-hover:scale-110">
                        <Store className="w-24 h-24" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-brand-50 p-2.5 rounded-xl border border-brand-100 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                                <Store className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                Community Directory
                            </h3>
                        </div>
                        {membership.business_opt_in && (
                             <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Active Listing</span>
                        )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                        {membership.business_opt_in ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xl font-black text-brand-600 tracking-tight leading-tight">{membership.business_name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{membership.business_type}</p>
                                </div>
                                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 italic">
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">"{membership.business_description}"</p>
                                </div>
                                <div className="pt-2">
                                    <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-brand-600 uppercase tracking-widest transition-all hover:gap-2">
                                        Update Directory Listing <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Showcase your local services — like a <strong>Taxi firm, Restaurant, or Professional Practice</strong> — to all society members for free.
                                </p>
                                <div className="pt-2">
                                    <Link href="/dashboard/settings" className="inline-flex items-center gap-3 bg-brand-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95">
                                        Enable Business Listing
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <EditDetailsModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={currentSettings}
            />
        </div>
    );
}
