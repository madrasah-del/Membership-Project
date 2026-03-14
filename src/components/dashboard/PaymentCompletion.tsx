'use client'

import { useState, useEffect } from 'react'
import { Loader2, CreditCard, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SumUpCheckoutWidget from '@/components/apply/steps/SumUpCheckoutWidget'
import { recordPaymentSuccess } from '@/app/apply/actions'

interface Props {
    membership: {
        id: string
        first_name: string
        last_name: string
        payments: Array<{
            id: string
            amount: number
            status: string
        }>
    }
}

export default function PaymentCompletion({ membership }: Props) {
    const [checkoutId, setCheckoutId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')

    const pendingPayment = (membership.payments as any)[0]

    useEffect(() => {
        async function initCheckout() {
            try {
                const res = await fetch('/api/sumup/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: pendingPayment.amount,
                        membershipId: membership.id,
                        name: `${membership.first_name} ${membership.last_name}`,
                        // We assume most will want recurring but for dashboard retry we keep it simple for now
                        isRecurring: true 
                    })
                })
                const data = await res.json()
                if (data.checkoutId) {
                    setCheckoutId(data.checkoutId)
                } else {
                    setError(data.error || 'Failed to initialize payment')
                }
            } catch (err) {
                setError('Failed to connect to payment gateway')
            } finally {
                setIsLoading(false)
            }
        }

        initCheckout()
    }, [membership, pendingPayment.amount])

    const handlePaymentComplete = async (sumupStatus: 'SUCCESS' | 'FAILED', transactionId?: string) => {
        if (sumupStatus === 'SUCCESS') {
            if (membership.id) {
                await recordPaymentSuccess(membership.id, transactionId || 'sumup_success_no_id')
            }
            setStatus('success')
        } else {
            setStatus('failed')
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-white rounded-[2.5rem] p-12 border border-slate-200 text-center shadow-xl shadow-slate-200/50">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mx-auto mb-8">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4">Payment Successful!</h1>
                <p className="text-slate-500 text-lg mb-10">
                    Thank you! Your payment has been received and your application is now being processed.
                </p>
                <Link href="/dashboard" className="bg-slate-900 text-white font-bold py-4 px-10 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                    Go to Dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="p-8 md:p-12 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Complete Payment</h1>
                        <p className="text-slate-500">Membership Application Fee</p>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Amount Due</p>
                        <p className="text-4xl font-black text-slate-900">£{pendingPayment.amount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Applicant</p>
                        <p className="text-lg font-bold text-slate-900">{membership.first_name} {membership.last_name}</p>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
                        <p className="text-slate-500 font-medium">Initializing secure gateway...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                        <h3 className="text-red-900 font-bold mb-2">Error</h3>
                        <p className="text-red-700 text-sm">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-6 text-brand-600 font-bold hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                ) : checkoutId ? (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-500 mt-1">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Safe and secure payment via SumUp. Once confirmed, your application status updates automatically.
                            </p>
                        </div>
                        <SumUpCheckoutWidget 
                            checkoutId={checkoutId}
                            onComplete={handlePaymentComplete}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    )
}
