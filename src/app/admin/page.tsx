import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, Search, Filter, MoreVertical, XCircle, Clock } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch all memberships with user emails
    const { data: memberships, error } = await supabase
        .from('memberships')
        .select(`
      *,
      profiles:user_id (email)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching memberships:', error)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
            case 'pending_payment':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Awaiting Payment</span>
            case 'pending_approval':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3.5 h-3.5" /> Awaiting Approval</span>
            case 'rejected':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3.5 h-3.5" /> Rejected</span>
                // Fallback for unknown status
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{status}</span>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">All Members</h1>
                    <p className="text-slate-500 mt-1">Manage society memberships and applications.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4 text-slate-400" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Status</th>
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
                                        {/* Supabase returns joined data as object or array depending on relation */}
                                        <p className="text-slate-900">
                                            {Array.isArray(member.profiles)
                                                ? member.profiles[0]?.email
                                                : (member.profiles as any)?.email}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(member.status)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(member.created_at).toLocaleDateString('en-GB', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {(!memberships || memberships.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No members found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Static for now) */}
                <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between text-sm text-slate-500">
                    <p>Showing <span className="font-medium text-slate-900">{memberships?.length || 0}</span> results</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
