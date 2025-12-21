"use client"

import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, TrendingUp, MapPin, Package, CreditCard } from "lucide-react"
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
  const [days, setDays] = useState<string>("30")

  useEffect(() => {
    fetchStats()
  }, [days])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/general-stats?days=${days}`)
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

  // Chart data
  const dailySalesChartData = {
    labels: stats.daily_sales.map((sale) => {
      const date = new Date(sale.date)
      return `${date.getDate()}/${date.getMonth() + 1}`
    }),
    datasets: [
      {
        label: "Ingresos ($)",
        data: stats.daily_sales.map((sale) => sale.revenue),
        borderColor: "rgba(6, 182, 212, 1)",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        tension: 0.4,
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

  const lineChartOptions = {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.total_orders}</div>
            <p className="text-xs text-muted-foreground">{stats.summary.paid_orders} pagados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.summary.total_revenue.toLocaleString("es-AR")}</div>
            <p className="text-xs text-muted-foreground">De pedidos pagados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(stats.summary.average_order_value).toLocaleString("es-AR")}</div>
            <p className="text-xs text-muted-foreground">Por pedido pagado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.summary.total_orders > 0
                ? Math.round((stats.summary.paid_orders / stats.summary.total_orders) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Pedidos completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Ventas Últimos {days} Días</CardTitle>
              <CardDescription>Evolución de ingresos</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar:</span>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="15">Últimos 15 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="60">Últimos 60 días</SelectItem>
                  <SelectItem value="90">Últimos 90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <Line data={dailySalesChartData} options={lineChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Geography and Status Charts */}
      <div className="grid gap-6 md:grid-cols-2">
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
