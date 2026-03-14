import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Save, UserCircle, Bell, Shield, Smartphone } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-2">Manage your personal profile and application preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                <UserCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Personal Info</h2>
                <p className="text-sm text-slate-500">Update your email and basic details</p>
              </div>
            </div>
          </div>
          <div className="p-8 grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input type="email" disabled value={user.email} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Display Name</label>
              <input type="text" placeholder="Not set" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-brand-300 transition-colors cursor-pointer group">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Communication</h3>
              <p className="text-sm text-slate-500 mt-1">WhatsApp & SMS preferences</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-brand-300 transition-colors cursor-pointer group">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Security</h3>
              <p className="text-sm text-slate-500 mt-1">Change password & sessions</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
