'use client'

import { Bell, Send, History, Filter, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminNotificationsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Push Notifications</h1>
                    <p className="text-slate-500 text-lg">Send instant updates via Mobile Push, Email, and WhatsApp.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95 self-start md:self-center">
                    <Send className="w-5 h-5" />
                    Compose Message
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Recent History */}
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <History className="w-6 h-6 text-brand-500" />
                            Recent Broadcasts
                        </h2>
                        <button className="text-brand-600 font-bold text-sm">View All</button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: 'Friday Prayer Update', type: 'Email', status: 'Delivered', reach: '1.2k' },
                            { title: 'EID Prayer Announcement', type: 'Push', status: 'Delivered', reach: '5.8k' },
                            { title: 'Membership Renewal Reminder', type: 'WhatsApp', status: 'In Progress', reach: '800' },
                        ].map((notif, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="font-bold text-slate-900 text-sm mb-0.5">{notif.title}</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Via {notif.type} • Reach: {notif.reach}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    notif.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-700 animate-pulse'
                                }`}>
                                    {notif.status === 'Delivered' ? <CheckCircle className="w-3 h-3" /> : <History className="w-3 h-3" />}
                                    {notif.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Alerts */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                        System Health Alerts
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="p-5 bg-slate-800 border border-slate-700/50 rounded-3xl">
                            <p className="font-bold text-amber-400 text-sm mb-2">SumUp Webhook Delay</p>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                Webhook confirmations are taking longer than expected (Avg: 4.2s). Monitoring integration stability.
                            </p>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-400 h-full w-3/4 rounded-full"></div>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-800 border border-slate-700/50 rounded-3xl">
                            <p className="font-bold text-emerald-400 text-sm mb-1">WhatsApp API Status</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Operational • 99.9% Success Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compose Quick Notification */}
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Send className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Quick Broadcast</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Target Audience</label>
                            <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all appearance-none font-medium">
                                <option>All Active Members</option>
                                <option>Pending Payments Only</option>
                                <option>Executive Committee</option>
                                <option>Epsom Residents</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Message Content</label>
                            <textarea 
                                rows={4}
                                placeholder="Type your message here..."
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium resize-none"
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Delivery Channels</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Push Notification', active: true },
                                    { label: 'Email Blast', active: true },
                                    { label: 'WhatsApp', active: false },
                                    { label: 'SMS', active: false },
                                ].map((channel) => (
                                    <button 
                                        key={channel.label}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                            channel.active 
                                            ? 'border-brand-500 bg-brand-50 text-brand-700' 
                                            : 'border-slate-100 bg-white text-slate-400 opacity-50'
                                        }`}
                                    >
                                        <span className="text-sm font-bold">{channel.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-center hover:bg-black transition-all shadow-xl shadow-slate-900/10">
                                Send Broadcast Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
