'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Briefcase, 
    Calendar, 
    CreditCard, 
    Save, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Plus,
    Trash2,
    CheckSquare,
    Globe
} from 'lucide-react'
import { createManualMembership } from '@/app/admin/actions'

interface ManualMemberFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export function ManualMemberForm({ onSuccess, onCancel }: ManualMemberFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            address: '',
            town: '',
            postcode: '',
            profession: '',
            professionOther: '',
            functionalPosition: '',
            functionalPositionOther: '',
            position: '',
            amount: 10.00,
            paymentMethod: 'cash',
            sumupTransactionId: '',
            paymentDate: new Date().toISOString().split('T')[0],
            hasGiftAidDeclaration: false,
            whatsappOptIn: false,
            isNonResidentConfirmation: false,
            dependents: [] as any[]
        }
    })

    const dependents = watch('dependents')

    const addDependent = () => {
        setValue('dependents', [...dependents, { name: '', relation: '', mobile: '', email: '' }])
    }

    const removeDependent = (index: number) => {
        const newDeps = [...dependents]
        newDeps.splice(index, 1)
        setValue('dependents', newDeps)
    }

    const onSubmit = async (data: any) => {
        setIsSubmitting(true)
        setError(null)
        try {
            const result = await createManualMembership(data)
            if (result.error) {
                setError(result.error)
            } else {
                setSuccess(true)
                if (onSuccess) setTimeout(onSuccess, 2000)
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Member Digitized!</h2>
                <p className="text-slate-500 max-w-xs">The record has been successfully added to the society database.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-12">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <span className="font-bold">Error:</span> {error}
                    </div>
                </div>
            )}

            {/* Personal Info */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                        <User className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Identity & Profile</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                        <select 
                            {...register('title')}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all appearance-none"
                        >
                            <option value="">Select</option>
                            <option value="Mr">Mr</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Ms">Ms</option>
                            <option value="Miss">Miss</option>
                            <option value="Dr">Dr</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                        <input 
                            {...register('firstName', { required: true })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            placeholder="e.g. Abdullah"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                        <input 
                            {...register('lastName', { required: true })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            placeholder="e.g. Ahmed"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <input 
                            type="email"
                            {...register('email')}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            placeholder="member@example.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Phone className="w-3 h-3" /> Mobile Number
                        </label>
                        <input 
                            type="tel"
                            {...register('phone')}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            placeholder="07123 456789"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Date of Birth
                        </label>
                        <input 
                            type="date"
                            {...register('dateOfBirth', { required: true })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Globe className="w-3 h-3" /> WhatsApp Community
                        </label>
                        <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <input 
                                type="checkbox"
                                {...register('whatsappOptIn')}
                                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm font-medium text-slate-700 underline decoration-brand-200 underline-offset-4">Opt-in to Official Groups</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Location Details</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Street Address</label>
                        <input 
                            {...register('address', { required: true })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            placeholder="123 Example Street"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Town / City</label>
                            <input 
                                {...register('town', { required: true })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                placeholder="Epsom"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Postcode</label>
                            <input 
                                {...register('postcode', { required: true })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                placeholder="KT19 8AA"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 py-3 px-4 bg-amber-50 border border-amber-100 rounded-2xl">
                        <input 
                            type="checkbox"
                            {...register('isNonResidentConfirmation')}
                            className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm font-medium text-amber-900">Confirm eligibility if non-Epsom resident (Regular Attendee)</span>
                    </div>
                </div>
            </div>

            {/* Career */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Professional Standing</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Profession / Industry</label>
                            <select 
                                {...register('profession')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all appearance-none"
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
                        </div>
                        {watch('profession') === 'Other' && (
                            <div className="space-y-1 animate-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Specify Profession</label>
                                <input 
                                    {...register('professionOther', { required: watch('profession') === 'Other' })}
                                    className="w-full px-4 py-3 bg-white border-2 border-brand-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                    placeholder="Enter your profession"
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Functional Area</label>
                            <select 
                                {...register('functionalPosition')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all appearance-none"
                            >
                                <option value="">Select area</option>
                                <option value="Executive/Leadership">Executive/Leadership</option>
                                <option value="Management">Management</option>
                                <option value="Professional/Specialist">Professional/Specialist</option>
                                <option value="Technical/Operations">Technical/Operations</option>
                                <option value="Support/Administrative">Support/Administrative</option>
                                <option value="Self-Employed/Freelance">Self-Employed/Freelance</option>
                                <option value="Apprentice/Trainee">Apprentice/Trainee</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {watch('functionalPosition') === 'Other' && (
                            <div className="space-y-1 animate-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Specify Area</label>
                                <input 
                                    {...register('functionalPositionOther', { required: watch('functionalPosition') === 'Other' })}
                                    className="w-full px-4 py-3 bg-white border-2 border-brand-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                    placeholder="Enter your functional area"
                                />
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Specific Position / Job Title</label>
                        <input 
                            {...register('position')}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            placeholder="e.g. Senior Consultant, Lecturer, Carpenter"
                        />
                    </div>
                </div>
            </div>

            {/* Dependents */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                            <Plus className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Dependents</h3>
                    </div>
                    <button 
                        type="button"
                        onClick={addDependent}
                        className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 active:scale-90"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {dependents.length === 0 ? (
                    <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                        <p className="text-sm font-medium text-slate-400">No dependents added to this record.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {dependents.map((_, index) => (
                            <div key={index} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm relative animate-scale-in">
                                <button 
                                    type="button"
                                    onClick={() => removeDependent(index)}
                                    className="absolute -top-3 -right-3 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <input 
                                        {...register(`dependents.${index}.name` as const)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        placeholder="Full Name"
                                    />
                                    <input 
                                        {...register(`dependents.${index}.relation` as const)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        placeholder="Relation"
                                    />
                                    <input 
                                        {...register(`dependents.${index}.mobile` as const)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        placeholder="Mobile (Optional)"
                                    />
                                    <input 
                                        {...register(`dependents.${index}.email` as const)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        placeholder="Email (Optional)"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment & Audit */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Payment Verification</h3>
                </div>

                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Collected</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        {...register('amount', { valueAsNumber: true })}
                                        className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all text-xl font-black"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Channel</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['cash', 'bank_transfer', 'sumup'].map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setValue('paymentMethod', method as any)}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border
                                                ${watch('paymentMethod') === method 
                                                    ? 'bg-brand-600 border-brand-500 shadow-lg shadow-brand-500/20' 
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'}
                                            `}
                                        >
                                            {method.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Date</label>
                                <input 
                                    type="date"
                                    {...register('paymentDate')}
                                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SumUp / Reference Code</label>
                                <input 
                                    {...register('sumupTransactionId')}
                                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all font-mono text-sm"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                            <div className={`p-2 rounded-lg transition-all ${watch('hasGiftAidDeclaration') ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>
                                <CheckSquare className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm">Include Gift Aid Declaration</p>
                                <p className="text-[10px] text-slate-400">Paper form must have a valid signature on file.</p>
                            </div>
                            <input 
                                type="checkbox"
                                {...register('hasGiftAidDeclaration')}
                                className="w-6 h-6 rounded-lg bg-white/10 border-white/20 text-brand-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-5 bg-brand-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-700 transition-all shadow-2xl shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Syncing Data...
                        </>
                    ) : (
                        <>
                            <Save className="w-6 h-6" />
                            Commit Digital Record
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-[2rem] font-black hover:bg-slate-50 transition-all"
                >
                    Discard
                </button>
            </div>
        </form>
    )
}
