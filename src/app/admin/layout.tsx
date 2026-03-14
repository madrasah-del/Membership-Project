import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, Users, FileText, CheckSquare, Search, ChevronRight, Megaphone, Vote, Bell, Settings } from 'lucide-react'
import Link from 'next/link'
import { signout } from '@/app/login/actions'

export default async function AdminLayout({
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

    // Role verification: Ensure user is an admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            <CheckSquare className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-white">EEIS Admin</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <Link href="/admin" className="flex items-center justify-between px-3 py-2.5 bg-slate-800 text-white rounded-xl font-medium transition-colors">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-brand-400" />
                            All Members
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>

                    <Link href="/admin/approvals" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors">
                        <CheckSquare className="w-5 h-5 text-slate-500" />
                        Pending Approvals
                    </Link>

                    <Link href="/admin/payments" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors">
                        <FileText className="w-5 h-5 text-slate-500" />
                        Payments & Finance
                    </Link>

                    <Link href="/admin/reconciliation" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors">
                        <Search className="w-5 h-5 text-slate-500" />
                        Reconciliation
                    </Link>

                    <Link href="/admin/manual-entry" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors">
                        <FileText className="w-5 h-5 text-slate-500" />
                        Manual Entry
                    </Link>

                    <div className="pt-4 pb-2 px-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Communication & Voting</p>
                    </div>

                    <Link href="/admin/noticeboard" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors">
                        <Megaphone className="w-5 h-5 text-slate-500" />
                        Noticeboard
                    </Link>

                    <Link href="/admin/voting" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors">
                        <Vote className="w-5 h-5 text-slate-500" />
                        Elections & Voting
                    </Link>

                    <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors">
                        <Bell className="w-5 h-5 text-slate-500" />
                        Notifications
                    </Link>

                    <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors">
                        <Settings className="w-5 h-5 text-slate-500" />
                        System Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="mb-4 px-3">
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        <p className="text-xs text-slate-500">Administrator</p>
                    </div>
                    <form action={signout}>
                        <button className="flex items-center gap-3 px-3 py-2.5 w-full hover:bg-red-900/50 hover:text-red-400 rounded-xl font-medium transition-colors group">
                            <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 p-4 shrink-0 flex items-center justify-between">
                    <div className="md:hidden flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
                            <CheckSquare className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex-1 max-w-xl mx-4 hidden md:block">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search members by name, email, or phone..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    )
}
