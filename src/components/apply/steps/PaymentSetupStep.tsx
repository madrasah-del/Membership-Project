'use client'

import { useState } from 'react'
import { Loader2, RefreshCw, CreditCard, Landmark, Banknote, Star, ChevronRight, ShieldCheck } from 'lucide-react'

export type PaymentSetupData = {
    paymentMethod: 'sumup' | 'bank_transfer' | 'cash'
    isRecurring: boolean
}

type PaymentSetupStepProps = {
    onNext: (data: PaymentSetupData) => void
    isSubmitting: boolean
    membershipFee?: number
}

const PAYMENT_OPTIONS = [
    {
        id: 'sumup_recurring',
        method: 'sumup' as const,
        isRecurring: true,
        label: 'SumUp Online — Auto-Renew',
        sublabel: 'Yearly on 1st January',
        badge: 'Recommended',
        badgeColor: 'bg-brand-500 text-white',
        description: 'The easiest way to stay active. Pay securely by card now and we\'ll automatically renew your membership each year — no manual action needed.',
        icon: <RefreshCw className="w-6 h-6 text-brand-600" />,
        borderStyle: 'border-brand-400 ring-2 ring-brand-400',
        bgStyle: 'bg-gradient-to-br from-brand-50 to-white',
        benefits: ['Auto-renews every Jan 1st', 'Secure card payment', 'Instant confirmation', 'Marked as "Ongoing" in our system'],
    },
    {
        id: 'sumup_onetime',
        method: 'sumup' as const,
        isRecurring: false,
        label: 'SumUp Online — One-off',
        sublabel: 'Pay by card now, manual renewal next year',
        badge: null,
        badgeColor: '',
        description: 'Pay by card now. You\'ll need to remember to renew manually when your membership expires.',
        icon: <CreditCard className="w-6 h-6 text-slate-500" />,
        borderStyle: 'border-slate-200',
        bgStyle: 'bg-white',
        benefits: ['Secure card payment', 'Pay once now'],
    },
    {
        id: 'bank_transfer',
        method: 'bank_transfer' as const,
        isRecurring: false,
        label: 'Bank Transfer (BACS)',
        sublabel: 'Manually transfer from your bank',
        badge: null,
        badgeColor: '',
        description: 'Transfer directly to our bank account. Your membership will be confirmed once we match and verify your payment — this can take up to 5 working days.',
        icon: <Landmark className="w-6 h-6 text-slate-500" />,
        borderStyle: 'border-slate-200',
        bgStyle: 'bg-white',
        benefits: ['No card needed', 'Manual matching required'],
    },
    {
        id: 'cash',
        method: 'cash' as const,
        isRecurring: false,
        label: 'Cash / Cheque',
        sublabel: 'Pay in person at a mosque event',
        badge: null,
        badgeColor: '',
        description: 'Pay by cash or cheque to a committee member at the next mosque event. Please note this requires someone to manually log your payment.',
        icon: <Banknote className="w-6 h-6 text-slate-500" />,
        borderStyle: 'border-slate-200',
        bgStyle: 'bg-white',
        benefits: ['No internet required', 'In-person only'],
    },
]

export default function PaymentSetupStep({ onNext, isSubmitting, membershipFee = 10.00 }: PaymentSetupStepProps) {
    const [selectedOptionId, setSelectedOptionId] = useState<string>('sumup_recurring')

    const selectedOption = PAYMENT_OPTIONS.find(o => o.id === selectedOptionId)!

    const handleSubmit = () => {
        onNext({
            paymentMethod: selectedOption.method,
            isRecurring: selectedOption.isRecurring,
        })
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-2">
                <p className="text-slate-500 text-sm">
                    Membership fee: <span className="font-bold text-slate-800 text-base">£{membershipFee.toFixed(2)} / year</span>
                </p>
            </div>

            <div className="grid gap-3">
                {PAYMENT_OPTIONS.map((option) => {
                    const isSelected = selectedOptionId === option.id
                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedOptionId(option.id)}
                            className={`
                                w-full text-left rounded-2xl border-2 p-5 transition-all duration-200
                                ${isSelected ? option.borderStyle + ' ' + option.bgStyle : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}
                            `}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                    {option.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`font-semibold text-slate-900 ${isSelected && option.id === 'sumup_recurring' ? 'text-brand-900' : ''}`}>
                                            {option.label}
                                        </span>
                                        {option.badge && (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${option.badgeColor}`}>
                                                <Star className="w-3 h-3" /> {option.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-0.5">{option.sublabel}</p>
                                    {isSelected && (
                                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                                            <p className="text-sm text-slate-600">{option.description}</p>
                                            <ul className="space-y-1 mt-2">
                                                {option.benefits.map((b, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs text-slate-500">
                                                        <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                                        {b}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 transition-colors ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-300 bg-white'}`} />
                            </div>
                        </button>
                    )
                })}
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 text-white rounded-xl font-semibold text-base hover:bg-brand-700 transition-colors disabled:opacity-60 shadow-lg shadow-brand-500/20"
            >
                {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        Continue with {selectedOption.label.split(' — ')[0]}
                        <ChevronRight className="w-5 h-5" />
                    </>
                )}
            </button>
        </div>
    )
}
