'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, Mail, Lock, Phone, Smartphone, ShieldCheck, MailQuestion } from 'lucide-react'
import { login, signup, signInWithGoogle, signInWithApple, signInWithMagicLink, signInWithOTP, verifyOTP } from './actions'

type AuthMethod = 'password' | 'magic-link' | 'phone'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isLogin, setIsLogin] = useState(true)
    const [authMethod, setAuthMethod] = useState<AuthMethod>('password')
    
    // Phone OTP specific state
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [showOtpInput, setShowOtpInput] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)
        setMessage(null)

        let isRedirecting = false

        try {
            if (authMethod === 'password') {
                if (isLogin) {
                    const res = await login(formData)
                    if (res?.error) {
                        setError(res.error)
                    } else if (res?.success) {
                        isRedirecting = true
                        router.push('/dashboard')
                        return
                    }
                } else {
                    const res = await signup(formData)
                    if (res?.error) {
                        setError(res.error)
                    } else {
                        setMessage('Check your email for the confirmation link.')
                    }
                }
            } else if (authMethod === 'magic-link') {
                const email = formData.get('email') as string
                const res = await signInWithMagicLink(email)
                if (res?.error) {
                    setError(res.error)
                } else {
                    setMessage('Check your email for your magic login link.')
                }
            }
        } catch (e) {
            if (!isRedirecting) {
                setError('An unexpected error occurred. Please try again.')
            }
        } finally {
            if (!isRedirecting) {
                setIsLoading(false)
            }
        }
    }

    async function handleSendOTP() {
        if (!phone) {
            setError('Please enter a valid phone number.')
            return
        }
        setIsLoading(true)
        setError(null)
        try {
            const res = await signInWithOTP(phone)
            if (res?.error) {
                setError(res.error)
            } else {
                setShowOtpInput(true)
                setMessage('Verification code sent to your phone.')
            }
        } catch (e) {
            setError('Failed to send verification code.')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleVerifyOTP() {
        if (!otp) {
            setError('Please enter the verification code.')
            return
        }
        setIsLoading(true)
        setError(null)
        try {
            const res = await verifyOTP(phone, otp)
            if (res?.error) {
                setError(res.error)
            } else {
                router.push('/dashboard')
            }
        } catch (e) {
            setError('Verification failed.')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSocialLogin(provider: 'google' | 'apple') {
        setIsSocialLoading(provider)
        setError(null)
        try {
            let res;
            if (provider === 'google') res = await signInWithGoogle()
            else res = await signInWithApple()
            
            if (res?.error) setError(res.error)
        } catch (e) {
            setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} Login failed. Please try again.`)
        } finally {
            setIsSocialLoading(null)
        }
    }

    return (
        <div className="flex-grow flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden min-h-[calc(100vh-80px)]">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-50 text-slate-900">
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

                {/* Social Logins - Higher Priority for senior users */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        disabled={isLoading || isSocialLoading !== null}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 border border-slate-200 rounded-xl transition-all disabled:opacity-70 shadow-sm"
                    >
                        {isSocialLoading === 'google' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                                </svg>
                                Google
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('apple')}
                        disabled={isLoading || isSocialLoading !== null}
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-medium py-2.5 px-4 rounded-xl transition-all disabled:opacity-70 shadow-sm"
                    >
                        {isSocialLoading === 'apple' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.05 20.28c-.96.95-2.11 1.43-3.08 1.43-.98 0-1.87-.39-3.04-.39-1.18 0-2.25.4-3.18.4-.95 0-2.22-.53-3.32-1.63C1.5 17.15.65 13.56.65 10.8c0-4.22 2.68-6.43 5.3-6.43 1.38 0 2.5.83 3.4 1.36.72.43.94.57 1.34.57.38 0 .61-.13 1.37-.53C13.06 5.16 14.28 4.3 15.67 4.3c2.25 0 3.82 1.44 4.54 2.8-.03.02-2.15 1.25-2.15 3.83 0 3.1 2.7 4.14 2.7 4.14-.02.06-.42 1.44-1.42 2.44-1.1 1.1-1.8 1.41-2.29 1.41-.48 0-1-.31-2.29-.31s-1.82.32-2.29.32c-.48 0-1.15-.31-2.25-1.41zM11.97 4.18c-.02-2.07 1.7-3.83 3.73-3.83.05 0 .1 0 .15.02.11 2.1-1.74 3.96-3.74 3.96-.06 0-.11-.02-.14-.02z"/>
                                </svg>
                                Apple
                            </>
                        )}
                    </button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400">Or use another way</span>
                    </div>
                </div>

                {/* Tabbed Auth Methods */}
                <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
                    <button
                        onClick={() => { setAuthMethod('password'); setShowOtpInput(false); }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${authMethod === 'password' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => { setAuthMethod('magic-link'); setShowOtpInput(false); }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${authMethod === 'magic-link' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Email Link
                    </button>
                    <button
                        onClick={() => { setAuthMethod('phone'); setShowOtpInput(false); }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${authMethod === 'phone' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Phone/SMS
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm flex flex-col gap-1">
                        <div className="flex items-start">
                            <span className="font-semibold mr-2">Notice:</span> {error}
                        </div>
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 rounded-xl bg-brand-50 text-brand-700 border border-brand-100 text-sm font-medium flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        {message}
                    </div>
                )}

                {authMethod === 'password' && (
                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label htmlFor="email-login" className="text-sm font-medium text-slate-700 pl-1">Email Address</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    id="email-login"
                                    type="email"
                                    name="email"
                                    autoComplete="username"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between pl-1">
                                <label htmlFor="password-login" className="text-sm font-medium text-slate-700">Password</label>
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
                                    id="password-login"
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900"
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
                )}

                {authMethod === 'magic-link' && (
                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 pl-1">Email Address</label>
                            <div className="relative">
                                <MailQuestion className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 pl-1 mt-1">We&apos;ll send you a link that logs you in instantly without a password.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Send Magic Link
                                    <Mail className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {authMethod === 'phone' && (
                    <div className="space-y-5">
                        {!showOtpInput ? (
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 pl-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900"
                                        placeholder="+44 7700 900XXX"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 pl-1 mt-1">Include your country code (e.g. +44 for UK).</p>
                                
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={isLoading || !phone}
                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Send One-Time Code
                                            <Smartphone className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 pl-1">Enter 6-digit Code</label>
                                    <div className="relative">
                                        <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-center tracking-[0.5em] text-xl font-bold text-slate-900"
                                            placeholder="XXXXXX"
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowOtpInput(false)}
                                        className="text-xs text-brand-600 hover:underline mt-2 pl-1"
                                    >
                                        Change phone number
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleVerifyOTP}
                                    disabled={isLoading || otp.length < 6}
                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Verify & Log In
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError(null)
                            setMessage(null)
                            // Reset to password method when switching between login/signup
                            setAuthMethod('password')
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
