import { getMediaAssetUrl } from '../config/mediaConfig';

export type GalleryCategory = 'todos' | 'exterior' | 'pb-norte' | 'pb-sur' | 'penthouse';

export interface GallerySpec {
  label: string;
  value: string;
}

export interface GalleryItem {
  id: string;
  category: GalleryCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  image?: string;
  videoSrc?: string;
  videoPoster?: string;
  isVideo?: boolean;
  cota: string;
  orientation: string;
  material: string;
  superficie?: string;
  specs: GallerySpec[];
}

export const GALLERY_CATEGORIES: { id: GalleryCategory; label: string; count?: number }[] = [
  { id: 'todos', label: 'Colección Completa' },
  { id: 'exterior', label: 'Fachada & Exteriores' },
  { id: 'pb-norte', label: 'PB Norte · El Ávila' },
  { id: 'pb-sur', label: 'PB Sur · El Valle' },
  { id: 'penthouse', label: 'Penthouses & Terrazas' },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'ext-fachada-frontal',
    category: 'exterior',
    categoryLabel: 'IMPLANTACIÓN URBANA',
    title: 'Fachada Principal sobre la 8va Transversal',
    subtitle: 'Volumen monolítico en concreto visto en obra limpia. Su ritmo de llenos y vacíos dialoga con la herencia moderna caraqueña y tamiza la luz tropical con celosías arquitectónicas.',
    image: getMediaAssetUrl('/imagen/exterior/RC-exterior.frontal.jpeg'),
    cota: 'COTA ACCESO: +920.00 M.S.N.M.',
    orientation: 'Fachada Principal · Orientación Norte',
    material: 'Concreto Visto & Perfilería Anodizada Bronce',
    specs: [
      { label: 'Estructura Portante', value: 'Concreto Armado en Obra Limpia' },
      { label: 'Protección Solar', value: 'Celosías Horizontales Reguladas' },
      { label: 'Niveles', value: '4 Niveles + Terrazas Penthouse' },
      { label: 'Arquitectura', value: 'Añil Arquitectura — Arq. J.C. Láncara' },
    ],
  },
  {
    id: 'int-pb-norte-salon',
    category: 'pb-norte',
    categoryLabel: 'ESPACIALIDAD SOCIAL · PB NORTE',
    title: 'Gran Salón Social Diáfano PB Norte',
    subtitle: 'Imponente altura libre de 3.20 metros sin columnas intermedias. Ventanales corridos de suelo a techo que integran de forma natural el jardín privado y la silueta del Ávila.',
    image: getMediaAssetUrl('/imagen/interior/pb-norte/02_PB_Norte_Salon.jpeg'),
    cota: 'NIVEL PB: +921.00 M.S.N.M.',
    orientation: 'Norte Franco · Vista El Ávila',
    material: 'Mármol Travertino Navona & Madera de Nogal',
    superficie: '415 m² de Planta',
    specs: [
      { label: 'Altura Libre', value: '3.20 m Continuos' },
      { label: 'Superficie Estimada', value: '415 m² Totales' },
      { label: 'Pavimentos', value: 'Mármol Natural en Placas Extra Grandes' },
      { label: 'Vidriado', value: 'DVH Low-E con Filtro UV 99%' },
    ],
  },
  {
    id: 'int-pb-norte-terraza',
    category: 'pb-norte',
    categoryLabel: 'EXPANSIÓN PRIVADA · PB NORTE',
    title: 'Terraza Techada y Jardín Exclusivo PB Norte',
    subtitle: 'Transición generosa diseñada como salón exterior para recepciones de alta discreción. Los límites entre interior y exterior se diluyen mediante ventanales empotrados en piso y dintel.',
    image: getMediaAssetUrl('/imagen/interior/pb-norte/01_PB_Norte_Terraza.jpeg'),
    cota: 'NIVEL JARDÍN: +921.00 M.S.N.M.',
    orientation: 'Norte · Jardín Privado Perimetral',
    material: 'Deck Tecnológico & Muros Vaciados en Sitio',
    specs: [
      { label: 'Uso de Suelo', value: 'Jardín de Propiedad Exclusiva' },
      { label: 'Microclima', value: 'Ventilación Cruzada Ladera Ávila' },
      { label: 'Iluminación', value: 'Perimetral Rasante LED 2700K' },
      { label: 'Integración', value: 'Nivel Cero sin Desniveles Mecánicos' },
    ],
  },
  {
    id: 'int-pb-norte-cocina',
    category: 'pb-norte',
    categoryLabel: 'ALTA COCINA DE AUTOR',
    title: 'Cocina Gourmet & Isla Social PB Norte',
    subtitle: 'Isla central escultórica en cuarcita exótica con carpintería europea oculta sin tiradores. Equipada con electrodomésticos empotrados de grado profesional e iluminación cenital.',
    image: getMediaAssetUrl('/imagen/interior/pb-norte/03_PB_Norte_Cocina.jpg.jpeg'),
    cota: 'NIVEL PB: +921.00 M.S.N.M.',
    orientation: 'Nororiente · Luz Cenital Tamizada',
    material: 'Cuarcita Taj Mahal & Carpintería Europea',
    specs: [
      { label: 'Encimera', value: 'Cuarcita Taj Mahal Resistente a Ácidos' },
      { label: 'Herrajes', value: 'Sistemas Ocultos Amortiguados' },
      { label: 'Distribución', value: 'Isla Social con Zona de Desayuno' },
      { label: 'Extracción', value: 'Campana Integrada de Bajo Nivel Sonoro' },
    ],
  },
  {
    id: 'int-pb-sur-salon',
    category: 'pb-sur',
    categoryLabel: 'ESPACIALIDAD SOCIAL · PB SUR',
    title: 'Salón Principal Diáfano PB Sur',
    subtitle: 'Composición sobria orientada al sur hacia la panorámica del valle de Caracas. Su orientación captura una calidez solar envolvente durante las mañanas y tardes caraqueñas.',
    image: getMediaAssetUrl('/imagen/interior/pb-sur/05_PB_Sur_Salon.jpeg'),
    cota: 'NIVEL PB: +921.00 M.S.N.M.',
    orientation: 'Sur · Valle de Caracas',
    material: 'Mármol Crema Marfil & Artesanados de Madera',
    superficie: '425 m² de Planta',
    specs: [
      { label: 'Superficie Unidad', value: '425 m² Totales' },
      { label: 'Altura Interior', value: '3.20 m de Suelo a Techo' },
      { label: 'Orientación Lumínica', value: 'Asoleamiento Matutino Suave' },
      { label: 'Visual', value: 'Jardines Privados y Valle Central' },
    ],
  },
  {
    id: 'int-pb-sur-terraza',
    category: 'pb-sur',
    categoryLabel: 'EXPANSIÓN PRIVADA · PB SUR',
    title: 'Terraza y Deck Perimetral PB Sur',
    subtitle: 'Refugio de calma al aire libre con aleros de concreto que proporcionan sombra permanente y resguardo de la lluvia tropical sin restar luminosidad al interior.',
    image: getMediaAssetUrl('/imagen/interior/pb-sur/04_PB_Sur_Terraza.jpeg'),
    cota: 'NIVEL JARDÍN: +921.00 M.S.N.M.',
    orientation: 'Sur · Jardín Exclusivo',
    material: 'Piedra Natural Gran Formato & Muro Verde',
    specs: [
      { label: 'Sombra Proyectada', value: 'Alero Estructural de 2.80 m' },
      { label: 'Jardineras', value: 'Canales con Riego Automatizado' },
      { label: 'Doble Circulación', value: 'Acceso desde Salón y Habitación Principal' },
      { label: 'Seguridad', value: 'Cerramiento Vegetal Perimetral' },
    ],
  },
  {
    id: 'int-pb-sur-cocina',
    category: 'pb-sur',
    categoryLabel: 'ALTA COCINA DE AUTOR',
    title: 'Cocina & Desayunador PB Sur',
    subtitle: 'Concepto abierto que articula elegancia minimalista con funcionalidad gastronómica. Tonos minerales cálidos y conexión directa con el comedor formal y área de servicio.',
    image: getMediaAssetUrl('/imagen/interior/pb-sur/06_PB_Sur_Cocina.jpg.jpeg'),
    cota: 'NIVEL PB: +921.00 M.S.N.M.',
    orientation: 'Sur / Poniente',
    material: 'Piedra Sinterizada & Roble Ahumado',
    specs: [
      { label: 'Mobiliario', value: 'Columnas de Almacenamiento a Techo' },
      { label: 'Cava de Vinos', value: 'Área Climatizada para Colección' },
      { label: 'Iluminación', value: 'Riel Magnético Regulable DALI' },
      { label: 'Superficies', value: 'Antihuella y Antibacterianas' },
    ],
  },
  {
    id: 'ext-ph-ventanal',
    category: 'penthouse',
    categoryLabel: 'EL PENTHOUSE',
    title: 'La Cima Panorámica del Penthouse',
    subtitle: 'Perspectivas dominantes en el último nivel sobre el valle de Caracas y la cresta verde del Ávila. Terrazas perimetrales en voladizo, dobles alturas y privacidad absoluta.',
    image: getMediaAssetUrl('/imagen/exterior/RC-exterior.ventanal-PH.jpeg'),
    cota: 'COTA CIMA: +933.20 M.S.N.M.',
    orientation: 'Norte / Sur · Panorámica Integral',
    material: 'Vidrio Laminado Estructural & Acero Inoxidable',
    superficie: '850 m² a 1.030 m²',
    specs: [
      { label: 'Superficie', value: 'Hasta 1.030 m²' },
      { label: 'Acceso Exclusivo', value: 'Ascensor Privado con Código Biométrico' },
      { label: 'Terrazas', value: 'Balcones Corridos en Voladizo' },
      { label: 'Vistas', value: 'Eje Ávila & Valle Metropolitano' },
    ],
  },
  {
    id: 'ext-ventanal-p1p2',
    category: 'exterior',
    categoryLabel: 'HONESTIDAD CONSTRUCTIVA',
    title: 'Ventanales y Celosías en Niveles Intermedios',
    subtitle: 'Detalle de la carpintería arquitectónica en los Pisos 1 y 2. Modulación rigurosa que optimiza la relación entre luz cenital, intimidad familiar y eficiencia térmica.',
    image: getMediaAssetUrl('/imagen/exterior/RC.exterior.ventanal-p1op2.jpeg'),
    cota: 'COTA NIVEL 1/2: +926.80 M.S.N.M.',
    orientation: 'Fachada Norte · Altamira',
    material: 'Concreto Vaciado & Perfilería Minimalista',
    specs: [
      { label: 'Ventanería', value: 'Perfilería Oculta Embebida' },
      { label: 'Aislamiento Acústico', value: 'Reducción de Ruido de 42 dB' },
      { label: 'Mantenimiento', value: 'Materiales Nobles sin Pinturas Sintéticas' },
      { label: 'Protección', value: 'Aleros en Voladizo de Hormigón' },
    ],
  },
  {
    id: 'ext-costado-izquierdo',
    category: 'exterior',
    categoryLabel: 'VOLUMETRÍA ESCULTÓRICA',
    title: 'Alzado Lateral y Geometría de Pantallas',
    subtitle: 'Muros ciegos en concreto visto intercalados con aberturas estratégicas. Una arquitectura que resguarda la privacidad entre vecinos y orienta las miradas hacia la vegetación.',
    image: getMediaAssetUrl('/imagen/exterior/RC-exterior.costado.izquierdo.jpeg'),
    cota: 'COTA LATERAL: +924.50 M.S.N.M.',
    orientation: 'Lateral Poniente',
    material: 'Muros Pantalla de Concreto Armado',
    specs: [
      { label: 'Control Térmico', value: 'Protección Frente al Sol de Poniente' },
      { label: 'Acústica', value: 'Absorción por Masa de Hormigón' },
      { label: 'Geometría', value: 'Retranqueos Escalonados de Autor' },
      { label: 'Ejecución', value: 'Encofrado de Tabla Fina Texturizada' },
    ],
  },
  {
    id: 'ext-acceso-costado',
    category: 'exterior',
    categoryLabel: 'ACCESO & UMBRAL',
    title: 'Pórtico de Acceso Peatonal y Garita',
    subtitle: 'El umbral de ingreso está concebido como una experiencia de serenidad gradual: control biométrico discreto, pavimento en granito pulido y muro vegetal de bienvenida.',
    image: getMediaAssetUrl('/imagen/exterior/RC-exterior.entrada-costado.jpeg'),
    cota: 'COTA ACCESO: +920.50 M.S.N.M.',
    orientation: 'Acceso Sur · 8va Transversal',
    material: 'Granito Pulido & Cerramiento Metálico de Autor',
    specs: [
      { label: 'Control de Acceso', value: 'Garita de Máxima Seguridad 24/7' },
      { label: 'Circulación', value: 'Separación Peatonal y Vehicular' },
      { label: 'Umbral', value: 'Techo Volado con Iluminación Indirecta' },
      { label: 'Vegetación', value: 'Especies Tropicales de Bajo Consumo' },
    ],
  },
  {
    id: 'ext-pb-patio',
    category: 'exterior',
    categoryLabel: 'JARDINES & PAISAJISMO',
    title: 'Patio y Jardín Privado de Planta Baja',
    subtitle: 'Los apartamentos de Planta Baja gozan de un patio ajardinado de uso exclusivo. Un microclima fresco al pie del Ávila que ofrece el confort de una casa con la seguridad de un edificio.',
    image: getMediaAssetUrl('/imagen/exterior/RC-exterior.PB-patio.jpeg'),
    cota: 'COTA JARDÍN: +921.20 M.S.N.M.',
    orientation: 'Jardín Privado · Orientación Norte',
    material: 'Concreto Vaciado, Piedra Ávila & Gramado',
    specs: [
      { label: 'Sensación Espacial', value: 'Sensación de Casa Unifamiliar Aislada' },
      { label: 'Muros Límite', value: 'Encofrado Limpio con Enredaderas' },
      { label: 'Drenaje', value: 'Capa Drenante y Retención Hídrica' },
      { label: 'Seguridad', value: 'Circuito Cerrado y Sensores Perimetrales' },
    ],
  },
];
