import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, User, Settings, FileText, ChevronRight, CreditCard, Bell, ClipboardList, Vote } from 'lucide-react'
import Link from 'next/link'
import { signout } from '@/app/login/actions'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            E
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-slate-800">EEIS</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <Link href="/dashboard" className="flex items-center justify-between px-3 py-2.5 bg-brand-50 text-brand-700 rounded-xl font-medium transition-colors">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-brand-500" />
                            Overview
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>

                    <Link href="/dashboard/membership" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                        <FileText className="w-5 h-5 text-slate-400" />
                        My Membership
                    </Link>

                    <Link href="/dashboard/payments" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                        <CreditCard className="w-5 h-5 text-slate-400" />
                        Payments & Subscriptions
                    </Link>

                    <Link href="/dashboard/noticeboard" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                        <ClipboardList className="w-5 h-5 text-slate-400" />
                        Noticeboard
                    </Link>

                    <Link href="/dashboard/elections" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                        <Vote className="w-5 h-5 text-slate-400" />
                        Elections & Voting
                    </Link>

                    <Link href="/dashboard/notifications" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                        <Bell className="w-5 h-5 text-slate-400" />
                        Notifications
                    </Link>

                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                        <Settings className="w-5 h-5 text-slate-400" />
                        Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="mb-4 px-3">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                        <p className="text-xs text-slate-500">Member Portal</p>
                    </div>
                    <form action={signout}>
                        <button className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors group">
                            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
                            E
                        </div>
                    </div>
                    {/* Mobile menu logic would go here */}
                    <form action={signout}>
                        <button className="text-sm text-slate-600 font-medium">Log out</button>
                    </form>
                </header>

                <div className="p-6 md:p-10 max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
