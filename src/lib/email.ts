export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Email simulation:', { to, subject });
        // In dev/test, we might want to log the HTML or just return success
        return { success: true, simulated: true };
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'EEIS Membership <notifications@madrasah.eeis.co.uk>',
                to,
                subject,
                html
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('Resend API error:', errorData);
            return { success: false, error: errorData };
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Email sending failed:', error);
        return { success: false, error: message };
    }
}
