'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Demo component for testing without backend setup
export function DemoMode() {
  const [showDemo, setShowDemo] = useState(false)
  const router = useRouter()

  // Fake login for demo purposes
  const fakeLogin = () => {
    // Store fake user data in localStorage
    localStorage.setItem('token', 'demo-token-123')
    localStorage.setItem('user', JSON.stringify({
      id: 'demo-user-001',
      email: 'demo@example.com',
      username: 'demo_user',
      firstName: 'Demo',
      lastName: 'User'
    }))
    // Redirect to chat page
    router.push('/chat')
  }

  // Show demo login screen
  if (showDemo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Demo Mode
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Click below to login as a demo user
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={fakeLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Login as Demo User
            </button>
            
            <button
              onClick={() => setShowDemo(false)}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Back to Normal Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show demo mode button
  return (
    <div className="text-center">
      <button
        onClick={() => setShowDemo(true)}
        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
      >
        Try Demo Mode
      </button>
    </div>
  )
}
