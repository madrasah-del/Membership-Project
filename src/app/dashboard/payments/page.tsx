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

    // Get membership ID
    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .single()

    const { payments, error } = await getMemberPayments()

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <p>Error loading payments: {error}</p>
            </div>
        )
    }

    // Check if the user has an active recurring payment
    // A subscription is active if any payment record is marked as recurring
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
            />
        </div>
    )
}
