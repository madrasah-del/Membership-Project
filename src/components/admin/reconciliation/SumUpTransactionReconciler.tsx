'use client'

import { useState, useEffect } from 'react'
import { Loader2, Search, Link as LinkIcon, CheckCircle2, AlertCircle, History } from 'lucide-react'
import { searchMemberships, linkSumUpTransaction } from '@/app/admin/reconciliation/actions'

export function SumUpTransactionReconciler() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [linkingTransaction, setLinkingTransaction] = useState<any | null>(null)
    const [isLinking, setIsLinking] = useState(false)

    useEffect(() => {
        fetchTransactions()
    }, [])

    const fetchTransactions = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/admin/sumup-sync?limit=20')
            if (!res.ok) throw new Error('Failed to fetch transactions')
            const data = await res.json()
            setTransactions(data.items || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async (val: string) => {
        setSearchQuery(val)
        if (val.length < 2) {
            setSearchResults([])
            return
        }
        setIsSearching(true)
        const results = await searchMemberships(val)
        setSearchResults(results)
        setIsSearching(false)
    }

    const handleLink = async (membershipId: string) => {
        if (!linkingTransaction) return
        setIsLinking(true)
        try {
            const res = await linkSumUpTransaction(membershipId, linkingTransaction)
            if (res.error) {
                alert(res.error)
            } else {
                // Remove from local list or mark as linked
                setTransactions(prev => prev.filter(t => t.transaction_id !== linkingTransaction.transaction_id))
                setLinkingTransaction(null)
                setSearchQuery('')
                setSearchResults([])
            }
        } catch (err) {
            console.error(err)
            alert('An error occurred while linking.')
        } finally {
            setIsLinking(false)
        }
    }

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50/50 p-4 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800">Recent Terminal Transactions (SumUp)</h2>
                    <button onClick={fetchTransactions} className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                        <History className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {error && (
                    <div className="p-6 text-center">
                        <div className="text-red-500 mb-2 font-medium flex items-center justify-center gap-2">
                            <AlertCircle className="w-5 h-5" /> Error fetching transactions
                        </div>
                        <p className="text-sm text-slate-500">{error}</p>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.map((t, idx) => (
                                <tr key={t.transaction_id || idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(t.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-base">
                                        £{t.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            t.status === 'SUCCESSFUL' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                        {t.transaction_id}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setLinkingTransaction(t)}
                                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 ml-auto"
                                        >
                                            <LinkIcon className="w-4 h-4" /> Link to Member
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && !error && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                        No recent transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Linking Modal/Panel */}
            {linkingTransaction && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-900">Link Transaction</h3>
                            <p className="text-sm text-slate-500 mt-1">Associate £{linkingTransaction.amount.toFixed(2)} with a member profile.</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search by member name..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {isSearching ? (
                                    <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(member => (
                                        <button 
                                            key={member.id}
                                            onClick={() => handleLink(member.id)}
                                            disabled={isLinking}
                                            className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50 transition-all flex justify-between items-center group"
                                        >
                                            <div>
                                                <div className="font-semibold text-slate-900">{member.first_name} {member.last_name}</div>
                                                <div className="text-xs text-slate-500 capitalize">{member.status.replace('_', ' ')}</div>
                                            </div>
                                            <CheckCircle2 className="w-5 h-5 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))
                                ) : searchQuery.length >= 2 ? (
                                    <div className="text-center p-4 text-slate-400 italic">No members found.</div>
                                ) : (
                                    <div className="text-center p-4 text-slate-400 text-sm italic">Type at least 2 characters to search.</div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button 
                                onClick={() => {
                                    setLinkingTransaction(null)
                                    setSearchQuery('')
                                    setSearchResults([])
                                }}
                                className="px-6 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
