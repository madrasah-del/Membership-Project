import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Vote, Calendar, CheckCircle2, ChevronRight, Lock } from 'lucide-react'
import Link from 'next/link'

export default async function MemberElectionsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch active member's membership ID
    const { data: membership } = await supabase
        .from('memberships')
        .select('id, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    const isPaidMember = membership?.status === 'active'

    // Fetch all active elections
    const now = new Date().toISOString()
    const { data: elections, error } = await supabase
        .from('elections')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('end_date', { ascending: true })

    if (error) {
        console.error('Error fetching elections:', error)
    }

    // Determine which elections the user has already voted in
    let votedElectionIds = new Set<string>()
    if (membership && isPaidMember) {
        const { data: userVotes } = await supabase
            .from('votes')
            .select('election_id')
            .eq('membership_id', membership.id)

        votedElectionIds = new Set(userVotes?.map(v => v.election_id))
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Society Elections</h1>
                <p className="text-slate-500 mt-1">Participate in democratic voting for committee members and decisions.</p>
            </div>

            {!isPaidMember && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl flex items-start gap-4">
                    <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold mb-1">Voting is restricted to active members</h3>
                        <p className="text-sm">Only members with an active, paid-up membership can participate in society elections. Please ensure your membership is up to date.</p>
                    </div>
                </div>
            )}

            <div className="space-y-4 pt-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Vote className="w-5 h-5 text-brand-500" />
                    Active Elections
                </h2>

                {elections?.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                        <Vote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-800 mb-1">No Active Elections</h3>
                        <p className="text-slate-500">There are currently no active elections open for voting.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {elections?.map((election) => {
                            const hasVoted = votedElectionIds.has(election.id)

                            return (
                                <div key={election.id} className="bg-white border text-center border-slate-200 rounded-xl p-6 shadow-sm hover:border-brand-300 transition-colors flex flex-col h-full">
                                    <h3 className="font-bold text-slate-900 text-lg mb-2">{election.title}</h3>

                                    {election.description && (
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{election.description}</p>
                                    )}

                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-slate-50 p-2 rounded-lg mx-auto">
                                        <Calendar className="w-4 h-4" />
                                        <span>Closes: {new Date(election.end_date).toLocaleDateString()} at {new Date(election.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div className="mt-auto">
                                        {!isPaidMember ? (
                                            <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 font-medium rounded-lg text-sm cursor-not-allowed">
                                                Not Eligible
                                            </button>
                                        ) : hasVoted ? (
                                            <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium rounded-lg text-sm flex items-center justify-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Vote Submitted
                                            </div>
                                        ) : (
                                            <Link href={`/dashboard/elections/${election.id}`} className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                                Cast Your Vote
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
