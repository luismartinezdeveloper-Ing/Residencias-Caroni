/**
 * Asistente de Dominio Local - Residencias Caroní
 * Respuestas de alta fidelidad basadas en el libro de marca oficial de Añil Arquitectura
 * Ingeniería de Software: Ing. Luis Martinez
 */

export function getDomainFallbackReply(userMessage: string, contextUnit?: string): string {
  const query = (userMessage || '').toLowerCase();

  // 1. Precios, Reservas y Condiciones de Inversión
  if (
    query.includes('precio') ||
    query.includes('cuesta') ||
    query.includes('valor') ||
    query.includes('costo') ||
    query.includes('pago') ||
    query.includes('financ') ||
    query.includes('reserva') ||
    query.includes('loi')
  ) {
    return 'Los valores de preventa se sitúan en un rango referencial de $2.400 a $3.000 USD / m² según tipología y nivel. El proceso formal se articula mediante Letter of Intent (LOI) fiduciaria y cuenta custodia (Escrow). Las visitas y consultas de inversión se coordinan con cita previa.';
  }

  // 2. Metrajes, Superficies y Áreas
  if (
    query.includes('metro') ||
    query.includes('m2') ||
    query.includes('tamaño') ||
    query.includes('superficie') ||
    query.includes('area') ||
    query.includes('área')
  ) {
    return 'El proyecto contempla 8 residencias de gran escala: Dúplex Jardín en planta baja desde 931 m² hasta 1.030 m² con jardines privados, Residencias en Niveles 2 y 3 de 415 m² con terrazas continuas, y Penthouses Mirador en nivel superior de 586 m² a 591 m².';
  }

  // 3. Habitaciones, Distribución y Suites
  if (
    query.includes('habitaci') ||
    query.includes('cuarto') ||
    query.includes('dormitorio') ||
    query.includes('baño') ||
    query.includes('suite') ||
    query.includes('distribuci')
  ) {
    return 'Cada residencia cuenta con configuraciones de 3 a 4 habitaciones completas en suite con vestier independiente, salón principal con ventanales de piso a techo, área de servicio completa, lavandería y ascensor privado con acceso directo.';
  }

  // 4. Penthouses y Miradores
  if (
    query.includes('penthouse') ||
    query.includes('mirador') ||
    query.includes('ph') ||
    query.includes('cima')
  ) {
    return 'Los Penthouses Mirador Norte (591 m²) y Mirador Sur (586 m²) ocupan la cumbre del edificio, ofreciendo terrazas panorámicas de hasta 180 m² con vistas de 180° hacia el Parque Nacional El Ávila y 5 puestos de estacionamiento privado.';
  }

  // 5. Jardines y Plantas Bajas
  if (
    query.includes('jardin') ||
    query.includes('jardín') ||
    query.includes('planta baja') ||
    query.includes('pb')
  ) {
    return 'Las residencias Jardín Norte y Jardín Sur son dúplex con áreas totales de 1.030 m² y 931 m², respectivamente, que incorporan hasta 350 m² de jardín privado continuo al aire libre y piscina privada con vista a la montaña.';
  }

  // 6. Infraestructura, Respaldo y Estacionamiento
  if (
    query.includes('planta') ||
    query.includes('electr') ||
    query.includes('agua') ||
    query.includes('pozo') ||
    query.includes('estacion') ||
    query.includes('puesto') ||
    query.includes('parque') ||
    query.includes('ascensor') ||
    query.includes('seguridad')
  ) {
    return 'Residencias Caroní cuenta con respaldo eléctrico del 100%, pozo de agua profundo propio con planta de filtración, 36 puestos de estacionamiento subterráneo techado (4 a 5 por residencia), doble ascensor (privado y servicio) y garita blindada 24/7.';
  }

  // 7. Ubicación y Entorno
  if (
    query.includes('donde') ||
    query.includes('dónde') ||
    query.includes('ubic') ||
    query.includes('altamira') ||
    query.includes('avila') ||
    query.includes('ávila') ||
    query.includes('direccion') ||
    query.includes('dirección')
  ) {
    return 'El proyecto se implanta en la Transversal 8, entre 2da y 3ra Avenida de Altamira, Municipio Chacao, Caracas, en el último cuadro urbanístico al pie del Parque Nacional El Ávila.';
  }

  // 8. Arquitectura y Autoría
  if (
    query.includes('arquitect') ||
    query.includes('diseñ') ||
    query.includes('autor') ||
    query.includes('añil') ||
    query.includes('anil') ||
    query.includes('lancara') ||
    query.includes('martinez')
  ) {
    return 'La arquitectura y volumetría es de Añil Arquitectura, liderada por el Arq. Juan Carlos Láncara. La ingeniería de software y experiencia interactiva es desarrollada por el Ing. Luis Martinez.';
  }

  // 9. Citas y Visitas
  if (
    query.includes('cita') ||
    query.includes('visita') ||
    query.includes('contacto') ||
    query.includes('reunion') ||
    query.includes('reunión') ||
    query.includes('ver')
  ) {
    return 'La atención se brinda bajo estricto protocolo de confidencialidad y bajo la modalidad de visitas con cita. Puede solicitar su acreditación privada a través de nuestro portal.';
  }

  // 10. Saludos
  if (
    query.includes('hola') ||
    query.includes('buenos') ||
    query.includes('buenas') ||
    query.includes('saludos') ||
    query.includes('tarde') ||
    query.includes('dia') ||
    query.includes('días')
  ) {
    return 'Bienvenido a Residencias Caroní · Altamira. Estoy a su disposición para detallar las ocho residencias, memorias técnicas, planos arquitectónicos y condiciones de preventa. Visitas con cita.';
  }

  // 11. Respuesta genérica sobria de autor
  if (contextUnit) {
    return `Residencias Caroní contempla ocho piezas únicas en Altamira. Con respecto a ${contextUnit}, disponemos de fichas técnicas completas, cotas y planos bajo protocolo confidencial. Visitas con cita.`;
  }

  return 'Residencias Caroní: ocho residencias de autor concebidas como un solo volumen escultórico al pie del Ávila en Altamira, Caracas. Puede consultar disponibilidad, planos y especificaciones técnicas. Visitas con cita.';
}

