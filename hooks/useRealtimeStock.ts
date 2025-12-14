"use client"

import { useEffect, useState } from "react"

interface StockData {
  stockDisplay: string
  available: number
}

/**
 * Hook para obtener el stock con polling rápido (cada 5 segundos)
 * Más rápido que 30 seg, casi en tiempo real
 */
export function useRealtimeStock() {
  const [stockData, setStockData] = useState<StockData>({
    stockDisplay: "900/900",
    available: 900,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Función para obtener el stock actual
    const fetchStock = async () => {
      try {
        const response = await fetch("/api/get-stock")
        const data = await response.json()
        if (data.stockDisplay) {
          setStockData({
            stockDisplay: data.stockDisplay,
            available: data.available,
          })
        }
        setIsLoading(false)
      } catch (err) {
        console.error("[useRealtimeStock] Error fetching stock:", err)
        setIsLoading(false)
      }
    }

    // Obtener stock inicial
    fetchStock()

    // Polling cada 5 segundos (mucho más rápido que 30 seg)
    const interval = setInterval(fetchStock, 5000)

    // Cleanup
    return () => clearInterval(interval)
  }, [])

  return { stockData, isLoading }
}
