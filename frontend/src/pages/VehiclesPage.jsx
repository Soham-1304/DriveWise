import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api'
import { Car, Plus, Edit2, Trash2, Fuel, X, User, AlertCircle } from 'lucide-react'

export default function VehiclesPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(), // Convert to string to avoid uncontrolled input
    registrationNumber: '',
    fuelType: 'petrol',
    consumptionBaseline: '',
    assignedDriverId: ''
  })

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      if (!user) return

      // Fetch vehicles
      const vehiclesRes = await apiGet('/fleet/')
      setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : [])

      // Fetch drivers for assignment
      const driversRes = await apiGet('/auth/drivers')
      setDrivers(Array.isArray(driversRes) ? driversRes : [])

      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await apiPost('/fleet/', {
        ...formData,
        year: parseInt(formData.year),
        consumptionBaseline: parseFloat(formData.consumptionBaseline)
      })

      // Reset form and close modal
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear().toString(),
        registrationNumber: '',
        fuelType: 'petrol',
        consumptionBaseline: '',
        assignedDriverId: ''
      })
      setShowAddModal(false)
      
      // Refresh vehicles
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add vehicle')
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      make: vehicle.name || vehicle.make || '',
      model: vehicle.model || '',
      year: (vehicle.year || new Date().getFullYear()).toString(), // Convert to string
      registrationNumber: vehicle.registrationNumber || '',
      fuelType: vehicle.fuelType || 'petrol',
      consumptionBaseline: (vehicle.baselineConsumption || vehicle.consumptionBaseline || '').toString(),
      assignedDriverId: vehicle.userId || vehicle.assignedDriverId || ''
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await apiPut(`/fleet/${editingVehicle._id}`, {
        ...formData,
        year: parseInt(formData.year),
        consumptionBaseline: parseFloat(formData.consumptionBaseline)
      })

      setShowEditModal(false)
      setEditingVehicle(null)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update vehicle')
    }
  }

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return

    try {
      await apiDelete(`/fleet/${vehicleId}`)
      fetchData()
    } catch (err) {
      alert('Failed to delete vehicle')
    }
  }

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.userId === driverId)
    return driver ? driver.name : 'Unknown Driver'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Vehicle Management</h1>
          <p className="text-gray-400 mt-1">Add, edit, and manage your fleet vehicles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition flex items-center gap-2 shadow-lg shadow-orange-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      {/* Vehicles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6 hover:border-orange-500/30 hover:shadow-orange-500/10 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(vehicle)}
                  className="p-2 hover:bg-orange-500/20 text-orange-400 rounded-lg transition border border-transparent hover:border-orange-500/30"
                  title="Edit vehicle"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(vehicle._id)}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition border border-transparent hover:border-red-500/30"
                  title="Delete vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {vehicle.name || vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm font-mono font-semibold text-orange-400 mb-4">
              {vehicle.registrationNumber}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Fuel className="w-4 h-4 text-gray-400" />
                <span className="capitalize">{vehicle.fuelType}</span>
              </div>
              
              {/* Driver Assignment */}
              {(vehicle.userId || vehicle.assignedDriverId) ? (
                <div className="flex items-center gap-2 text-gray-200 bg-green-500/20 border border-green-500/30 -mx-2 px-2 py-1 rounded">
                  <User className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-green-300">{getDriverName(vehicle.userId || vehicle.assignedDriverId)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 bg-dark-700/30 border border-dark-600/30 -mx-2 px-2 py-1 rounded">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">No driver assigned</span>
                </div>
              )}
              
              <div className="pt-2 border-t border-dark-700/50">
                <span className="text-xs text-gray-400">
                  Baseline: {vehicle.consumptionBaseline} km/L
                </span>
              </div>
            </div>
          </div>
        ))}

        {vehicles.length === 0 && (
          <div className="col-span-full text-center py-12 bg-dark-800/30 backdrop-blur-xl rounded-xl border-2 border-dashed border-dark-700/50">
            <Car className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No vehicles in your fleet yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-orange-400 font-semibold hover:text-orange-300"
            >
              Add your first vehicle
            </button>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800/95 backdrop-blur-xl border border-dark-700/50 rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">Add New Vehicle</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-dark-700/50 rounded-lg transition border border-dark-600/50"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Make *
                  </label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Tata, Mahindra, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ace, Bolero, etc."
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fuel Type *
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono"
                  placeholder="MH01AB1234"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fuel Consumption Baseline (km/L) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.consumptionBaseline}
                  onChange={(e) => setFormData({ ...formData, consumptionBaseline: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="15.5"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Average fuel efficiency for this vehicle
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assign Driver (Optional)
                </label>
                <select
                  value={formData.assignedDriverId}
                  onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">-- No Driver --</option>
                  {drivers.map((driver) => (
                    <option key={driver.userId} value={driver.userId}>
                      {driver.name} ({driver.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-dark-600/50 text-gray-300 rounded-lg font-semibold hover:bg-dark-700/50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/30"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && editingVehicle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800/95 backdrop-blur-xl border border-dark-700/50 rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">Edit Vehicle</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingVehicle(null)
                  setError('')
                }}
                className="p-2 hover:bg-dark-700/50 rounded-lg transition border border-dark-600/50"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Make *
                  </label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Tata, Mahindra, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ace, Bolero, etc."
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fuel Type *
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono"
                  placeholder="MH01AB1234"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fuel Consumption Baseline (km/L) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.consumptionBaseline}
                  onChange={(e) => setFormData({ ...formData, consumptionBaseline: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="15.5"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Average fuel efficiency for this vehicle
                </p>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <label className="block text-sm font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-400" />
                  Assign Driver
                </label>
                <select
                  value={formData.assignedDriverId}
                  onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700/50 border border-orange-500/30 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">-- No Driver --</option>
                  {drivers.map((driver) => (
                    <option key={driver.userId} value={driver.userId}>
                      {driver.name} ({driver.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-orange-300 mt-2">
                  {formData.assignedDriverId 
                    ? '✓ This vehicle will be assigned to the selected driver' 
                    : 'Select a driver to assign this vehicle to them'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingVehicle(null)
                    setError('')
                  }}
                  className="flex-1 px-6 py-3 border border-dark-600/50 text-gray-300 rounded-lg font-semibold hover:bg-dark-700/50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/30"
                >
                  Update Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
