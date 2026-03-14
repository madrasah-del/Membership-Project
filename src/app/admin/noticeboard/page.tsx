'use client'

import { Megaphone, Plus, Search, Filter, MoreHorizontal } from 'lucide-react'

export default function AdminNoticeboardPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Noticeboard Management</h1>
                    <p className="text-slate-500 text-lg">Broadcast updates and manage community announcements.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95 self-start md:self-center">
                    <Plus className="w-5 h-5" />
                    New Announcement
                </button>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search notices..." 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all">
                        <Filter className="w-5 h-5" />
                        Status
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Placeholder Notice 1 */}
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-brand-200 transition-all group">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-600">
                                    <Megaphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-slate-900">Ramadan 2026 Timetable Release</h3>
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                                    </div>
                                    <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                                        The official timetable for Ramadan 2026 is now available. Click to download or share with the community.
                                    </p>
                                    <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Posted 2 days ago</span>
                                        <span>•</span>
                                        <span>452 Views</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-white rounded-xl transition-colors">
                                <MoreHorizontal className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Placeholder Notice 2 */}
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl hover:border-brand-200 transition-all group shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner text-blue-600">
                                    <Megaphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-slate-900">Community Iftar - Saturday 14th</h3>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">Upcoming</span>
                                    </div>
                                    <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                                        Join us for a community-wide Iftar this Saturday. Registration is required for catering purposes.
                                    </p>
                                    <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Scheduled for June 14</span>
                                        <span>•</span>
                                        <span>128 Registered</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <MoreHorizontal className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Placeholder Notice 3 */}
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl hover:border-brand-200 transition-all group shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner text-slate-400">
                                    <Megaphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-slate-900">Youth Mentoring Program</h3>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">Draft</span>
                                    </div>
                                    <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                                        Proposal for a new youth mentoring program focusing on career guidance and spiritual growth.
                                    </p>
                                    <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Last edited 4 hours ago</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <MoreHorizontal className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
