import { getAppSettings, updateSetting } from './actions'
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export default async function SettingsPage() {
    const settings = await getAppSettings()
    const headersList = await headers()
    const host = headersList.get('host')

    // Find the min_membership_fee setting
    const minFeeSetting = settings?.find(s => s.setting_key === 'min_membership_fee')
    // Parse the JSONB value (it was stored as a string or number in JSONB)
    const currentMinFee = minFeeSetting ? Number(minFeeSetting.setting_value) : 10.00

    async function handleUpdateFee(formData: FormData) {
        'use server'
        const newFeeStr = formData.get('minFee')
        if (!newFeeStr) return

        const newFeeNum = parseFloat(newFeeStr.toString())
        if (isNaN(newFeeNum) || newFeeNum < 0) return

        await updateSetting('min_membership_fee', newFeeNum.toFixed(2))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
                <p className="text-slate-500 mt-1">Configure global application variables and rules.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Financial Settings</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage global fee constants used throughout the application.</p>
                </div>

                <div className="p-6">
                    <form action={handleUpdateFee} className="space-y-4 max-w-md">
                        <div>
                            <label htmlFor="minFee" className="block text-sm font-medium text-slate-700 mb-1">
                                Minimum Membership Fee (£)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                                <input
                                    type="number"
                                    id="minFee"
                                    name="minFee"
                                    defaultValue={currentMinFee.toFixed(2)}
                                    step="0.01"
                                    min="0"
                                    required
                                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                This is the default amount requested during new signups and renewals.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">SumUp Integration</h2>
                    <p className="text-sm text-slate-500 mt-1">Review your online payment gateway connection status.</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Merchant Code (Public)</span>
                            <div className="mt-1 font-mono text-sm text-slate-700">
                                {process.env.NEXT_PUBLIC_SUMUP_MERCHANT_CODE || <span className="text-red-500">Not Configured</span>}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">API Secret Status</span>
                            <div className="mt-1 flex items-center gap-2">
                                {process.env.SUMUP_SECRET_KEY ? (
                                    <span className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                        <AlertCircle className="w-3.5 h-3.5" /> Missing
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
                        <h4 className="text-sm font-semibold text-brand-900 flex items-center gap-2">
                            <Save className="w-4 h-4" /> Webhook Configuration
                        </h4>
                        <p className="text-xs text-brand-800 mt-2 leading-relaxed">
                            To ensure automatic reconciliation, set your SumUp Webhook URL in the SumUp Dashboard to:
                            <br />
                            <code className="bg-white/50 px-2 py-0.5 rounded mt-1 inline-block font-bold">
                                https://{host}/api/sumup/webhook
                            </code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
