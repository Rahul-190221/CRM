'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaGoogle,
  FaLinkedin
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import Image from 'next/image'
import mainlogo from '@/assets/mainlogo.png'

import { useGoogleLogin } from '@react-oauth/google'
import { googleLogin } from '@/lib/api/auth'

interface SignupProps {
  onSignup?: (user: any, token: string) => void
}

type Errors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function SignupPage({ onSignup }: SignupProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'bdm'
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        const response = await googleLogin(tokenResponse.access_token)
        if (!response.accessToken) {
          throw new Error('Google sign up failed')
        }
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('user', JSON.stringify(response.user))

        onSignup?.(response.user, response.accessToken)
        toast.success('Account created successfully with Google!')
        router.push('/admin/dashboard')
      } catch (err: any) {
        toast.error(err.message || 'Signup failed')
      } finally {
        setLoading(false)
      }
    },
    onError: () => toast.error('Google sign up failed'),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: Errors = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Enter a valid email'
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const strengthScore = useMemo(() => {
    let score = 0
    const p = formData.password
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score // 0..4
  }, [formData.password])

  const strengthLabel = useMemo(() => {
    switch (strengthScore) {
      case 0:
      case 1:
        return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' }
      case 2:
        return { label: 'Fair', color: 'bg-yellow-400', width: 'w-1/2' }
      case 3:
        return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4' }
      case 4:
        return { label: 'Strong', color: 'bg-green-400', width: 'w-full' }
      default:
        return { label: '', color: 'bg-gray-300', width: 'w-0' }
    }
  }, [strengthScore])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Signup failed' }))
        throw new Error(error.message || 'Signup failed')
      }

      const data = await response.json()
      localStorage.setItem('accessToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      onSignup?.(data.user, data.token)
      toast.success('Account created successfully!')
      router.push('/admin/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-12 px-6">
        {/* Form Card */}
        <div className="order-2 lg:order-1">
          <div className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-xl rounded-2xl p-8 lg:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#FACE39]/10 rounded-xl p-2">
                <Image src={mainlogo} alt="Luminedge" width={48} height={48} className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Create Your Luminedge Account</h2>
                <p className="text-sm text-slate-500">Fast, secure signup — unlock the CRM dashboard</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 hover:shadow-sm transition"
              >
                <FaGoogle className="text-red-500" /> Sign up with Google
              </button>

            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 left-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent top-8" />
              <p className="text-center text-xs text-gray-400 bg-white inline-block px-3 relative z-10">or use email</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACE39] transition ${errors.name ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACE39] transition ${errors.email ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase">Role</label>
                <div className="inline-flex rounded-lg shadow-sm bg-gray-50 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'bdm' }))}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${formData.role === 'bdm' ? 'bg-white shadow-sm border border-gray-200' : 'text-slate-600'}`}
                  >
                    BDM
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${formData.role === 'admin' ? 'bg-white shadow-sm border border-gray-200' : 'text-slate-600'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACE39] transition ${errors.password ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Password strength</span>
                        <span>{strengthLabel.label}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${strengthLabel.color} ${strengthLabel.width} transition-all duration-300`} />
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACE39] transition ${errors.confirmPassword ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
                  Already have an account? Sign in
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#FACE39] hover:bg-[#e6b834] text-white font-medium px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                  <FaArrowRight />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Hero Section */}
        <div className="order-1 lg:order-2">
          <div className="bg-gradient-to-br from-[#FACE39] via-[#F5A623] to-[#D48806] rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-xl p-3">
                  <Image src={mainlogo} alt="Luminedge" width={32} height={32} className="w-8 h-8 object-contain brightness-0 invert" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold">Welcome to Luminedge</h1>
                  <p className="text-white/80">Your partner in business growth and client success</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Smart CRM</h3>
                  <p className="text-white/80">Track leads, manage pipelines, and close deals faster</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Team Collaboration</h3>
                  <p className="text-white/80">Work together seamlessly with real-time updates</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Analytics</h3>
                  <p className="text-white/80">Make data-driven decisions with powerful insights</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Mobile Ready</h3>
                  <p className="text-white/80">Access your CRM from anywhere, anytime</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-white/80">Happy clients</div>
                </div>
                <div className="flex-1 bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm text-white/80">Uptime guarantee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}