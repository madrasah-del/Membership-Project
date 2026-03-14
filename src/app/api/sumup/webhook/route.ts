import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * SumUp Webhook Handler
 * 
 * SumUp sends webhooks for checkout status changes.
 * This ensures that even if a user closes the browser before our frontend
 * redirects, the payment is still recorded as successful.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        
        // SumUp Webhook Payload usually contains:
        // {
        //   "id": "checkout_id",
        //   "status": "PAID",
        //   "checkout_reference": "CHK-membershipId-timestamp",
        //   "transaction_code": "transaction_id",
        //   ...
        // }
        
        const { id: checkoutId, status, checkout_reference, transaction_code } = body

        if (status === 'PAID') {
            const supabase = await createClient()
            
            // Extract membershipId from reference if it matches our pattern
            // Pattern: MEM_membershipId__timestamp
            if (checkout_reference?.startsWith('MEM_') || checkout_reference?.startsWith('SUB_')) {
                const parts = checkout_reference.split('__')
                const membershipId = checkout_reference.startsWith('MEM_') 
                    ? parts[0].replace('MEM_', '')
                    : parts[0].replace('SUB_', '')
                
                // Update payment record
                await supabase
                    .from('payments')
                    .update({
                        status: 'successful',
                        sumup_transaction_id: transaction_code,
                        payment_date: new Date().toISOString()
                    })
                    .eq('membership_id', membershipId)
                    .eq('status', 'pending')

                // Update membership status
                await supabase
                    .from('memberships')
                    .update({ status: 'pending_approval' })
                    .eq('id', membershipId)
                    .eq('status', 'pending_payment')

            } else if (checkout_reference?.startsWith('DON_')) {
                const parts = checkout_reference.split('__')
                const donationId = parts[0].replace('DON_', '')

                if (donationId !== 'NONE') {
                    // Update donation status
                    await supabase
                        .from('donations')
                        .update({ 
                            status: 'successful',
                            transaction_id: transaction_code,
                            completed_at: new Date().toISOString()
                        })
                        .eq('id', donationId)
                }
            }
        }

        // Always return 200 to acknowledge SumUp
        return new Response(null, { status: 200 })

    } catch (error) {
        console.error('SumUp Webhook Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
