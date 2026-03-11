"use client"

import { useState, useEffect, useRef } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, AlertTriangle, Wrench, CheckCircle, Eye, PlusCircle, MapPin as MapPinIcon, ChevronLeft, ChevronRight, Folder } from "lucide-react"
import { toast } from 'react-toastify';
import { ImageViewer } from "@/components/ImageViewer";
import { MapLocationPicker } from "@/components/MapLocationPicker";
import { CameraCaptureModal } from "@/components/CameraCaptureModal";
import { compressImage } from "@/lib/image-utils";

interface WorkOrder {
  id: string
  client: string
  type: string
  status: string
  priority: string
  technician: string
  createdDate: string
  scheduledDate: string
  description: string
  address: string
  id_tec: string
  cli_foto_fachada: string
  ppp_user?: string
  ord_foto_nap?: string
  ord_foto_ont?: string
  ord_foto_dni?: string
  ord_coordenada?: string
}

export default function OrdersPage() {

  const [id_user, setIdUser] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("userId") || "";
    setIdUser(storedId);
  }, []);

  useEffect(() => {
    if (id_user !== "") {
      fetchOrdenesTrabajo();
    }
  }, [id_user]);


  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("Pendiente")
  const [filterType, setFilterType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState("");

  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [startPhoto, setStartPhoto] = useState<File | null>(null);
  const [ontPhoto, setOntPhoto] = useState<File | null>(null);
  const [dniPhoto, setDniPhoto] = useState<File | null>(null);
  const [finishCoords, setFinishCoords] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Estados para la Cámara en vivo
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"nap" | "ont" | "dni" | null>(null);

  const handleCapture = async (file: File) => {
    try {
      const compressed = await compressImage(file);
      if (cameraTarget === "nap") setStartPhoto(compressed);
      else if (cameraTarget === "ont") setOntPhoto(compressed);
      else if (cameraTarget === "dni") setDniPhoto(compressed);
    } catch (error) {
      console.error("Error compressing captured image:", error);
      // Failsafe: use original if compression fails
      if (cameraTarget === "nap") setStartPhoto(file);
      else if (cameraTarget === "ont") setOntPhoto(file);
      else if (cameraTarget === "dni") setDniPhoto(file);
    }
    setIsCameraOpen(false);
  };

  const openCamera = (target: "nap" | "ont" | "dni") => {
    setCameraTarget(target);
    setIsCameraOpen(true);
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalizado":
        return "bg-green-500"
      case "En proceso":
        return "bg-blue-500"
      case "Pendiente":
        return "bg-yellow-500"
      case "Cancelada":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }


  const fetchOrdenesTrabajo = async () => {
    try {
      const res = await fetch("/api/ordenTrabajo");
      if (!res.ok) {
        toast.error("Error al obtener las ordenes de trabajo");
        return;
      }

      const data = await res.json();

      // Solo mantener las órdenes del técnico logueado
      const filtered = data.filter((order: WorkOrder) => String(order.id_tec) === String(id_user));

      setOrders(filtered);
    } catch (err) {
      toast.error("Error parsing JSON");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-500"
      case "Media":
        return "bg-yellow-500"
      case "Baja":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.scheduledDate.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
      order.priority.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    const matchesFilter = filterStatus === "all" || order.status === filterStatus
    const matchesType = filterStatus !== "Finalizado" || filterType === "all" || order.type === filterType
    return matchesSearch && matchesFilter && matchesType
  })

  // Lógica de Paginación
  const indexOfLastOrder = currentPage * rowsPerPage
  const indexOfFirstOrder = indexOfLastOrder - rowsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const getStatusStep = (status: string) => {
    const steps = ['Pendiente', 'En proceso', 'Finalizado'];
    return steps.indexOf(status);
  };

  const handleStepClick = (newStatus: string) => {
    // Aquí puedes cambiar el estado o hacer una llamada a una API
    console.log("Nuevo estado:", newStatus);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'Pendiente':
        return <AlertTriangle size={20} />;
      case 'En proceso':
        return <Wrench size={20} />;
      case 'Finalizado':
        return <CheckCircle size={20} />;
      default:
        return null;
    }
  };

  const handleActualizarEstado = async (ord_id: any, estado: any, extraData: any = {}) => {
    try {
      const res = await fetch("/api/ordenTrabajo/actualizar_estado", {
        method: "POST",
        body: JSON.stringify({
          ord_id: ord_id,  // ID de la orden
          estado: estado,  // El nuevo estado
          ...extraData
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.error) {
        toast.error(`Error: ${data.error}`);
        return false;
      } else {
        toast.success("Orden Actualizada");
        await fetchOrdenesTrabajo(); // Actualiza la lista de órdenes
        return true;
      }
    } catch (error) {
      toast.error("Error al actualizar la orden de trabajo");
      return false;
    }
  };

  const handleUploadPhoto = async (ord_id: string, file: File, type: string) => {
    const formData = new FormData();
    
    // Asegurar compresión también aquí por si viene de galería
    let finalFile = file;
    try {
      finalFile = await compressImage(file);
    } catch (e) {
      console.error("Error al comprimir archivo de galería:", e);
    }

    formData.append("file", finalFile);
    formData.append("ord_id", ord_id);
    formData.append("photo_type", type);

    try {
      const res = await fetch("/api/upload/order", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        toast.error(`Error al subir foto ${type}: ${data.error}`);
        return false;
      }
      return true;
    } catch (error) {
      toast.error(`Error de red al subir foto ${type}`);
      return false;
    }
  };

  const handleStartOrder = async () => {
    if (!selectedOrder) return;

    const isInstalacion = selectedOrder.type === "INSTALACION";

    if (isInstalacion && !startPhoto) {
      toast.error("Debe tomar la foto de la caja NAP");
      return;
    }

    setIsUploading(true);

    let uploaded = true;
    if (isInstalacion && startPhoto) {
      uploaded = await handleUploadPhoto(selectedOrder.id, startPhoto, "nap");
    }

    if (uploaded) {
      const updated = await handleActualizarEstado(selectedOrder.id, 2);
      if (updated) {
        setIsStartModalOpen(false);
        setStartPhoto(null);
      }
    }
    setIsUploading(false);
  };

  const handleFinishOrder = async () => {
    if (!selectedOrder) return;

    const isInstalacion = selectedOrder.type === "INSTALACION";

    if (isInstalacion && (!ontPhoto || !dniPhoto || !finishCoords)) {
      toast.error("Complete todos los campos requeridos (Fotos y Coordenadas)");
      return;
    }

    setIsUploading(true);

    let uploaded = true;
    if (isInstalacion) {
      const uploadedOnt = await handleUploadPhoto(selectedOrder.id, ontPhoto!, "ont");
      const uploadedDni = await handleUploadPhoto(selectedOrder.id, dniPhoto!, "dni");
      uploaded = uploadedOnt && uploadedDni;
    }

    if (uploaded) {
      const updated = await handleActualizarEstado(selectedOrder.id, 3, { 
        ord_coordenada: isInstalacion ? finishCoords : null 
      });
      if (updated) {
        setIsFinishModalOpen(false);
        setOntPhoto(null);
        setDniPhoto(null);
        setFinishCoords("");
      }
    }
    setIsUploading(false);
  };

  const obtenerUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
          setFinishCoords(coords);
          toast.info("Ubicación capturada");
        },
        (error) => {
          console.error("Error al obtener ubicación:", error);
          toast.error("No se pudo obtener la ubicación.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocalización no disponible.");
    }
  };


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Gestión de Órdenes de Trabajo</h1>
              <p className="text-sm text-gray-400">Administra todas las órdenes de trabajo</p>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Órdenes de Trabajo</CardTitle>
                    <CardDescription className="text-gray-400">
                      Haz seguimiento de las ordenes que se te asignaron
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por cliente, tipo de trabajo, fecha programada, prioridad..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-gray-300">
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En proceso">En proceso</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Filtro por Tipo (Solo para Finalizados) */}
                  {filterStatus === "Finalizado" && (
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-56 bg-slate-700/50 border-slate-600 text-white">
                        <Wrench className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-gray-300">
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        {Array.from(new Set(orders.map(o => o.type))).map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="rounded-md border border-gray-700 bg-gray-800/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-200">Cliente</TableHead>
                        <TableHead className="text-gray-200">Tipo</TableHead>
                        <TableHead className="text-gray-200">Estado</TableHead>
                        <TableHead className="text-gray-200">Prioridad</TableHead>
                        <TableHead className="text-gray-200">Técnico</TableHead>
                        <TableHead className="text-gray-200">Fecha Programada</TableHead>
                        <TableHead className="text-gray-200">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow key={order.id} className="border-gray-700">
                          <TableCell className="text-gray-200 font-medium">{order.client}</TableCell>
                          <TableCell className="text-gray-200">{order.type}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(order.status)} text-white`}>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-200">{order.priority}</TableCell>
                          <TableCell className="text-gray-200">{order.technician}</TableCell>
                          <TableCell className="text-gray-200">{order.scheduledDate}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {order.status === "Pendiente" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setIsStartModalOpen(true);
                                  }}
                                >
                                  Iniciar
                                </Button>
                              )}
                              {order.status === "En proceso" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white border-none"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setIsFinishModalOpen(true);
                                  }}
                                >
                                  Finalizar
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-slate-700 hover:bg-slate-600 text-white border-none"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsViewModalOpen(true)
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Controles de Paginación */}
                <div className="flex items-center justify-between mt-6 px-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">Mostrar</span>
                    <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}>
                      <SelectTrigger className="w-20 bg-slate-700/50 border-slate-600 text-white h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-gray-300">
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="40">40</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-400">filas por página</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => paginate(currentPage - 1)}
                      className="bg-slate-700 hover:bg-slate-600 text-white border-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-sm text-gray-400 mx-2">
                      Página {currentPage} de {totalPages || 1}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => paginate(currentPage + 1)}
                      className="bg-slate-700 hover:bg-slate-600 text-white border-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Modal de visualización */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles de la Orden de Trabajo</DialogTitle>
              <DialogDescription className="text-gray-400">
                Información completa de la orden {selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Cliente</Label>
                    <p className="text-white font-semibold">{selectedOrder.client}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Usuario PPP (Mikrotik)</Label>
                    <p className="text-blue-400 font-mono font-bold tracking-wider">{selectedOrder.ppp_user || "SIN USUARIO"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Tipo de Trabajo</Label>
                    <p className="text-white">{selectedOrder.type}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Estado</Label>
                    <Badge className={`${getStatusColor(selectedOrder.status)} text-white mt-1`}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Prioridad</Label>
                    <Badge className={`${getPriorityColor(selectedOrder.priority)} text-white mt-1`}>
                      {selectedOrder.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-400">Técnico Asignado</Label>
                    <p className="text-white">{selectedOrder.technician}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Fecha Programada</Label>
                    <p className="text-white">{selectedOrder.scheduledDate}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Dirección</Label>
                    <p className="text-white">{selectedOrder.address}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">Descripción</Label>
                  <p className="text-white">{selectedOrder.description}</p>
                </div>

                {selectedOrder.cli_foto_fachada && (
                  <div className="mt-4">
                    <Label className="text-gray-400 mb-2 block">Foto de Fachada (Click para ampliar)</Label>
                    <div 
                      className="relative w-full h-48 sm:h-64 rounded-md overflow-hidden border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors group"
                      onClick={() => {
                        setViewingPhotoUrl(`/api/foto/${selectedOrder.cli_foto_fachada}`)
                        setIsImageViewerOpen(true)
                      }}
                    >
                      <img
                        src={`/api/foto/${selectedOrder.cli_foto_fachada}`}
                        alt="Fachada"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PlusCircle className="text-white w-8 h-8" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder && (
                  <div className="mt-6">
                    <Label className="text-gray-400 mb-2 block">Seguimiento</Label>
                    <div className="flex items-center justify-between relative">
                      {['Pendiente', 'En proceso', 'Finalizado'].map((step, index) => {
                        const isActive = index <= getStatusStep(selectedOrder.status);
                        return (
                          <div
                            key={step}
                            className="flex flex-col items-center cursor-pointer z-10"
                            onClick={() => handleStepClick(step)}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center
                              ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                              {getStepIcon(step)}
                            </div>
                            <span className="text-sm mt-1 text-gray-300">{step}</span>
                          </div>
                        );
                      })}
                      <div className="absolute top-5 left-5 right-5 h-1 bg-gray-600 z-0">
                        <div
                          className="h-1 bg-blue-500 transition-all duration-300"
                          style={{ width: `${(getStatusStep(selectedOrder.status) / 2) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {selectedOrder.ord_foto_nap && (
                    <div>
                      <Label className="text-gray-400 mb-2 block text-xs">Foto NAP</Label>
                      <img 
                        src={`/api/foto/${selectedOrder.ord_foto_nap}`} 
                        className="w-full h-24 object-cover rounded border border-gray-700 cursor-pointer"
                        onClick={() => {
                          setViewingPhotoUrl(`/api/foto/${selectedOrder.ord_foto_nap}`)
                          setIsImageViewerOpen(true)
                        }}
                      />
                    </div>
                  )}
                  {selectedOrder.ord_foto_ont && (
                    <div>
                      <Label className="text-gray-400 mb-2 block text-xs">Foto ONT</Label>
                      <img 
                        src={`/api/foto/${selectedOrder.ord_foto_ont}`} 
                        className="w-full h-24 object-cover rounded border border-gray-700 cursor-pointer"
                        onClick={() => {
                          setViewingPhotoUrl(`/api/foto/${selectedOrder.ord_foto_ont}`)
                          setIsImageViewerOpen(true)
                        }}
                      />
                    </div>
                  )}
                  {selectedOrder.ord_foto_dni && (
                    <div>
                      <Label className="text-gray-400 mb-2 block text-xs">Foto DNI</Label>
                      <img 
                        src={`/api/foto/${selectedOrder.ord_foto_dni}`} 
                        className="w-full h-24 object-cover rounded border border-gray-700 cursor-pointer"
                        onClick={() => {
                          setViewingPhotoUrl(`/api/foto/${selectedOrder.ord_foto_dni}`)
                          setIsImageViewerOpen(true)
                        }}
                      />
                    </div>
                  )}
                </div>
                {selectedOrder.ord_coordenada && (
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3 text-blue-400" />
                    <span className="font-semibold text-gray-300">Ubicación guardada:</span> {selectedOrder.ord_coordenada}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ImageViewer 
          src={viewingPhotoUrl}
          alt="Foto Detalle"
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
        />

        {/* Modal para Iniciar Orden (NAP) */}
        <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Iniciar {selectedOrder?.type === "INSTALACION" ? "Instalación" : "Trabajo"}</DialogTitle>
              <DialogDescription>
                {selectedOrder?.type === "INSTALACION" 
                  ? "Capture la foto de la caja NAP para comenzar" 
                  : `¿Desea iniciar este trabajo de ${selectedOrder?.type}?`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {selectedOrder?.type === "INSTALACION" && (
                <div className="flex flex-col items-center justify-center gap-4">
                  {/* Inputs ocultos */}
                  <input 
                    type="file" 
                    id="nap-gallery"
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => setStartPhoto(e.target.files?.[0] || null)}
                  />
                  
                  {startPhoto ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-blue-500 bg-slate-900">
                      <img 
                        src={URL.createObjectURL(startPhoto)} 
                        className="w-full h-full object-contain"
                        alt="Preview NAP"
                      />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full z-20 shadow-lg"
                        onClick={() => setStartPhoto(null)}
                      >
                        X
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <Button 
                        type="button"
                        onClick={() => openCamera("nap")}
                        className="h-32 rounded-xl bg-slate-700 hover:bg-slate-600 border-2 border-dashed border-blue-500/50 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                      >
                        <PlusCircle className="w-8 h-8 text-blue-400" />
                        <span className="text-[10px] font-bold uppercase">Tomar Foto</span>
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => document.getElementById('nap-gallery')?.click()}
                        className="h-32 rounded-xl bg-slate-700 hover:bg-slate-600 border-2 border-dashed border-purple-500/50 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                      >
                        <Folder className="w-8 h-8 text-purple-400" />
                        <span className="text-[10px] font-bold uppercase">De Galería</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={handleStartOrder} 
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold shadow-lg"
                disabled={isUploading || (selectedOrder?.type === "INSTALACION" && !startPhoto)}
              >
                {isUploading ? "Subiendo..." : "✓ INICIAR TRABAJO"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para Finalizar Orden (ONT, DNI, GPS) */}
        <Dialog open={isFinishModalOpen} onOpenChange={setIsFinishModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Finalizar {selectedOrder?.type === "INSTALACION" ? "Instalación" : "Trabajo"}</DialogTitle>
              <DialogDescription>
                {selectedOrder?.type === "INSTALACION" 
                  ? "Complete los datos finales del servicio" 
                  : `¿Desea finalizar este trabajo de ${selectedOrder?.type}?`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {selectedOrder?.type === "INSTALACION" ? (
                <>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-gray-700 shadow-inner">
                    <Label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Ubicación GPS</Label>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-green-400 font-mono overflow-hidden whitespace-nowrap">
                        {finishCoords || "Pendiente..."}
                      </div>
                      <Button onClick={obtenerUbicacion} className="bg-blue-600 hover:bg-blue-700 px-3 transition-transform active:scale-90" title="Obtener GPS">
                        <MapPinIcon className="w-5 h-5" />
                      </Button>
                    </div>
                    <MapLocationPicker 
                      initialCoords={finishCoords} 
                      onSelect={(coords) => setFinishCoords(coords)}
                      buttonText="Seleccionar en Mapa"
                      variant="secondary"
                    />
                  </div>

                  {/* Inputs de Galería ocultos para Finalizar */}
                  <input type="file" id="ont-gallery" accept="image/*" className="hidden" onChange={(e) => setOntPhoto(e.target.files?.[0] || null)} />
                  <input type="file" id="dni-gallery" accept="image/*" className="hidden" onChange={(e) => setDniPhoto(e.target.files?.[0] || null)} />

                  <div className="space-y-4">
                    {/* Sección ONT */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-gray-400 ml-1">Foto ONT</Label>
                      {ontPhoto ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-green-500 bg-slate-900">
                          <img src={URL.createObjectURL(ontPhoto)} className="w-full h-full object-contain" />
                          <Button 
                            variant="destructive" size="sm" className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full text-[10px] z-20"
                            onClick={() => setOntPhoto(null)}
                          >
                            X
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            onClick={() => openCamera("ont")}
                            className="h-20 rounded-lg bg-slate-700 hover:bg-slate-600 border border-gray-600 flex flex-col items-center justify-center gap-1"
                          >
                            <PlusCircle className="w-5 h-5 text-green-400" />
                            <span className="text-[9px] font-bold">CÁMARA</span>
                          </Button>
                          <Button 
                            onClick={() => document.getElementById('ont-gallery')?.click()}
                            className="h-20 rounded-lg bg-slate-700 hover:bg-slate-600 border border-gray-600 flex flex-col items-center justify-center gap-1"
                          >
                            <Folder className="w-5 h-5 text-purple-400" />
                            <span className="text-[9px] font-bold">GALERÍA</span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Sección DNI */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-gray-400 ml-1">Foto DNI</Label>
                      {dniPhoto ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-green-500 bg-slate-900">
                          <img src={URL.createObjectURL(dniPhoto)} className="w-full h-full object-contain" />
                          <Button 
                            variant="destructive" size="sm" className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full text-[10px] z-20"
                            onClick={() => setDniPhoto(null)}
                          >
                            X
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            onClick={() => openCamera("dni")}
                            className="h-20 rounded-lg bg-slate-700 hover:bg-slate-600 border border-gray-600 flex flex-col items-center justify-center gap-1"
                          >
                            <PlusCircle className="w-5 h-5 text-green-400" />
                            <span className="text-[9px] font-bold">CÁMARA</span>
                          </Button>
                          <Button 
                            onClick={() => document.getElementById('dni-gallery')?.click()}
                            className="h-20 rounded-lg bg-slate-700 hover:bg-slate-600 border border-gray-600 flex flex-col items-center justify-center gap-1"
                          >
                            <Folder className="w-5 h-5 text-purple-400" />
                            <span className="text-[9px] font-bold">GALERÍA</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}

              <Button 
                onClick={handleFinishOrder} 
                className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg font-bold mt-4"
                disabled={isUploading || (selectedOrder?.type === "INSTALACION" && (!ontPhoto || !dniPhoto || !finishCoords))}
              >
                {isUploading ? "Subiendo..." : "✓ FINALIZAR TRABAJO"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <CameraCaptureModal 
          isOpen={isCameraOpen} 
          onClose={() => setIsCameraOpen(false)} 
          onCapture={handleCapture}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
