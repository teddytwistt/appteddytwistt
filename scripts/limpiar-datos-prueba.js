require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function limpiarDatos() {
  console.log('🗑️  LIMPIAR DATOS DE PRUEBA\n');
  console.log('⚠️  ADVERTENCIA: Esta acción eliminará TODOS los pedidos y códigos de descuento de prueba.\n');

  rl.question('¿Estás seguro que deseas continuar? (escribe "SI" para confirmar): ', async (respuesta) => {
    if (respuesta.toUpperCase() !== 'SI') {
      console.log('\n❌ Operación cancelada');
      rl.close();
      return;
    }

    try {
      console.log('\n🗑️  Eliminando datos de prueba...\n');

      // Códigos de prueba
      const codigosPrueba = [
        'BIENVENIDA10', 'NAVIDAD25', 'VERANO15', 'VIP30',
        'PRIMERACOMPRA20', 'BLACKFRIDAY40', 'AMIGOS12', 'FLASH50'
      ];

      // Obtener IDs de códigos de prueba
      const { data: codigos } = await supabase
        .from('codigos_descuento')
        .select('id')
        .in('codigo', codigosPrueba);

      const idsCodigosPrueba = codigos?.map(c => c.id) || [];

      if (idsCodigosPrueba.length > 0) {
        // Eliminar pedidos con estos códigos
        const { error: errorPedidos, count } = await supabase
          .from('pedidos')
          .delete({ count: 'exact' })
          .in('id_codigo_descuento', idsCodigosPrueba);

        if (errorPedidos) {
          console.log('   ❌ Error eliminando pedidos:', errorPedidos.message);
        } else {
          console.log(`   ✅ ${count} pedidos eliminados`);
        }

        // Eliminar códigos de descuento
        const { error: errorCodigos, count: countCodigos } = await supabase
          .from('codigos_descuento')
          .delete({ count: 'exact' })
          .in('codigo', codigosPrueba);

        if (errorCodigos) {
          console.log('   ❌ Error eliminando códigos:', errorCodigos.message);
        } else {
          console.log(`   ✅ ${countCodigos} códigos de descuento eliminados`);
        }
      }

      console.log('\n✨ Datos de prueba eliminados exitosamente\n');
      console.log('💡 Puedes ejecutar "node scripts/poblar-datos-descuentos.js" para crear nuevos datos\n');

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      rl.close();
    }
  });
}

limpiarDatos();
