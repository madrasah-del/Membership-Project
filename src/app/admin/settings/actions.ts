'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAppSettings() {
    const supabase = await createClient()

    // Get all settings. We expect this to be a small table.
    const { data: settings, error } = await supabase
        .from('app_settings')
        .select('*')

    if (error) {
        console.error('Error fetching settings:', error)
        return null
    }

    return settings
}

export async function updateSetting(key: string, value: unknown) {
    const supabase = await createClient()

    // We assume RLS policies will prevent non-admins from updating
    const { error } = await supabase
        .from('app_settings')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', key)

    if (error) {
        console.error(`Error updating setting ${key}:`, error)
        return { error: 'Failed to update setting.' }
    }

    revalidatePath('/admin/settings')
    return { success: true }
}
