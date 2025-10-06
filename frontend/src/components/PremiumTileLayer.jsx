import { TileLayer } from 'react-leaflet'
import { useState } from 'react'
import { Map, Layers } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

/**
 * Map Tile Configurations - Simple version without Mapbox
 */
const TILE_PROVIDERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    subdomains: 'abc', // Add subdomains for OSM
  },
  cartoVoyager: {
    name: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CartoDB',
    maxZoom: 20,
    subdomains: 'abcd',
  },
  cartoPositron: {
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CartoDB',
    maxZoom: 20,
    subdomains: 'abcd',
  },
  cartoDark: {
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CartoDB',
    maxZoom: 20,
    subdomains: 'abcd',
  },
}

/**
 * Premium Map Tile Layer with Selector
 */
export default function PremiumTileLayer({ showSelector = true }) {
  const [selectedProvider, setSelectedProvider] = useState('cartoVoyager')
  const [showMenu, setShowMenu] = useState(false)

  const currentProvider = TILE_PROVIDERS[selectedProvider]
  const availableProviders = Object.entries(TILE_PROVIDERS)

  return (
    <>
      <TileLayer
        key={selectedProvider}
        url={currentProvider.url}
        attribution={currentProvider.attribution}
        maxZoom={currentProvider.maxZoom}
        subdomains={currentProvider.subdomains || 'abc'} // Fallback to 'abc' if undefined
      />

      {showSelector && (
        <div className="leaflet-top leaflet-right" style={{ marginTop: '80px' }}>
          <div className="leaflet-control">
            <div className="relative">
              {/* Toggle Button */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-all hover:scale-105 active:scale-95 border-2 border-gray-100"
                title="Change map style"
              >
                <Layers size={20} className="text-gray-700" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden z-[1000] animate-slide-down">
                   
                    <div className="p-2">
                      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                        <Map size={14} />
                        <span>MAP STYLES</span>
                      </div>

                      <div className="mt-2 space-y-1">
                        {availableProviders.map(([key, provider]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedProvider(key)
                              setShowMenu(false)
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                              selectedProvider === key
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{provider.name}</span>
                              {selectedProvider === key && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
