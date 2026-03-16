"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'react-toastify';
import { Save, Folder, AlertCircle, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { EmpresaSettings } from "@/components/EmpresaSettings"

export default function SettingsPage() {
  const [storagePath, setStoragePath] = useState("")
  const [originalPath, setOriginalPath] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"))
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/config")
      const data = await res.json()
      if (data.storagePath) {
        setStoragePath(data.storagePath)
        setOriginalPath(data.storagePath)
        setIsValidated(true)
      }
    } catch (error) {
      toast.error("Error al cargar la configuración")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!storagePath.trim()) {
      toast.error("La ruta no puede estar vacía")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Configuración guardada y validada correctamente")
        setOriginalPath(storagePath)
        setIsValidated(true)
      } else {
        toast.error(data.error || "Error de validación")
        setIsValidated(false)
      }
    } catch (error) {
      toast.error("Error de red al intentar validar/guardar")
      setIsValidated(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsChangingPassword(true)
    try {
      const userId = localStorage.getItem("userId")
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Contraseña actualizada correctamente")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        toast.error(data.error || "Error al cambiar la contraseña")
      }
    } catch (error) {
      toast.error("Error de red")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const hasChanges = storagePath !== originalPath

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Configuración del Sistema</h1>
              <p className="text-sm text-gray-400">Ajustes globales de la aplicación</p>
            </div>
          </header>

          <div className="flex-1 max-w-4xl p-6 space-y-6">
            {userRole === "ADMINISTRADOR" && (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Folder className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Almacenamiento de Fotos</CardTitle>
                        <CardDescription className="text-gray-400">
                          Configura la ruta donde se guardarán los archivos.
                        </CardDescription>
                      </div>
                    </div>
                    {isValidated && !hasChanges && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400 font-medium">Ruta lista y validada</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="storagePath" className="text-gray-200">Ruta de Almacenamiento</Label>
                      <div className="relative">
                        <Input
                          id="storagePath"
                          placeholder="Ej: C:\Tufibra_Fotos o /var/tufibra_fotos"
                          value={storagePath}
                          onChange={(e) => {
                            setStoragePath(e.target.value)
                            if (e.target.value === originalPath) setIsValidated(true)
                            else setIsValidated(false)
                          }}
                          className={`bg-slate-700/50 border-slate-600 text-white pl-10 h-12 transition-all ${
                            hasChanges ? "border-amber-500/50 focus:border-amber-500" : ""
                          }`}
                          disabled={isLoading || isSaving}
                        />
                        <Folder className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                          hasChanges ? "text-amber-500" : "text-gray-400"
                        }`} />
                      </div>
                      
                      {hasChanges && (
                        <p className="text-xs text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Tienes cambios sin guardar. Se validarán al guardar.
                        </p>
                      )}

                      <div className="flex items-start gap-2 mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div className="text-xs text-blue-300 space-y-2">
                          <p>Al guardar, el sistema realizará las siguientes pruebas:</p>
                          <ul className="list-disc list-inside ml-2 space-y-1">
                            <li>Intentará crear la carpeta si no existe.</li>
                            <li>Verificará permisos de lectura y escritura.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleSave}
                        disabled={isLoading || isSaving || !storagePath || !hasChanges}
                        className={`${
                          hasChanges 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-gray-700 text-gray-400"
                        } text-white px-8 h-12 flex items-center gap-2 transition-all active:scale-95`}
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        {isSaving ? "Validando..." : "Verificar y Guardar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {userRole === "ADMINISTRADOR" && <EmpresaSettings />}

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Seguridad de la Cuenta</CardTitle>
                    <CardDescription className="text-gray-400">
                      Cambia tu contraseña para mantener tu cuenta segura.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-200">Contraseña Actual</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white pl-10"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="hidden md:block" />
                  <div className="space-y-2">
                    <Label className="text-gray-200">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white pl-10"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-200">Confirmar Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white pl-10"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    {isChangingPassword ? "Cambiando..." : "Cambiar Contraseña"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/30 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-300">Estado del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">
                    Host OS: <span className="text-blue-400 font-mono italic">{process.env.NEXT_PUBLIC_OS || "Desconocido"}</span>
                  </p>
                  <p className="text-[10px] text-gray-600 mt-2 italic">
                    * El sistema ajusta automáticamente los separadores de ruta según el sistema operativo detectado.
                  </p>
                </CardContent>
              </Card>
            </div>*/}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
