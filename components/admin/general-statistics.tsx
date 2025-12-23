"use client"

import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, TrendingUp, MapPin, Package, CreditCard, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { Tooltip as InfoTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Line, Pie, Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

interface DailySale {
  date: string
  count: number
  revenue: number
}

interface ZoneStats {
  total_orders: number
  paid_orders: number
  revenue: number
}

interface GeneralStats {
  geography: {
    cba: ZoneStats
    interior: ZoneStats
  }
  payment_status: {
    pagado: number
    pendiente: number
    fallido: number
    reembolsado: number
  }
  shipping_status: {
    pendiente: number
    enviado: number
    entregado: number
  }
  daily_sales: DailySale[]
  summary: {
    total_orders: number
    paid_orders: number
    total_revenue: number
    average_order_value: number
  }
}

export interface GeneralStatisticsRef {
  refresh: () => void
}

export const GeneralStatistics = forwardRef<GeneralStatisticsRef>((props, ref) => {
  const [stats, setStats] = useState<GeneralStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'months' | 'years'>('days')
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [viewMode, offset])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/general-stats?viewMode=${viewMode}&offset=${offset}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("[admin] Error fetching general stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Expose refresh function via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchStats
  }))

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

  // Chart data - format labels based on view mode
  const dailySalesChartData = {
    labels: stats.daily_sales.map((sale) => {
      if (viewMode === 'days') {
        // For daily view, format the date nicely
        const date = new Date(sale.date)
        const day = date.getDate()
        const month = date.getMonth() + 1
        return `${day}/${month}`
      } else {
        // For weeks, months, years - use the pre-formatted label from backend
        return sale.date
      }
    }),
    datasets: [
      {
        label: "Ingresos ($)",
        data: stats.daily_sales.map((sale) => sale.revenue),
        backgroundColor: "rgba(6, 182, 212, 0.8)",
        borderColor: "rgba(6, 182, 212, 1)",
        borderWidth: 1,
      },
    ],
  }

  const geographyRevenueData = {
    labels: ["Córdoba Capital", "Interior"],
    datasets: [
      {
        data: [stats.geography.cba.revenue, stats.geography.interior.revenue],
        backgroundColor: ["rgba(6, 182, 212, 0.7)", "rgba(168, 85, 247, 0.7)"],
        borderColor: ["rgba(6, 182, 212, 1)", "rgba(168, 85, 247, 1)"],
        borderWidth: 1,
      },
    ],
  }

  const geographyOrdersData = {
    labels: ["Córdoba Capital", "Interior"],
    datasets: [
      {
        data: [stats.geography.cba.paid_orders, stats.geography.interior.paid_orders],
        backgroundColor: ["rgba(34, 197, 94, 0.7)", "rgba(234, 179, 8, 0.7)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(234, 179, 8, 1)"],
        borderWidth: 1,
      },
    ],
  }

  const shippingStatusData = {
    labels: ["Pendiente", "Enviado", "Entregado"],
    datasets: [
      {
        data: [stats.shipping_status.pendiente, stats.shipping_status.enviado, stats.shipping_status.entregado],
        backgroundColor: ["rgba(251, 191, 36, 0.7)", "rgba(59, 130, 246, 0.7)", "rgba(34, 197, 94, 0.7)"],
        borderColor: ["rgba(251, 191, 36, 1)", "rgba(59, 130, 246, 1)", "rgba(34, 197, 94, 1)"],
        borderWidth: 1,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '$' + context.parsed.y.toLocaleString('es-AR');
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Ingresos ($)",
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString('es-AR');
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoTooltip>
          <TooltipTrigger asChild>
            <Card className="transition-all hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.summary.total_orders}</div>
                <p className="text-xs text-muted-foreground">{stats.summary.paid_orders} pagados</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[250px]">
            <p>Cantidad total de pedidos recibidos, incluyendo pagados, pendientes y fallidos</p>
          </TooltipContent>
        </InfoTooltip>

        <InfoTooltip>
          <TooltipTrigger asChild>
            <Card className="transition-all hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.summary.total_revenue.toLocaleString("es-AR")}</div>
                <p className="text-xs text-muted-foreground">De pedidos pagados</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[250px]">
            <p>Suma total de ingresos generados por todos los pedidos pagados</p>
          </TooltipContent>
        </InfoTooltip>

        <InfoTooltip>
          <TooltipTrigger asChild>
            <Card className="transition-all hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Math.round(stats.summary.average_order_value).toLocaleString("es-AR")}</div>
                <p className="text-xs text-muted-foreground">Por pedido pagado</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[250px]">
            <p>Valor promedio de cada pedido pagado (ingresos totales ÷ pedidos pagados)</p>
          </TooltipContent>
        </InfoTooltip>
      </div>

      {/* Daily Sales Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>
                {viewMode === 'days' && 'Ventas Diarias (7 Días)'}
                {viewMode === 'weeks' && 'Comparación Semanal'}
                {viewMode === 'months' && 'Comparación Mensual'}
                {viewMode === 'years' && 'Comparación Anual'}
              </CardTitle>
              <CardDescription>
                {viewMode === 'days' && 'Detalle día por día'}
                {viewMode === 'weeks' && 'Ventas por semana'}
                {viewMode === 'months' && 'Ventas por mes'}
                {viewMode === 'years' && 'Ventas por año'}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <Select value={viewMode} onValueChange={(value: any) => { setViewMode(value); setOffset(0); }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Vista Diaria (7d)</SelectItem>
                  <SelectItem value="weeks">Vista Semanal</SelectItem>
                  <SelectItem value="months">Vista Mensual</SelectItem>
                  <SelectItem value="years">Vista Anual</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - 1))}
                  disabled={offset === 0}
                  className="gap-1"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <Bar data={dailySalesChartData} options={barChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Geography and Status Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Zona</CardTitle>
            <CardDescription>Distribución de ingresos geográfica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-full max-w-[250px]">
                <Pie data={geographyRevenueData} options={pieChartOptions} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Zona</CardTitle>
            <CardDescription>Distribución de pedidos pagados por zona</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-full max-w-[250px]">
                <Pie data={geographyOrdersData} options={pieChartOptions} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Envíos</CardTitle>
            <CardDescription>Distribución de estados de envío (pedidos pagados)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-full max-w-[250px]">
                <Pie data={shippingStatusData} options={pieChartOptions} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Geography Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Córdoba Capital
            </CardTitle>
            <CardDescription>Estadísticas de la zona CBA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Pedidos:</span>
              <span className="text-lg font-bold">{stats.geography.cba.total_orders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pedidos Pagados:</span>
              <span className="text-lg font-bold text-green-600">{stats.geography.cba.paid_orders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ingresos:</span>
              <span className="text-lg font-bold">${stats.geography.cba.revenue.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ticket Promedio:</span>
              <span className="text-lg font-bold">
                $
                {stats.geography.cba.paid_orders > 0
                  ? Math.round(stats.geography.cba.revenue / stats.geography.cba.paid_orders).toLocaleString("es-AR")
                  : 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Interior del País
            </CardTitle>
            <CardDescription>Estadísticas de la zona Interior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Pedidos:</span>
              <span className="text-lg font-bold">{stats.geography.interior.total_orders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pedidos Pagados:</span>
              <span className="text-lg font-bold text-green-600">{stats.geography.interior.paid_orders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ingresos:</span>
              <span className="text-lg font-bold">${stats.geography.interior.revenue.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ticket Promedio:</span>
              <span className="text-lg font-bold">
                $
                {stats.geography.interior.paid_orders > 0
                  ? Math.round(stats.geography.interior.revenue / stats.geography.interior.paid_orders).toLocaleString("es-AR")
                  : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

GeneralStatistics.displayName = "GeneralStatistics"
