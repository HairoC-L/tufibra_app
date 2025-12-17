"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin, Calendar, Wrench, User } from "lucide-react"

type Especialidad = {
  esp_id: number
  esp_nombre: string
  esp_descrip: string
}

interface Technician {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  status: string
  location: string
  activeOrders: number
  completedOrders: number
  rating: number
  joinDate: string
  avatar?: string
}

export default function TechniciansPage() {

  const [showNotification, setShowNotification] = useState(false);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [newTechnician, setNewTechnician] = useState({
    name: "",
    email: "",
    phone: "",
    esp_id: "",
    dni: "",
  });

  //Carga de especualidades
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const res = await fetch("/api/especialidad")
        const data = await res.json()
        setEspecialidades(data)
      } catch (err) {
        console.error("Error cargando especialidades:", err)
      }
    }

    fetchEspecialidades()
  }, [])


  //Carga de tecnicos
  const fetchTechnicians = async () => {
    try {
      const res = await fetch("/api/technician");
      if (!res.ok) {
        console.error("Error al obtener técnicos:", res.status);
        return;
      }

      const data = await res.json();
      setTechnicians(data);
      setFilteredTechnicians(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);


  const handleCreateTechnician = async () => {
    try {
      const res = await fetch("/api/technician", {
        method: "POST",
        body: JSON.stringify({
          ...newTechnician,
          esp_id: parseInt(newTechnician.esp_id),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.error) {
        console.error("Error:", data.error);
      } else {
        console.log("Técnico creado:", data.technician);
        setIsCreateModalOpen(false);
        setNewTechnician({
          name: "",
          email: "",
          phone: "",
          dni: "",
          esp_id: "",
        });
        setShowNotification(true);
        await fetchTechnicians(); // 🔁 Refresca la lista automáticamente

        setTimeout(() => setShowNotification(false), 2000);
      }
    } catch (error) {
      console.error("Error al crear el técnico:", error);
    }
  };

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]); // Para aplicar filtros si usas

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponible":
        return "bg-green-500"
      case "En Campo":
        return "bg-blue-500"
      case "Ocupado":
        return "bg-yellow-500"
      case "Descanso":
        return "bg-gray-500"
      case "Inactivo":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }



  const handleEditTechnician = () => {
    if (selectedTechnician) {
      setTechnicians(technicians.map((tech) => (tech.id === selectedTechnician.id ? selectedTechnician : tech)))
      setIsEditModalOpen(false)
      setSelectedTechnician(null)
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
              <h1 className="text-xl font-semibold text-white">Gestión de Técnicos</h1>
              <p className="text-sm text-gray-300">Administra el equipo de técnicos de campo</p>
            </div>
          </header>
          {showNotification && (
            <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
              ¡Técnico creado!
            </div>
          )}

          <div className="flex-1 space-y-6 p-6">
            {/* Estadísticas rápidas */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Técnicos</p>
                      <p className="text-2xl font-bold text-white">{technicians.length}</p>
                    </div>
                    <Wrench className="w-8 h-8 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Disponibles</p>
                      <p className="text-2xl font-bold text-white">
                        {technicians.filter((t) => t.status === "Disponible").length}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">En Campo</p>
                      <p className="text-2xl font-bold text-white">
                        {technicians.filter((t) => t.status === "En Campo").length}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>


            </div>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Equipo de Técnicos</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gestiona la información y estado de los técnicos
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Técnico
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Técnico</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Completa la información del nuevo técnico
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                              id="name"
                              value={newTechnician.name}
                              onChange={(e) => setNewTechnician({ ...newTechnician, name: e.target.value })}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newTechnician.email}
                              onChange={(e) => setNewTechnician({ ...newTechnician, email: e.target.value })}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Celular</Label>
                            <Input
                              id="phone"
                              value={newTechnician.phone}
                              onChange={(e) => setNewTechnician({ ...newTechnician, phone: e.target.value })}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dni">DNI</Label>
                            <Input
                              id="dni"
                              value={newTechnician.dni}
                              onChange={(e) => setNewTechnician({ ...newTechnician, dni: e.target.value })}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="esp_id">Especialización</Label>
                          <Select
                            value={newTechnician.esp_id}
                            onValueChange={(value) => setNewTechnician({ ...newTechnician, esp_id: value })}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue placeholder="Seleccionar especialización" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              {especialidades.map((esp) => (
                                <SelectItem key={esp.esp_id} value={esp.esp_id.toString()}>
                                  {esp.esp_nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 text-black">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="hover:bg-gray-600 hover:text-white transition">
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleCreateTechnician}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 text-white hover:to-blue-700 transition"
                        >
                          Crear Técnico
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>


                <div className="rounded-md border border-gray-700 bg-gray-800/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-200">Técnico</TableHead>
                        <TableHead className="text-gray-200">Contacto</TableHead>
                        <TableHead className="text-gray-200">Especialización</TableHead>
                        <TableHead className="text-gray-200">Estado</TableHead>
                        <TableHead className="text-gray-200">Órdenes Activas</TableHead>
                        <TableHead className="text-gray-200">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTechnicians.map((technician) => (
                        <TableRow key={technician.id} className="border-gray-700">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <User className="w-4 h-4 text-white" />

                              <div>
                                <p className="text-white font-medium">{technician.name}</p>
                                <p className="text-xs text-gray-400">{technician.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-200">
                                <Mail className="w-3 h-3 mr-1" />
                                {technician.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-200">
                                <Phone className="w-3 h-3 mr-1" />
                                {technician.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-200">{technician.specialization}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(technician.status)} text-white`}>
                              {technician.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-200">{technician.activeOrders}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTechnician(technician)
                                  setIsViewModalOpen(true)
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTechnician(technician)
                                  setIsEditModalOpen(true)
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de visualización */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Perfil del Técnico</DialogTitle>
              <DialogDescription className="text-gray-400">Información detallada del técnico</DialogDescription>
            </DialogHeader>
            {selectedTechnician && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedTechnician.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg">
                      {selectedTechnician.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedTechnician.name}</h3>
                    <p className="text-gray-400">{selectedTechnician.id}</p>
                    <Badge className={`${getStatusColor(selectedTechnician.status)} text-white mt-1`}>
                      {selectedTechnician.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-400">Contacto</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center text-white">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedTechnician.email}
                        </div>
                        <div className="flex items-center text-white">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedTechnician.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-400">Especialización</Label>
                      <p className="text-white mt-1">{selectedTechnician.specialization}</p>
                    </div>

                    <div>
                      <Label className="text-gray-400">Fecha de Registro</Label>
                      <div className="flex items-center text-white mt-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedTechnician.joinDate}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-white">{selectedTechnician.activeOrders}</p>
                      <p className="text-sm text-gray-400">Órdenes Activas</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-white">{selectedTechnician.completedOrders}</p>
                      <p className="text-sm text-gray-400">Completadas</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de edición */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Técnico</DialogTitle>
              <DialogDescription className="text-gray-400">Modifica la información del técnico</DialogDescription>
            </DialogHeader>
            {selectedTechnician && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre Completo</Label>
                    <Input
                      id="edit-name"
                      value={selectedTechnician.name}
                      onChange={(e) => setSelectedTechnician({ ...selectedTechnician, name: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedTechnician.email}
                      onChange={(e) => setSelectedTechnician({ ...selectedTechnician, email: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Teléfono</Label>
                    <Input
                      id="edit-phone"
                      value={selectedTechnician.phone}
                      onChange={(e) => setSelectedTechnician({ ...selectedTechnician, phone: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Estado</Label>
                    <Select
                      value={selectedTechnician.status}
                      onValueChange={(value) => setSelectedTechnician({ ...selectedTechnician, status: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="En Campo">En Campo</SelectItem>
                        <SelectItem value="Ocupado">Ocupado</SelectItem>
                        <SelectItem value="Descanso">Descanso</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-specialization">Especialización</Label>
                    <Select
                      value={selectedTechnician.specialization}
                      onValueChange={(value) => setSelectedTechnician({ ...selectedTechnician, specialization: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Fibra Óptica">Fibra Óptica</SelectItem>
                        <SelectItem value="Instalaciones">Instalaciones</SelectItem>
                        <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="Reparaciones">Reparaciones</SelectItem>
                        <SelectItem value="Cortes y Reconexiones">Cortes y Reconexiones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Zona de Trabajo</Label>
                    <Select
                      value={selectedTechnician.location}
                      onValueChange={(value) => setSelectedTechnician({ ...selectedTechnician, location: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Zona Norte">Zona Norte</SelectItem>
                        <SelectItem value="Zona Sur">Zona Sur</SelectItem>
                        <SelectItem value="Zona Este">Zona Este</SelectItem>
                        <SelectItem value="Zona Oeste">Zona Oeste</SelectItem>
                        <SelectItem value="Zona Centro">Zona Centro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditTechnician} className="bg-gradient-to-r from-cyan-500 to-blue-600">
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
