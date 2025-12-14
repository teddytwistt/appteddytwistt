-- Corregir porcentajes de descuento

UPDATE codigos_descuento
SET porcentaje_descuento = 10
WHERE codigo = 'BUZZY10';

UPDATE codigos_descuento
SET porcentaje_descuento = 20
WHERE codigo = 'BUZZY20';

-- Verificar
SELECT codigo, porcentaje_descuento, usos_maximos
FROM codigos_descuento
ORDER BY codigo;
