'use client'

import { useState } from 'react'
import { Heart, Gift, ArrowRight, CheckCircle2 } from 'lucide-react'
import { initiateDonation, createGiftAidDeclaration, recordDonationSuccess } from './actions'
import SumUpCheckoutWidget from '@/components/apply/steps/SumUpCheckoutWidget'

const PRESET_AMOUNTS = [10, 25, 50, 100]

export default function DonationPage() {
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [isGiftAid, setIsGiftAid] = useState(true)
  const [step, setStep] = useState<'amount' | 'details' | 'payment' | 'success'>('amount')
  const [checkoutId, setCheckoutId] = useState<string | null>(null)
  const [donationId, setDonationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleInitiate = async (e: any) => {
    e?.preventDefault()
    setLoading(true)
    try {
        const finalAmount = amount || parseFloat(customAmount)
        if (!finalAmount || isNaN(finalAmount)) return

        let giftAidId = undefined
        if (isGiftAid) {
            const formData = new FormData(e.target)
            const declaration = await createGiftAidDeclaration(formData)
            giftAidId = declaration.id
        }

        const { donationId, checkoutId } = await initiateDonation(finalAmount, isRecurring, giftAidId)
        setDonationId(donationId)
        setCheckoutId(checkoutId)
        setStep('payment')
    } catch (error) {
        console.error(error)
        alert('Failed to initiate donation. Please try again.')
    } finally {
        setLoading(false)
    }
  }

  const handlePaymentComplete = async (transactionId: string) => {
    if (donationId) {
        await recordDonationSuccess(donationId, transactionId)
        setStep('success')
    }
  }

  if (step === 'success') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-gray-600 mb-6">
                Your donation of £{amount || customAmount} has been received. Your support makes a huge difference to our society.
            </p>
            <button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
                Return to Dashboard
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Our Mission</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your contributions help us maintain the society and provide better services for our members.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left: Donation Form */}
        <div className="md:col-span-2 space-y-8">
          {step === 'amount' && (
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-xl font-semibold mb-6">Select donation amount</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { setAmount(amt); setCustomAmount('') }}
                    className={`py-4 rounded-xl border-2 transition-all font-bold text-lg ${
                      amount === amt 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-100 hover:border-indigo-200'
                    }`}
                  >
                    £{amt}
                  </button>
                ))}
              </div>
              
              <div className="relative mb-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(null) }}
                  className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-indigo-600 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl mb-8">
                <Gift className="w-6 h-6 text-indigo-500" />
                <div className="flex-1">
                  <h3 className="font-medium">Gift Aid your donation?</h3>
                  <p className="text-sm text-gray-500">Boost your donation by 25% at no extra cost to you.</p>
                </div>
                <button
                    onClick={() => setIsGiftAid(!isGiftAid)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isGiftAid ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isGiftAid ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <button
                disabled={!amount && !customAmount}
                onClick={() => isGiftAid ? setStep('details') : handleInitiate(null)}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Continue'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 'details' && (
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-xl font-semibold mb-6 text-indigo-700 flex items-center gap-2">
                <Gift className="w-6 h-6" /> Gift Aid Declaration
              </h2>
              <form onSubmit={handleInitiate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input name="firstName" placeholder="First Name" required className="p-3 rounded-lg border outline-none focus:ring-2 ring-indigo-100" />
                    <input name="lastName" placeholder="Last Name" required className="p-3 rounded-lg border outline-none focus:ring-2 ring-indigo-100" />
                </div>
                <input name="addressLine1" placeholder="Address Line 1" required className="w-full p-3 rounded-lg border outline-none focus:ring-2 ring-indigo-100" />
                <div className="grid grid-cols-2 gap-4">
                    <input name="town" placeholder="Town/City" required className="p-3 rounded-lg border outline-none focus:ring-2 ring-indigo-100" />
                    <input name="postcode" placeholder="Postcode" required className="p-3 rounded-lg border outline-none focus:ring-2 ring-indigo-100" />
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
                    <div className="flex gap-3">
                        <input type="checkbox" name="isUkTaxpayer" id="taxpayer" required defaultChecked className="mt-1" />
                        <label htmlFor="taxpayer" className="text-sm text-gray-800 leading-tight">
                            I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations in that tax year it is my responsibility to pay any difference.
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setStep('amount')} className="flex-1 py-4 font-medium text-gray-500 hover:text-gray-700">Back</button>
                    <button type="submit" disabled={loading} className="flex-[2] bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700">
                        {loading ? 'Submitting...' : 'Confirm and Pay'}
                    </button>
                </div>
              </form>
            </div>
          )}

          {step === 'payment' && checkoutId && (
            <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
                <h2 className="text-xl font-semibold mb-6">Complete your donation</h2>
                <div className="max-w-sm mx-auto p-4 bg-gray-50 rounded-xl mb-8">
                    <p className="text-sm text-gray-500 mb-1">Total amount</p>
                    <p className="text-3xl font-bold text-indigo-700">£{amount || customAmount}</p>
                </div>
                <SumUpCheckoutWidget 
                    checkoutId={checkoutId} 
                    onComplete={handlePaymentComplete} 
                />
            </div>
          )}
        </div>

        {/* Right: Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Why Donate?
            </h3>
            <ul className="space-y-4 text-indigo-50 opacity-90 text-sm">
                <li>• Support community events and programs</li>
                <li>• Maintain our facilities and resources</li>
                <li>• Provide financial aid to those in need</li>
                <li>• Expand our educational outreach</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <h3 className="text-lg font-bold mb-3">Questions?</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
                If you have any questions about your donation or how to set up legacy giving, please contact our financial team at <span className="font-medium text-indigo-600">finance@society.org</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
