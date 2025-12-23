-- Función actualizada SIN validar fechas (valido_desde y valido_hasta)
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

  -- Validar usos máximos (si está configurado)
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

  -- Código válido!
  RETURN QUERY SELECT
    true,
    v_descuento.id,
    v_descuento.porcentaje_descuento,
    'Código válido'::TEXT;
END;
$$ LANGUAGE plpgsql;
