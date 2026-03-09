import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eligibilitySchema, EligibilityData } from '@/lib/validations'
import { CheckCircle2, Info, Loader2 } from 'lucide-react'

interface Props {
    initialData: Partial<EligibilityData>
    onNext: (data: any) => void
    isSubmitting: boolean
}

export function EligibilityStep({ initialData, onNext, isSubmitting }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<EligibilityData>({
        resolver: zodResolver(eligibilitySchema),
        defaultValues: {
            ...initialData,
            isResidentOrRegular: initialData.isResidentOrRegular || false,
            isSunniMuslim: initialData.isSunniMuslim || false,
            whatsappOptIn: initialData.whatsappOptIn || false,
        },
        mode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-8 animate-fade-in">

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 flex items-start gap-4 mb-6">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                    <p className="font-semibold text-amber-900">Important Constitutional Criteria</p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                        Membership is restricted according to the rules of the Epsom & Ewell Islamic Society Constitution. Please carefully read and confirm the following declarations. False declarations may result in the rejection or revocation of membership.
                    </p>
                </div>
            </div>

            <div className="space-y-6">

                {/* Declarations */}
                <div className="space-y-4">
                    <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-brand-300 transition-colors cursor-pointer bg-white">
                        <div className="flex items-center h-6 shrink-0 pt-0.5">
                            <input
                                type="checkbox"
                                {...register('isSunniMuslim')}
                                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 transition-colors cursor-pointer"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 mb-0.5">Religious Declaration *</p>
                            <p className="text-sm text-slate-600">I declare that I am a Muslim belonging to the mainstream Sunni denomination.</p>
                            {errors.isSunniMuslim && <p className="text-red-500 text-xs mt-2 font-medium">{errors.isSunniMuslim.message}</p>}
                        </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-brand-300 transition-colors cursor-pointer bg-white">
                        <div className="flex items-center h-6 shrink-0 pt-0.5">
                            <input
                                type="checkbox"
                                {...register('isResidentOrRegular')}
                                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 transition-colors cursor-pointer"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 mb-0.5">Residency / Attendance Declaration *</p>
                            <p className="text-sm text-slate-600">I declare that I am either a resident of the Borough of Epsom & Ewell OR I regularly attend the Epsom & Ewell Islamic Society (e.g., for Jummah prayers).</p>
                            {errors.isResidentOrRegular && <p className="text-red-500 text-xs mt-2 font-medium">{errors.isResidentOrRegular.message}</p>}
                        </div>
                    </label>
                </div>

                <div className="w-full h-px bg-slate-100 my-8"></div>

                <h3 className="text-lg font-semibold text-slate-900 mb-4">Proposers (Optional)</h3>
                <p className="text-sm text-slate-500 mb-4">If you know existing members who can propose your membership, you may enter their names below.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1">Proposed By</label>
                        <input
                            {...register('proposedBy')}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            placeholder="Name of member"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1">Seconded By</label>
                        <input
                            {...register('secondedBy')}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            placeholder="Name of member"
                        />
                    </div>
                </div>

                <div className="w-full h-px bg-slate-100 my-8"></div>

                <h3 className="text-lg font-semibold text-slate-900 mb-4">Communication</h3>

                <label className="flex items-start gap-4 p-4 rounded-xl border border-brand-100 bg-brand-50 hover:bg-brand-50/80 transition-colors cursor-pointer">
                    <div className="flex items-center h-6 shrink-0 pt-0.5">
                        <input
                            type="checkbox"
                            {...register('whatsappOptIn')}
                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 transition-colors cursor-pointer"
                        />
                    </div>
                    <div>
                        <p className="text-sm flex items-center gap-2 font-semibold text-brand-900 mb-0.5">
                            EEIS WhatsApp Community Opt-in
                        </p>
                        <p className="text-sm text-brand-700/80">I consent to being added to the official members-only EEIS WhatsApp announcements group using the mobile number provided.</p>
                    </div>
                </label>
            </div>

            <div className="pt-8 flex flex-col items-center border-t border-slate-100">
                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full md:w-auto min-w-[240px] bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-8 rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 group"
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                        <><CheckCircle2 className="w-5 h-5" /> Submit Application</>
                    )}
                </button>
                <p className="text-xs text-slate-400 mt-4 text-center max-w-sm">
                    By clicking Submit, you agree that all information provided is accurate and true.
                </p>
            </div>
        </form>
    )
}
