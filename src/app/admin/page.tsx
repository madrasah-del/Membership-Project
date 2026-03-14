import { createClient } from '@/lib/supabase/server'
import { Users, UserPlus, CreditCard, Activity } from 'lucide-react'
import MemberTable from '@/components/admin/MemberTable'

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

    // Calculate Stats
    const totalMembers = memberships?.length || 0
    const pendingApprovals = memberships?.filter(m => m.status === 'pending_approval').length || 0
    const awaitingPayments = memberships?.filter(m => m.status === 'pending_payment').length || 0
    const activeMembers = memberships?.filter(m => m.status === 'active').length || 0

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Base', value: totalMembers, icon: Users, color: 'blue' },
                    { label: 'Pending Approval', value: pendingApprovals, icon: UserPlus, color: 'indigo' },
                    { label: 'Awaiting Payment', value: awaitingPayments, icon: CreditCard, color: 'amber' },
                    { label: 'Active Members', value: activeMembers, icon: Activity, color: 'emerald' },
                ].map((stat) => (
                    <div key={stat.label} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-brand-500/10 hover:border-brand-200 transition-all duration-500">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${
                                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                                'bg-emerald-50 text-emerald-600'
                            } group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-slate-900">{stat.value}</span>
                            <span className="text-slate-400 font-medium mb-1">profiles</span>
                        </div>
                    </div>
                ))}
            </div>

            <MemberTable memberships={memberships || []} />
        </div>
    )
}
