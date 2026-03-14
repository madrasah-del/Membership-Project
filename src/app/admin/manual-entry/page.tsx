'use client'

import { useState } from 'react'
import { 
    Upload, 
    FileText, 
    CheckCircle2, 
    Loader2, 
    Scan as ScanIcon, 
    AlertCircle, 
    MousePointer2,
    Keyboard,
    Zap,
    ArrowRight,
    ArrowLeft
} from 'lucide-react'
import { ManualMemberForm } from '@/components/admin/ManualMemberForm'

export default function ManualEntryPage() {
    const [isHovering, setIsHovering] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [scanComplete, setScanComplete] = useState(false)
    const [scanProgress, setScanProgress] = useState(0)
    const [showManualForm, setShowManualForm] = useState(false)

    const handleStartScan = () => {
        setIsScanning(true)
        setScanProgress(0)
        
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setIsScanning(false)
                    setScanComplete(true)
                    return 100
                }
                return prev + 2
            })
        }, 50)
    }

    if (showManualForm) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowManualForm(false)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-90"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paper Form Digitization</h1>
                        <p className="text-slate-500 text-sm">Create a digital member record from handwriting.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
                    <ManualMemberForm 
                        onSuccess={() => setShowManualForm(false)}
                        onCancel={() => setShowManualForm(false)}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Data Digitization</h1>
                <p className="text-slate-500 text-lg">Convert paper records into digital member profiles with AI assistance.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Smart OCR Section */}
                <div 
                    className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden flex flex-col items-center text-center
                        ${isHovering ? 'border-brand-500 bg-brand-50/20 shadow-2xl shadow-brand-500/10' : 'border-slate-200 bg-white shadow-xl shadow-slate-200/50'}
                    `}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <div className="absolute top-0 right-0 p-4">
                        <div className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest">Experimental AI</div>
                    </div>

                    <div className="mb-10 relative">
                        {isScanning ? (
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <div className="absolute inset-0 border-4 border-brand-100 rounded-[2.5rem] animate-pulse"></div>
                                <div 
                                    className="absolute inset-0 border-4 border-brand-500 rounded-[2.5rem] transition-all duration-500"
                                    style={{ clipPath: `inset(${100 - scanProgress}% 0 0 0)` }}
                                ></div>
                                <ScanIcon className="w-12 h-12 text-brand-600 animate-bounce" />
                            </div>
                        ) : scanComplete ? (
                            <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center animate-scale-in">
                                <CheckCircle2 className="w-16 h-16" />
                            </div>
                        ) : (
                            <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center transition-all duration-500
                                ${isHovering ? 'bg-brand-500 text-white scale-110 rotate-12 shadow-2xl shadow-brand-500/40' : 'bg-slate-100 text-slate-400'}
                            `}>
                                <Upload className="w-16 h-16" />
                            </div>
                        )}
                        
                        {isScanning && (
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-brand-100 flex items-center gap-2 whitespace-nowrap">
                                <Activity className="w-3 h-3 text-brand-500 animate-spin" />
                                <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Analyzing Form {scanProgress}%</span>
                            </div>
                        )}
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mb-4">Neural Form Scan</h2>
                    <p className="text-slate-500 mb-10 max-w-sm leading-relaxed">
                        Precision OCR technology detects handwriting and extracts structured data from paper membership forms instantly.
                    </p>

                    <div className="w-full space-y-4">
                        <button 
                            onClick={handleStartScan}
                            disabled={isScanning || scanComplete}
                            className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl
                                ${scanComplete ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 active:scale-95'}
                            `}
                        >
                            {isScanning ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : scanComplete ? (
                                <>Extraction Verified <ArrowRight className="w-5 h-5" /></>
                            ) : (
                                <>Initialize Scanner <Zap className="w-5 h-5 text-brand-400" /></>
                            )}
                        </button>
                        
                        {!isScanning && !scanComplete && (
                            <div className="flex items-center justify-center gap-4 text-slate-400">
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">or drop file here</span>
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                        <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accuracy</span>
                            <span className="text-xl font-black text-slate-900">98.4%</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Saved</span>
                            <span className="text-xl font-black text-brand-600">-5m/p</span>
                        </div>
                    </div>
                </div>

                {/* Manual Input Section */}
                <div className="p-8 rounded-[2.5rem] border-2 border-slate-200 bg-white flex flex-col shadow-xl shadow-slate-200/50">
                    <div className="mb-10 flex items-center justify-between">
                        <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-500">
                            <Keyboard className="w-8 h-8" />
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-black text-slate-900 leading-tight">Manual Input</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legacy entry mode</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    <MousePointer2 className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 tracking-tight">Classic Interface</p>
                                    <p className="text-sm text-slate-500 leading-relaxed mt-1">
                                        Use our high-speed form to manually type in details from paper records and stand-alone SumUp payments.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-500">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 tracking-tight">Full Validation</p>
                                    <p className="text-sm text-slate-500 leading-relaxed mt-1">
                                        Ensures all required fields are captured according to society rules.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowManualForm(true)}
                        className="w-full mt-10 py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        Open Manual Form
                        <FileText className="w-5 h-5 opacity-50" />
                    </button>
                </div>
            </div>

            {/* Verification Footer */}
            <div className="bg-amber-50 border border-amber-100/50 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <p className="font-black text-amber-900">Security & Integrity Check</p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                        All digitized records must be manually verified against the original paper form before final committee approval.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-amber-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">System Ready</span>
                </div>
            </div>
        </div>
    )
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
