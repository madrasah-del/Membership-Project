import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, CheckCircle2, AlertTriangle, Calendar, Vote } from 'lucide-react'
import Link from 'next/link'
import { submitElectronicVote } from './actions'

export default async function MemberVotingPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch member and ensure active
    const { data: membership } = await supabase
        .from('memberships')
        .select('id, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (!membership || membership.status !== 'active') {
        redirect('/dashboard/elections')
    }

    // Check if member has already voted
    const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', id)
        .eq('membership_id', membership.id)
        .single()

    // Fetch election details along with candidates
    const { data: election, error } = await supabase
        .from('elections')
        .select(`
            *,
            election_candidates (*)
        `)
        .eq('id', id)
        .single()

    if (error || !election) {
        redirect('/dashboard/elections')
    }

    const now = new Date()
    const startDate = new Date(election.start_date)
    const endDate = new Date(election.end_date)
    const isLive = election.is_active && now >= startDate && now <= endDate

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 pb-4 mb-4">
                <Link href="/dashboard/elections" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{election.title}</h1>
                    <p className="text-slate-500 text-sm mt-1">Select your preferred candidate.</p>
                </div>
            </div>

            {existingVote ? (
                <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-emerald-900 mb-2">Vote Recorded</h2>
                    <p className="text-emerald-700 max-w-sm mx-auto">
                        Thank you for voting. Your electronic ballot has been securely and anonymously recorded for this election.
                    </p>
                    <Link href="/dashboard/elections" className="inline-block mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                        Return to Elections
                    </Link>
                </div>
            ) : !isLive ? (
                <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-amber-900 mb-2">Voting is Closed</h2>
                    <p className="text-amber-700 max-w-sm mx-auto">
                        This election is currently not active or the voting window has closed.
                    </p>
                    <p className="text-sm text-amber-600 mt-4 flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2 text-brand-600 text-sm font-semibold mb-2">
                            <Vote className="w-4 h-4" />
                            Official Ballot
                        </div>
                        {election.description && (
                            <p className="text-slate-600 text-sm leading-relaxed">{election.description}</p>
                        )}
                    </div>

                    <form action={submitElectronicVote} className="p-6">
                        <input type="hidden" name="electionId" value={election.id} />
                        <input type="hidden" name="membershipId" value={membership.id} />

                        <div className="space-y-4 mb-8">
                            {election.election_candidates?.map((candidate: any) => (
                                <label
                                    key={candidate.id}
                                    className="relative flex items-center p-4 cursor-pointer rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 transition-all has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:ring-1 has-[:checked]:ring-brand-500 group"
                                >
                                    <div className="flex items-center h-5">
                                        <input
                                            type="radio"
                                            name="candidateId"
                                            value={candidate.id}
                                            required
                                            className="w-5 h-5 text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                                        />
                                    </div>
                                    <div className="ml-4 text-sm">
                                        <span className="font-semibold text-slate-900 text-lg group-hover:text-brand-900 transition-colors">{candidate.name}</span>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center gap-4">
                            <div className="flex items-start gap-3 text-sm text-slate-500 max-w-sm">
                                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                                <p>Votes are final and cannot be changed once submitted. exactly one vote is allowed per member.</p>
                            </div>
                            <button type="submit" className="shrink-0 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-brand-500/20 active:scale-[0.98]">
                                Cast Vote
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
