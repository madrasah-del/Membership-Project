import { createClient } from '@/lib/supabase/server'
import { Vote, Award, History, AlertCircle, Calendar, Users, ChevronRight } from 'lucide-react'

export default async function ElectionsPage() {
  const supabase = await createClient()

  const { data: elections, error } = await supabase
    .from('elections')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching elections:', error)
  }

  const activeElections = elections?.filter(e => e.status === 'open') || []

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Elections & Voting</h1>
        <p className="text-slate-500 mt-2">Participate in the democratic process of choosing our society leadership.</p>
      </div>

      {activeElections.length > 0 ? (
        <div className="grid gap-6">
          {activeElections.map((election) => (
             <div key={election.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
                         VOTING OPEN
                       </span>
                       <span className="text-xs text-slate-400 font-medium">Ends {new Date(election.end_date).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                      {election.title}
                    </h2>
                    <p className="text-slate-600 max-w-2xl">
                      {election.description}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                       <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Users className="w-4 h-4" />
                          <span>All Active Members Eligible</span>
                       </div>
                       <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          <span>Started {new Date(election.start_date).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center shrink-0">
                    <button className="w-full md:w-auto px-8 py-4 bg-brand-600 text-white font-black rounded-2xl shadow-lg shadow-brand-200 hover:bg-brand-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                      Go to Ballot
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
             </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-slate-200 shadow-xl shadow-slate-200/50 text-center flex flex-col items-center overflow-hidden relative">
           <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-50 rounded-full blur-3xl opacity-50"></div>
           
           <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 mb-8 relative z-10 scale-110">
             <Vote className="w-10 h-10" />
           </div>
           
           <h2 className="text-3xl font-black text-slate-900 mb-4 relative z-10">No Active Elections</h2>
           <p className="text-slate-500 max-w-lg mb-10 text-lg relative z-10">
             There are currently no open voting sessions or committee elections. We will notify all active members via email and the dashboard once the next election window is announced.
           </p>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl relative z-10">
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
               <Award className="w-6 h-6 text-brand-500 mb-3" />
               <span className="text-sm font-bold text-slate-900">Current Committee</span>
               <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-black">Term 2024-2026</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
               <History className="w-6 h-6 text-slate-400 mb-3" />
               <span className="text-sm font-bold text-slate-900">Past Results</span>
               <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-black">Archived</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
               <AlertCircle className="w-6 h-6 text-amber-500 mb-3" />
               <span className="text-sm font-bold text-slate-900">Voting Rules</span>
               <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-black">Member Handbook</p>
             </div>
           </div>
        </div>
      )}
    </div>
  )
}
