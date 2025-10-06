import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Fuel, Battery, Utensils, WashingMachine, ParkingCircle, Camera, DollarSign, Eye, MapPin, Cross, AlertTriangle, Heart, Trees } from 'lucide-react'

/**
 * POI Icon Configuration
 */
const POI_ICONS = {
  fuel: {
    color: '#ef4444',
    Icon: Fuel,
    label: 'Fuel Station',
  },
  charging: {
    color: '#3b82f6',
    Icon: Battery,
    label: 'EV Charging',
  },
  food: {
    color: '#f59e0b',
    Icon: Utensils,
    label: 'Restaurant',
  },
  restroom: {
    color: '#8b5cf6',
    Icon: WashingMachine,
    label: 'Restroom',
  },
  parking: {
    color: '#10b981',
    Icon: ParkingCircle,
    label: 'Parking',
  },
  speed_camera: {
    color: '#dc2626',
    Icon: Camera,
    label: 'Speed Camera',
  },
  toll: {
    color: '#ca8a04',
    Icon: DollarSign,
    label: 'Toll Booth',
  },
  tourism: {
    color: '#06b6d4',
    Icon: Eye,
    label: 'Tourist Attraction',
  },
  viewpoint: {
    color: '#14b8a6',
    Icon: MapPin,
    label: 'Scenic View',
  },
  rest_area: {
    color: '#84cc16',
    Icon: AlertTriangle,
    label: 'Rest Area',
  },
  emergency: {
    color: '#e11d48',
    Icon: Cross,
    label: 'Emergency',
  },
  traffic_signals: {
    color: '#f97316',
    Icon: AlertTriangle,
    label: 'Traffic Signal',
  },
  hospital: {
    color: '#dc2626',
    Icon: Heart,
    label: 'Hospital',
  },
  park: {
    color: '#22c55e',
    Icon: Trees,
    label: 'Park',
  },
}

/**
 * Create custom Leaflet icon for POI
 */
function createPOIIcon(type) {
  const config = POI_ICONS[type] || POI_ICONS.fuel
  
  const iconHtml = `
    <div style="
      background: ${config.color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="white" 
        stroke-width="2.5" 
        style="transform: rotate(45deg)"
      >
        ${getIconSVGPath(type)}
      </svg>
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    className: 'custom-poi-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

/**
 * Get SVG path for icon type
 */
function getIconSVGPath(type) {
  const paths = {
    fuel: '<path d="M3 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18M3 9h8M14 11V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2M14 11v7a2 2 0 0 0 2 2h2"/>',
    charging: '<path d="M14 7h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2M6 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M6 12h8M10 12v10"/>',
    food: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
    restroom: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4h8"/>',
    parking: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H9V9zm0 6v2"/>',
    speed_camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    toll: '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8m4-12v2m0 8v2"/>',
    tourism: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
    viewpoint: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    rest_area: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
    emergency: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
    traffic_signals: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    hospital: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 8v4m-2-2h4"/>',
    park: '<path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.5 8.5 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.5-8.5 2.1-2.1"/>',
  }
  
  return paths[type] || paths.fuel
}

/**
 * POI Marker Component
 */
export default function POIMarker({ poi, onClick }) {
  const config = POI_ICONS[poi.type] || POI_ICONS.fuel
  const icon = createPOIIcon(poi.type)

  return (
    <Marker
      position={[poi.lat, poi.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onClick && onClick(poi),
      }}
    >
      <Popup className="poi-popup">
        <div className="p-3 min-w-[200px]">
          <div className="flex items-start gap-3 mb-2">
            <div
              className="p-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <config.Icon size={20} color={config.color} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">{poi.name}</h3>
              <p className="text-xs text-gray-500">{config.label}</p>
            </div>
          </div>

          {poi.distance !== undefined && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{poi.distance.toFixed(1)} km away</span>
            </div>
          )}

          {poi.brand && (
            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium">Brand:</span> {poi.brand}
            </div>
          )}

          {poi.opening_hours && (
            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium">Hours:</span> {poi.opening_hours}
            </div>
          )}

          {poi.wheelchair && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="4" r="2"/>
                <path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z"/>
              </svg>
              <span>Wheelchair accessible</span>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
