import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessDetailsSchema, BusinessDetailsData } from '@/lib/validations'
import { ArrowRight, Briefcase } from 'lucide-react'

interface Props {
    initialData: Partial<BusinessDetailsData>
    onNext: (data: BusinessDetailsData) => void
}

export function BusinessDetailsStep({ initialData, onNext }: Props) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<BusinessDetailsData>({
        resolver: zodResolver(businessDetailsSchema),
        defaultValues: {
            businessOptIn: initialData.businessOptIn || false,
            businessType: initialData.businessType || '',
            businessName: initialData.businessName || '',
            businessWebsite: initialData.businessWebsite || '',
            businessContact: initialData.businessContact || '',
            businessDescription: initialData.businessDescription || '',
        },
        mode: 'onTouched',
    })

    const businessOptIn = useWatch({ control, name: 'businessOptIn' })

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-6 animate-fade-in">
            <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 flex items-start gap-3 mb-6">
                <Briefcase className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-brand-900">Business Directory (Optional)</p>
                    <p className="text-sm text-brand-700/80 leading-relaxed">
                        Do you have your own business? Share your details to be featured in the upcoming Epsom and Ewell Business Directory.
                    </p>
                </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50 relative group transition-all hover:border-brand-200 hover:shadow-sm">
                <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center mt-1">
                        <input
                            type="checkbox"
                            {...register('businessOptIn')}
                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                    </div>
                    <div>
                        <span className="font-semibold text-slate-900 block mb-1">
                            Yes, I have my own business
                        </span>
                        <span className="text-sm text-slate-500 leading-relaxed block">
                            I&apos;d like to put this down in the business directory of the Epsom and Ewell organisation.
                        </span>
                    </div>
                </label>

                {businessOptIn && (
                    <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 pl-1">Business Name *</label>
                            <input
                                {...register('businessName')}
                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="e.g. Epsom Dry Cleaners"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 pl-1">Business Type *</label>
                            <select
                                {...register('businessType')}
                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all appearance-none"
                            >
                                <option value="">Select industry...</option>
                                <option value="transport">Taxi / Transport</option>
                                <option value="catering">Restaurant / Catering</option>
                                <option value="retail">Retail</option>
                                <option value="services">Professional Services</option>
                                <option value="trades">Trades (Plumbing, Electrician, etc)</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 pl-1">Contact Number</label>
                            <input
                                {...register('businessContact')}
                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="e.g. 07123..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 pl-1">Website URL</label>
                            <input
                                type="url"
                                {...register('businessWebsite')}
                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-slate-700 pl-1">Short Description</label>
                            <textarea
                                {...register('businessDescription')}
                                rows={2}
                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="Briefly describe what your business does..."
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6 flex justify-end">
                <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-8 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 group"
                >
                    Next Step
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </form>
    )
}
