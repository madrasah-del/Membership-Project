import { createClient } from '@/lib/supabase/server'
import MemberTable from '@/components/admin/MemberTable'
import { Users } from 'lucide-react'

export default async function AdminMembersPage() {
    const supabase = await createClient()
    
    const { data: members, error } = await supabase
        .from('memberships')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Member Directory</h1>
                    </div>
                    <p className="text-slate-500">Manage, filter, and review all EEIS registered members.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <MemberTable memberships={members || []} />
            </div>
        </div>
    )
}
