import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Upload, X, Camera, Loader2, Image as ImageIcon } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'

interface Props {
    initialData: { photoUrl?: string }
    onNext: (data: { photoUrl?: string }) => void
}

export function PhotoUploadStep({ initialData, onNext }: Props) {
    const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialData.photoUrl)
    const [isUploading, setIsUploading] = useState(false)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const supabase = createClient()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        await uploadFile(file)
    }

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
        } catch (err) {
            console.error('Camera Error:', err)
            setError('Could not access camera. Please check permissions or upload a file instead.')
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

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        if (!context) return

        // Set canvas to video dimensions
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw current frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to blob and upload
        canvas.toBlob(async (blob) => {
            if (blob) {
                const capturedFile = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
                stopCamera()
                await uploadFile(capturedFile)
            }
        }, 'image/jpeg', 0.9)
    }

    const uploadFile = async (file: File) => {
        // Basic validation
        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file (JPEG, PNG).')
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('File size must be less than 5MB.')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            // Get current user for RLS folder path
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('You must be logged in to upload a photo.')

            const fileExt = file.name.split('.').pop()
            // Path format required by our RLS: user_id/uuid.ext
            const filePath = `${user.id}/${uuidv4()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('profile_photos')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profile_photos')
                .getPublicUrl(filePath)

            setPhotoUrl(publicUrl)

        } catch (err: unknown) {
            console.error('Upload Error:', err)
            setError(err instanceof Error ? err.message : 'Failed to upload photo. Please try again.')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleRemovePhoto = () => {
        // Note: We're not deleting from storage here to avoid complex rollback if they don't submit.
        // Real-world, this might need a cleanup cron or immediate API call.
        setPhotoUrl(undefined)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({ photoUrl })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-start gap-4 mb-6">
                <Camera className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="space-y-1 text-slate-700">
                    <p className="font-medium">Profile Photo (Optional)</p>
                    <p className="text-sm leading-relaxed">
                        Uploading a clear photo helps the committee identify you and speeds up the approval process, especially if you are not a regular attendee.
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-white hover:border-brand-300 hover:bg-brand-50/30 transition-all text-center">

                {isCameraActive ? (
                    <div className="relative w-full max-w-md mx-auto aspect-square overflow-hidden rounded-3xl border-4 border-white shadow-2xl bg-black">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                            <button
                                type="button"
                                onClick={stopCamera}
                                className="px-5 py-2.5 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl font-medium hover:bg-white/30 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={capturePhoto}
                                className="px-8 py-2.5 bg-brand-600 text-white rounded-xl font-medium shadow-lg shadow-brand-600/40 hover:bg-brand-700 transition-all transform active:scale-95"
                            >
                                Capture Photo
                            </button>
                        </div>
                    </div>
                ) : photoUrl ? (
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-full overflow-hidden border-4 border-white shadow-xl">
                            <Image
                                src={photoUrl}
                                alt="Profile Preview"
                                fill
                                className="object-cover"
                                unoptimized // for external supabase URLs
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-white text-slate-500 rounded-full shadow-md flex items-center justify-center hover:text-red-500 hover:bg-red-50 transition-colors border border-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                        {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-brand-500" /> : <ImageIcon className="w-8 h-8" />}
                    </div>
                )}

                {!isCameraActive && (
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={startCamera}
                            disabled={isUploading}
                            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                                ${isUploading ? 'bg-slate-100 text-slate-400 pointer-events-none' : 
                                'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'}`}
                        >
                            <Camera className="w-5 h-5" /> Take Selfie
                        </button>

                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                id="photo-upload"
                            />
                            <label
                                htmlFor="photo-upload"
                                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium cursor-pointer transition-all border
                                    ${isUploading ? 'bg-slate-100 text-slate-400 pointer-events-none border-transparent' :
                                    photoUrl ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' :
                                    'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                            >
                                {isUploading ? (
                                    <>Uploading...</>
                                ) : (
                                    <><Upload className="w-5 h-5" /> {photoUrl ? 'Change File' : 'Upload File'}</>
                                )}
                            </label>
                        </div>
                    </div>
                )}

                {!photoUrl && (
                    <p className="text-xs text-slate-400 mt-4 max-w-xs">
                        Supported formats: JPEG, PNG. Maximum size: 5MB.
                    </p>
                )}
            </div>

            {error && (
                <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-3 rounded-lg border border-red-100">
                    {error}
                </p>
            )}

            <div className="pt-6 flex justify-end flex-col sm:flex-row items-center gap-4">
                {!photoUrl && (
                    <p className="text-slate-500 text-sm mr-auto w-full sm:w-auto text-center sm:text-left">
                        You can skip this step if you prefer.
                    </p>
                )}
                <button
                    type="submit"
                    className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-8 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 group"
                >
                    {photoUrl ? 'Next Step' : 'Skip & Continue'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </form>
    )
}
