'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { fullApplicationSchema } from '@/lib/validations'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

type FullApplicationData = z.infer<typeof fullApplicationSchema>

export async function checkDuplicateMembership(data: { firstName: string; lastName: string; dateOfBirth: string }) {
    const supabase = await createClient()

    const { data: duplicateMembership, error } = await supabase
        .from('memberships')
        .select('id, user_id, status')
        .ilike('first_name', data.firstName)
        .ilike('last_name', data.lastName)
        .eq('date_of_birth', data.dateOfBirth)
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('Deduplication check error:', error)
        return { isDuplicate: false }
    }

    if (duplicateMembership) {
        return { 
            isDuplicate: true, 
            status: duplicateMembership.status 
        }
    }

    return { isDuplicate: false }
}

export async function submitApplication(data: FullApplicationData & { paymentMethod?: string; isRecurring?: boolean; giftAidConsent?: boolean }) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'You must be logged in to submit an application.' }
    }

    // Server-side validation
    const validationResult = fullApplicationSchema.safeParse(data)

    if (!validationResult.success) {
        return {
            error: 'Invalid application data. Please check your inputs.',
            details: validationResult.error.flatten()
        }
    }

    const validData = validationResult.data

    try {
        // Check if membership application already exists for this USER ID
        const { data: existingApp } = await supabase
            .from('memberships')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (existingApp) {
            return { error: 'An application already exists for this account.' }
        }

        // Check for duplicate membership by Name and DOB (Deduplication)
        const duplicate = await checkDuplicateMembership({
            firstName: validData.firstName,
            lastName: validData.lastName,
            dateOfBirth: validData.dateOfBirth
        })

        if (duplicate.isDuplicate) {
            return { 
                error: 'Our records indicate that an application with this name and date of birth already exists.',
                details: 'If you have created an account before with a different email (e.g., Google or Apple), please use that login instead. If this is an error, please contact the committee.'
            }
        }

        // Insert membership record
        const { data: newMembership, error: insertError } = await supabase
            .from('memberships')
            .insert({
                user_id: user.id,
                title: validData.title,
                first_name: validData.firstName,
                last_name: validData.lastName,
                date_of_birth: validData.dateOfBirth,
                profession: validData.profession,
                functional_position: validData.functionalPosition,
                position: validData.position,
                phone: validData.phone,
                address: validData.address,
                town: validData.town,
                postcode: validData.postcode,
                dependents: validData.dependents,
                eligibility_criteria_met: validData.isResidentOrRegular && validData.isSunniMuslim,
                is_non_resident_confirmation: validData.isNonResidentConfirmation,
                whatsapp_opt_in: validData.whatsappOptIn,
                business_opt_in: validData.businessOptIn ?? false,
                business_type: validData.businessType,
                business_name: validData.businessName,
                business_website: validData.businessWebsite,
                business_contact: validData.businessContact,
                business_description: validData.businessDescription,
                status: 'pending_payment'
            })
            .select('id')
            .single()

        if (insertError || !newMembership) {
            console.error('Supabase Insert Error:', insertError)
            return { error: 'Failed to save application to the database.' }
        }

        // Create Gift Aid declaration if consented
        let giftAidDeclarationId = null
        if (validData.hasGiftAidDeclaration) {
            const { data: declaration, error: giftAidError } = await supabase
                .from('gift_aid_declarations')
                .insert({
                    user_id: user.id,
                    first_name: validData.firstName,
                    last_name: validData.lastName,
                    address_line1: validData.address,
                    town: validData.town,
                    postcode: validData.postcode,
                    declaration_text: "I want to Gift Aid my donation and any donations I make in the future or have made in the past 4 years to the Society. I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations in that tax year it is my responsibility to pay any difference.",
                    status: 'active',
                    is_uk_taxpayer: true
                })
                .select('id')
                .single()

            if (giftAidError) {
                console.error('Gift Aid Declaration Error (non-fatal):', giftAidError)
            } else {
                giftAidDeclarationId = declaration.id
            }
        }

        // Insert a pending payment record based on chosen method
        const paymentMethod = data.paymentMethod || 'sumup'
        const isRecurring = data.isRecurring ?? false
        const paymentStatus = paymentMethod === 'sumup' ? 'pending' : 'pending_verification'

        // Fetch membership fee from settings
        const { data: settings } = await supabase
            .from('app_settings')
            .select('setting_value')
            .eq('setting_key', 'min_membership_fee')
            .single()
        
        const baseAmount = settings ? parseFloat(settings.setting_value) : 10.00
        const calculatedAmount = baseAmount + ((validData.dependents?.length || 0) * baseAmount);

        const { error: paymentInsertError } = await supabase
            .from('payments')
            .insert({
                membership_id: newMembership.id,
                amount: calculatedAmount,
                payment_method: paymentMethod,
                status: paymentStatus,
                is_recurring: isRecurring,
                payment_type: 'new',
                gift_aid_declaration_id: giftAidDeclarationId
            })

        if (paymentInsertError) {
            console.error('Payment record error (non-fatal):', paymentInsertError)
        }

        revalidatePath('/dashboard')
        revalidatePath('/apply')

        return {
            success: true,
            membershipId: newMembership.id,
            amount: calculatedAmount,
            applicantName: `${validData.firstName} ${validData.lastName}`
        }

    } catch (error) {
        console.error('Submission Error:', error)
        return { error: 'An unexpected error occurred during submission.' }
    }
}

export async function getCommitteeMembers() {
    const supabase = await createClient()
    
    // Fetch committee members (active memberships for users with admin role)
    const { data: admins, error } = await supabase
        .from('profiles')
        .select(`
            id,
            email,
            memberships!inner (
                first_name,
                last_name
            )
        `)
        .eq('role', 'admin')
        .eq('memberships.status', 'active')

    if (error) {
        console.error('Error fetching committee members:', error)
        return []
    }
    
    return (admins || []).map(a => {
        const memberships = a.memberships as unknown as Array<{ first_name: string; last_name: string }>;
        return {
            id: a.id,
            email: a.email,
            name: `${memberships[0]?.first_name} ${memberships[0]?.last_name}`
        };
    })
}

export async function updatePostPaymentData(membershipId: string, data: { photoUrl?: string, proposedBy?: string, secondedBy?: string, committeeContactId?: string }) {
    const supabase = await createClient()

    // 1. Update the membership record
    const { error: updateError } = await supabase
        .from('memberships')
        .update({
            photo_url: data.photoUrl,
            proposed_by: data.proposedBy,
            seconded_by: data.secondedBy,
            committee_contact_id: data.committeeContactId,
            status: 'pending_approval'
        })
        .eq('id', membershipId)

    if (updateError) {
        console.error('Error updating post-payment data:', updateError)
        return { error: 'Failed to update application details.' }
    }

    // 2. Notify committee member if selected
    if (data.committeeContactId) {
        try {
            const { data: membership } = await supabase
                .from('memberships')
                .select('first_name, last_name')
                .eq('id', membershipId)
                .single()

            const { data: committeeMember } = await supabase
                .from('profiles')
                .select(`
                    email,
                    memberships (
                        first_name,
                        last_name
                    )
                `)
                .eq('id', data.committeeContactId)
                .single()

            if (membership && committeeMember) {
                const memberships = committeeMember.memberships as unknown as Array<{ first_name: string; last_name: string }>;
                const adminEmail = committeeMember.email as string
                const adminName = `${memberships[0]?.first_name} ${memberships[0]?.last_name}`
                const applicantName = `${membership.first_name} ${membership.last_name}`

                await sendEmail({
                    to: adminEmail,
                    subject: 'New Membership Application for Review',
                    html: `
                    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
                        <h2 style="color: #0f172a;">Membership Application for Review</h2>
                        <p>Dear ${adminName},</p>
                        <p><strong>${applicantName}</strong> has just completed their membership application and selected you as a contact they know on the committee.</p>
                        <p>Please log in to the admin portal to review their application and provide your feedback to the committee.</p>
                        <p style="margin-top: 30px;">
                            <a href="https://madrasah.eeis.co.uk/admin/approvals" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                                Review Application
                            </a>
                        </p>
                        <p style="margin-top: 30px; border-top: 1px solid #e2e8f0; pt-20px; color: #64748b; font-size: 14px;">
                            Thank you,<br>The EEIS Team
                        </p>
                    </div>
                    `
                })
            }
        } catch (notifyError) {
            console.error('Notification error (non-fatal):', notifyError)
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/approvals')

    return { success: true }
}

export async function recordPaymentSuccess(membershipId: string, transactionId: string) {
    const supabase = await createClient()

    // Update the payment record
    const { error: paymentError } = await supabase
        .from('payments')
        .update({
            status: 'successful',
            sumup_transaction_id: transactionId,
            payment_date: new Date().toISOString()
        })
        .eq('membership_id', membershipId)
        .in('status', ['pending', 'pending_verification'])

    if (paymentError) {
        console.error('Error updating payment record:', paymentError)
        return { error: 'Failed to record payment success.' }
    }

    // Also update the membership status to pending_approval now that it's paid
    const { error: membershipError } = await supabase
        .from('memberships')
        .update({ status: 'pending_approval' })
        .eq('id', membershipId)

    if (membershipError) {
        console.error('Error updating membership status:', membershipError)
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/approvals')
    return { success: true }
}
