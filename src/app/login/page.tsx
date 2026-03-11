'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, Mail, Lock } from 'lucide-react'
import { login, signup } from './actions'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isLogin, setIsLogin] = useState(true)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)
        setMessage(null)

        try {
            if (isLogin) {
                const res = await login(formData)
                if (res?.error) setError(res.error)
            } else {
                const res = await signup(formData)
                if (res?.error) setError(res.error)
                else setMessage('Check your email for the confirmation link.')
            }
        } catch (e) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex-grow flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-50">
                <div className="absolute top-[10%] right-[20%] w-[40%] h-[40%] rounded-full bg-brand-100/40 blur-3xl opacity-60"></div>
                <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-amber-100/30 blur-3xl opacity-60"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/40 animate-fade-in-up">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-500/30 mb-4">
                        E
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p className="text-slate-500 text-sm mt-1">{isLogin ? 'Log in to manage your membership' : 'Sign up to begin your application'}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm flex items-start">
                        <span className="font-semibold mr-2">Error:</span> {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 rounded-xl bg-brand-50 text-brand-700 border border-brand-100 text-sm font-medium">
                        {message}
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

                    <div className="space-y-1">
                        <div className="flex items-center justify-between pl-1">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Log In' : 'Sign Up'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError(null)
                            setMessage(null)
                        }}
                        className="text-sm text-slate-600 hover:text-brand-600 font-medium transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                    </button>
                </div>
            </div>
        </div>
    )
}
