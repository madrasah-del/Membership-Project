'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAsRead(formData: FormData) {
    const notificationId = formData.get('notification_id') as string

    if (!notificationId) return { error: 'Missing notification ID' }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authorized' }

    const { error } = await supabase
        .from('member_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id) // Security check to ensure it belongs to the user

    if (error) {
        console.error('Failed to mark notification as read:', error)
        return { error: 'Failed to mark as read' }
    }

    revalidatePath('/dashboard/notifications')
    return { success: true }
}
