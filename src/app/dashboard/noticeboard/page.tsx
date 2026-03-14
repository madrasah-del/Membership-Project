import { createClient } from '@/lib/supabase/server'
import { Megaphone, Pin, Link as LinkIcon, MessageSquare } from 'lucide-react'

export default async function NoticeboardPage() {
  const supabase = await createClient()

  // Fetch published society updates
  const { data: notices, error } = await supabase
    .from('society_updates')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notices:', error)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Noticeboard</h1>
          <p className="text-slate-500 mt-2">Central hub for all community notices and official memos.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-brand-50 text-brand-700 font-bold py-2.5 px-5 rounded-xl text-sm hover:bg-brand-100 transition-colors flex items-center gap-2">
             <MessageSquare className="w-4 h-4" />
             Suggest a Notice
           </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {notices && notices.length > 0 ? (
          notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
               {notice.type === 'announcement' && (
                 <div className="absolute top-0 right-0 py-1.5 px-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm">
                   Priority
                 </div>
               )}
               
               <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                    {notice.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{new Date(notice.created_at).toLocaleDateString()}</span>
               </div>

               <h2 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-brand-600 transition-colors">
                 {notice.title}
               </h2>
               
               <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-wrap">
                 {notice.content}
               </p>

               <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                      EE
                    </div>
                    <span className="text-sm font-semibold text-slate-700">EEIS Committee</span>
                  </div>
                  <button className="text-slate-400 hover:text-brand-600 transition-colors">
                    <LinkIcon className="w-5 h-5" />
                  </button>
               </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 bg-white rounded-[2.5rem] p-16 border-2 border-dashed border-slate-100 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6 font-black text-2xl">
               <Megaphone className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">No Active Notices</h3>
             <p className="text-slate-500 max-w-sm">
               There are currently no community updates posted. Check back later for news and announcements.
             </p>
          </div>
        )}
      </div>
    </div>
  )
}
