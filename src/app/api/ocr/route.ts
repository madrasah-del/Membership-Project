import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json({ error: 'No valid file provided' }, { status: 400 });
        }

        // Simulating processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock response
        return NextResponse.json({
            success: true,
            data: {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
                phone: '07123456789',
                addressLine1: '123 Fake Street',
                city: 'London',
                postcode: 'E1 6AN',
                willingToVolunteer: true,
                volunteerRoles: ['events_setup', 'kitchen_help'],
                willingToDonate: true,
                donationTypes: ['financial'],
            }
        });

    } catch (error) {
        console.error('OCR Error:', error);
        return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
    }
}
