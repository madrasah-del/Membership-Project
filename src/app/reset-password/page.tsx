'use client'

import { useState } from 'react'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { updatePassword } from './actions'

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)

        try {
            const res = await updatePassword(formData)
            if (res?.error) {
                setError(res.error)
            }
        } catch (e) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-50">
                <div className="absolute top-[10%] right-[20%] w-[40%] h-[40%] rounded-full bg-brand-100/40 blur-3xl opacity-60"></div>
                <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-amber-100/30 blur-3xl opacity-60"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/40">
                <div className="mb-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-500/30 mx-auto mb-4">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
                    <p className="text-slate-500 text-sm mt-1">Choose a strong password for your account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm flex items-start">
                        <span className="font-semibold mr-2">Error:</span> {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1">New Password</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1">Confirm New Password</label>
                        <div className="relative">
                            <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                minLength={6}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group pt-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
