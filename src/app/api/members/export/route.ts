import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: members, error } = await supabase
            .from('memberships')
            .select('first_name, last_name, email, phone, profession, position, status, created_at')
            .order('created_at', { ascending: false })

        if (error) throw error

        if (!members || members.length === 0) {
            return new NextResponse('No members found', { status: 404 })
        }

        // CSV Headers
        const headers = [
            'First Name',
            'Last Name',
            'Email',
            'Phone',
            'Profession',
            'Position',
            'Status',
            'Joined Date'
        ].join(',')

        // CSV Rows
        const rows = members.map(m => [
            m.first_name,
            m.last_name,
            m.email,
            m.phone,
            `"${m.profession || ''}"`,
            `"${m.position || ''}"`,
            m.status,
            new Date(m.created_at).toLocaleDateString()
        ].join(','))

        const csv = [headers, ...rows].join('\n')

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="members-export-${new Date().toISOString().split('T')[0]}.csv"`
            }
        })

    } catch (error: any) {
        console.error('Export Error:', error)
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
