import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PaymentCompletion from '@/components/dashboard/PaymentCompletion'

export default async function DashboardPaymentPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch pending payment for this user
    const { data: membership } = await supabase
        .from('memberships')
        .select(`
            id,
            first_name,
            last_name,
            payments!inner (
                id,
                amount,
                status,
                payment_method
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending_payment')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (!membership) {
        // No pending payment
        return (
            <div className="max-w-2xl mx-auto py-12 px-6 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-6">
                    <CreditCard className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">No Pending Payments</h1>
                <p className="text-slate-500 mb-8">You don't have any outstanding membership payments at this time.</p>
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            <PaymentCompletion membership={membership as any} />
        </div>
    )
}
