"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { CheckCircle, XCircle, Loader2, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

function VerifyEmailContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
        toast.success('Email verified successfully!')
      } else {
        if (data.error?.includes('expired') || data.error?.includes('invalid')) {
          setStatus('expired')
          setMessage('This verification link has expired or is invalid.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
        toast.error(data.error || 'Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('An error occurred during verification')
      toast.error('An error occurred during verification')
    }
  }

  const resendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Verification email sent! Please check your inbox.')
      } else {
        toast.error(data.error || 'Failed to resend verification email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Failed to resend verification email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg-forest p-2 sm:p-4">
      <Card className="w-full max-w-md modern-card mx-2 sm:mx-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center mb-4">
            <img 
              src="/tree-logistics-logo.svg" 
              alt="TREE LOGISTICS Logo" 
              className="h-16 w-auto drop-shadow-sm"
            />
          </div>
          <div className="pt-2">
            <CardTitle className="text-2xl font-bold text-gray-900">Email Verification</CardTitle>
            <CardDescription className="text-base text-gray-600">
              VOI Cockpit - Leadership Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {status === 'verifying' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              </div>
              <p className="text-gray-600">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-800">Email Verified!</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/auth/signin')}
                  className="w-full modern-button"
                >
                  Continue to Sign In
                </Button>
                <p className="text-sm text-gray-500">
                  You can now sign in with your email and password.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-800">Verification Failed</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/auth/register')}
                  className="w-full modern-button"
                >
                  Try Registering Again
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
              <div className="flex justify-center">
                <XCircle className="h-12 w-12 text-yellow-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-yellow-800">Link Expired</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={resendVerification}
                  className="w-full modern-button"
                >
                  Resend Verification Email
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

          <div className="pt-4 border-t border-gray-200">
            <div className="text-center text-xs text-gray-400">
              <p>&copy; 2025 Anderson Meta. All rights reserved.</p>
              <p className="mt-1">Version 1.0.0 | VOI Cockpit - Leadership Portal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
