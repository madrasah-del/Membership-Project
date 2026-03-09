import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dependentsSchema, DependentsData } from '@/lib/validations'
import { ArrowRight, Plus, Trash2, Users } from 'lucide-react'

interface Props {
    initialData: Partial<DependentsData>
    onNext: (data: DependentsData) => void
}

export function DependentsStep({ initialData, onNext }: Props) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<DependentsData>({
        resolver: zodResolver(dependentsSchema),
        defaultValues: {
            dependents: initialData.dependents || [],
        },
        mode: 'onTouched',
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'dependents',
    })

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-6 animate-fade-in">

            <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 flex items-start gap-3 mb-6">
                <Users className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-brand-900">Add Family Members (Optional)</p>
                    <p className="text-sm text-brand-700/80 leading-relaxed">
                        You can list up to 8 dependents (spouse, children under 18) living at the same address. Leave this section blank if it does not apply.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50 relative group transition-all hover:border-brand-200 hover:shadow-sm">

                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all z-10"
                            title="Remove dependent"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <h4 className="text-sm font-semibold text-slate-900 mb-4 pr-10">Dependent {index + 1}</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 pl-1">Full Name *</label>
                                <input
                                    {...register(`dependents.${index}.name` as const)}
                                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.dependents?.[index]?.name ? 'border-red-300' : 'border-slate-200'}`}
                                    placeholder="e.g. Sarah Khan"
                                />
                                {errors.dependents?.[index]?.name && <p className="text-red-500 text-xs mt-1 pl-1">{errors.dependents[index]?.name?.message}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 pl-1">Relationship *</label>
                                <select
                                    {...register(`dependents.${index}.relation` as const)}
                                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all appearance-none ${errors.dependents?.[index]?.relation ? 'border-red-300' : 'border-slate-200'}`}
                                >
                                    <option value="">Select relation...</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Son">Son</option>
                                    <option value="Daughter">Daughter</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.dependents?.[index]?.relation && <p className="text-red-500 text-xs mt-1 pl-1">{errors.dependents[index]?.relation?.message}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 pl-1">Mobile (Optional)</label>
                                <input
                                    type="tel"
                                    {...register(`dependents.${index}.mobile` as const)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                    placeholder="07123..."
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 pl-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    {...register(`dependents.${index}.email` as const)}
                                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${errors.dependents?.[index]?.email ? 'border-red-300' : 'border-slate-200'}`}
                                    placeholder="name@email.com"
                                />
                                {errors.dependents?.[index]?.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.dependents[index]?.email?.message}</p>}
                            </div>

                        </div>
                    </div>
                ))}

                {fields.length < 8 && (
                    <button
                        type="button"
                        onClick={() => append({ name: '', relation: '', mobile: '', email: '' })}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/50 transition-all flex flex-col items-center justify-center gap-2 font-medium"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Plus className="w-5 h-5" />
                        </div>
                        Add Dependent
                    </button>
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
