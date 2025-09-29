"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Eye, EyeOff, Shield, Users, Lock, AlertTriangle, CheckCircle, Mail, Phone, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [errors, setErrors] = useState<{email?: string, password?: string, general?: string}>({})
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const router = useRouter()

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  // Account lockout protection
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false)
            setFailedAttempts(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isLocked, lockoutTime])

  // Password strength monitoring
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password))
  }, [password])

  // Form validation
  const validateForm = () => {
    const newErrors: {email?: string, password?: string, general?: string} = {}
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if account is locked
    if (isLocked) {
      toast.error(`Account locked. Try again in ${lockoutTime} seconds`)
      return
    }

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)
        
        if (newFailedAttempts >= 3) {
          setIsLocked(true)
          setLockoutTime(300) // 5 minutes lockout
          toast.error("Too many failed attempts. Account locked for 5 minutes.")
        } else {
          toast.error(`Invalid credentials. ${3 - newFailedAttempts} attempts remaining.`)
        }
      } else {
        // Reset failed attempts on successful login
        setFailedAttempts(0)
        toast.success("Signed in successfully")
        router.push("/")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
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
            <CardDescription className="text-base text-gray-600">
              VOI Cockpit - Leadership Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Account Lockout Warning */}
          {isLocked && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <Lock className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                Account locked. Try again in {Math.floor(lockoutTime / 60)}:{(lockoutTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLocked}
                className={errors.email ? "border-red-500" : ""}
                tabIndex={1}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLocked}
                  className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                  tabIndex={2}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
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
                      <CheckCircle className={`h-3 w-3 ${password.length >= 8 ? "text-green-500" : "text-gray-300"}`} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className={`h-3 w-3 ${/[A-Z]/.test(password) ? "text-green-500" : "text-gray-300"}`} />
                      <span>One uppercase letter</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className={`h-3 w-3 ${/[0-9]/.test(password) ? "text-green-500" : "text-gray-300"}`} />
                      <span>One number</span>
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
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLocked}
                tabIndex={3}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full modern-button" 
              disabled={isLoading || isLocked}
              tabIndex={4}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 italic">Created by: Anderson Meta</p>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  href="/auth/register" 
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Create one here
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Forgot your password?
                </Link>
              </p>
            </div>
          </div>

          {/* Professional Touches */}
          <div className="mt-6 space-y-4">
            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Support & Contact</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3 text-gray-600" />
                  <a 
                    href="mailto:andersonmeta1996@gmail.com" 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    andersonmeta1996@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3 text-gray-600" />
                  <a 
                    href="tel:+4917616626841" 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    +49 176 166 26841
                  </a>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
              <a 
                href="mailto:andersonmeta1996@gmail.com?subject=Terms of Service Request" 
                className="hover:text-gray-700 hover:underline flex items-center justify-center space-x-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Terms of Service</span>
              </a>
              <span className="hidden sm:inline">•</span>
              <a 
                href="mailto:andersonmeta1996@gmail.com?subject=Privacy Policy Request" 
                className="hover:text-gray-700 hover:underline flex items-center justify-center space-x-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Privacy Policy</span>
              </a>
              <span className="hidden sm:inline">•</span>
              <a 
                href="mailto:andersonmeta1996@gmail.com?subject=Help Request" 
                className="hover:text-gray-700 hover:underline flex items-center justify-center space-x-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Help</span>
              </a>
            </div>

            {/* Copyright Notice */}
            <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-200">
              <p>&copy; 2025 Anderson Meta. All rights reserved.</p>
              <p className="mt-1">Version 1.0.0 | VOI Cockpit - Leadership Portal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

