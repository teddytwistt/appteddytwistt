/**
 * Utilidades para manejar zonas horarias (versión CommonJS para scripts)
 * Argentina usa UTC-3 (ART - Argentina Time)
 */

/**
 * Obtiene la fecha y hora actual en zona horaria de Argentina (UTC-3)
 * y la retorna en formato ISO compatible con Supabase timestamptz
 */
function getArgentinaTimestamp() {
  const now = new Date()

  // Convertir a hora de Argentina (UTC-3)
  // Crear un formatter con timezone de Argentina
  const argentinaTime = new Date(now.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires'
  }))

  return argentinaTime.toISOString()
}

/**
 * Convierte una fecha UTC a hora de Argentina
 */
function toArgentinaTime(utcDate) {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate

  return new Date(date.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires'
  }))
}

/**
 * Formatea una fecha para mostrar en zona horaria de Argentina
 */
function formatArgentinaDateTime(dateString) {
  return new Date(dateString).toLocaleString("es-AR", {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

module.exports = {
  getArgentinaTimestamp,
  toArgentinaTime,
  formatArgentinaDateTime
}
