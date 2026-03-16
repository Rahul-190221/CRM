'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Image from 'next/image'
import mainlogo from '@/assets/mainlogo.png'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'

import { useGoogleLogin } from '@react-oauth/google'
import { googleRegister, registerUser } from '@/lib/api/auth'

interface SignupProps {
  onSignup?: (user: any, token: string) => void
}

type Errors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const ORBS = [
  { size: 380, x: '75%',  y: '5%',  color: '#FACE39', blur: 120, delay: 0 },
  { size: 280, x: '5%',   y: '55%', color: '#FACE39', blur: 100, delay: 1.3 },
  { size: 240, x: '40%',  y: '70%', color: '#FACE39', blur: 90,  delay: 0.7 },
  { size: 160, x: '85%',  y: '60%', color: '#FACE39', blur: 70,  delay: 2.0 },
]

const PHRASES = [
  { text: 'KICK-START YOUR JOURNEY',         x: '15%', y: '6%',  delay: 0,   dur: 20, size: 'text-xs',     depth: 28 },
  { text: 'Study Abroad Consultants in BD',  x: '13%', y: '22%', delay: 1.3, dur: 24, size: 'text-[10px]', depth: 16 },
  { text: 'Creating a Better Tomorrow',      x: '15%', y: '40%', delay: 0.7, dur: 22, size: 'text-xs',     depth: 22 },
  { text: 'Transform Your Future',           x: '14%', y: '58%', delay: 2.0, dur: 19, size: 'text-[10px]', depth: 12 },
  { text: 'One-Stop Solution',               x: '18%', y: '75%', delay: 1.6, dur: 21, size: 'text-[10px]', depth: 18 },
  { text: 'STUDY ABROAD JOURNEY',            x: '64%', y: '6%',  delay: 0.4, dur: 23, size: 'text-xs',     depth: 24 },
  { text: 'English Proficiency Training',    x: '63%', y: '22%', delay: 1.8, dur: 20, size: 'text-[10px]', depth: 14 },
  { text: 'IELTS • TOEFL • PTE • GRE',       x: '65%', y: '40%', delay: 0.9, dur: 18, size: 'text-xs',     depth: 30 },
  { text: 'UK • USA • Canada • Australia',   x: '63%', y: '58%', delay: 2.3, dur: 25, size: 'text-[10px]', depth: 11 },
  { text: 'FREE Counselling',                x: '67%', y: '75%', delay: 1.1, dur: 22, size: 'text-[10px]', depth: 20 },
]

const SHAPES = [
  { type: 'square', size: 24, x: '22%', y: '32%', delay: 0,   dur: 16, rot: 45,  depth: 35 },
  { type: 'square', size: 16, x: '72%', y: '18%', delay: 1.2, dur: 20, rot: 20,  depth: 18 },
  { type: 'square', size: 20, x: '20%', y: '55%', delay: 0.6, dur: 18, rot: 12,  depth: 26 },
  { type: 'square', size: 14, x: '74%', y: '70%', delay: 1.9, dur: 22, rot: 35,  depth: 14 },
  { type: 'line',   w: 50,    x: '14%', y: '15%', delay: 0.3, dur: 17, rot: -30, depth: 22 },
  { type: 'line',   w: 36,    x: '70%', y: '38%', delay: 1.5, dur: 19, rot: 40,  depth: 32 },
  { type: 'line',   w: 44,    x: '17%', y: '70%', delay: 0.8, dur: 21, rot: -20, depth: 15 },
  { type: 'line',   w: 30,    x: '68%', y: '55%', delay: 2.2, dur: 15, rot: 60,  depth: 28 },
]

export default function SignupPage({ onSignup }: SignupProps) {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'bdm'
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null)
  const [googleRole, setGoogleRole] = useState<'bdm' | 'admin'>('bdm')

  /* cursor glow */
  const glowX = useMotionValue(-999)
  const glowY = useMotionValue(-999)

  useEffect(() => {
    const move = (e: MouseEvent) => { glowX.set(e.clientX - 160); glowY.set(e.clientY - 160) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [glowX, glowY])

  /* 3-D tilt */
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  function onMouseLeave() { mouseX.set(0); mouseY.set(0) }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setPendingGoogleToken(tokenResponse.access_token)
      toast('Select your role to continue with Google.', { icon: '👤' })
    },
    onError: () => toast.error('Google sign up failed'),
  })

  const handleGoogleRegisterConfirm = async () => {
    if (!pendingGoogleToken) return
    setLoading(true)
    try {
      const response = await googleRegister(pendingGoogleToken, googleRole)
      if (!response.accessToken) throw new Error('Google sign up failed')
      onSignup?.(response.user, response.accessToken)
      toast.success('Account created! Please sign in.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
      setPendingGoogleToken(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    return score
  }, [formData.password])

  const strengthLabel = useMemo(() => {
    switch (strengthScore) {
      case 0:
      case 1: return { label: 'Weak',   color: 'bg-red-400',   width: 'w-1/4' }
      case 2: return { label: 'Fair',   color: 'bg-[#FACE39]', width: 'w-1/2' }
      case 3: return { label: 'Good',   color: 'bg-blue-400',   width: 'w-3/4' }
      case 4: return { label: 'Strong', color: 'bg-green-400',  width: 'w-full' }
      default: return { label: '', color: 'bg-gray-600', width: 'w-0' }
    }
  }, [strengthScore])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const data = await registerUser({
        name: formData.name, email: formData.email,
        password: formData.password, role: formData.role
      })
      onSignup?.(data.user, data.token)
      toast.success('Account created! Please sign in.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-2xl border text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition ${
      hasError ? 'border-red-400' : 'border-gray-200 focus:border-[#FACE39]/60'
    }`

  return (
    <div
      className="relative h-screen overflow-hidden bg-white flex items-center justify-center px-4 py-3"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const mx = ((e.clientX - r.left) / r.width  - 0.5) * 2
        const my = ((e.clientY - r.top)  / r.height - 0.5) * 2
        e.currentTarget.style.setProperty('--mx', mx.toFixed(3))
        e.currentTarget.style.setProperty('--my', my.toFixed(3))
      }}
    >

      {/* animated orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size, height: orb.size,
            left: orb.x, top: orb.y,
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            opacity: 0.10,
          }}
          animate={{ x: [0, 35, -25, 15, 0], y: [0, -25, 35, -15, 0], scale: [1, 1.12, 0.92, 1.06, 1] }}
          transition={{ duration: 13 + i * 2, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* cursor glow */}
      <motion.div
        className="fixed pointer-events-none z-0 rounded-full"
        style={{
          top: 0, left: 0,
          x: glowX, y: glowY,
          width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(250,206,57,0.18) 0%, rgba(250,206,57,0.06) 40%, transparent 70%)',
        }}
      />

      {/* grid overlay */}
      <div className="absolute inset-0 pointer-events-none auth-grid-overlay" />

      {/* ── floating phrase chips (CSS parallax outer + framer float inner) ── */}
      {PHRASES.map((p, i) => (
        <div
          key={i}
          className={`parallax-el parallax-el-phrase sp-ph-${i}`}
        >
          <motion.div
            animate={{ y: [0, -16, 8, -10, 0], x: [0, 8, -6, 4, 0], rotate: [-1.5, 1.5, -1, 1, -1.5] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          >
            <span className={`${p.size} font-bold tracking-wide px-3 py-1.5 rounded-full border border-[#FACE39]/40 bg-white text-[#00000F]/75 whitespace-nowrap shadow-[0_2px_12px_rgba(250,206,57,0.30)]`}>
              {p.text}
            </span>
          </motion.div>
        </div>
      ))}

      {/* ── floating geometric shapes (CSS parallax outer + framer rotate inner) ── */}
      {SHAPES.map((s, i) => (
        <div key={i} className={`parallax-el sp-sh-${i}`}>
          <motion.div
            animate={{ rotate: [s.rot, s.rot + 20, s.rot - 10, s.rot + 5, s.rot], y: [0, -12, 8, -6, 0] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          >
            {s.type === 'square' ? (
              <div className={`sh-sq-${i} border border-[#FACE39]/50 rounded-sm shadow-[0_0_8px_rgba(250,206,57,0.35)]`} />
            ) : (
              <div className={`sh-ln-${i - 4} h-0.5 bg-gradient-to-r from-transparent via-[#FACE39]/60 to-transparent rounded-full shadow-[0_0_6px_rgba(250,206,57,0.30)]`} />
            )}
          </motion.div>
        </div>
      ))}

      {/* ── dot clusters ── */}
      <motion.div
        className="absolute hidden lg:block pointer-events-none z-0"
        style={{ left: '20%', top: '48%' }}
        animate={{ rotate: [0, 15, -10, 8, 0], scale: [1, 1.08, 0.94, 1.04, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          {[0,1,2].map(row => [0,1,2].map(col => (
            <circle key={`${row}-${col}`} cx={8 + col * 16} cy={8 + row * 16} r={2} fill="#FACE39" fillOpacity={0.18} />
          )))}
        </svg>
      </motion.div>
      <motion.div
        className="absolute hidden lg:block pointer-events-none z-0"
        style={{ right: '20%', bottom: '8%' }}
        animate={{ rotate: [0, -12, 8, -5, 0], scale: [1, 1.06, 0.96, 1.03, 1] }}
        transition={{ duration: 22, repeat: Infinity, delay: 1.4, ease: 'easeInOut' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {[0,1,2].map(row => [0,1,2].map(col => (
            <circle key={`${row}-${col}`} cx={7 + col * 13} cy={7 + row * 13} r={1.5} fill="#FACE39" fillOpacity={0.15} />
          )))}
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* brand */}
        <motion.div
          className="flex flex-col items-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="mb-3 p-3 rounded-2xl bg-[#FACE39]/10 border border-[#FACE39]/20"
          >
            <Image src={mainlogo} alt="Luminedge" width={40} height={40} />
          </motion.div>
          <h1 className="text-3xl font-black text-[#00000F] tracking-tight">Luminedge</h1>
          <p className="text-sm font-semibold text-[#00000F]/50 mt-1">Premium exam venue &amp; training center </p>
        </motion.div>

        {/* 3D card */}
        <motion.div
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
          className="rounded-3xl overflow-hidden"
        >
          <div className="relative bg-white border border-[#FACE39]/15 rounded-3xl shadow-[0_8px_80px_rgba(250,206,57,0.18),0_2px_24px_rgba(0,0,0,0.08)]">
            {/* top yellow glow line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FACE39] to-transparent rounded-t-3xl" />

            {/* tab bar */}
            <div className="flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="flex-1 py-3 text-sm font-semibold text-[#00000F]/45 hover:text-[#00000F]/80 transition"
              >
                Sign In
              </button>
              <div className="flex-1 relative py-3 text-center text-base font-extrabold text-[#FACE39]">
                Sign Up
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-x-4 bottom-0 h-0.5 bg-[#FACE39] rounded-full"
                />
              </div>
            </div>

            <div className="p-6">
              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.12)' }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-[#00000F] transition mb-4 disabled:opacity-60 hover:border-[#FACE39]/60 hover:shadow-[0_4px_16px_rgba(250,206,57,0.25)]"
              >
                <FaGoogle className="text-red-400 text-base" />
                Continue with Google
              </motion.button>


              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-bold text-[#00000F]/55 uppercase tracking-widest">or with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                {/* Name */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <label className="block text-xs font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">
                    Full name
                  </label>
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleChange} placeholder="John Doe"
                    className={inputClass(!!errors.name)}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-xs text-red-400 mt-1">{errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Email */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 }}>
                  <label className="block text-xs font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">
                    Email address
                  </label>
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="you@example.com"
                    className={inputClass(!!errors.email)}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-xs text-red-400 mt-1">{errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Role toggle */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                  <label className="block text-xs font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">Role</label>
                  <div className="inline-flex rounded-xl bg-gray-100 border border-gray-200 p-1.5 gap-1.5">
                    {['bdm', 'admin'].map(r => (
                      <motion.button
                        key={r}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                        whileTap={{ scale: 0.95 }}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                          formData.role === r
                            ? 'bg-[#FACE39] text-[#00000F] shadow-md'
                            : 'text-[#00000F]/40 hover:text-[#00000F]/70'
                        }`}
                      >
                        {r === 'bdm' ? 'BDM' : 'Admin'}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.52 }}>
                  <label className="block text-xs font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} name="password"
                      value={formData.password} onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className={`${inputClass(!!errors.password)} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition">
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-[#00000F]/30 mb-1">
                        <span>Password strength</span>
                        <span>{strengthLabel.label}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${strengthLabel.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: strengthLabel.width.replace('w-', '') === 'full' ? '100%' : strengthLabel.width.replace('w-', '').replace('/', '%').replace('1%4', '25%').replace('1%2', '50%').replace('3%4', '75%') }}
                          style={{ width: strengthScore === 1 || strengthScore === 0 ? '25%' : strengthScore === 2 ? '50%' : strengthScore === 3 ? '75%' : '100%' }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>
                  )}
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-xs text-red-400 mt-1">{errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Confirm password */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.58 }}>
                  <label className="block text-xs font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                      value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`${inputClass(!!errors.confirmPassword)} pr-11`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition">
                      {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-xs text-red-400 mt-1">{errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="auth-submit-btn relative w-full py-3 rounded-2xl font-bold text-sm text-[#00000F] overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating account...
                      </>
                    ) : 'Create account'}
                  </span>
                </motion.button>
              </form>
            </div>

            {/* footer */}
            <div className="px-6 pb-4 text-center">
              <p className="text-xs font-bold text-[#00000F]/55">
                Already have an account?{' '}
                <Link href="/login" className="text-[#FACE39] hover:text-[#E8B010] font-extrabold underline underline-offset-2 transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Google role picker modal */}
      <AnimatePresence>
        {pendingGoogleToken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.35)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 32 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* top glow line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#FACE39] to-transparent" />

              <div className="p-8">
                {/* header */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#FACE39]/10 border border-[#FACE39]/20 flex items-center justify-center mb-3">
                    <FaGoogle className="text-red-400 text-xl" />
                  </div>
                  <h2 className="text-lg font-extrabold text-[#00000F] tracking-tight">Choose your role</h2>
                  <p className="text-xs text-[#00000F]/40 font-semibold mt-1 text-center">
                    Select how you'll use Luminedge CRM
                  </p>
                </div>

                {/* role cards */}
                <div className="flex flex-col gap-3 mb-6">
                  {[
                    { value: 'bdm', label: 'BDM', desc: 'Manage leads, clients & sales pipeline' },
                    { value: 'admin', label: 'Admin', desc: 'Full access to all settings & users' },
                  ].map(({ value, label, desc }) => (
                    <motion.button
                      key={value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setGoogleRole(value as 'bdm' | 'admin')}
                      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition ${
                        googleRole === value
                          ? 'border-[#FACE39] bg-[#FACE39]/8 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-[#FACE39]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-bold ${googleRole === value ? 'text-[#00000F]' : 'text-[#00000F]/60'}`}>
                            {label}
                          </p>
                          <p className="text-xs text-[#00000F]/40 mt-0.5">{desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          googleRole === value ? 'border-[#FACE39] bg-[#FACE39]' : 'border-gray-300'
                        }`}>
                          {googleRole === value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-white"
                            />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPendingGoogleToken(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#00000F]/40 hover:text-[#00000F]/70 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGoogleRegisterConfirm}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-[#FACE39] text-[#00000F] text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating…
                      </>
                    ) : `Continue as ${googleRole === 'bdm' ? 'BDM' : 'Admin'}`}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
