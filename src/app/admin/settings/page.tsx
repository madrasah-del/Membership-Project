import { getAppSettings, updateSetting } from './actions'
import { Save, AlertCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function SettingsPage() {
    const settings = await getAppSettings()

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
        </div>
    )
}
