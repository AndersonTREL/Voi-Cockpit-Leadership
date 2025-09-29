"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { validateEmail } from "@/lib/auth-utils"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate email
    if (!email) {
      setError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        toast.success("Password reset email sent! Please check your inbox.")
      } else {
        setError(data.error || "Failed to send password reset email")
        toast.error(data.error || "Failed to send password reset email")
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setError("An error occurred. Please try again.")
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
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
              <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
              <CardDescription className="text-base text-gray-600">
                VOI Cockpit - Leadership Portal
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-800">Email Sent!</h3>
                <p className="text-gray-600">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/auth/signin')}
                  className="w-full modern-button"
                >
                  Back to Sign In
                </Button>
                <p className="text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            </div>

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
            <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Enter your email to receive a password reset link
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={error ? "border-red-500" : ""}
                tabIndex={1}
                required
              />
              {error && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <span>{error}</span>
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full modern-button" 
              disabled={isLoading}
              tabIndex={2}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Reset Link...</span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link 
                  href="/auth/signin" 
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
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
