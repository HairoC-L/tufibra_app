"use client"

import { useState, useEffect, use } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"


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
import { Plus, Search, MinusCircle, Printer, User, Building, UserIcon, MapPinIcon, BriefcaseIcon, PlusCircle } from "lucide-react"
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';


type tipo_comprobante = {
  id_tipo: number
  tipo: string
}

type deuda = {
  id: number
  ano_mes: string
  descripcion: string
  monto: number
}

type detallePago = {
  id: number
  ano_mes: string
  descripcion: string
  monto: number
}

interface Client {
  cli_id: string
  cli_tipo: string
  cli_nombre: string
  cli_apellido: string
  cli_razonsoci: string
  cli_dni: string
  cli_ruc: string
  cli_direccion: string
  cli_coordenada: string
  cli_cel: string
  num_con: string
  serv_nombre: string
  fecha_registro: string
  fecha_inicio: string
  estado: string
  usu_nombre: string
  id_tipo_comprobante: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])

  const [tipo_comrprobante, setTipoComprobante] = useState<tipo_comprobante[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [openModal, setOpenModal] = useState(false);

  const [deudas, setDeudas] = useState<deuda[]>([])
  const [detallePago, setDetallePago] = useState<detallePago[]>([]);


  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");

  const [showDetalleComprobante, setShowDetalleComprobante] = useState(false);



  const [newPago, setNewPago] = useState({
    id_tipo_compro: "",
    serie: "",
    correlativo: "",
    monto_total: "",
    medio_pago: "EFECTIVO",
    num_con: "",
    id_user: "",
  })


  const [id_user, setIdUser] = useState("");

  //Carga de tipos de comprobante
  useEffect(() => {
    const fetchTipoComprobante = async () => {
      try {
        const res = await fetch("/api/tipoComprobante")
        const data = await res.json()
        setTipoComprobante(data)
      } catch (err) {
        console.error("Error al cargar tipos de comprobante:", err)
      }
    }
    fetchTipoComprobante()
  }, [])




  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.cli_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cli_dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cli_razonsoci.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cli_ruc.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || client.estado === filterStatus
    return matchesSearch && matchesFilter
  })


  //Carga de clientes y contratos

  useEffect(() => {
    fetchClients();
  }, []);
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/cliente/clienteContrato");
      if (!res.ok) {
        console.error("Error al obtener información de los clientes:", res.status);
        return;
      }

      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };
  useEffect(() => {
    const nuevoTotal = detallePago.reduce((sum, d) => sum + d.monto, 0);
    setNewPago((prev) => ({
      ...prev,
      monto_total: nuevoTotal.toString(),
    }));
  }, [detallePago])




  useEffect(() => {
    const storedId = localStorage.getItem("userId") || "";
    setIdUser(storedId);
  }, []);

  useEffect(() => {
    if (id_user) {
      setNewPago((prev) => ({
        ...prev,
        id_user: id_user,
      }));
    }
  }, [id_user]);




  const handleSelectClient = async (client: Client) => {
    setSelectedClient(client);
    setOpenModal(true);

    try {
      const response = await fetch(`/api/caja/deudas/${client.num_con}`);
      if (!response.ok) throw new Error("Error al obtener deudas");

      const data = await response.json();
      setDeudas(data); // esto actualiza el estado con las deudas reales

      setDetallePago([]);
      setNewPago((prev) => ({
        ...prev,
        num_con: client.num_con,
      }));
    } catch (error) {
      console.error("Error cargando deudas:", error);
      // podrías mostrar una notificación de error aquí
    }
  };



  const subtotalDeudas = deudas
    .filter(d => !detallePago.find(p => p.id === d.id))
    .reduce((sum, d) => sum + d.monto, 0);

  const totalPago = detallePago.reduce((sum, d) => sum + d.monto, 0);


  const agregarUno = (deuda: deuda) => {
    if (!detallePago.find(p => p.id === deuda.id)) {
      setDetallePago([...detallePago, deuda]);
    }

  };

  const quitarUno = (id: number) => {
    setDetallePago(detallePago.filter(d => d.id !== id));
  };





  const handleGuardarPago = async () => {
    try {
      const res = await fetch("/api/caja/agregar_pago", {
        method: "POST",
        body: JSON.stringify({ ...newPago, detallePago }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Pago registrado correctamente");
      setOpenModal(false);
      setSelectedTipo("");
      setShowDetalleComprobante(false);
      setNewPago({
        id_tipo_compro: "",
        serie: "",
        correlativo: "",
        monto_total: "",
        medio_pago: "EFECTIVO",
        num_con: "",
        id_user: id_user,
      });
      fetchClients();
    } catch (error) {
      toast.error("Error inesperado al guardar pago");
      console.error("Error al registrar el pago:", error);
    }
  };


  const handleSelectTipo = async (id: string) => {
    const clienteTipo = selectedClient?.id_tipo_comprobante?.toString(); // si solo usas un cliente
    const idString = id.toString();

    if (clienteTipo && idString !== clienteTipo) {
      const confirmar = window.confirm(
        "Este usuario está registrado con otro tipo de comprobante. ¿Desea continuar?"
      );
      if (!confirmar) {
        return; // usuario canceló
      }
    }

    // Si confirma o es el mismo tipo
    setSelectedTipo(idString);
    setShowDetalleComprobante(false);

    try {
      const res = await fetch(`/api/caja/correlativo/${idString}`);
      if (!res.ok) throw new Error("Error al obtener comprobante");

      const data = await res.json();
      setNewPago((prev) => ({
        ...prev,
        id_tipo_compro: idString,
        serie: data.serie,
        correlativo: data.numero,
      }));
      setSerie(data.serie);
      setNumero(data.numero);
      setShowDetalleComprobante(true);
    } catch (error) {
      console.error("Error cargando comprobante:", error);
    }
  };




  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Caja</h1>
              <p className="text-sm text-gray-300">Gestiona el pago de los clientes</p>
            </div>
          </header>

          <div className="p-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Buscar Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="rounded-md border border-gray-700 bg-gray-800/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-200">Cliente</TableHead>
                        <TableHead className="text-gray-200">DNI/RUC</TableHead>
                        <TableHead className="text-gray-200">Direccion</TableHead>
                        <TableHead className="text-gray-200">Servicio</TableHead>
                        <TableHead className="text-gray-200">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.cli_id} onClick={() => handleSelectClient(client)} className="cursor-pointer hover:bg-gray-700/30 border-b-0">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-white font-medium">
                                  {client.cli_tipo === "JURIDICA"
                                    ? client.cli_razonsoci
                                    : `${client.cli_nombre} ${client.cli_apellido}`}
                                </p>
                                <p className="text-xs text-gray-400">{client.cli_id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-200">{client.cli_dni || client.cli_ruc || "-"}</TableCell>
                          <TableCell className="text-gray-200">{client.cli_direccion}</TableCell>
                          <TableCell className="text-gray-200">{client.serv_nombre}</TableCell>
                          <TableCell>
                            {client.estado === "1" ? (
                              <Badge className="text-white bg-green-600">ACTIVO</Badge>
                            ) : client.estado === "0" ? (
                              <Badge className="text-white bg-red-600">CORTADO</Badge>
                            ) : (
                              <Badge className="text-white bg-gray-500">SIN INFO</Badge>
                            )}
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


        {/* Modal de pago */}

        <Dialog open={openModal} onOpenChange={(isOpen) => {
          setOpenModal(isOpen);
          if (!isOpen) {
            setSelectedTipo("");
            setShowDetalleComprobante(false);
          }
        }}>
          <DialogContent className="max-w-5xl bg-gray-900 border border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>
                Procesa el pago de {selectedClient?.cli_tipo === "JURIDICA"
                  ? selectedClient?.cli_razonsoci
                  : `${selectedClient?.cli_nombre} ${selectedClient?.cli_apellido}`} - {selectedClient?.cli_id}
              </DialogTitle>
            </DialogHeader>

            {/* Aquí va TODO el contenido de pago que tenías antes en la vista */}

            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Tabla izquierda: Deudas */}
              <Card className="col-span-1 bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Deudas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Concepto</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-center">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deudas
                        .filter((d) => !detallePago.find((p) => p.id === d.id))
                        .map((deuda) => (
                          <TableRow key={deuda.id} className="border-b-0">
                            <TableCell className="py-0 text-gray-200">{deuda.ano_mes}</TableCell>
                            <TableCell className="py-0 text-gray-200 text-right">S/. {deuda.monto}</TableCell>
                            <TableCell className="py-0 text-center">
                              <Button variant="ghost" className="text-green-500 p-0" onClick={() => agregarUno(deuda)}>
                                <PlusCircle className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="py-1 text-gray-200 font-bold bg-gray-600">Subtotal</TableCell>
                        <TableCell className="py-1 text-gray-200 text-right font-bold bg-gray-600" colSpan={2}>
                          S/. {subtotalDeudas}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>

                </CardContent>
              </Card>


              {/* Tabla derecha: Detalle a Pagar */}
              <Card className="col-span-1 bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Detalle a Pagar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Concepto</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-center">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detallePago.map((item) => (
                        <TableRow key={item.id} className="border-b-0">
                          <TableCell className="py-0 text-gray-200">{item.ano_mes}</TableCell>
                          <TableCell className="py-0 text-gray-200 text-right">S/. {item.monto}</TableCell>
                          <TableCell className="py-0 text-center">
                            <Button variant="ghost" className="text-red-500" onClick={() => quitarUno(item.id)}>
                              <MinusCircle className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="py-1 text-gray-200 font-bold bg-gray-600">Total</TableCell>
                        <TableCell className="py-1 text-gray-200 text-right font-bold bg-gray-600" colSpan={2}>
                          S/. {totalPago}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>

                </CardContent>
              </Card>
            </div>

            {/* Comprobante y pago */}
            <div className="grid grid-cols-1 gap-4 mt-6">
              {/* Botones tipo de comprobante */}
              <div className="flex items-center justify-center gap-4">
                <Label className="text-white text-sm">Selecciona comprobante:</Label>

                {tipo_comrprobante.map((tipo) => {
                  const isClienteTipo = selectedClient?.id_tipo_comprobante?.toString() === tipo.id_tipo.toString();
                  const isSelected = selectedTipo === tipo.id_tipo.toString();

                  return (
                    <Button
                      key={tipo.id_tipo}
                      variant={isSelected ? "default" : "outline"}
                      className={`text-sm ${isSelected
                        ? "bg-green-500 text-white"
                        : isClienteTipo
                          ? "bg-blue-500 text-white border-gray-500"
                          : "bg-gray-700 text-white border-gray-500"
                        }`}
                      onClick={() => handleSelectTipo(tipo.id_tipo.toString())}
                    >
                      {tipo.tipo}
                    </Button>
                  );
                })}

              </div>

              {/* Mostrar serie, número, medio de pago y botón */}
              {showDetalleComprobante && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    {/* Serie y Número (lado izquierdo) */}
                    <div className="flex items-center space-x-6">
                      <div>
                        <Label className="text-white text-sm">Serie</Label>
                        <p className="text-white text-sm bg-gray-700 py-1 px-2 rounded">{serie}</p>
                      </div>
                      <div>
                        <Label className="text-white text-sm">Número</Label>
                        <p className="text-white text-sm bg-gray-700 py-1 px-2 rounded">{numero}</p>
                      </div>
                    </div>

                    {/* Medio de Pago (lado derecho) */}
                    <div className="w-full sm:w-auto flex-1 sm:flex-none">
                      <Label className="text-white text-sm mb-1 block">Medio de Pago</Label>
                      <Select value={newPago.medio_pago} onValueChange={(value) => setNewPago({ ...newPago, medio_pago: value })}>
                        <SelectTrigger className="bg-gray-700 text-white text-sm py-2 rounded w-full">
                          <SelectValue placeholder="Efectivo" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white">
                          <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                          <SelectItem value="YAPE">Yape</SelectItem>
                          <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleGuardarPago} className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                        <Printer className="w-5 h-5 mr-2" />
                        Imprimir / Guardar
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>


          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
