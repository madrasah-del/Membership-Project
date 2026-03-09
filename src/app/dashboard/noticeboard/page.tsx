import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Megaphone, Calendar, FileText, Bell } from 'lucide-react'

export default async function NoticeboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if member is active
    const { data: membership } = await supabase
        .from('memberships')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (!membership || membership.status !== 'active') {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center animate-fade-in">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Noticeboard Unavailable</h2>
                <p className="text-slate-500 max-w-lg mx-auto text-lg">
                    The noticeboard is only available to active, fully paid members of the society. Please ensure your membership is up to date to access community updates.
                </p>
            </div>
        )
    }

    // Fetch society updates
    const { data: updates } = await supabase
        .from('society_updates')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20)

    const getIconForType = (type: string) => {
        switch (type) {
            case 'newsletter': return <FileText className="w-5 h-5 text-blue-500" />
            case 'announcement': return <Megaphone className="w-5 h-5 text-brand-500" />
            case 'financial': return <Calendar className="w-5 h-5 text-green-500" />
            default: return <Bell className="w-5 h-5 text-slate-500" />
        }
    }

    const getBgColorForType = (type: string) => {
        switch (type) {
            case 'newsletter': return 'bg-blue-50'
            case 'announcement': return 'bg-brand-50'
            case 'financial': return 'bg-green-50'
            default: return 'bg-slate-50'
        }
    }

    return (
        <div className="animate-fade-in-up">
            <div className="mb-10 lg:flex lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Noticeboard</h1>
                    <p className="text-slate-500 mt-2 text-lg">Society-wide updates, announcements, and newsletters.</p>
                </div>
            </div>

            <div className="space-y-6">
                {!updates?.length ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                        No recent updates to show. Check back later!
                    </div>
                ) : (
                    updates.map((update: any) => (
                        <div key={update.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 sm:p-8">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getBgColorForType(update.type)}`}>
                                        {getIconForType(update.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {update.type}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-sm text-slate-500">
                                                {new Date(update.created_at).toLocaleDateString(undefined, {
                                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-3">{update.title}</h2>
                                        <div className="prose prose-slate prose-sm max-w-none text-slate-600">
                                            {/* Simple text rendering for now. Could use a markdown parser later. */}
                                            {update.content.split('\n').map((paragraph: string, idx: number) => (
                                                <p key={idx}>{paragraph}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
