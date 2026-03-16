"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'react-toastify'
import { Building2, Save, Upload, Image as ImageIcon } from "lucide-react"

export function EmpresaSettings() {
  const [empresa, setEmpresa] = useState({
    id: 0,
    nombre: "",
    ruc: "",
    direccion: "",
    celular: "",
    frase: "",
    logo_url: "",
    favicon_url: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    fetchEmpresa();
  }, []);

  const fetchEmpresa = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/empresa");
      const data = await res.json();
      if (data && data.nombre) {
        setEmpresa(data);
      }
    } catch (error) {
      console.error("Error fetching empresa", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmpresa({ ...empresa, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    if (e.target.files && e.target.files[0]) {
      if (type === "logo") setLogoFile(e.target.files[0]);
      if (type === "favicon") setFaviconFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File, type: "logo" | "favicon") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    
    const res = await fetch("/api/uploadEmpresa", {
      method: "POST",
      body: formData,
    });
    
    const data = await res.json();
    if (data.success) {
      return data.fileName;
    }
    throw new Error(data.error || "Error al subir archivo");
  };

  const handleSave = async () => {
    if (!empresa.nombre || !empresa.ruc || !empresa.direccion) {
      toast.error("Nombre, RUC y Dirección son obligatorios");
      return;
    }
    
    setIsSaving(true);
    try {
      let logoUrl = empresa.logo_url;
      let faviconUrl = empresa.favicon_url;

      if (logoFile) {
        logoUrl = await uploadFile(logoFile, "logo");
      }
      if (faviconFile) {
        faviconUrl = await uploadFile(faviconFile, "favicon");
      }

      const payload = {
        ...empresa,
        logo_url: logoUrl,
        favicon_url: faviconUrl
      };

      const res = await fetch("/api/empresa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Configuración de empresa guardada");
        setEmpresa(data);
        setLogoFile(null);
        setFaviconFile(null);
        // Dispatch custom event to notify layout/sidebar to refresh
        window.dispatchEvent(new Event("empresaConfigUpdated"));
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-white">Perfil de Empresa</CardTitle>
              <CardDescription className="text-gray-400">
                Configura los datos que aparecerán en los tickets y el sistema.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-200">Razón Social / Nombre Comercial *</Label>
            <Input
              name="nombre"
              value={empresa.nombre}
              onChange={handleChange}
              placeholder="Ej: Tufibra S.A.C."
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-200">RUC *</Label>
            <Input
              name="ruc"
              value={empresa.ruc}
              onChange={handleChange}
              placeholder="Ej: 20123456789"
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-200">Dirección *</Label>
            <Input
              name="direccion"
              value={empresa.direccion}
              onChange={handleChange}
              placeholder="Ej: Av. Principal 123"
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-200">Celular / Teléfono</Label>
            <Input
              name="celular"
              value={empresa.celular}
              onChange={handleChange}
              placeholder="Ej: 987654321"
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-gray-200">Frase para el ticket</Label>
            <Input
              name="frase"
              value={empresa.frase}
              onChange={handleChange}
              placeholder="Ej: ¡Gracias por su preferencia!"
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          
          <div className="space-y-2 pt-4 border-t border-gray-700 md:col-span-2">
            <h3 className="text-sm font-medium text-white mb-4">Imágenes del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-200">Logo del Sistema (Login y Tickets)</Label>
                <div className="flex items-center gap-4">
                  {(empresa.logo_url || logoFile) && (
                    <div className="w-16 h-16 bg-gray-900 rounded-md border border-gray-600 overflow-hidden flex items-center justify-center">
                      <img 
                        src={logoFile ? URL.createObjectURL(logoFile) : `/api/media/${empresa.logo_url}`} 
                        alt="Logo Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "logo")}
                      className="bg-slate-700/50 border-slate-600 text-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">Favicon (Pestaña del navegador)</Label>
                <div className="flex items-center gap-4">
                  {(empresa.favicon_url || faviconFile) && (
                    <div className="w-16 h-16 bg-gray-900 rounded-md border border-gray-600 overflow-hidden flex items-center justify-center">
                      <img 
                        src={faviconFile ? URL.createObjectURL(faviconFile) : `/api/media/${empresa.favicon_url}`} 
                        alt="Favicon Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/x-icon,image/png,image/svg+xml"
                      onChange={(e) => handleFileChange(e, "favicon")}
                      className="bg-slate-700/50 border-slate-600 text-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 h-12 flex items-center gap-2 transition-all active:scale-95"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? "Guardando..." : "Guardar Perfil Empresa"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
