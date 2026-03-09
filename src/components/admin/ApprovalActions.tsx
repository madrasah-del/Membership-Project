'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { approveMembership, rejectMembership } from '@/app/admin/actions'

export function ApprovalActions({ membershipId }: { membershipId: string }) {
    const [isLoading, setIsLoading] = useState<'approve' | 'reject' | null>(null)

    const handleApprove = async () => {
        setIsLoading('approve')
        try {
            await approveMembership(membershipId)
            // Error handling could be added here, though revalidation handles success naturally
        } catch (error) {
            console.error('Failed to approve', error)
        } finally {
            setIsLoading(null)
        }
    }

    const handleReject = async () => {
        setIsLoading('reject')
        try {
            await rejectMembership(membershipId)
        } catch (error) {
            console.error('Failed to reject', error)
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className="flex items-center gap-2 justify-end">
            <button
                onClick={handleApprove}
                disabled={isLoading !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
                {isLoading === 'approve' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <CheckCircle2 className="w-4 h-4" />
                )}
                Approve
            </button>
            <button
                onClick={handleReject}
                disabled={isLoading !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
                {isLoading === 'reject' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <XCircle className="w-4 h-4" />
                )}
                Reject
            </button>
        </div>
    )
}
