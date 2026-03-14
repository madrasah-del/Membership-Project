'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserSettings(data: {
  phone?: string
  profession?: string
  position?: string
  newsletter_opt_in?: boolean
  whatsapp_opt_in?: boolean
  business_opt_in?: boolean
  business_type?: string
  business_name?: string
  business_website?: string
  business_contact?: string
  business_description?: string
  functional_position?: string
  title?: string
  address?: string
  town?: string
  postcode?: string
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
    const updateData: any = {}
    
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.profession !== undefined) updateData.profession = data.profession
    if (data.position !== undefined) updateData.position = data.position
    if (data.newsletter_opt_in !== undefined) updateData.newsletter_opt_in = data.newsletter_opt_in
    if (data.whatsapp_opt_in !== undefined) updateData.whatsapp_opt_in = data.whatsapp_opt_in
    if (data.business_opt_in !== undefined) updateData.business_opt_in = data.business_opt_in
    if (data.business_type !== undefined) updateData.business_type = data.business_type
    if (data.business_name !== undefined) updateData.business_name = data.business_name
    if (data.business_website !== undefined) updateData.business_website = data.business_website
    if (data.business_contact !== undefined) updateData.business_contact = data.business_contact
    if (data.business_description !== undefined) updateData.business_description = data.business_description
    if (data.functional_position !== undefined) updateData.functional_position = data.functional_position
    if (data.title !== undefined) updateData.title = data.title
    if (data.address !== undefined) updateData.address = data.address
    if (data.town !== undefined) updateData.town = data.town
    if (data.postcode !== undefined) updateData.postcode = data.postcode
    if (data.dependents !== undefined) updateData.dependents = data.dependents

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

