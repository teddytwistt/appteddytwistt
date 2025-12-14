/**
 * Provincias y localidades de Argentina
 */

export interface Localidad {
  nombre: string
}

export interface Provincia {
  nombre: string
  localidades: string[]
}

export const provinciasArgentina: Provincia[] = [
  {
    nombre: "Buenos Aires",
    localidades: [
      "La Plata", "Mar del Plata", "Bahía Blanca", "Tandil", "Olavarría",
      "Junín", "Pergamino", "Azul", "Necochea", "San Nicolás", "Chivilcoy",
      "Mercedes", "Luján", "San Pedro", "Zárate", "Campana", "Morón",
      "San Isidro", "Vicente López", "Lomas de Zamora", "Quilmes",
      "Avellaneda", "Lanús", "San Martín", "Tres de Febrero", "La Matanza",
      "Pilar", "Tigre", "Escobar", "San Fernando"
    ]
  },
  {
    nombre: "Catamarca",
    localidades: [
      "San Fernando del Valle de Catamarca", "Andalgalá", "Belén", "Santa María",
      "Tinogasta", "Recreo", "Fray Mamerto Esquiú", "Valle Viejo"
    ]
  },
  {
    nombre: "Chaco",
    localidades: [
      "Resistencia", "Presidencia Roque Sáenz Peña", "Villa Ángela", "Charata",
      "General José de San Martín", "Quitilipi", "Las Breñas", "Fontana",
      "Barranqueras", "Castelli"
    ]
  },
  {
    nombre: "Chubut",
    localidades: [
      "Rawson", "Comodoro Rivadavia", "Trelew", "Puerto Madryn", "Esquel",
      "Sarmiento", "Puerto Deseado", "Gaiman", "Dolavon"
    ]
  },
  {
    nombre: "Córdoba",
    localidades: [
      "Córdoba", "Río Cuarto", "Villa Carlos Paz", "Villa María", "San Francisco",
      "Alta Gracia", "Bell Ville", "Jesús María", "La Falda", "Cosquín",
      "Cruz del Eje", "Laboulaye", "Villa Dolores", "Marcos Juárez", "Río Tercero",
      "Arroyito", "Villa Allende", "La Calera", "Unquillo", "Carlos Paz"
    ]
  },
  {
    nombre: "Corrientes",
    localidades: [
      "Corrientes", "Goya", "Paso de los Libres", "Curuzú Cuatiá", "Mercedes",
      "Santo Tomé", "Esquina", "Bella Vista", "Monte Caseros", "Sauce"
    ]
  },
  {
    nombre: "Entre Ríos",
    localidades: [
      "Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay", "Gualeguay",
      "Victoria", "Villaguay", "Chajarí", "Federación", "Colón"
    ]
  },
  {
    nombre: "Formosa",
    localidades: [
      "Formosa", "Clorinda", "Pirané", "El Colorado", "Ibarreta",
      "Las Lomitas", "Ingeniero Juárez", "Comandante Fontana"
    ]
  },
  {
    nombre: "Jujuy",
    localidades: [
      "San Salvador de Jujuy", "San Pedro", "Libertador General San Martín", "Palpalá",
      "La Quiaca", "Humahuaca", "Tilcara", "Perico", "El Carmen"
    ]
  },
  {
    nombre: "La Pampa",
    localidades: [
      "Santa Rosa", "General Pico", "Toay", "Eduardo Castex", "Realicó",
      "Macachín", "Victorica", "General Acha", "Intendente Alvear"
    ]
  },
  {
    nombre: "La Rioja",
    localidades: [
      "La Rioja", "Chilecito", "Aimogasta", "Chamical", "Villa Unión",
      "Chepes", "Nonogasta", "Vinchina"
    ]
  },
  {
    nombre: "Mendoza",
    localidades: [
      "Mendoza", "San Rafael", "Godoy Cruz", "Guaymallén", "Luján de Cuyo",
      "Maipú", "Las Heras", "San Martín", "Rivadavia", "Tunuyán",
      "Tupungato", "Malargüe", "General Alvear", "Junín"
    ]
  },
  {
    nombre: "Misiones",
    localidades: [
      "Posadas", "Oberá", "Eldorado", "Puerto Iguazú", "Apóstoles",
      "Leandro N. Alem", "Puerto Rico", "Montecarlo", "Jardín América", "Wanda"
    ]
  },
  {
    nombre: "Neuquén",
    localidades: [
      "Neuquén", "San Martín de los Andes", "Zapala", "Cutral Có", "Centenario",
      "Plottier", "Junín de los Andes", "Villa La Angostura", "Chos Malal"
    ]
  },
  {
    nombre: "Río Negro",
    localidades: [
      "Viedma", "San Carlos de Bariloche", "General Roca", "Cipolletti", "Villa Regina",
      "Cinco Saltos", "Catriel", "El Bolsón", "Allen", "Choele Choel"
    ]
  },
  {
    nombre: "Salta",
    localidades: [
      "Salta", "San Ramón de la Nueva Orán", "Tartagal", "Metán", "Cafayate",
      "Rosario de la Frontera", "Joaquín V. González", "Embarcación", "General Güemes"
    ]
  },
  {
    nombre: "San Juan",
    localidades: [
      "San Juan", "Pocito", "Rawson", "Chimbas", "Santa Lucía",
      "Rivadavia", "Caucete", "Albardón", "9 de Julio", "Jáchal"
    ]
  },
  {
    nombre: "San Luis",
    localidades: [
      "San Luis", "Villa Mercedes", "La Punta", "Merlo", "Justo Daract",
      "Tilisarao", "Villa de la Quebrada", "Concarán"
    ]
  },
  {
    nombre: "Santa Cruz",
    localidades: [
      "Río Gallegos", "Caleta Olivia", "Pico Truncado", "Puerto Deseado",
      "Puerto San Julián", "El Calafate", "28 de Noviembre", "Las Heras"
    ]
  },
  {
    nombre: "Santa Fe",
    localidades: [
      "Santa Fe", "Rosario", "Rafaela", "Venado Tuerto", "Reconquista",
      "Villa Constitución", "Casilda", "Esperanza", "San Lorenzo", "Gálvez",
      "Cañada de Gómez", "Firmat", "Totoras", "Funes", "Pérez"
    ]
  },
  {
    nombre: "Santiago del Estero",
    localidades: [
      "Santiago del Estero", "La Banda", "Termas de Río Hondo", "Frías",
      "Añatuya", "Monte Quemado", "Fernández", "Suncho Corral"
    ]
  },
  {
    nombre: "Tierra del Fuego",
    localidades: [
      "Ushuaia", "Río Grande", "Tolhuin"
    ]
  },
  {
    nombre: "Tucumán",
    localidades: [
      "San Miguel de Tucumán", "San Pedro de Colalao", "Concepción", "Tafí Viejo",
      "Yerba Buena", "Aguilares", "Famaillá", "Monteros", "Banda del Río Salí"
    ]
  }
]

export function getLocalidadesByProvincia(provincia: string): string[] {
  const prov = provinciasArgentina.find(p => p.nombre === provincia)
  return prov ? prov.localidades : []
}

export function getNombreProvincias(): string[] {
  return provinciasArgentina.map(p => p.nombre)
}
