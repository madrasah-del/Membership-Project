import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get current user session
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch member profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch active membership application if any
    const { data: membership } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    return (
        <>
            <div className="mb-10 animate-fade-in">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome{membership?.first_name ? `, ${membership.first_name}` : ''}
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Manage your EEIS membership and details.</p>
            </div>

            {!membership ? (
                // Registration Prompt State
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center animate-fade-in-up">
                    <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-brand-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Complete Your Application</h2>
                    <p className="text-slate-500 max-w-lg mx-auto mb-8 text-lg">
                        You've successfully created an account, but you haven't filled out a membership application yet.
                    </p>
                    <Link
                        href="/apply"
                        className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-8 rounded-xl shadow-md shadow-brand-600/20 transition-all gap-2 text-lg"
                    >
                        Start Application
                    </Link>
                </div>
            ) : (
                // Active Membership State Overview
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">

                    {/* Status Card */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Membership Status</h2>
                                <p className="text-slate-500 text-sm">Application submitted on {new Date(membership.created_at).toLocaleDateString()}</p>
                            </div>

                            {/* Status Badge */}
                            <div className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-sm
                ${membership.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    membership.status === 'pending_approval' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                        membership.status === 'pending_payment' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                            'bg-slate-50 text-slate-700 border border-slate-200'}`}
                            >
                                {membership.status === 'active' && <CheckCircle2 className="w-4 h-4" />}
                                {membership.status === 'pending_approval' && <Clock className="w-4 h-4" />}
                                {membership.status === 'pending_payment' && <AlertCircle className="w-4 h-4" />}
                                {membership.status === 'active' ? 'Active' :
                                    membership.status === 'pending_approval' ? 'Pending Approval' :
                                        membership.status === 'pending_payment' ? 'Awaiting Payment' :
                                            membership.status}
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 bg-slate-50/50">
                            {membership.status === 'active' ? (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-lg">You are a full member</h3>
                                        <p className="text-slate-600 mt-1 leading-relaxed">Your membership is currently active. You have full access to all EEIS member benefits and the WhatsApp community.</p>
                                    </div>
                                </div>
                            ) : membership.status === 'pending_approval' ? (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-lg">Under Committee Review</h3>
                                        <p className="text-slate-600 mt-1 leading-relaxed">Your application has been received and is waiting for committee approval. Please present yourself to a committee member during the next Friday prayer.</p>
                                    </div>
                                </div>
                            ) : membership.status === 'pending_payment' ? (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-lg">Payment Required</h3>
                                        <p className="text-slate-600 mt-1 leading-relaxed mb-4">Please complete your £10 annual membership payment to proceed with your application.</p>
                                        <Link href="/dashboard/payment" className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm inline-flex items-center gap-2">
                                            Pay Now
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                        <RefreshCw className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-lg">Status Unknown</h3>
                                        <p className="text-slate-600 mt-1 leading-relaxed">Please contact the committee if this persists.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Your Details</h2>

                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-slate-500 mb-1">Name</dt>
                                <dd className="text-slate-900 font-medium">{membership.first_name} {membership.last_name}</dd>
                            </div>
                            <div className="w-full h-px bg-slate-100"></div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500 mb-1">Email</dt>
                                <dd className="text-slate-900">{profile?.email}</dd>
                            </div>
                            <div className="w-full h-px bg-slate-100"></div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500 mb-1">Address</dt>
                                <dd className="text-slate-900 text-sm leading-relaxed">
                                    {membership.address}<br />
                                    {membership.town}<br />
                                    {membership.postcode}
                                </dd>
                            </div>
                        </dl>

                        <Link href="/dashboard/settings" className="mt-8 block w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 py-2.5 rounded-xl transition-colors">
                            Update Details
                        </Link>
                    </div>

                </div>
            )}
        </>
    )
}
