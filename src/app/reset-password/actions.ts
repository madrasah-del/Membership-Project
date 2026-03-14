'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
    try {
        const supabase = await createClient()
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (!password || !confirmPassword) {
            return { error: 'Both password fields are required' }
        }

        if (password !== confirmPassword) {
            return { error: 'Passwords do not match' }
        }

        if (password.length < 6) {
            return { error: 'Password must be at least 6 characters' }
        }

        const { error } = await supabase.auth.updateUser({
            password: password,
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
