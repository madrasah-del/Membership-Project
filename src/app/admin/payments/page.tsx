import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Search, Filter, Clock, AlertTriangle, TrendingUp, Download, CreditCard, Wallet, Banknote, Activity } from 'lucide-react'
import Link from 'next/link'
import SumUpSyncButton from '@/components/admin/payments/SumUpSyncButton'

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
    const bankVerification = payments?.filter(p => p.payment_method === 'bank_transfer' && p.status === 'pending_verification') || []

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'successful':
                return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm shadow-emerald-500/5"><CheckCircle2 className="w-3 h-3" /> Successful</span>
            case 'pending':
                return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200/50 shadow-sm shadow-amber-500/5"><Clock className="w-3 h-3" /> Pending</span>
            case 'pending_verification':
                return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200/50 shadow-sm shadow-blue-500/5"><AlertTriangle className="w-3 h-3" /> Verifying</span>
            case 'failed':
                return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-200/50">Failed</span>
            default:
                return <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200">{status}</span>
        }
    }

    const totalRevenue = paid.reduce((sum, p) => sum + Number(p.amount), 0)

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 text-slate-900">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Finance Hub</h1>
                    <p className="text-slate-500 text-lg">Comprehensive tracking of membership contributions and subscriptions.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <SumUpSyncButton />
                    <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <Link href="/admin/manual-entry" className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                        Manual Entry
                    </Link>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-200 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-32 h-32" />
                    </div>
                    <div className="relative">
                        <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Total Contributions</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black">£{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="mt-6 flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full w-fit border border-white/20">
                            <Activity className="w-3.5 h-3.5 text-blue-200" />
                            <span className="text-xs font-bold text-blue-50">{paid.length} Successful records</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                            <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Awaiting Funds</p>
                        <p className="text-4xl font-black text-slate-900">{pending.length}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-4 font-medium italic">Follow-up needed for pending checkouts</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                            <Search className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Bank Reconciliation</p>
                        <p className="text-4xl font-black text-slate-900">{bankVerification.length}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-4 font-medium italic">Standing orders requiring manual match</p>
                </div>
            </div>

            {/* Transactions Ledger */}
            <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden outline outline-4 outline-white/50">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Transaction Ledger</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Find payment..." 
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                <th className="px-8 py-4">Beneficiary</th>
                                <th className="px-8 py-4">Volume</th>
                                <th className="px-8 py-4">Modality</th>
                                <th className="px-8 py-4">Interval</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {payments?.map((payment) => {
                                const m = payment.memberships as any
                                const name = m ? `${m.first_name} ${m.last_name}` : 'External / Misc'
                                
                                return (
                                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-900 leading-tight">{name}</p>
                                            {m && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{m.status}</p>}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-slate-300 text-lg font-light leading-none">£</span>
                                                <span className="text-lg font-black text-slate-900 leading-none">{Number(payment.amount).toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                {payment.payment_method === 'sumup' && <CreditCard className="w-4 h-4 text-blue-500" />}
                                                {payment.payment_method === 'bank_transfer' && <Banknote className="w-4 h-4 text-emerald-500" />}
                                                {payment.payment_method === 'cash' && <Wallet className="w-4 h-4 text-amber-500" />}
                                                <span className="capitalize text-slate-700 text-xs font-bold">{payment.payment_method.replace('_', ' ')}</span>
                                            </div>
                                            {payment.collected_by && <p className="text-[10px] text-slate-400 mt-1">Collector: {payment.collected_by}</p>}
                                        </td>
                                        <td className="px-8 py-5">
                                            {payment.is_recurring ? (
                                                <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg w-fit">
                                                    <Activity className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Recurring</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase text-slate-400 px-2.5 py-1 bg-slate-100 rounded-lg">Single</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold">
                                                    {new Date(payment.payment_date).toLocaleDateString('en-GB', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">Processed</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}

                            {(!payments || payments.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                                        No financial history available.
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
