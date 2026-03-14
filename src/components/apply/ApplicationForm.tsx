'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from 'lucide-react'

// Step Components
import { PersonalDetailsStep } from './steps/PersonalDetailsStep'
import { AddressStep } from './steps/AddressStep'
import { DependentsStep } from './steps/DependentsStep'
import { EligibilityStep } from './steps/EligibilityStep'
import PaymentSetupStep from './steps/PaymentSetupStep'
import { PostPaymentStep } from './steps/PostPaymentStep'
import SumUpCheckoutWidget from './steps/SumUpCheckoutWidget'

// Actions and Validations
import { submitApplication, recordPaymentSuccess } from '@/app/apply/actions'
import { PersonalDetailsData, AddressData, DependentsData, EligibilityData } from '@/lib/validations'

const STEPS = [
    { id: 'personal', title: 'Personal Details' },
    { id: 'address', title: 'Contact & Address' },
    { id: 'dependents', title: 'Dependents' },
    { id: 'eligibility', title: 'Eligibility' },
    { id: 'payment', title: 'Payment Setup' },
    { id: 'post-payment', title: 'Final Details' },
]

export default function ApplicationForm({
    membershipFee = 10.00,
    initialPersonalDetails = {}
}: {
    membershipFee?: number,
    initialPersonalDetails?: Partial<PersonalDetailsData>
}) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [membershipId, setMembershipId] = useState<string | null>(null)

    // SumUp State
    const [sumupCheckoutId, setSumupCheckoutId] = useState<string | null>(null)
    const [isAwaitingSumUp, setIsAwaitingSumUp] = useState(false)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)

    // Form State
    const [personalDetails, setPersonalDetails] = useState<Partial<PersonalDetailsData>>(initialPersonalDetails)
    const [addressDetails, setAddressDetails] = useState<Partial<AddressData>>({})
    const [dependentsDetails, setDependentsDetails] = useState<Partial<DependentsData>>({ dependents: [] })
    const [eligibilityDetails, setEligibilityDetails] = useState<Partial<EligibilityData>>({
        whatsappOptIn: false,
        isResidentOrRegular: false,
        isSunniMuslim: false
    })

    const handleNext = async (data: any) => {
        // Save current step data
        if (currentStep === 0) setPersonalDetails(data)
        if (currentStep === 1) setAddressDetails(data)
        if (currentStep === 2) setDependentsDetails(data)
        if (currentStep === 3) setEligibilityDetails(data)

        // Final submission if at payment step
        if (currentStep === 4) {
            await handleSubmit(data)
        } else {
            setCurrentStep((prev) => prev + 1)
            window.scrollTo(0, 0)
        }
    }

    const handleBack = () => {
        // Don't allow going back from post-payment if they paid
        if (currentStep === 5) return
        setCurrentStep((prev) => Math.max(0, prev - 1))
        window.scrollTo(0, 0)
    }

    const handleSubmit = async (finalPaymentData: any) => {
        setIsSubmitting(true)
        setError(null)

        const fullData = {
            ...personalDetails,
            ...addressDetails,
            ...dependentsDetails,
            ...eligibilityDetails,
            paymentMethod: finalPaymentData.paymentMethod,
            isRecurring: finalPaymentData.isRecurring,
            hasGiftAidDeclaration: finalPaymentData.giftAidConsent,
        }

        try {
            const result = await submitApplication(fullData as any)
            if (result.error) {
                setError(result.error)
                setIsSubmitting(false)
            } else {
                setMembershipId(result.membershipId || null)
                setSelectedPaymentMethod(finalPaymentData.paymentMethod)
                
                if (finalPaymentData.paymentMethod === 'sumup' && result.membershipId && result.amount) {
                    // Initialize SumUp Checkout API
                    const sumupRes = await fetch('/api/sumup/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: result.amount,
                            membershipId: result.membershipId,
                            email: personalDetails.email,
                            name: result.applicantName,
                            isRecurring: finalPaymentData.isRecurring
                        })
                    })
                    const sumupData = await sumupRes.json()
                    if (!sumupRes.ok || !sumupData.checkoutId) {
                        setError(sumupData.error || 'Failed to initialize payment gateway')
                        setIsSubmitting(false)
                        return
                    }
                    setSumupCheckoutId(sumupData.checkoutId)
                    setIsAwaitingSumUp(true)
                } else {
                    // For non-sumup, go to post-payment directly
                    setCurrentStep(5)
                }
            }
        } catch {
            setError('An unexpected error occurred while saving your application.')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto w-full animate-fade-in-up">

            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full -z-10">
                        <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                        />
                    </div>

                    {STEPS.map((step, index) => {
                        const isCompleted = index < currentStep
                        const isActive = index === currentStep

                        return (
                            <div key={step.id} className="flex flex-col items-center z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all shadow-sm
                  ${isActive ? 'bg-brand-600 text-white shadow-brand-500/30' :
                                        isCompleted ? 'bg-brand-100 text-brand-700 border border-brand-200' :
                                            'bg-white text-slate-400 border border-slate-200'}`}
                                >
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                                </div>
                                <span className={`text-xs mt-2 font-medium hidden sm:block ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {step.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 overflow-hidden">

                {/* Step Header */}
                <div className="bg-slate-50/50 border-b border-slate-100 p-6 flex items-center gap-4">
                    {currentStep > 0 && currentStep < 5 && (
                        <button
                            onClick={handleBack}
                            disabled={isSubmitting}
                            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shrink-0 disabled:opacity-50"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Step {currentStep + 1}: {STEPS[currentStep].title}</h2>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {currentStep === 5 
                                ? "Great! Almost done. Help the committee get to know you." 
                                : "Please provide accurate information to complete your application."}
                        </p>
                    </div>
                </div>

                {/* Global Error Banner */}
                {error && (
                    <div className="m-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm flex items-start">
                        <span className="font-semibold mr-2">Error:</span> {error}
                    </div>
                )}

                {/* Form Area */}
                <div className="p-6">
                    {currentStep === 0 && (
                        <PersonalDetailsStep
                            initialData={personalDetails}
                            onNext={handleNext}
                        />
                    )}
                    {currentStep === 1 && (
                        <AddressStep
                            initialData={addressDetails}
                            onNext={handleNext}
                        />
                    )}
                    {currentStep === 2 && (
                        <DependentsStep
                            initialData={dependentsDetails}
                            onNext={handleNext}
                        />
                    )}
                    {currentStep === 3 && (
                        <EligibilityStep
                            initialData={eligibilityDetails}
                            onNext={handleNext}
                            isSubmitting={isSubmitting}
                            isEpsomResident={
                                addressDetails.town?.toLowerCase().includes('epsom') || 
                                ['KT17', 'KT18', 'KT19'].some(pc => addressDetails.postcode?.toUpperCase().startsWith(pc))
                            }
                        />
                    )}
                    {currentStep === 4 && !isAwaitingSumUp && (
                        <PaymentSetupStep
                            onNext={handleNext}
                            isSubmitting={isSubmitting}
                            membershipFee={membershipFee + ((dependentsDetails.dependents?.length || 0) * membershipFee)}
                        />
                    )}
                    {currentStep === 5 && membershipId && (
                        <PostPaymentStep
                            membershipId={membershipId}
                            paymentMethod={selectedPaymentMethod || 'bank_transfer'}
                            onComplete={() => router.push('/dashboard')}
                        />
                    )}
                    {isAwaitingSumUp && sumupCheckoutId && (
                        <SumUpCheckoutWidget
                            checkoutId={sumupCheckoutId}
                            onComplete={async (status, transactionId) => {
                                if (status === 'SUCCESS' && membershipId) {
                                    await recordPaymentSuccess(membershipId, transactionId || 'sumup_success_no_id')
                                    setIsAwaitingSumUp(false)
                                    setCurrentStep(5)
                                    window.scrollTo(0, 0)
                                } else if (status === 'FAILED') {
                                    setIsAwaitingSumUp(false)
                                    setSumupCheckoutId(null)
                                }
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
