import { CheckSquare } from 'lucide-react'

export default function ManualEntryPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manual Entry</h1>
                    <p className="text-slate-500 mt-1">Digitize paper membership forms and record manual payments.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Smart OCR Upload Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
                    <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                        <CheckSquare className="w-8 h-8 text-brand-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Smart Form Scan</h2>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">
                        Upload a photo or scanned PDF of a paper membership form. AI will automatically extract the details to save you time.
                    </p>
                    <button className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20">
                        Upload Scan
                    </button>
                    <p className="text-xs text-slate-400 mt-4">(Coming Soon)</p>
                </div>

                {/* Manual Input Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <CheckSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Manual Data Entry</h2>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">
                        Prefer to type it out? Manually enter the details from the paper form and record cash or direct debit payments.
                    </p>
                    <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm">
                        Start Typing
                    </button>
                    <p className="text-xs text-slate-400 mt-4">(Coming Soon)</p>
                </div>
            </div>
        </div>
    )
}
