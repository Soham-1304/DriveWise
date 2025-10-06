import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function formatDistance(km) {
  return `${km.toFixed(1)} km`
}

export function formatFuel(amount, type = 'ICE') {
  const unit = type === 'EV' ? 'kWh' : 'L'
  return `${amount.toFixed(2)} ${unit}`
}

export function getEfficiencyColor(score) {
  if (score >= 80) return 'text-green-600 bg-green-50'
  if (score >= 60) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

export function getEfficiencyBadge(score) {
  if (score >= 80) return { label: 'Excellent', color: 'green' }
  if (score >= 60) return { label: 'Good', color: 'yellow' }
  return { label: 'Needs Improvement', color: 'red' }
}
