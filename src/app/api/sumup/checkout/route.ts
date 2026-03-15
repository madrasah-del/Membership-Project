import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { amount, membershipId, email, name, isRecurring, description, reference, metadata } = body

        if (!amount || (!membershipId && !metadata?.donation_id)) {
            return NextResponse.json(
                { error: 'Amount and a Target (Membership or Donation) are required' },
                { status: 400 }
            )
        }

        const sumupSecretKey = process.env.SUMUP_SECRET_KEY
        const merchantCode = process.env.NEXT_PUBLIC_SUMUP_MERCHANT_CODE
        const merchantEmail = process.env.SUMUP_MERCHANT_EMAIL || 'madrasah@eeis.co.uk'

        if (!sumupSecretKey || !merchantCode) {
            return NextResponse.json(
                { error: 'SumUp API keys or Merchant Code are not configured on the server.' },
                { status: 500 }
            )
        }

        const customerId = membershipId 
            ? `m${membershipId.replace(/-/g, '')}`.slice(0, 32) 
            : `d${(metadata?.donation_id || Date.now().toString()).replace(/-/g, '')}`.slice(0, 32)

        if (isRecurring) {
            // Ensure a customer exists for card tokenization
            await fetch('https://api.sumup.com/v0.1/customers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sumupSecretKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_id: customerId,
                    personal_details: {
                        first_name: name?.split(' ')[0] || 'Member',
                        last_name: name?.split(' ').slice(1).join(' ') || 'EEIS',
                        email: email || merchantEmail
                    }
                })
            })
        }

        // Generate a unique checkout reference (Max 50 chars)
        const prefix = isRecurring ? 'S' : 'M'
        const refSeed = (membershipId || metadata?.donation_id || Date.now().toString()).replace(/-/g, '')
        const checkoutReference = reference || `${prefix}${refSeed.slice(0, 12)}${Date.now()}`.slice(0, 50)

        const sumupPayload: Record<string, unknown> = {
            checkout_reference: checkoutReference,
            amount: Number(amount.toFixed(2)),
            currency: 'GBP',
            merchant_code: merchantCode,
            description: (description || `Online Membership Application - ${name || membershipId}`).slice(0, 255),
        }

        if (isRecurring) {
            sumupPayload.customer_id = customerId;
            sumupPayload.purpose = 'SETUP_RECURRING_PAYMENT';
        }

        const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sumupSecretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sumupPayload)
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('SumUp API Error:', data)
            return NextResponse.json(
                { error: 'Failed to create SumUp checkout', details: data },
                { status: response.status }
            )
        }

        // Return the checkout ID which the frontend widget needs
        return NextResponse.json({
            checkoutId: data.id,
            message: 'Checkout created successfully'
        })

    } catch (error) {
        console.error('Error creating SumUp checkout:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
