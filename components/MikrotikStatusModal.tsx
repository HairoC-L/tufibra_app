"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Globe, Wifi, Key, Clock, ShieldCheck, AlertCircle } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"

interface Props {
  isOpen: boolean
  onClose: () => void
  pppUser: string
  clientName: string
}

interface StatusData {
  secret: {
    name: string
    profile: string
    disabled: boolean
    comment: string
  }
  active: {
    address: string
    uptime: string
    callerId: string
  } | null
}

const formatMikrotikUptime = (uptime: string) => {
  if (!uptime) return "--:--:--"
  
  // Mikrotik format: 1w2d16h33m49s or 2d15h20m or 01:20:15
  // If it's already HH:mm:ss
  if (uptime.includes(':') && !uptime.match(/[a-z]/i)) return uptime

  let weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0

  const wMatch = uptime.match(/(\d+)w/)
  const dMatch = uptime.match(/(\d+)d/)
  const hMatch = uptime.match(/(\d+)h/)
  const mMatch = uptime.match(/(\d+)m/)
  const sMatch = uptime.match(/(\d+)s/)

  if (wMatch) weeks = parseInt(wMatch[1])
  if (dMatch) days = parseInt(dMatch[1])
  if (hMatch) hours = parseInt(hMatch[1])
  if (mMatch) minutes = parseInt(mMatch[1])
  if (sMatch) seconds = parseInt(sMatch[1])

  const totalDays = (weeks * 7) + days
  const h = hours.toString().padStart(2, '0')
  const min = minutes.toString().padStart(2, '0')
  const sec = seconds.toString().padStart(2, '0')

  if (totalDays > 0) {
    return `${totalDays}d ${h}:${min}:${sec}`
  }
  return `${h}:${min}:${sec}`
}

export function MikrotikStatusModal({ isOpen, onClose, pppUser, clientName }: Props) {
  const [data, setData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trafficData, setTrafficData] = useState<{ time: string; rx: number; tx: number }[]>([])

  useEffect(() => {
    if (!isOpen) return

    // Reset state when opening
    setData(null)
    setTrafficData([])
    setError(null)
    setLoading(true)

    if (!pppUser) {
      setLoading(false)
      setError("Usuario no registrado en el Mikrotik")
      return
    }

    const fetchStatus = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/cliente/mikrotik/status?pppUser=${pppUser}`)
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || "Error al obtener estado")
        }
        const statusData = await res.json()
        setData(statusData)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    const trafficInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/cliente/mikrotik/status?pppUser=${pppUser}&trafficOnly=true`)
        if (res.ok) {
          const traffic = await res.json()
          setTrafficData((prev) => {
            const newData = [...prev, { 
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
              rx: (traffic.rx / 1024 / 1024), // Mbps
              tx: (traffic.tx / 1024 / 1024)  // Mbps
            }].slice(-20) // Keep last 20 points
            return newData
          })
        }
      } catch (err) {}
    }, 2000)

    return () => clearInterval(trafficInterval)
  }, [isOpen, pppUser])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Estado Mikrotik - {clientName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Información en tiempo real del usuario PPP: <span className="text-cyan-400 font-bold">{pppUser}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Activity className="w-12 h-12 text-cyan-500 animate-pulse" />
            <p className="text-gray-400">Consultando Mikrotik...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center h-full">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-lg font-semibold text-white">{error}</p>
            <p className="text-gray-400 text-sm">Verifica que el usuario exista en el router.</p>
          </div>
        ) : data && (
          <div className="space-y-6 pt-4 pb-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Secreto (PPP)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Estado:</span>
                      <Badge className={data.secret.disabled ? "bg-red-600" : "bg-green-600"}>
                        {data.secret.disabled ? "DESHABILITADO" : "HABILITADO"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Perfil:</span>
                      <span className="text-sm font-bold text-cyan-400">{data.secret.profile}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <Wifi className="w-4 h-4" /> Conexión Activa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Online:</span>
                      <Badge className={data.active ? "bg-green-600" : "bg-gray-600"}>
                        {data.active ? "CONECTADO" : "DESCONECTADO"}
                      </Badge>
                    </div>
                    {data.active && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">IP:</span>
                        <span className="text-sm font-mono text-white">{data.active.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Tiempo Activo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col justify-center items-center h-full pt-1">
                    <span className="text-xl font-black text-white">
                      {data.active ? formatMikrotikUptime(data.active.uptime) : "--:--:--"}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase">Duración de conexión</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-gray-400 uppercase">Tráfico en Tiempo Real (Interface Traffic)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData}>
                      <defs>
                        <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9ca3af" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#9ca3af" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => `${val.toFixed(1)}M`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '12px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rx" 
                        name="Download (RX)" 
                        stroke="#22d3ee" 
                        fillOpacity={1} 
                        fill="url(#colorRx)" 
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="tx" 
                        name="Upload (TX)" 
                        stroke="#818cf8" 
                        fillOpacity={1} 
                        fill="url(#colorTx)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
