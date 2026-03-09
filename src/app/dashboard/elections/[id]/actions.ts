'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitElectronicVote(formData: FormData) {
    const electionId = formData.get('electionId') as string
    const membershipId = formData.get('membershipId') as string
    const candidateId = formData.get('candidateId') as string

    if (!electionId || !membershipId || !candidateId) {
        throw new Error('Missing required fields')
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('Unauthorized')
    }

    // 1. Double check the membership belongs to the user
    const { data: membership } = await supabase
        .from('memberships')
        .select('id, user_id, status')
        .eq('id', membershipId)
        .single()

    if (!membership || membership.user_id !== user.id || membership.status !== 'active') {
        throw new Error('Invalid or inactive membership')
    }

    // 2. Double check election is active
    const { data: election } = await supabase
        .from('elections')
        .select('is_active, start_date, end_date')
        .eq('id', electionId)
        .single()

    if (!election || !election.is_active) {
        throw new Error('Election is not active')
    }

    const now = new Date()
    if (now < new Date(election.start_date) || now > new Date(election.end_date)) {
        throw new Error('Outside voting window')
    }

    // 3. Insert the electronic vote
    // Note: The unique constraint on (election_id, membership_id) in the DB will prevent duplicates
    // and RLS prevents users inserting for other membership_id's.
    const { error: voteError } = await supabase
        .from('votes')
        .insert({
            election_id: electionId,
            membership_id: membershipId,
            candidate_id: candidateId,
            method: 'electronic',
            recorded_by: user.id
        })

    if (voteError) {
        console.error('Error submitting electronic vote:', voteError)
        throw new Error('Failed to record vote. You may have already voted.')
    }

    revalidatePath(`/dashboard/elections/${electionId}`)
    revalidatePath('/dashboard/elections')
    revalidatePath(`/admin/elections/${electionId}`) // Revalidate admin side too
}
