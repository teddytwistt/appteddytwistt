"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Package, TrendingUp, Clock, CheckCircle, XCircle, Search, User, Phone, Mail, MapPin, FileText, ShoppingBag, LogOut, BarChart3 } from "lucide-react"
import type { PedidoCompleto, StockStatus, Cliente } from "@/lib/types"
import { formatArgentinaDateTime } from "@/lib/utils/timezone"
import { DiscountStatistics } from "@/components/admin/discount-statistics"
import { GeneralStatistics } from "@/components/admin/general-statistics"

type TabType = "orders" | "discount-stats" | "general-stats"

export default function AdminPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PedidoCompleto[]>([])
  const [filteredOrders, setFilteredOrders] = useState<PedidoCompleto[]>([])
  const [stockStatus, setStockStatus] = useState<StockStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [estadoPagoFilter, setEstadoPagoFilter] = useState<string>("all")
  const [estadoEnvioFilter, setEstadoEnvioFilter] = useState<string>("all")

  // Estado para tabs
  const [activeTab, setActiveTab] = useState<TabType>("orders")

  // Estados para modal de detalles del pedido
  const [selectedOrder, setSelectedOrder] = useState<PedidoCompleto | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Estado para buscador de pedidos
  const [searchQuery, setSearchQuery] = useState("")

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
    setCurrentPage(1) // Reset to first page when filters change
  }, [orders, estadoPagoFilter, estadoEnvioFilter, searchQuery])

  // Bloquear scroll del body cuando el modal de detalles está abierto
  useEffect(() => {
    if (isDetailsModalOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)'
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isDetailsModalOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [ordersRes, stockRes] = await Promise.all([fetch("/api/admin/orders"), fetch("/api/stock")])

      const ordersData = await ordersRes.json()
      const stockData = await stockRes.json()

      setOrders(ordersData.orders || [])
      setStockStatus(stockData)
    } catch (error) {
      console.error("[admin] Error fetching admin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...orders]

    // Filtro por estado de pago
    if (estadoPagoFilter !== "all") {
      filtered = filtered.filter((order) => order.estado_pago === estadoPagoFilter)
    }

    // Filtro por estado de envío
    if (estadoEnvioFilter !== "all") {
      filtered = filtered.filter((order) => order.estado_envio === estadoEnvioFilter)
    }

    // Búsqueda por ID de pedido o nombre de cliente
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((order) => {
        // Buscar por ID de pedido
        const matchesId = order.id.toString().includes(query)
        // Buscar por nombre del cliente
        const matchesName = order.cliente?.nombre_apellido?.toLowerCase().includes(query)
        return matchesId || matchesName
      })
    }

    setFilteredOrders(filtered)
  }

  const updateEstadoEnvio = async (orderId: number, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado_envio: nuevoEstado }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("[admin] Error updating order:", error)
    }
  }


  const openOrderDetails = (order: PedidoCompleto) => {
    setSelectedOrder(order)
    setIsDetailsModalOpen(true)
  }

  const formatDateTime = (dateString: string) => {
    return formatArgentinaDateTime(dateString)
  }

  const getEstadoPagoBadge = (estado: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pagado: { variant: "default", icon: CheckCircle },
      pendiente: { variant: "secondary", icon: Clock },
      fallido: { variant: "destructive", icon: XCircle },
      reembolsado: { variant: "outline", icon: XCircle },
    }

    const config = variants[estado] || variants.pendiente
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {estado}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  const totalVentas = orders.filter((o) => o.estado_pago === "pagado").reduce((sum, o) => sum + o.monto_final, 0)
  const pedidosPendientes = orders.filter((o) => o.estado_envio === "pendiente" && o.estado_pago === "pagado").length

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const endIndex = startIndex + ordersPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black">Panel Administrativo</h1>
            <p className="text-muted-foreground">Gestión de pedidos Buzzy Twist</p>
          </div>

          <div className="flex gap-2">
            {activeTab === "orders" && (
              <Button onClick={fetchData} variant="outline">
                Actualizar
              </Button>
            )}
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            className="gap-2 whitespace-nowrap"
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag className="w-4 h-4" />
            Pedidos
          </Button>
          <Button
            variant={activeTab === "general-stats" ? "default" : "ghost"}
            className="gap-2 whitespace-nowrap"
            onClick={() => setActiveTab("general-stats")}
          >
            <TrendingUp className="w-4 h-4" />
            Estadísticas Generales
          </Button>
          <Button
            variant={activeTab === "discount-stats" ? "default" : "ghost"}
            className="gap-2 whitespace-nowrap"
            onClick={() => setActiveTab("discount-stats")}
          >
            <BarChart3 className="w-4 h-4" />
            Códigos de Descuento
          </Button>
        </div>

        {/* Orders View */}
        {activeTab === "orders" && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Disponible</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockStatus?.disponibles || 0}</div>
              <p className="text-xs text-muted-foreground">de {stockStatus?.stock_inicial || 900} unidades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unidades Vendidas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockStatus?.vendidos || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stockStatus ? Math.round((stockStatus.vendidos / stockStatus.stock_inicial) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalVentas.toLocaleString("es-AR")}</div>
              <p className="text-xs text-muted-foreground">Pagos aprobados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Envíos Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidosPendientes}</div>
              <p className="text-xs text-muted-foreground">Por despachar</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              {/* Título y Buscador */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Pedidos</CardTitle>
                  <CardDescription>Lista completa de pedidos y su estado</CardDescription>
                </div>

                {/* Buscador de pedidos */}
                <div className="flex gap-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar por ID o nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pr-8"
                    />
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  {searchQuery && (
                    <Button
                      onClick={() => setSearchQuery("")}
                      variant="ghost"
                      size="sm"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <span className="text-sm text-muted-foreground font-medium">Filtrar por:</span>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground pl-1">Estado de Pago</label>
                    <Select value={estadoPagoFilter} onValueChange={setEstadoPagoFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los pagos</SelectItem>
                        <SelectItem value="pagado">Pagado</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="fallido">Fallido</SelectItem>
                        <SelectItem value="reembolsado">Reembolsado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground pl-1">Estado de Envío</label>
                    <Select value={estadoEnvioFilter} onValueChange={setEstadoEnvioFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los envíos</SelectItem>
                        <SelectItem value="pendiente">Por enviar</SelectItem>
                        <SelectItem value="enviado">En camino</SelectItem>
                        <SelectItem value="entregado">Entregado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Envío</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        {searchQuery ? "No se encontraron pedidos con esa búsqueda" : "No hay pedidos que mostrar"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          #{order.id}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDateTime(order.fecha_creacion)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{order.cliente?.nombre_apellido || "-"}</div>
                            <div className="text-muted-foreground text-xs">{order.cliente?.email || "-"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.zona === "cba" ? "Córdoba" : "Interior"}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">${order.monto_final.toLocaleString("es-AR")}</TableCell>
                        <TableCell>{getEstadoPagoBadge(order.estado_pago)}</TableCell>
                        <TableCell>
                          <Select
                            value={order.estado_envio}
                            onValueChange={(value) => updateEstadoEnvio(order.id, value)}
                            disabled={order.estado_pago !== "pagado"}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="enviado">Enviado</SelectItem>
                              <SelectItem value="entregado">Entregado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openOrderDetails(order)}
                          >
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {filteredOrders.length > 0 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredOrders.length)} de {filteredOrders.length} pedidos
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
          </>
        )}

        {/* General Statistics View */}
        {activeTab === "general-stats" && <GeneralStatistics />}

        {/* Discount Statistics View */}
        {activeTab === "discount-stats" && <DiscountStatistics />}
      </div>

      {/* Modal de Detalles del Pedido */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Detalles del Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>Información completa del pedido</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 overflow-y-auto pr-2 -mr-2 flex-1 min-h-0" style={{ overscrollBehavior: 'contain' }}>
              {/* Información del Pedido */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Información del Pedido
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">ID Pedido</p>
                    <p className="font-mono">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Número de Serie</p>
                    <p className="font-mono">{selectedOrder.unidad?.numero_serie || "Pendiente"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-xs break-all">{selectedOrder.payment_id || "Pendiente"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Preference ID</p>
                    <p className="font-mono text-xs break-all">{selectedOrder.preference_id || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Zona</p>
                    <Badge variant="outline">{selectedOrder.zona === "cba" ? "Córdoba Capital" : "Resto del país"}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fecha de Creación</p>
                    <p>{formatDateTime(selectedOrder.fecha_creacion)}</p>
                  </div>
                  {selectedOrder.fecha_pago && (
                    <div>
                      <p className="text-muted-foreground">Fecha de Pago</p>
                      <p>{formatDateTime(selectedOrder.fecha_pago)}</p>
                    </div>
                  )}
                  {selectedOrder.fecha_envio && (
                    <div>
                      <p className="text-muted-foreground">Fecha de Envío</p>
                      <p>{formatDateTime(selectedOrder.fecha_envio)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Montos */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Montos</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Monto Original</p>
                    <p className="font-semibold">${selectedOrder.monto_original.toLocaleString("es-AR")}</p>
                  </div>
                  {selectedOrder.porcentaje_descuento > 0 && (
                    <>
                      <div>
                        <p className="text-muted-foreground">Descuento ({selectedOrder.porcentaje_descuento}%)</p>
                        <p className="text-green-600 font-semibold">-${selectedOrder.monto_descuento.toLocaleString("es-AR")}</p>
                      </div>
                      {selectedOrder.codigo_descuento && (
                        <div>
                          <p className="text-muted-foreground">Código Usado</p>
                          <p className="font-mono font-semibold text-primary">{selectedOrder.codigo_descuento.codigo}</p>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <p className="text-muted-foreground">Monto Final</p>
                    <p className="text-lg font-bold">${selectedOrder.monto_final.toLocaleString("es-AR")}</p>
                  </div>
                </div>
              </div>

              {/* Información del Cliente */}
              {selectedOrder.cliente && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <User className="w-3 h-3" /> Nombre
                      </p>
                      <p className="font-medium">{selectedOrder.cliente.nombre_apellido}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Email
                      </p>
                      <p>{selectedOrder.cliente.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Phone className="w-3 h-3" /> Teléfono
                      </p>
                      <p>{selectedOrder.cliente.telefono}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">DNI</p>
                      <p>{selectedOrder.cliente.dni}</p>
                    </div>
                    {selectedOrder.cliente.direccion_completa && (
                      <div>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> Dirección
                        </p>
                        <p>{selectedOrder.cliente.direccion_completa}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {selectedOrder.cliente.ciudad}, {selectedOrder.cliente.provincia}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comentarios */}
              {selectedOrder.comentarios && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Comentarios
                  </h3>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedOrder.comentarios}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
