import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, XCircle, Search, Filter, Clock } from 'lucide-react'
import { ApprovalActions } from '@/components/admin/ApprovalActions'

export default async function PendingApprovalsPage() {
    const supabase = await createClient()

    // Fetch memberships with 'pending_approval' status
    const { data: memberships, error } = await supabase
        .from('memberships')
        .select(`
            *,
            profiles:user_id (email)
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching pending approvals:', error)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
                    <p className="text-slate-500 mt-1">Review and approve membership applications.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4 text-slate-400" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Applied Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {memberships?.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold shrink-0 uppercase">
                                                {member.first_name?.[0] || ''}{member.last_name?.[0] || ''}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{member.first_name} {member.last_name}</p>
                                                <p className="text-xs text-slate-500">{member.town}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-slate-900">
                                            {Array.isArray(member.profiles)
                                                ? member.profiles[0]?.email
                                                : (member.profiles as any)?.email}
                                        </p>
                                        <p className="text-xs text-slate-500">{member.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(member.created_at).toLocaleDateString('en-GB', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                        <div className="text-xs mt-1 text-amber-600 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Awaiting Action
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ApprovalActions membershipId={member.id} />
                                    </td>
                                </tr>
                            ))}

                            {(!memberships || memberships.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3" />
                                            <p className="font-medium text-slate-900">All caught up!</p>
                                            <p className="text-sm mt-1">There are no pending applications to review.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
