import { createClient } from '@/lib/supabase/server'
import { Bell, Mail, Info, Calendar, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function NotificationsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch notifications for the user
  const { data: notifications, error } = await supabase
    .from('member_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 text-blue-600" />
      case 'success': return <Calendar className="w-5 h-5 text-emerald-600" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-600" />
      default: return <Bell className="w-5 h-5 text-slate-600" />
    }
  }

  const getBg = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-50'
      case 'success': return 'bg-emerald-50'
      case 'warning': return 'bg-amber-50'
      default: return 'bg-slate-50'
    }
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-slate-500 mt-2">Stay updated with the latest society announcements and alerts.</p>
      </div>

      <div className="space-y-4">
        {notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <div key={n.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-5 hover:border-brand-300 transition-colors group">
              <div className={`w-12 h-12 ${getBg(n.type)} rounded-2xl flex items-center justify-center shrink-0`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors uppercase text-xs tracking-widest">{n.title}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500 mt-2">You don't have any new notifications right now.</p>
          </div>
        )}
      </div>
    </div>
  )
}
