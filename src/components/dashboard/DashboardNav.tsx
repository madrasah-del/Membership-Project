'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Settings, CreditCard, ClipboardList, Vote } from 'lucide-react'

// Simple defined routes based on user request
const NAV_ITEMS = [
    { name: 'Overview', href: '/dashboard', icon: User },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Noticeboard & Comms', href: '/dashboard/noticeboard', icon: ClipboardList },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Elections (Future)', href: '/dashboard/elections', icon: Vote },
]

export default function DashboardNav() {
    const pathname = usePathname()

    return (
        <nav className="flex-1 px-4 space-y-2 mt-4">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                            isActive
                                ? 'bg-brand-50 text-brand-700 shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                            {item.name}
                        </div>
                    </Link>
                )
            })}
        </nav>
    )
}
