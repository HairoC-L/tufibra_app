"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PieChart, Pie, Cell, Tooltip, Legend, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, BarChart } from 'recharts'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, User, Building, Clock, CheckCircle, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'



type OrderByType = {
  type: string
  count: number
  color: string
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
  id_serv: string
  serv_nombre: string
  fecha_registro: string
  fecha_inicio: string
  estado: string
  usu_nombre: string
  id_caja: string
  id_nodo: number
}

type PieDataItem = {
  type: string;
  count: number;
  color: string;
};

type NodoData = {
  nodo: string;
  cantidad: number;
};



//Para el grafico torta
const filters = [
  { label: 'Hoy', value: 'day' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
]

//Para el grafico de lineas
const orderTypes = [
  { label: 'Instalación', value: 'INSTALACION' },
  { label: 'Reconexión', value: 'RECONEXION' },
  { label: 'Corte', value: 'CORTE' },
]
const timeRanges = [
  { label: 'Última semana', value: 'week' },
  { label: 'Último mes', value: 'month' },
]


export default function DashboardPage() {
  const [userRole, setUserRole] = useState("")
  const [username, setUsername] = useState("")

  const [typeFilter, setTypeFilter] = useState('INSTALACION')
  const [rangeFilter, setRangeFilter] = useState('week')
  const [chartData, setChartData] = useState([])
  const [clients, setClients] = useState<Client[]>([])
  const [cantidaxservicio, setcantidaxservicio] = useState<PieDataItem[]>([]);


  const [cantidaxnodo, setcantidaxnodo] = useState<NodoData[]>([]);



  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#AF19FF', '#FF4560', '#00B8D9', '#FF66C3'
  ];


  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/dashboard/cantidadxnodo');
      const result = await res.json();
      setcantidaxnodo(result);
    };

    fetchData();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/dashboard/cantidadxservicio');
      const result = await res.json();



      const pieData: PieDataItem[] = result.map((item: any, index: number) => ({
        type: item.type,
        count: item.count,
        color: COLORS[index % COLORS.length], // asignar color ciclicamente
      }));

      setcantidaxservicio(pieData);
    };

    fetchData();
  }, []);


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
    const fetchData = async () => {
      const res = await fetch(`/api/ordenTrabajo/tendencia?type=${typeFilter}&range=${rangeFilter}`)
      const data = await res.json()
      setChartData(data)
    }
    fetchData()
  }, [typeFilter, rangeFilter])


  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
    setUsername(localStorage.getItem("username") || "")
  }, [])



  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

return (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl px-4">
          <SidebarTrigger className="-ml-1 text-white" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Dashboard - {userRole}</h1>
            <p className="text-sm text-slate-300">Bienvenido, {username}</p>
          </div>
        </header>
        <div className="flex-1 space-y-6 p-4 sm:p-6">
          {/* Estadísticas rápidas */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Clientes</p>
                    <p className="text-2xl font-bold text-white">{clients.length}</p>
                  </div>
                  <User className="w-8 h-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Activos</p>
                    <p className="text-2xl font-bold text-white">
                      {clients.filter((c) => c.estado === "1").length}
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
                    <p className="text-sm text-gray-400">Cortados</p>
                    <p className="text-2xl font-bold text-white">
                      {clients.filter((c) => c.estado === "0").length}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Nuevos (Este Mes)</p>
                    <p className="text-2xl font-bold text-white">
                      {
                        clients.filter((c) => {
                          const regDate = new Date(c.fecha_inicio)
                          const now = new Date()
                          return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear()
                        }).length
                      }
                    </p>
                  </div>
                  <Building className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 grid-cols-1">
            {/* Órdenes por tipo */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Cantidad de usuarios por servicio</CardTitle>
                <CardDescription className="text-slate-400"></CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col sm:flex-row items-center gap-8">
                <div className="w-full sm:w-[300px] flex justify-center items-center">
                  <PieChart width={300} height={300}>
                    <Pie
                      data={cantidaxservicio}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {cantidaxservicio.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>

                {/* Leyenda personalizada */}
                <div className="flex-1 space-y-4">
                  {cantidaxservicio.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-gray-200 dark:text-slate-200 text-sm">{item.type}</span>
                      </div>
                      <Badge variant="secondary" className="bg-slate-700 text-white">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Tendencia de Usuarios</CardTitle>
                    <CardDescription className="text-slate-400">
                      Instalaciones, Reconexiones y Cortes
                    </CardDescription>
                  </div>
                  <Select value={rangeFilter} onValueChange={setRangeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 mt-4">
                  {orderTypes.map((t) => (
                    <Button
                      key={t.value}
                      variant={typeFilter === t.value ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setTypeFilter(t.value)}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" stroke="#CBD5E1" />
                    <YAxis stroke="#CBD5E1" />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Cantidad de usuarios por Nodo</CardTitle>
                <CardDescription className="text-slate-400"></CardDescription>
              </CardHeader>
              <CardContent className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cantidaxnodo}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="0 0" vertical={false} horizontal={false} />
                    <XAxis dataKey="nodo" tick={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [`${value}`, 'Contratos Activos']}
                      labelFormatter={(label: any) => `Nodo: ${label}`}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="cantidad" name="Contratos Activos">
                      {cantidaxnodo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
)

}
