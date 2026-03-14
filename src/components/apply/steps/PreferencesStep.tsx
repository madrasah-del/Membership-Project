'use client'

import { useState } from 'react'

const VOLUNTEER_ROLES = [
    'Administration',
    'Cleaners',
    'Delivery/Ordering',
    'Parking attendants',
    'Volunteer general time',
    'Youth club'
]

const DONATION_TYPES = [
    'Financial donors',
    'Produce/food donors'
]

export function PreferencesStep({ initialData, onNext }: { initialData: Record<string, unknown>, onNext: (data: Record<string, unknown>) => void }) {
    const [willingToVolunteer, setWillingToVolunteer] = useState<boolean>((initialData.willingToVolunteer as boolean) || false)
    const [volunteerRoles, setVolunteerRoles] = useState<string[]>((initialData.volunteerRoles as string[]) || [])

    const [willingToDonate, setWillingToDonate] = useState<boolean>((initialData.willingToDonate as boolean) || false)
    const [donationTypes, setDonationTypes] = useState<string[]>((initialData.donationTypes as string[]) || [])

    const toggleRole = (role: string) => {
        setVolunteerRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        )
    }

    const toggleDonationType = (type: string) => {
        setDonationTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
    }

    const handleContinue = () => {
        onNext({
            willingToVolunteer,
            volunteerRoles: willingToVolunteer ? volunteerRoles : [],
            willingToDonate,
            donationTypes: willingToDonate ? donationTypes : []
        })
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Volunteering Section */}
            <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={willingToVolunteer}
                            onChange={(e) => {
                                setWillingToVolunteer(e.target.checked)
                                if (!e.target.checked) setVolunteerRoles([])
                            }}
                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 mt-0.5"
                        />
                        <div>
                            <span className="block font-medium text-slate-900 leading-tight">I am willing to volunteer</span>
                            <span className="block text-sm text-slate-500 mt-1">Help the community by sharing your time and skills.</span>
                        </div>
                    </label>
                </div>

                {willingToVolunteer && (
                    <div className="pl-8 space-y-3 animate-fade-in-up">
                        <p className="text-sm font-medium text-slate-700">Select areas you are interested in:</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {VOLUNTEER_ROLES.map(role => (
                                <label key={role} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={volunteerRoles.includes(role)}
                                        onChange={() => toggleRole(role)}
                                        className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    {role}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full h-px bg-slate-100"></div>

            {/* Donation Section */}
            <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={willingToDonate}
                            onChange={(e) => {
                                setWillingToDonate(e.target.checked)
                                if (!e.target.checked) setDonationTypes([])
                            }}
                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 mt-0.5"
                        />
                        <div>
                            <span className="block font-medium text-slate-900 leading-tight">I am willing to donate regularly</span>
                            <span className="block text-sm text-slate-500 mt-1">Support the community with donations or supplies.</span>
                        </div>
                    </label>
                </div>

                {willingToDonate && (
                    <div className="pl-8 space-y-3 animate-fade-in-up">
                        <p className="text-sm font-medium text-slate-700">Select donation types:</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {DONATION_TYPES.map(type => (
                                <label key={type} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={donationTypes.includes(type)}
                                        onChange={() => toggleDonationType(type)}
                                        className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6">
                <button
                    onClick={handleContinue}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md shadow-slate-900/10"
                >
                    Continue
                </button>
            </div>
        </div>
    )
}
