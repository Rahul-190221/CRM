'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn, Loader2, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface LoginProps {
    onLogin?: (user: any, token: string) => void
    onSwitchToSignup?: () => void
}

export default function Login({ onLogin, onSwitchToSignup }: LoginProps) {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Determine API URL (fallback to localhost:5000 if not set)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://crm-eta-blush.vercel.app'
        console.log('Login attempt:', { email, apiUrl })

        try {
            // Make direct request to backend
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            console.log('Response status:', response.status)

            const text = await response.text()
            console.log('Raw response:', text)

            let data
            try {
                data = JSON.parse(text)
            } catch (e) {
                console.error('Failed to parse response as JSON')
                throw new Error(text.substring(0, 100) || `Server error (${response.status})`)
            }

            if (!response.ok) {
                throw new Error(data?.message || `Login failed (${response.status})`)
            }

            localStorage.setItem('crm_token', data.token)
            localStorage.setItem('crm_user', JSON.stringify(data.user))

            // Safe navigation
            router.push('/dashboard')

        } catch (err: any) {
            console.error('Login error details:', err)
            setError(err.message || 'Network error: Backend may be down')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-8 text-center border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                             <div className="w-12 h-12 flex items-center justify-center">
                               <Image
                                 src="/assets/logo.png"
                                 alt="Luminedge Logo"
                                 width={48}
                                 height={30}
                                 className="object-contain"
                                 priority
                                 loading="eager"
                               />
                             </div>
                             <h1 className="text-lg font-bold text-gray-900">Luminedge</h1>
                           </div>

                    <p className="text-sm text-gray-600 font-medium">Welcome back! Please sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </>
                        )}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onSwitchToSignup || (() => router.push('/signup'))}
                        className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all flex items-center justify-center gap-2"
                    >
                        Create Account
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    )
}
