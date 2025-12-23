// Script para crear la función validar_codigo_descuento en Supabase
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function crearFuncionValidarDescuento() {
  console.log('🔌 Conectando a Supabase...\n')

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const sqlFunction = `
-- Función para validar código de descuento
CREATE OR REPLACE FUNCTION validar_codigo_descuento(p_codigo VARCHAR)
RETURNS TABLE (
  valido BOOLEAN,
  id_descuento INTEGER,
  porcentaje INTEGER,
  mensaje TEXT
) AS $$
DECLARE
  v_descuento RECORD;
  v_usos_actuales BIGINT;
BEGIN
  SELECT * INTO v_descuento
  FROM codigos_descuento
  WHERE codigo = UPPER(p_codigo);

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código no válido'::TEXT;
    RETURN;
  END IF;

  IF NOT v_descuento.activo THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código inactivo'::TEXT;
    RETURN;
  END IF;

  IF v_descuento.valido_desde > NOW() THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código aún no vigente'::TEXT;
    RETURN;
  END IF;

  IF v_descuento.valido_hasta IS NOT NULL AND v_descuento.valido_hasta < NOW() THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código vencido'::TEXT;
    RETURN;
  END IF;

  IF v_descuento.usos_maximos IS NOT NULL THEN
    SELECT COUNT(*) INTO v_usos_actuales
    FROM pedidos
    WHERE id_codigo_descuento = v_descuento.id
    AND estado_pago = 'pagado';

    IF v_usos_actuales >= v_descuento.usos_maximos THEN
      RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código agotado'::TEXT;
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT
    true,
    v_descuento.id,
    v_descuento.porcentaje_descuento,
    'Código válido'::TEXT;
END;
$$ LANGUAGE plpgsql;
`

  try {
    console.log('📝 Creando función validar_codigo_descuento...\n')

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlFunction
    }).catch(async () => {
      // Si exec_sql no existe, intentamos con la API directa
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ query: sqlFunction })
        }
      )

      if (!response.ok) {
        // Última opción: usar la conexión directa de PostgreSQL
        throw new Error('No se pudo ejecutar con RPC, necesitas ejecutarlo manualmente')
      }

      return { data: await response.json(), error: null }
    })

    if (error) {
      console.error('❌ Error:', error)
      console.log('\n⚠️  No se pudo ejecutar automáticamente.')
      console.log('📋 Por favor, ejecuta este SQL manualmente en Supabase SQL Editor:\n')
      console.log(sqlFunction)
      process.exit(1)
    }

    console.log('✅ Función creada exitosamente!\n')

    // Probar la función
    console.log('🧪 Probando la función...\n')
    const { data: testData, error: testError } = await supabase
      .rpc('validar_codigo_descuento', { p_codigo: 'TEST123' })

    if (testError) {
      console.error('❌ Error al probar:', testError)
    } else {
      console.log('✅ Función funcionando correctamente')
      console.log('Resultado de prueba:', testData)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n⚠️  No se pudo ejecutar automáticamente.')
    console.log('📋 Por favor, ejecuta este SQL manualmente en Supabase SQL Editor:\n')
    console.log(sqlFunction)
    process.exit(1)
  }
}

crearFuncionValidarDescuento()
