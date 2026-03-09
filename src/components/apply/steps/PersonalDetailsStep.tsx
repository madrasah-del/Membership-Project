import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personalDetailsSchema, PersonalDetailsData } from '@/lib/validations'
import { ArrowRight } from 'lucide-react'

interface Props {
    initialData: Partial<PersonalDetailsData>
    onNext: (data: PersonalDetailsData) => void
}

export function PersonalDetailsStep({ initialData, onNext }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<PersonalDetailsData>({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: initialData,
        mode: 'onTouched', // Validate on blur for better UX
    })

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-6">

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
                    <label className="text-sm font-medium text-slate-700 pl-1">First Name *</label>
                    <input
                        {...register('firstName')}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.firstName ? 'border-red-300' : 'border-slate-200'}`}
                        placeholder="Muhammad"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1 pl-1">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Last Name *</label>
                    <input
                        {...register('lastName')}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.lastName ? 'border-red-300' : 'border-slate-200'}`}
                        placeholder="Khan"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1 pl-1">{errors.lastName.message}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Date of Birth *</label>
                    <input
                        type="date"
                        {...register('dateOfBirth')}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.dateOfBirth ? 'border-red-300 text-red-900' : 'border-slate-200'}`}
                    />
                    <p className="text-slate-400 text-xs mt-1 pl-1">You must be at least 18 years old.</p>
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 pl-1 font-medium">{errors.dateOfBirth.message}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Mobile Number *</label>
                    <input
                        type="tel"
                        {...register('phone')}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.phone ? 'border-red-300' : 'border-slate-200'}`}
                        placeholder="07123456789"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1 pl-1">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 pl-1">Marital Status (Optional)</label>
                    <select
                        {...register('maritalStatus')}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all appearance-none"
                    >
                        <option value="">Select status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                </div>
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
