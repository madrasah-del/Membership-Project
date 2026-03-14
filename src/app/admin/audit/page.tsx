import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, Mail } from 'lucide-react'
import { generateAuditToken } from './actions'

export default async function AdminAuditPage() {
    const supabase = await createClient()

    // Fetch all memberships with their latest audit status
    const { data: audits, error } = await supabase
        .from('annual_audits')
        .select(`
            *,
            memberships (first_name, last_name, email:user_id (email))
        `)
        .order('requested_at', { ascending: false })

    // If we want to show members who NEED an audit, we can cross-reference memberships without an audit this year.
    // For simplicity, we'll list the active memberships and their audit status for the current year.
    const currentYear = new Date().getFullYear()

    const { data: memberships } = await supabase
        .from('memberships')
        .select(`
            id, first_name, last_name, status,
            profiles:user_id (email)
        `)
        .eq('status', 'active')

    // Find audits for current year
    const yearAudits = audits?.filter(a => a.year === currentYear) || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Annual Details Audit ({currentYear})</h1>
                    <p className="text-slate-500 mt-1">Manage automated requests for members to confirm their details.</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Audit Status</th>
                                <th className="px-6 py-4">Magic Link Target</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {memberships?.map((member) => {
                                const audit = yearAudits.find(a => a.membership_id === member.id)
                                const emailStr = Array.isArray(member.profiles) ? (member.profiles[0] as Record<string, unknown>)?.email as string : (member.profiles as Record<string, unknown>)?.email as string

                                return (
                                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {member.first_name} {member.last_name}
                                        </td>
                                        <td className="px-6 py-4">{emailStr}</td>
                                        <td className="px-6 py-4">
                                            {!audit ? (
                                                <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Not Requested</span>
                                            ) : audit.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {audit ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={`/audit/${audit.token}`}
                                                        className="w-48 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-500 truncate"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!audit ? (
                                                <form action={generateAuditToken}>
                                                    <input type="hidden" name="membershipId" value={member.id} />
                                                    <input type="hidden" name="year" value={currentYear} />
                                                    <button type="submit" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors">
                                                        <Mail className="w-3.5 h-3.5" /> Request Audit
                                                    </button>
                                                </form>
                                            ) : (
                                                <button disabled className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium cursor-not-allowed">
                                                    Requested
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}

                            {(!memberships || memberships.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No active members found.
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
