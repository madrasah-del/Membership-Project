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
