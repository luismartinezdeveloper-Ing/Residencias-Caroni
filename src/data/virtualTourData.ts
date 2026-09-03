export interface TourHotspot {
  id: string;
  type: 'portal' | 'spec';
  pitch: number; // Vertical angle in degrees (-90 to 90)
  yaw: number;   // Horizontal angle in degrees (-180 to 180)
  title: string;
  targetRoomId?: string;
  specDetails?: {
    category: string;
    material: string;
    brandOrOrigin: string;
    description: string;
  };
}

export interface TourRoom {
  id: string;
  name: string;
  subtitle: string;
  areaM2: number;
  description: string;
  thumbnailColor: string;
  viewOrientation: 'Norte · El Ávila' | 'Sur · Valle de Caracas' | 'Jardín Privado';
  radarPos: { x: number; y: number }; // Relative position on mini floorplan (0-100%)
  initialYaw: number;
  initialPitch: number;
  hotspots: TourHotspot[];
}

export interface UnitTourConfig {
  unitId: string;
  unitName: string;
  typology: string;
  level: string;
  rooms: TourRoom[];
}

export const TOUR_ROOMS_DATA: TourRoom[] = [
  {
    id: 'salon',
    name: 'Gran Salón & Comedor',
    subtitle: 'Espacio social continuo con vistas panorámicas al Ávila',
    areaM2: 84,
    description: 'Amplitud de 3.20 m de altura libre, ventanales continuos de suelo a techo con protección térmica y acceso directo a la terraza.',
    thumbnailColor: '#8C7452',
    viewOrientation: 'Norte · El Ávila',
    radarPos: { x: 50, y: 65 },
    initialYaw: 0,
    initialPitch: 5,
    hotspots: [
      {
        id: 'portal-to-cocina',
        type: 'portal',
        pitch: -2,
        yaw: 85,
        title: 'Ir a Cocina Gourmet & Isla',
        targetRoomId: 'cocina',
      },
      {
        id: 'portal-to-terraza',
        type: 'portal',
        pitch: -5,
        yaw: 0,
        title: 'Salir a Terraza Panorámica',
        targetRoomId: 'terraza',
      },
      {
        id: 'portal-to-master',
        type: 'portal',
        pitch: 0,
        yaw: -110,
        title: 'Pasar a Master Suite',
        targetRoomId: 'master',
      },
      {
        id: 'spec-marmol',
        type: 'spec',
        pitch: -38,
        yaw: -20,
        title: 'Mármol Travertino Navona',
        specDetails: {
          category: 'Pavimentos & Revestimientos',
          material: 'Travertino Romano al corte de veta',
          brandOrOrigin: 'Tívoli, Italia · Acabado mate apomazado',
          description: 'Formatos de 120 x 120 cm con sellado microporoso atérmico y junta milimétrica rectificada.',
        },
      },
      {
        id: 'spec-ventanales',
        type: 'spec',
        pitch: 15,
        yaw: -35,
        title: 'Ventanería Térmica Schüco',
        specDetails: {
          category: 'Cerramientos de Fachada',
          material: 'Aluminio estructural anodizado bronce oscuro',
          brandOrOrigin: 'Schüco AWS 75.SI+ · Alemania',
          description: 'Vidrio doble laminado acústico con cámara de gas argón y filtro UV que mitiga el 88% de la radiación solar.',
        },
      },
      {
        id: 'spec-chimenea',
        type: 'spec',
        pitch: -12,
        yaw: 155,
        title: 'Chimenea Lineal de Bioetanol',
        specDetails: {
          category: 'Confort & Climatización',
          material: 'Acero corten y monolito de granito negro absoluto',
          brandOrOrigin: 'Planika Fire · Automatización Domótica',
          description: 'Quemador inteligente sin emisiones nocivas, controlable desde panel táctil o smartphone.',
        },
      },
    ],
  },
  {
    id: 'cocina',
    name: 'Cocina Gourmet & Cava',
    subtitle: 'Mobiliario de autor italiano con isla monolítica de cuarzo',
    areaM2: 38,
    description: 'Cocina integrada con concepto abierto y mamparas corredizas de madera nogal estriada para privacidad según la ocasión.',
    thumbnailColor: '#5C4E3C',
    viewOrientation: 'Sur · Valle de Caracas',
    radarPos: { x: 80, y: 45 },
    initialYaw: -15,
    initialPitch: 0,
    hotspots: [
      {
        id: 'portal-to-salon',
        type: 'portal',
        pitch: 0,
        yaw: -95,
        title: 'Regresar al Gran Salón',
        targetRoomId: 'salon',
      },
      {
        id: 'portal-to-terraza',
        type: 'portal',
        pitch: -4,
        yaw: -170,
        title: 'Ir a Terraza & Asador',
        targetRoomId: 'terraza',
      },
      {
        id: 'spec-isla',
        type: 'spec',
        pitch: -26,
        yaw: 5,
        title: 'Isla Central Calacatta Gold',
        specDetails: {
          category: 'Superficies de Trabajo',
          material: 'Cuarzo sinterizado antibacteriano de 20 mm',
          brandOrOrigin: 'Lapitec / Dekton · Italia',
          description: 'Resistencia total al calor directo y manchas. Cascada en laterales y barra desayunador en voladizo.',
        },
      },
      {
        id: 'spec-electrodomesticos',
        type: 'spec',
        pitch: 4,
        yaw: 48,
        title: 'Torre de Hornos & Inducción Gaggenau',
        specDetails: {
          category: 'Equipamiento Culinario',
          material: 'Vidrio antracita y acero inoxidable pulido',
          brandOrOrigin: 'Gaggenau Serie 400 · Múnich, Alemania',
          description: 'Horno combinado de vapor, calientaplatos, campana integrada en placa de inducción y cava de 64 botellas.',
        },
      },
    ],
  },
  {
    id: 'terraza',
    name: 'Terraza Panorámica',
    subtitle: 'Mirador privado al Cerro El Ávila y cielo caraqueño',
    areaM2: 52,
    description: 'Deck de madera teca de plantación sostenible con jardineras de riego automatizado, zona lounge y bar exterior.',
    thumbnailColor: '#4A6B53',
    viewOrientation: 'Norte · El Ávila',
    radarPos: { x: 50, y: 90 },
    initialYaw: 0,
    initialPitch: 10,
    hotspots: [
      {
        id: 'portal-to-salon',
        type: 'portal',
        pitch: -4,
        yaw: 175,
        title: 'Entrar al Gran Salón',
        targetRoomId: 'salon',
      },
      {
        id: 'portal-to-cocina',
        type: 'portal',
        pitch: -5,
        yaw: 120,
        title: 'Ir a Cocina Gourmet',
        targetRoomId: 'cocina',
      },
      {
        id: 'spec-deck',
        type: 'spec',
        pitch: -42,
        yaw: 10,
        title: 'Deck de Teca Birmana Natural',
        specDetails: {
          category: 'Pavimento Exterior',
          material: 'Teca aceitada de 24 mm sobre rastreles de aluminio',
          brandOrOrigin: 'Madera noble certificada FSC',
          description: 'Tacto suave para pies descalzos con drenaje oculto perimetral y durabilidad intemperie insuperable.',
        },
      },
      {
        id: 'spec-avila-view',
        type: 'spec',
        pitch: 20,
        yaw: -10,
        title: 'Orientación Norte · Parque Nacional El Ávila',
        specDetails: {
          category: 'Paisajismo & Bioclimática',
          material: 'Horizonte verde inalterable',
          brandOrOrigin: 'Altamira, Caracas (1,050 msnm)',
          description: 'Brisa fresca descendente de la montaña (efecto katabático nocturno) que garantiza confort térmico natural.',
        },
      },
    ],
  },
  {
    id: 'master',
    name: 'Master Suite & Balcón Privado',
    subtitle: 'Santuario de descanso con vestidor y vistas al Ávila',
    areaM2: 46,
    description: 'Aislamiento acústico de grado estudio de grabación, vestidor tipo boutique en madera nogal y balcón voladizo.',
    thumbnailColor: '#7A6044',
    viewOrientation: 'Norte · El Ávila',
    radarPos: { x: 20, y: 45 },
    initialYaw: 10,
    initialPitch: 2,
    hotspots: [
      {
        id: 'portal-to-salon',
        type: 'portal',
        pitch: -2,
        yaw: 125,
        title: 'Regresar a Zona Social',
        targetRoomId: 'salon',
      },
      {
        id: 'portal-to-bano',
        type: 'portal',
        pitch: 0,
        yaw: -80,
        title: 'Entrar al Baño Spa & Tina',
        targetRoomId: 'bano',
      },
      {
        id: 'spec-pisos-madera',
        type: 'spec',
        pitch: -35,
        yaw: -15,
        title: 'Parquet de Roble Europeo Listone Giordano',
        specDetails: {
          category: 'Pavimentos Área Íntima',
          material: 'Roble francés de triple capa con acabado cera natural',
          brandOrOrigin: 'Listone Giordano · Umbría, Italia',
          description: 'Tablas de 2.40 m de largo dispuestas en veta continua con tacto cálido y silencioso al caminar.',
        },
      },
      {
        id: 'spec-vestidor',
        type: 'spec',
        pitch: 8,
        yaw: 75,
        title: 'Vestidor Walk-In Poliform Senzafine',
        specDetails: {
          category: 'Carpintería Fina',
          material: 'Nogal canaletto, vidrio ahumado y piel saffiano',
          brandOrOrigin: 'Poliform Italia',
          description: 'Iluminación LED indirecta 2700K oculta en baldas, organizadores forrados en cuero y zapatero climatizado.',
        },
      },
    ],
  },
  {
    id: 'bano',
    name: 'Spa Baño Principal & Tina Exenta',
    subtitle: 'Ambiente monolítico en mármol con grifería Gessi',
    areaM2: 24,
    description: 'Doble lavamanos esculpido en piedra, cabina de ducha termostática efecto lluvia y tina escultórica exenta frente a ventanal tamizado.',
    thumbnailColor: '#6B685F',
    viewOrientation: 'Norte · El Ávila',
    radarPos: { x: 15, y: 20 },
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [
      {
        id: 'portal-to-master',
        type: 'portal',
        pitch: 0,
        yaw: 160,
        title: 'Volver a Master Suite',
        targetRoomId: 'master',
      },
      {
        id: 'spec-tina',
        type: 'spec',
        pitch: -20,
        yaw: 15,
        title: 'Tina Escultural Antoniolupi',
        specDetails: {
          category: 'Sanitarios de Autor',
          material: 'Cristalmood® traslúcido tono ámbar',
          brandOrOrigin: 'Antoniolupi · Toscana, Italia',
          description: 'Pieza monolítica de autor con desagüe oculto y llenado desde el piso.',
        },
      },
      {
        id: 'spec-griferia',
        type: 'spec',
        pitch: -8,
        yaw: -45,
        title: 'Grifería Gessi Hi-Fi Concealed',
        specDetails: {
          category: 'Grifería & Hidroterapia',
          material: 'Latón macizo con tratamiento PVD Bronce Cepillado',
          brandOrOrigin: 'Gessi · Milán, Italia',
          description: 'Controles termostáticos tipo botonera analógica de alta fidelidad con memoria de temperatura y rociador en cascada.',
        },
      },
    ],
  },
];
