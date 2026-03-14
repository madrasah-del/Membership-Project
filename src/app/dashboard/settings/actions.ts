'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCommunicationPreferences(
  newsletterOptIn: boolean,
  whatsappOptIn: boolean
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    // Get the user's latest membership profile to update
    const { data: membership, error: fetchError } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !membership) {
       // If no membership exists, this is an edge case, but we handle it.
       throw new Error('No active membership found to update')
    }

    // Update preferences
    const { error: updateError } = await supabase
      .from('memberships')
      .update({
        newsletter_opt_in: newsletterOptIn,
        whatsapp_opt_in: whatsappOptIn,
      })
      .eq('id', membership.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating settings:', err)
    return { success: false, error: err.message || 'Failed to update preferences' }
  }
}
