'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveMembership(membershipId: string) {
    const supabase = await createClient()

    // Get current user to check if they are admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Not authorized' }
    }

    // Update membership status to 'active'
    const { error: updateError } = await supabase
        .from('memberships')
        .update({
            status: 'active',
            approved_by: user.id, // Record who approved it
        })
        .eq('id', membershipId)

    if (updateError) {
        console.error('Error approving membership:', updateError)
        return { error: 'Failed to approve membership' }
    }

    revalidatePath('/admin/approvals')
    revalidatePath('/admin')

    // TODO: Trigger email/WhatsApp notification to user

    return { success: true }
}

export async function rejectMembership(membershipId: string) {
    const supabase = await createClient()

    // Get current user to check if they are admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Not authorized' }
    }

    // Update membership status to 'rejected'
    const { error: updateError } = await supabase
        .from('memberships')
        .update({ status: 'rejected' })
        .eq('id', membershipId)

    if (updateError) {
        console.error('Error rejecting membership:', updateError)
        return { error: 'Failed to reject membership' }
    }

    revalidatePath('/admin/approvals')
    revalidatePath('/admin')

    return { success: true }
}

export async function createManualMembership(data: any) {
    const supabase = await createClient()

    // Auth check
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser) return { error: 'Not authenticated' }
    
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', adminUser.id)
        .single()
    
    if (adminProfile?.role !== 'admin') return { error: 'Not authorized' }

    try {
        // 1. We don't necessarily create a profile/user yet if it's manual entry from paper.
        // But if they provided an email, we could try to find an existing profile.
        let userId = null
        if (data.email) {
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', data.email)
                .maybeSingle()
            if (existingProfile) userId = existingProfile.id
        }

        // 2. Insert membership
        const { data: membership, error: mError } = await supabase
            .from('memberships')
            .insert({
                user_id: userId,
                title: data.title,
                first_name: data.firstName,
                last_name: data.lastName,
                date_of_birth: data.dateOfBirth,
                profession: data.profession === 'Other' ? data.professionOther : data.profession,
                functional_position: data.functionalPosition === 'Other' ? data.functionalPositionOther : data.functionalPosition,
                position: data.position,
                address: data.address,
                town: data.town,
                postcode: data.postcode,
                dependents: data.dependents || [],
                eligibility_criteria_met: true,
                is_non_resident_confirmation: data.isNonResidentConfirmation,
                whatsapp_opt_in: data.whatsappOptIn,
                status: 'active',
                approved_by: adminUser.id
            })
            .select('id')
            .single()

        if (mError || !membership) throw mError

        // 3. Record Payment
        const { error: pError } = await supabase
            .from('payments')
            .insert({
                membership_id: membership.id,
                amount: data.amount,
                payment_method: data.paymentMethod,
                status: 'successful',
                payment_date: data.paymentDate || new Date().toISOString(),
                sumup_transaction_id: data.sumupTransactionId,
                payment_type: 'new'
            })

        if (pError) console.error('Payment record error:', pError)

        // 4. Gift Aid if declared
        if (data.hasGiftAidDeclaration) {
             await supabase.from('gift_aid_declarations').insert({
                user_id: userId,
                membership_id: membership.id,
                first_name: data.firstName,
                last_name: data.lastName,
                address_line1: data.address,
                town: data.town,
                postcode: data.postcode,
                status: 'active',
                is_uk_taxpayer: true,
                declaration_text: "I want to Gift Aid my donation and any donations I make in the future or have made in the past 4 years to the Society. I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations in that tax year it is my responsibility to pay any difference."
            })
        }

        revalidatePath('/admin')
        return { success: true, membershipId: membership.id }
    } catch (err: any) {
        console.error('Manual entry error:', err)
        return { error: err.message || 'Failed to create manual entry' }
    }
}
