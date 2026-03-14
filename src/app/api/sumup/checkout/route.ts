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

        const customerId = membershipId ? `eeis-m-${membershipId}` : `eeis-d-${metadata?.donation_id || Date.now()}`

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

        // Generate a unique checkout reference
        const prefix = isRecurring ? 'SUB_' : 'MEM_'
        const checkoutReference = reference || (membershipId 
            ? `${prefix}${membershipId}__${Date.now()}` 
            : `DON_${metadata?.donation_id || 'NONE'}__${Date.now()}`)

        const sumupPayload: any = {
            checkout_reference: checkoutReference,
            amount: amount,
            currency: 'GBP',
            merchant_code: merchantCode,
            description: description || `Online Membership Application - ${name || membershipId}`,
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
