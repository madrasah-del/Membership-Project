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
                    <label className="text-sm font-medium text-slate-700 pl-1">Email Address *</label>
                    <input
                        type="email"
                        {...register('email')}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.email ? 'border-red-300' : 'border-slate-200'}`}
                        placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Profession *</label>
                    <select
                        {...register('profession')}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all appearance-none ${errors.profession ? 'border-red-300' : 'border-slate-200'}`}
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
                        <option value="Other">Other</option>
                    </select>
                    {errors.profession && <p className="text-red-500 text-xs mt-1 pl-1">{errors.profession.message}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Position *</label>
                    <input
                        {...register('position')}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.position ? 'border-red-300' : 'border-slate-200'}`}
                        placeholder="e.g. Senior Manager, Teacher, Consultant"
                    />
                    {errors.position && <p className="text-red-500 text-xs mt-1 pl-1">{errors.position.message}</p>}
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
