'use client'

import { useState } from 'react'
import { getMemberPayments, cancelAutoRenewal, initializeCardUpdateCheckout, finalizeCardUpdate } from './actions'
import { format } from 'date-fns'
import { CreditCard, AlertCircle, RefreshCw, XCircle, CheckCircle, Edit, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SumUpCheckoutWidget from '@/components/apply/steps/SumUpCheckoutWidget'

export default function PaymentsPage({
    initialPayments,
    hasActiveSubscription,
    membershipId,
    activeInstrument
}: {
    initialPayments: any[],
    hasActiveSubscription: boolean,
    membershipId: string | null,
    activeInstrument: { brand: string, last4: string, expMonth: string, expYear: string } | null
}) {
    const router = useRouter()
    const [payments, setPayments] = useState(initialPayments)
    const [isCancelling, setIsCancelling] = useState(false)
    const [cancelStatus, setCancelStatus] = useState<null | 'success' | 'error'>(null)
    const [cancelMessage, setCancelMessage] = useState('')

    // Update Card State
    const [isInitializingUpdate, setIsInitializingUpdate] = useState(false)
    const [updateCheckoutId, setUpdateCheckoutId] = useState<string | null>(null)
    const [updateStatus, setUpdateStatus] = useState<null | 'success' | 'error'>(null)
    const [updateMessage, setUpdateMessage] = useState('')

    const handleCancelSubscription = async () => {
        if (!membershipId) return
        if (!confirm('Are you sure you want to cancel your auto-renewing subscription? You will need to manually pay next year to remain an active member.')) {
            return
        }

        setIsCancelling(true)
        setCancelStatus(null)
        setCancelMessage('')

        try {
            const result = await cancelAutoRenewal(membershipId)

            if (result.error) {
                setCancelStatus('error')
                setCancelMessage(result.error)
            } else {
                setCancelStatus('success')
                setCancelMessage('Your subscription has been successfully cancelled.')
                // Update local list to hide recurring badge
                setPayments(payments.map(p => ({ ...p, is_recurring: false })))
                // Reset card details since they are deleted remotely
                router.refresh()
            }
        } catch (error) {
            setCancelStatus('error')
            setCancelMessage('An unexpected error occurred.')
        } finally {
            setIsCancelling(false)
        }
    }

    const handleUpdateCard = async () => {
        if (!membershipId) return
        setIsInitializingUpdate(true)
        setUpdateStatus(null)
        setUpdateMessage('')

        try {
            // 1. Create a £1 (or 0) setup checkout
            const result = await initializeCardUpdateCheckout(membershipId)

            if (result.error) {
                setUpdateStatus('error')
                setUpdateMessage(result.error)
                setIsInitializingUpdate(false)
            } else if (result.checkoutId) {
                // 2. Open the widget with the returned ID
                setUpdateCheckoutId(result.checkoutId)
                setIsInitializingUpdate(false)
            }
        } catch (error) {
            setUpdateStatus('error')
            setUpdateMessage('An unexpected error occurred while starting card update.')
            setIsInitializingUpdate(false)
        }
    }

    const handleUpdateSuccess = async () => {
        setUpdateCheckoutId(null) // Hide widget
        setIsInitializingUpdate(true) // Show loading spinner while we clean up

        try {
            // 3. Finalize: delete old cards, revalidate to get new card info
            if (membershipId) {
                const result = await finalizeCardUpdate(membershipId)
                if (result.success) {
                    setUpdateStatus('success')
                    setUpdateMessage('Your payment method has been successfully updated.')
                    router.refresh()
                } else {
                    // We got a new card but couldn't delete the old one, still mostly a success
                    setUpdateStatus('success')
                    setUpdateMessage('Your payment method has been updated.')
                    router.refresh()
                }
            }
        } catch (error) {
            setUpdateStatus('error')
            setUpdateMessage('Card was updated, but an error occurred during finalization.')
        } finally {
            setIsInitializingUpdate(false)
        }
    }

    const formatCardBrand = (brand: string) => {
        // E.g. "VISA" -> "Visa", "MASTERCARD" -> "Mastercard"
        if (!brand) return 'Card'
        return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase()
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in relative">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Payments & Subscriptions</h1>

            {/* Status Messages */}
            {cancelStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-red-800">Cancellation Failed</h4>
                        <p className="text-sm mt-1">{cancelMessage}</p>
                    </div>
                </div>
            )}

            {cancelStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-700">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-green-800">Subscription Cancelled</h4>
                        <p className="text-sm mt-1">{cancelMessage}</p>
                    </div>
                </div>
            )}

            {updateStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-red-800">Update Failed</h4>
                        <p className="text-sm mt-1">{updateMessage}</p>
                    </div>
                </div>
            )}

            {updateStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-700">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-green-800">Payment Updated</h4>
                        <p className="text-sm mt-1">{updateMessage}</p>
                    </div>
                </div>
            )}

            {/* SumUp Widget Overlay for Card Update */}
            {updateCheckoutId && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Update Payment Method</h3>
                            <button
                                onClick={() => setUpdateCheckoutId(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <SumUpCheckoutWidget
                                checkoutId={updateCheckoutId}
                                onSuccess={handleUpdateSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Active Subscription Card */}
            {hasActiveSubscription && cancelStatus !== 'success' && (
                <div className="mb-8 overflow-hidden bg-white border border-brand-200/60 rounded-2xl shadow-sm">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-50 to-brand-100/30 p-6 border-b border-brand-100/50">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <RefreshCw className="w-5 h-5 text-brand-600" />
                                    <h2 className="text-lg font-semibold text-brand-900">Active Annual Subscription</h2>
                                </div>
                                <p className="text-brand-700/80 text-sm max-w-2xl">
                                    Your membership fee will be automatically collected annually. Manage your payment method below.
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            {/* Card Details */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
                                    <CreditCard className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    {activeInstrument ? (
                                        <>
                                            <p className="font-medium text-slate-900">
                                                {formatCardBrand(activeInstrument.brand)} •••• {activeInstrument.last4}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Expires {activeInstrument.expMonth}/{activeInstrument.expYear}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-medium text-slate-900">Payment method securely stored</p>
                                            <p className="text-sm text-slate-500">Managed by SumUp</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleUpdateCard}
                                    disabled={isInitializingUpdate || isCancelling}
                                    className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:text-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isInitializingUpdate ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                                    Update Card
                                </button>
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={isCancelling || isInitializingUpdate}
                                    className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isCancelling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Cancel <span className="hidden sm:inline">Auto-Renewal</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment History Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 inline-flex w-full">
                    <ShieldCheck className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-900">Payment History</h3>
                </div>

                {payments.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        No historic payments found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium border-b border-slate-100">Date</th>
                                    <th className="px-6 py-4 font-medium border-b border-slate-100">Amount</th>
                                    <th className="px-6 py-4 font-medium border-b border-slate-100">Method</th>
                                    <th className="px-6 py-4 font-medium border-b border-slate-100">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                                            {format(new Date(payment.created_at), 'dd MMM yyyy, HH:mm')}
                                            {payment.is_recurring && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-brand-100 text-brand-700">
                                                    Auto-Renew Setup
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            £{Number(payment.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                                                {payment.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${payment.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : payment.status === 'pending_verification' || payment.status === 'pending'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {payment.status === 'completed' ? 'Paid' : payment.status === 'pending' ? 'Pending' : payment.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
