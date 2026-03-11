"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

interface MapPickerProps {
  initialCoords?: string // Format: "lat, lng"
  onLocationSelect: (coords: string) => void
}

function parseCoords(str?: string): [number, number] | null {
  if (!str) return null
  const parts = str.split(',').map(s => Number(s.trim()))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]]
  }
  return null
}

export default function MapPicker({ initialCoords, onLocationSelect }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  const defaultCenter: [number, number] = [-12.046374, -77.042793] // Lima, Peru
  const startPos = parseCoords(initialCoords) || defaultCenter

  useEffect(() => {
    const el = containerRef.current
    if (!el || mapRef.current) return // Already initialized? Skip.

    // Create the Leaflet map
    const map = L.map(el, {
      center: startPos,
      zoom: 15,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const marker = L.marker(startPos, { draggable: true }).addTo(map)

    // Click on map → move marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng)
      onLocationSelect(`${e.latlng.lat}, ${e.latlng.lng}`)
    })

    // Drag marker → update coords
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      onLocationSelect(`${pos.lat}, ${pos.lng}`)
    })

    mapRef.current = map
    markerRef.current = marker

    // Force a resize after mount (fixes grey tiles in modals)
    setTimeout(() => map.invalidateSize(), 200)

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return (
    <div
      ref={containerRef}
      className="h-[350px] w-full rounded-md overflow-hidden border border-slate-700 z-0"
    />
  )
}
