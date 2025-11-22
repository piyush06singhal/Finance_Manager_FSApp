'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import { User, Mail, Calendar, Lock, Shield, Smartphone, Download, Trash2, Edit, Check, Bell, Globe, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    phone: '',
    bio: '',
  })
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    currency: 'USD',
    language: 'English (US)',
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [currentFactorId, setCurrentFactorId] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    setUser(user)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(data)
    setEditForm({
      name: data?.name || '',
      username: data?.email?.split('@')[0] || '',
      phone: '',
      bio: '',
    })

    // Check if 2FA is already enabled
    const { data: factors } = await supabase.auth.mfa.listFactors()
    if (factors && factors.totp && factors.totp.length > 0) {
      setTwoFactorEnabled(true)
    }

    setLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    await supabase
      .from('profiles')
      .update({ name: editForm.name })
      .eq('id', user.id)

    setIsEditing(false)
    fetchProfile()
  }

  const [showExportSuccess, setShowExportSuccess] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    try {
      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) {
        setPasswordError(error.message)
        return
      }

      // Success
      setPasswordSuccess(true)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (err) {
      setPasswordError('Failed to change password. Please try again.')
    }
  }

  const handleEnable2FA = async () => {
    try {
      // Enroll in MFA
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Finance App 2FA'
      })

      if (error) {
        console.error('2FA enrollment error:', error)
        alert(`Failed to enable 2FA: ${error.message}`)
        return
      }

      if (data) {
        console.log('2FA enrollment successful:', data)
        setQrCode(data.totp.qr_code)
        setCurrentFactorId(data.id)
        setShow2FAModal(true)
      }
    } catch (err: any) {
      console.error('2FA enrollment exception:', err)
      alert(`Failed to enable 2FA: ${err.message || 'Please try again'}`)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert('Please enter a valid 6-digit code')
      return
    }

    if (!currentFactorId) {
      alert('No 2FA factor found. Please try enabling 2FA again.')
      return
    }

    try {
      console.log('Verifying 2FA enrollment with factor ID:', currentFactorId)
      
      // First, create a challenge for the factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: currentFactorId
      })

      if (challengeError) {
        console.error('2FA challenge error:', challengeError)
        alert(`Failed to create challenge: ${challengeError.message}`)
        return
      }

      console.log('Challenge created:', challengeData)

      // Now verify the code against the challenge
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: currentFactorId,
        challengeId: challengeData.id,
        code: verificationCode
      })

      if (verifyError) {
        console.error('2FA verification error:', verifyError)
        alert(`Verification failed: ${verifyError.message}. Make sure the code is current and try again.`)
        return
      }

      console.log('2FA verification successful:', verifyData)

      // Success!
      setTwoFactorEnabled(true)
      setShow2FAModal(false)
      setVerificationCode('')
      setQrCode('')
      setCurrentFactorId('')
      alert('2FA enabled successfully! You will need to enter a code on your next login.')
    } catch (err: any) {
      console.error('2FA verification exception:', err)
      alert(`Verification failed: ${err.message || 'Please try again'}`)
    }
  }

  const handleExportData = async () => {
    if (!user) return

    try {
      // Fetch all user data
      const [budgetsRes, potsRes, transactionsRes, billsRes] = await Promise.all([
        supabase.from('budgets').select('*').eq('user_id', user.id),
        supabase.from('pots').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('recurring_bills').select('*').eq('user_id', user.id),
      ])

      const exportData = {
        user: {
          email: user.email,
          name: profile?.name,
          created_at: user.created_at,
        },
        budgets: budgetsRes.data || [],
        savings_goals: potsRes.data || [],
        transactions: transactionsRes.data || [],
        recurring_bills: billsRes.data || [],
        exported_at: new Date().toISOString(),
      }

      // Create downloadable JSON file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Show success message
      setShowExportSuccess(true)
      setTimeout(() => setShowExportSuccess(false), 5000)

      // In a real app, you would also send an email here
      // For now, we'll just show the success message
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This will permanently delete:\n\n' +
      '• Your profile\n' +
      '• All budgets\n' +
      '• All transactions\n' +
      '• All savings goals\n' +
      '• All recurring bills\n\n' +
      'This action CANNOT be undone!'
    )

    if (!confirmed) return

    const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:')
    
    if (doubleConfirm !== 'DELETE') {
      alert('Account deletion cancelled')
      return
    }

    try {
      if (!user) return

      // Delete all user data (CASCADE will handle related data)
      // The database has ON DELETE CASCADE, so deleting profile will delete everything
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (deleteError) {
        console.error('Error deleting profile:', deleteError)
        alert(`Failed to delete account: ${deleteError.message}`)
        return
      }

      // Delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      
      // Even if auth deletion fails, sign out and redirect
      await supabase.auth.signOut()
      alert('Your account has been deleted successfully')
      router.push('/')
    } catch (error) {
      console.error('Delete account error:', error)
      alert('Failed to delete account. Please contact support.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Profile Header */}
      <Card className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent-cyan rounded-full flex items-center justify-center mx-auto">
            <span className="text-5xl font-bold text-white">
              {profile?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors">
            <Edit className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-3xl font-bold text-grey-900 mb-2">{profile?.name}</h1>
        <p className="text-grey-500 mb-1">{user?.email}</p>
        <p className="text-sm text-primary">
          Member since {new Date(user?.created_at).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </Card>

      {/* Personal Information */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-grey-900">Personal Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span className="font-semibold">Edit</span>
            </button>
          ) : (
            <button
              onClick={handleSaveProfile}
              className="btn-primary flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-grey-900 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input"
              />
            ) : (
              <div className="p-3 bg-beige-100 rounded-lg text-grey-900">
                {profile?.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-900 mb-2">
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="input"
              />
            ) : (
              <div className="p-3 bg-beige-100 rounded-lg text-grey-500">
                {editForm.username}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-900 mb-2">
              Email
            </label>
            <div className="p-3 bg-beige-100 rounded-lg text-grey-500">
              {user?.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-900 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Enter your phone number"
                className="input"
              />
            ) : (
              <div className="p-3 bg-beige-100 rounded-lg text-grey-500">
                {editForm.phone || 'Not provided'}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-grey-900 mb-2">
              Bio / About
            </label>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself"
                className="input min-h-[100px]"
              />
            ) : (
              <div className="p-3 bg-beige-100 rounded-lg text-grey-500">
                {editForm.bio || 'No bio added yet'}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-grey-900 mb-6">Account Settings</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-grey-900 mb-2">
              Currency Preference
            </label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="input"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-900 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="input"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-beige-100 rounded-lg">
            <div>
              <p className="font-semibold text-grey-900">Email Notifications</p>
              <p className="text-sm text-grey-500">Receive email updates about your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-grey-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-beige-100 rounded-lg">
            <div>
              <p className="font-semibold text-grey-900">Push Notifications</p>
              <p className="text-sm text-grey-500">Receive push notifications on your device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-grey-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <button className="btn-primary w-full md:w-auto flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </Card>

      {/* Security & Privacy */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-grey-900 mb-6">Security & Privacy</h2>

        <div className="space-y-4">
          <div className="p-4 bg-beige-100 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-grey-500 mt-1" />
                <div>
                  <p className="font-semibold text-grey-900">Password</p>
                  <p className="text-sm text-grey-500">Change your password to keep your account secure</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="btn-secondary text-sm"
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="p-4 bg-beige-100 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-grey-500 mt-1" />
                <div>
                  <p className="font-semibold text-grey-900">Two-Factor Authentication</p>
                  <p className="text-sm text-grey-500">Add an extra layer of security to your account</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-grey-300 text-grey-700 text-xs rounded">
                    Coming Soon
                  </span>
                </div>
              </div>
              <button 
                disabled
                className="btn-secondary text-sm opacity-50 cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          <div className="p-4 bg-beige-100 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-grey-500 mt-1" />
                <div>
                  <p className="font-semibold text-grey-900">Connected Devices</p>
                  <p className="text-sm text-grey-500">Manage devices that have access to your account</p>
                </div>
              </div>
              <button className="btn-secondary text-sm">
                Manage Devices
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-accent-red/20">
        <h2 className="text-2xl font-bold text-accent-red mb-6">Danger Zone</h2>

        <div className="space-y-4">
          <div className="p-4 bg-accent-red/5 rounded-lg border border-accent-red/20">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-accent-red mt-1" />
                <div>
                  <p className="font-semibold text-grey-900">Export Your Data</p>
                  <p className="text-sm text-grey-500">Download a copy of all your financial data</p>
                </div>
              </div>
              <button
                onClick={handleExportData}
                className="btn-secondary text-sm border-accent-red/20 hover:bg-accent-red/10"
              >
                Export Data
              </button>
            </div>
            {showExportSuccess && (
              <div className="mt-3 p-3 bg-primary/10 border border-primary rounded-lg flex items-start gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-primary">Data export initiated. You will receive an email shortly.</p>
                  <p className="text-xs text-grey-600 mt-1">Your data has also been downloaded to your device.</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-accent-red/5 rounded-lg border border-accent-red/20">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-accent-red mt-1" />
                <div>
                  <p className="font-semibold text-grey-900">Delete Account</p>
                  <p className="text-sm text-grey-500">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="bg-accent-red text-white px-4 py-2 rounded-lg hover:bg-accent-red/90 transition-colors text-sm font-semibold"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-grey-900">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordError('')
                  setPasswordSuccess(false)
                }}
                className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-accent-red/10 border border-accent-red rounded-lg text-accent-red text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-primary/10 border border-primary rounded-lg text-primary text-sm">
                  Password changed successfully!
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <p className="text-xs text-grey-500 mt-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordError('')
                    setPasswordSuccess(false)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-grey-900">Enable 2FA</h3>
              <button
                onClick={() => {
                  setShow2FAModal(false)
                  setVerificationCode('')
                }}
                className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-grey-600 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                {qrCode && (
                  <div className="bg-white p-4 rounded-lg border-2 border-grey-200 inline-block">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                <p className="text-xs text-grey-500 mt-1 text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShow2FAModal(false)
                    setVerificationCode('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleVerify2FA}
                  className="btn-primary flex-1"
                  disabled={verificationCode.length !== 6}
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
