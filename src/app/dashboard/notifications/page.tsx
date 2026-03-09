import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, CheckCircle2 } from 'lucide-react'
import { markAsRead } from './actions'

export default async function NotificationsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user notifications
    const { data: notifications } = await supabase
        .from('member_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="animate-fade-in-up">
            <div className="mb-10 lg:flex lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
                    <p className="text-slate-500 mt-2 text-lg">Direct messages and updates regarding your membership.</p>
                </div>
            </div>

            <div className="space-y-4">
                {!notifications?.length ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-lg">You have no new notifications.</p>
                    </div>
                ) : (
                    notifications.map((notification: any) => (
                        <div
                            key={notification.id}
                            className={`bg-white rounded-2xl border transition-all ${!notification.is_read ? 'border-brand-200 shadow-sm shadow-brand-500/5' : 'border-slate-200 shadow-sm opacity-75'
                                } overflow-hidden`}
                        >
                            <div className="p-6 flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notification.is_read ? 'bg-brand-100' : 'bg-slate-100'}`}>
                                    <Bell className={`w-5 h-5 ${!notification.is_read ? 'text-brand-600' : 'text-slate-400'}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <h3 className={`text-lg font-bold ${!notification.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-slate-400 shrink-0">
                                            {new Date(notification.created_at).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                        {notification.message}
                                    </p>

                                    {!notification.is_read && (
                                        <form action={markAsRead}>
                                            <input type="hidden" name="notification_id" value={notification.id} />
                                            <button type="submit" className="text-xs font-medium text-brand-600 flex items-center gap-1.5 hover:text-brand-700 transition-colors bg-brand-50 px-3 py-1.5 rounded-lg">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Mark as read
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
