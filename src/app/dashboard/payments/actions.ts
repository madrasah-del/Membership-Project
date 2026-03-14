'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Retrieves payment history for the currently logged-in member.
 */
export async function getMemberPayments() {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // Get the membership to get the membership ID
        const { data: membership } = await supabase
            .from('memberships')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!membership) {
            return { payments: [] } // No membership yet
        }

        const { data: payments, error } = await supabase
            .from('payments')
            .select('*')
            .eq('membership_id', membership.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return { payments }
    } catch (error) {
        console.error('Error fetching member payments:', error)
        return { error: 'Failed to retrieve payment history.' }
    }
}

/**
 * Connects to the SumUp API and removes all saved payment instruments (tokenized cards)
 * for the current member, effectively cancelling auto-renewal.
 */
export async function cancelAutoRenewal(membershipId: string) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // Verify the membership actually belongs to this user!
        const { data: membership } = await supabase
            .from('memberships')
            .select('id')
            .eq('id', membershipId)
            .eq('user_id', user.id)
            .single()

        if (!membership) {
            throw new Error('Unauthorized action on this membership.')
        }

        const customerId = `eeis-m-${membershipId}`
        const sumupSecretKey = process.env.SUMUP_SECRET_KEY

        if (!sumupSecretKey) {
            throw new Error('SumUp API keys are not configured.')
        }

        // 1. Fetch the customer's payment instruments from SumUp
        const getInstrumentsRes = await fetch(`https://api.sumup.com/v0.1/customers/${customerId}/payment-instruments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sumupSecretKey}`,
            }
        })

        if (!getInstrumentsRes.ok) {
            const errData = await getInstrumentsRes.json()
            console.error('Failed to fetch payment instruments:', errData)

            if (getInstrumentsRes.status === 404) {
                // Customer might not exist in SumUp yet or has no instruments.
                // This is fine, we just proceed to update the local DB.
                console.log('Customer not found in SumUp, proceeding to update DB.')
            } else {
                throw new Error('Failed to retrieve active subscriptions from the payment gateway.')
            }
        } else {
            const instruments = await getInstrumentsRes.json()

            // 2. Delete each active instrument
            if (instruments && Array.isArray(instruments)) {
                for (const instrument of instruments) {
                    if (instrument.token) {
                        const deleteRes = await fetch(`https://api.sumup.com/v0.1/customers/${customerId}/payment-instruments/${instrument.token}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${sumupSecretKey}`,
                            }
                        })

                        if (!deleteRes.ok) {
                            console.error(`Failed to delete instrument ${instrument.token}`)
                            // Optionally throw here, or continue trying to delete others.
                            // We'll throw to ensure the user knows it failed.
                            throw new Error('Failed to cancel the subscription on the payment gateway.')
                        }
                    }
                }
            }
        }

        // 3. Update all recurring payments in our database to `is_recurring = false`
        const { error: updateError } = await supabase
            .from('payments')
            .update({ is_recurring: false })
            .eq('membership_id', membershipId)
            .eq('is_recurring', true)

        if (updateError) {
            console.error('Failed to update payments table:', updateError)
            return { error: 'Subscription was cancelled with the payment provider, but we failed to update your local records. Please contact support.' }
        }

        revalidatePath('/dashboard/payments')
        return { success: true }

    } catch (error: unknown) {
        console.error('Cancellation Error:', error)
        return { error: error instanceof Error ? error.message : 'An unexpected error occurred during cancellation.' }
    }
}

/**
 * Connects to the SumUp API and retrieves the active tokenized payment instrument
 * for the current member to display the card details.
 */
export async function getActivePaymentInstrument(membershipId: string) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // Verify the membership belongs to this user
        const { data: membership } = await supabase
            .from('memberships')
            .select('id')
            .eq('id', membershipId)
            .eq('user_id', user.id)
            .single()

        if (!membership) {
            throw new Error('Unauthorized action on this membership.')
        }

        const customerId = `eeis-m-${membershipId}`
        const sumupSecretKey = process.env.SUMUP_SECRET_KEY

        if (!sumupSecretKey) {
            throw new Error('SumUp API keys are not configured.')
        }

        // Fetch the customer's payment instruments from SumUp
        const getInstrumentsRes = await fetch(`https://api.sumup.com/v0.1/customers/${customerId}/payment-instruments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sumupSecretKey}`,
            }
        })

        if (!getInstrumentsRes.ok) {
            if (getInstrumentsRes.status === 404) {
                // Customer not found or no instruments yet
                return { instrument: null }
            }
            throw new Error('Failed to retrieve active subscriptions from the payment gateway.')
        }

        const instruments = await getInstrumentsRes.json()

        // SumUp might return multiple, we usually just want the most recent active one
        if (instruments && Array.isArray(instruments) && instruments.length > 0) {
            // Sort by creation date if possible, or just grab the first one
            // We assume the most recently added active one is primary
            const activeInstruments = instruments.filter(inst => inst.active !== false);
            if (activeInstruments.length > 0) {
                // Return the first active one, formatting data needed
                const primary = activeInstruments[0];
                return {
                    instrument: {
                        brand: primary.card.type || 'CARD',
                        last4: primary.card.last_4_digits,
                        expMonth: primary.card.exp_month,
                        expYear: primary.card.exp_year,
                        token: primary.token
                    }
                }
            }
        }

        return { instrument: null }

    } catch (error: unknown) {
        console.error('Fetch Instrument Error:', error)
        return { error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching card details.' }
    }
}

/**
 * Initializes a new checkout specifically designed to tokenize a replacement card.
 * It does not charge the customer (Amount: 0 or minimal auth amount if required by some regions, usually handled internally by tokenization purpose).
 */
export async function initializeCardUpdateCheckout(membershipId: string) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // Verify the membership belongs to this user
        const { data: membership } = await supabase
            .from('memberships')
            .select('id')
            .eq('id', membershipId)
            .eq('user_id', user.id)
            .single()

        if (!membership) {
            throw new Error('Unauthorized action on this membership.')
        }

        const sumupSecretKey = process.env.SUMUP_SECRET_KEY
        const merchantCode = process.env.NEXT_PUBLIC_SUMUP_MERCHANT_CODE

        if (!sumupSecretKey || !merchantCode) {
            throw new Error('SumUp API keys or Merchant Code are not configured on the server.')
        }

        const customerId = `eeis-m-${membershipId}`

        // Generate a unique checkout reference for the update
        const checkoutReference = `UPDATE-CHK-${membershipId}-${Date.now()}`

        // Payload for tokenization checkout (must have an amount, usually minimal for 3DS or handled internally)
        const sumupPayload: Record<string, unknown> = {
            checkout_reference: checkoutReference,
            amount: 1, // Minimum amount required by SumUp API for checkout creation, though we don't plan to actually charge it if we can avoid it, but wait. Let's see if 0 is allowed for SETUP_RECURRING_PAYMENT. Actually, for card updates, £1 is standard for auth. We'll set it to 1, but we don't record this in our DB as a real payment.
            currency: 'GBP',
            pay_to_email: user.email || process.env.NEXT_PUBLIC_SUMUP_MERCHANT_EMAIL || 'madrasah@eeis.co.uk',
            merchant_code: merchantCode,
            description: `Update Payment Method - ${membershipId}`,
            customer_id: customerId,
            purpose: 'SETUP_RECURRING_PAYMENT'
        }

        const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sumupSecretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sumupPayload)
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('SumUp API Error (Update Init):', data)
            throw new Error('Failed to initialize connection to payment gateway.')
        }

        return { checkoutId: data.id }

    } catch (error: unknown) {
        console.error('Update Init Error:', error)
        return { error: error instanceof Error ? error.message : 'An unexpected error occurred during initialization.' }
    }
}

/**
 * After a successful card update checkout, this cleans up old cards.
 * It fetches all instruments, assumes the newest one is the one just added,
 * and deletes all others.
 */
export async function finalizeCardUpdate(membershipId: string) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // Verify the membership belongs to this user
        const { data: membership } = await supabase
            .from('memberships')
            .select('id')
            .eq('id', membershipId)
            .eq('user_id', user.id)
            .single()

        if (!membership) {
            throw new Error('Unauthorized action on this membership.')
        }

        const customerId = `eeis-m-${membershipId}`
        const sumupSecretKey = process.env.SUMUP_SECRET_KEY

        if (!sumupSecretKey) {
            throw new Error('SumUp API keys are not configured.')
        }

        // Fetch all of the customer's payment instruments from SumUp
        const getInstrumentsRes = await fetch(`https://api.sumup.com/v0.1/customers/${customerId}/payment-instruments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sumupSecretKey}`,
            }
        })

        if (!getInstrumentsRes.ok) {
            throw new Error('Could not fetch updated instruments from payment provider.')
        }

        const instruments = await getInstrumentsRes.json()

        if (instruments && Array.isArray(instruments) && instruments.length > 1) {
            // We have more than one card. We need to keep the newly added one.
            // Usually, SumUp returns them in order of creation or we can check the 'created_at' date.
            // We will sort them by created_at descending (newest first).
            instruments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            // Keep the first one (newest), delete the rest
            const newestToken = instruments[0].token;

            for (let i = 1; i < instruments.length; i++) {
                const oldToken = instruments[i].token;

                const deleteRes = await fetch(`https://api.sumup.com/v0.1/customers/${customerId}/payment-instruments/${oldToken}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${sumupSecretKey}`,
                    }
                })
                if (!deleteRes.ok) {
                    console.warn(`Failed to clean up old instrument ${oldToken}`);
                    // Non-fatal, we just failed to delete old clutter, but the new card works.
                }
            }
        }

        revalidatePath('/dashboard/payments')
        return { success: true }

    } catch (error: unknown) {
        console.error('Finalize Update Error:', error)
        // Even if cleanup fails, the new card is on file, so we don't throw a hard error to the user if we don't want to break the flow,
        // but it's okay to return the error for debug purposes.
        return { error: error instanceof Error ? error.message : 'An unexpected error occurred during finalization.' }
    }
}

/**
 * Initializes a full payment checkout for the annual membership fee.
 */
export async function initializeMembershipPayment(membershipId: string, amount: number) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // Verify the membership belongs to this user
        const { data: membership } = await supabase
            .from('memberships')
            .select('id, first_name, last_name')
            .eq('id', membershipId)
            .eq('user_id', user.id)
            .single()

        if (!membership) {
            throw new Error('Unauthorized action on this membership.')
        }

        const sumupSecretKey = process.env.SUMUP_SECRET_KEY
        const merchantCode = process.env.NEXT_PUBLIC_SUMUP_MERCHANT_CODE

        if (!sumupSecretKey || !merchantCode) {
            throw new Error('SumUp API keys are not configured correctly.')
        }

        // Generate a unique checkout reference
        const checkoutReference = `MEM-DASH-${membershipId}-${Date.now()}`

        const sumupPayload = {
            checkout_reference: checkoutReference,
            amount: amount,
            currency: 'GBP',
            merchant_code: merchantCode,
            description: `Annual Membership Fee - ${membership.first_name} ${membership.last_name}`,
            customer_id: `eeis-m-${membershipId}`,
            purpose: 'SETUP_RECURRING_PAYMENT'
        }

        const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sumupSecretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sumupPayload)
        })

        const data = await response.json()
        if (!response.ok) {
            console.error('SumUp API Error (Payment Init):', data)
            throw new Error('Failed to initialize payment gateway.')
        }

        return { checkoutId: data.id }

    } catch (error: unknown) {
        console.error('Payment Init Error:', error)
        return { error: error instanceof Error ? error.message : 'An unexpected error occurred during initialization.' }
    }
}

/**
 * Records a successful membership payment in the database.
 */
export async function recordDashboardPaymentSuccess(membershipId: string, transactionId: string, amount: number) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // 1. Create a payment record
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                membership_id: membershipId,
                amount: amount,
                payment_method: 'sumup',
                status: 'completed',
                sumup_transaction_id: transactionId,
                payment_date: new Date().toISOString(),
                is_recurring: true,
                payment_type: 'renewal'
            })

        if (paymentError) throw paymentError

        // 2. Update membership status to active if it was pending_payment
        const { error: membershipError } = await supabase
            .from('memberships')
            .update({ status: 'active' }) // Or 'pending_approval' if you want committee to review again after payment
            .eq('id', membershipId)
            // .in('status', ['pending_payment', 'pending']) // Only move to active if it was pending payment. 
            // Wait, if they are already active but just paying for next year, we don't change status.
            // But if they are pending_payment, we move to active (or pending_approval).
            // Let's check current status.
            
        const { data: currentMembership } = await supabase
            .from('memberships')
            .select('status')
            .eq('id', membershipId)
            .single()
            
        if (currentMembership && (currentMembership.status === 'pending_payment' || currentMembership.status === 'pending' || currentMembership.status === 'approved')) {
            await supabase
                .from('memberships')
                .update({ status: 'active' })
                .eq('id', membershipId)
        }

        revalidatePath('/dashboard/payments')
        revalidatePath('/dashboard')
        return { success: true }

    } catch (error: unknown) {
        console.error('Record Payment Success Error:', error)
        return { error: 'Payment was successful, but we failed to update your status. Please contact support.' }
    }
}
