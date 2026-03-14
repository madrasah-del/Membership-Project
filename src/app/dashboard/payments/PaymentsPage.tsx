'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMemberPayments, cancelAutoRenewal, initializeCardUpdateCheckout, finalizeCardUpdate, initializeMembershipPayment, recordDashboardPaymentSuccess } from './actions'
import { format } from 'date-fns'
import { CreditCard, AlertCircle, RefreshCw, XCircle, CheckCircle, Edit, ShieldCheck, Save, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SumUpCheckoutWidget from '@/components/apply/steps/SumUpCheckoutWidget'

export default function PaymentsPage({
    initialPayments,
    hasActiveSubscription,
    membershipId,
    activeInstrument,
    membershipStatus,
    baseFee = 10.00,
    dependentCount = 0
}: {
    initialPayments: Array<any>,
    hasActiveSubscription: boolean,
    membershipId: string | null,
    activeInstrument: { brand: string, last4: string, expMonth: string, expYear: string } | null,
    membershipStatus?: string,
    baseFee?: number,
    dependentCount?: number
}) {
    const router = useRouter()
    const [payments, setPayments] = useState(initialPayments)
    const [isCancelling, setIsCancelling] = useState(false)
    const [cancelStatus, setCancelStatus] = useState<null | 'success' | 'error'>(null)
    const [cancelMessage, setCancelMessage] = useState('')

    // Shared Checkout State
    const [isInitializingPayment, setIsInitializingPayment] = useState(false)
    const [paymentCheckoutId, setPaymentCheckoutId] = useState<string | null>(null)
    const [paymentStatus, setPaymentStatus] = useState<null | 'success' | 'error'>(null)
    const [paymentMessage, setPaymentMessage] = useState('')
    const [mode, setMode] = useState<'pay' | 'update' | null>(null)

    const totalFee = baseFee + (dependentCount * 5.00)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('pay') === 'true' && (membershipStatus === 'pending_payment' || membershipStatus === 'pending' || membershipStatus === 'approved')) {
            startPayment();
        } else if (urlParams.get('update') === 'true') {
            startUpdate();
        }
    }, [membershipStatus]); // Added membershipStatus to dependency array

    const formatCardBrand = (brand: string) => {
        if (!brand) return 'Card'
        return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase()
    }

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
                setPayments(payments.map(p => ({ ...p, is_recurring: false })))
                router.refresh()
            }
        } catch (error) {
            setCancelStatus('error')
            setCancelMessage('An unexpected error occurred.')
        } finally {
            setIsCancelling(false)
        }
    }

    const startUpdate = async () => {
        if (!membershipId) return
        setMode('update')
        setIsInitializingPayment(true)
        setPaymentStatus(null)
        setPaymentMessage('')

        try {
            const result = await initializeCardUpdateCheckout(membershipId)
            if (result.error) {
                setPaymentStatus('error')
                setPaymentMessage(result.error)
            } else if (result.checkoutId) {
                setPaymentCheckoutId(result.checkoutId)
            }
        } catch (error) {
            setPaymentStatus('error')
            setPaymentMessage('An unexpected error occurred.')
        } finally {
            setIsInitializingPayment(false)
        }
    }

    const startPayment = async () => {
        if (!membershipId) return
        setMode('pay')
        setIsInitializingPayment(true)
        setPaymentStatus(null)
        setPaymentMessage('')

        try {
            const result = await initializeMembershipPayment(membershipId, totalFee)
            if (result.error) {
                setPaymentStatus('error')
                setPaymentMessage(result.error)
            } else if (result.checkoutId) {
                setPaymentCheckoutId(result.checkoutId)
            }
        } catch (error) {
            setPaymentStatus('error')
            setPaymentMessage('An unexpected error occurred.')
        } finally {
            setIsInitializingPayment(false)
        }
    }

    const handleFinalSuccess = async (transactionId: string) => {
        setPaymentCheckoutId(null)
        setIsInitializingPayment(true)
        try {
            if (membershipId) {
                if (mode === 'update') {
                    const result = await finalizeCardUpdate(membershipId)
                    setPaymentStatus('success')
                    setPaymentMessage('Payment method updated successfully.')
                } else {
                    const result = await recordDashboardPaymentSuccess(membershipId, transactionId, totalFee)
                    if (result.success) {
                        setPaymentStatus('success')
                        setPaymentMessage(`Payment of £${totalFee.toFixed(2)} successful!`)
                    } else {
                        setPaymentStatus('error')
                        setPaymentMessage(result.error || 'Failed to record payment.')
                    }
                }
                router.refresh()
            }
        } catch (error) {
            setPaymentStatus('error')
            setPaymentMessage('Error finalising transaction.')
        } finally {
            setIsInitializingPayment(false)
            setMode(null)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payments & Subscription</h1>
                    <p className="text-gray-500 mt-1 text-lg">Manage your membership fees and payment methods</p>
                </div>
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-600 bg-indigo-50 px-3 py-1 rounded-full ring-1 ring-indigo-200">Secure Payments via SumUp</span>
                </div>
            </div>

            {/* Complete Membership Payment Section */}
            {(membershipStatus === 'pending_payment' || membershipStatus === 'pending' || membershipStatus === 'approved') && (
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                        <CreditCard size={240} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md ring-1 ring-white/20">
                            <Clock className="w-10 h-10 text-indigo-200" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-white mb-2">Complete Your Membership</h2>
                            <p className="text-indigo-100/80 text-lg max-w-xl">
                                Your membership is currently pending payment. To unlock all features and benefits, please pay the annual fee. 
                                This will enable auto-renewal for next year.
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-2xl backdrop-blur-md ring-1 ring-white/10">
                            <div className="text-center">
                                <p className="text-sm text-indigo-200 uppercase tracking-widest font-bold">Total Due Now</p>
                                <p className="text-5xl font-black text-white mt-1">£{totalFee.toFixed(2)}</p>
                            </div>
                            <button
                                onClick={startPayment}
                                disabled={isInitializingPayment}
                                className="w-full bg-white text-indigo-900 hover:bg-indigo-50 px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-950/20 transform active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                {isInitializingPayment ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        PAY NOW
                                        <ShieldCheck className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Payment Method */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-600" />
                                Payment Method
                            </h3>
                            {hasActiveSubscription && (
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    ACTIVE
                                </span>
                            )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            {activeInstrument ? (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <CreditCard size={80} />
                                        </div>
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="bg-white/20 p-2 rounded-lg">
                                                <CreditCard className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-bold tracking-widest">{formatCardBrand(activeInstrument.brand)}</span>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-xl font-mono tracking-[0.2em]">•••• •••• •••• {activeInstrument.last4}</p>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-1">Expires</p>
                                                    <p className="font-bold">{activeInstrument.expMonth}/{activeInstrument.expYear}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={startUpdate}
                                            disabled={isInitializingPayment}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 font-semibold bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Update Payment Method
                                        </button>
                                        <button
                                            onClick={handleCancelSubscription}
                                            disabled={isCancelling}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 font-semibold bg-red-50 hover:bg-red-100 transition-colors rounded-xl"
                                        >
                                            {isCancelling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Cancel Auto-Renewal
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
                                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                                        <CreditCard className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium max-w-[200px]">No active payment method on file.</p>
                                    <button
                                        onClick={startUpdate}
                                        disabled={isInitializingPayment}
                                        className="mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 text-white font-black rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95 text-xs uppercase tracking-widest w-full"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        Add Payment Method
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status and Notifications */}
                <div className="lg:col-span-2 space-y-6">
                    {paymentStatus && (
                        <div className={`p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${
                            paymentStatus === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
                        }`}>
                            {paymentStatus === 'success' ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
                            <div>
                                <h4 className="font-bold text-lg">{paymentStatus === 'success' ? 'Transaction Success' : 'Transaction Failed'}</h4>
                                <p className="mt-1 font-medium opacity-90">{paymentMessage}</p>
                            </div>
                        </div>
                    )}

                    {cancelStatus && (
                        <div className={`p-6 rounded-2xl flex items-start gap-4 ${
                            cancelStatus === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
                        }`}>
                            {cancelStatus === 'success' ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
                            <div>
                                <h4 className="font-bold">{cancelStatus === 'success' ? 'Subscription Updated' : 'Action Failed'}</h4>
                                <p className="text-sm mt-1">{cancelMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Payment History Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Payment History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Description</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(payments || []).length > 0 ? (
                                        payments.map((payment: any, index) => (
                                            <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-900">Annual Membership Fee</span>
                                                        {payment.is_recurring && (
                                                            <RefreshCw className="w-3 h-3 text-indigo-500" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-gray-900">£{Number(payment.amount).toFixed(2)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                        payment.status === 'completed' 
                                                        ? 'bg-emerald-100 text-emerald-700' 
                                                        : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {payment.status === 'completed' ? 'Paid' : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Clock className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No payment records found.</p>
                                                <Link 
                                                    href="/dashboard/payments?pay=true"
                                                    className="group/pay block w-full text-center bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-brand-50 transition-all shadow-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 mt-6"
                                                >
                                                    <CreditCard className="w-4 h-4 text-brand-600 group-hover/pay:scale-110 transition-transform" />
                                                    Pay Annual Membership Fee
                                                </Link>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* SumUp Payment Modal */}
            {paymentCheckoutId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setPaymentCheckoutId(null)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-100 text-center">
                            <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {mode === 'update' ? 'Update Payment Method' : 'Complete Membership'}
                            </h3>
                            <p className="text-gray-500 mt-2">
                                {mode === 'update' 
                                    ? 'A £1.00 setup charge will be applied to verify your new card (it will be credited back or used for next renewal).' 
                                    : `You are paying £${totalFee.toFixed(2)} for your annual membership.`
                                }
                            </p>
                        </div>
                        <div className="p-8 pb-12">
                            <SumUpCheckoutWidget 
                                checkoutId={paymentCheckoutId} 
                                onComplete={(status, transId) => {
                                    if (status === 'SUCCESS') {
                                        handleFinalSuccess(transId || 'unknown')
                                    } else {
                                        setPaymentStatus('error')
                                        setPaymentMessage('Payment was cancelled or failed.')
                                        setPaymentCheckoutId(null)
                                    }
                                }}
                            />
                        </div>
                        <button 
                            onClick={() => setPaymentCheckoutId(null)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
