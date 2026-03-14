import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, User, Phone, MapPin, Mail, Calendar, Briefcase, Users, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { ApprovalActions } from '@/components/admin/ApprovalActions'

export default async function MemberDetailsPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: member, error } = await supabase
        .from('memberships')
        .select(`
            *,
            profiles:user_id (email, role),
            payments (*)
        `)
        .eq('id', params.id)
        .single()

    if (error || !member) {
        return notFound()
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link 
                    href="/admin" 
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all hover:border-slate-300"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Member Details</h1>
                    <p className="text-slate-500">Full application profile for {member.first_name} {member.last_name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Profile Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-3xl font-black uppercase shadow-xl shadow-slate-900/20">
                                {member.first_name?.[0]}{member.last_name?.[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{member.title} {member.first_name} {member.last_name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                                        member.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                        member.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {member.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-slate-300 text-xs">•</span>
                                    <span className="text-slate-500 text-sm font-medium">Joined {new Date(member.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                        <p className="text-slate-900 font-bold">{(member.profiles as any)?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Number</p>
                                        <p className="text-slate-900 font-bold">{member.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                                        <p className="text-slate-900 font-bold">{new Date(member.date_of_birth).toLocaleDateString()} (Age: {new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()})</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Residential Address</p>
                                        <p className="text-slate-900 font-bold leading-relaxed">
                                            {member.address}<br />
                                            {member.town}, {member.postcode}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Briefcase className="w-5 h-5 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Professional Status</p>
                                        <p className="text-slate-900 font-bold">{member.profession}</p>
                                        <p className="text-slate-500 text-sm">{member.position} ({member.functional_position})</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dependents Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-6 h-6 text-brand-600" />
                            <h3 className="text-xl font-bold text-slate-900">Spouse & Dependents</h3>
                        </div>
                        
                        {!member.dependents || member.dependents.length === 0 ? (
                            <p className="text-slate-500 italic p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">No dependents listed in this application.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(member.dependents as any[]).map((dep, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="font-bold text-slate-900">{dep.name}</p>
                                        <p className="text-sm text-slate-500">{dep.relation}</p>
                                        {dep.email && <p className="text-xs text-slate-400 mt-1">{dep.email}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Status & Actions Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" />
                            Administrative Actions
                        </h3>
                        
                        {member.status === 'pending_approval' ? (
                            <div className="space-y-6">
                                <p className="text-slate-400 text-sm leading-relaxed"> This application is currently awaiting review. Please verify the documents and payment status before proceeding.</p>
                                <ApprovalActions membershipId={member.id} />
                            </div>
                        ) : member.status === 'active' ? (
                            <div className="p-4 bg-white/10 rounded-2xl flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                <div>
                                    <p className="font-bold">Active Member</p>
                                    <p className="text-xs text-slate-400">Verified & Approved</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 italic text-sm">Application is currently in {member.status.replace('_', ' ')} state.</p>
                        )}

                        <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Application ID</span>
                                <span className="font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded uppercase">{member.id.split('-')[0]}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Gift Aid Declaration</span>
                                <span className={member.has_gift_aid_declaration ? 'text-emerald-400' : 'text-slate-500'}>
                                    {member.has_gift_aid_declaration ? 'Active' : 'None'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="w-6 h-6 text-slate-400" />
                            <h3 className="text-lg font-bold text-slate-900">Recent Payments</h3>
                        </div>

                        <div className="space-y-4">
                            {!member.payments || member.payments.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No payment records found.</p>
                            ) : (
                                (member.payments as any[]).map((p, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">£{p.amount.toFixed(2)}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{p.payment_method?.replace('_', ' ')} • {new Date(p.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                                            p.status === 'successful' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
