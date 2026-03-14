import { z } from 'zod'

// ... existing schemas

export const personalDetailsSchema = z.object({
    title: z.string().optional(),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    dateOfBirth: z.string().refine((date) => {
        const dob = new Date(date)
        const today = new Date()
        let age = today.getFullYear() - dob.getFullYear()
        const m = today.getMonth() - dob.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--
        }
        return age >= 18
    }, { message: 'You must be at least 18 years old to apply' }),
    profession: z.string().min(2, 'Profession is required'),
    functionalPosition: z.string().min(2, 'Functional area is required'),
    position: z.string().min(2, 'Job title is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required'),
})

export const addressSchema = z.object({
    address: z.string().min(5, 'Full address is required'),
    town: z.string().min(2, 'Town/City is required'),
    postcode: z.string().min(5, 'Valid postcode is required'),
})

export const photoSchema = z.object({
    photoUrl: z.string().optional(),
})

export const dependentsSchema = z.object({
    dependents: z.array(z.object({
        name: z.string().min(2, 'Name is required'),
        relation: z.string().min(2, 'Relation is required'),
        mobile: z.string().optional(),
        email: z.string().email('Invalid email').optional().or(z.literal('')),
    })).max(8, 'Maximum 8 dependents allowed'),
})

export const eligibilitySchema = z.object({
    isResidentOrRegular: z.boolean().refine(val => val === true, {
        message: 'You must meet the residency or regular attendee criteria'
    }),
    isSunniMuslim: z.boolean().refine(val => val === true, {
        message: 'You must declare that you are a Sunni Muslim'
    }),
    hasGiftAidDeclaration: z.boolean().optional(),
    whatsappOptIn: z.boolean(),
    isNonResidentConfirmation: z.boolean().optional(),
})

export const postPaymentSchema = z.object({
    photoUrl: z.string().optional(),
    proposedBy: z.string().optional(),
    secondedBy: z.string().optional(),
    committeeContactId: z.string().optional(),
})

export type PersonalDetailsData = z.infer<typeof personalDetailsSchema>
export type AddressData = z.infer<typeof addressSchema>
export type PhotoData = z.infer<typeof photoSchema>
export type DependentsData = z.infer<typeof dependentsSchema>
export type EligibilityData = z.infer<typeof eligibilitySchema>
export type PostPaymentData = z.infer<typeof postPaymentSchema>

// Combined schema for final submission (initial stage)
export const fullApplicationSchema = z.object({
    ...personalDetailsSchema.shape,
    ...addressSchema.shape,
    ...dependentsSchema.shape,
    ...eligibilitySchema.shape,
})
