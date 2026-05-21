'use client'

import React, { useState, useEffect } from 'react'
import { Mail, Phone, Briefcase, Calendar, Save, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProfile, updateProfile, changePassword, getUserStats } from '@/lib/api/auth'

interface UserProfile {
    firstName: string
    lastName: string
    email: string
    phone: string
    department: string
    role: string
    joinDate: string
    avatar?: string
}

interface UserStats {
    totalLeads: number
    converted: number
    conversionRate: string
}

const inputClass = 'w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#00000F]/[0.09] rounded-xl text-sm font-medium text-[#00000F]/80 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-[#FACE39]/60 transition-all duration-200'
const readonlyClass = 'w-full px-3.5 py-2.5 bg-[#00000F]/[0.03] border border-[#00000F]/[0.06] rounded-xl text-sm font-medium text-[#00000F]/35 cursor-not-allowed'
const labelClass = 'block text-[12px] font-bold text-[#00000F]/40 uppercase tracking-widest mb-1.5'

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfile>({
        firstName: '', lastName: '', email: '', phone: '', department: '', role: '', joinDate: ''
    })
    const [stats, setStats] = useState<UserStats>({ totalLeads: 0, converted: 0, conversionRate: '0%' })
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [saving, setSaving] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                if (!token) return
                const [profileData, statsData] = await Promise.all([getProfile(token), getUserStats(token)])
                setProfile({
                    firstName: profileData.firstName || '',
                    lastName: profileData.lastName || '',
                    email: profileData.email || '',
                    phone: profileData.phone || '',
                    department: profileData.department || '',
                    role: profileData.role || '',
                    joinDate: new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    avatar: profileData.avatarUrl
                })
                if (statsData.success) setStats(statsData.data)
            } catch {
                toast.error('Failed to load profile data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleUpdateProfile = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) return
            const { firstName, lastName, phone, department } = profile
            await updateProfile(token, { firstName, lastName, phone, department })
            toast.success('Profile updated successfully')
        } catch (error: unknown) {
            toast.error((error as { message?: string }).message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        setPasswordLoading(true)
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) return
            await changePassword(token, { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
            toast.success('Password changed successfully')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error: unknown) {
            toast.error((error as { message?: string }).message || 'Failed to change password')
        } finally {
            setPasswordLoading(false)
        }
    }

    const displayName = profile.firstName || profile.lastName
        ? `${profile.firstName} ${profile.lastName}`.trim()
        : profile.email?.split('@')[0] || 'User'

    const avatarInitial = (profile.firstName?.[0] || profile.email?.[0] || 'U').toUpperCase()

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto flex items-center justify-center h-80">
                <div className="w-9 h-9 border-4 border-[#FACE39] border-t-[#00000F] rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-5">

            {/* Page header */}
            <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-6 bg-[#FACE39] rounded-full shrink-0" />
                <h1 className="text-lg sm:text-xl font-bold text-[#00000F]/85 tracking-tight">My Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Left column ── */}
                <div className="lg:col-span-1 space-y-4">

                    {/* Identity card */}
                    <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
                        {/* Yellow banner */}
                        <div className="h-[72px] bg-gradient-to-br from-[#FACE39]/30 via-[#FACE39]/12 to-transparent relative overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-[0.04]"
                                style={{ backgroundImage: 'radial-gradient(circle, #00000F 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                            />
                        </div>

                        <div className="px-5 pb-5">
                            {/* Avatar + role badge */}
                            <div className="-mt-9 mb-3.5 flex items-end justify-between">
                                <div className="w-[68px] h-[68px] rounded-2xl border-[3px] border-white shadow-[0_4px_14px_rgba(0,0,0,0.13)] bg-[#00000F] flex items-center justify-center text-[#FACE39] text-xl font-bold overflow-hidden flex-shrink-0">
                                    {profile.avatar
                                        ? <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        : avatarInitial}
                                </div>
                                <span className="mb-0.5 text-[11px] font-bold uppercase tracking-widest bg-[#FACE39]/15 text-[#00000F]/60 px-2.5 py-1 rounded-full border border-[#FACE39]/20">
                                    {profile.role.replace(/-/g, ' ') || 'User'}
                                </span>
                            </div>

                            <h2 className="text-[15px] font-bold text-[#00000F]/85 tracking-tight leading-tight mb-0.5">{displayName}</h2>
                            <p className="text-[13px] text-[#00000F]/40 font-medium truncate mb-4">{profile.email}</p>

                            <div className="space-y-2.5 pt-4 border-t border-[#00000F]/[0.05]">
                                {[
                                    { Icon: Mail, value: profile.email, always: true },
                                    { Icon: Phone, value: profile.phone, always: false },
                                    { Icon: Briefcase, value: profile.department, always: false },
                                    { Icon: Calendar, value: profile.joinDate ? `Joined ${profile.joinDate}` : null, always: true },
                                ].map(({ Icon, value, always }, i) =>
                                    (always || value) ? (
                                        <div key={i} className="flex items-center gap-2.5">
                                            <span className="w-7 h-7 rounded-lg bg-[#fafafa] border border-[#00000F]/[0.06] flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-3.5 h-3.5 text-gray-400" />
                                            </span>
                                            <span className="text-xs font-medium text-[#00000F]/60 truncate">{value || '—'}</span>
                                        </div>
                                    ) : null
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Performance stats */}
                    <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-1.5 h-5 bg-[#FACE39] rounded-full" />
                            <h3 className="text-[12px] font-bold text-[#00000F]/45 uppercase tracking-widest">Performance</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                            <div className="bg-blue-50 border border-blue-100/70 rounded-xl p-3.5 text-center">
                                <p className="text-[24px] font-bold text-blue-700 tabular-nums leading-none">{stats.totalLeads}</p>
                                <p className="text-[11px] font-bold text-blue-500/70 uppercase tracking-wider mt-1.5">Total Leads</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100/70 rounded-xl p-3.5 text-center">
                                <p className="text-[24px] font-bold text-emerald-700 tabular-nums leading-none">{stats.converted}</p>
                                <p className="text-[11px] font-bold text-emerald-500/70 uppercase tracking-wider mt-1.5">Converted</p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-[#FACE39]/18 to-[#FACE39]/6 border border-[#FACE39]/22 rounded-xl px-4 py-3.5 flex items-center justify-between">
                            <p className="text-[12px] font-bold text-[#00000F]/50 uppercase tracking-widest">Conversion Rate</p>
                            <p className="text-[18px] font-bold text-[#00000F]/80 tabular-nums">{stats.conversionRate}</p>
                        </div>
                    </div>
                </div>

                {/* ── Right column ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Edit profile form */}
                    <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-5 sm:p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="w-1.5 h-5 bg-[#FACE39] rounded-full" />
                            <h3 className="text-[13px] font-semibold text-[#00000F]/70">Edit Profile Information</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>First Name</label>
                                <input type="text" value={profile.firstName}
                                    onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                    placeholder="First name"
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name</label>
                                <input type="text" value={profile.lastName}
                                    onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                    placeholder="Last name"
                                    className={inputClass} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Email Address</label>
                                <input type="email" value={profile.email} readOnly className={readonlyClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <input type="text" value={profile.phone}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    placeholder="+1 (234) 567-8900"
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Department</label>
                                <input type="text" value={profile.department}
                                    onChange={e => setProfile({ ...profile, department: e.target.value })}
                                    placeholder="e.g. Sales"
                                    className={inputClass} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Role</label>
                                <input type="text" value={profile.role} readOnly className={readonlyClass} />
                            </div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-[#00000F]/[0.05]">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#00000F] hover:bg-[#00000F]/90 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] border border-[#FACE39]/10 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Change password */}
                    <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-5 sm:p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="w-1.5 h-5 bg-[#00000F]/70 rounded-full" />
                            <h3 className="text-[13px] font-semibold text-[#00000F]/70">Change Password</h3>
                        </div>

                        <div className="space-y-3.5">
                            {([
                                { field: 'currentPassword', label: 'Current Password', key: 'current' },
                                { field: 'newPassword', label: 'New Password', key: 'new' },
                                { field: 'confirmPassword', label: 'Confirm New Password', key: 'confirm' },
                            ] as const).map(({ field, label, key }) => (
                                <div key={field}>
                                    <label className={labelClass}>{label}</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords[key] ? 'text' : 'password'}
                                            value={passwordData[field]}
                                            onChange={e => setPasswordData({ ...passwordData, [field]: e.target.value })}
                                            placeholder="••••••••"
                                            className={`${inputClass} pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(p => ({ ...p, [key]: !p[key] }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPasswords[key]
                                                ? <EyeOff className="w-4 h-4" />
                                                : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 pt-5 border-t border-[#00000F]/[0.05] flex justify-end">
                            <button
                                onClick={handleChangePassword}
                                disabled={passwordLoading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#FACE39] hover:bg-[#FACE39]/90 text-[#00000F] text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-[0_6px_20px_rgba(250,206,57,0.30)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <Lock className="w-4 h-4" />
                                {passwordLoading ? 'Updating…' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
