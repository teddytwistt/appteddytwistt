require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function mostrarResumen() {
  console.log('📊 RESUMEN COMPLETO DE ESTADÍSTICAS\n');
  console.log('═'.repeat(70) + '\n');

  try {
    // Estadísticas generales de pedidos
    const { count: totalPedidos } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true });

    const { count: pedidosPagados } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('estado_pago', 'pagado');

    const { count: pedidosPendientes } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('estado_pago', 'pendiente');

    const { count: pedidosFallidos } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('estado_pago', 'fallido');

    // Pedidos con descuento
    const { count: pedidosConDescuento } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .not('id_codigo_descuento', 'is', null)
      .eq('estado_pago', 'pagado');

    console.log('📦 RESUMEN DE PEDIDOS');
    console.log('─'.repeat(70));
    console.log(`   Total de pedidos: ${totalPedidos}`);
    console.log(`   ✅ Pagados: ${pedidosPagados} (${((pedidosPagados/totalPedidos)*100).toFixed(1)}%)`);
    console.log(`   ⏳ Pendientes: ${pedidosPendientes} (${((pedidosPendientes/totalPedidos)*100).toFixed(1)}%)`);
    console.log(`   ❌ Fallidos: ${pedidosFallidos} (${((pedidosFallidos/totalPedidos)*100).toFixed(1)}%)`);
    console.log(`   🎟️  Con descuento aplicado: ${pedidosConDescuento}\n`);

    // Total de descuentos aplicados
    const { data: descuentosData } = await supabase
      .from('pedidos')
      .select('monto_descuento, monto_original')
      .eq('estado_pago', 'pagado')
      .not('id_codigo_descuento', 'is', null);

    const totalDescuento = descuentosData?.reduce((sum, p) => sum + (p.monto_descuento || 0), 0) || 0;
    const totalOriginal = descuentosData?.reduce((sum, p) => sum + (p.monto_original || 0), 0) || 0;

    console.log('💰 IMPACTO FINANCIERO DE DESCUENTOS');
    console.log('─'.repeat(70));
    console.log(`   Monto total sin descuento: $${totalOriginal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`);
    console.log(`   Descuentos aplicados: -$${totalDescuento.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`);
    console.log(`   Monto total recaudado: $${(totalOriginal - totalDescuento).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`);
    console.log(`   Porcentaje promedio de descuento: ${totalOriginal > 0 ? ((totalDescuento/totalOriginal)*100).toFixed(2) : 0}%\n`);

    // Códigos de descuento
    const { data: codigos } = await supabase
      .from('codigos_descuento')
      .select('*')
      .order('veces_usado', { ascending: false });

    console.log('🎟️  CÓDIGOS DE DESCUENTO');
    console.log('─'.repeat(70));
    console.log(`   Total de códigos creados: ${codigos.length}`);
    console.log(`   Códigos activos: ${codigos.filter(c => c.activo).length}`);
    console.log(`   Códigos inactivos: ${codigos.filter(c => !c.activo).length}\n`);

    console.log('📈 DETALLE POR CÓDIGO DE DESCUENTO');
    console.log('─'.repeat(70) + '\n');

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

      const { data: sumaData } = await supabase
        .from('pedidos')
        .select('monto_descuento')
        .eq('id_codigo_descuento', codigo.id)
        .eq('estado_pago', 'pagado');

      const totalDesc = sumaData?.reduce((sum, p) => sum + (p.monto_descuento || 0), 0) || 0;

      const tasaConversion = total > 0 ? ((pagados / total) * 100).toFixed(1) : 0;
      const estado = codigo.activo ? '✅ ACTIVO' : '❌ INACTIVO';

      console.log(`   ${codigo.codigo}`);
      console.log(`   ${'-'.repeat(codigo.codigo.length)}`);
      console.log(`   Estado: ${estado}`);
      console.log(`   Descuento: ${codigo.porcentaje_descuento}%`);
      console.log(`   Pedidos totales: ${total}`);
      console.log(`   Pedidos pagados: ${pagados} (${tasaConversion}% conversión)`);
      console.log(`   Descuento total aplicado: $${totalDesc.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`);

      if (codigo.usos_maximos) {
        const usosRestantes = codigo.usos_maximos - (codigo.veces_usado || 0);
        console.log(`   Usos: ${codigo.veces_usado || 0}/${codigo.usos_maximos} (${usosRestantes} restantes)`);
      } else {
        console.log(`   Usos: ${codigo.veces_usado || 0} (sin límite)`);
      }

      console.log();
    }

    console.log('═'.repeat(70));
    console.log('✨ Los datos están listos para probar los gráficos en el panel de admin\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

mostrarResumen();
