require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTablas() {
  console.log('🔍 Verificando tablas disponibles...\n');

  // Intentar listar tablas comunes
  const tablasAVerificar = ['orders', 'discount_codes', 'clientes', 'ventas', 'productos'];

  for (const tabla of tablasAVerificar) {
    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${tabla}: ${error.message}`);
    } else {
      console.log(`✅ ${tabla}: Existe (${data ? data.length : 0} registros en muestra)`);
      if (data && data.length > 0) {
        console.log('   Estructura:', Object.keys(data[0]).join(', '));
      }
    }
  }
}

verificarTablas();
