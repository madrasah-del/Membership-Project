'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Script from 'next/script'

type SumUpCheckoutProps = {
    checkoutId: string
    onComplete: (status: 'SUCCESS' | 'FAILED', transactionId?: string, errorMessage?: string) => void
}

export default function SumUpCheckoutWidget({ checkoutId, onComplete }: SumUpCheckoutProps) {
    const sumupWidgetRef = useRef<HTMLDivElement>(null)
    const [isScriptLoaded, setIsScriptLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isScriptLoaded || !checkoutId || !sumupWidgetRef.current) return

        let sumupCard: unknown

        const initSumUp = async () => {
            // TS ignore because SumUp injects global object
            // @ts-expect-error SumUp injects global object
            if (typeof window !== 'undefined' && window.SumUpCard) {
                try {
                    // @ts-expect-error SumUp injects global object
                    sumupCard = window.SumUpCard.mount({
                        checkoutId: checkoutId,
                        onResponse: function (type: string, body: Record<string, unknown>) {
                            console.log('SumUp Response:', type, body)
                            if (type === 'success' || body?.status === 'PAID') {
                                onComplete('SUCCESS', body?.transaction_code as string | undefined)
                            } else {
                                let errorMessage = 'Payment failed or was cancelled. Please try again.'
                                if (body?.message) {
                                    errorMessage = `Payment declined: ${body.message}`
                                } else if (body?.transaction_code) {
                                    errorMessage = `Payment failed (Ref: ${body.transaction_code}).`
                                } else if (type && type !== 'error') {
                                    errorMessage = `Payment failed (Type: ${type}). Please try again.`
                                }
                                
                                onComplete('FAILED', undefined, errorMessage)
                                setError(errorMessage)
                            }
                        },
                        // Additional optional config
                        locale: 'en-GB',
                        currency: 'GBP',
                        // We mount it inside out ref container
                        mountNode: sumupWidgetRef.current
                    })
                } catch (err) {
                    console.error("Failed to mount SumUp Card:", err)
                    setError('Failed to initialize payment gateway. Please refresh and try again.')
                }
            } else {
                setError('Payment system is currently unavailable.')
            }
        }

        initSumUp()

        return () => {
            // Cleanup if needed when unmounting
            if (sumupCard && typeof (sumupCard as Record<string, unknown>).unmount === 'function') {
                ((sumupCard as Record<string, unknown>).unmount as () => void)()
            }
        }
    }, [isScriptLoaded, checkoutId, onComplete])

    return (
        <div className="w-full relative min-h-[400px] flex flex-col items-center justify-center p-4">
            <Script
                src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
                strategy="afterInteractive"
                onLoad={() => setIsScriptLoaded(true)}
                onError={() => setError('Failed to load secure payment script. Check your connection.')}
            />

            {error ? (
                <div className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-center max-w-sm">
                    <p className="font-semibold">Payment Error</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            ) : !isScriptLoaded ? (
                <div className="flex flex-col items-center text-slate-500 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                    <p className="text-sm animate-pulse">Loading secure payment gateway...</p>
                </div>
            ) : null}

            {/* SumUp will inject the iframe here */}
            <div
                ref={sumupWidgetRef}
                id="sumup-card"
                className={`w-full max-w-md ${error ? 'hidden' : 'block'}`}
            ></div>

            {!error && isScriptLoaded && (
                <p className="text-xs text-slate-400 mt-6 text-center">
                    Secure payment processed by SumUp. Your card details are encrypted and never stored on our servers.
                </p>
            )}
        </div>
    )
}
