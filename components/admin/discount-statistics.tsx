"use client"

import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader2, TrendingUp, BarChart3, Tag, DollarSign, Plus, Search, Trash2 } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

interface DiscountCodeStats {
  id: number
  codigo: string
  porcentaje_descuento: number
  activo: boolean
  usos_maximos?: number
  veces_usado: number
  descripcion?: string
  created_at: string
  total_uses: number
  successful_uses: number
  pending_uses: number
  total_revenue: number
  total_discount_given: number
  average_order_value: number
}

interface DiscountStatsSummary {
  total_codes: number
  active_codes: number
  total_discount_given: number
  total_revenue_with_discounts: number
  total_successful_uses: number
}

interface StatsResponse {
  codes: DiscountCodeStats[]
  summary: DiscountStatsSummary
}

export interface DiscountStatisticsRef {
  refresh: () => void
}

export const DiscountStatistics = forwardRef<DiscountStatisticsRef>((props, ref) => {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const codesPerPage = 10

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [codeToDelete, setCodeToDelete] = useState<{ id: number; codigo: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state for new discount code
  const [newCode, setNewCode] = useState({
    codigo: "",
    porcentaje_descuento: "",
    usos_maximos: "",
    descripcion: "",
    activo: true,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/discount-stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("[admin] Error fetching discount stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Expose refresh function via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchStats
  }))

  const handleCreateCode = async () => {
    if (!newCode.codigo || !newCode.porcentaje_descuento) {
      alert("El código y el porcentaje de descuento son obligatorios")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/admin/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: newCode.codigo.toUpperCase(),
          porcentaje_descuento: parseInt(newCode.porcentaje_descuento),
          usos_maximos: newCode.usos_maximos ? parseInt(newCode.usos_maximos) : null,
          descripcion: newCode.descripcion || null,
          activo: newCode.activo,
        }),
      })

      if (response.ok) {
        alert("Código de descuento creado exitosamente")
        setIsCreateModalOpen(false)
        resetForm()
        fetchStats()
      } else {
        const error = await response.json()
        alert(error.error || "Error al crear código de descuento")
      }
    } catch (error) {
      console.error("[admin] Error creating discount code:", error)
      alert("Error al crear código de descuento")
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setNewCode({
      codigo: "",
      porcentaje_descuento: "",
      usos_maximos: "",
      descripcion: "",
      activo: true,
    })
  }

  const handleToggleActive = async (codeId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/discount-codes/${codeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !currentStatus }),
      })

      if (response.ok) {
        fetchStats()
      } else {
        const error = await response.json()
        alert(error.error || "Error al actualizar código de descuento")
      }
    } catch (error) {
      console.error("[admin] Error toggling discount code:", error)
      alert("Error al actualizar código de descuento")
    }
  }

  const openDeleteConfirmation = (codeId: number, codigo: string) => {
    setCodeToDelete({ id: codeId, codigo })
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!codeToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/discount-codes/${codeToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsDeleteModalOpen(false)
        setCodeToDelete(null)
        // Refresh the list from database
        await fetchStats()
      } else {
        const error = await response.json()
        console.error("[admin] Delete error:", error.error)
        // Keep modal open to show the error wasn't successful
        // User can try again or cancel
      }
    } catch (error) {
      console.error("[admin] Error deleting discount code:", error)
      // Keep modal open on error
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter codes based on search query
  const filteredCodes = stats?.codes.filter((code) => {
    const query = searchQuery.toLowerCase().trim()
    return (
      code.codigo.toLowerCase().includes(query) ||
      code.descripcion?.toLowerCase().includes(query)
    )
  }) || []

  // Pagination calculations
  const totalPages = Math.ceil(filteredCodes.length / codesPerPage)
  const startIndex = (currentPage - 1) * codesPerPage
  const endIndex = startIndex + codesPerPage
  const paginatedCodes = filteredCodes.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-12 text-muted-foreground">Error al cargar estadísticas</div>
  }

  // Combined chart data (Usage + Revenue)
  const combinedChartData = {
    labels: stats.codes.map((code) => code.codigo),
    datasets: [
      {
        label: "Ingresos ($)",
        data: stats.codes.map((code) => code.total_revenue),
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Usos Exitosos",
        data: stats.codes.map((code) => code.successful_uses),
        borderColor: "rgba(6, 182, 212, 1)",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Ingresos ($)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Usos Exitosos",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Códigos</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.total_codes}</div>
            <p className="text-xs text-muted-foreground">{stats.summary.active_codes} activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usos Exitosos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.total_successful_uses}</div>
            <p className="text-xs text-muted-foreground">Pedidos pagados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos con Descuento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.summary.total_revenue_with_discounts.toLocaleString("es-AR")}</div>
            <p className="text-xs text-muted-foreground">Total generado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descuento Otorgado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.summary.total_discount_given.toLocaleString("es-AR")}</div>
            <p className="text-xs text-muted-foreground">Total descontado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Pedido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {stats.summary.total_successful_uses > 0
                ? Math.round(stats.summary.total_revenue_with_discounts / stats.summary.total_successful_uses).toLocaleString(
                    "es-AR",
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Valor promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento de Códigos de Descuento</CardTitle>
          <CardDescription>Ingresos generados y usos exitosos por código</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line data={combinedChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Detalle de Códigos de Descuento</CardTitle>
              <CardDescription>Información detallada de cada código</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Input
                  type="text"
                  placeholder="Buscar código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pr-8"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 whitespace-nowrap">
                <Plus className="w-4 h-4" />
                Crear Código
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Usos Exitosos</TableHead>
                  <TableHead>Ingresos</TableHead>
                  <TableHead>Descuento Otorgado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {searchQuery ? "No se encontraron códigos con esa búsqueda" : "No hay códigos de descuento"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-semibold">{code.codigo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{code.porcentaje_descuento}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={code.activo ? "default" : "secondary"}>{code.activo ? "Activo" : "Inactivo"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{code.total_uses}</div>
                          {code.usos_maximos && (
                            <div className="text-muted-foreground text-xs">de {code.usos_maximos} máx.</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{code.successful_uses}</TableCell>
                      <TableCell className="font-semibold text-green-600">${code.total_revenue.toLocaleString("es-AR")}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        ${code.total_discount_given.toLocaleString("es-AR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant={code.activo ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleActive(code.id, code.activo)}
                          >
                            {code.activo ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteConfirmation(code.id, code.codigo)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {filteredCodes.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCodes.length)} de {filteredCodes.length} códigos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="text-sm font-medium px-3">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Discount Code Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Código de Descuento</DialogTitle>
            <DialogDescription>Complete los datos para crear un nuevo código de descuento</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigo"
                type="text"
                placeholder="Ej: VERANO2024"
                value={newCode.codigo}
                onChange={(e) => setNewCode({ ...newCode, codigo: e.target.value.toUpperCase() })}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="porcentaje">
                Porcentaje de Descuento (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="porcentaje"
                type="number"
                min="1"
                max="100"
                placeholder="Ej: 10"
                value={newCode.porcentaje_descuento}
                onChange={(e) => setNewCode({ ...newCode, porcentaje_descuento: e.target.value })}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usos_maximos">Usos Máximos (opcional)</Label>
              <Input
                id="usos_maximos"
                type="number"
                min="1"
                placeholder="Ej: 100"
                value={newCode.usos_maximos}
                onChange={(e) => setNewCode({ ...newCode, usos_maximos: e.target.value })}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Input
                id="descripcion"
                type="text"
                placeholder="Ej: Descuento para campaña de verano"
                value={newCode.descripcion}
                onChange={(e) => setNewCode({ ...newCode, descripcion: e.target.value })}
                disabled={isCreating}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activo"
                checked={newCode.activo}
                onChange={(e) => setNewCode({ ...newCode, activo: e.target.checked })}
                disabled={isCreating}
                className="w-4 h-4"
              />
              <Label htmlFor="activo" className="cursor-pointer">
                Código activo
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCode} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Código"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar el código de descuento <strong className="text-foreground">"{codeToDelete?.codigo}"</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Esta acción no se puede deshacer. El código será eliminado permanentemente de la base de datos.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setCodeToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar Código"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})

DiscountStatistics.displayName = "DiscountStatistics"
