#!/bin/bash

# Script para ejecutar SQL en Supabase usando psql

export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Extraer el project ref de la URL de Supabase
SUPABASE_URL=$(grep SUPABASE_URL .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\///' | cut -d'.' -f1)

echo "🔌 Conectando a Supabase..."
echo "Project: $PROJECT_REF"
echo ""
echo "⚠️  NECESITO LA CONTRASEÑA DE LA BASE DE DATOS"
echo ""
echo "Para obtenerla:"
echo "1. Ve a https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
echo "2. En 'Connection string' → 'URI' verás algo como:"
echo "   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
echo "3. Copia solo la parte de [PASSWORD]"
echo ""
read -sp "Pega la contraseña aquí: " DB_PASSWORD
echo ""

# Construir la connection string
CONNECTION_STRING="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

echo ""
echo "📝 Ejecutando SQL..."
echo ""

# Crear archivo temporal con el SQL
cat > /tmp/create_function.sql << 'EOF'
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
EOF

# Ejecutar el SQL
psql "$CONNECTION_STRING" -f /tmp/create_function.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Función creada exitosamente!"
  echo ""
  echo "🧪 Probando la función..."
  psql "$CONNECTION_STRING" -c "SELECT * FROM validar_codigo_descuento('TEST123');"
else
  echo ""
  echo "❌ Error al crear la función"
fi

# Limpiar
rm /tmp/create_function.sql
