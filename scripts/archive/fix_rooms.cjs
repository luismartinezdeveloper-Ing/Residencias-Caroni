const fs = require('fs');
let file = 'src/data/brandData.ts';
let content = fs.readFileSync(file, 'utf8');

// Residencia 02 Norte
content = content.replace(
  "rooms: 4,\n    parkingSpots: 4,\n    storageUnits: 1,\n    status: 'comprometida',\n    statusLabel: 'Normal',\n    floorPlanDescriptor: 'Residencia 02 Norte — Planta tipo · P2',\n    distinctiveAttribute: 'Fachada continua de 24 metros lineales orientada íntegramente hacia la montaña.',\n    roomList: [\n      'Ascensor privado a palier exclusivo',\n      'Gran salón con cerramientos de piso a techo',\n      'Terraza frontal de 92,01 m²',\n      'Habitación principal con vestier doble y baño de mármol',\n      '3 habitaciones secundarias con baño privado',\n      'Cocina, lavandero y dependencia de servicio',",
  "rooms: 3,\n    parkingSpots: 4,\n    storageUnits: 1,\n    status: 'comprometida',\n    statusLabel: 'Normal',\n    floorPlanDescriptor: 'Residencia 02 Norte — Planta tipo · P2',\n    distinctiveAttribute: 'Fachada continua de 24 metros lineales orientada íntegramente hacia la montaña.',\n    roomList: [\n      'Ascensor privado a palier exclusivo',\n      'Gran salón con cerramientos de piso a techo',\n      'Terraza frontal de 92,01 m²',\n      'Habitación principal con vestier doble y baño de mármol',\n      '2 habitaciones secundarias con baño privado',\n      'Cocina, lavandero y dependencia de servicio',"
);

// Residencia 02 Sur
content = content.replace(
  "rooms: 4,\n    parkingSpots: 4,\n    storageUnits: 1,\n    status: 'en_reserva',\n    statusLabel: 'Atención',\n    floorPlanDescriptor: 'Residencia 02 Sur — Planta tipo · P2',\n    distinctiveAttribute: 'Configuración de planta limpia con cruce de ventilación natural entre fachadas.',\n    roomList: [\n      'Palier privado con ascensor principal',\n      'Área de estar y comedor de 110 m²',\n      'Terraza panorámica sur',\n      '4 suites completas con baño privado',\n      'Estar íntimo / family',\n      'Área de faena y habitación de servicio',",
  "rooms: 3,\n    parkingSpots: 4,\n    storageUnits: 1,\n    status: 'en_reserva',\n    statusLabel: 'Atención',\n    floorPlanDescriptor: 'Residencia 02 Sur — Planta tipo · P2',\n    distinctiveAttribute: 'Configuración de planta limpia con cruce de ventilación natural entre fachadas.',\n    roomList: [\n      'Palier privado con ascensor principal',\n      'Área de estar y comedor de 110 m²',\n      'Terraza panorámica sur',\n      'Master suite y 2 suites auxiliares con baño privado',\n      'Estar íntimo / family',\n      'Área de faena y habitación de servicio',"
);

// Residencia 03 Norte
content = content.replace(
  "rooms: 4,\n    parkingSpots: 4,\n    storageUnits: 1,\n    status: 'comprometida',\n    statusLabel: 'Normal',\n    floorPlanDescriptor: 'Residencia 03 Norte — Planta tipo · P3',\n    distinctiveAttribute: 'Cota de altura +12.75 con visión directa a la masa forestal del parque.',\n    roomList: [\n      'Acceso directo por ascensor codificado',\n      'Salón con ventanales de alto desempeño acústico',\n      'Terraza continua de 92,01 m²',\n      'Master suite con doble vestier',\n      '3 suites adicionales',\n      'Family room y cocina independiente',",
  "rooms: 3,\n    parkingSpots: 4,\n    storageUnits: 1,\n    status: 'comprometida',\n    statusLabel: 'Normal',\n    floorPlanDescriptor: 'Residencia 03 Norte — Planta tipo · P3',\n    distinctiveAttribute: 'Cota de altura +12.75 con visión directa a la masa forestal del parque.',\n    roomList: [\n      'Acceso directo por ascensor codificado',\n      'Salón con ventanales de alto desempeño acústico',\n      'Terraza continua de 92,01 m²',\n      'Master suite con doble vestier',\n      '2 suites adicionales',\n      'Family room y cocina independiente',"
);

// Residencia 03 Sur
content = content.replace(
  "rooms: 4,\n    parkingSpots: 4,\n    storageUnits: 1,\n    status: 'disponible',\n    statusLabel: 'Normal',\n    floorPlanDescriptor: 'Residencia 03 Sur — Planta tipo · P3',\n    distinctiveAttribute: 'Dominio visual total sobre el paisaje urbano y el entorno verde.',\n    roomList: [\n      'Vestíbulo principal',\n      'Salón comedor integrado a terraza sur',\n      'Terraza descubierta de 92,01 m²',\n      'Master suite y 3 suites con baño',\n      'Estudio / Biblioteca',\n      'Cocina con despensa',",
  "rooms: 3,\n    parkingSpots: 4,\n    storageUnits: 1,\n    status: 'disponible',\n    statusLabel: 'Normal',\n    floorPlanDescriptor: 'Residencia 03 Sur — Planta tipo · P3',\n    distinctiveAttribute: 'Dominio visual total sobre el paisaje urbano y el entorno verde.',\n    roomList: [\n      'Vestíbulo principal',\n      'Salón comedor integrado a terraza sur',\n      'Terraza descubierta de 92,01 m²',\n      'Master suite y 2 suites con baño',\n      'Estudio / Biblioteca',\n      'Cocina con despensa',"
);

// Mirador Norte
content = content.replace(
  "rooms: 4,\n    parkingSpots: 5,\n    storageUnits: 1,\n    status: 'comprometida',\n    statusLabel: 'Normal',\n    floorPlanDescriptor: 'Mirador Norte — Coronación de la pieza',\n    distinctiveAttribute: 'Terraza-mirador a cota +25.50 con visual ininterrumpida de 180° hacia el Parque Nacional.',\n    roomList: [\n      'Acceso principal y ascensor de servicio',\n      'Salón de recepción con altura libre excepcional',\n      'Terraza-mirador de 180,50 m²',\n      'Piscina o lámina de agua privada en cubierta',\n      'Master bedroom con terraza privada y doble vestier',\n      '3 suites adicionales con baño',\n      'Family room y estudio',\n      'Cocina, despensa y dependencia de servicio',",
  "rooms: 3,\n    parkingSpots: 5,\n    storageUnits: 1,\n    status: 'comprometida',\n    statusLabel: 'Normal',\n    floorPlanDescriptor: 'Mirador Norte — Coronación de la pieza',\n    distinctiveAttribute: 'Terraza-mirador a cota +25.50 con visual ininterrumpida de 180° hacia el Parque Nacional.',\n    roomList: [\n      'Acceso principal y ascensor de servicio',\n      'Salón de recepción con altura libre excepcional',\n      'Terraza-mirador de 180,50 m²',\n      'Piscina o lámina de agua privada en cubierta',\n      'Master bedroom con terraza privada y doble vestier',\n      '2 suites adicionales con baño',\n      'Family room y estudio',\n      'Cocina, despensa y dependencia de servicio',"
);

// Mirador Sur
content = content.replace(
  "rooms: 4,\n    parkingSpots: 5,\n    storageUnits: 1,\n    status: 'disponible',\n    statusLabel: 'Normal',\n    floorPlanDescriptor: 'Mirador Sur — Coronación de la pieza',\n    distinctiveAttribute: 'Planta de coronación con perspectiva de toda la trama de Chacao y el valle caraqueño.',\n    roomList: [\n      'Palier privado de acceso exclusivo',\n      'Gran salón diáfano abierto a terraza',\n      'Terraza descubierta de 175,30 m²',\n      'Master suite y 3 suites con baño en suite',\n      'Estar íntimo',\n      '5 puestos de estacionamiento en sótano privado',",
  "rooms: 3,\n    parkingSpots: 5,\n    storageUnits: 1,\n    status: 'disponible',\n    statusLabel: 'Normal',\n    floorPlanDescriptor: 'Mirador Sur — Coronación de la pieza',\n    distinctiveAttribute: 'Planta de coronación con perspectiva de toda la trama de Chacao y el valle caraqueño.',\n    roomList: [\n      'Palier privado de acceso exclusivo',\n      'Gran salón diáfano abierto a terraza',\n      'Terraza descubierta de 175,30 m²',\n      'Master suite y 2 suites con baño en suite',\n      'Estar íntimo',\n      '5 puestos de estacionamiento en sótano privado',"
);

fs.writeFileSync(file, content);
console.log("Rooms updated.");
