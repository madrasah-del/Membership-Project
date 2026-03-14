'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SumUpSyncButton() {
    const [isSyncing, setIsSyncing] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const router = useRouter()

    const handleSync = async () => {
        setIsSyncing(true)
        setStatus('idle')
        try {
            const res = await fetch('/api/admin/sumup-sync?limit=50')
            if (!res.ok) throw new Error('Sync failed')
            
            // In a real app, we might also trigger a server action to process these
            // and match them with pending memberships automatically.
            
            setStatus('success')
            router.refresh()
            
            setTimeout(() => setStatus('idle'), 3000)
        } catch (err) {
            console.error(err)
            setStatus('error')
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            {status === 'success' && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                </span>
            )}
            {status === 'error' && (
                <span className="text-xs text-red-600 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5" /> Failed
                </span>
            )}
            
            <button
                onClick={handleSync}
                disabled={isSyncing}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isSyncing 
                        ? 'bg-slate-100 text-slate-400' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}
                `}
            >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync SumUp'}
            </button>
        </div>
    )
}
