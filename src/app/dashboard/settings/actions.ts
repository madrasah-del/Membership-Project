'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserSettings(data: {
  phone: string
  profession: string
  position: string
  newsletter_opt_in: boolean
  whatsapp_opt_in: boolean
  business_opt_in: boolean
  business_type: string
  business_name: string
  business_website: string
  business_contact: string
  business_description: string
  functional_position: string
  dependents?: any[]
}) {
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
       throw new Error('No active membership found to update')
    }

    // Update preferences
    const updateData: any = {
      phone: data.phone,
      profession: data.profession,
      position: data.position,
      newsletter_opt_in: data.newsletter_opt_in,
      whatsapp_opt_in: data.whatsapp_opt_in,
      business_opt_in: data.business_opt_in,
      business_type: data.business_type,
      business_name: data.business_name,
      business_website: data.business_website,
      business_contact: data.business_contact,
      business_description: data.business_description,
      functional_position: data.functional_position,
    }

    if (data.dependents !== undefined) {
      updateData.dependents = data.dependents
    }

    const { error: updateError } = await supabase
      .from('memberships')
      .update(updateData)
      .eq('id', membership.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('Error updating settings:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update preferences' }
  }
}

