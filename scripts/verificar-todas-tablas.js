require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTablas() {
  console.log('🔍 Verificando todas las tablas posibles...\n');

  const tablasAVerificar = [
    'orders',
    'discount_codes',
    'clientes',
    'productos',
    'pedidos',
    'codigos_descuento',
    'numeros_serie',
    'stock_config',
    'unidades_producto'
  ];

  const tablasExistentes = [];

  for (const tabla of tablasAVerificar) {
    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .limit(1);

    if (!error) {
      tablasExistentes.push(tabla);
      console.log(`✅ ${tabla}: Existe`);
      if (data && data.length > 0) {
        console.log(`   Columnas: ${Object.keys(data[0]).join(', ')}\n`);
      } else {
        console.log(`   (vacía)\n`);
      }
    }
  }

  console.log(`\n📊 Total de tablas encontradas: ${tablasExistentes.length}`);
  console.log(`📝 Tablas: ${tablasExistentes.join(', ')}`);
}

verificarTablas();
