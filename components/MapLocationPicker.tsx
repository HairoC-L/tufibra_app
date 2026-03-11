"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, ChevronDown, ChevronUp } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("./MapPicker"), { 
  ssr: false,
  loading: () => <div className="h-[350px] w-full bg-slate-800 animate-pulse flex items-center justify-center text-slate-400">Cargando mapa...</div>
})

interface MapLocationPickerProps {
  initialCoords?: string
  onSelect: (coords: string) => void
  buttonText?: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function MapLocationPicker({ 
  initialCoords, 
  onSelect, 
  buttonText = "Mapa",
  className,
  variant = "outline"
}: MapLocationPickerProps) {
  const [showMap, setShowMap] = useState(false)
  const mountKeyRef = useRef(0)

  const handleToggle = () => {
    if (!showMap) {
      mountKeyRef.current += 1 // Fresh key each time we open
    }
    setShowMap(!showMap)
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button 
        variant={showMap ? "secondary" : variant} 
        className={className} 
        type="button"
        onClick={handleToggle}
        title="Seleccionar en mapa"
      >
        <MapPin className={`w-4 h-4 ${showMap ? 'text-cyan-400' : 'text-slate-400'} mr-2`} />
        {buttonText}
        {showMap ? <ChevronUp className="w-4 h-4 ml-1 opacity-50" /> : <ChevronDown className="w-4 h-4 ml-1 opacity-50" />}
      </Button>
      
      {showMap && (
        <div className="border border-slate-700 rounded-md overflow-hidden bg-slate-900 p-1 animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center px-2 py-1 bg-slate-800/50">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selector de Ubicación</span>
            <span className="text-[10px] text-cyan-400 font-mono">
              {initialCoords || "Haz clic en el mapa"}
            </span>
          </div>
          <MapPicker 
            key={`map-picker-${mountKeyRef.current}`}
            initialCoords={initialCoords} 
            onLocationSelect={onSelect} 
          />
        </div>
      )}
    </div>
  )
}
