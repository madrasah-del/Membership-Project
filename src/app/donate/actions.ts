'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGiftAidDeclaration(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const declaration = {
    user_id: user.id,
    first_name: formData.get('firstName') as string,
    last_name: formData.get('lastName') as string,
    address_line1: formData.get('addressLine1') as string,
    town: formData.get('town') as string,
    postcode: formData.get('postcode') as string,
    is_uk_taxpayer: formData.get('isUkTaxpayer') === 'on',
  }

  const { data, error } = await supabase
    .from('gift_aid_declarations')
    .insert(declaration)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function initiateDonation(amount: number, isRecurring: boolean, giftAidId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const donationData = {
    user_id: user?.id || null,
    amount,
    is_gift_aid_eligible: !!giftAidId,
    gift_aid_declaration_id: giftAidId,
    is_recurring: isRecurring,
    status: 'pending'
  }

  const { data, error } = await supabase
    .from('donations')
    .insert(donationData)
    .select()
    .single()

  if (error) throw error

  // Create SumUp Checkout
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/sumup/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      email: user?.email || 'donor@example.com',
      description: `Donation to Society ${isRecurring ? '(Monthly)' : ''}`,
      reference: `DON-${data.id.slice(0,8)}`,
      metadata: {
        donation_id: data.id,
        type: 'donation'
      }
    })
  })

  // Check if response is ok
  if (!response.ok) {
     const err = await response.json()
     throw new Error(err.error || 'Failed to initiate checkout')
  }

  const checkout = await response.json()
  
  if (checkout.checkoutId) {
    await supabase
      .from('donations')
      .update({ sumup_checkout_id: checkout.checkoutId })
      .eq('id', data.id)
  }

  return { donationId: data.id, checkoutId: checkout.checkoutId }
}

export async function recordDonationSuccess(donationId: string, transactionId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('donations')
    .update({ 
      status: 'successful',
      sumup_transaction_id: transactionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', donationId)

  if (error) throw error
  revalidatePath('/dashboard')
}
