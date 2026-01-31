'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Login from '@/components/Login'
import Signup from '@/components/Signup'

export default function Home() {
  const router = useRouter()
  const [showSignup, setShowSignup] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    const savedUser = localStorage.getItem('crm_user')
    const savedToken = localStorage.getItem('crm_token')
    
    if (savedUser && savedToken) {
      router.push('/dashboard')
    }
    setIsInitialized(true)
  }, [router])

  const handleLogin = (userData: any, userToken: string) => {
    localStorage.setItem('crm_user', JSON.stringify(userData))
    localStorage.setItem('crm_token', userToken)
    router.push('/dashboard')
  }

  const handleSignup = (userData: any, userToken: string) => {
    localStorage.setItem('crm_user', JSON.stringify(userData))
    localStorage.setItem('crm_token', userToken)
    router.push('/dashboard')
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">Loading...</div>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {showSignup ? (
        <Signup onSignup={handleSignup} onSwitchToLogin={() => setShowSignup(false)} />
      ) : (
        <Login onLogin={handleLogin} onSwitchToSignup={() => setShowSignup(true)} />
      )}
    </>
  )
}
    </div>
  )
}
