'use client'

import { Vote, Plus, Calendar, Users, ChevronRight, Activity } from 'lucide-react'

export default function AdminVotingPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Elections & Voting</h1>
                    <p className="text-slate-500 text-lg">Manage society elections, constitutional polls, and democratic processes.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95 self-start md:self-center">
                    <Plus className="w-5 h-5" />
                    Create New Election
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Eligible Voters</p>
                    <p className="text-3xl font-black text-slate-900">1,248</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg. Turnout</p>
                    <p className="text-3xl font-black text-slate-900">64%</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Next AGM</p>
                    <p className="text-3xl font-black text-slate-900">June 15</p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white">
                            <Vote className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tight">Active Constitutional Poll</h2>
                    </div>
                    
                    <h3 className="text-3xl font-black mb-4">Amendment to Clause 4.2: Membership Tiers</h3>
                    <p className="text-slate-400 max-w-xl mb-8 leading-relaxed">
                        Poll closing in <span className="text-white font-bold">48 hours</span>. Monitor participation rates and ensure integrity through member-id verification.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all flex items-center gap-2">
                            Monitor Live Results <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="px-8 py-3 bg-slate-800 text-white border border-slate-700 rounded-2xl font-black text-sm hover:bg-slate-700 transition-all">
                            Voter Audit Log
                        </button>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-600/20 to-transparent pointer-events-none"></div>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900">Election History</h3>
                    <button className="text-sm font-bold text-brand-600 hover:text-brand-700">View Archives</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-4">Election Name</th>
                                <th className="px-8 py-4">Date</th>
                                <th className="px-8 py-4">Turnout</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { name: 'Executive Committee 2025', date: 'Jan 10, 2025', turnout: '78%', status: 'Certified' },
                                { name: 'Budget Approval Q4', date: 'Oct 15, 2024', turnout: '42%', status: 'Completed' },
                                { name: 'Chairman Special Election', date: 'Aug 02, 2024', turnout: '89%', status: 'Certified' },
                            ].map((election) => (
                                <tr key={election.name} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{election.name}</p>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">{election.date}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-500 rounded-full" style={{ width: election.turnout }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{election.turnout}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                                            {election.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="text-xs font-bold text-slate-400 hover:text-slate-600">View Report</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
