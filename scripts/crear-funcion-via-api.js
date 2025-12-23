// Crear función usando la API directa de Supabase
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const sqlFunction = `
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

async function ejecutarSQL() {
  console.log('🔌 Conectando a Supabase via API REST...\n')

  try {
    // Intentar ejecutar usando PostgREST
    const url = `${SUPABASE_URL}/rest/v1/rpc`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: sqlFunction
      })
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const text = await response.text()
      console.log('Response:', text)
      throw new Error(`HTTP ${response.status}: ${text}`)
    }

    console.log('✅ Función creada exitosamente!\n')

  } catch (error) {
    console.error('\n❌ No se puede ejecutar SQL directamente vía API')
    console.error('Error:', error.message)
    console.log('\n📋 SOLUCIÓN MÁS SIMPLE:\n')
    console.log('1. Ve a: https://supabase.com/dashboard/project/fhziabzxoqdxxzzgukfe/sql/new')
    console.log('2. Pega el siguiente SQL:')
    console.log('\n' + '='.repeat(80))
    console.log(sqlFunction)
    console.log('='.repeat(80) + '\n')
    console.log('3. Haz click en "Run" o presiona Ctrl+Enter\n')
  }
}

ejecutarSQL()
