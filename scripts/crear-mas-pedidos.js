require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function crearMasPedidos() {
  console.log('🚀 Creando más pedidos con descuentos...\n');

  try {
    // Obtener datos existentes
    const { data: producto } = await supabase
      .from('productos')
      .select('*')
      .eq('id', 1)
      .single();

    const { data: codigos } = await supabase
      .from('codigos_descuento')
      .select('*');

    const { data: clientes } = await supabase
      .from('clientes')
      .select('*');

    if (!producto || !codigos || !clientes) {
      console.error('❌ Faltan datos base');
      return;
    }

    console.log(`📦 Producto: ${producto.nombre}`);
    console.log(`📝 ${codigos.length} códigos de descuento`);
    console.log(`👥 ${clientes.length} clientes\n`);

    console.log('📦 Creando 50 pedidos adicionales...\n');

    let creados = 0;
    let aprobados = 0;

    for (let i = 0; i < 50; i++) {
      const codigo = codigos[Math.floor(Math.random() * codigos.length)];
      const cliente = clientes[Math.floor(Math.random() * clientes.length)];

      const zona = cliente.ciudad === 'Córdoba' ? 'cba' : 'interior';
      const montoOriginal = zona === 'cba' ? producto.precio_cba : producto.precio_interior;

      // Validar que tenemos precios válidos
      if (!montoOriginal || montoOriginal <= 0) {
        console.log(`⚠️  Precio inválido para zona ${zona}`);
        continue;
      }

      const montoDescuento = Math.round(montoOriginal * codigo.porcentaje_descuento / 100);
      const montoFinal = montoOriginal - montoDescuento;

      // 70% pagado, 20% pendiente, 10% fallido
      let estadoPago;
      const rand = Math.random();
      if (rand < 0.7) estadoPago = 'pagado';
      else if (rand < 0.9) estadoPago = 'pendiente';
      else estadoPago = 'fallido';

      // Estado de envío según estado de pago
      let estadoEnvio;
      if (estadoPago === 'pagado') {
        const randEnvio = Math.random();
        if (randEnvio < 0.4) estadoEnvio = 'entregado';
        else if (randEnvio < 0.8) estadoEnvio = 'enviado';
        else estadoEnvio = 'pendiente';
      } else {
        estadoEnvio = 'pendiente';
      }

      // Generar fechas aleatorias en los últimos 60 días
      const diasAtras = Math.floor(Math.random() * 60);
      const fechaCreacion = new Date();
      fechaCreacion.setDate(fechaCreacion.getDate() - diasAtras);

      const pedido = {
        id_producto: producto.id,
        id_cliente: cliente.id,
        id_codigo_descuento: codigo.id,
        zona: zona,
        monto_original: montoOriginal,
        porcentaje_descuento: codigo.porcentaje_descuento,
        monto_descuento: montoDescuento,
        monto_final: montoFinal,
        estado_pago: estadoPago,
        estado_envio: estadoEnvio,
        fecha_creacion: fechaCreacion.toISOString(),
        fecha_pago: estadoPago === 'pagado' ? fechaCreacion.toISOString() : null,
        payment_id: estadoPago === 'pagado' ? `MP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null
      };

      const { data, error } = await supabase
        .from('pedidos')
        .insert(pedido)
        .select();

      if (error) {
        console.log(`   ❌ Error en pedido ${i + 1}: ${error.message}`);
      } else if (data) {
        creados++;
        if (estadoPago === 'pagado') {
          aprobados++;
          // Actualizar contador
          await supabase
            .from('codigos_descuento')
            .update({
              veces_usado: supabase.from('codigos_descuento')
                .select('veces_usado')
                .eq('id', codigo.id)
                .single()
                .then(r => (r.data?.veces_usado || 0) + 1)
            })
            .eq('id', codigo.id);
        }

        if ((i + 1) % 10 === 0) {
          console.log(`   ✅ ${i + 1}/50 pedidos creados...`);
        }
      }
    }

    console.log(`\n✨ Proceso completado!`);
    console.log(`   Total creados: ${creados}`);
    console.log(`   Aprobados: ${aprobados}`);
    console.log(`   Pendientes/Rechazados: ${creados - aprobados}\n`);

    // Resumen actualizado
    console.log('📊 Resumen actualizado por código:\n');

    for (const codigo of codigos) {
      const { count: total } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('id_codigo_descuento', codigo.id);

      const { count: pagados } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('id_codigo_descuento', codigo.id)
        .eq('estado_pago', 'pagado');

      const { data: sumaTotal } = await supabase
        .from('pedidos')
        .select('monto_descuento')
        .eq('id_codigo_descuento', codigo.id)
        .eq('estado_pago', 'pagado');

      const totalDescuento = sumaTotal?.reduce((sum, p) => sum + (p.monto_descuento || 0), 0) || 0;

      console.log(`   ${codigo.codigo} (${codigo.porcentaje_descuento}%):`);
      console.log(`      📦 Total pedidos: ${total}`);
      console.log(`      ✅ Aprobados: ${pagados}`);
      console.log(`      💰 Descuento total: $${totalDescuento.toFixed(2)}`);
      console.log(`      📊 Estado: ${codigo.activo ? 'Activo' : 'Inactivo'}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

crearMasPedidos();
