'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-beige-100">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-grey-900 mb-2">Check Your Email</h2>
            <p className="text-grey-500 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-grey-500 mb-6">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <Link href="/auth/login" className="btn-primary inline-block">
              Back to Login
            </Link>
            <p className="text-sm text-grey-500 mt-4">
              Didn't receive the email?{' '}
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="text-primary font-semibold hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark p-12 text-white flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-primary font-bold text-2xl">F</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Finance Manager</h1>
              <p className="text-sm text-primary-light">Secure Account Recovery</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">Reset Your Password</h2>
            <p className="text-primary-light text-lg">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-white/10 p-4 rounded-xl">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Check Your Email</h3>
                <p className="text-primary-light text-sm">
                  We'll send you a secure link to reset your password
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 p-4 rounded-xl">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Create New Password</h3>
                <p className="text-primary-light text-sm">
                  Click the link and set a new secure password
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-beige-100">
        <div className="w-full max-w-md">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-grey-500 hover:text-grey-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-grey-900 mb-2">Forgot Password?</h2>
            <p className="text-grey-500">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            {error && (
              <div className="p-4 bg-accent-red/10 border border-accent-red rounded-lg text-accent-red text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-grey-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-grey-500">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
