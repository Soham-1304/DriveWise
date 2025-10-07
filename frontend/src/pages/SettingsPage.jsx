import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiGet, apiPut } from '../utils/api'
import { Settings, Building2, User, Copy, Check, Key, Save, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const { user, fleetCode } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    role: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProfile = async () => {
    try {
      if (!user) return
      const response = await apiGet('/auth/profile')

      setProfile({
        name: response.name || '',
        email: response.email || '',
        phone: response.phone || '',
        companyName: response.companyName || '',
        role: response.role || ''
      })
      setLoading(false)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await apiPut('/auth/profile', {
        name: profile.name,
        phone: profile.phone,
        companyName: profile.companyName
      })

      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const copyFleetCode = () => {
    if (fleetCode) {
      navigator.clipboard.writeText(fleetCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your profile and fleet settings</p>
      </div>

      {/* Fleet Code Section (Fleet Admins Only) */}
      {profile.role === 'fleet_admin' && fleetCode && (
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 backdrop-blur-xl rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Your Fleet Code</h2>
              <p className="text-sm text-gray-400">Share this code with drivers to join your fleet</p>
            </div>
          </div>

          <div className="bg-dark-700/50 border border-dark-600/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 font-mono text-2xl font-bold text-orange-400 tracking-wider">
                {fleetCode}
              </div>
              <button
                onClick={copyFleetCode}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition flex items-center gap-2 font-semibold shadow-lg shadow-orange-500/30"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm text-orange-300">
              <strong>How it works:</strong> Drivers can use this code during registration to join your fleet automatically.
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500/30 backdrop-blur-xl rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-300 font-medium">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 backdrop-blur-xl rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Profile Settings Form */}
      <form onSubmit={handleSubmit} className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 overflow-hidden">
        {/* Company Settings */}
        {profile.role === 'fleet_admin' && (
          <div className="p-6 border-b border-dark-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Company Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  className="w-full px-4 py-3 border border-dark-600/50 bg-dark-700/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500"
                  placeholder="Your company name"
                />
              </div>
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 border border-dark-600/50 bg-dark-700/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 border border-dark-600/50 bg-dark-700/30 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-3 border border-dark-600/50 bg-dark-700/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <div className="w-full px-4 py-3 border border-dark-600/50 bg-dark-700/30 rounded-lg">
                <span className="capitalize text-gray-300 font-medium">
                  {profile.role === 'fleet_admin' ? 'Fleet Administrator' : 'Driver'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="p-6 bg-dark-700/30 border-t border-dark-600/50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchProfile}
              className="px-6 py-3 border border-dark-600/50 text-gray-300 bg-dark-700/50 rounded-lg font-semibold hover:bg-dark-700 hover:border-dark-500/50 transition"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      {/* Account Info */}
      <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-bold text-white">Account Information</h2>
        </div>
        <div className="space-y-2 text-sm text-gray-400">
          <p>
            <strong className="text-gray-300">Account Type:</strong>{' '}
            <span className="capitalize">{profile.role === 'fleet_admin' ? 'Fleet Administrator' : 'Driver'}</span>
          </p>
          <p>
            <strong className="text-gray-300">Registered Email:</strong> {profile.email}
          </p>
          {profile.role === 'fleet_admin' && fleetCode && (
            <p>
              <strong className="text-gray-300">Fleet Code:</strong> <span className="font-mono text-orange-400">{fleetCode}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
