"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'react-toastify';
import { Save, Globe, Shield, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"

export default function MikrotikSettingsPage() {
  const [config, setConfig] = useState({
    ip: "",
    port: 8728,
    usuario: "",
    password: "",
  })
  const [hasPassword, setHasPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/mikrotik")
      const data = await res.json()
      if (data.ip) {
        setConfig({
          ip: data.ip,
          port: data.port,
          usuario: data.usuario,
          password: "", // Handled separately via hasPassword flag
        })
        setHasPassword(data.hasPassword)
      }
    } catch (error) {
      toast.error("Error al cargar la configuración de Mikrotik")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config.ip || !config.usuario) {
      toast.error("IP y usuario son obligatorios")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/mikrotik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Configuración guardada correctamente")
        if (config.password) {
          setHasPassword(true)
          setConfig(prev => ({ ...prev, password: "" }))
        }
        setTestResult(null)
      } else {
        toast.error(data.error || "Error al guardar")
      }
    } catch (error) {
      toast.error("Error de red al intentar guardar")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/admin/mikrotik/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (data.success) {
        setTestResult({ success: true, message: data.message })
        toast.success(data.message)
      } else {
        setTestResult({ success: false, message: data.error })
        toast.error(data.error || "Fallo en la conexión")
      }
    } catch (error) {
      setTestResult({ success: false, message: "Error de red al probar conexión" })
      toast.error("Error de red al probar conexión")
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Configuración Mikrotik</h1>
              <p className="text-sm text-gray-400">Panel de integración con la API de RouterOS</p>
            </div>
          </header>

          <div className="flex-1 max-w-4xl p-6 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">API Mikrotik</CardTitle>
                    <CardDescription className="text-gray-400">
                      Configura las credenciales de acceso para la gestión de red.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip" className="text-gray-200">Dirección IP / Host</Label>
                    <Input
                      id="ip"
                      placeholder="Ej: 192.168.88.1"
                      value={config.ip}
                      onChange={(e) => setConfig({ ...config, ip: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      disabled={isLoading || isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port" className="text-gray-200">Puerto API (Default 8728)</Label>
                    <Input
                      id="port"
                      type="number"
                      placeholder="8728"
                      value={config.port}
                      onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      disabled={isLoading || isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usuario" className="text-gray-200">Usuario API</Label>
                    <Input
                      id="usuario"
                      value={config.usuario}
                      onChange={(e) => setConfig({ ...config, usuario: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      disabled={isLoading || isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-200">
                      Contraseña {hasPassword && <span className="text-cyan-400 text-[10px] ml-2">(🔐 Cifrada en DB)</span>}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={hasPassword ? "••••••••" : "Ingresar contraseña"}
                      value={config.password}
                      onChange={(e) => setConfig({ ...config, password: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      disabled={isLoading || isSaving}
                    />
                  </div>
                </div>

                {testResult && (
                  <div className={`p-4 rounded-lg flex items-start gap-3 border ${
                    testResult.success 
                    ? "bg-green-500/10 border-green-500/20 text-green-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <div className="text-sm">
                      <p className="font-bold">{testResult.success ? "Conexión Exitosa" : "Fallo de Conexión"}</p>
                      <p className="opacity-80">{testResult.message}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-slate-500/10 border border-slate-500/20 rounded-lg">
                  <Shield className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-400 italic">
                    Las credenciales se almacenan utilizando cifrado. El sistema utiliza el puerto API estándar (8728) o SSL (8729) si está configurado en el router.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-4">
                  <Button 
                    onClick={handleTestConnection}
                    disabled={isLoading || isSaving || isTesting || !config.ip}
                    variant="outline"
                    className="border-slate-600 text-gray-700 hover:bg-slate-700/50 hover:text-white flex-1 h-12 gap-2"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                    {isTesting ? "Probando..." : "Probar Conexión"}
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isLoading || isSaving || isTesting}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1 h-12 gap-2"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving ? "Guardando..." : "Guardar Configuración"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
