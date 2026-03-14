import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personalDetailsSchema, PersonalDetailsData } from '@/lib/validations'
import { ArrowRight, AlertCircle, LogIn } from 'lucide-react'
import { checkDuplicateMembership } from '@/app/apply/actions'
import Link from 'next/link'

interface Props {
    initialData: Partial<PersonalDetailsData>
    onNext: (data: PersonalDetailsData) => void
}

export function PersonalDetailsStep({ initialData, onNext }: Props) {
    const [isDuplicate, setIsDuplicate] = useState(false)
    const [checkingDuplicate, setCheckingDuplicate] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<PersonalDetailsData>({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: initialData,
        mode: 'onTouched',
    })

    const handleFormSubmit = (data: PersonalDetailsData) => {
        const professionValue = watch('profession')
        const functionalPositionValue = watch('functionalPosition')

        let finalData = { ...data }

        if (professionValue === 'Other') {
            const otherVal = (document.getElementById('professionOtherInput') as HTMLInputElement)?.value
            if (otherVal) finalData.profession = otherVal
        }

        if (functionalPositionValue === 'Other') {
            const otherVal = (document.getElementById('functionalPositionOtherInput') as HTMLInputElement)?.value
            if (otherVal) finalData.functionalPosition = otherVal
        }

        onNext(finalData)
    }

    const firstName = watch('firstName')
    const lastName = watch('lastName')
    const dateOfBirth = watch('dateOfBirth')
    const profession = watch('profession')
    const functionalPosition = watch('functionalPosition')

    useEffect(() => {
        async function check() {
            if (firstName && lastName && dateOfBirth && firstName.length > 1 && lastName.length > 1) {
                setCheckingDuplicate(true)
                try {
                    const result = await checkDuplicateMembership({ firstName, lastName, dateOfBirth })
                    setIsDuplicate(result.isDuplicate)
                } catch (err) {
                    console.error('Duplicate check failed:', err)
                } finally {
                    setCheckingDuplicate(false)
                }
            } else {
                setIsDuplicate(false)
            }
        }

        const timer = setTimeout(check, 500)
        return () => clearTimeout(timer)
    }, [firstName, lastName, dateOfBirth])

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {isDuplicate && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shrink-0">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-amber-900 font-semibold mb-1">Existing Application Found</h3>
                        <p className="text-amber-800 text-sm mb-3">
                            Our records show an application with this name and date of birth exists. You might have already registered using another method (Google, Apple, or different Email).
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button 
                                type="button"
                                onClick={async () => {
                                    const { createClient } = await import('@/lib/supabase/client')
                                    const supabase = createClient()
                                    await supabase.auth.signOut()
                                    window.location.href = '/login'
                                }}
                                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                <LogIn className="w-3 h-3" />
                                Sign out & switch account
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDuplicate(false)}
                                className="bg-white/50 hover:bg-white/80 text-amber-900 text-xs font-semibold py-2 px-4 rounded-lg border border-amber-200 transition-colors"
                            >
                                Not me? Continue anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {/* Fast-track Section */}
                <div className="text-center space-y-4">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Fast-track your application</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-700 shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z" fill="#EA4335"/>
                            </svg>
                            Apply with Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 border border-slate-900 rounded-xl hover:bg-slate-800 transition-all font-medium text-white shadow-sm"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.96.95-2.17 1.43-3.64 1.43-1.12 0-2.17-.3-3.15-.9l-.3-.19c-.93-.57-1.92-.85-2.96-.85-1.25 0-2.43.43-3.54 1.28l-.34.27c-.2.15-.38.22-.54.22-.24 0-.44-.12-.6-.35a34.34 34.34 0 0 1-1.34-2.2c-.36-.66-.66-1.4-.9-2.23a13.3 13.3 0 0 1-.36-3.07c0-1.84.44-3.48 1.3-4.9.87-1.43 2.06-2.14 3.56-2.14 1.13 0 2.15.28 3.04.83l.25.15c.57.34 1.16.51 1.76.51s1.2-.17 1.77-.51l.3-.17c.92-.54 1.95-.81 3.1-.81 1.12 0 2.08.24 2.88.72 1.26.74 2.02 1.76 2.27 3.05a10 10 0 0 0-2.2 1.05c-.88.58-1.58 1.34-2.1 2.26-.54.91-.8 1.94-.8 3.1 0 1.2.27 2.28.82 3.23a6.83 6.83 0 0 0 2.2 2.31c-.13.39-.28.77-.45 1.14-.3.63-.64 1.25-1.03 1.86ZM12.03 7.25c-.01-1.29.37-2.4 1.14-3.32a4.42 4.42 0 0 1 3.32-1.57c.05 1.28-.35 2.4-1.2 3.38a4.4 4.4 0 0 1-3.26 1.51Z"/>
                            </svg>
                            Apply with Apple
                        </button>
                    </div>
                </div>

                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <span className="relative px-4 bg-white text-sm text-slate-500 font-medium">Or fill out manually</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 pl-1">Title (Optional)</label>
                        <select
                            {...register('title')}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all appearance-none"
                        >
                            <option value="">Select a title</option>
                            <option value="Mr">Mr</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Ms">Ms</option>
                            <option value="Miss">Miss</option>
                            <option value="Dr">Dr</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                            First Name
                        </label>
                        <div className="relative">
                            <input
                                {...register('firstName')}
                                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.firstName ? 'border-red-300' : 'border-slate-200 shadow-sm'}`}
                                placeholder="e.g. Muhammad"
                            />
                            <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-xs mt-1 pl-1">{errors.firstName.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                            Last Name
                        </label>
                        <div className="relative">
                            <input
                                {...register('lastName')}
                                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.lastName ? 'border-red-300' : 'border-slate-200 shadow-sm'}`}
                                placeholder="e.g. Khan"
                            />
                            <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-xs mt-1 pl-1">{errors.lastName.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                            Date of Birth
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                {...register('dateOfBirth')}
                                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.dateOfBirth ? 'border-red-300 text-red-900' : 'border-slate-200 shadow-sm'}`}
                            />
                            <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-slate-400 text-xs mt-1 pl-1 italic">Required to verify voting age (18+)</p>
                        {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 pl-1 font-medium">{errors.dateOfBirth.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                            Mobile Number
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                {...register('phone')}
                                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.phone ? 'border-red-300' : 'border-slate-200 shadow-sm'}`}
                                placeholder="07123456789"
                            />
                            <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1 pl-1">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 pl-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                {...register('email')}
                                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.email ? 'border-red-300' : 'border-slate-200 shadow-sm'}`}
                                placeholder="you@example.com"
                            />
                            <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1 md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                        <h4 className="text-base font-bold text-slate-900 mb-1">Professional Details</h4>
                        <p className="text-sm text-slate-500 mb-4">We ask this to help build a community skills network and provide mentoring opportunities.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 pl-1">Profession / Industry</label>
                                <select
                                    {...register('profession')}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all appearance-none ${errors.profession ? 'border-red-300' : 'border-slate-200 shadow-sm'}`}
                                >
                                    <option value="">Select profession</option>
                                    <option value="Accounting/Finance">Accounting/Finance</option>
                                    <option value="Administrative/Clerical">Administrative/Clerical</option>
                                    <option value="Business/Management">Business/Management</option>
                                    <option value="Construction/Trades">Construction/Trades</option>
                                    <option value="Creative/Design/Media">Creative/Design/Media</option>
                                    <option value="Education/Teaching">Education/Teaching</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Healthcare/Medicine">Healthcare/Medicine</option>
                                    <option value="IT/Technology/Software">IT/Technology/Software</option>
                                    <option value="Legal">Legal</option>
                                    <option value="Logistics/Transport">Logistics/Transport</option>
                                    <option value="Marketing/Sales">Marketing/Sales</option>
                                    <option value="Public Service/Non-Profit">Public Service/Non-Profit</option>
                                    <option value="Retail/Wholesale">Retail/Wholesale</option>
                                    <option value="Student">Student</option>
                                    <option value="Retired">Retired</option>
                                    <option value="Unemployed">Unemployed</option>
                                    {initialData.profession && 
                                     !['', 'Accounting/Finance', 'Administrative/Clerical', 'Business/Management', 'Construction/Trades', 'Creative/Design/Media', 'Education/Teaching', 'Engineering', 'Healthcare/Medicine', 'IT/Technology/Software', 'Legal', 'Logistics/Transport', 'Marketing/Sales', 'Public Service/Non-Profit', 'Retail/Wholesale', 'Student', 'Retired', 'Unemployed', 'Other'].includes(initialData.profession) && (
                                        <option value={initialData.profession}>{initialData.profession}</option>
                                    )}
                                    <option value="Other">Other...</option>
                                </select>
                                {profession === 'Other' && (
                                    <input
                                        type="text"
                                        placeholder="Please specify profession"
                                        className="w-full mt-2 px-4 py-3 bg-white border-2 border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all animate-in fade-in slide-in-from-top-1"
                                        id="professionOtherInput"
                                        required
                                    />
                                )}
                                {errors.profession && <p className="text-red-500 text-xs mt-1 pl-1">{errors.profession.message}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 pl-1">Functional Area / Role Type</label>
                                <select
                                    {...register('functionalPosition')}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all appearance-none ${errors.functionalPosition ? 'border-red-300' : 'border-slate-200 shadow-sm'}`}
                                >
                                    <option value="">Select area</option>
                                    <option value="Executive/Leadership">Executive/Leadership</option>
                                    <option value="Management">Management</option>
                                    <option value="Professional/Specialist">Professional/Specialist</option>
                                    <option value="Technical/Operations">Technical/Operations</option>
                                    <option value="Support/Administrative">Support/Administrative</option>
                                    <option value="Self-Employed/Freelance">Self-Employed/Freelance</option>
                                    <option value="Apprentice/Trainee">Apprentice/Trainee</option>
                                    {initialData.functionalPosition && 
                                     !['', 'Executive/Leadership', 'Management', 'Professional/Specialist', 'Technical/Operations', 'Support/Administrative', 'Self-Employed/Freelance', 'Apprentice/Trainee', 'Other'].includes(initialData.functionalPosition) && (
                                        <option value={initialData.functionalPosition}>{initialData.functionalPosition}</option>
                                    )}
                                    <option value="Other">Other...</option>
                                </select>
                                {functionalPosition === 'Other' && (
                                    <input
                                        type="text"
                                        placeholder="Please specify area"
                                        className="w-full mt-2 px-4 py-3 bg-white border-2 border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all animate-in fade-in slide-in-from-top-1"
                                        id="functionalPositionOtherInput"
                                        required
                                    />
                                )}
                                {errors.functionalPosition && <p className="text-red-500 text-xs mt-1 pl-1">{errors.functionalPosition.message}</p>}
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700 pl-1">Job Title / Specific Position</label>
                                <input
                                    {...register('position')}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.position ? 'border-red-300' : 'border-slate-200 shadow-sm'}`}
                                    placeholder="e.g. Senior Manager, Teacher, Consultant"
                                />
                                {errors.position && <p className="text-red-500 text-xs mt-1 pl-1">{errors.position.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 flex flex-col items-center">
                <button
                    type="submit"
                    className="w-full sm:w-auto min-w-[200px] bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-12 rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 group"
                >
                    Next Step
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link href="/login" className="mt-4 text-slate-500 hover:text-brand-600 text-sm font-medium transition-colors">
                    Already applied or have an account? <span className="underline">Login here</span>
                </Link>
            </div>
        </form>
    )
}
