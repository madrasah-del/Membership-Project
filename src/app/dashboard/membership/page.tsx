import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, Download, ShieldCheck, User } from 'lucide-react'

export default async function MembershipDetailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Membership</h1>
        <p className="text-slate-500 mt-2">View and manage your official society records.</p>
      </div>

      {!membership ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
           <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-600">No active membership found. <a href="/apply" className="text-brand-600 font-bold">Apply now</a></p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Personal Information</h3>
                <p className="text-sm text-slate-500">How you appear in our records.</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-y-4 text-sm mt-4">
               <div>
                 <dt className="text-slate-500">First Name</dt>
                 <dd className="font-semibold text-slate-900 mt-0.5">{membership.first_name}</dd>
               </div>
               <div>
                 <dt className="text-slate-500">Last Name</dt>
                 <dd className="font-semibold text-slate-900 mt-0.5">{membership.last_name}</dd>
               </div>
               <div className="col-span-2">
                 <dt className="text-slate-500">Address</dt>
                 <dd className="font-semibold text-slate-900 mt-0.5">{membership.address}, {membership.town}, {membership.postcode}</dd>
               </div>
            </dl>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Certificate of Membership</h3>
                <p className="text-sm text-slate-500">Download your official status proof.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">EEIS_MEMBERSHIP_CERT.pdf</span>
              </div>
              <button disabled className="p-2 text-slate-400 hover:text-brand-600 transition-colors opacity-50 cursor-not-allowed">
                <Download className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 italic">Certificates are available for download once membership is fully 'Active'.</p>
          </div>
        </div>
      )}
    </div>
  )
}
