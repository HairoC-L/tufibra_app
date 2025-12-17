"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin, Calendar, Wrench } from "lucide-react"

interface users {
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

export default function userssPage() {
  const [userss, setuserss] = useState<users[]>([
    {
      id: "USU-001",
      name: "Hairo Cadillo Leon",
      email: "hairo2004.leon@gmail.com",
      phone: "+51969788432",
      specialization: "Fibra Óptica",
      status: "Administrador",
      location: "Zona Norte",
      activeOrders: 3,
      completedOrders: 156,
      rating: 4.8,
      joinDate: "2023-01-15",
    },
    {
      id: "USU-002",
      name: "Stefany Lopez Moreno",
      email: "stenfany@gmail.com",
      phone: "+1234567891",
      specialization: "Instalaciones",
      status: "Oficina",
      location: "Zona Centro",
      activeOrders: 1,
      completedOrders: 203,
      rating: 4.9,
      joinDate: "2022-08-20",
    },
    {
      id: "USU-003",
      name: "Luigi Carmona Leon",
      email: "luigi@gmail.com",
      phone: "+1234567892",
      specialization: "Mantenimiento",
      status: "Yécnico",
      location: "Zona Sur",
      activeOrders: 0,
      completedOrders: 89,
      rating: 4.6,
      joinDate: "2023-06-10",
    },
    {
      id: "USU-004",
      name: "Jorge Lopez",
      email: "Joorge@gmail.com",
      phone: "+1234567893",
      specialization: "Reparaciones",
      status: "Administrador",
      location: "Zona Este",
      activeOrders: 2,
      completedOrders: 134,
      rating: 4.7,
      joinDate: "2022-11-05",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedusers, setSelectedusers] = useState<users | null>(null)
  const [newusers, setNewusers] = useState<Partial<users>>({})

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

  const filtereduserss = userss.filter((tech) => {
    const matchesSearch =
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || tech.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleCreateusers = () => {
    const id = `USU-${String(userss.length + 1).padStart(3, "0")}`
    const users: users = {
      id,
      name: newusers.name || "",
      email: newusers.email || "",
      phone: newusers.phone || "",
      specialization: newusers.specialization || "",
      status: "Disponible",
      location: newusers.location || "",
      activeOrders: 0,
      completedOrders: 0,
      rating: 5.0,
      joinDate: new Date().toISOString().split("T")[0],
    }
    setuserss([...userss, users])
    setNewusers({})
    setIsCreateModalOpen(false)
  }

  const handleEditusers = () => {
    if (selectedusers) {
      setuserss(userss.map((tech) => (tech.id === selectedusers.id ? selectedusers : tech)))
      setIsEditModalOpen(false)
      setSelectedusers(null)
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
              <h1 className="text-xl font-semibold text-white">Gestión de Usuarios</h1>
              <p className="text-sm text-gray-300">Administra los Usuarios del sistema</p>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-6">
            {/* Estadísticas rápidas */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Usuarios</p>
                      <p className="text-2xl font-bold text-white">{userss.length}</p>
                    </div>
                    <Wrench className="w-8 h-8 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Activos</p>
                      <p className="text-2xl font-bold text-white">
                        {userss.length}
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
                      <p className="text-sm text-gray-400">Inactivos</p>
                      <p className="text-2xl font-bold text-white">
                        {userss.filter((t) => t.status === "En Campo").length}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Lista de Usuarios</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gestiona la información y estado de los Usuarios
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Completa la información del nuevo Usuario
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                              id="name"
                              value={newusers.name || ""}
                              onChange={(e) => setNewusers({ ...newusers, name: e.target.value })}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newusers.email || ""}
                              onChange={(e) => setNewusers({ ...newusers, email: e.target.value })}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                              id="phone"
                              value={newusers.phone || ""}
                              onChange={(e) => setNewusers({ ...newusers, phone: e.target.value })}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="specialization">Especialización</Label>
                            <Select
                              value={newusers.specialization}
                              onValueChange={(value) => setNewusers({ ...newusers, specialization: value })}
                            >
                              <SelectTrigger className="bg-gray-700 border-gray-600">
                                <SelectValue placeholder="Seleccionar especialización" />
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
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Zona de Trabajo</Label>
                          <Select
                            value={newusers.location}
                            onValueChange={(value) => setNewusers({ ...newusers, location: value })}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue placeholder="Seleccionar zona" />
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
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateusers} className="bg-gradient-to-r from-cyan-500 to-blue-600">
                          Crear Usuario
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar Usuarios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="En Campo">En Campo</SelectItem>
                      <SelectItem value="Ocupado">Ocupado</SelectItem>
                      <SelectItem value="Descanso">Descanso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border border-gray-700 bg-gray-800/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-200">Usuario</TableHead>
                        <TableHead className="text-gray-200">Contacto</TableHead>
                        <TableHead className="text-gray-200">Rol</TableHead>
                        <TableHead className="text-gray-200">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtereduserss.map((users) => (
                        <TableRow key={users.id} className="border-gray-700">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={users.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm">
                                  {users.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-medium">{users.name}</p>
                                <p className="text-xs text-gray-400">{users.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-200">
                                <Mail className="w-3 h-3 mr-1" />
                                {users.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-200">
                                <Phone className="w-3 h-3 mr-1" />
                                {users.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(users.status)} text-white`}>
                              {users.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedusers(users)
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
                                  setSelectedusers(users)
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
              <DialogTitle>Perfil del Usuario</DialogTitle>
              <DialogDescription className="text-gray-400">Información detallada del Usuario</DialogDescription>
            </DialogHeader>
            {selectedusers && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedusers.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg">
                      {selectedusers.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedusers.name}</h3>
                    <p className="text-gray-400">{selectedusers.id}</p>
                    <Badge className={`${getStatusColor(selectedusers.status)} text-white mt-1`}>
                      {selectedusers.status}
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
                          {selectedusers.email}
                        </div>
                        <div className="flex items-center text-white">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedusers.phone}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-400">Ubicación</Label>
                      <div className="flex items-center text-white mt-1">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedusers.location}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-400">Especialización</Label>
                      <p className="text-white mt-1">{selectedusers.specialization}</p>
                    </div>

                    <div>
                      <Label className="text-gray-400">Fecha de Ingreso</Label>
                      <div className="flex items-center text-white mt-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedusers.joinDate}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-white">{selectedusers.activeOrders}</p>
                      <p className="text-sm text-gray-400">Órdenes Activas</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-white">{selectedusers.completedOrders}</p>
                      <p className="text-sm text-gray-400">Completadas</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <p className="text-2xl font-bold text-white mr-1">{selectedusers.rating}</p>
                        <span className="text-yellow-400">⭐</span>
                      </div>
                      <p className="text-sm text-gray-400">Rating</p>
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
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription className="text-gray-400">Modifica la información del Usuario</DialogDescription>
            </DialogHeader>
            {selectedusers && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre Completo</Label>
                    <Input
                      id="edit-name"
                      value={selectedusers.name}
                      onChange={(e) => setSelectedusers({ ...selectedusers, name: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedusers.email}
                      onChange={(e) => setSelectedusers({ ...selectedusers, email: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Teléfono</Label>
                    <Input
                      id="edit-phone"
                      value={selectedusers.phone}
                      onChange={(e) => setSelectedusers({ ...selectedusers, phone: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Estado</Label>
                    <Select
                      value={selectedusers.status}
                      onValueChange={(value) => setSelectedusers({ ...selectedusers, status: value })}
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
                      value={selectedusers.specialization}
                      onValueChange={(value) => setSelectedusers({ ...selectedusers, specialization: value })}
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
                      value={selectedusers.location}
                      onValueChange={(value) => setSelectedusers({ ...selectedusers, location: value })}
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
              <Button onClick={handleEditusers} className="bg-gradient-to-r from-cyan-500 to-blue-600">
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
