import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Fuel, Mail, Lock, AlertCircle, Building2, User, Copy, Check, Phone, CreditCard, Zap } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'fleet_admin',
    companyName: '',
    fleetCode: '',
    licenseNumber: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFleetCode, setShowFleetCode] = useState(false)
  const [generatedFleetCode, setGeneratedFleetCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useState(() => {
    setMounted(true)
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.role === 'fleet_admin' && !formData.companyName.trim()) {
      setError('Company name is required for Fleet Admin')
      return
    }

    if (formData.role === 'driver' && !formData.fleetCode.trim()) {
      setError('Fleet code is required for Drivers')
      return
    }

    if (formData.role === 'driver' && !formData.licenseNumber.trim()) {
      setError('License number is required for Drivers')
      return
    }

    setLoading(true)

    try {
      // Prepare fleetData based on role
      const fleetData = formData.role === 'fleet_admin'
        ? {
            companyName: formData.companyName,
            name: formData.name,
            phone: formData.phone
          }
        : {
            fleetCode: formData.fleetCode,
            name: formData.name,
            phone: formData.phone,
            licenseNumber: formData.licenseNumber
          }

      const { role, fleetCode } = await signUp(
        formData.email,
        formData.password,
        formData.role,
        fleetData
      )

      if (role === 'fleet_admin' && fleetCode) {
        setGeneratedFleetCode(fleetCode)
        setShowFleetCode(true)
      } else {
        if (role === 'fleet_admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/driver')
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to create account')
      setLoading(false)
    }
  }

  const copyFleetCode = () => {
    navigator.clipboard.writeText(generatedFleetCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFleetCodeContinue = () => {
    navigate('/admin/dashboard')
  }

  if (showFleetCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-dark-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-dark-700/50">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl shadow-primary-500/20">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Account Created!
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Save your fleet code to share with drivers
            </p>
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Fleet Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={generatedFleetCode}
                className="flex-1 px-4 py-3 bg-dark-900/50 border border-dark-700 text-white rounded-xl font-mono text-center text-lg"
              />
              <button
                onClick={copyFleetCode}
                className="px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors"
              >
                {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Drivers will need this code to join your fleet
            </p>
          </div>

          <button
            onClick={handleFleetCodeContinue}
            className="mt-6 w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-[1.02]"
          >
            <Zap className="h-4 w-4" />
            Continue to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className={`max-w-md w-full space-y-8 relative z-10 transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="text-center">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-2xl shadow-xl shadow-primary-500/20">
                <Fuel className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join <span className="text-primary-500 font-semibold">FuelOptimizer</span> and start saving fuel
          </p>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-dark-700/50">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'fleet_admin', fleetCode: '', licenseNumber: '' })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                  formData.role === 'fleet_admin'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-dark-700 bg-dark-900/30 text-gray-400 hover:border-dark-600'
                }`}
              >
                <Building2 className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Fleet Admin</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'driver', companyName: '' })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                  formData.role === 'driver'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-dark-700 bg-dark-900/30 text-gray-400 hover:border-dark-600'
                }`}
              >
                <User className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Driver</div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-dark-900/50 border border-dark-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-gray-500 text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-dark-900/50 border border-dark-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-gray-500 text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 bg-dark-900/50 border border-dark-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-gray-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {formData.role === 'fleet_admin' && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-dark-900/50 border border-dark-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-gray-500"
                    placeholder="Acme Transport Ltd."
                  />
                </div>
              </div>
            )}

            {formData.role === 'driver' && (
              <>
                <div>
                  <label htmlFor="fleetCode" className="block text-sm font-medium text-gray-300 mb-2">
                    Fleet Code
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      id="fleetCode"
                      name="fleetCode"
                      type="text"
                      required
                      value={formData.fleetCode}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 bg-dark-900/50 border border-dark-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-gray-500"
                      placeholder="Enter fleet code from admin"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-300 mb-2">
                    License Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 bg-dark-900/50 border border-dark-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-gray-500"
                      placeholder="DL-1234567890"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-dark-900/50 border border-dark-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-gray-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-dark-900/50 border border-dark-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-gray-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Creating account...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account? <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-400 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
