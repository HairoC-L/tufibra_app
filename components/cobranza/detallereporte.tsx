import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DetalleModalProps {
  abierto: boolean
  onClose: () => void
  datos: any[]
}

export default function DetalleModal({ abierto, onClose, datos }: DetalleModalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Pagination logic
  const totalPages = Math.ceil(datos.length / rowsPerPage)
  const paginatedDatos = datos.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  // Reset to first page when data changes or rows per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [datos, rowsPerPage])

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent
        className="
          bg-gray-900 border-gray-700 text-gray-100 
          w-full max-w-4xl h-full max-h-[90vh] p-4
          md:rounded-lg md:h-auto md:max-h-[70vh]
          flex flex-col
        "
      >
        <DialogHeader>
          <DialogTitle>Detalle del Reporte</DialogTitle>
        </DialogHeader>

        {/* Contenedor scroll horizontal para la tabla */}
        <div className="overflow-x-auto flex-grow mt-4">
          <table className="w-full min-w-[700px] text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 border border-gray-700 whitespace-nowrap">N° Comprobante</th>
                <th className="p-2 border border-gray-700 whitespace-nowrap">Fecha</th>
                <th className="p-2 border border-gray-700 whitespace-nowrap">Cliente</th>
                <th className="p-2 border border-gray-700 whitespace-nowrap">Monto</th>
                <th className="p-2 border border-gray-700 whitespace-nowrap">Comprobante</th>
                <th className="p-2 border border-gray-700 whitespace-nowrap">Método</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDatos.map((item, i) => (
                <tr key={i} className="odd:bg-gray-800 even:bg-gray-700">
                  <td className="p-2 border border-gray-700 whitespace-nowrap">{item.codigo}</td>                 
                  <td className="p-2 border border-gray-700 whitespace-nowrap">{item.fecha}</td>
                  <td className="p-2 border border-gray-700 whitespace-nowrap">{item.cliente}</td>
                  <td className="p-2 border border-gray-700 whitespace-nowrap">S/ {Number(item.monto).toFixed(2)}</td>
                  <td className="p-2 border border-gray-700 whitespace-nowrap">{item.tipo_doc}</td>
                  <td className="p-2 border border-gray-700 whitespace-nowrap">{item.metodo_pago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Mostrando {datos.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} a{" "}
            {Math.min(currentPage * rowsPerPage, datos.length)} de{" "}
            {datos.length} registros
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-400">Filas</p>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => setRowsPerPage(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px] bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder={rowsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  {[10, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600 h-8"
              >
                Ant.
              </Button>
              <div className="flex items-center justify-center text-sm font-medium text-white px-2">
                {currentPage} / {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600 h-8"
              >
                Sig.
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
