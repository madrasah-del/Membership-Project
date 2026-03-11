import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { amount, membershipId, email, name, isRecurring } = body

        if (!amount || !membershipId) {
            return NextResponse.json(
                { error: 'Amount and membershipId are required' },
                { status: 400 }
            )
        }

        const sumupSecretKey = process.env.SUMUP_SECRET_KEY
        const merchantCode = process.env.NEXT_PUBLIC_SUMUP_MERCHANT_CODE

        if (!sumupSecretKey || !merchantCode) {
            return NextResponse.json(
                { error: 'SumUp API keys or Merchant Code are not configured on the server.' },
                { status: 500 }
            )
        }

        const customerId = `eeis-m-${membershipId}`

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
                        email: email || process.env.NEXT_PUBLIC_SUMUP_MERCHANT_EMAIL || 'madrasah@eeis.co.uk'
                    }
                })
            })
        }

        // Generate a unique checkout reference
        const checkoutReference = `CHK-${membershipId}-${Date.now()}`

        const sumupPayload: any = {
            checkout_reference: checkoutReference,
            amount: amount,
            currency: 'GBP',
            pay_to_email: email || process.env.NEXT_PUBLIC_SUMUP_MERCHANT_EMAIL || 'madrasah@eeis.co.uk', // Fallback
            merchant_code: merchantCode,
            description: `Online Membership Application - ${name || membershipId}`,
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
