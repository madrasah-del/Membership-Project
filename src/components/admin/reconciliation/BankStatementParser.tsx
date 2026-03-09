'use client'

import { useState } from 'react'
import { parseBankStatement, ReconciliationMatch, confirmReconciliationMatch } from '@/app/admin/reconciliation/actions'
import { Loader2, CheckCircle2, AlertTriangle, HelpCircle, UploadCloud } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BankStatementParser() {
    const [rawText, setRawText] = useState('')
    const [isParsing, setIsParsing] = useState(false)
    const [matches, setMatches] = useState<ReconciliationMatch[]>([])
    const [hasParsed, setHasParsed] = useState(false)
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
    const router = useRouter()

    const handleParse = async () => {
        if (!rawText.trim()) return

        setIsParsing(true)
        try {
            const result = await parseBankStatement(rawText)
            setMatches(result)
            setHasParsed(true)
        } catch (error) {
            console.error(error)
        } finally {
            setIsParsing(false)
        }
    }

    const handleConfirm = async (matchIndex: number, membershipId: string, amount: number | null) => {
        if (!amount) {
            alert("Cannot confirm without a parsed amount.")
            return;
        }

        const matchId = `match-${matchIndex}`
        setProcessingIds(new Set([...processingIds, matchId]))

        try {
            const result = await confirmReconciliationMatch(membershipId, amount)
            if (result.success) {
                // Update local state to show it was processed
                setMatches(current =>
                    current.map((m, i) =>
                        i === matchIndex ? { ...m, status: 'active' } : m // optimistic update to 'active' or 'processed'
                    )
                )
                router.refresh() // Refresh layout data if needed anywhere
            } else {
                alert(result.error)
            }
        } finally {
            setProcessingIds(current => {
                const next = new Set(current)
                next.delete(matchId)
                return next
            })
        }
    }

    const renderConfidenceBadge = (confidence: string) => {
        switch (confidence) {
            case 'high': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">High Confidence</span>
            case 'medium': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Partial Match</span>
            default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">No Match</span>
        }
    }


    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Paste Bank Statement Data</h2>
                <div className="space-y-4">
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Paste rows from bank statement here (e.g. '01 Jan MR JOHN DOE £10.00')..."
                        className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-y"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleParse}
                            disabled={isParsing || !rawText.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                        >
                            {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                            {isParsing ? 'Parsing...' : 'Analyze Text'}
                        </button>
                    </div>
                </div>
            </div>

            {hasParsed && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50/50 p-4">
                        <h2 className="font-semibold text-slate-800">Analysis Results ({matches.length} lines parsed)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Original Text Line</th>
                                    <th className="px-6 py-4">Parsed Amount</th>
                                    <th className="px-6 py-4">Suggested Match</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {matches.map((match, index) => {
                                    const isProcessed = match.status !== 'pending_payment' && match.status !== 'unknown'
                                    const matchId = `match-${index}`
                                    const isProcessing = processingIds.has(matchId)

                                    return (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500 max-w-sm truncate">
                                                {match.originalText}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                {match.parsedAmount ? `£${match.parsedAmount.toFixed(2)}` : <span className="text-slate-400 font-normal">Not found</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {match.suggestedMembershipName ? (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="font-medium text-slate-900">{match.suggestedMembershipName}</span>
                                                        {renderConfidenceBadge(match.confidence)}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic flex items-center gap-1">
                                                        <HelpCircle className="w-3.5 h-3.5" /> No pending member found
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isProcessed ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm">
                                                        <CheckCircle2 className="w-4 h-4" /> Processed
                                                    </span>
                                                ) : match.suggestedMembershipId && match.parsedAmount ? (
                                                    <button
                                                        onClick={() => handleConfirm(index, match.suggestedMembershipId!, match.parsedAmount)}
                                                        disabled={isProcessing}
                                                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2 ml-auto"
                                                    >
                                                        {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                        Confirm & Link
                                                    </button>
                                                ) : (
                                                    <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium ml-auto cursor-not-allowed">
                                                        Cannot Link
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}

                                {matches.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            No meaningful text lines found to parse.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
