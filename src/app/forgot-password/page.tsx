'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { resetPassword } from './actions'

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)

        try {
            const res = await resetPassword(formData)
            if (res?.error) {
                setError(res.error)
            } else {
                setIsSubmitted(true)
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.')
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
                <div className="mb-8">
                    <Link href="/login" className="inline-flex items-center text-slate-500 hover:text-brand-600 transition-colors text-sm font-medium mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>

                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-500/30 mx-auto mb-4">
                            E
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                        <p className="text-slate-500 text-sm mt-1">We&apos;ll send a recovery link to your email</p>
                    </div>
                </div>

                {isSubmitted ? (
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
                        <p className="text-slate-600 mb-6">
                            We&apos;ve sent a password reset link to your email address. Please check your inbox and spam folder.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-all"
                        >
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm flex items-start">
                                <span className="font-semibold mr-2">Error:</span> {error}
                            </div>
                        )}

                        <form action={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 pl-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                        placeholder="you@email.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
