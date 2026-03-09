import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressSchema, AddressData } from '@/lib/validations'
import { ArrowRight, MapPin } from 'lucide-react'

interface Props {
    initialData: Partial<AddressData>
    onNext: (data: AddressData) => void
}

export function AddressStep({ initialData, onNext }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AddressData>({
        resolver: zodResolver(addressSchema),
        defaultValues: initialData,
        mode: 'onTouched',
    })

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-6 animate-fade-in">

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mb-6">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 leading-relaxed">
                    Please provide your permanent residential address. This may be used to verify your eligibility as an Epsom & Ewell resident.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Street Address *</label>
                    <textarea
                        {...register('address')}
                        rows={2}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none ${errors.address ? 'border-red-300' : 'border-slate-200'}`}
                        placeholder="123 Example Street"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1 pl-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1">Town / City *</label>
                        <input
                            {...register('town')}
                            className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.town ? 'border-red-300' : 'border-slate-200'}`}
                            placeholder="Epsom"
                        />
                        {errors.town && <p className="text-red-500 text-xs mt-1 pl-1">{errors.town.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1">Postcode *</label>
                        <input
                            {...register('postcode')}
                            className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all uppercase ${errors.postcode ? 'border-red-300' : 'border-slate-200'}`}
                            placeholder="KT19"
                        />
                        {errors.postcode && <p className="text-red-500 text-xs mt-1 pl-1">{errors.postcode.message}</p>}
                    </div>
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
