import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Check for admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user?.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const sumupSecretKey = process.env.SUMUP_SECRET_KEY
        if (!sumupSecretKey) {
            return NextResponse.json({ error: 'SumUp Secret Key not configured' }, { status: 500 })
        }

        // Parse search params (limit, status, etc.)
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit') || '50'
        
        // Fetch from SumUp
        // https://developer.sumup.com/rest-api/resources/transactions/history
        const response = await fetch(`https://api.sumup.com/v0.1/me/transactions/history?limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${sumupSecretKey}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch from SumUp', details: data }, { status: response.status })
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error('SumUp Sync Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
