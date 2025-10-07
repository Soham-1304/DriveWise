import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import axios from '../lib/axios'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    fuelType: 'ICE',
    batteryCapacityKWh: '',
    consumptionBaseline: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVehicles()
  }, [])

  async function fetchVehicles() {
    try {
      const token = await auth.currentUser.getIdToken()
      const response = await axios.get('/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setVehicles(response.data.vehicles || [])
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError('Failed to load vehicles')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const token = await auth.currentUser.getIdToken()
      await axios.post('/vehicles', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Reset form and refresh list
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        fuelType: 'ICE',
        batteryCapacityKWh: '',
        consumptionBaseline: ''
      })
      setShowForm(false)
      fetchVehicles()
    } catch (err) {
      console.error('Error creating vehicle:', err)
      setError('Failed to create vehicle')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    try {
      const token = await auth.currentUser.getIdToken()
      await axios.delete(`/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchVehicles()
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      setError('Failed to delete vehicle')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Vehicles</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          {showForm ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add New Vehicle</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make *
                </label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  placeholder="e.g., Tesla, Toyota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  placeholder="e.g., Model 3, Camry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type *
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ICE">Petrol/Diesel (ICE)</option>
                  <option value="EV">Electric (EV)</option>
                </select>
              </div>
              {formData.fuelType === 'EV' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Battery Capacity (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.batteryCapacityKWh}
                    onChange={(e) => setFormData({ ...formData, batteryCapacityKWh: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 60"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Baseline Consumption ({formData.fuelType === 'EV' ? 'kWh/100km' : 'L/100km'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.consumptionBaseline}
                  onChange={(e) => setFormData({ ...formData, consumptionBaseline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={formData.fuelType === 'EV' ? 'e.g., 15' : 'e.g., 6.5'}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to use default ({formData.fuelType === 'EV' ? '15 kWh/100km' : '6.5 L/100km'})
                </p>
              </div>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Add Vehicle
            </button>
          </form>
        </div>
      )}

      {!vehicles || vehicles.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No vehicles yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first vehicle</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Add Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-600">Year: {vehicle.year}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  vehicle.fuelType === 'EV' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {vehicle.fuelType}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                {vehicle.batteryCapacityKWh && (
                  <p className="text-gray-700">
                    <span className="font-medium">Battery:</span> {vehicle.batteryCapacityKWh} kWh
                  </p>
                )}
                <p className="text-gray-700">
                  <span className="font-medium">Baseline:</span>{' '}
                  {vehicle.consumptionBaseline} {vehicle.fuelType === 'EV' ? 'kWh/100km' : 'L/100km'}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => handleDelete(vehicle._id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

