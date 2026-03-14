import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/dashboard/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch active membership to get preferences
  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-2">Manage your personal profile and application preferences.</p>
      </div>

      <SettingsForm 
        initialEmail={user.email || ''}
        initialFirstName={membership?.first_name || ''}
        initialLastName={membership?.last_name || ''}
        initialPhone={membership?.phone || ''}
        initialProfession={membership?.profession || ''}
        initialPosition={membership?.position || ''}
        initialNewsletterOptIn={membership?.newsletter_opt_in || false}
        initialWhatsappOptIn={membership?.whatsapp_opt_in || false}
        initialBusinessOptIn={membership?.business_opt_in || false}
        initialBusinessType={membership?.business_type || ''}
        initialBusinessName={membership?.business_name || ''}
        initialBusinessContact={membership?.business_contact || ''}
        initialBusinessWebsite={membership?.business_website || ''}
        initialBusinessDescription={membership?.business_description || ''}
      />
    </div>
  )
}
