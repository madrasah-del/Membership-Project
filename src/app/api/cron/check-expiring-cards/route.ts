import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'


const SUMUP_API_BASE = 'https://api.sumup.com/v0.1'

export async function GET(request: Request) {
    // This creates a service role client to bypass RLS for background jobs
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Verify Vercel Cron Secret (or allow manual testing locally)
    const authHeader = request.headers.get('authorization')
    if (
        process.env.NODE_ENV === 'production' &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        // 2. Find all memberships with an active auto-renew
        // First get distinct user_id where they have an active recurring payment
        const { data: recurringPayments, error: paymentError } = await supabase
            .from('payments')
            .select('user_id')
            .eq('is_recurring', true)

        if (paymentError) throw paymentError;

        // Extract unique user IDs
        const uniqueUserIds = [...new Set(recurringPayments.map(p => p.user_id))]

        if (uniqueUserIds.length === 0) {
            return NextResponse.json({ success: true, message: 'No active recurring subscriptions found.' })
        }

        // Fetch user data and memberships for these users
        const { data: memberships, error: membershipError } = await supabase
            .from('memberships')
            .select('id, user_id, first_name, last_name, sumup_customer_id, profiles!inner(email)')
            .in('user_id', uniqueUserIds)

        if (membershipError) throw membershipError;

        let notificationsSent = 0;
        let errors = [];

        // Determine target expiry month (e.g., next month. If it's currently March, we check for cards expiring in April)
        const now = new Date()
        const currentYearStr = String(now.getFullYear()).slice(2) // e.g. "26" 

        for (const membership of memberships) {
            if (!membership.sumup_customer_id) continue;

            const profile = membership.profiles as unknown as { email: string };
            const email = profile?.email;
            if (!email) continue;

            try {
                // Call SumUp API to check instruments
                const sumupRes = await fetch(`${SUMUP_API_BASE}/customers/${membership.sumup_customer_id}/payment-instruments`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.SUMUP_SECRET_KEY}`
                    }
                })

                if (!sumupRes.ok) {
                    throw new Error(`SumUp API error: ${sumupRes.statusText}`)
                }

                const sumupData = await sumupRes.json()
                const instruments = sumupData.items || []

                if (instruments.length === 0) continue;

                // SumUp orders the instruments, we take the active one or any that matches recurring.
                // In finalizeCardUpdate, we delete old ones, so there should ideally be only 1.
                // Alternatively, find the card whose ID was used? We don't store instrument IDs locally. 
                // We'll just check all active instruments.
                for (const instrument of instruments) {
                    if (instrument.type !== 'card' || !instrument.card) continue;

                    const { exp_month: expMonth, exp_year: expYear } = instrument.card;
                    if (!expMonth || !expYear) continue;

                    // Calculate days until expiry
                    // Expiry is typically end of the month `expMonth` in `expYear` (XX)
                    // We'll construct a date for the 1st of the next month, then subtract 1 day to get the end of expMonth
                    const fullExpYear = 2000 + parseInt(expYear, 10);
                    const expiryDate = new Date(fullExpYear, parseInt(expMonth, 10), 0); // 0th day of next month is last day of expMonth

                    const diffTime = expiryDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    // If expiry is within 30 days or less (but not already expired/negative a long time)
                    if (diffDays <= 30 && diffDays > 0) {
                        // Send expiration email
                        await sendExpiryEmail(
                            email,
                            membership.first_name,
                            instrument.card.last_4_digits,
                            `${expMonth}/${expYear}`
                        );
                        notificationsSent++;
                        break; // Sent notification for this user, move to next user
                    }
                }
            } catch (err: any) {
                errors.push(`Failed for user ${membership.user_id}: ${err.message}`)
            }
        }

        return NextResponse.json({
            success: true,
            notificationsSent,
            errors: errors.length > 0 ? errors : undefined
        })
    } catch (error: any) {
        console.error('Check expiring cards error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Simple fetch-based Resend email integration
async function sendExpiryEmail(email: string, firstName: string, last4: string, expiry: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Email simulation:', { email, firstName, last4, expiry })
        return;
    }

    const html = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Action Required: Update Your Payment Method</h2>
        <p>Dear ${firstName},</p>
        <p>We are writing to let you know that the payment card ending in <strong>${last4}</strong> associated with your annual EEIS membership is scheduled to expire soon (${expiry}).</p>
        <p>To ensure your membership auto-renews without interruption, please update your payment method.</p>
        <p>
            <a href="https://madrasah.eeis.co.uk/dashboard/payments" style="display: inline-block; padding: 10px 20px; background-color: #0f172a; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Update Payment Method
            </a>
        </p>
        <p>Alternatively, you can manually renew your membership when it expires.</p>
        <p>Thank you,<br>The EEIS Team</p>
    </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'EEIS Membership <notifications@madrasah.eeis.co.uk>',
            to: email,
            subject: 'Action Required: Your Payment Card is Expiring Soon',
            html: html
        })
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }
}
