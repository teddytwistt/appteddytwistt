// =====================================================
// TIPOS SIMPLIFICADOS - Nueva Estructura
// =====================================================

export type Zona = "cba" | "interior"
export type EstadoPago = "pendiente" | "pagado" | "fallido" | "reembolsado"
export type EstadoEnvio = "pendiente" | "enviado" | "entregado"

// =====================================================
// TABLA: productos
// =====================================================
export interface Producto {
  id: number
  nombre: string
  descripcion?: string
  precio_cba: number
  precio_interior: number
  stock_inicial: number
  activo: boolean
  created_at: string
  updated_at: string
}

// =====================================================
// TABLA: clientes
// =====================================================
export interface Cliente {
  id: number
  nombre_apellido: string
  email: string
  telefono: string
  dni: string
  provincia?: string
  ciudad?: string
  direccion_completa?: string
  created_at: string
  updated_at: string
}

// =====================================================
// TABLA: unidades_producto
// =====================================================
export interface UnidadProducto {
  id: number
  id_producto: number
  numero_serie: number
  estado: "disponible" | "reservado" | "vendido" | "cancelado"
  fecha_venta?: string
  created_at: string
}

// =====================================================
// TABLA: pedidos
// =====================================================
export interface Pedido {
  id: number
  id_producto: number
  id_cliente?: number
  id_codigo_descuento?: number
  id_unidad?: number

  // Mercado Pago
  preference_id?: string
  payment_id?: string

  // Detalles del pedido
  zona: Zona
  monto_original: number
  porcentaje_descuento: number
  monto_descuento: number
  monto_final: number

  // Estados
  estado_pago: EstadoPago
  estado_envio: EstadoEnvio

  // Adicional
  comentarios?: string
  mp_response?: Record<string, unknown>

  // Timestamps
  fecha_creacion: string
  fecha_pago?: string
  fecha_envio?: string
  fecha_entrega?: string
}

// =====================================================
// TABLA: codigos_descuento
// =====================================================
export interface CodigoDescuento {
  id: number
  codigo: string
  porcentaje_descuento: number
  activo: boolean
  usos_maximos?: number
  veces_usado: number
  valido_desde: string
  valido_hasta?: string
  descripcion?: string
  created_at: string
  updated_at: string
}

// =====================================================
// TIPOS EXTENDIDOS (con relaciones)
// =====================================================

// Pedido con información del cliente, producto y unidad
export interface PedidoCompleto extends Pedido {
  cliente?: Cliente
  producto?: Producto
  codigo_descuento?: CodigoDescuento
  unidad?: UnidadProducto
}

// =====================================================
// RESPUESTAS DE API
// =====================================================

export interface StockStatus {
  stock_inicial: number
  vendidos: number
  disponibles: number
}

export interface ValidacionDescuento {
  valido: boolean
  id_descuento?: number
  porcentaje?: number
  mensaje: string
}

export interface RespuestaCheckout {
  init_point: string
  preference_id: string
  pedido_id: number
}

export interface RespuestaValidacionPago {
  success: boolean
  message: string
  pedido?: {
    id: number
    zona: Zona
    monto_final: number
    numero_serie: number
  }
}

// =====================================================
// ALIAS PARA COMPATIBILIDAD
// =====================================================
export type Order = Pedido
