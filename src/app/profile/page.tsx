'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import { Lock, Download, Trash2, Edit, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    bio: '',
  })
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    currency: 'USD',
    baseCurrency: 'USD', // The currency your data is stored in
    language: 'English (US)',
  })
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [showExportSuccess, setShowExportSuccess] = useState(false)
  const [showDevicesModal, setShowDevicesModal] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    fetchProfile()
    fetchSessions()
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
      phone: data?.phone || '',
      bio: data?.bio || '',
    })

    setLoading(false)
  }

  const fetchSessions = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setSessions([{
        id: 1,
        device: 'Current Device',
        location: 'Current Session',
        lastActive: new Date().toISOString(),
        current: true
      }])
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: editForm.name,
          phone: editForm.phone,
          bio: editForm.bio
        })
        .eq('id', user.id)

      if (error) {
        alert(`Failed to update profile: ${error.message}`)
      } else {
        setIsEditing(false)
        fetchProfile()
        alert('Profile updated successfully!')
      }
    } catch (err) {
      alert('Failed to update profile')
    }
    
    setSaving(false)
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage for now
    localStorage.setItem('userSettings', JSON.stringify(settings))
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
    
    // Reload page to apply currency conversion
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) {
        setPasswordError(error.message)
        return
      }

      setPasswordSuccess(true)
      setPasswordForm({
        newPassword: '',
        confirmPassword: '',
      })

      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (err) {
      setPasswordError('Failed to change password')
    }
  }

  const handleExportData = async () => {
    if (!user) return

    try {
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

      setShowExportSuccess(true)
      setTimeout(() => setShowExportSuccess(false), 5000)
    } catch (error) {
      alert('Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This will permanently delete all your data.\n\nThis action CANNOT be undone!'
    )

    if (!confirmed) return

    const doubleConfirm = prompt('Type "DELETE" to confirm:')
    
    if (doubleConfirm !== 'DELETE') {
      alert('Account deletion cancelled')
      return
    }

    try {
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (error) {
        alert(`Failed to delete account: ${error.message}`)
        return
      }

      await supabase.auth.signOut()
      alert('Account deleted successfully')
      router.push('/')
    } catch (error) {
      alert('Failed to delete account')
    }
  }

  const handleSignOutDevice = async (sessionId: number) => {
    if (sessionId === 1) {
      await supabase.auth.signOut()
      router.push('/auth/login')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Profile Header */}
      <Card className="text-center mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent-cyan rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-5xl font-bold text-white">
            {profile?.name?.charAt(0).toUpperCase()}
          </span>
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
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
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
              Base Currency (Your data is stored in)
            </label>
            <select
              value={settings.baseCurrency}
              onChange={(e) => setSettings({ ...settings, baseCurrency: e.target.value })}
              className="input"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
            <p className="text-xs text-grey-500 mt-1">
              This is the currency your transactions are stored in. Change this only if you want to change your base currency.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-900 mb-2">
              Display Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="input"
            >
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="INR">INR - Indian Rupee (₹)</option>
            </select>
            <p className="text-xs text-grey-500 mt-1">
              All amounts will be converted and displayed in this currency using current exchange rates.
            </p>
            {settings.currency !== settings.baseCurrency && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Exchange Rate:</strong> 1 {settings.baseCurrency} = {
                    (() => {
                      const rates: { [key: string]: number } = {
                        USD: 1,
                        EUR: 0.92,
                        GBP: 0.79,
                        INR: 83.12,
                      }
                      const rate = (rates[settings.currency] / rates[settings.baseCurrency]).toFixed(2)
                      return rate
                    })()
                  } {settings.currency}
                </p>
              </div>
            )}
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

          {settingsSaved && (
            <div className="p-3 bg-primary/10 border border-primary rounded-lg text-primary text-sm">
              Settings saved successfully!
            </div>
          )}

          <button 
            onClick={handleSaveSettings}
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2"
          >
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
                <Lock className="w-5 h-5 text-grey-500 mt-1" />
                <div>
                  <p className="font-semibold text-grey-900">Connected Devices</p>
                  <p className="text-sm text-grey-500">View and manage devices with access to your account</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDevicesModal(true)}
                className="btn-secondary text-sm"
              >
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
              <div className="mt-3 p-3 bg-primary/10 border border-primary rounded-lg text-primary text-sm">
                Data exported successfully! Check your downloads.
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
                    Permanently delete your account and all data
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
                className="p-2 hover:bg-grey-100 rounded-lg"
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
                  onClick={() => setShowPasswordModal(false)}
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

      {/* Manage Devices Modal */}
      {showDevicesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-grey-900">Connected Devices</h3>
              <button
                onClick={() => setShowDevicesModal(false)}
                className="p-2 hover:bg-grey-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 bg-beige-100 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-grey-900">{session.device}</p>
                      <p className="text-sm text-grey-500">{session.location}</p>
                      <p className="text-xs text-grey-400 mt-1">
                        Last active: {new Date(session.lastActive).toLocaleString()}
                      </p>
                      {session.current && (
                        <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          Current Session
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSignOutDevice(session.id)}
                      className="btn-secondary text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
