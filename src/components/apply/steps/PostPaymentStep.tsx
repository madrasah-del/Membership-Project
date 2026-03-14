'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Camera, Upload, X, Loader2, Image as ImageIcon, Users, UserCheck, Landmark } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'
import { getCommitteeMembers, updatePostPaymentData } from '@/app/apply/actions'

interface Props {
    membershipId: string
    paymentMethod: string
    onComplete: () => void
}

export function PostPaymentStep({ membershipId, paymentMethod, onComplete }: Props) {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [committeeMembers, setCommitteeMembers] = useState<{ id: string, name: string }[]>([])
    
    // Form State
    const [photoUrl, setPhotoUrl] = useState<string | undefined>()
    const [proposedBy, setProposedBy] = useState('')
    const [secondedBy, setSecondedBy] = useState('')
    const [selectedCommitteeId, setSelectedCommitteeId] = useState('')
    
    // Camera State
    const [isUploading, setIsUploading] = useState(false)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const supabase = createClient()

    useEffect(() => {
        async function loadData() {
            const members = await getCommitteeMembers()
            setCommitteeMembers(members)
            setIsLoading(false)
        }
        loadData()
    }, [])

    const startCamera = async () => {
        try {
            setError(null)
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } } 
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setIsCameraActive(true)
            }
        } catch {
            // Error handled by status
            setError('Could not access camera. Please upload a file instead.')
        }
    }

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            videoRef.current.srcObject = null
        }
        setIsCameraActive(false)
    }

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return
        const canvas = canvasRef.current
        const video = videoRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d')?.drawImage(video, 0, 0)
        canvas.toBlob(async (blob) => {
            if (blob) {
                const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
                stopCamera()
                await uploadFile(file)
            }
        }, 'image/jpeg', 0.9)
    }

    const uploadFile = async (file: File) => {
        setIsUploading(true)
        setError(null)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')
            const filePath = `${user.id}/${uuidv4()}.${file.name.split('.').pop()}`
            const { error: uploadError } = await supabase.storage
                .from('profile_photos')
                .upload(filePath, file)
            if (uploadError) throw uploadError
            const { data: { publicUrl } } = supabase.storage.from('profile_photos').getPublicUrl(filePath)
            setPhotoUrl(publicUrl)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await uploadFile(e.target.files[0])
            e.target.value = '' // Clear the input so the same file can be selected again
        }
    }

    const handleSubmit = async () => {
        setIsSaving(true)
        try {
            const result = await updatePostPaymentData(membershipId, {
                photoUrl,
                proposedBy,
                secondedBy,
                committeeContactId: selectedCommitteeId
            })
            if (result.error) {
                setError(result.error)
            } else {
                onComplete()
            }
        } catch {
            setError('Submission failed. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                <p className="text-slate-500">Loading final details...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in pb-8">
            <div className={`p-6 rounded-2xl flex items-start gap-4 border ${
                paymentMethod === 'sumup' 
                ? 'bg-green-50 border-green-100' 
                : 'bg-amber-50 border-amber-100'
            }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    paymentMethod === 'sumup' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                    {paymentMethod === 'sumup' ? <CheckCircle2 className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                </div>
                <div className="space-y-1">
                    <h3 className={`font-bold ${paymentMethod === 'sumup' ? 'text-green-900' : 'text-amber-900'}`}>
                        {paymentMethod === 'sumup' ? 'Payment Successful!' : 'Application Submitted — Payment Pending'}
                    </h3>
                    <p className={`text-sm leading-relaxed ${paymentMethod === 'sumup' ? 'text-green-800' : 'text-amber-800'}`}>
                        {paymentMethod === 'sumup' 
                            ? 'Your application is almost complete. Please provide the following details to help the committee get to know you.' 
                            : paymentMethod === 'bank_transfer'
                            ? 'Your application is saved. Please transfer the fee to our bank account below. Once paid, complete these final details.'
                            : 'Your application is saved. Please pay the fee in person. In the meantime, please complete these final details.'
                        }
                    </p>
                </div>
            </div>

            {paymentMethod === 'bank_transfer' && (
                <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                        <Landmark className="w-5 h-5 text-brand-400" />
                        <h4 className="font-bold">EEIS Bank Details</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Account Name</p>
                            <p className="font-medium">Epsom & Ewell Islamic Society</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Account Number</p>
                            <p className="font-mono text-base">12345678</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Sort Code</p>
                            <p className="font-mono text-base">00-00-00</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Reference</p>
                            <p className="font-mono text-base bg-white/10 px-2 py-1 rounded select-all">MEM-{membershipId.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 italic">Please use the reference above so we can match your payment quickly.</p>
                </div>
            )}

            {/* Photo Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-5 h-5 text-brand-600" />
                    <h4 className="font-bold text-slate-900">Profile Photo (Optional)</h4>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                    A clear photo helps the committee put a name to a face. This is purely optional but recommended.
                </p>
                
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-white hover:border-brand-300 transition-all">
                    {isCameraActive ? (
                        <div className="relative w-full max-w-xs aspect-square overflow-hidden rounded-2xl bg-black">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                <button onClick={stopCamera} className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg text-sm">Cancel</button>
                                <button onClick={capturePhoto} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium">Capture</button>
                            </div>
                        </div>
                    ) : photoUrl ? (
                        <div className="relative group">
                            <div className="w-24 h-24 relative rounded-full overflow-hidden border-2 border-brand-500">
                                <Image src={photoUrl} alt="Selfie" fill className="object-cover" unoptimized />
                            </div>
                            <button onClick={() => setPhotoUrl(undefined)} className="absolute -top-1 -right-1 bg-white shadow-md rounded-full p-1 text-red-500 border border-slate-100"><X className="w-3 h-3" /></button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-brand-500" /> : <ImageIcon className="w-6 h-6" />}
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                <button onClick={startCamera} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all">
                                    <Camera className="w-4 h-4" /> Take Selfie
                                </button>
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all cursor-pointer">
                                    <Upload className="w-4 h-4" /> Upload
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Committee Section */}
            <hr className="border-slate-100" />
            
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-brand-600" />
                    <h4 className="font-bold text-slate-900">Do you know any of these Committee Members?</h4>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                    If you recognize a name below, we will notify them of your application. Meeting them at Juma prayer is also a great way to advance your application.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {committeeMembers.length > 0 ? (
                        committeeMembers.map(member => (
                            <button
                                key={member.id}
                                onClick={() => setSelectedCommitteeId(selectedCommitteeId === member.id ? '' : member.id)}
                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                                    ${selectedCommitteeId === member.id 
                                        ? 'bg-brand-50 border-brand-200 text-brand-900 ring-2 ring-brand-500/20' 
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-brand-200'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                    ${selectedCommitteeId === member.id ? 'bg-brand-200 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {selectedCommitteeId === member.id ? <UserCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                                </div>
                                <span className="font-medium">{member.name}</span>
                            </button>
                        ))
                    ) : (
                        <p className="col-span-2 text-sm text-slate-400 italic">No committee members found at this time.</p>
                    )}
                </div>
            </div>

            {/* Proposers Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 ml-1">Proposed By (Optional)</label>
                    <input
                        value={proposedBy}
                        onChange={(e) => setProposedBy(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        placeholder="Existing member name"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 ml-1">Seconded By (Optional)</label>
                    <input
                        value={secondedBy}
                        onChange={(e) => setSecondedBy(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        placeholder="Existing member name"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">{error}</div>
            )}

            <div className="pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Completing...</>
                    ) : (
                        <>Complete Application & Submit to Committee</>
                    )}
                </button>
            </div>
        </div>
    )
}
