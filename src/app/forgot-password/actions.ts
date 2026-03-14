'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function resetPassword(formData: FormData) {
    try {
        const supabase = await createClient()
        const email = formData.get('email') as string
        const headerList = await headers()
        const origin = headerList.get('origin') || headerList.get('host') || ''

        if (!email) {
            return { error: 'Email is required' }
        }

        const siteUrl = origin.includes('://') ? origin : `https://${origin}`

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/api/auth/callback?next=/reset-password`,
        })

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (e: unknown) {
        if (e instanceof Error) {
            return { error: e.message || 'An unexpected server-side error occurred.' }
        }
        return { error: 'An unexpected server-side error occurred.' }
    }
}
