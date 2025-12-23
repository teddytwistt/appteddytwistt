require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function poblarDatosPrueba() {
  console.log('🚀 Comenzando a poblar datos de prueba...\n');

  try {
    // 1. Crear códigos de descuento variados
    console.log('📝 Creando códigos de descuento...');

    const discountCodes = [
      {
        code: 'BIENVENIDA10',
        discount_percentage: 10,
        active: true,
        max_uses: 100,
        times_used: 45,
        valid_from: new Date('2024-01-01'),
        valid_until: new Date('2025-12-31')
      },
      {
        code: 'NAVIDAD25',
        discount_percentage: 25,
        active: true,
        max_uses: 50,
        times_used: 32,
        valid_from: new Date('2024-12-01'),
        valid_until: new Date('2024-12-31')
      },
      {
        code: 'VERANO15',
        discount_percentage: 15,
        active: true,
        max_uses: 75,
        times_used: 18,
        valid_from: new Date('2025-01-01'),
        valid_until: new Date('2025-03-31')
      },
      {
        code: 'VIP30',
        discount_percentage: 30,
        active: true,
        max_uses: 20,
        times_used: 8,
        valid_from: new Date('2024-01-01'),
        valid_until: new Date('2025-12-31')
      },
      {
        code: 'PRIMERACOMPRA20',
        discount_percentage: 20,
        active: true,
        max_uses: 200,
        times_used: 67,
        valid_from: new Date('2024-01-01'),
        valid_until: new Date('2025-12-31')
      },
      {
        code: 'BLACKFRIDAY40',
        discount_percentage: 40,
        active: false, // Campaña finalizada
        max_uses: 100,
        times_used: 100,
        valid_from: new Date('2024-11-25'),
        valid_until: new Date('2024-11-30')
      },
      {
        code: 'AMIGOS12',
        discount_percentage: 12,
        active: true,
        max_uses: null, // Sin límite
        times_used: 156,
        valid_from: new Date('2024-01-01'),
        valid_until: null // Sin fecha de expiración
      },
      {
        code: 'FLASH50',
        discount_percentage: 50,
        active: false,
        max_uses: 10,
        times_used: 10,
        valid_from: new Date('2024-10-01'),
        valid_until: new Date('2024-10-02')
      }
    ];

    for (const discount of discountCodes) {
      const { error } = await supabase
        .from('discount_codes')
        .upsert(discount, { onConflict: 'code' });

      if (error) {
        console.log(`   ⚠️  Código ${discount.code} ya existe o error:`, error.message);
      } else {
        console.log(`   ✅ Código ${discount.code} creado (${discount.discount_percentage}% descuento)`);
      }
    }

    // 2. Crear órdenes con descuentos aplicados
    console.log('\n📦 Creando órdenes con descuentos aplicados...');

    const nombres = [
      'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez',
      'Luis Rodríguez', 'Laura Fernández', 'Diego González', 'Sofía Torres',
      'Pablo Ruiz', 'Valentina Silva', 'Mateo Flores', 'Lucía Morales',
      'Santiago Díaz', 'Camila Castro', 'Nicolás Vargas'
    ];

    const emails = nombres.map((nombre, i) =>
      `${nombre.toLowerCase().replace(' ', '.')}${i}@email.com`
    );

    const ciudades = [
      { provincia: 'Córdoba', ciudad: 'Córdoba', zona: 'cba' },
      { provincia: 'Córdoba', ciudad: 'Villa Carlos Paz', zona: 'interior' },
      { provincia: 'Buenos Aires', ciudad: 'Buenos Aires', zona: 'interior' },
      { provincia: 'Santa Fe', ciudad: 'Rosario', zona: 'interior' },
      { provincia: 'Mendoza', ciudad: 'Mendoza', zona: 'interior' },
      { provincia: 'Córdoba', ciudad: 'Río Cuarto', zona: 'interior' }
    ];

    // Precio base del producto
    const precioBase = 18000;

    const orders = [];

    // Distribuir órdenes entre diferentes códigos y fechas
    const codigosParaOrdenes = [
      'BIENVENIDA10', 'NAVIDAD25', 'VERANO15', 'VIP30',
      'PRIMERACOMPRA20', 'BLACKFRIDAY40', 'AMIGOS12', 'FLASH50'
    ];

    // Generar 50 órdenes de prueba
    for (let i = 0; i < 50; i++) {
      const codigoDescuento = codigosParaOrdenes[i % codigosParaOrdenes.length];
      const descuentoPorcentaje = discountCodes.find(d => d.code === codigoDescuento).discount_percentage;
      const montoOriginal = precioBase;
      const montoConDescuento = montoOriginal * (1 - descuentoPorcentaje / 100);

      const nombre = nombres[i % nombres.length];
      const email = emails[i % emails.length];
      const ubicacion = ciudades[i % ciudades.length];

      // 70% de órdenes pagadas, 30% pendientes
      const estadoPago = Math.random() > 0.3 ? 'pagado' : 'pendiente';

      // Generar fechas aleatorias en los últimos 60 días
      const diasAtras = Math.floor(Math.random() * 60);
      const fechaCreacion = new Date();
      fechaCreacion.setDate(fechaCreacion.getDate() - diasAtras);

      const order = {
        zona: ubicacion.zona,
        monto: montoConDescuento.toFixed(2),
        estado_pago: estadoPago,
        nombre_apellido: nombre,
        email: email,
        telefono: `351${Math.floor(Math.random() * 9000000 + 1000000)}`,
        dni: `${Math.floor(Math.random() * 90000000 + 10000000)}`,
        provincia: ubicacion.provincia,
        ciudad: ubicacion.ciudad,
        direccion_completa: `Calle ${Math.floor(Math.random() * 100 + 1)} #${Math.floor(Math.random() * 500)}`,
        estado_envio: estadoPago === 'pagado' ? (Math.random() > 0.5 ? 'Enviado' : 'Entregado') : 'Pendiente',
        discount_code: codigoDescuento,
        discount_percentage: descuentoPorcentaje,
        original_amount: montoOriginal,
        fecha_creacion: fechaCreacion.toISOString(),
        fecha_pago: estadoPago === 'pagado' ? fechaCreacion.toISOString() : null,
        form_completed: true,
        payment_id: estadoPago === 'pagado' ? `TEST_${Math.random().toString(36).substr(2, 9)}` : null
      };

      orders.push(order);
    }

    // Insertar órdenes en lotes
    const { data: insertedOrders, error: ordersError } = await supabase
      .from('orders')
      .insert(orders)
      .select();

    if (ordersError) {
      console.error('   ❌ Error al crear órdenes:', ordersError);
    } else {
      console.log(`   ✅ ${insertedOrders.length} órdenes creadas exitosamente`);

      // Resumen por código
      const resumen = {};
      orders.forEach(order => {
        if (!resumen[order.discount_code]) {
          resumen[order.discount_code] = { total: 0, pagadas: 0, pendientes: 0 };
        }
        resumen[order.discount_code].total++;
        if (order.estado_pago === 'pagado') {
          resumen[order.discount_code].pagadas++;
        } else {
          resumen[order.discount_code].pendientes++;
        }
      });

      console.log('\n📊 Resumen por código de descuento:');
      Object.entries(resumen).forEach(([code, stats]) => {
        console.log(`   ${code}: ${stats.total} órdenes (${stats.pagadas} pagadas, ${stats.pendientes} pendientes)`);
      });
    }

    console.log('\n✨ ¡Datos de prueba creados exitosamente!');
    console.log('\n📈 Ahora puedes ver las estadísticas en el panel de admin');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

poblarDatosPrueba();
