import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ApplicationForm from '@/components/apply/ApplicationForm'
import { FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ApplyPage() {
    const supabase = await createClient()

    // Fetch the dynamic minimum fee setting
    const { data: feeSetting } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'min_membership_fee')
        .single()

    const membershipFee = feeSetting ? Number(feeSetting.setting_value) : 10.00

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?message=Please log in or sign up to start your application')
    }

    // Check if they already have a membership record
    const { data: existingApp } = await supabase
        .from('memberships')
        .select('id, status')
        .eq('user_id', user.id)
        .single()

    if (existingApp) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-slate-900 rounded-b-[3rem] -z-10 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] rounded-full bg-brand-600/20 blur-3xl"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-12">
                <Link href="/dashboard" className="inline-flex items-center text-slate-300 hover:text-white transition-colors mb-8 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <header className="mb-12 text-center text-white">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">EEIS Membership Application</h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Complete the form below to apply for your annual membership. It takes about 5 minutes.
                    </p>
                </header>

                <ApplicationForm membershipFee={membershipFee} />

            </div>
        </div>
    )
}
