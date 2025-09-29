"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Eye, EyeOff, Shield, Users, Lock, AlertTriangle, CheckCircle, Mail, Phone, ExternalLink, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { validateEmail, validatePassword, calculatePasswordStrength } from "@/lib/auth-utils"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const router = useRouter()

  // Password strength monitoring
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password))
  }, [formData.password])

  // Form validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
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
    
    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string | boolean) => {
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Registration successful! Please check your email to verify your account.")
        router.push('/auth/signin?message=verification-sent')
      } else {
        toast.error(data.error || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error("An error occurred during registration. Please try again.")
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
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Join VOI Cockpit - Leadership Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? "border-red-500" : ""}
                tabIndex={1}
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={errors.email ? "border-red-500" : ""}
                tabIndex={2}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                  tabIndex={3}
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  tabIndex={4}
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

            {/* Terms Agreement */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                  tabIndex={5}
                />
                <Label htmlFor="agreeToTerms" className="text-sm font-normal leading-relaxed">
                  I agree to the{" "}
                  <a 
                    href="mailto:andersonmeta1996@gmail.com?subject=Terms of Service Request" 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a 
                    href="mailto:andersonmeta1996@gmail.com?subject=Privacy Policy Request" 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{errors.agreeToTerms}</span>
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full modern-button" 
              disabled={isLoading}
              tabIndex={6}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link 
                  href="/auth/signin" 
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Sign in here
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
