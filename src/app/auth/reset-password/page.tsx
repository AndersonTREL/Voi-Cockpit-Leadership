"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { validatePassword, calculatePasswordStrength } from "@/lib/auth-utils"

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // Password strength monitoring
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password))
  }, [formData.password])

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false)
      return
    }

    validateToken(token)
  }, [token])

  const validateToken = async (resetToken: string) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: resetToken }),
      })

      const data = await response.json()
      setIsValidToken(response.ok)
      
      if (!response.ok) {
        toast.error(data.error || 'Invalid or expired reset token')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      setIsValidToken(false)
      toast.error('Failed to validate reset token')
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]
      }
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast.success("Password reset successfully!")
      } else {
        toast.error(data.error || "Failed to reset password")
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-forest p-2 sm:p-4">
        <Card className="w-full max-w-md modern-card mx-2 sm:mx-0">
          <CardContent className="text-center py-8">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Validating reset token...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isValidToken === false) {
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
              <CardTitle className="text-2xl font-bold text-gray-900">Invalid Link</CardTitle>
              <CardDescription className="text-base text-gray-600">
                VOI Cockpit - Leadership Portal
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-800">Invalid or Expired Link</h3>
                <p className="text-gray-600">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/auth/forgot-password')}
                  className="w-full modern-button"
                >
                  Request New Reset Link
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

  if (isSuccess) {
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
              <CardTitle className="text-2xl font-bold text-gray-900">Password Reset</CardTitle>
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
                <h3 className="text-lg font-semibold text-green-800">Password Reset Successfully!</h3>
                <p className="text-gray-600">
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/auth/signin')}
                  className="w-full modern-button"
                >
                  Sign In with New Password
                </Button>
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
            <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Enter your new password below
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your new password"
                  className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                  tabIndex={1}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 w-4 rounded ${
                            level <= passwordStrength
                              ? passwordStrength <= 2
                                ? "bg-red-500"
                                : passwordStrength <= 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? "text-red-600" :
                      passwordStrength <= 3 ? "text-yellow-600" : "text-green-600"
                    }`}>
                      {passwordStrength <= 2 ? "Weak" : passwordStrength <= 3 ? "Medium" : "Strong"}
                    </span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className={`h-3 w-3 ${formData.password.length >= 8 ? "text-green-500" : "text-gray-300"}`} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className={`h-3 w-3 ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-gray-300"}`} />
                      <span>One uppercase letter</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className={`h-3 w-3 ${/[a-z]/.test(formData.password) ? "text-green-500" : "text-gray-300"}`} />
                      <span>One lowercase letter</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className={`h-3 w-3 ${/[0-9]/.test(formData.password) ? "text-green-500" : "text-gray-300"}`} />
                      <span>One number</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className={`h-3 w-3 ${/[^A-Za-z0-9]/.test(formData.password) ? "text-green-500" : "text-gray-300"}`} />
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your new password"
                  className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  tabIndex={2}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full modern-button" 
              disabled={isLoading}
              tabIndex={3}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Resetting Password...</span>
                </div>
              ) : (
                "Reset Password"
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

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
