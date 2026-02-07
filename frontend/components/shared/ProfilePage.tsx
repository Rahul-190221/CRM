'use client'

import React, { useState, useEffect } from 'react'
import { UserCircle, Mail, Phone, Briefcase, Calendar, Save, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProfile, updateProfile, changePassword, getUserStats } from '@/lib/api/auth'
import { getUserIdFromToken } from '@/lib/helpers/jwt'

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

export default function ProfilePage({ user }: { user: any }) {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfile>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        role: '',
        joinDate: ''
    })

    const [stats, setStats] = useState<UserStats>({
        totalLeads: 0,
        converted: 0,
        conversionRate: '0%'
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [passwordLoading, setPasswordLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                if (!token) return

                const [profileData, statsData] = await Promise.all([
                    getProfile(token),
                    getUserStats(token)
                ])

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

                if (statsData.success) {
                    setStats(statsData.data)
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
                toast.error('Failed to load profile data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) return

            const { firstName, lastName, phone, department } = profile
            await updateProfile(token, { firstName, lastName, phone, department })

            toast.success('Profile updated successfully')
        } catch (error: any) {
            console.error('Update error:', error)
            toast.error(error.message || 'Failed to update profile')
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

            await changePassword(token, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })

            toast.success('Password changed successfully')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error: any) {
            console.error('Password error:', error)
            toast.error(error.message || 'Failed to change password')
        } finally {
            setPasswordLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

            <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Card & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    {/* ID Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 text-3xl font-bold overflow-hidden ${profile.avatar ? '' : 'bg-orange-100 text-orange-500'}`}>
                            {profile.avatar ? (
                                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                profile.firstName?.[0] || profile.email?.[0] || 'U'
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {profile.firstName} {profile.lastName}
                        </h2>
                        <p className="text-slate-500 mb-6 capitalize">{profile.role.replace('-', ' ')}</p>

                        <div className="space-y-3 text-left">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span>{profile.email}</span>
                            </div>
                            {profile.phone && (
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{profile.phone}</span>
                                </div>
                            )}
                            {profile.department && (
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    <span>{profile.department}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>Joined {profile.joinDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-orange-500 font-medium">
                            <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                            Performance Stats
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Total Leads</span>
                                <span className="font-bold text-slate-900">{stats.totalLeads}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Converted</span>
                                <span className="font-bold text-slate-900">{stats.converted}</span>
                            </div>
                            <div className="w-full h-px bg-gray-100 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Conversion Rate</span>
                                <span className="font-bold text-green-500">{stats.conversionRate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Edit Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Form */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Edit Profile Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={profile.firstName}
                                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={profile.lastName}
                                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    readOnly
                                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                    placeholder="+1 (234) 567-8900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Department</label>
                                <input
                                    type="text"
                                    value={profile.department}
                                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                    placeholder="Sales"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Role</label>
                                <input
                                    type="text"
                                    value={profile.role}
                                    readOnly
                                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none text-slate-500 cursor-not-allowed capitalize"
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleUpdateProfile}
                                className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Change Password</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                />
                            </div>
                        </div>
                        <div className="mt-8 text-right">
                            <button
                                onClick={handleChangePassword}
                                disabled={passwordLoading}
                                className="text-sm font-semibold text-orange-500 hover:text-orange-600 disabled:opacity-50"
                            >
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
