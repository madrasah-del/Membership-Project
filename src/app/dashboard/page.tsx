import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardOverview from '@/components/dashboard/DashboardOverview'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get current user session
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch member profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch active membership application if any
    const { data: membership } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // Prepare current settings to pass to child components
    const currentSettings = {
        phone: membership?.phone || '',
        profession: membership?.profession || '',
        position: membership?.position || '',
        newsletter_opt_in: membership?.newsletter_opt_in || false,
        whatsapp_opt_in: membership?.whatsapp_opt_in || false,
        business_opt_in: membership?.business_opt_in || false,
        business_type: membership?.business_type || '',
        business_name: membership?.business_name || '',
        business_website: membership?.business_website || '',
        business_contact: membership?.business_contact || '',
        business_description: membership?.business_description || '',
        functional_position: membership?.functional_position || '',
    }

    return (
        <>
            <div className="mb-10 animate-fade-in">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome{membership?.first_name ? `, ${membership.first_name}` : ''}
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Manage your EEIS membership and details.</p>
            </div>

            <DashboardOverview 
                membership={membership} 
                profile={profile} 
                currentSettings={currentSettings} 
            />
        </>
    )
}
