# Scripts de Datos de Prueba

Este directorio contiene scripts para poblar y gestionar datos de prueba de códigos de descuento y pedidos.

## Resumen de Datos Creados

**Estadísticas actuales:**
- 177 pedidos totales
- 122 pedidos pagados (68.9%)
- 10 códigos de descuento
- $808,856 en descuentos aplicados
- Tasa de conversión promedio: 68.9%

## Scripts Disponibles

### 1. Poblar Datos Iniciales
```bash
node scripts/poblar-datos-descuentos.js
```

Crea:
- 8 códigos de descuento variados (activos e inactivos)
- 16 clientes de prueba
- 60 pedidos distribuidos entre los códigos

### 2. Crear Más Pedidos
```bash
node scripts/crear-mas-pedidos.js
```

Agrega 50 pedidos adicionales con:
- Distribución aleatoria entre códigos
- 70% pagados, 20% pendientes, 10% fallidos
- Fechas aleatorias en los últimos 60 días

### 3. Ver Resumen de Estadísticas
```bash
node scripts/resumen-estadisticas.js
```

Muestra:
- Resumen general de pedidos
- Impacto financiero de descuentos
- Detalle por cada código de descuento
- Tasas de conversión

### 4. Verificar Tablas
```bash
node scripts/verificar-todas-tablas.js
```

Lista todas las tablas disponibles en la base de datos con su estructura.

### 5. Limpiar Datos de Prueba
```bash
node scripts/limpiar-datos-prueba.js
```

Elimina todos los pedidos y códigos de descuento de prueba.
⚠️ Requiere confirmación antes de ejecutar.

## Códigos de Descuento Creados

| Código | Descuento | Estado | Usos Máx | Descripción |
|--------|-----------|--------|----------|-------------|
| BIENVENIDA10 | 10% | ✅ Activo | 100 | Descuento de bienvenida |
| NAVIDAD25 | 25% | ✅ Activo | 50 | Promoción de Navidad |
| VERANO15 | 15% | ✅ Activo | 75 | Descuento de verano |
| VIP30 | 30% | ✅ Activo | 20 | Descuento exclusivo VIP |
| PRIMERACOMPRA20 | 20% | ✅ Activo | 200 | Primera compra |
| BLACKFRIDAY40 | 40% | ❌ Inactivo | 100 | Black Friday (finalizado) |
| AMIGOS12 | 12% | ✅ Activo | Sin límite | Descuento para amigos |
| FLASH50 | 50% | ❌ Inactivo | 10 | Flash sale (finalizado) |

## Uso Recomendado

1. **Primera vez:**
   ```bash
   node scripts/poblar-datos-descuentos.js
   node scripts/crear-mas-pedidos.js  # Ejecutar 2-3 veces
   node scripts/resumen-estadisticas.js
   ```

2. **Agregar más datos:**
   ```bash
   node scripts/crear-mas-pedidos.js
   node scripts/resumen-estadisticas.js
   ```

3. **Empezar de cero:**
   ```bash
   node scripts/limpiar-datos-prueba.js
   node scripts/poblar-datos-descuentos.js
   ```

## Estructura de Datos

### Tabla: codigos_descuento
- id (auto)
- codigo (único)
- porcentaje_descuento
- activo (boolean)
- usos_maximos (nullable)
- veces_usado
- descripcion
- created_at, updated_at

### Tabla: pedidos
- id (auto)
- id_producto
- id_cliente
- id_codigo_descuento (nullable)
- zona (cba/interior)
- monto_original
- porcentaje_descuento
- monto_descuento
- monto_final
- estado_pago (pendiente/pagado/fallido/reembolsado)
- estado_envio (pendiente/enviado/entregado)
- fecha_creacion
- fecha_pago
- payment_id

## Validaciones de Estado

Los pedidos tienen restricciones CHECK:

**estado_pago:**
- pendiente
- pagado
- fallido
- reembolsado

**estado_envio:**
- pendiente
- enviado
- entregado

## Notas

- Todos los scripts requieren las variables de entorno en `.env.local`
- Los precios se calculan según la zona (cba/interior) del cliente
- Las fechas se generan aleatoriamente en los últimos 60 días
- El contador `veces_usado` se actualiza solo para pedidos pagados
