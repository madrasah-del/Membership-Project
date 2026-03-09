import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return new NextResponse('Forbidden', { status: 403 })
    }

    // Fetch all memberships
    const { data: memberships, error } = await supabase
        .from('memberships')
        .select(`
            id,
            title,
            first_name,
            last_name,
            date_of_birth,
            phone,
            address,
            town,
            postcode,
            marital_status,
            status,
            proposed_by,
            seconded_by,
            whatsapp_opt_in,
            willing_to_volunteer,
            volunteer_roles,
            willing_to_donate,
            donation_types,
            created_at,
            profiles:user_id (email)
        `)
        .order('last_name', { ascending: true })

    if (error) {
        return new NextResponse('Error fetching data', { status: 500 })
    }

    // Build CSV rows
    const headers = [
        'ID', 'First Name', 'Last Name', 'Title', 'Email', 'Phone',
        'Date of Birth', 'Marital Status', 'Address', 'Town', 'Postcode',
        'Status', 'Proposed By', 'Seconded By',
        'WhatsApp Opt-in', 'Willing to Volunteer', 'Volunteer Roles',
        'Willing to Donate', 'Donation Types', 'Joined Date'
    ]

    const escape = (val: unknown) => {
        const str = val == null ? '' : String(val)
        // Wrap in double quotes and escape existing double quotes
        return `"${str.replace(/"/g, '""')}"`
    }

    const rows = (memberships || []).map((m) => {
        const email = Array.isArray(m.profiles) ? m.profiles[0]?.email : (m.profiles as any)?.email
        const volunteerRoles = Array.isArray(m.volunteer_roles) ? m.volunteer_roles.join('; ') : ''
        const donationTypes = Array.isArray(m.donation_types) ? m.donation_types.join('; ') : ''
        return [
            m.id,
            m.first_name,
            m.last_name,
            m.title,
            email,
            m.phone,
            m.date_of_birth,
            m.marital_status,
            m.address,
            m.town,
            m.postcode,
            m.status,
            m.proposed_by,
            m.seconded_by,
            m.whatsapp_opt_in ? 'Yes' : 'No',
            m.willing_to_volunteer ? 'Yes' : 'No',
            volunteerRoles,
            m.willing_to_donate ? 'Yes' : 'No',
            donationTypes,
            new Date(m.created_at).toLocaleDateString('en-GB')
        ].map(escape).join(',')
    })

    const csv = [headers.map(escape).join(','), ...rows].join('\r\n')

    const date = new Date().toISOString().split('T')[0]
    return new NextResponse(csv, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="members-${date}.csv"`
        }
    })
}
