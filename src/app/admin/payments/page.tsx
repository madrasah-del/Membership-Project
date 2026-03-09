import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Search, Filter, Clock, AlertTriangle } from 'lucide-react'

export default async function PaymentsDashboard() {
    const supabase = await createClient()

    // Fetch payments joined with membership info
    const { data: payments, error } = await supabase
        .from('payments')
        .select(`
            *,
            memberships:membership_id (
                first_name,
                last_name,
                status
            )
        `)
        .order('payment_date', { ascending: false })

    if (error) {
        console.error('Error fetching payments:', error)
    }

    // Separate payments into categories
    const paid = payments?.filter(p => p.status === 'successful') || []
    const pending = payments?.filter(p => p.status === 'pending' || p.status === 'pending_verification') || []

    // "Unknown" origins are payments that might be successful but lack clear metadata (e.g., bank transfers without matched names, which we'll handle in reconciliation)
    // For now, let's categorize pending bank transfers as needing verification/unknown.
    const unknownOrigins = payments?.filter(p => p.payment_method === 'bank_transfer' && p.status === 'pending_verification') || []


    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'successful':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Successful</span>
            case 'pending':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>
            case 'pending_verification':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><AlertTriangle className="w-3.5 h-3.5" /> Needs Verification</span>
            case 'failed':
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">Failed</span>
            default:
                return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{status}</span>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Payments & Finance</h1>
                    <p className="text-slate-500 mt-1">Track membership fees, subscriptions, and standing orders.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4 text-slate-400" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Paid (This Month)</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-slate-900">£{paid.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}</p>
                        <span className="text-sm font-medium text-emerald-600">+{paid.length} members</span>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Awaiting Payment</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
                        <span className="text-sm font-medium text-slate-500">members</span>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Unknown standing orders</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-blue-600">{unknownOrigins.length}</p>
                        <span className="text-sm font-medium text-slate-500">need reconciliation</span>
                    </div>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50/50 p-4">
                    <h2 className="font-semibold text-slate-800">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Member Name</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payments?.map((payment) => {
                                const memberName = payment.memberships ?
                                    `${(payment.memberships as any).first_name} ${(payment.memberships as any).last_name}` :
                                    'Unknown/Manual';

                                return (
                                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {memberName}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            £{Number(payment.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize">{payment.payment_method.replace('_', ' ')}</span>
                                            {payment.collected_by && (
                                                <span className="block text-xs text-slate-400 mt-0.5">via {payment.collected_by}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.is_recurring ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">Ongoing</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">One-off</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(payment.payment_date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                )
                            })}

                            {(!payments || payments.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No payments recorded yet.
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
