require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function poblarDatos() {
  console.log('🚀 Poblando datos de prueba para códigos de descuento y pedidos...\n');

  try {
    // 1. Obtener el producto existente
    const { data: productos, error: prodError } = await supabase
      .from('productos')
      .select('*')
      .limit(1);

    if (prodError || !productos || productos.length === 0) {
      console.error('❌ Error: No se encontró ningún producto');
      return;
    }

    const producto = productos[0];
    console.log(`📦 Producto encontrado: ${producto.nombre} (ID: ${producto.id})\n`);

    // 2. Crear códigos de descuento variados
    console.log('📝 Creando códigos de descuento...');

    const codigosDescuento = [
      {
        codigo: 'BIENVENIDA10',
        porcentaje_descuento: 10,
        activo: true,
        usos_maximos: 100,
        veces_usado: 0,
        descripcion: 'Descuento de bienvenida para nuevos clientes'
      },
      {
        codigo: 'NAVIDAD25',
        porcentaje_descuento: 25,
        activo: true,
        usos_maximos: 50,
        veces_usado: 0,
        descripcion: 'Promoción especial de Navidad'
      },
      {
        codigo: 'VERANO15',
        porcentaje_descuento: 15,
        activo: true,
        usos_maximos: 75,
        veces_usado: 0,
        descripcion: 'Descuento de verano'
      },
      {
        codigo: 'VIP30',
        porcentaje_descuento: 30,
        activo: true,
        usos_maximos: 20,
        veces_usado: 0,
        descripcion: 'Descuento exclusivo VIP'
      },
      {
        codigo: 'PRIMERACOMPRA20',
        porcentaje_descuento: 20,
        activo: true,
        usos_maximos: 200,
        veces_usado: 0,
        descripcion: 'Descuento para primera compra'
      },
      {
        codigo: 'BLACKFRIDAY40',
        porcentaje_descuento: 40,
        activo: false,
        usos_maximos: 100,
        veces_usado: 100,
        descripcion: 'Black Friday - Campaña finalizada'
      },
      {
        codigo: 'AMIGOS12',
        porcentaje_descuento: 12,
        activo: true,
        usos_maximos: null,
        veces_usado: 0,
        descripcion: 'Descuento para amigos - Sin límite'
      },
      {
        codigo: 'FLASH50',
        porcentaje_descuento: 50,
        activo: false,
        usos_maximos: 10,
        veces_usado: 10,
        descripcion: 'Flash sale - Finalizado'
      }
    ];

    const codigosCreados = [];
    for (const codigo of codigosDescuento) {
      const { data, error } = await supabase
        .from('codigos_descuento')
        .upsert(codigo, { onConflict: 'codigo' })
        .select();

      if (error) {
        console.log(`   ⚠️  ${codigo.codigo}: ${error.message}`);
      } else {
        codigosCreados.push(data[0]);
        console.log(`   ✅ ${codigo.codigo} - ${codigo.porcentaje_descuento}% descuento`);
      }
    }

    // 3. Crear clientes de prueba
    console.log('\n👥 Creando clientes de prueba...');

    const nombres = [
      'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez',
      'Luis Rodríguez', 'Laura Fernández', 'Diego González', 'Sofía Torres',
      'Pablo Ruiz', 'Valentina Silva', 'Mateo Flores', 'Lucía Morales',
      'Santiago Díaz', 'Camila Castro', 'Nicolás Vargas', 'Emma Romero'
    ];

    const ciudades = [
      { provincia: 'Córdoba', ciudad: 'Córdoba' },
      { provincia: 'Córdoba', ciudad: 'Villa Carlos Paz' },
      { provincia: 'Buenos Aires', ciudad: 'Buenos Aires' },
      { provincia: 'Santa Fe', ciudad: 'Rosario' },
      { provincia: 'Mendoza', ciudad: 'Mendoza' },
      { provincia: 'Córdoba', ciudad: 'Río Cuarto' }
    ];

    const clientesCreados = [];
    for (let i = 0; i < nombres.length; i++) {
      const ubicacion = ciudades[i % ciudades.length];
      const nombre = nombres[i];
      const email = `${nombre.toLowerCase().replace(' ', '.')}${i}@email.com`;

      const cliente = {
        nombre_apellido: nombre,
        email: email,
        telefono: `351${Math.floor(Math.random() * 9000000 + 1000000)}`,
        dni: `${Math.floor(Math.random() * 90000000 + 10000000)}`,
        provincia: ubicacion.provincia,
        ciudad: ubicacion.ciudad,
        direccion_completa: `Calle ${Math.floor(Math.random() * 100 + 1)} #${Math.floor(Math.random() * 500)}`
      };

      const { data, error } = await supabase
        .from('clientes')
        .insert(cliente)
        .select();

      if (error) {
        console.log(`   ⚠️  Error creando ${nombre}`);
      } else {
        clientesCreados.push(data[0]);
      }
    }

    console.log(`   ✅ ${clientesCreados.length} clientes creados\n`);

    // 4. Crear pedidos con descuentos
    console.log('📦 Creando pedidos con descuentos aplicados...');

    const pedidosCreados = [];
    const estadosPago = ['pendiente', 'aprobado', 'rechazado'];
    const estadosEnvio = ['pendiente', 'preparando', 'enviado', 'entregado'];

    // Crear 60 pedidos distribuidos entre los códigos
    for (let i = 0; i < 60; i++) {
      const codigo = codigosCreados[i % codigosCreados.length];
      const cliente = clientesCreados[i % clientesCreados.length];

      const zona = cliente.ciudad === 'Córdoba' ? 'cba' : 'interior';
      const montoOriginal = zona === 'cba' ? producto.precio_cba : producto.precio_interior;
      const montoDescuento = Math.round(montoOriginal * codigo.porcentaje_descuento / 100);
      const montoFinal = montoOriginal - montoDescuento;

      // 60% pagados, 30% pendientes, 10% rechazados
      let estadoPago;
      const rand = Math.random();
      if (rand < 0.6) estadoPago = 'aprobado';
      else if (rand < 0.9) estadoPago = 'pendiente';
      else estadoPago = 'rechazado';

      // Estado de envío según estado de pago
      let estadoEnvio;
      if (estadoPago === 'aprobado') {
        const randEnvio = Math.random();
        if (randEnvio < 0.4) estadoEnvio = 'entregado';
        else if (randEnvio < 0.7) estadoEnvio = 'enviado';
        else estadoEnvio = 'preparando';
      } else {
        estadoEnvio = 'pendiente';
      }

      // Generar fechas aleatorias en los últimos 90 días
      const diasAtras = Math.floor(Math.random() * 90);
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
        fecha_pago: estadoPago === 'aprobado' ? fechaCreacion.toISOString() : null,
        payment_id: estadoPago === 'aprobado' ? `TEST_${Math.random().toString(36).substr(2, 9)}` : null
      };

      const { data, error } = await supabase
        .from('pedidos')
        .insert(pedido)
        .select();

      if (!error && data) {
        pedidosCreados.push(data[0]);

        // Incrementar contador de usos si el pedido fue aprobado
        if (estadoPago === 'aprobado') {
          await supabase
            .from('codigos_descuento')
            .update({ veces_usado: codigo.veces_usado + 1 })
            .eq('id', codigo.id);
        }
      }
    }

    console.log(`   ✅ ${pedidosCreados.length} pedidos creados\n`);

    // Resumen final
    console.log('📊 Resumen de datos creados:\n');

    for (const codigo of codigosCreados) {
      const { count } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('id_codigo_descuento', codigo.id);

      const { count: pagados } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('id_codigo_descuento', codigo.id)
        .eq('estado_pago', 'aprobado');

      console.log(`   ${codigo.codigo}:`);
      console.log(`      - Total pedidos: ${count}`);
      console.log(`      - Pedidos aprobados: ${pagados}`);
      console.log(`      - Descuento: ${codigo.porcentaje_descuento}%`);
      console.log(`      - Estado: ${codigo.activo ? '✅ Activo' : '❌ Inactivo'}\n`);
    }

    console.log('✨ ¡Datos de prueba poblados exitosamente!');
    console.log('📈 Ahora puedes ver las estadísticas en el panel de administración\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

poblarDatos();
