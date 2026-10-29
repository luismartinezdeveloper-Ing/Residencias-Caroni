import * as THREE from 'three';
import { UnitData } from '../../../types/brand';

/**
 * Residencias Caroní · Altamira, Caracas
 * Maqueta Virtual Tridimensional de Alta Fidelidad Escultórica
 * 
 * Arquitectura & Concepción Espacial: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Ingeniería de Software & Experiencia Interactiva: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 * 
 * Reconstrucción Geométrica Oficial (fiel a RC-exterior.frontal.jpeg / RC-exterior.costado.jpeg / RC-exterior.PB-patio.jpeg):
 * 1. Balcones con Jardinera EXCLUSIVAMENTE en la Fachada Frontal (Z+): losas curvilíneas fluidas con esquinas redondeadas,
 *    antepecho continuo de concreto visto, jardineras corridas con densa biofilia y enredaderas cayendo en cascada.
 * 2. Fachada Posterior (Z-) Limpia, Monolítica y Sobria: losas planas a ras de fachada, muros de concreto en obra limpia
 *    y vanos controlados con carpintería grafito (sin balcones ni jardineras voladas).
 * 3. Gran Cubierta Escultórica en Voladizo Angular (Origami Roof Canopy) que se eleva hacia El Ávila (+21.25 a +25.50 m).
 * 4. Cielorrasos inferiores de cada balcón frontal revestidos en madera Teca/Ipe cálida con rieles de iluminación empotrada.
 * 5. Columnata Cilíndrica Monumental en la fachada frontal y laterales que atraviesa los niveles hasta la cubierta.
 * 6. Torres y Módulos de Celosías Verticales en Terracota / Madera Cálida (#A65B32) en esquina frontal y Planta Baja.
 * 7. Fachadas Laterales con Marco Pórtico de Concreto Visto, paños claros y vanos verticales grafito.
 */

export type SolarTimeMode = 'morning' | 'golden' | 'night';

export interface SceneMaterials {
  travertine: THREE.MeshStandardMaterial; // Concreto visto en obra limpia con conos de encofrado
  travertineDark: THREE.MeshStandardMaterial; // Concreto visto para buñas, molduras y cielorrasos
  concreteSlab: THREE.MeshStandardMaterial; // Losa estructural esculpida
  aluminumFrame: THREE.MeshStandardMaterial; // Aluminio grafito carbón / bronce anodizado
  architecturalGlass: THREE.MeshStandardMaterial; // Vidrio obsidiana diurno / linterna nocturna 2700K
  glassBalustrade: THREE.MeshStandardMaterial; // Barandilla de vidrio laminado ahumado
  interiorGlow: THREE.MeshStandardMaterial; // Resplandor cálido interior 2700K
  coveLed: THREE.MeshStandardMaterial; // Tira LED arquitectónica lineal
  interiorWood: THREE.MeshStandardMaterial; // Panelado de madera nogal / teca
  interiorIsland: THREE.MeshStandardMaterial; // Isla de cuarzo italiano
  planterFoliage: THREE.MeshStandardMaterial; // Follaje denso biofilia
  creeperFoliage: THREE.MeshStandardMaterial; // Enredaderas colgantes
  planterBox: THREE.MeshStandardMaterial; // Jardinera en concreto
  gardenGrass: THREE.MeshStandardMaterial; // Grama / césped fino
  woodPergola: THREE.MeshStandardMaterial; // Celosías en terracota / madera cálida de autor
  woodDeck: THREE.MeshStandardMaterial; // Deck y cielorraso en madera Teca / Ipe
  bronzeAccent: THREE.MeshStandardMaterial; // Bronce satinado arquitectónico
  waterMirror: THREE.MeshStandardMaterial; // Espejo de agua / carril de nado
  sotanoMat: THREE.MeshStandardMaterial; // Sótano y rampa antracita
  inkLine: THREE.LineBasicMaterial; // Trazado técnico arquitectónico
  highlightMat: THREE.MeshStandardMaterial; // Material de selección activa
}

export interface UnitMeshRegistry {
  [unitId: string]: THREE.Mesh[];
}

export interface UnitAnchor {
  unitId: string;
  name: string;
  code: string;
  level: string;
  position: THREE.Vector3;
  totalArea: number;
}

/**
 * Configuración de filtrado anisotrópico y mipmapping trilineal para texturas procedurales
 */
export function setupTextureMipmappingAndAnisotropy<T extends THREE.Texture>(
  texture: T,
  maxAnisotropy: number = 16
): T {
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.max(1, Math.min(maxAnisotropy, 16));
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generador procedural de Concreto Visto en Obra Limpia (Beton Brut de Autor)
 * - Tono marfil cálido (#EAE5DB), tableros fenólicos de 1.20m x 2.40m, buñas rehundidas y conos de encofrado.
 */
function createFairFacedConcreteTexture(maxAnisotropy: number = 16): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bCtx = bumpCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 1024;
  roughCanvas.height = 1024;
  const rCtx = roughCanvas.getContext('2d');

  if (ctx && bCtx && rCtx) {
    // 1. Matriz de Concreto Visto Marfil / Hueso (#EBE6DC)
    ctx.fillStyle = '#EBE6DC';
    ctx.fillRect(0, 0, 1024, 1024);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    rCtx.fillStyle = '#A5A096';
    rCtx.fillRect(0, 0, 1024, 1024);

    // 2. Microporosidad y agregados
    for (let i = 0; i < 95000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const gray = Math.floor(226 + Math.random() * 22);
      ctx.fillStyle = `rgb(${gray}, ${gray - 4}, ${gray - 10})`;
      ctx.fillRect(x, y, 1.2, 1.2);

      const bVal = Math.floor(123 + (Math.random() - 0.5) * 16);
      bCtx.fillStyle = `rgb(${bVal}, ${bVal}, ${bVal})`;
      bCtx.fillRect(x, y, 1.2, 1.2);

      const rVal = Math.floor(155 + Math.random() * 26);
      rCtx.fillStyle = `rgb(${rVal}, ${rVal}, ${rVal})`;
      rCtx.fillRect(x, y, 1.2, 1.2);
    }

    // 3. Vetas horizontales de encofrado fenólico
    for (let g = 0; g < 44; g++) {
      const y = Math.random() * 1024;
      const alpha = 0.04 + Math.random() * 0.05;
      ctx.strokeStyle = `rgba(165, 155, 140, ${alpha})`;
      ctx.lineWidth = 1.0 + Math.random() * 2.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // 4. Modulación de Tableros (256px x 512px)
    const panelH = 256;
    const panelW = 512;

    for (let row = 0; row <= 4; row++) {
      const y = row * panelH;

      ctx.fillStyle = 'rgba(65, 58, 50, 0.55)';
      ctx.fillRect(0, y - 2, 1024, 4);

      bCtx.fillStyle = '#1E1E1E';
      bCtx.fillRect(0, y - 2, 1024, 4);
      bCtx.fillStyle = '#555555';
      bCtx.fillRect(0, y - 4, 1024, 2);
      bCtx.fillRect(0, y + 2, 1024, 2);

      rCtx.fillStyle = '#CCCCCC';
      rCtx.fillRect(0, y - 2, 1024, 4);

      const xOffset = (row % 2 === 0) ? 0 : panelW * 0.5;
      for (let bx = xOffset; bx <= 1024; bx += panelW) {
        ctx.fillStyle = 'rgba(65, 58, 50, 0.50)';
        ctx.fillRect(bx - 2, y, 4, panelH);

        bCtx.fillStyle = '#202020';
        bCtx.fillRect(bx - 2, y, 4, panelH);
        bCtx.fillStyle = '#555555';
        bCtx.fillRect(bx - 4, y, 2, panelH);
        bCtx.fillRect(bx + 2, y, 2, panelH);

        rCtx.fillStyle = '#CCCCCC';
        rCtx.fillRect(bx - 2, y, 4, panelH);
      }
    }

    // 5. Conos de Encofrado (Tie-holes)
    const marginX = 48;
    const marginY = 40;
    const coneRadius = 6.5;

    for (let row = 0; row < 4; row++) {
      const yBase = row * panelH;
      const xOffset = (row % 2 === 0) ? 0 : panelW * 0.5;

      for (let bx = xOffset; bx < 1024 + panelW; bx += panelW) {
        const tieHoles = [
          { x: bx + marginX, y: yBase + marginY },
          { x: bx + panelW - marginX, y: yBase + marginY },
          { x: bx + marginX, y: yBase + panelH - marginY },
          { x: bx + panelW - marginX, y: yBase + panelH - marginY },
        ];

        tieHoles.forEach(({ x, y }) => {
          if (x < -10 || x > 1034) return;

          ctx.beginPath();
          ctx.arc(x, y, coneRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(85, 76, 66, 0.40)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, y, coneRadius * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = '#201E1A';
          ctx.fill();

          const grad = bCtx.createRadialGradient(x, y, 0, x, y, coneRadius);
          grad.addColorStop(0, '#101010');
          grad.addColorStop(0.45, '#353535');
          grad.addColorStop(1, '#808080');
          bCtx.beginPath();
          bCtx.arc(x, y, coneRadius, 0, Math.PI * 2);
          bCtx.fillStyle = grad;
          bCtx.fill();

          rCtx.beginPath();
          rCtx.arc(x, y, coneRadius, 0, Math.PI * 2);
          rCtx.fillStyle = '#D0D0D0';
          rCtx.fill();
        });
      }
    }
  }

  const colorMap = setupTextureMipmappingAndAnisotropy(new THREE.CanvasTexture(canvas), maxAnisotropy);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(2, 2);

  const bumpMap = setupTextureMipmappingAndAnisotropy(new THREE.CanvasTexture(bumpCanvas), maxAnisotropy);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);

  const roughnessMap = setupTextureMipmappingAndAnisotropy(new THREE.CanvasTexture(roughCanvas), maxAnisotropy);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);

  return { colorMap, bumpMap, roughnessMap };
}

// Mapa de entorno equirrectangular 360° para reflejos basados en física (IBL)
export function createArchitecturalEnvironmentMap(mode: SolarTimeMode): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (mode === 'morning') {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 290);
    skyGrad.addColorStop(0, '#436B92');
    skyGrad.addColorStop(0.45, '#84AFD0');
    skyGrad.addColorStop(0.85, '#DAE8F2');
    skyGrad.addColorStop(1, '#FAF5E8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 290);

    const sunGrad = ctx.createRadialGradient(280, 110, 6, 280, 110, 160);
    sunGrad.addColorStop(0, 'rgba(255, 255, 245, 1)');
    sunGrad.addColorStop(0.25, 'rgba(255, 248, 215, 0.6)');
    sunGrad.addColorStop(0.7, 'rgba(255, 240, 190, 0.15)');
    sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 1024, 290);

    ctx.fillStyle = '#677E75';
    ctx.beginPath();
    ctx.moveTo(0, 290);
    ctx.lineTo(0, 245);
    ctx.bezierCurveTo(160, 220, 320, 185, 480, 210);
    ctx.bezierCurveTo(640, 235, 800, 205, 960, 235);
    ctx.lineTo(1024, 245);
    ctx.lineTo(1024, 290);
    ctx.closePath();
    ctx.fill();

    const hazeGrad = ctx.createLinearGradient(0, 240, 0, 290);
    hazeGrad.addColorStop(0, 'rgba(220, 235, 245, 0)');
    hazeGrad.addColorStop(1, 'rgba(250, 245, 232, 0.7)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, 240, 1024, 50);

    const groundGrad = ctx.createLinearGradient(0, 290, 0, 512);
    groundGrad.addColorStop(0, '#D8D1C3');
    groundGrad.addColorStop(0.4, '#C2B8A4');
    groundGrad.addColorStop(1, '#827A6A');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 290, 1024, 222);
  } else if (mode === 'golden') {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 290);
    skyGrad.addColorStop(0, '#22324D');
    skyGrad.addColorStop(0.35, '#94513B');
    skyGrad.addColorStop(0.7, '#DB7A34');
    skyGrad.addColorStop(1, '#FFC76E');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 290);

    const sunGrad = ctx.createRadialGradient(780, 210, 10, 780, 210, 240);
    sunGrad.addColorStop(0, 'rgba(255, 248, 210, 1)');
    sunGrad.addColorStop(0.35, 'rgba(255, 160, 80, 0.65)');
    sunGrad.addColorStop(0.8, 'rgba(255, 110, 40, 0.2)');
    sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 1024, 290);

    ctx.fillStyle = '#392026';
    ctx.beginPath();
    ctx.moveTo(0, 290);
    ctx.lineTo(0, 245);
    ctx.bezierCurveTo(160, 220, 320, 185, 480, 210);
    ctx.bezierCurveTo(640, 235, 800, 205, 960, 235);
    ctx.lineTo(1024, 245);
    ctx.lineTo(1024, 290);
    ctx.closePath();
    ctx.fill();

    const groundGrad = ctx.createLinearGradient(0, 290, 0, 512);
    groundGrad.addColorStop(0, '#66452F');
    groundGrad.addColorStop(1, '#26160F');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 290, 1024, 222);
  } else {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 290);
    skyGrad.addColorStop(0, '#070B13');
    skyGrad.addColorStop(0.55, '#101727');
    skyGrad.addColorStop(0.85, '#192031');
    skyGrad.addColorStop(1, '#2F2930');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 290);

    ctx.fillStyle = '#090D14';
    ctx.beginPath();
    ctx.moveTo(0, 290);
    ctx.lineTo(0, 250);
    ctx.bezierCurveTo(160, 230, 320, 195, 480, 225);
    ctx.bezierCurveTo(640, 245, 800, 215, 960, 245);
    ctx.lineTo(1024, 250);
    ctx.lineTo(1024, 290);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#06080C';
    ctx.fillRect(0, 290, 1024, 222);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

/**
 * Creación de materiales de alta fidelidad arquitectónica
 */
export function createArchitecturalMaterials(maxAnisotropy: number = 16): SceneMaterials {
  const { colorMap, bumpMap, roughnessMap } = createFairFacedConcreteTexture(maxAnisotropy);

  return {
    travertine: new THREE.MeshStandardMaterial({
      color: 0xFAF8F4, // Concreto visto marfil claro en obra limpia
      map: colorMap,
      bumpMap: bumpMap,
      bumpScale: 0.055,
      roughnessMap: roughnessMap,
      roughness: 0.65,
      metalness: 0.02,
    }),
    travertineDark: new THREE.MeshStandardMaterial({
      color: 0xE2DDD2,
      map: colorMap,
      bumpMap: bumpMap,
      bumpScale: 0.045,
      roughnessMap: roughnessMap,
      roughness: 0.72,
      metalness: 0.03,
    }),
    concreteSlab: new THREE.MeshStandardMaterial({
      color: 0xEAE4DA, // Losa estructural esculpida con cantos suaves
      map: colorMap,
      bumpMap: bumpMap,
      bumpScale: 0.04,
      roughness: 0.68,
      metalness: 0.02,
    }),
    aluminumFrame: new THREE.MeshStandardMaterial({
      color: 0x161514, // Aluminio grafito carbón
      roughness: 0.20,
      metalness: 0.90,
    }),
    architecturalGlass: new THREE.MeshStandardMaterial({
      color: 0x0E1318, // Vidrio obsidiana diurno
      transparent: true,
      opacity: 0.90,
      roughness: 0.05,
      metalness: 0.35,
      envMapIntensity: 1.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    glassBalustrade: new THREE.MeshStandardMaterial({
      color: 0x13181D,
      transparent: true,
      opacity: 0.75,
      roughness: 0.04,
      metalness: 0.25,
      envMapIntensity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    interiorGlow: new THREE.MeshStandardMaterial({
      color: 0xFFF6E8,
      emissive: 0xFFA032,
      emissiveIntensity: 0.9,
      roughness: 0.6,
    }),
    coveLed: new THREE.MeshStandardMaterial({
      color: 0xFFF8E7,
      emissive: 0xFFB347,
      emissiveIntensity: 3.5,
      roughness: 0.1,
    }),
    interiorWood: new THREE.MeshStandardMaterial({
      color: 0x7E5635,
      roughness: 0.45,
      metalness: 0.06,
    }),
    interiorIsland: new THREE.MeshStandardMaterial({
      color: 0xF5F0E6,
      roughness: 0.35,
      metalness: 0.1,
    }),
    planterFoliage: new THREE.MeshStandardMaterial({
      color: 0x2A4525,
      roughness: 0.6,
      metalness: 0.02,
    }),
    creeperFoliage: new THREE.MeshStandardMaterial({
      color: 0x36582F,
      roughness: 0.55,
      metalness: 0.02,
    }),
    planterBox: new THREE.MeshStandardMaterial({
      color: 0x8C7452,
      roughness: 0.5,
      metalness: 0.15,
    }),
    gardenGrass: new THREE.MeshStandardMaterial({
      color: 0x426634,
      roughness: 0.88,
      metalness: 0.01,
    }),
    woodPergola: new THREE.MeshStandardMaterial({
      color: 0x9E5530, // Terracota / madera cálida auténtica de los brise-soleil oficiales
      roughness: 0.42,
      metalness: 0.12,
    }),
    woodDeck: new THREE.MeshStandardMaterial({
      color: 0x8A6D4B, // Deck y cielorraso en Teca / Ipe
      roughness: 0.4,
      metalness: 0.05,
    }),
    bronzeAccent: new THREE.MeshStandardMaterial({
      color: 0x8C7452,
      roughness: 0.35,
      metalness: 0.75,
    }),
    waterMirror: new THREE.MeshStandardMaterial({
      color: 0x253B42,
      transparent: true,
      opacity: 0.82,
      roughness: 0.08,
      metalness: 0.80,
      envMapIntensity: 1.15,
    }),
    sotanoMat: new THREE.MeshStandardMaterial({
      color: 0x201D18,
      roughness: 0.82,
      metalness: 0.15,
    }),
    inkLine: new THREE.LineBasicMaterial({
      color: 0x1B1813,
      linewidth: 1,
    }),
    highlightMat: new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      emissive: 0x8C7452,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.15,
    }),
  };
}

/**
 * Función auxiliar para obtener la cota Z exacta del borde frontal curvilíneo en función de X
 * Modela con exactitud la asimetría oficial de Residencias Caroní:
 * - Ala Norte (izq): proa escultórica extendida (prow = +0.48m) con radio r = 1.65m.
 * - Ala Sur (der): curva envolvente clásica de radio r = 1.25m.
 */
function getBalconyFrontZ(
  x: number,
  hw: number,
  hd: number,
  isLeftWing: boolean
): number {
  const r = isLeftWing ? 1.65 : 1.25;
  const prow = isLeftWing ? 0.48 : 0.0;

  // 1. Curva de esquina derecha (compartida en ambas alas hacia el lateral o centro)
  if (x > hw - r) {
    const norm = Math.min(1, Math.max(0, (x - (hw - r)) / r));
    return hd - (1 - Math.sqrt(Math.max(0, 1 - norm * norm))) * r;
  }

  // 2. Ala Norte (izquierda): proa escultórica y curva aerodinámica
  if (isLeftWing) {
    const prowCornerX = -hw + r * 1.6;
    if (x < prowCornerX) {
      const norm = Math.min(1, Math.max(0, (prowCornerX - x) / (r * 1.6)));
      return (hd + prow) - (1 - Math.sqrt(Math.max(0, 1 - norm * norm))) * (r * 1.2);
    }
    // Transición armónica cosenoidal continua entre el centro y la proa
    const span = (hw - r) - prowCornerX;
    const u = span > 0 ? Math.min(1, Math.max(0, (x - prowCornerX) / span)) : 0;
    return hd + prow * (0.5 + 0.5 * Math.cos(u * Math.PI));
  } else {
    // 3. Ala Sur (derecha): esquina izquierda interior suave
    if (x < -hw + r) {
      const norm = Math.min(1, Math.max(0, ((-hw + r) - x) / r));
      return hd - (1 - Math.sqrt(Math.max(0, 1 - norm * norm))) * r;
    }
    return hd;
  }
}

/**
 * Generador de silueta 2D de la Losa de Balcón Frontal (Bloque 1.1)
 */
function createBalconySlabShape(hw: number, hd: number, isLeftWing: boolean): THREE.Shape {
  const shape = new THREE.Shape();
  const r = isLeftWing ? 1.65 : 1.25;
  const prow = isLeftWing ? 0.48 : 0.0;

  shape.moveTo(-hw, -hd);
  shape.lineTo(hw, -hd);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);

  if (isLeftWing) {
    const prowCornerX = -hw + r * 1.6;
    shape.bezierCurveTo(
      hw * 0.2, hd,
      -hw * 0.2, hd + prow,
      prowCornerX, hd + prow
    );
    shape.quadraticCurveTo(-hw, hd + prow, -hw, hd + prow - r * 1.2);
  } else {
    shape.lineTo(-hw + r, hd);
    shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  }
  shape.lineTo(-hw, -hd);
  return shape;
}

/**
 * Generador de silueta 2D del Antepecho Curvilíneo Monolítico (Banda continua) (Bloque 1.2)
 */
function createBalconyParapetShape(
  hw: number,
  hd: number,
  isLeftWing: boolean,
  pThick: number = 0.30
): THREE.Shape {
  const shape = new THREE.Shape();
  const r = isLeftWing ? 1.65 : 1.25;
  const prow = isLeftWing ? 0.48 : 0.0;
  const sideLimitY = -hd * 0.15;

  // 1. Contorno Exterior
  if (isLeftWing) {
    const prowCornerX = -hw + r * 1.6;
    shape.moveTo(-hw, sideLimitY);
    shape.lineTo(-hw, hd + prow - r * 1.2);
    shape.quadraticCurveTo(-hw, hd + prow, prowCornerX, hd + prow);
    shape.bezierCurveTo(
      -hw * 0.2, hd + prow,
      hw * 0.2, hd,
      hw - r, hd
    );
  } else {
    shape.moveTo(-hw, sideLimitY);
    shape.lineTo(-hw, hd - r);
    shape.quadraticCurveTo(-hw, hd, -hw + r, hd);
    shape.lineTo(hw - r, hd);
  }
  shape.quadraticCurveTo(hw, hd, hw, hd - r);
  shape.lineTo(hw, sideLimitY);

  // 2. Retorno interior y Contorno Interior (offset de pThick)
  const innerHw = hw - pThick;
  shape.lineTo(innerHw, sideLimitY);
  shape.lineTo(innerHw, hd - r);
  shape.quadraticCurveTo(innerHw, hd - pThick, hw - r, hd - pThick);

  if (isLeftWing) {
    const prowCornerX = -hw + r * 1.6;
    shape.bezierCurveTo(
      hw * 0.2, hd - pThick,
      -hw * 0.2, hd + prow - pThick,
      prowCornerX, hd + prow - pThick
    );
    shape.quadraticCurveTo(-innerHw, hd + prow - pThick, -innerHw, hd + prow - r * 1.2);
  } else {
    shape.lineTo(-innerHw + r, hd - pThick);
    shape.quadraticCurveTo(-innerHw, hd - pThick, -innerHw, hd - r);
  }
  shape.lineTo(-innerHw, sideLimitY);
  shape.closePath();

  return shape;
}

/**
 * Generador de silueta 2D del Lecho Interior de la Jardinera (Canal estanco de plantación) (Bloque 1.2)
 */
function createBalconyPlanterBedShape(
  hw: number,
  hd: number,
  isLeftWing: boolean,
  pThick: number = 0.30
): THREE.Shape {
  const shape = new THREE.Shape();
  const r = isLeftWing ? 1.65 : 1.25;
  const prow = isLeftWing ? 0.48 : 0.0;
  const sideLimitY = -hd * 0.12;
  const bInset = 0.03;
  const innerHw = hw - pThick + bInset;

  if (isLeftWing) {
    const prowCornerX = -hw + r * 1.6;
    shape.moveTo(-innerHw, sideLimitY);
    shape.lineTo(-innerHw, hd + prow - r * 1.2);
    shape.quadraticCurveTo(-innerHw, hd + prow - pThick * 0.5, prowCornerX, hd + prow - pThick * 0.5);
    shape.bezierCurveTo(
      -hw * 0.2, hd + prow - pThick * 0.5,
      hw * 0.2, hd - pThick * 0.5,
      hw - r, hd - pThick * 0.5
    );
    shape.quadraticCurveTo(innerHw, hd - pThick * 0.5, innerHw, hd - r);
  } else {
    shape.moveTo(-innerHw, sideLimitY);
    shape.lineTo(-innerHw, hd - r);
    shape.quadraticCurveTo(-innerHw, hd - pThick * 0.5, -innerHw + r, hd - pThick * 0.5);
    shape.lineTo(hw - r, hd - pThick * 0.5);
    shape.quadraticCurveTo(innerHw, hd - pThick * 0.5, innerHw, hd - r);
  }
  shape.lineTo(innerHw, sideLimitY);
  shape.closePath();

  return shape;
}

// Foliage botánico estratificado con enredaderas colgantes adaptadas al contorno curvo
// EXCLUSIVAMENTE PARA LA FACHADA FRONTAL (Z+)
function createRichCurvedFoliage(
  width: number,
  depth: number,
  materials: SceneMaterials,
  isLeftWing: boolean = true
): THREE.Group {
  const group = new THREE.Group();
  const hw = width * 0.5;
  const hd = depth * 0.5;

  // 1. Masa vegetal densa dentro de la artesa de la jardinera (arbustos tropicales)
  const plantCount = Math.max(12, Math.floor(width * 2.4));
  for (let i = 0; i < plantCount; i++) {
    const u = i / plantCount;
    const x = -hw + 0.5 + u * (width - 1.0);
    const frontZ = getBalconyFrontZ(x, hw, hd, isLeftWing);
    const z = frontZ - 0.28 + (Math.random() - 0.5) * 0.14;

    const plantGeo = new THREE.DodecahedronGeometry(0.34 + Math.random() * 0.24, 1);
    const plantMesh = new THREE.Mesh(plantGeo, materials.planterFoliage);
    plantMesh.position.set(x, 0.48 + Math.random() * 0.26, z);
    plantMesh.scale.set(1.2 + Math.random() * 0.35, 0.85 + Math.random() * 0.45, 1.2 + Math.random() * 0.35);
    plantMesh.castShadow = true;
    group.add(plantMesh);
  }

  // 2. Enredaderas colgantes cayendo por el antepecho curvo hacia la calle
  const vineCount = Math.max(10, Math.floor(width * 1.8));
  for (let c = 0; c < vineCount; c++) {
    const u = c / vineCount;
    const x = -hw + 0.6 + u * (width - 1.2);
    const frontZ = getBalconyFrontZ(x, hw, hd, isLeftWing);
    const vineLength = 0.70 + Math.random() * 1.6;
    const dropSteps = 6;

    for (let s = 0; s < dropSteps; s++) {
      const dropY = -((s / dropSteps) * vineLength);
      const vineGeo = new THREE.SphereGeometry(0.16 + Math.random() * 0.12, 6, 6);
      const vineMesh = new THREE.Mesh(vineGeo, materials.creeperFoliage);
      vineMesh.position.set(
        x + (Math.random() - 0.5) * 0.12,
        dropY,
        frontZ + 0.12 // Asoma por el goterón exterior
      );
      vineMesh.scale.set(1.15, 0.75, 0.95);
      vineMesh.castShadow = true;
      group.add(vineMesh);
    }
  }

  return group;
}

// Celosía vertical de listones en Terracota / Madera Cálida (#9E5530)
function createTerracottaLouvers(
  width: number,
  height: number,
  depth: number,
  materials: SceneMaterials,
  slatCount: number = 7
): THREE.Group {
  const group = new THREE.Group();
  const frameThick = 0.08;

  const step = (width - frameThick * 2) / (slatCount + 1);
  const slatW = 0.06;
  const slatD = depth * 0.85;
  const slatGeo = new THREE.BoxGeometry(slatW, height - frameThick * 2, slatD);

  for (let i = 1; i <= slatCount; i++) {
    const sx = -width * 0.5 + frameThick + i * step;
    const slatMesh = new THREE.Mesh(slatGeo, materials.woodPergola);
    slatMesh.position.set(sx, 0, 0);
    slatMesh.castShadow = true;
    slatMesh.receiveShadow = true;
    group.add(slatMesh);
  }

  const topBar = new THREE.Mesh(new THREE.BoxGeometry(width, frameThick, depth), materials.woodPergola);
  topBar.position.y = height * 0.5 - frameThick * 0.5;
  topBar.castShadow = true;
  group.add(topBar);

  const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(width, frameThick, depth), materials.woodPergola);
  bottomBar.position.y = -height * 0.5 + frameThick * 0.5;
  bottomBar.castShadow = true;
  group.add(bottomBar);

  return group;
}

/**
 * Torre de Celosía Vertical en Terracota / Brise-Soleil Continuo (Bloque 1.4)
 * Genera el segmento de la torre vertical continua en la esquina frontal izquierda (Ala Norte).
 * Forma una espina arquitectónica vertical ininterrumpida de 21.25 m desde PB hasta cubierta.
 */
function createTerracottaTowerSegment(
  height: number,
  materials: SceneMaterials,
  slatCount: number = 9
): THREE.Group {
  const group = new THREE.Group();
  const width = 1.8;
  const depth = 0.32;
  const frameThick = 0.06;

  // 1. Montantes verticales laterales en acero grafito carbón
  const postGeo = new THREE.BoxGeometry(frameThick, height, depth);
  const leftPost = new THREE.Mesh(postGeo, materials.aluminumFrame);
  leftPost.position.set(-width * 0.5 + frameThick * 0.5, 0, 0);
  leftPost.castShadow = true;
  group.add(leftPost);

  const rightPost = new THREE.Mesh(postGeo, materials.aluminumFrame);
  rightPost.position.set(width * 0.5 - frameThick * 0.5, 0, 0);
  rightPost.castShadow = true;
  group.add(rightPost);

  // 2. Travesaños perimetrales superior e inferior
  const beamGeo = new THREE.BoxGeometry(width, frameThick, depth);
  const topBeam = new THREE.Mesh(beamGeo, materials.aluminumFrame);
  topBeam.position.set(0, height * 0.5 - frameThick * 0.5, 0);
  topBeam.castShadow = true;
  group.add(topBeam);

  const bottomBeam = new THREE.Mesh(beamGeo, materials.aluminumFrame);
  bottomBeam.position.set(0, -height * 0.5 + frameThick * 0.5, 0);
  bottomBeam.castShadow = true;
  group.add(bottomBeam);

  // 3. Lamas verticales esbeltas en tono terracota / madera noble (#9E5530)
  const innerW = width - frameThick * 2;
  const step = innerW / (slatCount + 1);
  const slatW = 0.045;
  const slatD = depth * 0.82;
  const slatH = height - frameThick * 2;
  const slatGeo = new THREE.BoxGeometry(slatW, slatH, slatD);

  for (let i = 1; i <= slatCount; i++) {
    const sx = -innerW * 0.5 + i * step;
    const slatMesh = new THREE.Mesh(slatGeo, materials.woodPergola);
    slatMesh.position.set(sx, 0, 0);
    slatMesh.rotation.y = 0.18; // Orientación solar bioclimática
    slatMesh.castShadow = true;
    slatMesh.receiveShadow = true;
    group.add(slatMesh);
  }

  return group;
}

/**
 * Columnata Cilíndrica Monumental por Nivel (Bloque 1.3)
 * Diámetro 0.38 m (radio 0.19 m), en concreto arquitectónico en obra limpia con plinto y capitel.
 * Las 4 columnas frontales principales (x = ±8.6, ±2.4; z = 7.15) atraviesan limpiamente las losas.
 */
function createMonumentalColumnsForLevel(
  startY: number,
  height: number,
  materials: SceneMaterials,
  isGroundFloor: boolean = false
): THREE.Group {
  const group = new THREE.Group();
  const colRadius = 0.19; // Ø 0.38 m
  const plinthH = 0.14;
  const capitalH = 0.10;
  const shaftH = height - (isGroundFloor ? plinthH : 0) - capitalH;

  const frontalCoords = [
    { x: -8.6, z: 7.15 }, // Ala Norte - Columna Exterior Frontal
    { x: -2.4, z: 7.15 }, // Ala Norte - Columna Interior Frontal
    { x:  2.4, z: 7.15 }, // Ala Sur - Columna Interior Frontal
    { x:  8.6, z: 7.15 }, // Ala Sur - Columna Exterior Frontal
  ];

  const lateralCoords = [
    { x: -10.6, z: 1.5 },  // Lateral Norte Frontal
    { x: -10.6, z: -3.5 }, // Lateral Norte Media
    { x:  10.6, z: 1.5 },  // Lateral Sur Frontal
    { x:  10.6, z: -3.5 }, // Lateral Sur Media
  ];

  const allCoords = [...frontalCoords, ...lateralCoords];

  const shaftGeo = new THREE.CylinderGeometry(colRadius, colRadius, shaftH, 24);
  const capitalGeo = new THREE.CylinderGeometry(colRadius * 1.18, colRadius, capitalH, 24);
  const plinthGeo = new THREE.CylinderGeometry(colRadius * 1.25, colRadius * 1.25, plinthH, 24);

  allCoords.forEach(({ x, z }) => {
    let currentY = startY;

    // Plinto inferior (solo en Planta Baja apoyado en el terreno)
    if (isGroundFloor) {
      const plinthMesh = new THREE.Mesh(plinthGeo, materials.travertineDark);
      plinthMesh.position.set(x, currentY + plinthH * 0.5, z);
      plinthMesh.castShadow = true;
      plinthMesh.receiveShadow = true;
      group.add(plinthMesh);
      currentY += plinthH;
    }

    // Fuste cilíndrico en concreto visto liso
    const shaftMesh = new THREE.Mesh(shaftGeo, materials.travertine);
    shaftMesh.position.set(x, currentY + shaftH * 0.5, z);
    shaftMesh.castShadow = true;
    shaftMesh.receiveShadow = true;
    group.add(shaftMesh);
    currentY += shaftH;

    // Capitel / collarín de ajuste bajo losa
    const capitalMesh = new THREE.Mesh(capitalGeo, materials.travertineDark);
    capitalMesh.position.set(x, currentY + capitalH * 0.5, z);
    capitalMesh.castShadow = true;
    capitalMesh.receiveShadow = true;
    group.add(capitalMesh);
  });

  return group;
}

/**
 * Núcleo Central Vidriado y Atrio de Circulación por Nivel (Bloque 1.5)
 * Conecta las dos alas residenciales con un muro cortina continuo en x = 0 y ascensor panorámico.
 */
function createCentralGlassAtriumLevel(
  startY: number,
  height: number,
  materials: SceneMaterials,
  isGroundFloor: boolean = false
): THREE.Group {
  const group = new THREE.Group();
  const atriumW = 2.4;
  const atriumD = 4.4;
  const atriumCenterZ = 4.3;

  // 1. Muro cortina vidriado frontal y posterior
  const frontGlassGeo = new THREE.BoxGeometry(atriumW, height, 0.05);
  const frontGlass = new THREE.Mesh(frontGlassGeo, materials.architecturalGlass);
  frontGlass.position.set(0, startY + height * 0.5, atriumCenterZ + atriumD * 0.5);
  group.add(frontGlass);

  const rearGlass = new THREE.Mesh(frontGlassGeo, materials.architecturalGlass);
  rearGlass.position.set(0, startY + height * 0.5, atriumCenterZ - atriumD * 0.5);
  group.add(rearGlass);

  // 2. Montantes y travesaños perimetrales en aluminio grafito
  const mullionGeo = new THREE.BoxGeometry(0.08, height, 0.12);
  const mLeft = new THREE.Mesh(mullionGeo, materials.aluminumFrame);
  mLeft.position.set(-atriumW * 0.5, startY + height * 0.5, atriumCenterZ + atriumD * 0.5);
  mLeft.castShadow = true;
  group.add(mLeft);

  const mRight = new THREE.Mesh(mullionGeo, materials.aluminumFrame);
  mRight.position.set(atriumW * 0.5, startY + height * 0.5, atriumCenterZ + atriumD * 0.5);
  mRight.castShadow = true;
  group.add(mRight);

  const transomGeo = new THREE.BoxGeometry(atriumW, 0.08, 0.12);
  const topTransom = new THREE.Mesh(transomGeo, materials.aluminumFrame);
  topTransom.position.set(0, startY + height - 0.04, atriumCenterZ + atriumD * 0.5);
  group.add(topTransom);

  const bottomTransom = new THREE.Mesh(transomGeo, materials.aluminumFrame);
  bottomTransom.position.set(0, startY + 0.04, atriumCenterZ + atriumD * 0.5);
  group.add(bottomTransom);

  // 3. Cabina de ascensor privado panorámico
  const shaftGeo = new THREE.BoxGeometry(1.6, height * 0.96, 1.8);
  const shaftMesh = new THREE.Mesh(shaftGeo, materials.bronzeAccent);
  shaftMesh.position.set(0, startY + height * 0.5, atriumCenterZ);
  group.add(shaftMesh);

  // Resplandor cálido interior del atrio
  const coreGlowGeo = new THREE.BoxGeometry(1.4, height * 0.9, 1.6);
  const coreGlow = new THREE.Mesh(coreGlowGeo, materials.interiorGlow);
  coreGlow.position.set(0, startY + height * 0.5, atriumCenterZ);
  group.add(coreGlow);

  // Faja LED lineal vertical
  const stripGeo = new THREE.BoxGeometry(0.03, height, 0.03);
  const strip = new THREE.Mesh(stripGeo, materials.coveLed);
  strip.position.set(-0.7, startY + height * 0.5, atriumCenterZ + 0.9);
  group.add(strip);

  // Puentes de conexión horizontal hacia las alas Norte y Sur
  const bridgeGeo = new THREE.BoxGeometry(0.8, 0.22, 1.6);
  const bridgeNorth = new THREE.Mesh(bridgeGeo, materials.travertine);
  bridgeNorth.position.set(-atriumW * 0.5 - 0.35, startY + 0.11, atriumCenterZ);
  group.add(bridgeNorth);

  const bridgeSouth = new THREE.Mesh(bridgeGeo, materials.travertine);
  bridgeSouth.position.set(atriumW * 0.5 + 0.35, startY + 0.11, atriumCenterZ);
  group.add(bridgeSouth);

  return group;
}

/**
 * Umbral de Acceso Monumental en Planta Baja (Bloque 1.6)
 * Incluye marquesina flotante, espejo de agua reflectante, pasarela peatonal flotante de basalto,
 * portal de doble altura con puerta pivotante de bronce, rampa/portón vehicular y jardines a cota cero.
 */
function createGroundFloorEntranceThreshold(materials: SceneMaterials): THREE.Group {
  const group = new THREE.Group();

  // 1. Espejo de Agua Reflectante Frontal (Water Mirror)
  const poolW = 6.4;
  const poolD = 5.4;
  const poolZ = 10.2;
  const rimThick = 0.25;

  const rimGeo = new THREE.BoxGeometry(poolW + rimThick * 2, 0.35, poolD + rimThick * 2);
  const rimMesh = new THREE.Mesh(rimGeo, materials.travertineDark);
  rimMesh.position.set(0, -0.22, poolZ);
  rimMesh.receiveShadow = true;
  group.add(rimMesh);

  const waterGeo = new THREE.BoxGeometry(poolW, 0.04, poolD);
  const waterMesh = new THREE.Mesh(waterGeo, materials.waterMirror);
  waterMesh.position.set(0, -0.08, poolZ);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // Tiras LED perimetrales subacuáticas
  const ledFront = new THREE.Mesh(new THREE.BoxGeometry(poolW * 0.94, 0.02, 0.03), materials.coveLed);
  ledFront.position.set(0, -0.14, poolZ + poolD * 0.48);
  group.add(ledFront);

  const ledBack = new THREE.Mesh(new THREE.BoxGeometry(poolW * 0.94, 0.02, 0.03), materials.coveLed);
  ledBack.position.set(0, -0.14, poolZ - poolD * 0.48);
  group.add(ledBack);

  // 2. Pasarela Peatonal Flotante (The Floating Bridge)
  const slabCount = 4;
  const slabW = 2.0;
  const slabL = 1.15;
  const slabH = 0.10;
  const bridgeStart = poolZ + poolD * 0.5 - slabL * 0.5;
  const bridgeEnd = poolZ - poolD * 0.5 + slabL * 0.5;
  const step = (bridgeEnd - bridgeStart) / (slabCount - 1);

  const bridgeSlabGeo = new THREE.BoxGeometry(slabW, slabH, slabL);
  for (let s = 0; s < slabCount; s++) {
    const sz = bridgeStart + s * step;
    const slabMesh = new THREE.Mesh(bridgeSlabGeo, materials.sotanoMat);
    slabMesh.position.set(0, 0.02, sz);
    slabMesh.castShadow = true;
    slabMesh.receiveShadow = true;
    group.add(slabMesh);

    // Tira LED cálida oculta bajo la arista frontal de cada losa
    const underLight = new THREE.Mesh(new THREE.BoxGeometry(slabW * 0.92, 0.015, 0.03), materials.coveLed);
    underLight.position.set(0, -0.04, sz + slabL * 0.48);
    group.add(underLight);
  }

  // 3. Marquesina / Canopy Volado de Acceso (PB)
  const canopyW = 4.6;
  const canopyD = 3.6;
  const canopyH = 0.20;
  const canopyZ = 8.8;
  const canopyY = 4.10;

  const canopyGeo = new THREE.BoxGeometry(canopyW, canopyH, canopyD);
  const canopyMesh = new THREE.Mesh(canopyGeo, materials.concreteSlab);
  canopyMesh.position.set(0, canopyY, canopyZ);
  canopyMesh.castShadow = true;
  group.add(canopyMesh);

  const canopySoffit = new THREE.Mesh(new THREE.BoxGeometry(canopyW - 0.04, 0.03, canopyD - 0.04), materials.woodDeck);
  canopySoffit.position.set(0, canopyY - canopyH * 0.5 - 0.015, canopyZ);
  group.add(canopySoffit);

  const canopyTrim = new THREE.Mesh(new THREE.BoxGeometry(canopyW + 0.06, canopyH + 0.02, 0.06), materials.bronzeAccent);
  canopyTrim.position.set(0, canopyY, canopyZ + canopyD * 0.5 + 0.03);
  group.add(canopyTrim);

  const canopyLed = new THREE.Mesh(new THREE.BoxGeometry(canopyW * 0.85, 0.02, 0.04), materials.coveLed);
  canopyLed.position.set(0, canopyY - canopyH * 0.5 - 0.03, canopyZ + canopyD * 0.35);
  group.add(canopyLed);

  // 4. Portal del Vestíbulo (Lobby de Doble Altura)
  const doorW = 1.6;
  const doorH = 3.5;
  const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.06);
  const doorMesh = new THREE.Mesh(doorGeo, materials.architecturalGlass);
  doorMesh.position.set(0, doorH * 0.5, 6.8);
  group.add(doorMesh);

  const doorFrameGeo = new THREE.BoxGeometry(doorW + 0.12, doorH + 0.06, 0.12);
  const doorFrame = new THREE.Mesh(doorFrameGeo, materials.aluminumFrame);
  doorFrame.position.set(0, doorH * 0.5, 6.8);
  group.add(doorFrame);

  const pullHandleGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.2, 16);
  const pullHandle = new THREE.Mesh(pullHandleGeo, materials.bronzeAccent);
  pullHandle.position.set(0.65, doorH * 0.45, 6.88);
  group.add(pullHandle);

  const lobbyBackWall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.8, 0.08), materials.interiorWood);
  lobbyBackWall.position.set(0, 1.9, 4.2);
  group.add(lobbyBackWall);

  const lobbyDesk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.7), materials.interiorIsland);
  lobbyDesk.position.set(0, 0.45, 5.2);
  group.add(lobbyDesk);

  // 5. Rampa y Portón de Acceso Vehicular al Sótano
  const rampW = 4.8;
  const rampL = 9.2;
  const rampGeo = new THREE.BoxGeometry(rampW, 0.35, rampL);
  const rampMesh = new THREE.Mesh(rampGeo, materials.sotanoMat);
  rampMesh.rotation.x = 0.28;
  rampMesh.position.set(-9.2, -1.65, 10.6);
  rampMesh.receiveShadow = true;
  group.add(rampMesh);

  const retainWallGeo = new THREE.BoxGeometry(0.35, 2.8, rampL);
  const retainWall = new THREE.Mesh(retainWallGeo, materials.travertine);
  retainWall.position.set(-9.2 + rampW * 0.5 + 0.2, 0.2, 10.6);
  retainWall.castShadow = true;
  group.add(retainWall);

  const gateW = 4.5;
  const gateH = 2.6;
  const gateFrame = new THREE.Mesh(new THREE.BoxGeometry(gateW, gateH, 0.12), materials.aluminumFrame);
  gateFrame.position.set(-9.2, -0.6, 6.8);
  group.add(gateFrame);

  const gateSlatCount = 9;
  const gateSlatStep = (gateH - 0.2) / gateSlatCount;
  for (let sl = 0; sl < gateSlatCount; sl++) {
    const sly = -0.6 - gateH * 0.5 + 0.15 + sl * gateSlatStep;
    const slatM = new THREE.Mesh(new THREE.BoxGeometry(gateW - 0.15, 0.12, 0.08), materials.woodPergola);
    slatM.position.set(-9.2, sly, 6.8);
    slatM.castShadow = true;
    group.add(slatM);
  }

  // 6. Biofilia y Jardines Frontales a Cota Cero (PB)
  const gardenNorthGeo = new THREE.BoxGeometry(3.2, 0.18, 5.2);
  const gardenNorth = new THREE.Mesh(gardenNorthGeo, materials.gardenGrass);
  gardenNorth.position.set(-4.5, -0.05, 10.2);
  gardenNorth.receiveShadow = true;
  group.add(gardenNorth);

  for (let p = 0; p < 8; p++) {
    const px = -4.5 + (Math.random() - 0.5) * 2.4;
    const pz = 10.2 + (Math.random() - 0.5) * 4.2;
    const plantGeo = new THREE.DodecahedronGeometry(0.38 + Math.random() * 0.25, 1);
    const plant = new THREE.Mesh(plantGeo, materials.planterFoliage);
    plant.position.set(px, 0.35 + Math.random() * 0.25, pz);
    plant.scale.set(1.1, 1.4, 1.1);
    plant.castShadow = true;
    group.add(plant);
  }

  const gardenSouthGeo = new THREE.BoxGeometry(4.2, 0.18, 5.2);
  const gardenSouth = new THREE.Mesh(gardenSouthGeo, materials.gardenGrass);
  gardenSouth.position.set(5.2, -0.05, 10.2);
  gardenSouth.receiveShadow = true;
  group.add(gardenSouth);

  for (let p = 0; p < 10; p++) {
    const px = 5.2 + (Math.random() - 0.5) * 3.4;
    const pz = 10.2 + (Math.random() - 0.5) * 4.2;
    const plantGeo = new THREE.DodecahedronGeometry(0.40 + Math.random() * 0.28, 1);
    const plant = new THREE.Mesh(plantGeo, materials.planterFoliage);
    plant.position.set(px, 0.35 + Math.random() * 0.25, pz);
    plant.scale.set(1.2, 1.5, 1.2);
    plant.castShadow = true;
    group.add(plant);
  }

  return group;
}

// Losa Curvilínea Esculpida de Balcón con Esquinas Redondeadas, Antepecho de Concreto y Cielorraso de Teca
// EXCLUSIVAMENTE PARA LA FACHADA FRONTAL (Z+)
// Bloque 1.1 (Losas asimétricas & cielorrasos) + Bloque 1.2 (Antepechos continuos & artesas de jardinera)
function createCurvilinearBalcony(
  width: number,
  depth: number,
  materials: SceneMaterials,
  options: {
    isLeftWing: boolean;
    hasTerracottaScreen?: boolean;
    hasWoodDeck?: boolean;
    levelCode?: string;
  }
): THREE.Group {
  const group = new THREE.Group();

  const hw = width * 0.5;
  const hd = depth * 0.5;
  const slabHeight = 0.35;
  const parapetH = 0.72;
  const pThick = 0.30;

  // -------------------------------------------------------------
  // 1. Losa Estructural Esculpida con Biselado Fino (Bloque 1.1)
  // -------------------------------------------------------------
  const slabShape = createBalconySlabShape(hw, hd, options.isLeftWing);
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: slabHeight,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  };

  const slabGeo = new THREE.ExtrudeGeometry(slabShape, extrudeSettings);
  slabGeo.rotateX(Math.PI * 0.5);

  const slabMesh = new THREE.Mesh(slabGeo, materials.concreteSlab);
  slabMesh.position.set(0, slabHeight * 0.5, 0);
  slabMesh.castShadow = true;
  slabMesh.receiveShadow = true;
  group.add(slabMesh);

  // -------------------------------------------------------------
  // 2. Cielorraso Inferior en Madera Teca/Ipé & Luminarias (Bloque 1.1)
  // -------------------------------------------------------------
  const soffitGeo = new THREE.ExtrudeGeometry(slabShape, {
    depth: 0.04,
    bevelEnabled: false,
  });
  soffitGeo.rotateX(Math.PI * 0.5);
  const soffitMesh = new THREE.Mesh(soffitGeo, materials.woodDeck);
  soffitMesh.position.set(0, -0.02, 0);
  group.add(soffitMesh);

  // Riel de iluminación cálida empotrada junto al paño vidriado
  const trackGeo = new THREE.BoxGeometry(width * 0.78, 0.02, 0.05);
  const trackMesh = new THREE.Mesh(trackGeo, materials.coveLed);
  trackMesh.position.set(0, -0.04, -hd * 0.2);
  group.add(trackMesh);

  // Micro-downlights cilíndricos empotrados en el cielo de madera
  const spotCount = 4;
  const spotStep = (width * 0.7) / (spotCount + 1);
  const spotGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12);
  for (let sp = 1; sp <= spotCount; sp++) {
    const spX = -(width * 0.7) * 0.5 + sp * spotStep;
    const spZ = getBalconyFrontZ(spX, hw, hd, options.isLeftWing) - 0.75;
    const spotMesh = new THREE.Mesh(spotGeo, materials.coveLed);
    spotMesh.position.set(spX, -0.04, spZ);
    group.add(spotMesh);
  }

  // -------------------------------------------------------------
  // 3. Antepecho Curvilíneo Monolítico de Concreto Visto (Bloque 1.2)
  // -------------------------------------------------------------
  const parapetShape = createBalconyParapetShape(hw, hd, options.isLeftWing, pThick);
  const parapetGeo = new THREE.ExtrudeGeometry(parapetShape, {
    depth: parapetH,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  });
  parapetGeo.rotateX(Math.PI * 0.5);

  const parapetMesh = new THREE.Mesh(parapetGeo, materials.travertine);
  parapetMesh.position.set(0, slabHeight + parapetH, 0);
  parapetMesh.castShadow = true;
  parapetMesh.receiveShadow = true;
  group.add(parapetMesh);

  // Remate superior en perfil metálico de bronce satinado arquitectónico con goterón
  const capGeo = new THREE.ExtrudeGeometry(parapetShape, {
    depth: 0.035,
    bevelEnabled: false,
  });
  capGeo.rotateX(Math.PI * 0.5);
  const capMesh = new THREE.Mesh(capGeo, materials.bronzeAccent);
  capMesh.position.set(0, slabHeight + parapetH + 0.035, 0);
  group.add(capMesh);

  // -------------------------------------------------------------
  // 4. Artesa de Jardinera Rehundida & Densa Biofilia (Bloque 1.2)
  // -------------------------------------------------------------
  const planterBedShape = createBalconyPlanterBedShape(hw, hd, options.isLeftWing, pThick);
  const planterBedGeo = new THREE.ExtrudeGeometry(planterBedShape, {
    depth: 0.25,
    bevelEnabled: false,
  });
  planterBedGeo.rotateX(Math.PI * 0.5);
  const planterBedMesh = new THREE.Mesh(planterBedGeo, materials.planterBox);
  planterBedMesh.position.set(0, slabHeight + 0.25, 0);
  group.add(planterBedMesh);

  // Biofilia tropical estratificada y enredaderas colgantes
  const foliage = createRichCurvedFoliage(width, depth, materials, options.isLeftWing);
  foliage.position.set(0, slabHeight + parapetH * 0.5, 0);
  group.add(foliage);

  // -------------------------------------------------------------
  // 5. Deck de Teca Interior Habitable
  // -------------------------------------------------------------
  if (options.hasWoodDeck) {
    const deckGeo = new THREE.BoxGeometry(width - 0.8, 0.03, depth * 0.58);
    const deck = new THREE.Mesh(deckGeo, materials.woodDeck);
    deck.position.set(0, slabHeight + 0.02, -depth * 0.14);
    deck.receiveShadow = true;
    group.add(deck);
  }

  // -------------------------------------------------------------
  // 6. Celosía Vertical de Terracota en Esquina
  // -------------------------------------------------------------
  if (options.hasTerracottaScreen) {
    const louverW = 1.4;
    const louverH = 3.6;
    const louvers = createTerracottaLouvers(louverW, louverH, 0.32, materials, 5);
    louvers.position.set(options.isLeftWing ? -hw + 0.8 : hw - 0.8, slabHeight + louverH * 0.5, hd - 0.2);
    group.add(louvers);
  }

  return group;
}

// Fachada posterior limpia, sobria y monolítica (sin balcones ni jardineras voladas, fiel al diseño oficial)
function createRearFacadeEnclosure(
  width: number,
  height: number,
  materials: SceneMaterials
): THREE.Group {
  const group = new THREE.Group();
  const slabH = 0.32;

  // Losa estructural plana a ras de fachada posterior
  const slab = new THREE.Mesh(new THREE.BoxGeometry(width, slabH, 0.45), materials.concreteSlab);
  slab.position.set(0, slabH * 0.5, 0);
  slab.receiveShadow = true;
  group.add(slab);

  // Muro posterior de concreto visto en obra limpia con despiece sobrio
  const wallH = height - slabH;
  const wall = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, wallH, 0.35), materials.travertine);
  wall.position.set(0, wallH * 0.5 + slabH, 0);
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);

  // Bandas de ventanales controlados de vano arquitectónico elegante
  const winCount = 3;
  const winStep = (width - 2.0) / (winCount + 1);
  for (let i = 1; i <= winCount; i++) {
    const wx = -(width - 2.0) * 0.5 + i * winStep;
    const winGeo = new THREE.BoxGeometry(1.6, 2.2, 0.38);
    const win = new THREE.Mesh(winGeo, materials.architecturalGlass);
    win.position.set(wx, height * 0.5, 0);
    group.add(win);

    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.72, 2.32, 0.42), materials.aluminumFrame);
    winFrame.position.set(wx, height * 0.5, 0);
    group.add(winFrame);
  }

  return group;
}

/**
 * Gran Cubierta Escultórica en Voladizo Angular (Origami Roof Canopy) hacia El Ávila (Bloque 3)
 * Arquitectura cumbre de autor: Añil Arquitectura — Arq. Juan Carlos Láncara.
 * Losa alada poligonal que se eleva en voladizo hacia El Ávila (cota +21.25 a +25.50 m)
 * con cielorraso en madera Teca/Ipé, goterón perimetral en bronce satinado, fajas cove LED,
 * micro-downlights, vigas maestras de arriostramiento, lucernarios cenitales y plataforma técnica.
 */
function createMonumentalOrigamiCanopy(materials: SceneMaterials): THREE.Group {
  const group = new THREE.Group();

  // 1. Silueta 2D Poligonal Escultórica de la Cubierta Alada
  const canopyShape = new THREE.Shape();
  // Arista posterior (Z-) con vuelo de protección
  canopyShape.moveTo(-12.4, -9.0);
  canopyShape.lineTo(12.4, -9.0);
  // Costado oriental (Ala Sur)
  canopyShape.lineTo(13.4, 1.8);
  canopyShape.lineTo(11.6, 9.8);
  // Frente central con quiebre angular
  canopyShape.lineTo(2.4, 8.8);
  // Gran proa angular en voladizo dinámico hacia El Ávila (esquina nor-oeste)
  canopyShape.lineTo(-14.2, 12.4);
  // Retorno occidental (Ala Norte)
  canopyShape.lineTo(-13.0, 2.8);
  canopyShape.closePath();

  // 2. Losa estructural principal en concreto visto con biselado tridimensional
  const slabDepth = 0.58;
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: slabDepth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.10,
    bevelThickness: 0.10,
  };

  const canopyGeo = new THREE.ExtrudeGeometry(canopyShape, extrudeSettings);
  canopyGeo.rotateX(Math.PI * 0.5);

  const canopyMesh = new THREE.Mesh(canopyGeo, materials.concreteSlab);
  canopyMesh.position.set(0, 21.65, 0);
  canopyMesh.rotation.x = -0.045; // Inclinación ascendente hacia El Ávila
  canopyMesh.rotation.z = -0.022; // Elevación escultórica de la proa izquierda
  canopyMesh.castShadow = true;
  canopyMesh.receiveShadow = true;
  group.add(canopyMesh);

  // 3. Remate perimetral / Albardilla goterón en perfil de bronce satinado
  const trimGeo = new THREE.ExtrudeGeometry(canopyShape, {
    depth: 0.045,
    bevelEnabled: false,
  });
  trimGeo.rotateX(Math.PI * 0.5);
  const trimMesh = new THREE.Mesh(trimGeo, materials.bronzeAccent);
  trimMesh.position.set(0, 21.65 + slabDepth * 0.5 + 0.02, 0);
  trimMesh.rotation.x = -0.045;
  trimMesh.rotation.z = -0.022;
  group.add(trimMesh);

  // 4. Cielorraso inferior continuo en madera de Teca / Ipé (Intradós visible)
  const soffitGeo = new THREE.ExtrudeGeometry(canopyShape, {
    depth: 0.05,
    bevelEnabled: false,
  });
  soffitGeo.rotateX(Math.PI * 0.5);
  const soffitMesh = new THREE.Mesh(soffitGeo, materials.woodDeck);
  soffitMesh.position.set(0, 21.57, 0);
  soffitMesh.rotation.x = -0.045;
  soffitMesh.rotation.z = -0.022;
  group.add(soffitMesh);

  // 5. Sistema de Iluminación Cove LED Perimetral en Intradós
  // Riel longitudinal principal sobre terrazas
  const ledStripFront = new THREE.Mesh(new THREE.BoxGeometry(22.0, 0.025, 0.06), materials.coveLed);
  ledStripFront.position.set(-0.8, 21.54, 5.5);
  ledStripFront.rotation.x = -0.045;
  ledStripFront.rotation.z = -0.022;
  group.add(ledStripFront);

  // Riel en la proa volada norte
  const ledProw = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.025, 0.06), materials.coveLed);
  ledProw.position.set(-8.5, 21.62, 9.2);
  ledProw.rotation.x = -0.045;
  ledProw.rotation.y = 0.32;
  ledProw.rotation.z = -0.022;
  group.add(ledProw);

  // Constelación de micro-downlights cálidos embutidos en el cielo de teca
  const downlightCount = 8;
  const downlightGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12);
  for (let d = 0; d < downlightCount; d++) {
    const u = d / (downlightCount - 1);
    const dx = -9.5 + u * 19.0;
    const dz = 3.5 + Math.sin(u * Math.PI) * 2.5;
    const dy = 21.55 - dz * 0.045;
    const dlMesh = new THREE.Mesh(downlightGeo, materials.coveLed);
    dlMesh.position.set(dx, dy, dz);
    dlMesh.rotation.x = -0.045;
    group.add(dlMesh);
  }

  // 6. Vigas Maestras de Soporte Estructural en Concreto Visto
  // Viga maestra Ala Norte (x = -5.6)
  const beamNorth = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.85, 17.5), materials.travertine);
  beamNorth.position.set(-5.6, 21.25, 0);
  beamNorth.castShadow = true;
  group.add(beamNorth);

  // Viga maestra Ala Sur (x = +5.6)
  const beamSouth = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.85, 17.5), materials.travertine);
  beamSouth.position.set(5.6, 21.25, 0);
  beamSouth.castShadow = true;
  group.add(beamSouth);

  // Vigas transversales de amarre y atrio
  const crossBeamFront = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.50, 0.38), materials.travertineDark);
  crossBeamFront.position.set(0, 21.35, 6.8);
  crossBeamFront.castShadow = true;
  group.add(crossBeamFront);

  const crossBeamCenter = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.50, 0.38), materials.travertineDark);
  crossBeamCenter.position.set(0, 21.35, 0);
  crossBeamCenter.castShadow = true;
  group.add(crossBeamCenter);

  // Cartelas estructurales biseladas en las cabezas de las 4 columnas frontales
  const columnCapCoords = [
    { x: -8.6, z: 7.15 },
    { x: -2.4, z: 7.15 },
    { x:  2.4, z: 7.15 },
    { x:  8.6, z: 7.15 },
  ];
  const corbelGeo = new THREE.BoxGeometry(0.55, 0.35, 0.55);
  columnCapCoords.forEach(({ x, z }) => {
    const corbel = new THREE.Mesh(corbelGeo, materials.travertineDark);
    corbel.position.set(x, 21.40, z);
    corbel.castShadow = true;
    group.add(corbel);
  });

  // 7. Lucernarios Cenitales Acristalados (Skylights)
  // Lucernario central a dos aguas sobre el atrio de circulación vertical
  const skylightGroup = new THREE.Group();
  skylightGroup.position.set(0, 22.0, 3.5);

  const skyRidgeGeo = new THREE.BoxGeometry(0.10, 0.10, 4.4);
  const skyRidge = new THREE.Mesh(skyRidgeGeo, materials.aluminumFrame);
  skyRidge.position.set(0, 0.45, 0);
  skylightGroup.add(skyRidge);

  // Paños de vidrio a dos aguas
  const glassPaneGeo = new THREE.BoxGeometry(1.2, 0.05, 4.2);
  const glassLeft = new THREE.Mesh(glassPaneGeo, materials.architecturalGlass);
  glassLeft.position.set(-0.55, 0.22, 0);
  glassLeft.rotation.z = 0.38;
  skylightGroup.add(glassLeft);

  const glassRight = new THREE.Mesh(glassPaneGeo, materials.architecturalGlass);
  glassRight.position.set(0.55, 0.22, 0);
  glassRight.rotation.z = -0.38;
  skylightGroup.add(glassRight);

  // Marco base del lucernario en bronce
  const skyBaseGeo = new THREE.BoxGeometry(2.4, 0.15, 4.5);
  const skyBase = new THREE.Mesh(skyBaseGeo, materials.bronzeAccent);
  skyBase.position.set(0, 0, 0);
  skylightGroup.add(skyBase);

  // Resplandor interior del lucernario
  const skyGlow = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 4.0), materials.interiorGlow);
  skyGlow.position.set(0, 0.05, 0);
  skylightGroup.add(skyGlow);

  group.add(skylightGroup);

  // Lucernario privado sobre escalera de Pent-House Norte
  const phSkylight = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 1.8), materials.aluminumFrame);
  phSkylight.position.set(-5.6, 22.05, 1.2);
  group.add(phSkylight);

  const phGlass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 1.6), materials.architecturalGlass);
  phGlass.position.set(-5.6, 22.18, 1.2);
  group.add(phGlass);

  // 8. Plataforma Técnica Cenital Retranqueada (Equipamiento Mecánico & Solar)
  // Ubicada en la zona central-posterior de la cubierta, oculta a la visual de calle
  const mechPlatGeo = new THREE.BoxGeometry(7.2, 0.25, 4.2);
  const mechPlat = new THREE.Mesh(mechPlatGeo, materials.travertineDark);
  mechPlat.position.set(0, 21.90, -4.8);
  mechPlat.receiveShadow = true;
  group.add(mechPlat);

  // Recinto de celosías acústicas grafito para equipos VRF
  const enclosureGeo = new THREE.BoxGeometry(6.8, 1.35, 3.8);
  const enclosure = new THREE.Mesh(enclosureGeo, materials.aluminumFrame);
  enclosure.position.set(0, 22.65, -4.8);
  enclosure.castShadow = true;
  group.add(enclosure);

  // Módulos solares fotovoltaicos inclinados a 12°
  const solarPanelCount = 4;
  const panelSpacing = 1.4;
  for (let sp = 0; sp < solarPanelCount; sp++) {
    const spX = -2.1 + sp * panelSpacing;
    const panelMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 2.2), materials.sotanoMat);
    panelMesh.position.set(spX, 23.45, -4.8);
    panelMesh.rotation.x = -0.21; // Inclinación solar
    panelMesh.castShadow = true;
    group.add(panelMesh);
  }

  // Pararrayos arquitectónico esbelto en bronce
  const rodGeo = new THREE.CylinderGeometry(0.015, 0.025, 2.4, 12);
  const rod = new THREE.Mesh(rodGeo, materials.bronzeAccent);
  rod.position.set(0, 24.50, -4.8);
  group.add(rod);

  return group;
}

/**
 * Fachada Lateral Estratificada por Nivel con Marco Pórtico y Buñas de Concreto (Bloque 2)
 * Arquitectura oficial de Añil Arquitectura — Arq. Juan Carlos Láncara.
 * Diseñado con modularidad por estrato para soportar perfectamente vistas de corte de nivel
 * y vista explotada (exploded view) sin solapamiento volumétrico.
 */
function createLateralFacadeLevel(
  startY: number,
  height: number,
  isLeft: boolean,
  materials: SceneMaterials,
  isDoubleHeight: boolean = false
): THREE.Group {
  const group = new THREE.Group();
  const posX = isLeft ? -10.95 : 10.95;
  const frameD = 14.8;
  const frameCenterZ = 0.0;
  const wallThick = 0.45;
  const recessedOffset = isLeft ? 0.08 : -0.08;

  // 1. Marco perimetral estructural de concreto visto en obra limpia
  // Pilastras verticales en extremos frontal y posterior
  const postW = wallThick;
  const postD = 0.70;
  const postGeo = new THREE.BoxGeometry(postW, height, postD);

  // Pilastra posterior (Z-)
  const backPost = new THREE.Mesh(postGeo, materials.travertine);
  backPost.position.set(posX, startY + height * 0.5, frameCenterZ - frameD * 0.5 + postD * 0.5);
  backPost.castShadow = true;
  backPost.receiveShadow = true;
  group.add(backPost);

  // Pilastra frontal (Z+)
  const frontPost = new THREE.Mesh(postGeo, materials.travertine);
  frontPost.position.set(posX, startY + height * 0.5, frameCenterZ + frameD * 0.5 - postD * 0.5);
  frontPost.castShadow = true;
  frontPost.receiveShadow = true;
  group.add(frontPost);

  // Viga de borde / dintel horizontal superior de concreto visto
  const beamH = 0.38;
  const topBeamGeo = new THREE.BoxGeometry(wallThick, beamH, frameD);
  const topBeam = new THREE.Mesh(topBeamGeo, materials.travertine);
  topBeam.position.set(posX, startY + height - beamH * 0.5, frameCenterZ);
  topBeam.castShadow = true;
  topBeam.receiveShadow = true;
  group.add(topBeam);

  // Zócalo de entrepiso inferior de concreto visto
  const baseH = 0.32;
  const baseBeamGeo = new THREE.BoxGeometry(wallThick, baseH, frameD);
  const baseBeam = new THREE.Mesh(baseBeamGeo, materials.travertineDark);
  baseBeam.position.set(posX, startY + baseH * 0.5, frameCenterZ);
  baseBeam.receiveShadow = true;
  group.add(baseBeam);

  // 2. Paño mural central rehundido en concreto visto con buñas horizontales
  const panelThick = 0.28;
  const panelH = height - beamH - baseH;
  const panelW = frameD - postD * 2;
  const panelY = startY + baseH + panelH * 0.5;

  // Paño muro ciego base
  const panelGeo = new THREE.BoxGeometry(panelThick, panelH, panelW);
  const panelMesh = new THREE.Mesh(panelGeo, materials.travertine);
  panelMesh.position.set(posX - recessedOffset, panelY, frameCenterZ);
  panelMesh.receiveShadow = true;
  panelMesh.castShadow = true;
  group.add(panelMesh);

  // Buñas arquitectónicas horizontales (juntas de encofrado fenólico rehundidas)
  const grooveCount = isDoubleHeight ? 3 : 1;
  const grooveStep = panelH / (grooveCount + 1);
  for (let g = 1; g <= grooveCount; g++) {
    const gy = startY + baseH + g * grooveStep;
    const grooveGeo = new THREE.BoxGeometry(0.04, 0.035, panelW);
    const grooveMesh = new THREE.Mesh(grooveGeo, materials.travertineDark);
    grooveMesh.position.set(posX + (isLeft ? 0.02 : -0.02), gy, frameCenterZ);
    group.add(grooveMesh);
  }

  // 3. Vanos verticales con carpintería grafito carbón y jambas abocinadas
  const winZCoords = [-3.6, 2.0];
  const winW = 1.35;
  const winH = isDoubleHeight ? 3.4 : 2.4;
  const winY = startY + baseH + panelH * 0.5;

  winZCoords.forEach((wz) => {
    // Hueco / Jamba de concreto enmarcado
    const frameGeo = new THREE.BoxGeometry(0.34, winH + 0.12, winW + 0.12);
    const frameMesh = new THREE.Mesh(frameGeo, materials.aluminumFrame);
    frameMesh.position.set(posX, winY, wz);
    frameMesh.castShadow = true;
    group.add(frameMesh);

    // Vidrio arquitectónico acústico
    const glassGeo = new THREE.BoxGeometry(0.08, winH, winW);
    const glassMesh = new THREE.Mesh(glassGeo, materials.architecturalGlass);
    glassMesh.position.set(posX, winY, wz);
    group.add(glassMesh);

    // Montante vertical central en carpintería grafito (hoja fija / batiente)
    const mullionGeo = new THREE.BoxGeometry(0.12, winH, 0.05);
    const mullionMesh = new THREE.Mesh(mullionGeo, materials.aluminumFrame);
    mullionMesh.position.set(posX, winY, wz);
    group.add(mullionMesh);

    // Alféizar en perfil metálico de bronce satinado con goterón
    const sillGeo = new THREE.BoxGeometry(0.42, 0.04, winW + 0.18);
    const sillMesh = new THREE.Mesh(sillGeo, materials.bronzeAccent);
    sillMesh.position.set(posX, winY - winH * 0.5 - 0.02, wz);
    group.add(sillMesh);

    // Micro-downlight rasante en el dintel del vano
    const spotGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12);
    const spotMesh = new THREE.Mesh(spotGeo, materials.coveLed);
    spotMesh.position.set(posX, winY + winH * 0.5 + 0.02, wz);
    group.add(spotMesh);
  });

  return group;
}

/**
 * Generador de Palmera Real / Chaguaramo Arquitectónico de Altamira (Bloque 4)
 * Especie botánica autóctona representativa de los jardines de ultra-lujo en Altamira, Caracas.
 */
function createArchitecturalPalm(
  height: number,
  trunkRadius: number,
  materials: SceneMaterials
): THREE.Group {
  const palmGroup = new THREE.Group();

  // 1. Tronco cónico anillado esbelto
  const trunkSegments = 7;
  const segHeight = (height * 0.78) / trunkSegments;
  for (let s = 0; s < trunkSegments; s++) {
    const bottomR = trunkRadius * (1.15 - (s / trunkSegments) * 0.35);
    const topR = trunkRadius * (1.15 - ((s + 1) / trunkSegments) * 0.35);
    const segGeo = new THREE.CylinderGeometry(topR, bottomR, segHeight, 14);
    const segMesh = new THREE.Mesh(segGeo, materials.travertineDark);
    segMesh.position.set(0, s * segHeight + segHeight * 0.5, 0);
    segMesh.castShadow = true;
    segMesh.receiveShadow = true;
    palmGroup.add(segMesh);

    // Anillo sutil de corteza
    const ringGeo = new THREE.TorusGeometry(bottomR + 0.015, 0.012, 6, 16);
    ringGeo.rotateX(Math.PI * 0.5);
    const ringMesh = new THREE.Mesh(ringGeo, materials.aluminumFrame);
    ringMesh.position.set(0, s * segHeight, 0);
    palmGroup.add(ringMesh);
  }

  // 2. Capitel botánico superior verde oliva
  const crownshaftH = height * 0.12;
  const crownshaftGeo = new THREE.CylinderGeometry(trunkRadius * 0.75, trunkRadius * 0.8, crownshaftH, 14);
  const crownshaftMesh = new THREE.Mesh(crownshaftGeo, materials.planterFoliage);
  crownshaftMesh.position.set(0, height * 0.78 + crownshaftH * 0.5, 0);
  crownshaftMesh.castShadow = true;
  palmGroup.add(crownshaftMesh);

  // 3. Corona de frondas / hojas arqueadas
  const frondCount = 9;
  const crownY = height * 0.78 + crownshaftH;
  for (let f = 0; f < frondCount; f++) {
    const angle = (f / frondCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
    const frondLength = 2.6 + Math.random() * 0.8;

    const frondCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(angle) * frondLength * 0.5, 0.55, Math.sin(angle) * frondLength * 0.5),
      new THREE.Vector3(Math.cos(angle) * frondLength, -0.65, Math.sin(angle) * frondLength),
    ]);

    const frondGeo = new THREE.TubeGeometry(frondCurve, 8, 0.04, 5, false);
    const frondMesh = new THREE.Mesh(frondGeo, materials.creeperFoliage);
    frondMesh.position.set(0, crownY, 0);
    frondMesh.castShadow = true;
    palmGroup.add(frondMesh);

    // Hojas / foliolos laterales
    const leafletGeo = new THREE.BoxGeometry(0.55, 0.02, 0.12);
    for (let l = 1; l <= 5; l++) {
      const t = l / 6;
      const pt = frondCurve.getPoint(t);
      const leaflet = new THREE.Mesh(leafletGeo, materials.planterFoliage);
      leaflet.position.set(pt.x, crownY + pt.y, pt.z);
      leaflet.rotation.y = angle + Math.PI * 0.5;
      leaflet.rotation.z = 0.25;
      leaflet.castShadow = true;
      palmGroup.add(leaflet);
    }
  }

  // 4. Proyector de suelo / Uplight LED cálido en la base
  const uplightGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12);
  const uplightMesh = new THREE.Mesh(uplightGeo, materials.coveLed);
  uplightMesh.position.set(trunkRadius + 0.18, 0.02, trunkRadius + 0.18);
  palmGroup.add(uplightMesh);

  return palmGroup;
}

/**
 * Entorno Inmediato, Terreno Paisajístico, Muro Perimetral de Autor y Acera Urbana (Bloque 4)
 * Proyecto: Residencias Caroní · Altamira, Caracas.
 * Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara.
 * Ingeniería de Software & Experiencia Interactiva: Ing. Luis Martinez.
 * Incluye rasante de terreno, acera urbana con juntas, muro perimetral de concreto con placa de bronce,
 * palmeras chaguaramos, césped esmeralda y luminarias de paisaje.
 */
function createLandscapeAndPerimeterEnvironment(materials: SceneMaterials): THREE.Group {
  const group = new THREE.Group();

  // 1. Plataforma Base del Terreno y Parcela
  const lotW = 28.0;
  const lotD = 30.0;
  const groundBaseGeo = new THREE.BoxGeometry(lotW, 0.40, lotD);
  const groundBase = new THREE.Mesh(groundBaseGeo, materials.travertineDark);
  groundBase.position.set(0, -0.30, 0);
  groundBase.receiveShadow = true;
  group.add(groundBase);

  // 2. Acera Peatonal Urbana Frontal (Transversal 8)
  const sidewalkW = 28.0;
  const sidewalkD = 3.2;
  const sidewalkZ = 13.6;
  const sidewalkGeo = new THREE.BoxGeometry(sidewalkW, 0.12, sidewalkD);
  const sidewalkMesh = new THREE.Mesh(sidewalkGeo, materials.travertine);
  sidewalkMesh.position.set(0, -0.04, sidewalkZ);
  sidewalkMesh.receiveShadow = true;
  group.add(sidewalkMesh);

  // Juntas de dilatación rítmicas de la acera
  const jointCount = 11;
  const jointStep = sidewalkW / (jointCount + 1);
  for (let j = 1; j <= jointCount; j++) {
    const jx = -sidewalkW * 0.5 + j * jointStep;
    const jointGeo = new THREE.BoxGeometry(0.02, 0.015, sidewalkD);
    const jointMesh = new THREE.Mesh(jointGeo, materials.aluminumFrame);
    jointMesh.position.set(jx, 0.025, sidewalkZ);
    group.add(jointMesh);
  }

  // Cordón de acera (Curb) en concreto biselado
  const curbGeo = new THREE.BoxGeometry(sidewalkW, 0.16, 0.22);
  const curbMesh = new THREE.Mesh(curbGeo, materials.travertineDark);
  curbMesh.position.set(0, -0.06, sidewalkZ + sidewalkD * 0.5 + 0.11);
  curbMesh.receiveShadow = true;
  group.add(curbMesh);

  // Calzada de calle en asfalto antracita liso
  const streetD = 4.5;
  const streetGeo = new THREE.BoxGeometry(sidewalkW + 4.0, 0.08, streetD);
  const streetMesh = new THREE.Mesh(streetGeo, materials.sotanoMat);
  streetMesh.position.set(0, -0.16, sidewalkZ + sidewalkD * 0.5 + 0.22 + streetD * 0.5);
  streetMesh.receiveShadow = true;
  group.add(streetMesh);

  // 3. Muro de Fachada Urbana con Placa de Autor Institucional
  // Ubicado a la derecha del acceso peatonal (x = 3.6 a 11.2, z = 12.0)
  const wallW = 7.6;
  const wallH = 1.25;
  const wallThick = 0.35;
  const wallCenterX = 7.4;
  const wallCenterZ = 12.0;

  const wallGeo = new THREE.BoxGeometry(wallW, wallH, wallThick);
  const wallMesh = new THREE.Mesh(wallGeo, materials.travertine);
  wallMesh.position.set(wallCenterX, wallH * 0.5 - 0.08, wallCenterZ);
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  group.add(wallMesh);

  // Albardilla goterón superior en bronce satinado
  const wallTrimGeo = new THREE.BoxGeometry(wallW + 0.06, 0.04, wallThick + 0.06);
  const wallTrim = new THREE.Mesh(wallTrimGeo, materials.bronzeAccent);
  wallTrim.position.set(wallCenterX, wallH - 0.06, wallCenterZ);
  group.add(wallTrim);

  // Placa de Autor Monumental grabada en Bronce Satinado Cepillado
  const plaqueW = 3.2;
  const plaqueH = 0.65;
  const plaqueGeo = new THREE.BoxGeometry(plaqueW, plaqueH, 0.035);
  const plaqueMesh = new THREE.Mesh(plaqueGeo, materials.bronzeAccent);
  plaqueMesh.position.set(wallCenterX, 0.62, wallCenterZ + wallThick * 0.5 + 0.02);
  plaqueMesh.castShadow = true;
  group.add(plaqueMesh);

  // Marco en relieve de la placa institucional
  const plaqueFrameGeo = new THREE.BoxGeometry(plaqueW + 0.06, plaqueH + 0.06, 0.02);
  const plaqueFrame = new THREE.Mesh(plaqueFrameGeo, materials.aluminumFrame);
  plaqueFrame.position.set(wallCenterX, 0.62, wallCenterZ + wallThick * 0.5 + 0.01);
  group.add(plaqueFrame);

  // Luz lineal LED que baña la placa de noche
  const plaqueLightGeo = new THREE.BoxGeometry(plaqueW * 0.9, 0.015, 0.04);
  const plaqueLight = new THREE.Mesh(plaqueLightGeo, materials.coveLed);
  plaqueLight.position.set(wallCenterX, 0.62 + plaqueH * 0.5 + 0.03, wallCenterZ + wallThick * 0.5 + 0.04);
  group.add(plaqueLight);

  // Muro perimetral bajo izquierdo (frente al portón de garaje / rampa)
  const leftWallW = 2.4;
  const leftWallMesh = new THREE.Mesh(new THREE.BoxGeometry(leftWallW, 1.0, wallThick), materials.travertine);
  leftWallMesh.position.set(-12.0, 0.42, wallCenterZ);
  leftWallMesh.castShadow = true;
  group.add(leftWallMesh);

  const leftWallTrim = new THREE.Mesh(new THREE.BoxGeometry(leftWallW + 0.04, 0.04, wallThick + 0.04), materials.bronzeAccent);
  leftWallTrim.position.set(-12.0, 0.94, wallCenterZ);
  group.add(leftWallTrim);

  // 4. Palmeras Esculturales (Chaguaramos de Altamira)
  const palm1 = createArchitecturalPalm(7.2, 0.16, materials);
  palm1.position.set(-6.8, -0.05, 12.8);
  group.add(palm1);

  const palm2 = createArchitecturalPalm(8.0, 0.17, materials);
  palm2.position.set(2.8, -0.05, 12.8);
  group.add(palm2);

  const palm3 = createArchitecturalPalm(8.6, 0.18, materials);
  palm3.position.set(-12.4, -0.05, 4.2);
  group.add(palm3);

  const palm4 = createArchitecturalPalm(8.4, 0.17, materials);
  palm4.position.set(12.4, -0.05, 4.2);
  group.add(palm4);

  const palm5 = createArchitecturalPalm(7.4, 0.16, materials);
  palm5.position.set(-10.8, -0.05, -12.5);
  group.add(palm5);

  // 5. Praderas Verdes y Paisajismo Lateral / Posterior
  // Pradera lateral Oeste (Norte)
  const grassWestGeo = new THREE.BoxGeometry(2.4, 0.08, 14.0);
  const grassWest = new THREE.Mesh(grassWestGeo, materials.gardenGrass);
  grassWest.position.set(-12.2, -0.05, 0.5);
  grassWest.receiveShadow = true;
  group.add(grassWest);

  // Pradera lateral Este (Sur)
  const grassEastGeo = new THREE.BoxGeometry(2.4, 0.08, 14.0);
  const grassEast = new THREE.Mesh(grassEastGeo, materials.gardenGrass);
  grassEast.position.set(12.2, -0.05, 0.5);
  grassEast.receiveShadow = true;
  group.add(grassEast);

  // Jardín posterior profundo (dividido para respetar el carril de nado en Jardín Norte)
  // Pradera posterior Sur:
  const grassRearSouthGeo = new THREE.BoxGeometry(13.2, 0.08, 6.5);
  const grassRearSouth = new THREE.Mesh(grassRearSouthGeo, materials.gardenGrass);
  grassRearSouth.position.set(6.6, -0.05, -11.5);
  grassRearSouth.receiveShadow = true;
  group.add(grassRearSouth);

  // Pradera posterior Norte (bordeando el carril de nado sin solaparse):
  const grassRearNorthBorder = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 6.5), materials.gardenGrass);
  grassRearNorthBorder.position.set(-11.9, -0.05, -11.5);
  grassRearNorthBorder.receiveShadow = true;
  group.add(grassRearNorthBorder);

  // Muro perimetral posterior de contención en piedra
  const rearWallGeo = new THREE.BoxGeometry(26.4, 1.8, 0.40);
  const rearWall = new THREE.Mesh(rearWallGeo, materials.travertineDark);
  rearWall.position.set(0, 0.82, -14.8);
  rearWall.castShadow = true;
  rearWall.receiveShadow = true;
  group.add(rearWall);

  // Arbustos botánicos tropicales en el perímetro posterior
  for (let b = 0; b < 14; b++) {
    const bx = -12.0 + b * 1.85 + (Math.random() - 0.5) * 0.4;
    const bz = -14.2 + (Math.random() - 0.5) * 0.3;
    const bushGeo = new THREE.DodecahedronGeometry(0.45 + Math.random() * 0.25, 1);
    const bush = new THREE.Mesh(bushGeo, materials.planterFoliage);
    bush.position.set(bx, 0.45 + Math.random() * 0.2, bz);
    bush.scale.set(1.1, 1.3, 1.1);
    bush.castShadow = true;
    group.add(bush);
  }

  return group;
}

// Perfiles estáticos de iluminación y vidrio para transiciones suaves a 60 FPS
const GLASS_PROFILES: Record<SolarTimeMode, {
  opacity: number;
  color: THREE.Color;
  emissive: THREE.Color;
  emissiveIntensity: number;
  envMapIntensity: number;
  balustradeOpacity: number;
  balustradeColor: THREE.Color;
  balustradeEmissive: THREE.Color;
  balustradeEmissiveIntensity: number;
  coveEmissive: THREE.Color;
  coveIntensity: number;
  interiorEmissive: THREE.Color;
  interiorIntensity: number;
  waterEmissive: THREE.Color;
  waterIntensity: number;
}> = {
  morning: {
    opacity: 0.95,
    color: new THREE.Color(0x0E1318),
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0.0,
    envMapIntensity: 1.05,
    balustradeOpacity: 0.78,
    balustradeColor: new THREE.Color(0x13181D),
    balustradeEmissive: new THREE.Color(0x000000),
    balustradeEmissiveIntensity: 0.0,
    coveEmissive: new THREE.Color(0xFFB347),
    coveIntensity: 0.4,
    interiorEmissive: new THREE.Color(0xFFA032),
    interiorIntensity: 0.15,
    waterEmissive: new THREE.Color(0x000000),
    waterIntensity: 0.0,
  },
  golden: {
    opacity: 0.32,
    color: new THREE.Color(0x4A3628),
    emissive: new THREE.Color(0x66360A),
    emissiveIntensity: 0.35,
    envMapIntensity: 0.55,
    balustradeOpacity: 0.28,
    balustradeColor: new THREE.Color(0x422F22),
    balustradeEmissive: new THREE.Color(0x3D1E04),
    balustradeEmissiveIntensity: 0.20,
    coveEmissive: new THREE.Color(0xFFB347),
    coveIntensity: 3.5,
    interiorEmissive: new THREE.Color(0xFFA032),
    interiorIntensity: 1.2,
    waterEmissive: new THREE.Color(0x05303A),
    waterIntensity: 0.35,
  },
  night: {
    opacity: 0.04,
    color: new THREE.Color(0xFFF3DE),
    emissive: new THREE.Color(0xB3681B),
    emissiveIntensity: 0.85,
    envMapIntensity: 0.06,
    balustradeOpacity: 0.08,
    balustradeColor: new THREE.Color(0xFFEDD2),
    balustradeEmissive: new THREE.Color(0x7A420E),
    balustradeEmissiveIntensity: 0.45,
    coveEmissive: new THREE.Color(0xFFBE55),
    coveIntensity: 6.5,
    interiorEmissive: new THREE.Color(0xFFA53B),
    interiorIntensity: 2.6,
    waterEmissive: new THREE.Color(0x0E6E82),
    waterIntensity: 0.95,
  },
};

/**
 * Transición suave de materiales de vidrio y luminarias arquitectónicas
 */
export function transitionGlassMaterials(
  materials: SceneMaterials,
  mode: SolarTimeMode,
  transitionSpeed: number = 0.12
): boolean {
  const target = GLASS_PROFILES[mode];
  const glass = materials.architecturalGlass;
  const balustrade = materials.glassBalustrade;
  const cove = materials.coveLed;
  const glow = materials.interiorGlow;
  const water = materials.waterMirror;

  if (transitionSpeed >= 1.0) {
    glass.opacity = target.opacity;
    glass.color.copy(target.color);
    glass.emissive.copy(target.emissive);
    glass.emissiveIntensity = target.emissiveIntensity;
    glass.envMapIntensity = target.envMapIntensity;

    balustrade.opacity = target.balustradeOpacity;
    balustrade.color.copy(target.balustradeColor);
    balustrade.emissive.copy(target.balustradeEmissive);
    balustrade.emissiveIntensity = target.balustradeEmissiveIntensity;

    cove.emissive.copy(target.coveEmissive);
    cove.emissiveIntensity = target.coveIntensity;

    glow.emissive.copy(target.interiorEmissive);
    glow.emissiveIntensity = target.interiorIntensity;

    if (water) {
      water.emissive.copy(target.waterEmissive);
      water.emissiveIntensity = target.waterIntensity;
    }
    return false;
  }

  const t = Math.max(0.01, Math.min(1.0, transitionSpeed));
  const dOpacity = Math.abs(glass.opacity - target.opacity);
  const dEmissive = Math.abs(glass.emissiveIntensity - target.emissiveIntensity);
  const isSettled = dOpacity < 0.002 && dEmissive < 0.005;

  if (isSettled) {
    glass.opacity = target.opacity;
    glass.color.copy(target.color);
    glass.emissive.copy(target.emissive);
    glass.emissiveIntensity = target.emissiveIntensity;
    glass.envMapIntensity = target.envMapIntensity;

    balustrade.opacity = target.balustradeOpacity;
    balustrade.color.copy(target.balustradeColor);
    balustrade.emissive.copy(target.balustradeEmissive);
    balustrade.emissiveIntensity = target.balustradeEmissiveIntensity;

    cove.emissive.copy(target.coveEmissive);
    cove.emissiveIntensity = target.coveIntensity;

    glow.emissive.copy(target.interiorEmissive);
    glow.emissiveIntensity = target.interiorIntensity;

    if (water) {
      water.emissive.copy(target.waterEmissive);
      water.emissiveIntensity = target.waterIntensity;
    }
    return false;
  }

  glass.opacity = THREE.MathUtils.lerp(glass.opacity, target.opacity, t);
  glass.color.lerp(target.color, t);
  glass.emissive.lerp(target.emissive, t);
  glass.emissiveIntensity = THREE.MathUtils.lerp(glass.emissiveIntensity, target.emissiveIntensity, t);
  glass.envMapIntensity = THREE.MathUtils.lerp(glass.envMapIntensity, target.envMapIntensity, t);

  balustrade.opacity = THREE.MathUtils.lerp(balustrade.opacity, target.balustradeOpacity, t);
  balustrade.color.lerp(target.balustradeColor, t);
  balustrade.emissive.lerp(target.balustradeEmissive, t);
  balustrade.emissiveIntensity = THREE.MathUtils.lerp(balustrade.emissiveIntensity, target.balustradeEmissiveIntensity, t);

  cove.emissive.lerp(target.coveEmissive, t);
  cove.emissiveIntensity = THREE.MathUtils.lerp(cove.emissiveIntensity, target.coveIntensity, t);

  glow.emissive.lerp(target.interiorEmissive, t);
  glow.emissiveIntensity = THREE.MathUtils.lerp(glow.emissiveIntensity, target.interiorIntensity, t);

  if (water) {
    water.emissive.lerp(target.waterEmissive, t);
    water.emissiveIntensity = THREE.MathUtils.lerp(water.emissiveIntensity, target.waterIntensity, t);
  }

  return true;
}

/**
 * Ensamblaje integral del edificio Residencias Caroní en Three.js
 */
export function buildCompleteBuildingScene(
  materials: SceneMaterials
): {
  buildingRoot: THREE.Group;
  unitMeshesMap: UnitMeshRegistry;
  levelGroups: { [key: string]: THREE.Group };
  unitAnchors: UnitAnchor[];
  lightsGroup: THREE.Group;
  updateLightingMode: (mode: SolarTimeMode, immediate?: boolean) => void;
  transitionStep: (mode: SolarTimeMode, deltaFactor?: number) => void;
} {
  const buildingRoot = new THREE.Group();

  const unitMeshesMap: UnitMeshRegistry = {
    'jardin-norte': [],
    'jardin-sur': [],
    'residencia-02-norte': [],
    'residencia-02-sur': [],
    'residencia-03-norte': [],
    'residencia-03-sur': [],
    'mirador-norte': [],
    'mirador-sur': [],
  };

  const levelGroups: { [key: string]: THREE.Group } = {
    sotano: new THREE.Group(),
    pb: new THREE.Group(),
    p2: new THREE.Group(),
    p3: new THREE.Group(),
    mirador: new THREE.Group(),
    pergola: new THREE.Group(),
  };

  // Módulo de residencia interior habitable
  const createDetailedUnitModule = (
    w: number,
    h: number,
    d: number,
    unitId: string,
    isUpperDuplex: boolean = false
  ): THREE.Group => {
    const group = new THREE.Group();
    const wallThick = 0.35;
    const slabThickness = 0.30;
    const innerW = w - wallThick * 2;
    const innerH = h - slabThickness * 2;

    // Muros ciegos laterales de separación
    const leftWallGeo = new THREE.BoxGeometry(wallThick, h, d * 0.95);
    const leftWall = new THREE.Mesh(leftWallGeo, materials.travertine);
    leftWall.position.set(-w * 0.5 + wallThick * 0.5, 0, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    (leftWall as any).userData = { unitId };
    group.add(leftWall);

    const rightWall = new THREE.Mesh(leftWallGeo, materials.travertine);
    rightWall.position.set(w * 0.5 - wallThick * 0.5, 0, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    (rightWall as any).userData = { unitId };
    group.add(rightWall);

    const ceilingGeo = new THREE.BoxGeometry(w, slabThickness, d * 0.95);
    const ceilingMesh = new THREE.Mesh(ceilingGeo, materials.travertineDark);
    ceilingMesh.position.set(0, h * 0.5 - slabThickness * 0.5, 0);
    ceilingMesh.receiveShadow = true;
    group.add(ceilingMesh);

    if (unitMeshesMap[unitId]) {
      unitMeshesMap[unitId].push(leftWall, rightWall);
    }

    // Ventanal panorámico frontal (Z+) (Bloque 1.7)
    const glassOffset = d * 0.46;
    const frontGlassGeo = new THREE.PlaneGeometry(innerW, innerH);
    const frontGlass = new THREE.Mesh(frontGlassGeo, materials.architecturalGlass);
    frontGlass.position.set(0, 0, glassOffset);
    group.add(frontGlass);

    // Rieles perimetrales de carpintería superior e inferior en aluminio grafito
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(innerW, 0.08, 0.12), materials.aluminumFrame);
    topRail.position.set(0, innerH * 0.5 - 0.04, glassOffset);
    group.add(topRail);

    const bottomRail = new THREE.Mesh(new THREE.BoxGeometry(innerW, 0.06, 0.12), materials.aluminumFrame);
    bottomRail.position.set(0, -innerH * 0.5 + 0.03, glassOffset);
    group.add(bottomRail);

    // Montantes verticales frontales modulados a 1.80m
    const bayCount = Math.max(3, Math.round(innerW / 1.8));
    const baySpacing = innerW / bayCount;
    for (let b = 1; b < bayCount; b++) {
      const mx = -innerW * 0.5 + b * baySpacing;
      const mullionGeo = new THREE.BoxGeometry(0.06, innerH, 0.12);
      const mullionFront = new THREE.Mesh(mullionGeo, materials.aluminumFrame);
      mullionFront.position.set(mx, 0, glassOffset);
      mullionFront.castShadow = true;
      group.add(mullionFront);

      // Tirador vertical de bronce satinado en hoja corredera
      if (b === 2) {
        const pullGeo = new THREE.BoxGeometry(0.025, 0.50, 0.04);
        const pullMesh = new THREE.Mesh(pullGeo, materials.bronzeAccent);
        pullMesh.position.set(mx + 0.12, -0.05, glassOffset + 0.06);
        group.add(pullMesh);
      }
    }

    // Tiras LED en cielo
    const coveLightGeo = new THREE.BoxGeometry(w * 0.85, 0.03, 0.05);
    const coveLight = new THREE.Mesh(coveLightGeo, materials.coveLed);
    coveLight.position.set(0, h * 0.44, glassOffset - 0.25);
    group.add(coveLight);

    // Interior habitable
    if (!isUpperDuplex) {
      const woodWallGeo = new THREE.BoxGeometry(w * 0.42, h * 0.72, 0.08);
      const woodWall = new THREE.Mesh(woodWallGeo, materials.interiorWood);
      woodWall.position.set(-w * 0.24, 0, -d * 0.25);
      group.add(woodWall);

      const islandGeo = new THREE.BoxGeometry(2.8, 0.9, 1.2);
      const islandMesh = new THREE.Mesh(islandGeo, materials.interiorIsland);
      islandMesh.position.set(w * 0.22, -h * 0.35 + 0.45, 0.5);
      group.add(islandMesh);

      const interiorFloorGeo = new THREE.BoxGeometry(w * 0.94, 0.06, d * 0.88);
      const interiorFloor = new THREE.Mesh(interiorFloorGeo, materials.interiorGlow);
      interiorFloor.position.set(0, -h * 0.46, 0);
      group.add(interiorFloor);
    } else {
      const mezzanineDepth = d * 0.55;
      const mezzanineGeo = new THREE.BoxGeometry(w * 0.88, 0.26, mezzanineDepth);
      const mezzanineMesh = new THREE.Mesh(mezzanineGeo, materials.concreteSlab);
      mezzanineMesh.position.set(0, -h * 0.38, -d * 0.15);
      group.add(mezzanineMesh);
    }

    return group;
  };

  // --- SÓTANO PRIVADO (-3.50 m · 36 puestos) ---
  const sotanoBaseGeo = new THREE.BoxGeometry(24.5, 3.5, 18.5);
  const sotanoMesh = new THREE.Mesh(sotanoBaseGeo, materials.sotanoMat);
  sotanoMesh.position.set(0, -2.75, 0);
  sotanoMesh.receiveShadow = true;
  levelGroups.sotano.add(sotanoMesh);

  // Rampa de acceso vehicular y portón en listones terracota
  const rampGeo = new THREE.BoxGeometry(5.0, 0.4, 8.0);
  const rampMesh = new THREE.Mesh(rampGeo, materials.sotanoMat);
  rampMesh.rotation.x = 0.28;
  rampMesh.position.set(-9.2, -3.2, 10.5);
  levelGroups.sotano.add(rampMesh);

  const gateGeo = new THREE.BoxGeometry(4.6, 2.4, 0.15);
  const gateMesh = new THREE.Mesh(gateGeo, materials.woodPergola);
  gateMesh.position.set(-9.2, -2.0, 7.2);
  levelGroups.sotano.add(gateMesh);

  // --- FACHADAS LATERALES CON MARCO PÓRTICO (Bloque 2) - PB DÚPLEX ---
  const leftFacadePB = createLateralFacadeLevel(0, 8.5, true, materials, true);
  levelGroups.pb.add(leftFacadePB);

  const rightFacadePB = createLateralFacadeLevel(0, 8.5, false, materials, true);
  levelGroups.pb.add(rightFacadePB);

  // --- PLANTA BAJA & 1 (DÚPLEX: COTA ±0.00 a +8.50 m) ---
  // Columnata cilíndrica monumental (Bloque 1.3)
  const pbColumns = createMonumentalColumnsForLevel(0, 8.5, materials, true);
  levelGroups.pb.add(pbColumns);

  // Torre vertical continua de celosía en terracota (Bloque 1.4)
  const cornerLouversPB = createTerracottaTowerSegment(8.5, materials);
  cornerLouversPB.position.set(-10.65, 4.25, 7.45);
  levelGroups.pb.add(cornerLouversPB);

  // Núcleo central vidriado y atrio de circulación (Bloque 1.5)
  const atriumPB = createCentralGlassAtriumLevel(0, 8.5, materials, true);
  levelGroups.pb.add(atriumPB);

  // Umbral de acceso monumental en Planta Baja (Bloque 1.6)
  const pbThreshold = createGroundFloorEntranceThreshold(materials);
  levelGroups.pb.add(pbThreshold);

  // Entorno Inmediato, Terreno Paisajístico, Muro Perimetral de Autor y Acera Urbana (Bloque 4)
  const landscapeEnv = createLandscapeAndPerimeterEnvironment(materials);
  levelGroups.pb.add(landscapeEnv);

  // 1. Jardín Norte (1.030,45 m² · Dúplex)
  const jnLiving = createDetailedUnitModule(10.8, 4.25, 14.0, 'jardin-norte');
  jnLiving.position.set(-5.6, 1.125, 0);
  levelGroups.pb.add(jnLiving);

  const jnUpper = createDetailedUnitModule(10.8, 4.25, 14.0, 'jardin-norte', true);
  jnUpper.position.set(-5.6, 5.375, 0);
  levelGroups.pb.add(jnUpper);

  // Balcón curvo FRONTAL en Nivel 1 (PB+1) con jardinera y enredaderas
  const jnBalconyP1 = createCurvilinearBalcony(10.8, 2.5, materials, { isLeftWing: true, hasWoodDeck: true });
  jnBalconyP1.position.set(-5.6, 4.25, 7.8);
  levelGroups.pb.add(jnBalconyP1);

  // Fachada posterior sobria y limpia de PB+1 Norte (Sin balcones ni jardineras)
  const jnRearPB = createRearFacadeEnclosure(10.8, 8.5, materials);
  jnRearPB.position.set(-5.6, 0, -7.0);
  levelGroups.pb.add(jnRearPB);

  // Carril de Nado Privado con Borde Infinito (10m x 2.4m) en Jardín Norte
  const poolW = 8.8;
  const poolD = 2.4;
  const poolWater = new THREE.Mesh(new THREE.BoxGeometry(poolW, 0.12, poolD), materials.waterMirror);
  poolWater.position.set(-5.6, -0.72, -13.0);
  poolWater.receiveShadow = true;
  levelGroups.pb.add(poolWater);

  const poolBorder = new THREE.Mesh(new THREE.BoxGeometry(poolW + 0.6, 0.24, poolD + 0.6), materials.travertineDark);
  poolBorder.position.set(-5.6, -0.84, -13.0);
  poolBorder.receiveShadow = true;
  levelGroups.pb.add(poolBorder);

  const solariumMesh = new THREE.Mesh(new THREE.BoxGeometry(poolW + 0.6, 0.08, 1.8), materials.woodDeck);
  solariumMesh.position.set(-5.6, -0.70, -10.4);
  solariumMesh.receiveShadow = true;
  levelGroups.pb.add(solariumMesh);

  // 2. Jardín Sur (931,00 m² · Dúplex)
  const jsLiving = createDetailedUnitModule(10.8, 4.25, 14.0, 'jardin-sur');
  jsLiving.position.set(5.6, 1.125, 0);
  levelGroups.pb.add(jsLiving);

  const jsUpper = createDetailedUnitModule(10.8, 4.25, 14.0, 'jardin-sur', true);
  jsUpper.position.set(5.6, 5.375, 0);
  levelGroups.pb.add(jsUpper);

  // Balcón curvo FRONTAL en Nivel 1 (PB+1) Sur
  const jsBalconyP1 = createCurvilinearBalcony(10.8, 2.5, materials, { isLeftWing: false, hasWoodDeck: true });
  jsBalconyP1.position.set(5.6, 4.25, 7.8);
  levelGroups.pb.add(jsBalconyP1);

  // Fachada posterior sobria y limpia de PB+1 Sur
  const jsRearPB = createRearFacadeEnclosure(10.8, 8.5, materials);
  jsRearPB.position.set(5.6, 0, -7.0);
  levelGroups.pb.add(jsRearPB);

  // --- NIVEL P2 (COTA +8.50 a +12.75 m) ---
  const leftFacadeP2 = createLateralFacadeLevel(8.5, 4.25, true, materials, false);
  levelGroups.p2.add(leftFacadeP2);
  const rightFacadeP2 = createLateralFacadeLevel(8.5, 4.25, false, materials, false);
  levelGroups.p2.add(rightFacadeP2);

  const p2Columns = createMonumentalColumnsForLevel(8.5, 4.25, materials, false);
  levelGroups.p2.add(p2Columns);

  const cornerLouversP2 = createTerracottaTowerSegment(4.25, materials);
  cornerLouversP2.position.set(-10.65, 8.5 + 2.125, 7.45);
  levelGroups.p2.add(cornerLouversP2);

  const atriumP2 = createCentralGlassAtriumLevel(8.5, 4.25, materials, false);
  levelGroups.p2.add(atriumP2);

  // 3. Residencia 02 Norte (415,45 m²)
  const r02N = createDetailedUnitModule(10.8, 4.25, 14.0, 'residencia-02-norte');
  r02N.position.set(-5.6, 9.625, 0);
  levelGroups.p2.add(r02N);

  // Balcón Curvilíneo Esculpido FRONTAL Norte (Exclusivo en fachada frontal Z+)
  const r02NFrontBalcony = createCurvilinearBalcony(10.8, 2.6, materials, { isLeftWing: true, hasWoodDeck: true });
  r02NFrontBalcony.position.set(-5.6, 8.5, 8.0);
  levelGroups.p2.add(r02NFrontBalcony);

  // Fachada Posterior P2 Norte (Limpia, sin balcón ni jardinera)
  const r02NRear = createRearFacadeEnclosure(10.8, 4.25, materials);
  r02NRear.position.set(-5.6, 8.5, -7.0);
  levelGroups.p2.add(r02NRear);

  // 4. Residencia 02 Sur (415,80 m²)
  const r02S = createDetailedUnitModule(10.8, 4.25, 14.0, 'residencia-02-sur');
  r02S.position.set(5.6, 9.625, 0);
  levelGroups.p2.add(r02S);

  // Balcón Curvilíneo Esculpido FRONTAL Sur
  const r02SFrontBalcony = createCurvilinearBalcony(10.8, 2.6, materials, { isLeftWing: false, hasWoodDeck: true });
  r02SFrontBalcony.position.set(5.6, 8.5, 7.8);
  levelGroups.p2.add(r02SFrontBalcony);

  // Fachada Posterior P2 Sur (Limpia, sin balcón ni jardinera)
  const r02SRear = createRearFacadeEnclosure(10.8, 4.25, materials);
  r02SRear.position.set(5.6, 8.5, -7.0);
  levelGroups.p2.add(r02SRear);

  // --- NIVEL P3 (COTA +12.75 a +17.00 m) ---
  const leftFacadeP3 = createLateralFacadeLevel(12.75, 4.25, true, materials, false);
  levelGroups.p3.add(leftFacadeP3);
  const rightFacadeP3 = createLateralFacadeLevel(12.75, 4.25, false, materials, false);
  levelGroups.p3.add(rightFacadeP3);

  const p3Columns = createMonumentalColumnsForLevel(12.75, 4.25, materials, false);
  levelGroups.p3.add(p3Columns);

  const cornerLouversP3 = createTerracottaTowerSegment(4.25, materials);
  cornerLouversP3.position.set(-10.65, 12.75 + 2.125, 7.45);
  levelGroups.p3.add(cornerLouversP3);

  const atriumP3 = createCentralGlassAtriumLevel(12.75, 4.25, materials, false);
  levelGroups.p3.add(atriumP3);

  // 5. Residencia 03 Norte (415,45 m²)
  const r03N = createDetailedUnitModule(10.8, 4.25, 14.0, 'residencia-03-norte');
  r03N.position.set(-5.6, 13.875, 0);
  levelGroups.p3.add(r03N);

  // Balcón Curvilíneo Esculpido FRONTAL Norte
  const r03NFrontBalcony = createCurvilinearBalcony(10.8, 2.6, materials, { isLeftWing: true, hasWoodDeck: true });
  r03NFrontBalcony.position.set(-5.6, 12.75, 8.0);
  levelGroups.p3.add(r03NFrontBalcony);

  // Fachada Posterior P3 Norte (Limpia, sin balcón ni jardinera)
  const r03NRear = createRearFacadeEnclosure(10.8, 4.25, materials);
  r03NRear.position.set(-5.6, 12.75, -7.0);
  levelGroups.p3.add(r03NRear);

  // 6. Residencia 03 Sur (415,80 m²)
  const r03S = createDetailedUnitModule(10.8, 4.25, 14.0, 'residencia-03-sur');
  r03S.position.set(5.6, 13.875, 0);
  levelGroups.p3.add(r03S);

  // Balcón Curvilíneo Esculpido FRONTAL Sur
  const r03SFrontBalcony = createCurvilinearBalcony(10.8, 2.6, materials, { isLeftWing: false, hasWoodDeck: true });
  r03SFrontBalcony.position.set(5.6, 12.75, 7.8);
  levelGroups.p3.add(r03SFrontBalcony);

  // Fachada Posterior P3 Sur (Limpia, sin balcón ni jardinera)
  const r03SRear = createRearFacadeEnclosure(10.8, 4.25, materials);
  r03SRear.position.set(5.6, 12.75, -7.0);
  levelGroups.p3.add(r03SRear);

  // --- NIVEL MIRADOR / PENT-HOUSES (+17.00 a +21.25 m) ---
  const leftFacadeMirador = createLateralFacadeLevel(17.0, 4.6, true, materials, false);
  levelGroups.mirador.add(leftFacadeMirador);
  const rightFacadeMirador = createLateralFacadeLevel(17.0, 4.6, false, materials, false);
  levelGroups.mirador.add(rightFacadeMirador);

  const miradorColumns = createMonumentalColumnsForLevel(17.0, 4.6, materials, false);
  levelGroups.mirador.add(miradorColumns);

  const cornerLouversMirador = createTerracottaTowerSegment(4.6, materials);
  cornerLouversMirador.position.set(-10.65, 17.0 + 2.3, 7.45);
  levelGroups.mirador.add(cornerLouversMirador);

  const atriumMirador = createCentralGlassAtriumLevel(17.0, 4.6, materials, false);
  levelGroups.mirador.add(atriumMirador);

  // 7. Mirador Norte (590,70 m²)
  const mNorte = createDetailedUnitModule(10.8, 4.25, 14.0, 'mirador-norte');
  mNorte.position.set(-5.6, 18.125, 0);
  levelGroups.mirador.add(mNorte);

  // Terraza Curvilínea Esculpida FRONTAL Norte
  const mNorteBalcony = createCurvilinearBalcony(10.8, 2.8, materials, { isLeftWing: true, hasWoodDeck: true });
  mNorteBalcony.position.set(-5.6, 17.0, 8.2);
  levelGroups.mirador.add(mNorteBalcony);

  // Fachada Posterior Mirador Norte (Limpia, sin balcón)
  const mNorteRear = createRearFacadeEnclosure(10.8, 4.25, materials);
  mNorteRear.position.set(-5.6, 17.0, -7.0);
  levelGroups.mirador.add(mNorteRear);

  // Hidromasaje / Espejo de agua panorámico en terraza Mirador Norte
  const roofSpaWater = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 1.8), materials.waterMirror);
  roofSpaWater.position.set(-8.2, 17.35, -8.3);
  roofSpaWater.receiveShadow = true;
  levelGroups.mirador.add(roofSpaWater);

  const roofSpaRim = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.24, 2.1), materials.travertineDark);
  roofSpaRim.position.set(-8.2, 17.24, -8.3);
  roofSpaRim.receiveShadow = true;
  levelGroups.mirador.add(roofSpaRim);

  // 8. Mirador Sur (585,50 m²)
  const mSur = createDetailedUnitModule(10.8, 4.25, 14.0, 'mirador-sur');
  mSur.position.set(5.6, 18.125, 0);
  levelGroups.mirador.add(mSur);

  // Terraza Curvilínea Esculpida FRONTAL Sur
  const mSurBalcony = createCurvilinearBalcony(10.8, 2.8, materials, { isLeftWing: false, hasWoodDeck: true });
  mSurBalcony.position.set(5.6, 17.0, 8.2);
  levelGroups.mirador.add(mSurBalcony);

  // Fachada Posterior Mirador Sur (Limpia, sin balcón)
  const mSurRear = createRearFacadeEnclosure(10.8, 4.25, materials);
  mSurRear.position.set(5.6, 17.0, -7.0);
  levelGroups.mirador.add(mSurRear);

  // Celosía vertical superior en Mirador Sur
  const penthouseScreen = createTerracottaLouvers(3.0, 4.0, 0.32, materials, 8);
  penthouseScreen.position.set(5.2, 19.0, 7.8);
  levelGroups.mirador.add(penthouseScreen);

  // --- REMATE CENITAL: GRAN CUBIERTA ESCULTÓRICA EN VOLADIZO ANGULAR (+21.25 a +25.50 m) ---
  const origamiCanopy = createMonumentalOrigamiCanopy(materials);
  levelGroups.pergola.add(origamiCanopy);

  // Adición de todos los grupos a la raíz del edificio
  Object.keys(levelGroups).forEach((k) => buildingRoot.add(levelGroups[k]));

  // --- ANCLAS 3D PARA NAVEGACIÓN Y HOTSPOTS ---
  const unitAnchors: UnitAnchor[] = [
    {
      unitId: 'jardin-norte',
      name: 'Jardín Norte',
      code: 'JN',
      level: 'PB + 1',
      position: new THREE.Vector3(-5.6, 3.25, 7.5),
      totalArea: 1030.45,
    },
    {
      unitId: 'jardin-sur',
      name: 'Jardín Sur',
      code: 'JS',
      level: 'PB + 1',
      position: new THREE.Vector3(5.6, 3.25, 7.5),
      totalArea: 931.0,
    },
    {
      unitId: 'residencia-02-norte',
      name: 'Residencia 02 N',
      code: 'R02N',
      level: 'P2',
      position: new THREE.Vector3(-5.6, 9.6, 7.5),
      totalArea: 415.45,
    },
    {
      unitId: 'residencia-02-sur',
      name: 'Residencia 02 S',
      code: 'R02S',
      level: 'P2',
      position: new THREE.Vector3(5.6, 9.6, 7.5),
      totalArea: 415.8,
    },
    {
      unitId: 'residencia-03-norte',
      name: 'Residencia 03 N',
      code: 'R03N',
      level: 'P3',
      position: new THREE.Vector3(-5.6, 13.85, 7.5),
      totalArea: 415.45,
    },
    {
      unitId: 'residencia-03-sur',
      name: 'Residencia 03 S',
      code: 'R03S',
      level: 'P3',
      position: new THREE.Vector3(5.6, 13.85, 7.5),
      totalArea: 415.8,
    },
    {
      unitId: 'mirador-norte',
      name: 'Mirador Norte',
      code: 'MN',
      level: 'PH',
      position: new THREE.Vector3(-5.6, 18.5, 7.5),
      totalArea: 590.7,
    },
    {
      unitId: 'mirador-sur',
      name: 'Mirador Sur',
      code: 'MS',
      level: 'PH',
      position: new THREE.Vector3(5.6, 18.5, 7.5),
      totalArea: 585.5,
    },
  ];

  // --- SISTEMA DE ILUMINACIÓN MULTI-ESTADO ---
  const lightsGroup = new THREE.Group();

  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.95);
  lightsGroup.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xFFFAF2, 1.5);
  sunLight.position.set(40, 65, 35);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 180;
  const shadowDim = 36;
  sunLight.shadow.camera.left = -shadowDim;
  sunLight.shadow.camera.right = shadowDim;
  sunLight.shadow.camera.top = shadowDim;
  sunLight.shadow.camera.bottom = -shadowDim;
  sunLight.shadow.bias = -0.0001;
  sunLight.shadow.normalBias = 0.03;
  sunLight.shadow.radius = 1.5;
  lightsGroup.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xEFEBE0, 0.65);
  fillLight.position.set(-35, 30, -30);
  lightsGroup.add(fillLight);

  const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xEFEBE0, 0.75);
  lightsGroup.add(hemisphereLight);

  // Luminarias puntuales interiores
  const interiorLightNorte = new THREE.PointLight(0xFFA834, 1.2, 45);
  interiorLightNorte.position.set(-5.6, 10, 0);
  lightsGroup.add(interiorLightNorte);

  const interiorLightSur = new THREE.PointLight(0xFFA834, 1.2, 45);
  interiorLightSur.position.set(5.6, 10, 0);
  lightsGroup.add(interiorLightSur);

  const interiorLightLowerN = new THREE.PointLight(0xFFB04A, 1.0, 35);
  interiorLightLowerN.position.set(-5.6, 3.5, 0);
  lightsGroup.add(interiorLightLowerN);

  const interiorLightLowerS = new THREE.PointLight(0xFFB04A, 1.0, 35);
  interiorLightLowerS.position.set(5.6, 3.5, 0);
  lightsGroup.add(interiorLightLowerS);

  const interiorLightMiradorN = new THREE.PointLight(0xFFA834, 1.0, 35);
  interiorLightMiradorN.position.set(-5.6, 18.5, 0);
  lightsGroup.add(interiorLightMiradorN);

  const interiorLightMiradorS = new THREE.PointLight(0xFFA834, 1.0, 35);
  interiorLightMiradorS.position.set(5.6, 18.5, 0);
  lightsGroup.add(interiorLightMiradorS);

  const lobbySpot = new THREE.PointLight(0xFFE4B5, 1.5, 25);
  lobbySpot.position.set(0, 4, 2);
  lightsGroup.add(lobbySpot);

  const LIGHTING_TARGETS: Record<SolarTimeMode, {
    ambientIntensity: number;
    ambientColor: THREE.Color;
    sunIntensity: number;
    sunColor: THREE.Color;
    sunPos: THREE.Vector3;
    fillIntensity: number;
    fillColor: THREE.Color;
    hemiIntensity: number;
    hemiSky: THREE.Color;
    hemiGround: THREE.Color;
    intN: number;
    intS: number;
    intLowN: number;
    intLowS: number;
    intMirN: number;
    intMirS: number;
    lobby: number;
    interiorGlow: number;
    coveLed: number;
  }> = {
    morning: {
      ambientIntensity: 0.92,
      ambientColor: new THREE.Color(0xFFFFFF),
      sunIntensity: 1.45,
      sunColor: new THREE.Color(0xFFFAF2),
      sunPos: new THREE.Vector3(40, 65, 35),
      fillIntensity: 0.60,
      fillColor: new THREE.Color(0xE5F0F5),
      hemiIntensity: 0.70,
      hemiSky: new THREE.Color(0xFFFFFF),
      hemiGround: new THREE.Color(0xEFEBE0),
      intN: 0.8,
      intS: 0.8,
      intLowN: 0.6,
      intLowS: 0.6,
      intMirN: 0.8,
      intMirS: 0.8,
      lobby: 0.8,
      interiorGlow: 0.75,
      coveLed: 2.0,
    },
    golden: {
      ambientIntensity: 0.65,
      ambientColor: new THREE.Color(0xFFE2C4),
      sunIntensity: 1.60,
      sunColor: new THREE.Color(0xFFA04A),
      sunPos: new THREE.Vector3(-55, 32, -35),
      fillIntensity: 0.55,
      fillColor: new THREE.Color(0x754B3E),
      hemiIntensity: 0.60,
      hemiSky: new THREE.Color(0xFFBC85),
      hemiGround: new THREE.Color(0x3B2518),
      intN: 3.5,
      intS: 3.5,
      intLowN: 3.0,
      intLowS: 3.0,
      intMirN: 3.5,
      intMirS: 3.5,
      lobby: 2.8,
      interiorGlow: 1.5,
      coveLed: 4.5,
    },
    night: {
      ambientIntensity: 0.40,
      ambientColor: new THREE.Color(0x2A3552),
      sunIntensity: 0.45,
      sunColor: new THREE.Color(0x788AB8),
      sunPos: new THREE.Vector3(20, 50, 20),
      fillIntensity: 0.30,
      fillColor: new THREE.Color(0x1E263D),
      hemiIntensity: 0.38,
      hemiSky: new THREE.Color(0x303E60),
      hemiGround: new THREE.Color(0x141A26),
      intN: 6.5,
      intS: 6.5,
      intLowN: 5.5,
      intLowS: 5.5,
      intMirN: 6.5,
      intMirS: 6.5,
      lobby: 5.0,
      interiorGlow: 2.6,
      coveLed: 6.5,
    },
  };

  let isLightingTransitioning = true;

  const updateLightingMode = (mode: SolarTimeMode, immediate: boolean = false) => {
    isLightingTransitioning = true;
    const t = immediate ? 1.0 : 0.14;
    transitionGlassMaterials(materials, mode, t);

    const cfg = LIGHTING_TARGETS[mode];
    if (immediate) {
      ambientLight.intensity = cfg.ambientIntensity;
      ambientLight.color.copy(cfg.ambientColor);
      sunLight.intensity = cfg.sunIntensity;
      sunLight.color.copy(cfg.sunColor);
      sunLight.position.copy(cfg.sunPos);
      fillLight.intensity = cfg.fillIntensity;
      fillLight.color.copy(cfg.fillColor);
      hemisphereLight.intensity = cfg.hemiIntensity;
      hemisphereLight.color.copy(cfg.hemiSky);
      hemisphereLight.groundColor.copy(cfg.hemiGround);

      interiorLightNorte.intensity = cfg.intN;
      interiorLightSur.intensity = cfg.intS;
      interiorLightLowerN.intensity = cfg.intLowN;
      interiorLightLowerS.intensity = cfg.intLowS;
      interiorLightMiradorN.intensity = cfg.intMirN;
      interiorLightMiradorS.intensity = cfg.intMirS;
      lobbySpot.intensity = cfg.lobby;
      materials.interiorGlow.emissiveIntensity = cfg.interiorGlow;
      materials.coveLed.emissiveIntensity = cfg.coveLed;
      isLightingTransitioning = false;
    }
  };

  const transitionStep = (mode: SolarTimeMode, deltaFactor: number = 0.08) => {
    const glassStillTransitioning = transitionGlassMaterials(materials, mode, deltaFactor);

    if (!isLightingTransitioning && !glassStillTransitioning) {
      return;
    }

    const cfg = LIGHTING_TARGETS[mode];
    const d = Math.max(0.01, Math.min(1.0, deltaFactor));

    const dSun = Math.abs(sunLight.intensity - cfg.sunIntensity);
    const dAmb = Math.abs(ambientLight.intensity - cfg.ambientIntensity);
    if (dSun < 0.005 && dAmb < 0.005) {
      ambientLight.intensity = cfg.ambientIntensity;
      ambientLight.color.copy(cfg.ambientColor);
      sunLight.intensity = cfg.sunIntensity;
      sunLight.color.copy(cfg.sunColor);
      sunLight.position.copy(cfg.sunPos);
      fillLight.intensity = cfg.fillIntensity;
      fillLight.color.copy(cfg.fillColor);
      hemisphereLight.intensity = cfg.hemiIntensity;
      hemisphereLight.color.copy(cfg.hemiSky);
      hemisphereLight.groundColor.copy(cfg.hemiGround);

      interiorLightNorte.intensity = cfg.intN;
      interiorLightSur.intensity = cfg.intS;
      interiorLightLowerN.intensity = cfg.intLowN;
      interiorLightLowerS.intensity = cfg.intLowS;
      interiorLightMiradorN.intensity = cfg.intMirN;
      interiorLightMiradorS.intensity = cfg.intMirS;
      lobbySpot.intensity = cfg.lobby;

      materials.interiorGlow.emissiveIntensity = cfg.interiorGlow;
      materials.coveLed.emissiveIntensity = cfg.coveLed;
      isLightingTransitioning = false;
      return;
    }

    ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, cfg.ambientIntensity, d);
    ambientLight.color.lerp(cfg.ambientColor, d);

    sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, cfg.sunIntensity, d);
    sunLight.color.lerp(cfg.sunColor, d);
    sunLight.position.lerp(cfg.sunPos, d);

    fillLight.intensity = THREE.MathUtils.lerp(fillLight.intensity, cfg.fillIntensity, d);
    fillLight.color.lerp(cfg.fillColor, d);

    hemisphereLight.intensity = THREE.MathUtils.lerp(hemisphereLight.intensity, cfg.hemiIntensity, d);
    hemisphereLight.color.lerp(cfg.hemiSky, d);
    hemisphereLight.groundColor.lerp(cfg.hemiGround, d);

    interiorLightNorte.intensity = THREE.MathUtils.lerp(interiorLightNorte.intensity, cfg.intN, d);
    interiorLightSur.intensity = THREE.MathUtils.lerp(interiorLightSur.intensity, cfg.intS, d);
    interiorLightLowerN.intensity = THREE.MathUtils.lerp(interiorLightLowerN.intensity, cfg.intLowN, d);
    interiorLightLowerS.intensity = THREE.MathUtils.lerp(interiorLightLowerS.intensity, cfg.intLowS, d);
    interiorLightMiradorN.intensity = THREE.MathUtils.lerp(interiorLightMiradorN.intensity, cfg.intMirN, d);
    interiorLightMiradorS.intensity = THREE.MathUtils.lerp(interiorLightMiradorS.intensity, cfg.intMirS, d);
    lobbySpot.intensity = THREE.MathUtils.lerp(lobbySpot.intensity, cfg.lobby, d);

    materials.interiorGlow.emissiveIntensity = THREE.MathUtils.lerp(
      materials.interiorGlow.emissiveIntensity,
      cfg.interiorGlow,
      d
    );
    materials.coveLed.emissiveIntensity = THREE.MathUtils.lerp(
      materials.coveLed.emissiveIntensity,
      cfg.coveLed,
      d
    );
  };

  return {
    buildingRoot,
    unitMeshesMap,
    levelGroups,
    unitAnchors,
    lightsGroup,
    updateLightingMode,
    transitionStep,
  };
}
