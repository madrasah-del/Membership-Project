'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'

export default function AuthCodeError() {
    return (
        <div className="flex-grow flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-50">
                <div className="absolute top-[10%] right-[20%] w-[40%] h-[40%] rounded-full bg-red-100/40 blur-3xl opacity-60"></div>
                <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-slate-200/30 blur-3xl opacity-60"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/40 animate-fade-in-up text-center">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-6 shadow-sm">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Authentication Error</h1>
                    <p className="text-slate-500 mt-3 text-sm leading-relaxed">
                        We encountered a problem while verifying your login request. This could be due to an expired link or a connection issue.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/login"
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                    
                    <Link
                        href="/"
                        className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Go to Home
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-400 italic">
                        If the problem persists, please contact the committee for support.
                    </p>
                </div>
            </div>
        </div>
    )
}
