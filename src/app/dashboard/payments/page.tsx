import { getMemberPayments, getActivePaymentInstrument } from './actions'
import PaymentsPage from './PaymentsPage'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
    title: 'Payments & Subscriptions - EEIS Membership',
}

export default async function Page() {
    const supabase = await createClient()

    // Ensure user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Get membership ID and dependent count
    const { data: membership } = await supabase
        .from('memberships')
        .select('id, dependents, status')
        .eq('user_id', user.id)
        .single()

    // Fetch the dynamic minimum fee setting
    const { data: feeSetting } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'min_membership_fee')
        .single()

    const baseFee = feeSetting ? Number(feeSetting.setting_value) : 10.00
    const dependentCount = (membership?.dependents as any[])?.length || 0

    const { payments, error } = await getMemberPayments()

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <p>Error loading payments: {error}</p>
            </div>
        )
    }

    // Check if the user has an active recurring payment
    const hasActiveSubscription = (payments || []).some(p => p.is_recurring)

    let activeInstrument = null
    if (membership?.id && hasActiveSubscription) {
        const result = await getActivePaymentInstrument(membership.id)
        activeInstrument = result.instrument || null
    }

    return (
        <div className="w-full">
            <PaymentsPage
                initialPayments={payments || []}
                hasActiveSubscription={hasActiveSubscription}
                membershipId={membership?.id || null}
                activeInstrument={activeInstrument}
                membershipStatus={membership?.status}
                baseFee={baseFee}
                dependentCount={dependentCount}
            />
        </div>
    )
}
