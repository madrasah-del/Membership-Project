'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronRight, Loader2, ArrowLeft } from 'lucide-react'

// Step Components
import { PersonalDetailsStep } from './steps/PersonalDetailsStep'
import { AddressStep } from './steps/AddressStep'
import { PhotoUploadStep } from './steps/PhotoUploadStep'
import { DependentsStep } from './steps/DependentsStep'
import { EligibilityStep } from './steps/EligibilityStep'
import PaymentSetupStep, { PaymentSetupData } from './steps/PaymentSetupStep'

// Actions and Validations
import { submitApplication } from '@/app/apply/actions'
import { PersonalDetailsData, AddressData, PhotoData, DependentsData, EligibilityData } from '@/lib/validations'

const STEPS = [
    { id: 'personal', title: 'Personal Details' },
    { id: 'address', title: 'Contact & Address' },
    { id: 'photo', title: 'Profile Photo' },
    { id: 'dependents', title: 'Dependents' },
    { id: 'eligibility', title: 'Eligibility' },
    { id: 'payment', title: 'Payment Setup' },
]

export default function ApplicationForm({ membershipFee = 10.00 }: { membershipFee?: number }) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [personalDetails, setPersonalDetails] = useState<Partial<PersonalDetailsData>>({})
    const [addressDetails, setAddressDetails] = useState<Partial<AddressData>>({})
    const [photoDetails, setPhotoDetails] = useState<Partial<PhotoData>>({})
    const [dependentsDetails, setDependentsDetails] = useState<Partial<DependentsData>>({ dependents: [] })
    const [eligibilityDetails, setEligibilityDetails] = useState<Partial<EligibilityData>>({
        whatsappOptIn: false,
        isResidentOrRegular: false,
        isSunniMuslim: false
    })
    const [paymentSetup, setPaymentSetup] = useState<Partial<PaymentSetupData>>({})

    const handleNext = async (data: any) => {
        // Save current step data
        if (currentStep === 0) setPersonalDetails(data)
        if (currentStep === 1) setAddressDetails(data)
        if (currentStep === 2) setPhotoDetails(data)
        if (currentStep === 3) setDependentsDetails(data)
        if (currentStep === 4) setEligibilityDetails(data)

        // Final submission if last step (payment step)
        if (currentStep === STEPS.length - 1) {
            setPaymentSetup(data)
            await handleSubmit(data as PaymentSetupData)
        } else {
            setCurrentStep((prev) => prev + 1)
            window.scrollTo(0, 0)
        }
    }

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(0, prev - 1))
        window.scrollTo(0, 0)
    }

    const handleSubmit = async (finalPaymentData: PaymentSetupData) => {
        setIsSubmitting(true)
        setError(null)

        const fullData = {
            ...personalDetails,
            ...addressDetails,
            ...photoDetails,
            ...dependentsDetails,
            ...eligibilityDetails,
            paymentMethod: finalPaymentData.paymentMethod,
            isRecurring: finalPaymentData.isRecurring,
        }

        try {
            const result = await submitApplication(fullData)
            if (result.error) {
                setError(result.error)
            } else {
                router.push('/dashboard')
            }
        } catch (e) {
            setError('An unexpected error occurred while saving your application.')
        } finally {
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
                    {currentStep > 0 && (
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
                        <p className="text-slate-500 text-sm mt-0.5">Please provide accurate information to complete your application.</p>
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
                        <PhotoUploadStep
                            initialData={photoDetails}
                            onNext={handleNext}
                        />
                    )}
                    {currentStep === 3 && (
                        <DependentsStep
                            initialData={dependentsDetails}
                            onNext={handleNext}
                        />
                    )}
                    {currentStep === 4 && (
                        <EligibilityStep
                            initialData={eligibilityDetails}
                            onNext={handleNext}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {currentStep === 5 && (
                        <PaymentSetupStep
                            onNext={handleNext}
                            isSubmitting={isSubmitting}
                            membershipFee={membershipFee}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
