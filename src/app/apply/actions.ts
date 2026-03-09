'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { fullApplicationSchema } from '@/lib/validations'

export async function submitApplication(data: any) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'You must be logged in to submit an application.' }
    }

    // Server-side validation
    const validationResult = fullApplicationSchema.safeParse(data)

    if (!validationResult.success) {
        return {
            error: 'Invalid application data. Please check your inputs.',
            details: validationResult.error.flatten()
        }
    }

    const validData = validationResult.data

    try {
        // Check if membership application already exists
        const { data: existingApp } = await supabase
            .from('memberships')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (existingApp) {
            return { error: 'An application already exists for this account.' }
        }

        // Insert membership record
        const { data: newMembership, error: insertError } = await supabase
            .from('memberships')
            .insert({
                user_id: user.id,
                title: validData.title,
                first_name: validData.firstName,
                last_name: validData.lastName,
                date_of_birth: validData.dateOfBirth,
                marital_status: validData.maritalStatus,
                address: validData.address,
                town: validData.town,
                postcode: validData.postcode,
                dependents: validData.dependents,
                eligibility_criteria_met: validData.isResidentOrRegular && validData.isSunniMuslim,
                proposed_by: validData.proposedBy,
                seconded_by: validData.secondedBy,
                whatsapp_opt_in: validData.whatsappOptIn,
                status: 'pending_payment'
            })
            .select('id')
            .single()

        if (insertError || !newMembership) {
            console.error('Supabase Insert Error:', insertError)
            return { error: 'Failed to save application to the database.' }
        }

        // Insert a pending payment record based on chosen method
        // This provides a full audit trail from the start.
        const paymentMethod = (data as any).paymentMethod || 'sumup'
        const isRecurring = (data as any).isRecurring ?? false
        const paymentStatus = paymentMethod === 'sumup' ? 'pending' : 'pending_verification'

        const { error: paymentInsertError } = await supabase
            .from('payments')
            .insert({
                membership_id: newMembership.id,
                amount: 10.00, // Will be replaced by dynamic setting once linked
                payment_method: paymentMethod,
                status: paymentStatus,
                is_recurring: isRecurring,
                payment_type: 'new',
            })

        if (paymentInsertError) {
            console.error('Payment record error (non-fatal):', paymentInsertError)
            // Non-fatal: membership is created, but the payment intent wasn't logged.
            // Admin can reconcile manually.
        }

        revalidatePath('/dashboard')
        revalidatePath('/apply')

        return { success: true }

    } catch (error) {
        console.error('Submission Error:', error)
        return { error: 'An unexpected error occurred during submission.' }
    }
}
