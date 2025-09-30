"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmail() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    console.log('Token found:', token) // Debug log

    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifyEmail(token)
  }, [])

  const verifyEmail = async (verificationToken: string) => {
    try {
      console.log('Verifying token:', verificationToken) // Debug log
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()
      console.log('Verification response:', data) // Debug log

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
      } else {
        if (data.error?.includes('expired') || data.error?.includes('invalid')) {
          setStatus('expired')
          setMessage('This verification link has expired or is invalid.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('An error occurred during verification')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg-forest p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'verifying' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
              <p>Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Email Verified!</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              <Button 
                onClick={() => router.push('/auth/signin')}
                className="w-full"
              >
                Continue to Sign In
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-red-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Verification Failed</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/auth/register')}
                  className="w-full"
                >
                  Register Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/signin')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-yellow-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Link Expired</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/auth/register')}
                  className="w-full"
                >
                  Register Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/signin')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}