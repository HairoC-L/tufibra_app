"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { Search, MapPin, Clock, CheckCircle, AlertCircle, User } from "lucide-react"
import {
  FileBarChart,
  FileSpreadsheet,
  FilePieChart,
  Presentation,
} from "lucide-react";

interface TrackingEvent {
  id: string
  timestamp: string
  status: string
  description: string
  location?: string
  technician?: string
}

interface OrderTracking {
  orderId: string
  client: string
  type: string
  currentStatus: string
  progress: number
  events: TrackingEvent[]
}

export default function TrackingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const trackingData: OrderTracking[] = [
    {
      orderId: "OT-2024-001",
      client: "Juan Pérez",
      type: "Instalación",
      currentStatus: "En Progreso",
      progress: 60,
      events: [
        {
          id: "1",
          timestamp: "2024-01-15 08:00",
          status: "Creada",
          description: "Orden de trabajo creada en el sistema",
          technician: "Sistema",
        },
        {
          id: "2",
          timestamp: "2024-01-15 09:30",
          status: "Asignada",
          description: "Orden asignada al técnico Carlos López",
          technician: "Supervisor",
        },
        {
          id: "3",
          timestamp: "2024-01-16 10:00",
          status: "En Ruta",
          description: "Técnico en camino al sitio de instalación",
          location: "Calle Principal 123",
          technician: "Carlos López",
        },
        {
          id: "4",
          timestamp: "2024-01-16 11:15",
          status: "En Sitio",
          description: "Técnico llegó al sitio, iniciando instalación",
          location: "Calle Principal 123",
          technician: "Carlos López",
        },
        {
          id: "5",
          timestamp: "2024-01-16 14:30",
          status: "En Progreso",
          description: "Instalación de fibra óptica al 60% completada",
          location: "Calle Principal 123",
          technician: "Carlos López",
        },
      ],
    },
    {
      orderId: "OT-2024-002",
      client: "María García",
      type: "Reconexión",
      currentStatus: "Completada",
      progress: 100,
      events: [
        {
          id: "1",
          timestamp: "2024-01-14 09:00",
          status: "Creada",
          description: "Orden de reconexión creada",
          technician: "Sistema",
        },
        {
          id: "2",
          timestamp: "2024-01-14 10:00",
          status: "Asignada",
          description: "Asignada a Ana Martín",
          technician: "Supervisor",
        },
        {
          id: "3",
          timestamp: "2024-01-15 08:30",
          status: "En Ruta",
          description: "Técnico en camino",
          technician: "Ana Martín",
        },
        {
          id: "4",
          timestamp: "2024-01-15 09:45",
          status: "Completada",
          description: "Servicio reconectado exitosamente",
          location: "Avenida Central 456",
          technician: "Ana Martín",
        },
      ],
    },
  ]

  const filteredOrders = trackingData.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Creada":
      case "Asignada":
        return <Clock className="w-4 h-4 text-blue-400" />
      case "En Ruta":
      case "En Sitio":
      case "En Progreso":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case "Completada":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completada":
        return "bg-green-500"
      case "En Progreso":
        return "bg-blue-500"
      case "En Ruta":
        return "bg-yellow-500"
      case "Pendiente":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }








  const [reportOptions, setReportOptions] = useState([
    {
      id: "general",
      title: "Reporte General",
      description: "Resumen de todas las órdenes de trabajo",
      startDate: "",
      endDate: "",
      showTechnicianSelect: false,
    },
    {
      id: "clientes",
      title: "Reporte de Clientes",
      description: "Información de todos los clientes",
      startDate: "",
      endDate: "",
      showTechnicianSelect: false,
    },
    {
      id: "tecnico",
      title: "Reporte por Técnico",
      description: "Órdenes organizadas por técnico asignado",
      startDate: "",
      endDate: "",
      showTechnicianSelect: true,
      technician: "",
    },
    {
      id: "detallado",
      title: "Reporte Detallado",
      description: "Incluye el seguimiento completo de cada orden",
      startDate: "",
      endDate: "",
      showTechnicianSelect: false,
    },
  ]);


  const updateReportDate = (id: string, field: "startDate" | "endDate", value: string) => {
    setReportOptions((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, [field]: value } : report
      )
    );
  };

  const handleExport = (id: string) => {
    const report = reportOptions.find((r) => r.id === id);
    if (!report) return;

    console.log("Exportando:", report);
    // Aquí iría la lógica de exportación real, por ejemplo llamada a API
    alert(`Exportando ${report.title} a ${report.format}`);
  };


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Reportes</h1>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Genera reportes</CardTitle>
                <CardDescription className="text-gray-400">
                  Elige el tipo de reporte que deseas exportar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {reportOptions.map((report) => (
                    <Card key={report.id} className="bg-gray-800/50 border border-gray-700 backdrop-blur-lg hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-white">{report.title}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm">{report.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 align-middle justify-center content-center">
                        <div>
                          <Label className="text-gray-300 text-sm">Fecha de Inicio</Label>
                          <Input
                            type="date"
                            className="bg-gray-700 border-gray-600 text-white"
                            value={report.startDate}
                            onChange={(e) => updateReportDate(report.id, "startDate", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300 text-sm">Fecha de Fin</Label>
                          <Input
                            type="date"
                            className="bg-gray-700 border-gray-600 text-white"
                            value={report.endDate}
                            onChange={(e) => updateReportDate(report.id, "endDate", e.target.value)}
                          />
                        </div>

                        {report.showTechnicianSelect && (
                          <div>
                            <Label className="text-gray-300 text-sm">Técnico</Label>
                            <Select onValueChange={(value) => updateTechnician(report.id, value)}>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                <SelectValue placeholder="Selecciona un técnico" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                {/* Opcional: llena esta lista dinámicamente */}
                                <SelectItem value="Carlos López">Carlos López</SelectItem>
                                <SelectItem value="Ana Martín">Ana Martín</SelectItem>
                                <SelectItem value="Luis Torres">Luis Torres</SelectItem>
                                <SelectItem value="José Díaz">José Díaz</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="flex justify-between gap-2">
                          <Button
                            className="bg-green-600 hover:bg-green-700 w-full"
                            onClick={() => handleExport(report.id, "excel")}
                          >
                            Excel
                          </Button>
                          <Button
                            className="bg-red-600 hover:bg-red-700 w-full"
                            onClick={() => handleExport(report.id, "pdf")}
                          >
                            PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>


            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
