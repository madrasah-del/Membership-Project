'use server'

import { createClient } from '@/lib/supabase/server'

export type ReconciliationMatch = {
    originalText: string;
    parsedName: string | null;
    parsedAmount: number | null;
    suggestedMembershipId: string | null;
    suggestedMembershipName: string | null;
    confidence: 'high' | 'medium' | 'low' | 'none';
    status: 'pending_payment' | 'active' | 'unknown'; // The status of the suggested membership
}

export async function parseBankStatement(rawText: string): Promise<ReconciliationMatch[]> {
    const supabase = await createClient()

    // 1. Fetch pending memberships to match against
    // We fetch those awaiting payment, as they are the prime candidates.
    const { data: pendingMembers, error } = await supabase
        .from('memberships')
        .select('id, first_name, last_name, status')
        .eq('status', 'pending_payment')

    if (error) {
        console.error('Error fetching pending members for reconciliation:', error)
        return []
    }

    // 2. Split raw text into lines
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const matches: ReconciliationMatch[] = []

    // 3. Simple Regex for Amounts (e.g., £10.00, 10.00, £ 10)
    const amountRegex = /(?:£\s*)?(\d+(?:\.\d{2})?)/;

    for (const line of lines) {
        const amountMatch = line.match(amountRegex)
        const parsedAmount = amountMatch ? parseFloat(amountMatch[1]) : null

        let bestMatch: Record<string, unknown> | null = null
        let highestConfidence: 'high' | 'medium' | 'low' | 'none' = 'none'

        // Basic Fuzzy matching on names
        // In a real scenario, this would use a proper fuzzy search library or full-text search.
        // For now, we look for exact substring matches of first OR last name in the string,
        // prioritizing if both are found.
        const lineLower = line.toLowerCase()

        if (pendingMembers) {
            for (const member of pendingMembers) {
                const firstLower = member.first_name.toLowerCase()
                const lastLower = member.last_name.toLowerCase()

                const hasFirst = lineLower.includes(firstLower)
                const hasLast = lineLower.includes(lastLower)

                if (hasFirst && hasLast) {
                    bestMatch = member
                    highestConfidence = 'high'
                    break; // Exact full name match, stop looking for this line
                } else if (hasFirst || hasLast) {
                    // If we already had a medium match, this might be a conflict,
                    // but we'll just take the first partial match for this simple prototype.
                    if (highestConfidence === 'none') {
                        bestMatch = member
                        highestConfidence = 'medium'
                    }
                }
            }
        }

        matches.push({
            originalText: line,
            parsedName: bestMatch ? `${bestMatch.first_name as string} ${bestMatch.last_name as string}` : null, // Extracted/Guessed name
            parsedAmount,
            suggestedMembershipId: (bestMatch?.id as string) || null,
            suggestedMembershipName: bestMatch ? `${bestMatch.first_name as string} ${bestMatch.last_name as string}` : null,
            confidence: highestConfidence,
            status: (bestMatch?.status as 'pending_payment' | 'active' | 'unknown') || 'unknown'
        })
    }

    return matches
}

export async function confirmReconciliationMatch(membershipId: string, amount: number) {
    const supabase = await createClient()

    // 1. Create a successful payment record
    const { error: paymentError } = await supabase
        .from('payments')
        .insert({
            membership_id: membershipId,
            amount: amount,
            payment_method: 'bank_transfer',
            status: 'successful',
            payment_type: 'new' // Assuming new for now, could add UI to select
        })

    if (paymentError) {
        return { error: 'Failed to create payment record.' }
    }

    // 2. Update membership status if needed (e.g. pending_payment -> pending_approval)
    const { error: updateError } = await supabase
        .from('memberships')
        .update({ status: 'pending_approval' })
        .eq('id', membershipId)

    if (updateError) {
        return { error: 'Payment logged, but failed to update membership status.' }
    }

    return { success: true }
}

export async function linkSumUpTransaction(membershipId: string, sumupTransaction: Record<string, unknown>) {
    const supabase = await createClient()

    // 1. Get member details
    const { data: membership } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('id', membershipId)
        .single()

    if (!membership) return { error: 'Membership not found' }

    // 2. Check for active Gift Aid declaration
    const { data: declaration } = await supabase
        .from('gift_aid_declarations')
        .select('id')
        .eq('user_id', membership.user_id)
        .eq('status', 'active')
        .maybeSingle()

    // 3. Create a donation record for this SumUp transaction
    // This allows us to track it for Gift Aid HMRC claims later
    const { error: donationError } = await supabase
        .from('donations')
        .insert({
            user_id: membership.user_id,
            amount: sumupTransaction.amount,
            currency: sumupTransaction.currency,
            status: 'successful',
            payment_method: 'sumup',
            source: 'terminal',
            sumup_transaction_id: sumupTransaction.transaction_id,
            gift_aid_declaration_id: declaration?.id || null,
            is_gift_aid_eligible: !!declaration,
            created_at: sumupTransaction.timestamp || new Date().toISOString()
        })

    if (donationError) {
        console.error('Error linking SumUp transaction:', donationError)
        return { error: 'Failed to create donation record for reconciliation.' }
    }

    return { success: true }
}

export async function searchMemberships(query: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('memberships')
        .select('id, first_name, last_name, status')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(10)

    if (error) {
        console.error('Error searching memberships:', error)
        return []
    }

    return data
}
