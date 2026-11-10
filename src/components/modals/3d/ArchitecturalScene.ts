/**
 * ============================================================================
 * RESIDENCIAS CARONÍ — MOTOR VOLUMÉTRICO 3D DE ALTA PRECISIÓN ARQUITECTÓNICA
 * ============================================================================
 * Arquitectura & Diseño: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Ingeniería de Software, Modelado Paramétrico 3D & Experiencia Interactiva:
 * Ing. Luis Martinez (luismartinez.developer@gmail.com)
 * Ubicación: Transversal 8, entre 2da y 3ra Avenida, Altamira, Caracas
 *
 * Geometría real de las 4 fachadas, las 2 piscinas frontales, el acceso
 * vehicular lateral/posterior y el estacionamiento completamente cerrado:
 *
 * 1. FACHADA PRINCIPAL DE TERRAZAS Y PISCINAS (Z+ / Frente):
 *    - Única fachada con los balcones continuos en curva orgánica en "S"
 *      (S-Curve Ribbon Balconies), antepecho monolítico de concreto visto gris,
 *      plafón de madera teca con rieles negros de iluminación (track lights)
 *      y jardineras perimetrales desbordantes de vegetación tropical.
 *    - 5 columnas cilíndricas monumentales de concreto visto (Ø 0.56m) que
 *      enmarcan las 2 torres frontales de celosías verticales terracota
 *      (Eje Izquierdo entre columnas 2 y 3, y Eje Derecho junto a columna 4),
 *      más las 2 torres de celosías terracota en los extremos laterales.
 *    - Ventanales de piso a techo escalonados en zig-zag con esquinas de vidrio
 *      a 90°, frisos de concreto visto en las dobles alturas y paneles acanalados.
 *    - DOS (2) PISCINAS PRIVADAS en Planta Baja (una en el jardín del Dúplex
 *      Izquierdo y otra en el jardín del Dúplex Derecho), separadas por un muro
 *      divisorio de piedra laja con palmeras y rodeadas por terrazas de granito,
 *      solárium y muro perimetral en piedra laja carbón con vegetación.
 *
 * 2. FACHADA POSTERIOR DE VENTANAS (Z- / Sin Balcones):
 *    - Fachada arquitectónica plana (SIN balcones volados), conformada por un
 *      gran pórtico perimetral de concreto visto gris, machones verticales
 *      intermedios de concreto visto, canales verticales oscuros de ventanas,
 *      paños blancos con buñas horizontales finas y una composición rítmica de
 *      ventanas cuadradas, dobles y troneras verticales con marcos negros.
 *
 * 3. FACHADA LATERAL IZQUIERDA (X- / Costado Oeste):
 *    - Pórtico de concreto visto gris posterior y superior, dos canales oscuros
 *      verticales, gran paño blanco con buñas horizontales y 6 niveles de ventanas,
 *      franja vertical y friso superior en concreto claro estriado (fluted) y
 *      torre de celosías terracota en la esquina frontal que entrega a los balcones.
 *
 * 4. FACHADA LATERAL DERECHA Y ACCESO VEHICULAR (X+ / Costado Este):
 *    - Torre de celosías terracota en la esquina frontal de los balcones, gran
 *      pilar de concreto visto que sube hasta la cubierta, canal oscuro vertical,
 *      paño principal blanco con buñas horizontales y ventanas, machón intermedio
 *      de concreto visto, segundo canal oscuro, paño blanco posterior y pilar trasero.
 *    - En la base de este costado derecho se ubica el Portón Vehicular en
 *      listones verticales color terracota bajo dintel de piedra laja oscura,
 *      la caseta de concreto visto y la rampa estriada con 5 franjas oscuras.
 *
 * 5. ESTACIONAMIENTO SUBTERRÁNEO CON LAS 4 PAREDES CUBIERTAS (Sótano):
 *    - Basamento perimetral con sus 4 paredes de concreto visto completamente
 *      cerradas/cubiertas (sin huecos abiertos al exterior), rampa vehicular de
 *      acceso desde el portón lateral, doble losa interna con puestos demarcados,
 *      columnas estructurales y vehículos (visibles al activar Despiece Vertical).
 * ============================================================================
 */

import * as THREE from 'three';

export type SolarTimeMode = 'morning' | 'golden' | 'night';

export interface SceneMaterials {
  travertine: THREE.MeshStandardMaterial;
  concreteSlab: THREE.MeshStandardMaterial;
  boardFormedConcrete: THREE.MeshStandardMaterial;
  parkingBoardConcrete: THREE.MeshStandardMaterial;
  parkingSplitStone: THREE.MeshStandardMaterial;
  whiteGroovedCladding: THREE.MeshStandardMaterial;
  flutedConcreteMat: THREE.MeshStandardMaterial;
  darkFlutedMetalMat: THREE.MeshStandardMaterial;
  darkSlateStone: THREE.MeshStandardMaterial;
  alabaster: THREE.MeshStandardMaterial;
  woodSoffit: THREE.MeshStandardMaterial;
  cortenLouver: THREE.MeshStandardMaterial;
  bronzeMetal: THREE.MeshStandardMaterial;
  slimDoorFrameMetal: THREE.MeshStandardMaterial;
  stainlessSteel: THREE.MeshStandardMaterial;
  architecturalGlass: THREE.MeshPhysicalMaterial;
  balconyDoorGlass: THREE.MeshPhysicalMaterial;
  windowInteriorBacking: THREE.MeshStandardMaterial;
  glassBalustrade: THREE.MeshPhysicalMaterial;
  foliageDark: THREE.MeshStandardMaterial;
  foliageLight: THREE.MeshStandardMaterial;
  foliageAccent: THREE.MeshStandardMaterial;
  trunkMaterial: THREE.MeshStandardMaterial;
  soilMaterial: THREE.MeshStandardMaterial;
  waterMirror: THREE.MeshPhysicalMaterial;
  poolMosaicTile: THREE.MeshStandardMaterial;
  poolCopingStone: THREE.MeshStandardMaterial;
  podiumStone: THREE.MeshStandardMaterial;
  lawnGrassMat: THREE.MeshStandardMaterial;
  interiorGlow: THREE.MeshStandardMaterial;
  coveLed: THREE.MeshStandardMaterial;
  poolUnderwaterLed: THREE.MeshStandardMaterial;
  interiorFloor: THREE.MeshStandardMaterial;
  furnitureFabric: THREE.MeshStandardMaterial;
  furnitureWood: THREE.MeshStandardMaterial;
}

export interface UnitAnchor {
  id: string;
  code: string;
  name: string;
  levelKey: string;
  position: THREE.Vector3;
}

export interface UnitMeshRegistry {
  [unitId: string]: THREE.Mesh[];
}

/**
 * Configura filtrado anisotrópico y mipmapping en texturas procedurales
 */
function configureCrispTexture(
  texture: THREE.CanvasTexture,
  repeatX: number,
  repeatY: number,
  maxAnisotropy: number = 16,
  isSRGB: boolean = true
): THREE.CanvasTexture {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = maxAnisotropy;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  if (isSRGB) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  texture.needsUpdate = true;
  return texture;
}

const PROCEDURAL_CANVAS_CACHE = new Map<string, HTMLCanvasElement>();

function getOrCreateProceduralCanvas(
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void
): HTMLCanvasElement {
  const cached = PROCEDURAL_CANVAS_CACHE.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, canvas);
  }
  PROCEDURAL_CANVAS_CACHE.set(key, canvas);
  return canvas;
}

/**
 * 1. Textura de Concreto Visto Arquitectónico (Fair-faced Board-Formed Grey Concrete)
 */
function createFairFacedConcreteTexture(maxAnisotropy: number = 16): THREE.CanvasTexture {
  const canvas = getOrCreateProceduralCanvas('fairFacedConcrete', 1024, 1024, (ctx) => {
    ctx.fillStyle = '#D2CEC5';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 500; i++) {
      const y = Math.random() * 1024;
      const h = 4 + Math.random() * 20;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(176, 171, 162, 0.16)' : 'rgba(236, 233, 226, 0.15)';
      ctx.fillRect(0, y, 1024, h);
    }

    for (let i = 0; i < 6800; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const r = 0.6 + Math.random() * 1.6;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(105, 100, 92, 0.14)' : 'rgba(248, 246, 242, 0.13)';
      ctx.fillRect(x, y, r, r);
    }

    ctx.strokeStyle = 'rgba(100, 95, 88, 0.32)';
    ctx.lineWidth = 2;
    for (let y = 128; y < 1024; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }
    for (let x = 256; x < 1024; x += 256) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();

      for (let y = 64; y < 1024; y += 128) {
        ctx.fillStyle = 'rgba(82, 78, 72, 0.38)';
        ctx.beginPath();
        ctx.arc(x - 34, y, 3.5, 0, Math.PI * 2);
        ctx.arc(x + 34, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  return configureCrispTexture(new THREE.CanvasTexture(canvas), 3, 2, maxAnisotropy, true);
}

/**
 * 1B. Textura de Concreto Visto de Alto Relieve para Paredes Ciegas del Estacionamiento
 * Incluye tablones de encofrado horizontales, juntas modulares profundas y conos de anclaje.
 */
function createParkingBoardFormedConcreteTexture(maxAnisotropy: number = 16): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  let canvas = PROCEDURAL_CANVAS_CACHE.get('parkingConcreteMap');
  let bumpCanvas = PROCEDURAL_CANVAS_CACHE.get('parkingConcreteBump');

  if (!canvas || !bumpCanvas) {
    canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 512;
    const bCtx = bumpCanvas.getContext('2d');

    if (ctx && bCtx) {
      ctx.fillStyle = '#BEB9AE';
      ctx.fillRect(0, 0, 1024, 512);
      bCtx.fillStyle = '#909090';
      bCtx.fillRect(0, 0, 1024, 512);

      const plankH = 32;
      for (let y = 0; y < 512; y += plankH) {
        const shade = 182 + (((y * 7) % 19) - 9);
        ctx.fillStyle = `rgb(${shade}, ${shade - 4}, ${shade - 10})`;
        ctx.fillRect(0, y + 1, 1024, plankH - 2);

        const bShade = 128 + (((y * 11) % 36) - 18);
        bCtx.fillStyle = `rgb(${bShade}, ${bShade}, ${bShade})`;
        bCtx.fillRect(0, y + 2, 1024, plankH - 3);

        for (let g = 0; g < 18; g++) {
          const gy = y + 3 + Math.random() * (plankH - 6);
          ctx.fillStyle = g % 2 === 0 ? 'rgba(95, 90, 82, 0.16)' : 'rgba(235, 231, 224, 0.14)';
          ctx.fillRect(0, gy, 1024, 1.5);
          bCtx.fillStyle = g % 2 === 0 ? 'rgba(65, 65, 65, 0.35)' : 'rgba(195, 195, 195, 0.28)';
          bCtx.fillRect(0, gy, 1024, 1.5);
        }

        ctx.fillStyle = 'rgba(72, 68, 62, 0.55)';
        ctx.fillRect(0, y, 1024, 2);
        bCtx.fillStyle = '#202020';
        bCtx.fillRect(0, y, 1024, 3);
      }

      for (let x = 0; x < 1024; x += 256) {
        ctx.fillStyle = 'rgba(62, 58, 52, 0.68)';
        ctx.fillRect(x, 0, 4, 512);
        ctx.fillStyle = 'rgba(238, 234, 226, 0.45)';
        ctx.fillRect(x + 4, 0, 2, 512);

        bCtx.fillStyle = '#101010';
        bCtx.fillRect(x, 0, 5, 512);

        const coneRows = [96, 256, 416];
        coneRows.forEach((cy) => {
          [x + 48, x + 208].forEach((cx) => {
            ctx.fillStyle = 'rgba(54, 50, 45, 0.78)';
            ctx.beginPath();
            ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(225, 220, 212, 0.55)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
            ctx.stroke();

            bCtx.fillStyle = '#080808';
            bCtx.beginPath();
            bCtx.arc(cx, cy, 7, 0, Math.PI * 2);
            bCtx.fill();
          });
        });
      }
    }
    PROCEDURAL_CANVAS_CACHE.set('parkingConcreteMap', canvas);
    PROCEDURAL_CANVAS_CACHE.set('parkingConcreteBump', bumpCanvas);
  }

  return {
    map: configureCrispTexture(new THREE.CanvasTexture(canvas), 6, 2, maxAnisotropy, true),
    bumpMap: configureCrispTexture(new THREE.CanvasTexture(bumpCanvas), 6, 2, maxAnisotropy, false),
  };
}

/**
 * 1C. Textura de Mosaico Vítreo Azul Turquesa (Gresite de Piscina con Cáusticas)
 */
function createPoolMosaicTileTexture(maxAnisotropy: number = 16): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  let canvas = PROCEDURAL_CANVAS_CACHE.get('poolMosaicMap');
  let bumpCanvas = PROCEDURAL_CANVAS_CACHE.get('poolMosaicBump');

  if (!canvas || !bumpCanvas) {
    canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const bCtx = bumpCanvas.getContext('2d');

    if (ctx && bCtx) {
      ctx.fillStyle = '#A8E8F4';
      ctx.fillRect(0, 0, 512, 512);
      bCtx.fillStyle = '#303030';
      bCtx.fillRect(0, 0, 512, 512);

      const tileSize = 16;
      for (let y = 0; y < 512; y += tileSize) {
        for (let x = 0; x < 512; x += tileSize) {
          const variation = ((x * 13 + y * 29) % 32) - 16;
          const r = Math.max(8, Math.min(48, 18 + (variation >> 1)));
          const g = Math.max(125, Math.min(205, 168 + variation));
          const b = Math.max(175, Math.min(242, 212 + variation));
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x + 1.5, y + 1.5, tileSize - 2.5, tileSize - 2.5);

          bCtx.fillStyle = '#E6E6E6';
          bCtx.fillRect(x + 2, y + 2, tileSize - 3, tileSize - 3);
        }
      }

      for (let c = 0; c < 28; c++) {
        const cx = ((c * 97) % 460) + 26;
        const cy = ((c * 151) % 460) + 26;
        const rad = 28 + (c % 5) * 14;
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad);
        grad.addColorStop(0, 'rgba(195, 252, 255, 0.34)');
        grad.addColorStop(0.6, 'rgba(90, 225, 245, 0.14)');
        grad.addColorStop(1, 'rgba(18, 168, 210, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
      }
    }
    PROCEDURAL_CANVAS_CACHE.set('poolMosaicMap', canvas);
    PROCEDURAL_CANVAS_CACHE.set('poolMosaicBump', bumpCanvas);
  }

  return {
    map: configureCrispTexture(new THREE.CanvasTexture(canvas), 4, 2, maxAnisotropy, true),
    bumpMap: configureCrispTexture(new THREE.CanvasTexture(bumpCanvas), 4, 2, maxAnisotropy, false),
  };
}

/**
 * 1D. Textura de Ondas de Agua para el Espejo de las Piscinas
 */
function createWaterRippleBumpTexture(maxAnisotropy: number = 16): THREE.CanvasTexture {
  const canvas = getOrCreateProceduralCanvas('waterRippleBump', 512, 512, (ctx) => {
    const imgData = ctx.createImageData(512, 512);
    const data = imgData.data;
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const nx = (x / 512) * Math.PI * 12;
        const ny = (y / 512) * Math.PI * 12;
        const wave =
          Math.sin(nx + Math.cos(ny * 0.8)) * 0.45 +
          Math.cos(ny * 1.3 - Math.sin(nx * 0.7)) * 0.35 +
          Math.sin((nx + ny) * 1.6) * 0.2;
        const val = Math.floor(128 + wave * 95);
        const idx = (y * 512 + x) * 4;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  });
  return configureCrispTexture(new THREE.CanvasTexture(canvas), 3, 2, maxAnisotropy, false);
}

/**
 * 2. Textura de Revestimiento Blanco Marfil con Buñas Horizontales Finas
 */
function createHorizontalGroovedCladdingTexture(maxAnisotropy: number = 16): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  let canvas = PROCEDURAL_CANVAS_CACHE.get('horizontalGroovedMap');
  let bumpCanvas = PROCEDURAL_CANVAS_CACHE.get('horizontalGroovedBump');

  if (!canvas || !bumpCanvas) {
    canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    if (ctx && bCtx) {
      ctx.fillStyle = '#F2EFE9';
      ctx.fillRect(0, 0, 512, 1024);

      bCtx.fillStyle = '#E2E2E2';
      bCtx.fillRect(0, 0, 512, 1024);

      for (let y = 0; y < 1024; y += 22) {
        ctx.fillStyle = 'rgba(135, 129, 119, 0.50)';
        ctx.fillRect(0, y, 512, 3);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(0, y + 3, 512, 2);

        bCtx.fillStyle = '#222222';
        bCtx.fillRect(0, y, 512, 4);
      }

      ctx.strokeStyle = 'rgba(158, 152, 142, 0.30)';
      ctx.lineWidth = 1.5;
      for (let row = 0; row < Math.floor(1024 / 22); row++) {
        const y0 = row * 22;
        const offset = (row % 2) * 85;
        for (let x = offset; x < 512; x += 170) {
          ctx.beginPath();
          ctx.moveTo(x, y0);
          ctx.lineTo(x, y0 + 22);
          ctx.stroke();
        }
      }
    }
    PROCEDURAL_CANVAS_CACHE.set('horizontalGroovedMap', canvas);
    PROCEDURAL_CANVAS_CACHE.set('horizontalGroovedBump', bumpCanvas);
  }

  return {
    map: configureCrispTexture(new THREE.CanvasTexture(canvas), 2, 4, maxAnisotropy, true),
    bumpMap: configureCrispTexture(new THREE.CanvasTexture(bumpCanvas), 2, 4, maxAnisotropy, false),
  };
}

/**
 * 3. Textura Acanalada Vertical (Fluted Concrete / Ribbed Panel)
 */
function createVerticalFlutedTexture(
  baseHex: string,
  shadowHex: string,
  highlightHex: string,
  maxAnisotropy: number = 16
): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const mapKey = `verticalFlutedMap_${baseHex}_${shadowHex}_${highlightHex}`;
  const bumpKey = 'verticalFlutedBump';
  let canvas = PROCEDURAL_CANVAS_CACHE.get(mapKey);
  let bumpCanvas = PROCEDURAL_CANVAS_CACHE.get(bumpKey);

  if (!canvas || !bumpCanvas) {
    canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!bumpCanvas) {
      bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = 512;
      bumpCanvas.height = 512;
    }
    const bCtx = bumpCanvas.getContext('2d');

    if (ctx && bCtx) {
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, 512, 512);
      bCtx.fillStyle = '#D0D0D0';
      bCtx.fillRect(0, 0, 512, 512);

      const fluteWidth = 16;
      for (let x = 0; x < 512; x += fluteWidth) {
        ctx.fillStyle = shadowHex;
        ctx.fillRect(x, 0, 5, 512);
        ctx.fillStyle = highlightHex;
        ctx.fillRect(x + 5, 0, 4, 512);

        bCtx.fillStyle = '#252525';
        bCtx.fillRect(x, 0, 6, 512);
      }
    }
    PROCEDURAL_CANVAS_CACHE.set(mapKey, canvas);
    PROCEDURAL_CANVAS_CACHE.set(bumpKey, bumpCanvas);
  }

  return {
    map: configureCrispTexture(new THREE.CanvasTexture(canvas), 3, 2, maxAnisotropy, true),
    bumpMap: configureCrispTexture(new THREE.CanvasTexture(bumpCanvas), 3, 2, maxAnisotropy, false),
  };
}

/**
 * 4. Textura de Piedra Laja Oscura Apilada (Revestimiento de Piedra en Muros y Basamento)
 */
function createDarkStackedSlateTexture(maxAnisotropy: number = 16): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  let canvas = PROCEDURAL_CANVAS_CACHE.get('darkStackedSlateMap');
  let bumpCanvas = PROCEDURAL_CANVAS_CACHE.get('darkStackedSlateBump');

  if (!canvas || !bumpCanvas) {
    canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 512;
    const bCtx = bumpCanvas.getContext('2d');

    if (ctx && bCtx) {
      ctx.fillStyle = '#2B2A28';
      ctx.fillRect(0, 0, 1024, 512);
      bCtx.fillStyle = '#808080';
      bCtx.fillRect(0, 0, 1024, 512);

      const rowHeight = 20;
      for (let y = 0; y < 512; y += rowHeight) {
        let x = 0;
        while (x < 1024) {
          const w = 55 + Math.floor(Math.random() * 95);
          const shade = 38 + Math.floor(Math.random() * 34);
          const warmOffset = Math.floor(Math.random() * 8);
          ctx.fillStyle = `rgb(${shade + warmOffset}, ${shade}, ${shade - 3})`;
          ctx.fillRect(x + 1, y + 1, w - 2, rowHeight - 3);

          const bVal = 75 + Math.floor(Math.random() * 165);
          bCtx.fillStyle = `rgb(${bVal}, ${bVal}, ${bVal})`;
          bCtx.fillRect(x + 2, y + 2, w - 4, rowHeight - 5);

          ctx.fillStyle = '#141311';
          ctx.fillRect(x, y + rowHeight - 3, w, 3);
          ctx.fillRect(x + w - 2, y, 2, rowHeight);

          bCtx.fillStyle = '#101010';
          bCtx.fillRect(x, y + rowHeight - 3, w, 3);
          x += w;
        }
      }
    }
    PROCEDURAL_CANVAS_CACHE.set('darkStackedSlateMap', canvas);
    PROCEDURAL_CANVAS_CACHE.set('darkStackedSlateBump', bumpCanvas);
  }

  return {
    map: configureCrispTexture(new THREE.CanvasTexture(canvas), 6, 2, maxAnisotropy, true),
    bumpMap: configureCrispTexture(new THREE.CanvasTexture(bumpCanvas), 6, 2, maxAnisotropy, false),
  };
}

/**
 * 5. Textura de Madera Teca / Parota en Listones (Plafones de Balcones y Decks de Piscina)
 */
function createWoodSoffitTexture(maxAnisotropy: number = 16): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  let canvas = PROCEDURAL_CANVAS_CACHE.get('woodSoffitMap');
  let bumpCanvas = PROCEDURAL_CANVAS_CACHE.get('woodSoffitBump');

  if (!canvas || !bumpCanvas) {
    canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    if (ctx && bCtx) {
      ctx.fillStyle = '#8A5630';
      ctx.fillRect(0, 0, 1024, 1024);
      bCtx.fillStyle = '#C8C8C8';
      bCtx.fillRect(0, 0, 1024, 1024);

      const plankWidth = 28;
      for (let x = 0; x < 1024; x += plankWidth) {
        const toneShift = (Math.sin(x * 0.19) * 11) | 0;
        ctx.fillStyle = `rgb(${140 + toneShift}, ${88 + (toneShift >> 1)}, ${48 + (toneShift >> 2)})`;
        ctx.fillRect(x + 1, 0, plankWidth - 3, 1024);

        for (let v = 0; v < 20; v++) {
          const vx = x + 3 + Math.random() * (plankWidth - 6);
          ctx.fillStyle = v % 2 === 0 ? 'rgba(58, 30, 12, 0.15)' : 'rgba(182, 126, 78, 0.12)';
          ctx.fillRect(vx, 0, 1.5, 1024);
        }

        ctx.fillStyle = '#261407';
        ctx.fillRect(x, 0, 3, 1024);
        bCtx.fillStyle = '#202020';
        bCtx.fillRect(x, 0, 3, 1024);
      }
    }
    PROCEDURAL_CANVAS_CACHE.set('woodSoffitMap', canvas);
    PROCEDURAL_CANVAS_CACHE.set('woodSoffitBump', bumpCanvas);
  }

  return {
    map: configureCrispTexture(new THREE.CanvasTexture(canvas), 4, 4, maxAnisotropy, true),
    bumpMap: configureCrispTexture(new THREE.CanvasTexture(bumpCanvas), 4, 4, maxAnisotropy, false),
  };
}

/**
 * 6. Textura de Terracota / Madera Rojiza (Brise-Soleil & Portón de Acceso)
 */
function createTerracottaLouverTexture(maxAnisotropy: number = 16): THREE.CanvasTexture {
  const canvas = getOrCreateProceduralCanvas('terracottaLouver', 512, 512, (ctx) => {
    ctx.fillStyle = '#A64D2D';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 650; i++) {
      const y = Math.random() * 512;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(130, 48, 22, 0.18)' : 'rgba(196, 102, 66, 0.15)';
      ctx.fillRect(0, y, 512, 2 + Math.random() * 8);
    }
  });
  return configureCrispTexture(new THREE.CanvasTexture(canvas), 2, 2, maxAnisotropy, true);
}

/**
 * 7. Textura Procedural de Cristal Arquitectónico con Brillo Especular y Bandas de Reflejo
 * - isDarkSmoked = false: Cristal reflectivo claro azul-plata para todas las ventanas del edificio
 * - isDarkSmoked = true: Vidrio ahumado oscuro grafito-bronce para puertas corredizas de balcones
 */
function createGlassSpecularReflectionTexture(
  isBalconySlidingGlass: boolean,
  maxAnisotropy: number = 16
): THREE.CanvasTexture {
  const key = isBalconySlidingGlass ? 'glassSpecular_balcony' : 'glassSpecular_window';
  const canvas = getOrCreateProceduralCanvas(key, 512, 512, (ctx) => {
    const baseGrad = ctx.createLinearGradient(0, 0, 512, 512);
    if (isBalconySlidingGlass) {
      baseGrad.addColorStop(0.0, '#4E94C4');
      baseGrad.addColorStop(0.32, '#86C6EC');
      baseGrad.addColorStop(0.62, '#5DA4D4');
      baseGrad.addColorStop(1.0, '#3D7EA8');
    } else {
      baseGrad.addColorStop(0.0, '#5AA6D4');
      baseGrad.addColorStop(0.32, '#9AD4F5');
      baseGrad.addColorStop(0.58, '#6CB6E2');
      baseGrad.addColorStop(1.0, '#468EB8');
    }
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 512, 512);

    const horizonGrad = ctx.createLinearGradient(0, 0, 0, 512);
    horizonGrad.addColorStop(0.0, 'rgba(242, 253, 255, 0.46)');
    horizonGrad.addColorStop(0.46, 'rgba(186, 232, 255, 0.18)');
    horizonGrad.addColorStop(0.54, 'rgba(36, 76, 108, 0.22)');
    horizonGrad.addColorStop(1.0, 'rgba(214, 244, 255, 0.34)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(-Math.PI / 4.2);

    const sheenBands = [
      { x: -205, w: 68, alpha: isBalconySlidingGlass ? 0.58 : 0.66 },
      { x: -55, w: 112, alpha: isBalconySlidingGlass ? 0.74 : 0.82 },
      { x: 68, w: 36, alpha: isBalconySlidingGlass ? 0.88 : 0.92 },
      { x: 148, w: 76, alpha: isBalconySlidingGlass ? 0.52 : 0.58 },
    ];

    sheenBands.forEach((b) => {
      const bandGrad = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
      bandGrad.addColorStop(0.0, 'rgba(250, 254, 255, 0.0)');
      bandGrad.addColorStop(0.5, `rgba(250, 254, 255, ${b.alpha})`);
      bandGrad.addColorStop(1.0, 'rgba(250, 254, 255, 0.0)');
      ctx.fillStyle = bandGrad;
      ctx.fillRect(b.x, -420, b.w, 840);
    });
    ctx.restore();

    ctx.strokeStyle = 'rgba(24, 58, 84, 0.52)';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 502, 502);

    ctx.strokeStyle = 'rgba(235, 250, 255, 0.42)';
    ctx.lineWidth = 3;
    ctx.strokeRect(11, 11, 490, 490);
  });

  return configureCrispTexture(new THREE.CanvasTexture(canvas), 1, 1, maxAnisotropy, true);
}

/**
 * 8. Textura de Profundidad Óptica Interior para Ventanas (Sombra de Dintel + Cortina Traslúcida)
 */
function createWindowInteriorDepthTexture(maxAnisotropy: number = 16): THREE.CanvasTexture {
  const canvas = getOrCreateProceduralCanvas('windowInteriorDepth', 256, 256, (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, '#101C28');
    grad.addColorStop(0.28, '#1E3246');
    grad.addColorStop(0.72, '#2B445C');
    grad.addColorStop(1.0, '#182634');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    for (let x = 144; x < 246; x += 14) {
      const fGrad = ctx.createLinearGradient(x, 0, x + 14, 0);
      fGrad.addColorStop(0, 'rgba(215, 232, 245, 0.08)');
      fGrad.addColorStop(0.5, 'rgba(235, 246, 255, 0.32)');
      fGrad.addColorStop(1, 'rgba(185, 208, 225, 0.06)');
      ctx.fillStyle = fGrad;
      ctx.fillRect(x, 10, 14, 236);
    }
  });
  return configureCrispTexture(new THREE.CanvasTexture(canvas), 1, 1, maxAnisotropy, true);
}

/**
 * Caché de lienzos HDRI de Caracas (2048x1024) y texturas de shader por modo solar
 * para garantizar conmutación instantánea (0ms) y máxima nitidez en reflejos y refracción.
 */
const CARACAS_HDRI_CANVAS_CACHE: Partial<Record<SolarTimeMode, HTMLCanvasElement>> = {};
const CARACAS_HDRI_SHADER_TEXTURES: Partial<Record<SolarTimeMode, THREE.CanvasTexture>> = {};

function renderCaracasHdriCanvas(mode: SolarTimeMode): HTMLCanvasElement {
  const cached = CARACAS_HDRI_CANVAS_CACHE[mode];
  if (cached) return cached;

  const width = 2048;
  const height = 1024;
  const horizonY = Math.floor(height * 0.5); // y = 512
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. BÓVEDA CELESTE DE CARACAS (Dispersión Rayleigh/Mie a 920 msnm + Hemisferio Inferior Arquitectónico)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (mode === 'morning') {
      skyGrad.addColorStop(0.0, '#1B569E');   // Cenit azul profundo tropical de Caracas
      skyGrad.addColorStop(0.16, '#3B82CC');  // Azul cielo despejado sobre el valle
      skyGrad.addColorStop(0.32, '#7AB8EC');  // Azul celeste luminoso de Altamira
      skyGrad.addColorStop(0.44, '#C8E5FA');  // Bruma matutina del valle de Chacao
      skyGrad.addColorStop(0.495, '#F8F6F0'); // Resplandor de horizonte tropical
      skyGrad.addColorStop(0.505, '#D8D2C5'); // Rebote lumínico de travertino y concreto visto
      skyGrad.addColorStop(0.58, '#7A7468');  // Entorno urbano de Altamira
      skyGrad.addColorStop(0.74, '#3B4A36');  // Dosel arbóreo tropical y jardines
      skyGrad.addColorStop(1.0, '#201D19');   // Sombra basal de piedra laja
    } else if (mode === 'golden') {
      skyGrad.addColorStop(0.0, '#152244');   // Cenit índigo crepuscular
      skyGrad.addColorStop(0.18, '#3D3966');  // Violeta atmosférico de tarde caraqueña
      skyGrad.addColorStop(0.32, '#984B46');  // Terracota-malva sobre el valle
      skyGrad.addColorStop(0.43, '#E68438');  // Ámbar dorado intenso
      skyGrad.addColorStop(0.495, '#FFD67E'); // Horizonte incandescente de hora dorada
      skyGrad.addColorStop(0.505, '#B87B48'); // Rebote dorado sobre fachadas vecinas
      skyGrad.addColorStop(0.58, '#5C402C');  // Sombra cálida arquitectónica
      skyGrad.addColorStop(0.75, '#2A231D');  // Follaje en penumbra dorada
      skyGrad.addColorStop(1.0, '#120E0B');   // Base nocturna
    } else {
      skyGrad.addColorStop(0.0, '#040710');   // Cenit nocturno profundo
      skyGrad.addColorStop(0.22, '#0A1326');  // Azul medianoche sobre El Ávila
      skyGrad.addColorStop(0.40, '#13223B');  // Atmósfera nocturna del valle
      skyGrad.addColorStop(0.495, '#24334A'); // Resplandor urbano de Caracas en el horizonte
      skyGrad.addColorStop(0.51, '#1E1914');  // Rebote cálido de iluminación arquitectónica
      skyGrad.addColorStop(0.66, '#12100E');  // Entorno residencial nocturno
      skyGrad.addColorStop(1.0, '#060504');   // Suelo nocturno
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. RESPLANDOR SOLAR / LUNAR HDRI DE ALTO RANGO DINÁMICO (Disco Especular + Corona + Dispersión de Horizonte)
    const sunX = mode === 'morning' ? 1480 : mode === 'golden' ? 540 : 1024;
    const sunY = mode === 'morning' ? 265 : mode === 'golden' ? 430 : 210;
    const outerHaloRad = mode === 'morning' ? 460 : mode === 'golden' ? 560 : 280;

    const haloGrad = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, outerHaloRad);
    if (mode === 'morning') {
      haloGrad.addColorStop(0.0, 'rgba(255, 255, 252, 1.0)');
      haloGrad.addColorStop(0.08, 'rgba(255, 252, 240, 0.96)');
      haloGrad.addColorStop(0.22, 'rgba(255, 246, 222, 0.58)');
      haloGrad.addColorStop(0.52, 'rgba(220, 240, 255, 0.22)');
      haloGrad.addColorStop(1.0, 'rgba(220, 240, 255, 0.0)');
    } else if (mode === 'golden') {
      haloGrad.addColorStop(0.0, 'rgba(255, 250, 225, 1.0)');
      haloGrad.addColorStop(0.09, 'rgba(255, 220, 145, 0.94)');
      haloGrad.addColorStop(0.28, 'rgba(255, 150, 68, 0.56)');
      haloGrad.addColorStop(0.62, 'rgba(215, 92, 58, 0.22)');
      haloGrad.addColorStop(1.0, 'rgba(215, 92, 58, 0.0)');
    } else {
      haloGrad.addColorStop(0.0, 'rgba(235, 245, 255, 0.92)');
      haloGrad.addColorStop(0.12, 'rgba(175, 208, 255, 0.52)');
      haloGrad.addColorStop(0.45, 'rgba(95, 138, 205, 0.16)');
      haloGrad.addColorStop(1.0, 'rgba(95, 138, 205, 0.0)');
    }
    ctx.fillStyle = haloGrad;
    ctx.fillRect(0, 0, width, horizonY + 80);

    // 3. FORMACIONES NUBOSAS DEL VALLE DE CARACAS (Cirros de Altura + Cúmulos Tropicales con Borde Iluminado)
    // 3A. Cirros finos de gran altitud (y = 90..210) para riqueza especular en los cristales superiores
    for (let c = 0; c < 28; c++) {
      const cx = ((c * 173 + 95) % width);
      const cy = 88 + ((c * 47) % 125);
      const cw = 180 + ((c * 89) % 240);
      const ch = 10 + ((c * 13) % 18);
      const cirrusGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, cw * 0.5);
      if (mode === 'morning') {
        cirrusGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.36)');
        cirrusGrad.addColorStop(0.6, 'rgba(235, 247, 255, 0.14)');
        cirrusGrad.addColorStop(1.0, 'rgba(235, 247, 255, 0.0)');
      } else if (mode === 'golden') {
        cirrusGrad.addColorStop(0.0, 'rgba(255, 218, 158, 0.42)');
        cirrusGrad.addColorStop(0.6, 'rgba(242, 142, 98, 0.16)');
        cirrusGrad.addColorStop(1.0, 'rgba(242, 142, 98, 0.0)');
      } else {
        cirrusGrad.addColorStop(0.0, 'rgba(148, 182, 232, 0.16)');
        cirrusGrad.addColorStop(1.0, 'rgba(148, 182, 232, 0.0)');
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1.0, ch / (cw * 0.5));
      ctx.fillStyle = cirrusGrad;
      ctx.beginPath();
      ctx.arc(0, 0, cw * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3B. Bancos de cúmulos tropicales caraqueños (y = 220..445) con volumen y contraluz solar
    const cloudClusters = [
      { x: 210, y: 315, w: 310, h: 68 },
      { x: 520, y: 280, w: 360, h: 78 },
      { x: 860, y: 330, w: 290, h: 62 },
      { x: 1190, y: 295, w: 380, h: 82 },
      { x: 1540, y: 270, w: 340, h: 74 },
      { x: 1860, y: 320, w: 300, h: 65 },
    ];
    cloudClusters.forEach((cl, idx) => {
      for (let p = -3; p <= 3; p++) {
        const px = (cl.x + p * (cl.w * 0.18) + width) % width;
        const py = cl.y - Math.abs(p) * 6 + ((idx + p) % 2) * 8;
        const radX = cl.w * (0.28 - Math.abs(p) * 0.03);
        const radY = cl.h * (0.68 - Math.abs(p) * 0.06);

        // Borde superior iluminado por el sol (Silver/Gold Lining)
        const topRimGrad = ctx.createRadialGradient(px, py - radY * 0.35, 2, px, py, radX);
        if (mode === 'morning') {
          topRimGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.82)');
          topRimGrad.addColorStop(0.55, 'rgba(242, 249, 255, 0.45)');
          topRimGrad.addColorStop(0.85, 'rgba(168, 198, 226, 0.18)');
          topRimGrad.addColorStop(1.0, 'rgba(168, 198, 226, 0.0)');
        } else if (mode === 'golden') {
          topRimGrad.addColorStop(0.0, 'rgba(255, 232, 176, 0.85)');
          topRimGrad.addColorStop(0.50, 'rgba(248, 162, 98, 0.48)');
          topRimGrad.addColorStop(0.82, 'rgba(122, 64, 78, 0.24)');
          topRimGrad.addColorStop(1.0, 'rgba(122, 64, 78, 0.0)');
        } else {
          topRimGrad.addColorStop(0.0, 'rgba(110, 145, 195, 0.28)');
          topRimGrad.addColorStop(0.65, 'rgba(42, 62, 96, 0.18)');
          topRimGrad.addColorStop(1.0, 'rgba(42, 62, 96, 0.0)');
        }

        ctx.save();
        ctx.translate(px, py);
        ctx.scale(1.0, radY / radX);
        ctx.fillStyle = topRimGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radX, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // 4. CORDILLERA DEL PARQUE NACIONAL EL ÁVILA (WARAIRA REPANO) EN EL HORIZONTE NORTE
    // 4A. Silueta principal de alta montaña (Pico Naiguatá 2.765m, Pico Oriental, Silla de Caracas, El Ávila)
    ctx.beginPath();
    ctx.moveTo(0, horizonY + 18);
    for (let x = 0; x <= width; x += 6) {
      const nx = (x / width) * Math.PI * 2;
      // Perfil orográfico realista de El Ávila visto desde Altamira
      const mainEnvelope = Math.max(0, Math.sin(nx - 0.35) * 0.85 + 0.35);
      const ridgeHeight =
        mainEnvelope *
        (78 * Math.sin(nx * 1.5 + 0.5) +
          42 * Math.cos(nx * 3.0 - 0.35) +
          22 * Math.sin(nx * 6.5 + 1.1) +
          9 * Math.cos(nx * 14.0 - 0.8) +
          72);
      const y = horizonY - Math.max(12, ridgeHeight);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, horizonY + 18);
    ctx.closePath();

    const avilaFarGrad = ctx.createLinearGradient(0, horizonY - 190, 0, horizonY + 18);
    if (mode === 'morning') {
      avilaFarGrad.addColorStop(0.0, 'rgba(48, 86, 108, 0.82)');
      avilaFarGrad.addColorStop(0.55, 'rgba(66, 104, 112, 0.76)');
      avilaFarGrad.addColorStop(1.0, 'rgba(168, 196, 212, 0.62)');
    } else if (mode === 'golden') {
      avilaFarGrad.addColorStop(0.0, 'rgba(54, 34, 52, 0.88)');
      avilaFarGrad.addColorStop(0.60, 'rgba(84, 48, 56, 0.82)');
      avilaFarGrad.addColorStop(1.0, 'rgba(178, 108, 76, 0.68)');
    } else {
      avilaFarGrad.addColorStop(0.0, 'rgba(8, 14, 26, 0.94)');
      avilaFarGrad.addColorStop(1.0, 'rgba(18, 28, 44, 0.88)');
    }
    ctx.fillStyle = avilaFarGrad;
    ctx.fill();

    // 4B. Estribaciones bajas y quebradas boscosas de El Ávila (Sabas Nieves, Sebucán, Los Chorros)
    ctx.beginPath();
    ctx.moveTo(0, horizonY + 22);
    for (let x = 0; x <= width; x += 6) {
      const nx = (x / width) * Math.PI * 2;
      const foothillHeight =
        36 * Math.sin(nx * 2.2 + 1.2) +
        20 * Math.cos(nx * 5.0 - 0.6) +
        11 * Math.sin(nx * 11.0 + 0.4) +
        38;
      const y = horizonY - Math.max(6, foothillHeight * 0.75);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, horizonY + 22);
    ctx.closePath();
    ctx.fillStyle =
      mode === 'morning'
        ? 'rgba(44, 76, 58, 0.78)'
        : mode === 'golden'
        ? 'rgba(52, 36, 32, 0.84)'
        : 'rgba(10, 16, 22, 0.92)';
    ctx.fill();

    // 5. ENTORNO ARQUITECTÓNICO CIRCUNDANTE DE ALTAMIRA / CHACAO (Horizonte Urbano para Refracción y Reflejo Realista)
    // Siluetas de edificios residenciales de lujo, pórticos de travertino/concreto y muros cortina vecinos
    const numBuildings = 54;
    for (let b = 0; b < numBuildings; b++) {
      const bx = (b / numBuildings) * width;
      const bw = 22 + ((b * 37) % 44);
      const bh = 18 + ((b * 53) % 68);
      const by = horizonY + 14 - bh;

      // Alternancia de tonos arquitectónicos de Altamira (travertino marfil, concreto visto, cristal bronce/azul)
      const isLightTower = b % 3 !== 0;
      if (mode === 'morning') {
        ctx.fillStyle = isLightTower
          ? `rgba(${212 - (b % 18)}, ${206 - (b % 16)}, ${195 - (b % 14)}, 0.88)`
          : `rgba(${118 + (b % 24)}, ${136 + (b % 20)}, ${152 + (b % 18)}, 0.85)`;
      } else if (mode === 'golden') {
        ctx.fillStyle = isLightTower
          ? `rgba(${198 - (b % 20)}, ${146 - (b % 16)}, ${108 - (b % 14)}, 0.90)`
          : `rgba(${86 + (b % 18)}, ${68 + (b % 14)}, ${74 + (b % 16)}, 0.88)`;
      } else {
        ctx.fillStyle = isLightTower
          ? 'rgba(26, 32, 44, 0.94)'
          : 'rgba(16, 22, 32, 0.95)';
      }
      ctx.fillRect(bx, by, bw - 3, bh);

      // Losas horizontales de entrepiso y ventanales en edificios vecinos para aportar detalle geométrico al refractar
      const floors = Math.max(3, Math.floor(bh / 8));
      for (let f = 1; f < floors; f++) {
        const fy = by + f * 8;
        ctx.fillStyle =
          mode === 'morning'
            ? 'rgba(245, 242, 234, 0.55)'
            : mode === 'golden'
            ? 'rgba(255, 198, 128, 0.48)'
            : 'rgba(255, 196, 110, 0.58)';
        ctx.fillRect(bx + 2, fy, bw - 7, 2);
      }
    }

    // 6. DOSEL ARBÓREO TROPICAL DE ALTAMIRA (Araguaneyes, Apamates, Chaguaramos y Caobos en el cinturón del horizonte)
    for (let t = 0; t < 96; t++) {
      const tx = (t / 96) * width;
      const tr = 14 + ((t * 29) % 24);
      const ty = horizonY + 12 - tr * 0.35;
      ctx.fillStyle =
        mode === 'morning'
          ? t % 5 === 0
            ? 'rgba(92, 138, 68, 0.86)'
            : 'rgba(46, 86, 44, 0.88)'
          : mode === 'golden'
          ? 'rgba(58, 48, 32, 0.88)'
          : 'rgba(12, 18, 16, 0.94)';
      ctx.beginPath();
      ctx.arc(tx, ty, tr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. BRUMA ATMOSFÉRICA DEL VALLE Y REFLEJOS DE PISCINA / PLAZA EN EL HEMISFERIO INFERIOR
    const mistGrad = ctx.createLinearGradient(0, horizonY - 26, 0, horizonY + 36);
    if (mode === 'morning') {
      mistGrad.addColorStop(0.0, 'rgba(248, 250, 252, 0.0)');
      mistGrad.addColorStop(0.5, 'rgba(248, 250, 252, 0.32)');
      mistGrad.addColorStop(1.0, 'rgba(248, 250, 252, 0.0)');
    } else if (mode === 'golden') {
      mistGrad.addColorStop(0.0, 'rgba(255, 196, 118, 0.0)');
      mistGrad.addColorStop(0.5, 'rgba(255, 196, 118, 0.36)');
      mistGrad.addColorStop(1.0, 'rgba(255, 196, 118, 0.0)');
    } else {
      mistGrad.addColorStop(0.0, 'rgba(255, 184, 96, 0.0)');
      mistGrad.addColorStop(0.5, 'rgba(255, 184, 96, 0.18)');
      mistGrad.addColorStop(1.0, 'rgba(255, 184, 96, 0.0)');
    }
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, horizonY - 26, width, 62);
  }

  CARACAS_HDRI_CANVAS_CACHE[mode] = canvas;
  return canvas;
}

function getCaracasShaderEnvironmentTexture(mode: SolarTimeMode): THREE.CanvasTexture {
  // Se reutiliza el HTMLCanvasElement en caché pero se instancia un nuevo THREE.CanvasTexture
  // para que el .dispose() al cerrar el modal nunca invalide las texturas en reaperturas.
  const canvas = renderCaracasHdriCanvas(mode);
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Shader GLSL de Cristal Arquitectónico con Mapa de Entorno HDRI de Caracas,
 * Refracción Física con Dispersión Cromática IGU y Reflexión Schlick Fresnel Multi-Capa.
 * Se inyecta mediante `onBeforeCompile` en todos los materiales de vidrio del modelo 3D para lograr
 * reflejos nítidos de los cielos de Caracas / El Ávila y una refracción realista del entorno arquitectónico.
 */
interface ReflectiveGlassShaderUniforms {
  uCaracasEnvMap: { value: THREE.Texture };
  uCaracasEnvMorning: { value: THREE.Texture };
  uCaracasEnvGolden: { value: THREE.Texture };
  uCaracasEnvNight: { value: THREE.Texture };
  uGoldenHourMix: { value: number };
  uNightMix: { value: number };
  uFresnelColor: { value: THREE.Color };
  uSkyReflectionColor: { value: THREE.Color };
  uHorizonGlowColor: { value: THREE.Color };
  uSunDirection: { value: THREE.Vector3 };
  uFresnelPower: { value: number };
  uFresnelBias: { value: number };
  uFresnelScale: { value: number };
  uSpecularStrength: { value: number };
  uReflectionRibbonStrength: { value: number };
  uInteriorWarmth: { value: number };
  uIridescenceStrength: { value: number };
  uRefractionStrength: { value: number };
  uGlassThickness: { value: number };
}

function applyReflectiveClearGlassShader(
  material: THREE.MeshPhysicalMaterial,
  variant: 'window' | 'balconyDoor' | 'balustrade'
): void {
  const morningEnvMap = getCaracasShaderEnvironmentTexture('morning');
  const goldenEnvMap = getCaracasShaderEnvironmentTexture('golden');
  const nightEnvMap = getCaracasShaderEnvironmentTexture('night');

  const uniforms: ReflectiveGlassShaderUniforms = {
    uCaracasEnvMap: {
      value: morningEnvMap,
    },
    uCaracasEnvMorning: {
      value: morningEnvMap,
    },
    uCaracasEnvGolden: {
      value: goldenEnvMap,
    },
    uCaracasEnvNight: {
      value: nightEnvMap,
    },
    uGoldenHourMix: {
      value: 0.0,
    },
    uNightMix: {
      value: 0.0,
    },
    uFresnelColor: {
      value: new THREE.Color(
        variant === 'window' ? 0xE6F8FF : variant === 'balconyDoor' ? 0xDCF4FF : 0xEBFAFF
      ),
    },
    uSkyReflectionColor: {
      value: new THREE.Color(
        variant === 'window' ? 0x8CD0F8 : variant === 'balconyDoor' ? 0x7EC4F0 : 0x9AD8FA
      ),
    },
    uHorizonGlowColor: {
      value: new THREE.Color(0xF4FAFF),
    },
    uSunDirection: {
      value: new THREE.Vector3(34, 48, 38).normalize(),
    },
    uFresnelPower: {
      value: variant === 'balustrade' ? 2.35 : 2.55,
    },
    uFresnelBias: {
      value: variant === 'window' ? 0.16 : variant === 'balconyDoor' ? 0.18 : 0.12,
    },
    uFresnelScale: {
      value: variant === 'window' ? 0.88 : variant === 'balconyDoor' ? 0.92 : 0.80,
    },
    uSpecularStrength: {
      value: variant === 'window' ? 1.22 : variant === 'balconyDoor' ? 1.26 : 0.92,
    },
    uReflectionRibbonStrength: {
      value: variant === 'window' ? 0.72 : variant === 'balconyDoor' ? 0.76 : 0.48,
    },
    uInteriorWarmth: {
      value: variant === 'balustrade' ? 0.0 : 0.34,
    },
    uIridescenceStrength: {
      value: variant === 'window' ? 0.42 : variant === 'balconyDoor' ? 0.48 : 0.28,
    },
    uRefractionStrength: {
      value: variant === 'balustrade' ? 0.56 : variant === 'balconyDoor' ? 0.46 : 0.44,
    },
    uGlassThickness: {
      value: variant === 'balustrade' ? 0.028 : 0.042,
    },
  };

  material.userData.reflectiveGlassUniforms = uniforms;
  material.customProgramCacheKey = () => `caracas-hdri-refractive-igu-glass-v5-${variant}`;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCaracasEnvMap = uniforms.uCaracasEnvMap;
    shader.uniforms.uCaracasEnvMorning = uniforms.uCaracasEnvMorning;
    shader.uniforms.uCaracasEnvGolden = uniforms.uCaracasEnvGolden;
    shader.uniforms.uCaracasEnvNight = uniforms.uCaracasEnvNight;
    shader.uniforms.uGoldenHourMix = uniforms.uGoldenHourMix;
    shader.uniforms.uNightMix = uniforms.uNightMix;
    shader.uniforms.uFresnelColor = uniforms.uFresnelColor;
    shader.uniforms.uSkyReflectionColor = uniforms.uSkyReflectionColor;
    shader.uniforms.uHorizonGlowColor = uniforms.uHorizonGlowColor;
    shader.uniforms.uSunDirection = uniforms.uSunDirection;
    shader.uniforms.uFresnelPower = uniforms.uFresnelPower;
    shader.uniforms.uFresnelBias = uniforms.uFresnelBias;
    shader.uniforms.uFresnelScale = uniforms.uFresnelScale;
    shader.uniforms.uSpecularStrength = uniforms.uSpecularStrength;
    shader.uniforms.uReflectionRibbonStrength = uniforms.uReflectionRibbonStrength;
    shader.uniforms.uInteriorWarmth = uniforms.uInteriorWarmth;
    shader.uniforms.uIridescenceStrength = uniforms.uIridescenceStrength;
    shader.uniforms.uRefractionStrength = uniforms.uRefractionStrength;
    shader.uniforms.uGlassThickness = uniforms.uGlassThickness;

    shader.vertexShader =
      `
      varying vec3 vGlassWorldPos;
      varying vec3 vGlassWorldNormal;
      varying vec2 vGlassUv;
      ` +
      shader.vertexShader.replace(
        '#include <project_vertex>',
        `
        #include <project_vertex>
        vec4 glassWorldPos4 = modelMatrix * vec4( transformed, 1.0 );
        vGlassWorldPos = glassWorldPos4.xyz;
        vGlassWorldNormal = normalize( mat3( modelMatrix ) * objectNormal );
        vGlassUv = uv;
        `
      );

    shader.fragmentShader =
      `
      uniform sampler2D uCaracasEnvMap;
      uniform sampler2D uCaracasEnvMorning;
      uniform sampler2D uCaracasEnvGolden;
      uniform sampler2D uCaracasEnvNight;
      uniform float uGoldenHourMix;
      uniform float uNightMix;
      uniform vec3 uFresnelColor;
      uniform vec3 uSkyReflectionColor;
      uniform vec3 uHorizonGlowColor;
      uniform vec3 uSunDirection;
      uniform float uFresnelPower;
      uniform float uFresnelBias;
      uniform float uFresnelScale;
      uniform float uSpecularStrength;
      uniform float uReflectionRibbonStrength;
      uniform float uInteriorWarmth;
      uniform float uIridescenceStrength;
      uniform float uRefractionStrength;
      uniform float uGlassThickness;
      varying vec3 vGlassWorldPos;
      varying vec3 vGlassWorldNormal;
      varying vec2 vGlassUv;

      vec2 dirToCaracasEquirectUv( vec3 dir ) {
        vec3 d = normalize( dir );
        float u = atan( d.z, d.x ) * 0.15915494 + 0.5;
        float v = asin( clamp( d.y, -1.0, 1.0 ) ) * 0.31830988 + 0.5;
        return vec2( u, v );
      }

      vec3 sampleCaracasDynamicHdri( vec2 uv ) {
        vec3 col = texture2D( uCaracasEnvMorning, uv ).rgb;
        if ( uGoldenHourMix > 0.005 ) {
          vec3 colGolden = texture2D( uCaracasEnvGolden, uv ).rgb;
          col = mix( col, colGolden, clamp( uGoldenHourMix, 0.0, 1.0 ) );
        }
        if ( uNightMix > 0.005 ) {
          vec3 colNight = texture2D( uCaracasEnvNight, uv ).rgb;
          col = mix( col, colNight, clamp( uNightMix, 0.0, 1.0 ) );
        }
        return col;
      }
      ` +
      shader.fragmentShader.replace(
        '#include <tonemapping_fragment>',
        `
        vec3 baseGlassN = normalize( vGlassWorldNormal );
        if ( !gl_FrontFacing ) {
          baseGlassN = -baseGlassN;
        }

        // 1. Micro-ondulación óptica de vidrio flotado templado (Float-Glass Micro-Distortion)
        float waveX = sin( vGlassWorldPos.x * 2.25 + vGlassWorldPos.z * 1.90 + vGlassUv.x * 6.2831 ) * cos( vGlassWorldPos.y * 2.80 );
        float waveY = cos( vGlassWorldPos.y * 3.10 - vGlassWorldPos.x * 1.65 + vGlassUv.y * 6.2831 ) * sin( vGlassWorldPos.z * 2.15 );
        vec3 glassN = normalize( baseGlassN + vec3( waveX, waveY, -waveX * 0.5 ) * 0.015 );

        vec3 glassV = normalize( cameraPosition - vGlassWorldPos );
        float glassNdotV = clamp( abs( dot( glassN, glassV ) ), 0.001, 1.0 );

        // 2. Reflexión física Schlick Fresnel + Interferencia Dicroica Low-E de Capa Fina
        float fresnelTerm = clamp(
          uFresnelBias + uFresnelScale * pow( 1.0 - glassNdotV, uFresnelPower ),
          0.0,
          1.0
        );
        float thinFilmPhase = ( 1.0 - glassNdotV ) * 7.5 + ( waveX * 0.45 );
        vec3 lowESpectralTint = mix(
          vec3(
            0.82 + 0.18 * cos( thinFilmPhase + 0.2 ),
            0.95 + 0.05 * cos( thinFilmPhase + 2.05 ),
            0.98 + 0.02 * cos( thinFilmPhase + 4.10 )
          ),
          vec3(
            1.02 + 0.14 * cos( thinFilmPhase + 0.1 ),
            0.86 + 0.10 * cos( thinFilmPhase + 1.6 ),
            0.72 + 0.08 * cos( thinFilmPhase + 3.4 )
          ),
          uGoldenHourMix * 0.72
        );

        // 3. MUESTREO DINÁMICO DEL MAPA DE ENTORNO HDRI DE CARACAS (Optimizado para GPU)
        vec3 reflectDirOuter = reflect( -glassV, glassN );
        vec3 innerPaneNormal = normalize( glassN + vec3( -waveY, waveX, waveX ) * 0.020 );

        // 3A. Refracción física Snell (IOR = 1.52) con dispersión cromática analítica
        vec3 refractRayG = refract( -glassV, glassN, 1.0 / 1.522 );
        vec3 reflectDirInner = reflect( refractRayG, innerPaneNormal );

        float edgePrismFactor = smoothstep( 0.14, 0.0, min( min( vGlassUv.x, 1.0 - vGlassUv.x ), min( vGlassUv.y, 1.0 - vGlassUv.y ) ) );
        vec3 thicknessOffset = innerPaneNormal * ( uGlassThickness * ( 1.0 - glassNdotV + edgePrismFactor * 0.85 ) );

        vec2 refractUvG = dirToCaracasEquirectUv( refractRayG + thicknessOffset );
        vec3 baseRefractSample = sampleCaracasDynamicHdri( refractUvG );
        vec3 hdriRefractedEnv = baseRefractSample * vec3( 1.0 + edgePrismFactor * 0.04, 1.0, 1.0 + edgePrismFactor * 0.06 );

        // 3B. Reflejo HDRI de Alta Resolución de los Cielos de Caracas, El Ávila y Altamira
        vec2 reflectUvOuter = dirToCaracasEquirectUv( reflectDirOuter );
        vec2 reflectUvInner = dirToCaracasEquirectUv( reflectDirInner );
        vec3 hdriOuterReflection = sampleCaracasDynamicHdri( reflectUvOuter );
        vec3 hdriInnerReflection = sampleCaracasDynamicHdri( reflectUvInner );
        vec3 hdriCombinedReflection = mix( hdriOuterReflection, hdriInnerReflection, 0.26 );

        // 3C. Enriquecimiento analítico de la silueta de El Ávila y resplandor de Hora Dorada en el horizonte occidental
        float skyElev = clamp( reflectDirOuter.y * 0.5 + 0.5, 0.0, 1.0 );
        float azimuth = atan( reflectDirOuter.z, reflectDirOuter.x );
        float avilaRidge = 0.045
          + 0.055 * sin( azimuth * 2.0 + 0.8 )
          + 0.032 * cos( azimuth * 5.0 - 0.4 )
          + 0.016 * sin( azimuth * 11.0 + 1.2 );
        float mountainMask = smoothstep( avilaRidge + 0.035, avilaRidge - 0.015, reflectDirOuter.y )
          * smoothstep( -0.14, -0.01, reflectDirOuter.y );

        float horizonGlowBand = exp( -pow( ( reflectDirOuter.y - avilaRidge ) * 4.2, 2.0 ) );
        vec3 skyDomeColor = mix(
          uHorizonGlowColor,
          uSkyReflectionColor,
          smoothstep( 0.10, 0.86, skyElev )
        ) + uFresnelColor * horizonGlowBand * ( 0.44 + uGoldenHourMix * 0.28 );
        vec3 avilaSilhouetteColor = mix( uSkyReflectionColor * 0.34, uHorizonGlowColor * 0.46, 0.35 + uGoldenHourMix * 0.22 );
        vec3 analyticSkyReflection = mix( skyDomeColor, avilaSilhouetteColor, mountainMask * 0.52 );

        // Fusión del mapa HDRI 2K de Caracas con la bóveda analítica y realce cálido de atardecer
        vec3 sunsetCopperBoost = vec3( 1.0, 0.58, 0.24 ) * horizonGlowBand * uGoldenHourMix * 0.36;
        vec3 envSkyReflection = mix( analyticSkyReflection, hdriCombinedReflection * 1.22, 0.72 ) + sunsetCopperBoost;

        // 4. Paralaje Interior 3D + Refracción del Entorno Arquitectónico Circundante
        vec3 worldUp = vec3( 0.0, 1.0, 0.0 );
        vec3 glassTangent = normalize( cross( worldUp, baseGlassN ) + vec3( 0.0001, 0.0, 0.0001 ) );
        vec3 glassBitangent = normalize( cross( baseGlassN, glassTangent ) );
        vec2 localViewOffset = vec2( dot( glassV, glassTangent ), dot( glassV, glassBitangent ) ) / ( glassNdotV + 0.38 );

        vec2 roomUvDeep = vGlassUv - localViewOffset * 0.22;
        vec2 roomUvMid = vGlassUv - localViewOffset * 0.11;

        float ceilingDepthGlow = smoothstep( 0.46, 0.88, roomUvDeep.y )
          * smoothstep( 0.99, 0.78, roomUvDeep.y )
          * smoothstep( 0.04, 0.22, roomUvDeep.x )
          * smoothstep( 0.96, 0.78, roomUvDeep.x );
        float draperyFoldPattern = 0.5 + 0.5 * sin( roomUvMid.x * 42.0 + sin( roomUvMid.y * 4.0 ) * 0.5 );
        float draperySideMask = smoothstep( 0.36, 0.08, min( roomUvMid.x, 1.0 - roomUvMid.x ) )
          * smoothstep( 0.04, 0.94, roomUvMid.y );
        vec3 interiorParallaxLight = (
          vec3( 1.0, 0.82, 0.56 ) * ceilingDepthGlow * 0.58 +
          vec3( 0.96, 0.88, 0.74 ) * draperyFoldPattern * draperySideMask * 0.26
        ) * uInteriorWarmth * ( 1.0 - fresnelTerm * 0.68 );

        // Volumen refractado: combina el entorno arquitectónico de Altamira refractado por ley de Snell con la profundidad interior
        vec3 transmittedArchEnv = mix(
          gl_FragColor.rgb,
          hdriRefractedEnv * lowESpectralTint,
          uRefractionStrength * ( 0.62 + 0.38 * edgePrismFactor )
        ) + interiorParallaxLight;

        // 5. Destellos especulares dobles (Hoja exterior + Fantasma de segunda hoja IGU) sensibles al ángulo solar de atardecer
        vec3 sunDir = normalize( uSunDirection );
        vec3 halfSunOuter = normalize( sunDir + glassV );
        vec3 halfSunInner = normalize( sunDir - reflectDirInner );
        float specSunBroad = pow( max( dot( glassN, halfSunOuter ), 0.0 ), 38.0 );
        float specSunSharp = pow( max( dot( glassN, halfSunOuter ), 0.0 ), 220.0 );
        float specSunGhost = pow( max( dot( innerPaneNormal, halfSunInner ), 0.0 ), 130.0 ) * 0.52;

        vec3 skyCounterDir = normalize( vec3( -sunDir.x * 0.78, max( sunDir.y * 0.85, 0.58 ), -sunDir.z * 0.78 ) );
        vec3 halfSky = normalize( skyCounterDir + glassV );
        float specSkyBroad = pow( max( dot( glassN, halfSky ), 0.0 ), 36.0 );
        float specSkySharp = pow( max( dot( glassN, halfSky ), 0.0 ), 160.0 );

        // 6. Bandas diagonales de brillo especular arquitectónico con paralaje doble IGU y bisel perimetral
        float diagParallaxOuter = ( vGlassUv.x * 0.76 + vGlassUv.y * 0.65 ) + ( reflectDirOuter.x * 0.16 + reflectDirOuter.z * 0.13 );
        float diagParallaxInner = diagParallaxOuter + ( localViewOffset.x * 0.045 - localViewOffset.y * 0.035 );
        float ribbonA = smoothstep( 0.14, 0.0, abs( fract( diagParallaxOuter * 1.30 + 0.16 ) - 0.5 ) );
        float ribbonB = smoothstep( 0.06, 0.0, abs( fract( diagParallaxOuter * 2.35 + 0.44 ) - 0.5 ) );
        float ribbonGhost = smoothstep( 0.075, 0.0, abs( fract( diagParallaxInner * 2.35 + 0.47 ) - 0.5 ) ) * 0.42;
        float iguBevel = edgePrismFactor;
        float ribbonHighlight = ( ribbonA * 0.44 + ribbonB * 0.74 + ribbonGhost ) * uReflectionRibbonStrength;

        vec3 dichroicEdgeColor = mix( uFresnelColor, uFresnelColor * lowESpectralTint, uIridescenceStrength );
        vec3 sunSpecularTint = mix( vec3( 1.0, 0.99, 0.97 ), vec3( 1.0, 0.86, 0.62 ), uGoldenHourMix * 0.85 );

        vec3 specularHighlights = (
          dichroicEdgeColor * ( specSunBroad * 0.50 + specSkyBroad * 0.34 ) +
          sunSpecularTint * ( specSunSharp * 1.58 + specSkySharp * 0.90 ) +
          lowESpectralTint * specSunGhost +
          mix( uSkyReflectionColor, lowESpectralTint, 0.58 ) * ribbonHighlight +
          dichroicEdgeColor * iguBevel * 0.38
        ) * uSpecularStrength;

        gl_FragColor.rgb = mix( transmittedArchEnv, envSkyReflection * lowESpectralTint, fresnelTerm * 0.68 )
          + dichroicEdgeColor * fresnelTerm * 0.34
          + specularHighlights;

        gl_FragColor.a = clamp(
          gl_FragColor.a + fresnelTerm * 0.26 + ( specSunSharp + specSunGhost + specSkySharp * 0.65 + ribbonHighlight * 0.42 ) * 0.22,
          0.28,
          0.96
        );

        #include <tonemapping_fragment>
        `
      );
  };
  material.needsUpdate = true;
}

/**
 * Mapa de Entorno Equirectangular HDRI de Alta Resolución (2048x1024) con Cielos de Caracas
 * Incluye formaciones nubosas del valle de Caracas, topografía del Parque Nacional El Ávila (Waraira Repano)
 * y el entorno arquitectónico circundante de Altamira para reflejos y refracción realistas en los cristales.
 */
export function createArchitecturalEnvironmentMap(mode: SolarTimeMode): THREE.CanvasTexture {
  const canvas = renderCaracasHdriCanvas(mode);
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Inicializa el catálogo completo de materiales PBR para la maqueta 3D
 */
export function createArchitecturalMaterials(maxAnisotropy: number = 16): SceneMaterials {
  const concreteTex = createFairFacedConcreteTexture(maxAnisotropy);
  const parkingConcreteTex = createParkingBoardFormedConcreteTexture(maxAnisotropy);
  const poolMosaicTex = createPoolMosaicTileTexture(maxAnisotropy);
  const waterRippleBump = createWaterRippleBumpTexture(maxAnisotropy);
  const groovedTex = createHorizontalGroovedCladdingTexture(maxAnisotropy);
  const lightFlutedTex = createVerticalFlutedTexture('#EAE6DF', '#B8B2A6', '#FAF8F4', maxAnisotropy);
  const darkFlutedTex = createVerticalFlutedTexture('#5A5D60', '#383A3D', '#787C80', maxAnisotropy);
  const slateTex = createDarkStackedSlateTexture(maxAnisotropy);
  const woodTex = createWoodSoffitTexture(maxAnisotropy);
  const terracottaTex = createTerracottaLouverTexture(maxAnisotropy);
  const clearWindowGlassTex = createGlassSpecularReflectionTexture(false, maxAnisotropy);
  const balconySlidingGlassTex = createGlassSpecularReflectionTexture(true, maxAnisotropy);
  const windowInteriorTex = createWindowInteriorDepthTexture(maxAnisotropy);

  const boardFormedConcrete = new THREE.MeshStandardMaterial({
    color: 0xD5D1C8,
    map: concreteTex,
    bumpMap: concreteTex,
    bumpScale: 0.022,
    roughness: 0.62,
    metalness: 0.04,
  });

  // Material especializado de Concreto Visto Encofrado en Tablas para las paredes ciegas del estacionamiento
  const parkingBoardConcrete = new THREE.MeshStandardMaterial({
    color: 0xC8C3B8,
    map: parkingConcreteTex.map,
    bumpMap: parkingConcreteTex.bumpMap,
    bumpScale: 0.042,
    roughness: 0.66,
    metalness: 0.05,
  });

  // Material especializado de Revestimiento de Piedra Laja / Basalto para el zócalo y contrafuertes del estacionamiento
  const parkingSplitStone = new THREE.MeshStandardMaterial({
    color: 0x3D3A36,
    map: slateTex.map,
    bumpMap: slateTex.bumpMap,
    bumpScale: 0.065,
    roughness: 0.80,
    metalness: 0.06,
  });

  const travertine = new THREE.MeshStandardMaterial({
    color: 0xE2DFD7,
    map: concreteTex,
    bumpMap: concreteTex,
    bumpScale: 0.014,
    roughness: 0.55,
    metalness: 0.04,
  });

  const concreteSlab = new THREE.MeshStandardMaterial({
    color: 0xCCC8C0,
    map: concreteTex,
    bumpMap: concreteTex,
    bumpScale: 0.016,
    roughness: 0.64,
    metalness: 0.05,
  });

  const whiteGroovedCladding = new THREE.MeshStandardMaterial({
    color: 0xF3F0E8,
    map: groovedTex.map,
    bumpMap: groovedTex.bumpMap,
    bumpScale: 0.028,
    roughness: 0.45,
    metalness: 0.02,
  });

  const flutedConcreteMat = new THREE.MeshStandardMaterial({
    color: 0xECE8E0,
    map: lightFlutedTex.map,
    bumpMap: lightFlutedTex.bumpMap,
    bumpScale: 0.032,
    roughness: 0.52,
    metalness: 0.03,
  });

  const darkFlutedMetalMat = new THREE.MeshStandardMaterial({
    color: 0x626568,
    map: darkFlutedTex.map,
    bumpMap: darkFlutedTex.bumpMap,
    bumpScale: 0.03,
    roughness: 0.42,
    metalness: 0.45,
  });

  const darkSlateStone = new THREE.MeshStandardMaterial({
    color: 0x353330,
    map: slateTex.map,
    bumpMap: slateTex.bumpMap,
    bumpScale: 0.052,
    roughness: 0.82,
    metalness: 0.05,
  });

  const alabaster = new THREE.MeshStandardMaterial({
    color: 0xFAF8F4,
    roughness: 0.42,
    metalness: 0.02,
  });

  const woodSoffit = new THREE.MeshStandardMaterial({
    color: 0x945D34,
    map: woodTex.map,
    bumpMap: woodTex.bumpMap,
    bumpScale: 0.024,
    roughness: 0.44,
    metalness: 0.06,
  });

  const cortenLouver = new THREE.MeshStandardMaterial({
    color: 0xAC5030,
    map: terracottaTex,
    roughness: 0.46,
    metalness: 0.15,
  });

  const bronzeMetal = new THREE.MeshStandardMaterial({
    color: 0x232220,
    roughness: 0.30,
    metalness: 0.78,
  });

  // Perfilería minimalista ultrafina en aluminio anodizado grafito-negro para puertas corredizas de balcón
  const slimDoorFrameMetal = new THREE.MeshStandardMaterial({
    color: 0x121211,
    roughness: 0.18,
    metalness: 0.90,
  });

  const stainlessSteel = new THREE.MeshStandardMaterial({
    color: 0xE8ECEF,
    roughness: 0.16,
    metalness: 0.92,
  });

  // Cristal Reflectivo Claro Low-E con Doble Acristalamiento IGU, Refracción Física de Caracas/Altamira y Reflejos HDRI 2K
  const architecturalGlass = new THREE.MeshPhysicalMaterial({
    color: 0xE8F6FF,
    map: clearWindowGlassTex,
    transparent: true,
    opacity: 0.78,
    roughness: 0.012,
    metalness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.008,
    ior: 1.52,
    thickness: 0.45,
    attenuationDistance: 4.5,
    attenuationColor: new THREE.Color(0xD8F0FF),
    reflectivity: 1.0,
    iridescence: 0.42,
    iridescenceIOR: 1.38,
    iridescenceThicknessRange: [180, 410],
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xFFFFFF),
    envMapIntensity: 2.65,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  applyReflectiveClearGlassShader(architecturalGlass, 'window');

  // Cristal Reflectivo Claro Low-E de Lujo para los ventanales y puertas corredizas de balcones (con refracción HDRI de Caracas y doble reflexión IGU)
  const balconyDoorGlass = new THREE.MeshPhysicalMaterial({
    color: 0xDCF0FC,
    map: balconySlidingGlassTex,
    transparent: true,
    opacity: 0.80,
    roughness: 0.014,
    metalness: 0.20,
    clearcoat: 1.0,
    clearcoatRoughness: 0.010,
    ior: 1.53,
    thickness: 0.52,
    attenuationDistance: 4.2,
    attenuationColor: new THREE.Color(0xCCE8FA),
    reflectivity: 1.0,
    iridescence: 0.46,
    iridescenceIOR: 1.38,
    iridescenceThicknessRange: [190, 420],
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xFFFFFF),
    envMapIntensity: 2.60,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  applyReflectiveClearGlassShader(balconyDoorGlass, 'balconyDoor');

  // Cámara óptica interior sombreada tras las ventanas para resaltar el reflejo del cristal
  const windowInteriorBacking = new THREE.MeshStandardMaterial({
    color: 0x24384C,
    map: windowInteriorTex,
    roughness: 0.50,
    metalness: 0.08,
  });

  const glassBalustrade = new THREE.MeshPhysicalMaterial({
    color: 0xD8EEF6,
    transparent: true,
    opacity: 0.38,
    roughness: 0.018,
    metalness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.012,
    ior: 1.52,
    thickness: 0.28,
    attenuationDistance: 6.0,
    attenuationColor: new THREE.Color(0xE2F4FC),
    reflectivity: 0.98,
    iridescence: 0.28,
    iridescenceIOR: 1.36,
    iridescenceThicknessRange: [160, 360],
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xFFFFFF),
    envMapIntensity: 2.15,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  applyReflectiveClearGlassShader(glassBalustrade, 'balustrade');

  const foliageDark = new THREE.MeshStandardMaterial({
    color: 0x1E4620,
    roughness: 0.72,
    metalness: 0.02,
  });

  const foliageLight = new THREE.MeshStandardMaterial({
    color: 0x3C6E35,
    roughness: 0.65,
    metalness: 0.02,
  });

  const foliageAccent = new THREE.MeshStandardMaterial({
    color: 0x5A8E44,
    roughness: 0.62,
    metalness: 0.03,
  });

  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x5A4332,
    roughness: 0.85,
    metalness: 0.01,
  });

  const soilMaterial = new THREE.MeshStandardMaterial({
    color: 0x29211B,
    roughness: 0.94,
    metalness: 0.0,
  });

  const waterMirror = new THREE.MeshPhysicalMaterial({
    color: 0x12B4D2,
    emissive: 0x0A586E,
    emissiveIntensity: 0.38,
    bumpMap: waterRippleBump,
    bumpScale: 0.016,
    roughness: 0.03,
    metalness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    ior: 1.333,
    reflectivity: 0.98,
    transparent: true,
    opacity: 0.78,
  });

  const poolMosaicTile = new THREE.MeshStandardMaterial({
    color: 0x1BB8D8,
    map: poolMosaicTex.map,
    bumpMap: poolMosaicTex.bumpMap,
    bumpScale: 0.018,
    emissive: 0x08485C,
    emissiveIntensity: 0.28,
    roughness: 0.22,
    metalness: 0.08,
  });

  const poolCopingStone = new THREE.MeshStandardMaterial({
    color: 0xF5F1E8,
    map: concreteTex,
    bumpMap: concreteTex,
    bumpScale: 0.012,
    roughness: 0.42,
    metalness: 0.02,
  });

  const podiumStone = new THREE.MeshStandardMaterial({
    color: 0x524F4A,
    map: concreteTex,
    roughness: 0.76,
    metalness: 0.05,
  });

  const lawnGrassMat = new THREE.MeshStandardMaterial({
    color: 0x355E2B,
    roughness: 0.88,
    metalness: 0.01,
  });

  const interiorGlow = new THREE.MeshStandardMaterial({
    color: 0xFFF2DC,
    emissive: 0xFFAE42,
    emissiveIntensity: 0.80,
    roughness: 0.35,
  });

  const coveLed = new THREE.MeshStandardMaterial({
    color: 0xFFF8E7,
    emissive: 0xFFC46B,
    emissiveIntensity: 2.4,
    roughness: 0.2,
  });

  const poolUnderwaterLed = new THREE.MeshStandardMaterial({
    color: 0xE6FFFF,
    emissive: 0x38E8FF,
    emissiveIntensity: 3.2,
    roughness: 0.1,
  });

  const interiorFloor = new THREE.MeshStandardMaterial({
    color: 0x9C9890,
    map: concreteTex,
    roughness: 0.36,
    metalness: 0.05,
  });

  const furnitureFabric = new THREE.MeshStandardMaterial({
    color: 0xE6E0D3,
    roughness: 0.75,
    metalness: 0.01,
  });

  const furnitureWood = new THREE.MeshStandardMaterial({
    color: 0x6E472B,
    roughness: 0.46,
    metalness: 0.05,
  });

  return {
    travertine,
    concreteSlab,
    boardFormedConcrete,
    parkingBoardConcrete,
    parkingSplitStone,
    whiteGroovedCladding,
    flutedConcreteMat,
    darkFlutedMetalMat,
    darkSlateStone,
    alabaster,
    woodSoffit,
    cortenLouver,
    bronzeMetal,
    slimDoorFrameMetal,
    stainlessSteel,
    architecturalGlass,
    balconyDoorGlass,
    windowInteriorBacking,
    glassBalustrade,
    foliageDark,
    foliageLight,
    foliageAccent,
    trunkMaterial,
    soilMaterial,
    waterMirror,
    poolMosaicTile,
    poolCopingStone,
    podiumStone,
    lawnGrassMat,
    interiorGlow,
    coveLed,
    poolUnderwaterLed,
    interiorFloor,
    furnitureFabric,
    furnitureWood,
  };
}

/**
 * ============================================================================
 * GEOMETRÍA PARAMÉTRICA DE LOS 3 BALCONES CONTINUOS EN CURVA "S" (FACHADA Z+)
 * ============================================================================
 * Basada fielmente en `RC-exterior.frontal.jpeg`, `RC-exterior.frontal-lejos.jpeg`,
 * `RC-exterior.costado.izquierdo.jpeg` y `RC-exterior.entrada-costado.jpeg`:
 * 1. ESQUINA CURVA IZQUIERDA Y ALA NORTE EN VOLADIZO PROGRESIVO (x de -11.15 a -1.35):
 *    Nace en la torre de celosías izquierda (z = +4.40m), avanza por el costado oeste
 *    hasta z = +8.85m, gira con curva amplia y se proyecta hacia adelante formando la
 *    "proa" o vientre saliente frente a las Columnas 2 y 3 (alcanzando z = +11.45m).
 * 2. INFLEXIÓN CENTRAL PROFUNDA EN CURVA "S" (x de -1.35 a +2.15):
 *    Justo después de la Columna 3 (x = -1.15), la losa describe una curva orgánica
 *    en "S" muy marcada que retrocede 3.95 metros (de z = +11.45m a z = +7.50m).
 * 3. ALA DERECHA Y ESQUINA CURVA ESTE (x de +2.15 a +10.45):
 *    Continúa hacia la derecha avanzando suavemente de z = +7.50m a z = +8.20m,
 *    y remata con una esquina curva de radio amplio que entrega en z = +4.40m.
 */
function evaluateFrontBalconyDepth(x: number, levelOffset: number = 0): number {
  const noseX = -2.35;
  const sCurveStartX = -1.35;
  const sCurveEndX = 2.15;

  if (x <= noseX) {
    // El ala izquierda avanza progresivamente desde la esquina izquierda (x = -10.85, z = 9.85)
    // hasta la proa saliente frente a la 1ra celosía terracota (x = -2.35, z = 11.45)
    const tLeft = Math.max(0, Math.min(1, (x - (-10.85)) / (noseX - (-10.85))));
    const smoothLeft = Math.sin(tLeft * Math.PI * 0.5);
    return 9.85 + smoothLeft * 1.60 + levelOffset;
  }

  if (x <= sCurveStartX) {
    // Meseta de máxima proyección frontal entre las Columnas 2 y 3
    return 11.45 + levelOffset;
  }

  if (x < sCurveEndX) {
    // Inflexión central dramática en "S" (retrocede 3.95m de z = 11.45m a z = 7.50m)
    const t = (x - sCurveStartX) / (sCurveEndX - sCurveStartX);
    const smoothS = t * t * (3 - 2 * t);
    const leftZ = 11.45 + levelOffset;
    const rightZ = 7.50 + levelOffset * 0.65;
    return leftZ + (rightZ - leftZ) * smoothS;
  }

  // El ala derecha avanza suavemente desde el valle de la "S" (z = 7.50m) hacia la esquina frontal-derecha (z = 8.95m)
  const tRight = Math.max(0, Math.min(1, (x - sCurveEndX) / (10.20 - sCurveEndX)));
  const smoothRight = tRight * (2 - tRight);
  return 7.50 + smoothRight * 1.45 + levelOffset * 0.65;
}

function buildContinuousBalconyPoints(
  levelOffset: number = 0,
  inset: number = 0
): THREE.Vector2[] {
  const xMin = -11.05 + inset;
  // En el costado derecho (X+ / lado del Portón, RC-exterior.entrada-costado.jpeg),
  // los 3 balcones vuelan hacia afuera hasta x = +11.65m (+1.30m de voladizo lateral respecto al muro x = +10.35m)
  // y se extienden a lo largo de esta fachada lateral hasta entregar en la Torre de Celosías Terracota (z = +3.65m).
  const xMax = 11.65 - inset;
  const zLeftBack = 4.40 + inset * 0.20;
  const zRightBack = 3.65 + inset;
  const xRightWallJoin = 10.35 - inset * 0.25;
  const cornerRadiusLeft = Math.max(0.35, 1.85 - inset * 0.55);
  const cornerRadiusRight = Math.max(0.35, 1.65 - inset * 0.50);

  const pts: THREE.Vector2[] = [];
  pts.push(new THREE.Vector2(xMin, zLeftBack));

  const startX = xMin + cornerRadiusLeft;
  const endX = xMax - cornerRadiusRight;

  const leftFrontZ = evaluateFrontBalconyDepth(startX, levelOffset) - inset;
  pts.push(new THREE.Vector2(xMin, leftFrontZ - cornerRadiusLeft));

  // Esquina curva izquierda de amplio radio
  const leftCurveSteps = 20;
  for (let i = 1; i <= leftCurveSteps; i++) {
    const angle = Math.PI - (i / leftCurveSteps) * (Math.PI * 0.5);
    const cx = startX + Math.cos(angle) * cornerRadiusLeft;
    const cz = leftFrontZ - cornerRadiusLeft + Math.sin(angle) * cornerRadiusLeft;
    pts.push(new THREE.Vector2(cx, cz));
  }

  // Frente esculpido con proa izquierda, curva en "S" central y ala derecha
  const frontSteps = 96;
  for (let i = 1; i <= frontSteps; i++) {
    const x = startX + (i / frontSteps) * (endX - startX);
    const z = evaluateFrontBalconyDepth(x, levelOffset) - inset;
    pts.push(new THREE.Vector2(x, z));
  }

  // Esquina curva derecha de amplio radio que dobla hacia la fachada lateral del Portón (X+)
  const rightFrontZ = evaluateFrontBalconyDepth(endX, levelOffset) - inset;
  const rightCurveSteps = 20;
  for (let i = 1; i <= rightCurveSteps; i++) {
    const angle = Math.PI * 0.5 - (i / rightCurveSteps) * (Math.PI * 0.5);
    const cx = endX + Math.cos(angle) * cornerRadiusRight;
    const cz = rightFrontZ - cornerRadiusRight + Math.sin(angle) * cornerRadiusRight;
    pts.push(new THREE.Vector2(cx, cz));
  }

  // Extensión lateral del balcón por la fachada derecha (X+ = +11.65m, desde la curva frontal hasta z = +3.65m)
  pts.push(new THREE.Vector2(xMax, zRightBack));
  // Retorno en ángulo recto que entrega directamente contra la Torre de Celosías Terracota (x = +10.35m, z = +3.65m)
  pts.push(new THREE.Vector2(xRightWallJoin, zRightBack));
  pts.push(new THREE.Vector2(xRightWallJoin, zLeftBack));
  return pts;
}

/**
 * Construye cada una de las 3 Terrazas Continuas en Curva "S" de la Fachada Principal (Z+)
 * NOTA TÉCNICA SOBRE EXTRUDEGEOMETRY + ROTATEX(PI/2):
 * Al rotar +90° en X, el eje +Z de extrusión pasa a apuntar hacia -Y (hacia abajo).
 * Por tanto, una geometría extruida con `depth = H` sin bisel abarca desde `y = position.y` (arriba)
 * hasta `y = position.y - H` (abajo).
 * Así garantizamos que:
 * - El Faldón / Antepecho Monolítico de Concreto Visto (`parapetMesh`) sea una banda continua y limpia
 *   de `1.16m` de alto (`y = +0.94m` a `-0.22m`), con su goterón perimetral inferior.
 * - El Plafón de Madera Teca (`soffitMesh`, en `y = -0.165m` a `-0.205m`) quede completamente visible
 *   por debajo de la losa estructural (`slabMesh`, `y = +0.08m` a `-0.16m`), revelando la forma en "S"
 *   tal cual se aprecia en `RC-exterior.frontal.jpeg` y `RC-exterior.frontal-lejos.jpeg`.
 */
function createContinuousSCurveBalcony(
  materials: SceneMaterials,
  levelOffset: number = 0,
  includeCascadingVines: boolean = true,
  isPenthouseTerrace: boolean = false
): THREE.Group {
  const group = new THREE.Group();

  const parapetTotalHeight = isPenthouseTerrace ? 1.06 : 1.16;
  const parapetTopY = isPenthouseTerrace ? 0.84 : 0.94; // Baja hasta y = -0.22m (goterón inferior)
  const wallThickness = 0.30;

  const outerPts = buildContinuousBalconyPoints(levelOffset, 0);
  const innerParapetPts = buildContinuousBalconyPoints(levelOffset, wallThickness);

  // 1. FALDÓN / ANTEPECHO MONOLÍTICO CONTINUO DE CONCRETO VISTO GRIS CLARO (Banda exterior limpia de 1.16m)
  const parapetShape = new THREE.Shape(outerPts);
  parapetShape.holes.push(new THREE.Path(innerParapetPts.slice().reverse()));

  const parapetGeo = new THREE.ExtrudeGeometry(parapetShape, {
    depth: parapetTotalHeight,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.015,
    bevelSegments: 2,
    curveSegments: 64,
  });
  parapetGeo.rotateX(Math.PI / 2);
  const parapetMesh = new THREE.Mesh(parapetGeo, materials.boardFormedConcrete);
  parapetMesh.position.y = parapetTopY;
  parapetMesh.castShadow = true;
  parapetMesh.receiveShadow = true;
  group.add(parapetMesh);

  // 2. LOSA ESTRUCTURAL INTERNA DE LA TERRAZA (Encajada dentro del antepecho, de y = +0.08m a y = -0.15m)
  const innerSlabPts = buildContinuousBalconyPoints(levelOffset, wallThickness - 0.02);
  const innerSlabShape = new THREE.Shape(innerSlabPts);
  const slabGeo = new THREE.ExtrudeGeometry(innerSlabShape, {
    depth: 0.23,
    bevelEnabled: false,
    curveSegments: 52,
  });
  slabGeo.rotateX(Math.PI / 2);
  const slabMesh = new THREE.Mesh(slabGeo, materials.boardFormedConcrete);
  slabMesh.position.y = 0.08;
  slabMesh.castShadow = true;
  slabMesh.receiveShadow = true;
  group.add(slabMesh);

  // 3. PLAFÓN INFERIOR CONTINUO DE MADERA TECA CÁLIDA (De y = -0.155m a y = -0.195m, 100% visible desde abajo)
  const soffitPts = buildContinuousBalconyPoints(levelOffset, 0.16);
  const soffitShape = new THREE.Shape(soffitPts);
  const soffitGeo = new THREE.ExtrudeGeometry(soffitShape, {
    depth: 0.04,
    bevelEnabled: false,
    curveSegments: 56,
  });
  soffitGeo.rotateX(Math.PI / 2);
  const soffitMesh = new THREE.Mesh(soffitGeo, materials.woodSoffit);
  soffitMesh.position.y = -0.155;
  soffitMesh.receiveShadow = true;
  group.add(soffitMesh);

  // 4. RIELES NEGROS DE ILUMINACIÓN (TRACK LIGHTS) SOBRE EL PLAFÓN DE MADERA TECA EN AMBAS ALAS Y EN LA CURVA "S"
  const soffitBottomY = -0.198;
  const trackRailLeftGeo = new THREE.BoxGeometry(7.2, 0.032, 0.055);
  const trackRailRightGeo = new THREE.BoxGeometry(6.2, 0.032, 0.055);
  const trackHeadGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.10, 10);
  const lensGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.015, 10);

  // Rieles bajo el Ala Izquierda (proa del balcón)
  [6.6, 8.1, 9.5].forEach((zTrack) => {
    const railLeft = new THREE.Mesh(trackRailLeftGeo, materials.bronzeMetal);
    railLeft.position.set(-5.6, soffitBottomY - 0.015, zTrack);
    group.add(railLeft);

    for (let sx = -8.6; sx <= -2.6; sx += 2.0) {
      const head = new THREE.Mesh(trackHeadGeo, materials.bronzeMetal);
      head.position.set(sx, soffitBottomY - 0.055, zTrack);
      group.add(head);

      const lens = new THREE.Mesh(lensGeo, materials.coveLed);
      lens.position.set(sx, soffitBottomY - 0.108, zTrack);
      group.add(lens);
    }
  });

  // Rieles bajo el Ala Derecha del balcón (RC-exterior.frontal.jpeg y RC-exterior.entrada-costado.jpeg)
  [5.4, 6.2, 7.0].forEach((zTrackRight) => {
    const railRight = new THREE.Mesh(trackRailRightGeo, materials.bronzeMetal);
    railRight.position.set(5.5, soffitBottomY - 0.015, zTrackRight);
    group.add(railRight);

    for (let sx = 3.0; sx <= 8.0; sx += 1.65) {
      const head = new THREE.Mesh(trackHeadGeo, materials.bronzeMetal);
      head.position.set(sx, soffitBottomY - 0.055, zTrackRight);
      group.add(head);

      const lens = new THREE.Mesh(lensGeo, materials.coveLed);
      lens.position.set(sx, soffitBottomY - 0.108, zTrackRight);
      group.add(lens);
    }
  });

  // Tira LED cálida indirecta oculta en el foseado perimetral entre el plafón de madera y el borde de concreto
  const ledStripOuterPts = buildContinuousBalconyPoints(levelOffset, 0.15);
  const ledStripInnerPts = buildContinuousBalconyPoints(levelOffset, 0.22);
  const ledStripShape = new THREE.Shape(ledStripOuterPts);
  ledStripShape.holes.push(new THREE.Path(ledStripInnerPts.slice().reverse()));
  const ledStripGeo = new THREE.ExtrudeGeometry(ledStripShape, {
    depth: 0.02,
    bevelEnabled: false,
    curveSegments: 52,
  });
  ledStripGeo.rotateX(Math.PI / 2);

  const soffitCoveStrip = new THREE.Mesh(ledStripGeo, materials.coveLed);
  soffitCoveStrip.position.y = -0.185;
  group.add(soffitCoveStrip);

  // 5. PISO INTERIOR DE LA TERRAZA EN GRANITO GRIS
  const floorPts = buildContinuousBalconyPoints(levelOffset, wallThickness);
  const floorShape = new THREE.Shape(floorPts);
  const floorGeo = new THREE.ExtrudeGeometry(floorShape, {
    depth: 0.04,
    bevelEnabled: false,
    curveSegments: 44,
  });
  floorGeo.rotateX(Math.PI / 2);
  const floorMesh = new THREE.Mesh(floorGeo, materials.interiorFloor);
  floorMesh.position.y = 0.12;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // 6. BARANDILLA CONTINUA DE CRISTAL LAMINADO SOBRE EL ANTEPECHO EN CURVA "S"
  const glassH = isPenthouseTerrace ? 0.48 : 0.34;
  const glassPts = buildContinuousBalconyPoints(levelOffset, wallThickness * 0.42);
  const glassInnerPts = buildContinuousBalconyPoints(levelOffset, wallThickness * 0.42 + 0.035);
  const glassShape = new THREE.Shape(glassPts);
  glassShape.holes.push(new THREE.Path(glassInnerPts.slice().reverse()));
  const glassGeo = new THREE.ExtrudeGeometry(glassShape, {
    depth: glassH,
    bevelEnabled: false,
    curveSegments: 52,
  });
  glassGeo.rotateX(Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, materials.glassBalustrade);
  glassMesh.position.y = parapetTopY + glassH;
  group.add(glassMesh);

  // 7. JARDINERA PERIMETRAL EN LA CORONACIÓN DEL ANTEPECHO (Deja 100% libre y visible el faldón curvo de concreto visto)
  if (includeCascadingVines) {
    const foliageMats = [materials.foliageDark, materials.foliageLight, materials.foliageAccent];
    const bushGeo = new THREE.DodecahedronGeometry(0.26, 1);
    const cascadeLeafGeo = new THREE.DodecahedronGeometry(0.18, 1);

    const numClusters = 62;
    for (let i = 0; i <= numClusters; i++) {
      const t = i / numClusters;
      const x = -10.1 + t * 20.8;
      // Retranqueada hacia adentro de la jardinera para que la banda blanca/gris de concreto se lea nítida de punta a punta
      const zFront = evaluateFrontBalconyDepth(x, levelOffset) - wallThickness * 0.72;
      const mat = foliageMats[i % foliageMats.length];

      const bush = new THREE.Mesh(bushGeo, mat);
      const scaleX = 0.92 + ((i * 17) % 4) * 0.08;
      const scaleY = 0.62 + ((i * 13) % 3) * 0.08;
      const scaleZ = 0.68 + ((i * 7) % 3) * 0.06;
      bush.scale.set(scaleX, scaleY, scaleZ);
      bush.position.set(x, parapetTopY + 0.14, zFront);
      bush.rotation.set((i * 0.7) % 3, (i * 1.3) % 3, (i * 0.4) % 3);
      bush.castShadow = true;
      bush.receiveShadow = true;
      group.add(bush);
    }

    // Jardineras laterales en los retornos izquierdo (X-) y derecho (X+ / lado del Portón, de z = +3.85m a +8.15m)
    for (let lz = 4.85; lz <= 8.55; lz += 0.38) {
      const bushL = new THREE.Mesh(bushGeo, foliageMats[Math.round(lz * 10) % foliageMats.length]);
      bushL.scale.set(0.68, 0.64, 0.92);
      bushL.position.set(-11.05 + wallThickness * 0.72, parapetTopY + 0.14, lz);
      bushL.castShadow = true;
      group.add(bushL);
    }
    for (let rz = 3.85; rz <= 8.15; rz += 0.34) {
      const bushR = new THREE.Mesh(bushGeo, foliageMats[Math.round(rz * 10) % foliageMats.length]);
      bushR.scale.set(0.74, 0.68, 0.95);
      bushR.position.set(11.65 - wallThickness * 0.72, parapetTopY + 0.14, rz);
      bushR.castShadow = true;
      group.add(bushR);
    }

    // Racimos puntuales de hiedra colgante en el frente (RC-exterior.frontal.jpeg) y en ambos costados (RC-exterior.entrada-costado.jpeg)
    const cascadeAccentsX = [-8.2, -3.4, 2.8, 7.4];
    cascadeAccentsX.forEach((cx, idx) => {
      const cz = evaluateFrontBalconyDepth(cx, levelOffset) + 0.03;
      for (let d = 0; d < 3; d++) {
        const dropLeaf = new THREE.Mesh(
          cascadeLeafGeo,
          foliageMats[(idx + d) % foliageMats.length]
        );
        dropLeaf.scale.set(0.85, 1.35, 0.55);
        dropLeaf.position.set(cx + (d - 1) * 0.22, parapetTopY - 0.14 - (d % 2) * 0.16, cz);
        dropLeaf.castShadow = true;
        group.add(dropLeaf);
      }
    });

    // Hiedra colgante a lo largo de la extensión lateral derecha del balcón (idéntica a RC-exterior.entrada-costado.jpeg)
    [4.45, 5.85, 7.35].forEach((rz, idx) => {
      for (let d = 0; d < 3; d++) {
        const sideVineR = new THREE.Mesh(
          cascadeLeafGeo,
          foliageMats[(idx + d) % foliageMats.length]
        );
        sideVineR.scale.set(0.55, 1.45, 0.88);
        sideVineR.position.set(11.67, parapetTopY - 0.15 - (d % 2) * 0.18, rz + (d - 1) * 0.22);
        sideVineR.castShadow = true;
        group.add(sideVineR);
      }
    });

    // Hiedra colgante en el retorno lateral izquierdo (idéntica a RC-exterior.costado.izquierdo.jpeg)
    [5.45, 7.25].forEach((lz, idx) => {
      for (let d = 0; d < 3; d++) {
        const sideVineL = new THREE.Mesh(
          cascadeLeafGeo,
          foliageMats[(idx + d) % foliageMats.length]
        );
        sideVineL.scale.set(0.55, 1.40, 0.85);
        sideVineL.position.set(-11.07, parapetTopY - 0.15 - (d % 2) * 0.18, lz + (d - 1) * 0.20);
        sideVineL.castShadow = true;
        group.add(sideVineL);
      }
    });

    // Palmera alta en la inflexión central en "S" del 3er balcón (Penthouse) como en RC-exterior.frontal.jpeg
    const palmClusters = isPenthouseTerrace
      ? [
          { x: -9.5, z: evaluateFrontBalconyDepth(-9.5, levelOffset) - 0.95, h: 2.3 },
          { x: 0.45, z: evaluateFrontBalconyDepth(0.45, levelOffset) - 0.75, h: 3.9 },
        ]
      : [{ x: -9.5, z: evaluateFrontBalconyDepth(-9.5, levelOffset) - 0.95, h: 2.0 }];
    const frondGeo = new THREE.BoxGeometry(0.18, 1.05, 0.04);
    const stemGeo = new THREE.CylinderGeometry(0.04, 0.06, 2.2, 6);
    palmClusters.forEach((pos, idx) => {
      const palmGroup = new THREE.Group();
      palmGroup.position.set(pos.x, parapetTopY, pos.z);

      const stem = new THREE.Mesh(stemGeo, materials.trunkMaterial);
      stem.scale.y = pos.h / 2.2;
      stem.position.y = pos.h * 0.42;
      palmGroup.add(stem);

      for (let f = 0; f < 9; f++) {
        const angle = (f / 9) * Math.PI * 2;
        const frond = new THREE.Mesh(frondGeo, foliageMats[(idx + f) % foliageMats.length]);
        frond.position.set(Math.cos(angle) * 0.32, pos.h * 0.82, Math.sin(angle) * 0.32);
        frond.rotation.z = Math.cos(angle) * 0.64;
        frond.rotation.x = Math.sin(angle) * 0.64;
        frond.castShadow = true;
        palmGroup.add(frond);
      }
      group.add(palmGroup);
    });
  }

  // 8. MOBILIARIO EXTERIOR DE TERRAZA EN AMBAS ALAS DEL BALCÓN
  const sofaSeatGeo = new THREE.BoxGeometry(2.35, 0.36, 0.92);
  const sofaBackGeo = new THREE.BoxGeometry(2.35, 0.42, 0.16);
  const lowTableGeo = new THREE.BoxGeometry(1.25, 0.24, 1.15);
  const armchairGeo = new THREE.BoxGeometry(0.82, 0.56, 0.82);

  // Salón exterior Ala Izquierda
  const sofaLeft = new THREE.Mesh(sofaSeatGeo, materials.furnitureFabric);
  sofaLeft.position.set(-6.4, 0.30, 8.35);
  sofaLeft.castShadow = true;
  group.add(sofaLeft);

  const sofaBackLeft = new THREE.Mesh(sofaBackGeo, materials.furnitureWood);
  sofaBackLeft.position.set(-6.4, 0.52, 8.75);
  group.add(sofaBackLeft);

  const coffeeTableLeft = new THREE.Mesh(lowTableGeo, materials.furnitureWood);
  coffeeTableLeft.position.set(-6.4, 0.24, 7.15);
  coffeeTableLeft.castShadow = true;
  group.add(coffeeTableLeft);

  const chairL1 = new THREE.Mesh(armchairGeo, materials.furnitureFabric);
  chairL1.position.set(-4.65, 0.38, 7.35);
  chairL1.castShadow = true;
  group.add(chairL1);

  // Salón exterior Ala Derecha
  const sofaRight = new THREE.Mesh(sofaSeatGeo, materials.furnitureFabric);
  sofaRight.position.set(6.2, 0.30, 6.25);
  sofaRight.castShadow = true;
  group.add(sofaRight);

  const chairR1 = new THREE.Mesh(armchairGeo, materials.furnitureFabric);
  chairR1.position.set(4.5, 0.38, 5.95);
  chairR1.castShadow = true;
  group.add(chairR1);

  return group;
}

/**
 * ============================================================================
 * CUBIERTA PLEGADA ASIMÉTRICA EN "V" (CON VOLADIZO AL FRENTE Z+ Y EN EL COSTADO DEL BALCÓN)
 * ============================================================================
 * Basada en `RC-exterior.frontal.jpeg`, `RC-exterior.frontal-lejos.jpeg`,
 * `RC-exterior.entrada-costado.jpeg` y `RC-exterior.costado.izquierdo.jpeg`:
 * - En la fachada derecha (X+ / lado del Portón), desde el Gran Pilar de Concreto Visto (z = +3.05m)
 *   hacia atrás (z = -5.65m), la cubierta queda 100% enrasada dentro del Pórtico en "L" invertida
 *   de Concreto Visto (`x = +10.35m`), mientras que desde `z = +3.05m` hacia el frente (`z = +9.65m`),
 *   sobre la torre de celosías terracota y los 3 balcones laterales, vuela en alero hasta `x = +11.95m`
 *   apoyada sobre la columna cilíndrica.
 */
function createMonumentalOrigamiCanopy(materials: SceneMaterials): THREE.Group {
  const canopyGroup = new THREE.Group();

  // 1. ALA IZQUIERDA DE LA CUBIERTA (Enrasada con la cornisa lateral atrás y en gran voladizo sobre los balcones al frente)
  const leftWingPts = [
    new THREE.Vector2(-11.30, -5.65),
    new THREE.Vector2(-11.30, 3.70),
    new THREE.Vector2(-12.40, 3.85),
    new THREE.Vector2(-12.40, 9.85),
    new THREE.Vector2(-10.80, 11.45),
    new THREE.Vector2(-0.85, 12.15),
    new THREE.Vector2(0.55, 8.15),
    new THREE.Vector2(0.55, -5.65),
  ];
  const leftWingShape = new THREE.Shape(leftWingPts);
  const leftWingGeo = new THREE.ExtrudeGeometry(leftWingShape, {
    depth: 0.44,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  leftWingGeo.rotateX(Math.PI / 2);

  const leftPos = leftWingGeo.attributes.position;
  for (let i = 0; i < leftPos.count; i++) {
    const vx = leftPos.getX(i);
    const vy = leftPos.getY(i);
    const vz = leftPos.getZ(i);
    const frontLift = vz > 3.5 ? ((vz - 3.5) / 8.65) * 1.15 : 0;
    const sideLift = vz > 3.5 ? Math.max(0, (-vx - 0.2) / 12.0) * 0.42 : 0;
    leftPos.setY(i, vy + frontLift + sideLift);
  }
  leftWingGeo.computeVertexNormals();

  const leftWingMesh = new THREE.Mesh(leftWingGeo, materials.boardFormedConcrete);
  leftWingMesh.castShadow = true;
  leftWingMesh.receiveShadow = true;
  canopyGroup.add(leftWingMesh);

  // 2. ALA DERECHA DE LA CUBIERTA (Enrasada en x = +10.35m tras el pilar de concreto z <= 3.05m y en voladizo hasta x = +11.95m sobre los balcones z > 3.05m)
  const rightWingPts = [
    new THREE.Vector2(0.35, -5.65),
    new THREE.Vector2(0.35, 8.15),
    new THREE.Vector2(2.15, 8.35),
    new THREE.Vector2(10.85, 9.65),
    new THREE.Vector2(11.95, 8.65),
    new THREE.Vector2(11.95, 3.15),
    new THREE.Vector2(10.32, 3.05),
    new THREE.Vector2(10.32, -5.65),
  ];
  const rightWingShape = new THREE.Shape(rightWingPts);
  const rightWingGeo = new THREE.ExtrudeGeometry(rightWingShape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  rightWingGeo.rotateX(Math.PI / 2);

  const rightPos = rightWingGeo.attributes.position;
  for (let i = 0; i < rightPos.count; i++) {
    const vx = rightPos.getX(i);
    const vy = rightPos.getY(i);
    const vz = rightPos.getZ(i);
    const frontLift = vz > 3.05 ? ((vz - 3.05) / 6.6) * 0.52 : 0;
    const rightSlope = vz > 3.05 ? Math.max(0, vx / 11.95) * 0.24 : 0;
    rightPos.setY(i, vy - 0.06 + frontLift + rightSlope);
  }
  rightWingGeo.computeVertexNormals();

  const rightWingMesh = new THREE.Mesh(rightWingGeo, materials.boardFormedConcrete);
  rightWingMesh.castShadow = true;
  rightWingMesh.receiveShadow = true;
  canopyGroup.add(rightWingMesh);

  // 3. JUNTAS DIAGONALES DE ENCOFRADO EN LAS ESQUINAS DEL ALERO DE CONCRETO VISTO
  const seamLines = [
    { x1: -12.25, z1: 9.15, x2: -4.2, z2: 4.2, y1: 1.05, y2: 0.25 },
    { x1: -10.7, z1: 10.7, x2: -3.2, z2: 4.5, y1: 1.12, y2: 0.25 },
    { x1: -0.85, z1: 10.4, x2: 0.3, z2: 4.5, y1: 0.62, y2: 0.12 },
    { x1: 10.75, z1: 9.3, x2: 4.2, z2: 4.5, y1: 0.38, y2: 0.02 },
    { x1: 11.75, z1: 8.3, x2: 5.2, z2: 3.6, y1: 0.30, y2: 0.0 },
  ];
  seamLines.forEach((s) => {
    const dx = s.x2 - s.x1;
    const dy = s.y2 - s.y1;
    const dz = s.z2 - s.z1;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const seamGeo = new THREE.BoxGeometry(0.05, 0.025, len);
    const seam = new THREE.Mesh(seamGeo, materials.bronzeMetal);
    seam.position.set((s.x1 + s.x2) * 0.5, (s.y1 + s.y2) * 0.5 - 0.42, (s.z1 + s.z2) * 0.5);
    seam.lookAt(s.x2, s.y2 - 0.42, s.z2);
    canopyGroup.add(seam);
  });

  // 4. CASETA TÉCNICA CENTRAL DE ASCENSOR EN CUBIERTA
  const overrunBox = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 1.25, 3.8),
    materials.boardFormedConcrete
  );
  overrunBox.position.set(-0.2, 0.62, -1.2);
  overrunBox.castShadow = true;
  overrunBox.receiveShadow = true;
  canopyGroup.add(overrunBox);

  // 5. RIELES DE ILUMINACIÓN Y FOCOS LED CÁLIDOS BAJO LA CUBIERTA DEL PENTHOUSE
  const trackGeo = new THREE.BoxGeometry(7.5, 0.04, 0.06);
  const canopyLensGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12);
  [1.2, 3.8, 6.2].forEach((zPos) => {
    const leftY = -0.22 + (zPos + 4) * 0.055;
    const leftTrack = new THREE.Mesh(trackGeo, materials.bronzeMetal);
    leftTrack.position.set(-5.6, leftY, zPos);
    canopyGroup.add(leftTrack);

    const rightY = -0.44 + (zPos + 4) * 0.035;
    const rightTrack = new THREE.Mesh(trackGeo, materials.bronzeMetal);
    rightTrack.position.set(5.2, rightY, zPos);
    canopyGroup.add(rightTrack);

    for (let lx = -8.6; lx <= -2.6; lx += 2.0) {
      const spot = new THREE.Mesh(canopyLensGeo, materials.coveLed);
      spot.position.set(lx, leftY - 0.03, zPos);
      canopyGroup.add(spot);
    }
    for (let rx = 2.2; rx <= 8.2; rx += 2.0) {
      const spot = new THREE.Mesh(canopyLensGeo, materials.coveLed);
      spot.position.set(rx, rightY - 0.03, zPos);
      canopyGroup.add(spot);
    }
  });

  return canopyGroup;
}

/**
 * ============================================================================
 * TORRE VERTICAL DE CELOSÍAS BRISE-SOLEIL EN TERRACOTA ARTICULADA POR NIVEL
 * ============================================================================
 */
function createVerticalTerracottaScreen(
  width: number,
  height: number,
  materials: SceneMaterials,
  numLouvers: number = 11,
  includeCornerReturn: boolean = false,
  includeMidTransom: boolean = true
): THREE.Group {
  const group = new THREE.Group();
  const frameDepth = 0.26;

  const railGeo = new THREE.BoxGeometry(width + 0.06, 0.11, frameDepth + 0.02);
  const topRail = new THREE.Mesh(railGeo, materials.cortenLouver);
  topRail.position.y = height * 0.5 - 0.055;
  group.add(topRail);

  const bottomRail = new THREE.Mesh(railGeo, materials.cortenLouver);
  bottomRail.position.y = -height * 0.5 + 0.055;
  group.add(bottomRail);

  if (includeMidTransom) {
    const midRail = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.04, 0.08, frameDepth),
      materials.cortenLouver
    );
    midRail.position.y = height * 0.12;
    group.add(midRail);
  }

  const postGeo = new THREE.BoxGeometry(0.11, height, frameDepth + 0.02);
  const leftPost = new THREE.Mesh(postGeo, materials.cortenLouver);
  leftPost.position.x = -width * 0.5;
  leftPost.castShadow = true;
  group.add(leftPost);

  const rightPost = new THREE.Mesh(postGeo, materials.cortenLouver);
  rightPost.position.x = width * 0.5;
  rightPost.castShadow = true;
  group.add(rightPost);

  const centerPost = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, height, frameDepth + 0.01),
    materials.cortenLouver
  );
  centerPost.position.x = -width * 0.12;
  group.add(centerPost);

  const louverGeo = new THREE.BoxGeometry(0.055, height - 0.22, 0.22);
  const step = width / (numLouvers + 1);
  for (let i = 1; i <= numLouvers; i++) {
    const lx = -width * 0.5 + i * step;
    if (Math.abs(lx - (-width * 0.12)) < 0.08) continue;
    const louver = new THREE.Mesh(louverGeo, materials.cortenLouver);
    louver.position.set(lx, 0, 0);
    louver.rotation.y = 0.16;
    louver.castShadow = true;
    louver.receiveShadow = true;
    group.add(louver);
  }

  if (includeCornerReturn) {
    const returnDepth = 1.25;
    const returnLouvers = 6;
    const returnLouverGeo = new THREE.BoxGeometry(0.22, height - 0.22, 0.055);
    for (let j = 1; j <= returnLouvers; j++) {
      const lz = -j * (returnDepth / (returnLouvers + 1));
      const rLouver = new THREE.Mesh(returnLouverGeo, materials.cortenLouver);
      rLouver.position.set(width * 0.5, 0, lz);
      rLouver.castShadow = true;
      group.add(rLouver);
    }
  }

  return group;
}

/**
 * ============================================================================
 * SISTEMA DE PUERTAS CORREDIZAS MINIMALISTAS EN VIDRIO AHUMADO OSCURO PARA BALCONES
 * ============================================================================
 * Construye un módulo de puertas corredizas de piso a techo para balcones con:
 * - Vidrio ahumado oscuro (`materials.balconyDoorGlass`) claramente diferenciado de las ventanas
 * - Marcos perimetrales y montantes de traslape ultrafinos (`0.026m`–`0.030m`) en aluminio negro
 * - Riel inferior empotrado de doble guía y riel cabezal superior compacto
 * - Hojas corredizas traslapadas en dos planos (`z = +0.020m` y `z = -0.020m`)
 * - Tiradores verticales minimalistas en las hojas móviles
 */
function createMinimalistSlidingDoorAssembly(
  bayWidth: number,
  bayHeight: number,
  numLeaves: number,
  materials: SceneMaterials,
  includeDuplexTransom: boolean = false
): THREE.Group {
  const doorGroup = new THREE.Group();
  const slimFrameW = 0.024; // Marco minimalista ultrafino de 2.4cm (vs 8.2cm en ventanas estándar)
  const slimFrameD = 0.038;
  const trackDepth = 0.13;
  const railH = 0.032;

  // 1. Riel Cabezal Superior Ultrafino y Riel Umbral Inferior con Doble Guía de Deslizamiento
  const topHeaderRail = new THREE.Mesh(
    new THREE.BoxGeometry(bayWidth, railH, trackDepth),
    materials.slimDoorFrameMetal
  );
  topHeaderRail.position.y = bayHeight * 0.5 - railH * 0.5;
  doorGroup.add(topHeaderRail);

  const bottomSillRail = new THREE.Mesh(
    new THREE.BoxGeometry(bayWidth, railH, trackDepth + 0.024),
    materials.slimDoorFrameMetal
  );
  bottomSillRail.position.y = -bayHeight * 0.5 + railH * 0.5;
  doorGroup.add(bottomSillRail);

  // Dos guías metálicas finas de rodamiento sobre el riel inferior y superior (riel de puerta corrediza)
  [-0.022, 0.022].forEach((tz) => {
    const bottomTrackGroove = new THREE.Mesh(
      new THREE.BoxGeometry(bayWidth - 0.03, 0.009, 0.009),
      materials.stainlessSteel
    );
    bottomTrackGroove.position.set(0, -bayHeight * 0.5 + railH + 0.003, tz);
    doorGroup.add(bottomTrackGroove);

    const topTrackGroove = new THREE.Mesh(
      new THREE.BoxGeometry(bayWidth - 0.03, 0.007, 0.008),
      materials.stainlessSteel
    );
    topTrackGroove.position.set(0, bayHeight * 0.5 - railH - 0.003, tz);
    doorGroup.add(topTrackGroove);
  });

  // Jambas laterales ultrafinas del marco perimetral
  const leftJamb = new THREE.Mesh(
    new THREE.BoxGeometry(slimFrameW, bayHeight, trackDepth),
    materials.slimDoorFrameMetal
  );
  leftJamb.position.x = -bayWidth * 0.5 + slimFrameW * 0.5;
  doorGroup.add(leftJamb);

  const rightJamb = new THREE.Mesh(
    new THREE.BoxGeometry(slimFrameW, bayHeight, trackDepth),
    materials.slimDoorFrameMetal
  );
  rightJamb.position.x = bayWidth * 0.5 - slimFrameW * 0.5;
  doorGroup.add(rightJamb);

  // 2. Hojas Corredizas de Piso a Techo en Vidrio Ahumado Oscuro con Traslape en Doble Plano
  const overlap = 0.026;
  const usableW = bayWidth - slimFrameW * 2;
  const leafW = usableW / numLeaves + overlap;
  const leafH = bayHeight - railH * 2;

  for (let i = 0; i < numLeaves; i++) {
    const isFrontLeaf = i % 2 === 0;
    const leafZ = isFrontLeaf ? 0.022 : -0.022;
    const leafCenterX = -usableW * 0.5 + (usableW / numLeaves) * (i + 0.5);

    const leafGroup = new THREE.Group();
    leafGroup.position.set(leafCenterX, 0, leafZ);

    // Paño de Vidrio Ahumado Oscuro (más oscuro que las ventanas y con brillo diagonal especular)
    const smokedGlassPane = new THREE.Mesh(
      new THREE.BoxGeometry(leafW - slimFrameW * 1.2, leafH - slimFrameW * 1.2, 0.024),
      materials.balconyDoorGlass
    );
    leafGroup.add(smokedGlassPane);

    // Perfiles verticales ultrafinos (montantes de hoja corrediza de solo 2.4cm)
    const leftStile = new THREE.Mesh(
      new THREE.BoxGeometry(slimFrameW, leafH, slimFrameD),
      materials.slimDoorFrameMetal
    );
    leftStile.position.x = -leafW * 0.5 + slimFrameW * 0.5;
    leafGroup.add(leftStile);

    const rightStile = new THREE.Mesh(
      new THREE.BoxGeometry(slimFrameW, leafH, slimFrameD),
      materials.slimDoorFrameMetal
    );
    rightStile.position.x = leafW * 0.5 - slimFrameW * 0.5;
    leafGroup.add(rightStile);

    // Perfiles horizontales superior e inferior ultrafinos de la hoja móvil
    const topLeafRail = new THREE.Mesh(
      new THREE.BoxGeometry(leafW, slimFrameW, slimFrameD),
      materials.slimDoorFrameMetal
    );
    topLeafRail.position.y = leafH * 0.5 - slimFrameW * 0.5;
    leafGroup.add(topLeafRail);

    const botLeafRail = new THREE.Mesh(
      new THREE.BoxGeometry(leafW, slimFrameW, slimFrameD),
      materials.slimDoorFrameMetal
    );
    botLeafRail.position.y = -leafH * 0.5 + slimFrameW * 0.5;
    leafGroup.add(botLeafRail);

    // Tirador vertical minimalista de puerta corrediza en cada hoja móvil
    const handleSide = i < numLeaves * 0.5 ? -1 : 1;
    const handleX = handleSide * (leafW * 0.5 - slimFrameW * 2.2);
    const handleY = includeDuplexTransom ? -bayHeight * 0.24 : -0.08;
    const doorHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.58, 0.050),
      materials.slimDoorFrameMetal
    );
    doorHandle.position.set(handleX, handleY, isFrontLeaf ? 0.025 : -0.025);
    leafGroup.add(doorHandle);

    // Detalle fino de acero satinado en el agarre del tirador
    const handleGripAccent = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.44, 0.054),
      materials.stainlessSteel
    );
    handleGripAccent.position.set(handleX, handleY, isFrontLeaf ? 0.027 : -0.027);
    leafGroup.add(handleGripAccent);

    doorGroup.add(leafGroup);
  }

  // En los niveles de doble altura (Dúplex PB+P1 y Penthouse), divisor esbelto de entrepiso
  if (includeDuplexTransom) {
    const slimTransom1 = new THREE.Mesh(
      new THREE.BoxGeometry(bayWidth, 0.048, trackDepth + 0.01),
      materials.slimDoorFrameMetal
    );
    slimTransom1.position.y = -0.16;
    doorGroup.add(slimTransom1);

    const slimTransom2 = new THREE.Mesh(
      new THREE.BoxGeometry(bayWidth, 0.038, trackDepth),
      materials.slimDoorFrameMetal
    );
    slimTransom2.position.y = 0.24;
    doorGroup.add(slimTransom2);
  }

  return doorGroup;
}

/**
 * ============================================================================
 * PUERTAS CORREDIZAS DE BALCÓN EN UNIDADES RESIDENCIALES (100% CONTINUAS EN ZIG-ZAG)
 * ============================================================================
 * Construye los cerramientos continuos de salida a los balcones y terrazas empleando
 * Vidrio Ahumado Oscuro (`balconyDoorGlass`) y perfilería minimalista ultrafina (`slimDoorFrameMetal`)
 * con rieles y hojas corredizas traslapadas de extremo a extremo sin huecos.
 */
function createSteppedUnitCurtainWall(
  width: number,
  height: number,
  materials: SceneMaterials,
  isDuplex: boolean,
  wingSide: 'left' | 'right'
): THREE.Group {
  const group = new THREE.Group();

  const outerBayW = width * 0.50;
  const innerBayW = width * 0.50;

  const outerBayX = wingSide === 'left' ? -width * 0.5 + outerBayW * 0.5 : width * 0.5 - outerBayW * 0.5;
  const innerBayX = wingSide === 'left' ? width * 0.5 - innerBayW * 0.5 : -width * 0.5 + innerBayW * 0.5;
  const cornerX = wingSide === 'left' ? -width * 0.5 + outerBayW : width * 0.5 - outerBayW;

  // Alineación milimétrica en Z con las torres de celosías terracota y las puertas corredizas laterales:
  // - Ala Izquierda (base world Z = +4.45m): outerBay en world Z = +5.55m (local +1.10m, justo al borde de leftCornerLouver)
  //   e innerBay en world Z = +6.60m (local +2.15m, detrás de la 1ra celosía frontal).
  // - Ala Derecha (base world Z = +4.45m): innerBay en world Z = +5.70m (local +1.25m, detrás de la 2da celosía frontal)
  //   y outerBay en world Z = +6.45m (local +2.00m, empatando exacto con sideBalconySlidingDoor en z = +6.45m).
  const outerBayZ = wingSide === 'left' ? 1.10 : 2.00;
  const innerBayZ = wingSide === 'left' ? 2.15 : 1.25;

  // 1. BAHÍA EXTERIOR DEL BALCÓN ESCALONADO (100% Puertas corredizas de vidrio ahumado oscuro con marcos ultrafinos)
  const outerBayGroup = new THREE.Group();
  outerBayGroup.position.set(outerBayX, 0, outerBayZ);

  if (isDuplex) {
    // LOSA / FRISO DE ENTREPISO EN CONCRETO VISTO QUE DIVIDE EL PISO 1 Y EL PISO 2 DEL DÚPLEX
    const spandrelH = 0.72;
    const spandrelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(outerBayW + 0.04, spandrelH, 0.34),
      materials.boardFormedConcrete
    );
    spandrelMesh.position.set(0, 0.05, -0.04);
    spandrelMesh.castShadow = true;
    spandrelMesh.receiveShadow = true;
    outerBayGroup.add(spandrelMesh);

    // Retorno lateral de la losa de entrepiso de concreto visto detrás de la celosía esquinera
    const sideReturnX = wingSide === 'left' ? -outerBayW * 0.5 + 0.16 : outerBayW * 0.5 - 0.16;
    const sideSpandrelReturn = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, spandrelH, 1.95),
      materials.boardFormedConcrete
    );
    sideSpandrelReturn.position.set(sideReturnX, 0.05, -0.85);
    sideSpandrelReturn.castShadow = true;
    sideSpandrelReturn.receiveShadow = true;
    outerBayGroup.add(sideSpandrelReturn);

    // Perfiles minimalistas finos sobre y bajo la losa de entrepiso del Dúplex
    const topSpandrelTrim = new THREE.Mesh(
      new THREE.BoxGeometry(outerBayW + 0.04, 0.028, 0.36),
      materials.slimDoorFrameMetal
    );
    topSpandrelTrim.position.set(0, 0.05 + spandrelH * 0.5 + 0.014, -0.04);
    outerBayGroup.add(topSpandrelTrim);

    const botSpandrelTrim = new THREE.Mesh(
      new THREE.BoxGeometry(outerBayW + 0.04, 0.028, 0.36),
      materials.slimDoorFrameMetal
    );
    botSpandrelTrim.position.set(0, 0.05 - spandrelH * 0.5 - 0.014, -0.04);
    outerBayGroup.add(botSpandrelTrim);

    // PISO SUPERIOR DEL DÚPLEX: Puertas corredizas continuas de 3 hojas en vidrio ahumado oscuro
    const upperH = height * 0.5 - 0.05 - spandrelH * 0.5;
    const upperY = 0.05 + spandrelH * 0.5 + upperH * 0.5;
    const upperSlidingDoors = createMinimalistSlidingDoorAssembly(
      outerBayW,
      upperH,
      3,
      materials,
      false
    );
    upperSlidingDoors.position.set(0, upperY, 0);
    outerBayGroup.add(upperSlidingDoors);

    // PISO INFERIOR DEL DÚPLEX: Puertas corredizas continuas de 3 hojas en vidrio ahumado oscuro (100% acristalado de punta a punta)
    const lowerH = height * 0.5 + 0.05 - spandrelH * 0.5;
    const lowerY = -height * 0.5 + lowerH * 0.5;
    const lowerSlidingDoors = createMinimalistSlidingDoorAssembly(
      outerBayW,
      lowerH,
      3,
      materials,
      false
    );
    lowerSlidingDoors.position.set(0, lowerY, 0);
    outerBayGroup.add(lowerSlidingDoors);
  } else {
    // Niveles P2 y P3: Puertas corredizas de 3 hojas de piso a techo con vidrio ahumado oscuro
    const fullOuterSlidingDoors = createMinimalistSlidingDoorAssembly(
      outerBayW,
      height,
      3,
      materials,
      false
    );
    outerBayGroup.add(fullOuterSlidingDoors);
  }
  group.add(outerBayGroup);

  // 2. RETORNO ACRISTALADO EN ESQUINA A 90° ENTRE AMBAS BAHÍAS (En vidrio ahumado oscuro con perfil minimalista)
  const zMinReturn = Math.min(outerBayZ, innerBayZ);
  const zMaxReturn = Math.max(outerBayZ, innerBayZ);
  const returnDepth = Math.max(0.15, zMaxReturn - zMinReturn);
  const returnCenterZ = (zMinReturn + zMaxReturn) * 0.5;

  const returnGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.030, height, returnDepth),
    materials.balconyDoorGlass
  );
  returnGlass.position.set(cornerX, 0, returnCenterZ);
  group.add(returnGlass);

  const cornerMullion1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.034, height, 0.034),
    materials.slimDoorFrameMetal
  );
  cornerMullion1.position.set(cornerX, 0, zMinReturn);
  group.add(cornerMullion1);

  const cornerMullion2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.034, height, 0.034),
    materials.slimDoorFrameMetal
  );
  cornerMullion2.position.set(cornerX, 0, zMaxReturn);
  group.add(cornerMullion2);

  // 3. BAHÍA CENTRAL SOCIAL DE SALIDA AL BALCÓN (Puertas corredizas de 4 hojas en vidrio ahumado oscuro)
  const innerBayGroup = createMinimalistSlidingDoorAssembly(
    innerBayW,
    height,
    4,
    materials,
    isDuplex
  );
  innerBayGroup.position.set(innerBayX, 0, innerBayZ);
  group.add(innerBayGroup);

  if (isDuplex) {
    const returnTransom1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.052, 0.048, returnDepth + 0.02),
      materials.slimDoorFrameMetal
    );
    returnTransom1.position.set(cornerX, -0.16, returnCenterZ);
    group.add(returnTransom1);

    const returnTransom2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.044, 0.038, returnDepth + 0.02),
      materials.slimDoorFrameMetal
    );
    returnTransom2.position.set(cornerX, 0.24, returnCenterZ);
    group.add(returnTransom2);
  }

  // 4. RETORNO ACRISTALADO CENTRAL EN EL EJE DE INFLEXIÓN EN "S" (Une el Ala Izquierda z=+2.15 con el Ala Derecha z=+1.25 sin huecos)
  if (wingSide === 'right') {
    const centerJoinX = -width * 0.5;
    const centerZMin = 1.25;
    const centerZMax = 2.15;
    const centerDepth = centerZMax - centerZMin;
    const centerZMid = (centerZMin + centerZMax) * 0.5;

    const centerReturnGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.030, height, centerDepth),
      materials.balconyDoorGlass
    );
    centerReturnGlass.position.set(centerJoinX, 0, centerZMid);
    group.add(centerReturnGlass);

    const centerCornerPost1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.034, height, 0.034),
      materials.slimDoorFrameMetal
    );
    centerCornerPost1.position.set(centerJoinX, 0, centerZMin);
    group.add(centerCornerPost1);

    const centerCornerPost2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.034, height, 0.034),
      materials.slimDoorFrameMetal
    );
    centerCornerPost2.position.set(centerJoinX, 0, centerZMax);
    group.add(centerCornerPost2);
  }

  return group;
}

/**
 * Helper para crear una ventana arquitectónica detallada en las fachadas laterales (X- y X+)
 * con Cristal Reflectivo Claro (`architecturalGlass`), brillo especular y profundidad interior sombreada.
 *IMPORTANTE: `winGroup` se posiciona en el lado EXTERIOR (`xSign > 0` en derecha, `xSign < 0` en izquierda)
 * para que el paño blanco macizo (`whiteGroovedCladding`) nunca oculte el cristal.
 */
function addDetailedSideWindow(
  parent: THREE.Group,
  xSign: -1 | 1,
  yPos: number,
  zPos: number,
  winH: number,
  winW: number,
  panes: 1 | 2 | 3,
  hasTransom: boolean,
  materials: SceneMaterials,
  outOffset: number = 0
) {
  const winGroup = new THREE.Group();
  // La cara exterior del muro lateral blanco está en x = xSign * 0.14m.
  // Colocamos winGroup en x = xSign * (0.145 + outOffset) hacia afuera para que el vidrio y su cámara interior sean 100% visibles.
  winGroup.position.set(xSign * (0.145 + outOffset), yPos, zPos);

  const frameDepth = 0.14;
  const frameThickness = 0.082; // Marcos de ventana más robustos que los marcos ultrafinos de las puertas de balcón
  const frameCenterX = xSign * 0.042;

  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameDepth, frameThickness, winW),
    materials.bronzeMetal
  );
  topFrame.position.set(frameCenterX, winH * 0.5 - frameThickness * 0.5, 0);
  winGroup.add(topFrame);

  const botFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameDepth + 0.05, 0.095, winW + 0.06),
    materials.bronzeMetal
  );
  botFrame.position.set(frameCenterX + xSign * 0.015, -winH * 0.5 + 0.0475, 0);
  winGroup.add(botFrame);

  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameDepth, winH, frameThickness),
    materials.bronzeMetal
  );
  leftFrame.position.set(frameCenterX, 0, -winW * 0.5 + frameThickness * 0.5);
  winGroup.add(leftFrame);

  const rightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameDepth, winH, frameThickness),
    materials.bronzeMetal
  );
  rightFrame.position.set(frameCenterX, 0, winW * 0.5 - frameThickness * 0.5);
  winGroup.add(rightFrame);

  if (panes >= 2) {
    for (let p = 1; p < panes; p++) {
      const mz = -winW * 0.5 + (p / panes) * winW;
      const vMullion = new THREE.Mesh(
        new THREE.BoxGeometry(frameDepth, winH - 0.12, 0.068),
        materials.bronzeMetal
      );
      vMullion.position.set(frameCenterX, 0, mz);
      winGroup.add(vMullion);
    }
  }

  if (hasTransom) {
    const hTransom = new THREE.Mesh(
      new THREE.BoxGeometry(frameDepth, 0.062, winW - 0.12),
      materials.bronzeMetal
    );
    hTransom.position.set(frameCenterX, -winH * 0.15, 0);
    winGroup.add(hTransom);
  }

  // Cámara interior sombreada con profundidad óptica (justo delante del paño blanco para evitar que el muro tape el cristal)
  const interiorBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, winH - 0.14, winW - 0.14),
    materials.windowInteriorBacking
  );
  interiorBack.position.x = xSign * 0.014;
  winGroup.add(interiorBack);

  // Paño exterior de Cristal Reflectivo Claro con brillo especular y reflejos de cielo
  const glassPane = new THREE.Mesh(
    new THREE.BoxGeometry(0.028, winH - 0.12, winW - 0.12),
    materials.architecturalGlass
  );
  glassPane.position.x = xSign * 0.048;
  winGroup.add(glassPane);

  // Lámina secundaria de doble acristalamiento (IGU) para acentuar el brillo especular del vidrio
  const innerGlazeHighlight = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, winH - 0.15, winW - 0.15),
    materials.glassBalustrade
  );
  innerGlazeHighlight.position.x = xSign * 0.068;
  winGroup.add(innerGlazeHighlight);

  parent.add(winGroup);
}

/**
 * Helper para crear un Ventanal Plano Arquitectónico al Ras en la Fachada Posterior (Z- / Sin Balcones)
 * con Cristal Reflectivo Claro (`architecturalGlass`), brillo especular y profundidad interior sombreada.
 * IMPORTANTE: En la fachada posterior la cara exterior mira hacia -Z (`z = -0.13m`), por lo que
 * `winGroup` se ubica en `z = -0.145m` hacia afuera para que el muro blanco nunca tape el vidrio.
 */
function addDetailedRearWindow(
  parent: THREE.Group,
  xPos: number,
  yPos: number,
  winW: number,
  winH: number,
  panes: 1 | 2 | 3,
  hasTransom: boolean,
  materials: SceneMaterials
) {
  const winGroup = new THREE.Group();
  winGroup.position.set(xPos, yPos, -0.145);

  const frameDepth = 0.14;
  const frameThickness = 0.082;
  const frameCenterZ = -0.042;

  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(winW, frameThickness, frameDepth),
    materials.bronzeMetal
  );
  topFrame.position.set(0, winH * 0.5 - frameThickness * 0.5, frameCenterZ);
  winGroup.add(topFrame);

  // Vierteaguas / alféizar al ras en aluminio anodizado oscuro
  const botFrame = new THREE.Mesh(
    new THREE.BoxGeometry(winW + 0.08, 0.095, frameDepth + 0.05),
    materials.bronzeMetal
  );
  botFrame.position.set(0, -winH * 0.5 + 0.045, frameCenterZ - 0.015);
  winGroup.add(botFrame);

  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, winH, frameDepth),
    materials.bronzeMetal
  );
  leftFrame.position.set(-winW * 0.5 + frameThickness * 0.5, 0, frameCenterZ);
  winGroup.add(leftFrame);

  const rightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, winH, frameDepth),
    materials.bronzeMetal
  );
  rightFrame.position.set(winW * 0.5 - frameThickness * 0.5, 0, frameCenterZ);
  winGroup.add(rightFrame);

  if (panes >= 2) {
    for (let p = 1; p < panes; p++) {
      const mx = -winW * 0.5 + (p / panes) * winW;
      const vMullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.068, winH - 0.12, frameDepth),
        materials.bronzeMetal
      );
      vMullion.position.set(mx, 0, frameCenterZ);
      winGroup.add(vMullion);
    }
  }

  if (hasTransom) {
    const hTransom = new THREE.Mesh(
      new THREE.BoxGeometry(winW - 0.12, 0.062, frameDepth),
      materials.bronzeMetal
    );
    hTransom.position.set(0, -winH * 0.16, frameCenterZ);
    winGroup.add(hTransom);
  }

  // Cámara interior sombreada con profundidad óptica (justo delante del muro blanco posterior)
  const interiorBack = new THREE.Mesh(
    new THREE.BoxGeometry(winW - 0.14, winH - 0.14, 0.024),
    materials.windowInteriorBacking
  );
  interiorBack.position.z = -0.014;
  winGroup.add(interiorBack);

  // Paño exterior de Cristal Reflectivo Claro con brillo especular y reflejos de cielo
  const glassPane = new THREE.Mesh(
    new THREE.BoxGeometry(winW - 0.12, winH - 0.12, 0.028),
    materials.architecturalGlass
  );
  glassPane.position.z = -0.048;
  winGroup.add(glassPane);

  // Lámina secundaria de doble acristalamiento (IGU)
  const innerGlazeHighlight = new THREE.Mesh(
    new THREE.BoxGeometry(winW - 0.15, winH - 0.15, 0.012),
    materials.glassBalustrade
  );
  innerGlazeHighlight.position.z = -0.068;
  winGroup.add(innerGlazeHighlight);

  parent.add(winGroup);
}

/**
 * ============================================================================
 * FACHADA POSTERIOR DE VENTANALES PLANOS AL RAS (Z- = -5.55m — SIN BALCONES)
 * ============================================================================
 * Fachada 100% plana sin ningún balcón en voladizo: incluye bandas horizontales
 * de losa de entrepiso en concreto visto al ras, pórtico estructural, machones
 * intermedios, canales verticales oscuros y amplios ventanales planos con marcos
 * de aluminio anodizado negro sobre paños blancos con buñas horizontales.
 */
function createRearWindowFacadeSegment(
  floorHeight: number,
  materials: SceneMaterials,
  floorIndex: number,
  isTopLevel: boolean = false
): THREE.Group {
  const group = new THREE.Group();
  // Abarca de x = -11.05m a x = +10.35m (ancho total = 21.40m)

  // 0. Banda Horizontal de Losa de Entrepiso al Ras (marca cada nivel en la fachada plana sin voladizo)
  const flushFloorBand = new THREE.Mesh(
    new THREE.BoxGeometry(21.42, 0.32, 0.56),
    materials.boardFormedConcrete
  );
  flushFloorBand.position.set(-0.35, -floorHeight * 0.5 + 0.16, 0.01);
  flushFloorBand.castShadow = true;
  flushFloorBand.receiveShadow = true;
  group.add(flushFloorBand);

  // Buña oscura horizontal bajo la losa al ras
  const flushReveal = new THREE.Mesh(
    new THREE.BoxGeometry(21.44, 0.04, 0.58),
    materials.bronzeMetal
  );
  flushReveal.position.set(-0.35, -floorHeight * 0.5 + 0.33, 0.0);
  group.add(flushReveal);

  // 1. Pilares Extremos del Pórtico de Concreto Visto (Izquierdo y Derecho)
  const leftCornerPier = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, floorHeight, 0.62),
    materials.boardFormedConcrete
  );
  leftCornerPier.position.set(-10.475, 0, 0);
  leftCornerPier.castShadow = true;
  leftCornerPier.receiveShadow = true;
  group.add(leftCornerPier);

  const rightCornerPier = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, floorHeight, 0.62),
    materials.boardFormedConcrete
  );
  rightCornerPier.position.set(9.775, 0, 0);
  rightCornerPier.castShadow = true;
  rightCornerPier.receiveShadow = true;
  group.add(rightCornerPier);

  // 2. Dos Machones Intermedios de Concreto Visto que enmarcan el núcleo central
  const centerLeftPier = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, floorHeight, 0.58),
    materials.boardFormedConcrete
  );
  centerLeftPier.position.set(-1.65, 0, 0);
  centerLeftPier.castShadow = true;
  group.add(centerLeftPier);

  const centerRightPier = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, floorHeight, 0.58),
    materials.boardFormedConcrete
  );
  centerRightPier.position.set(1.25, 0, 0);
  centerRightPier.castShadow = true;
  group.add(centerRightPier);

  // 3. Cuatro Canales Verticales Hundidos Antracita con Ventanales Planos de Piso a Techo
  const darkChannelsX = [-9.55, -2.32, 1.92, 8.85];
  darkChannelsX.forEach((cx) => {
    const ch = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, floorHeight, 0.34),
      materials.bronzeMetal
    );
    ch.position.set(cx, 0, 0.10);
    group.add(ch);
    addDetailedRearWindow(group, cx, 0.08, 0.56, floorHeight - 0.42, 1, true, materials);
  });

  // 4. Paño Central del Núcleo Vertical (Escalera y Lobby con ventanal plano vertical acristalado)
  const coreBackPanel = new THREE.Mesh(
    new THREE.BoxGeometry(2.22, floorHeight - 0.04, 0.38),
    materials.flutedConcreteMat
  );
  coreBackPanel.position.set(-0.20, 0, 0.06);
  group.add(coreBackPanel);
  addDetailedRearWindow(group, -0.20, 0.08, 1.45, floorHeight - 0.44, 2, true, materials);

  // 5. Gran Paño Blanco con Buñas Horizontales del Ala Izquierda (x = -9.22 a -2.65, ancho = 6.57m)
  const leftWhitePanel = new THREE.Mesh(
    new THREE.BoxGeometry(6.57, floorHeight - 0.04, 0.38),
    materials.whiteGroovedCladding
  );
  leftWhitePanel.position.set(-5.935, 0, 0.06);
  leftWhitePanel.castShadow = true;
  leftWhitePanel.receiveShadow = true;
  group.add(leftWhitePanel);

  // 6. Gran Paño Blanco con Buñas Horizontales del Ala Derecha (x = +2.25 a +8.52, ancho = 6.27m)
  const rightWhitePanel = new THREE.Mesh(
    new THREE.BoxGeometry(6.27, floorHeight - 0.04, 0.38),
    materials.whiteGroovedCladding
  );
  rightWhitePanel.position.set(5.385, 0, 0.06);
  rightWhitePanel.castShadow = true;
  rightWhitePanel.receiveShadow = true;
  group.add(rightWhitePanel);

  // Viga Superior Continua de Coronación del Pórtico Posterior en el nivel Mirador
  if (isTopLevel) {
    const topRearBeam = new THREE.Mesh(
      new THREE.BoxGeometry(21.40, 0.68, 0.64),
      materials.boardFormedConcrete
    );
    topRearBeam.position.set(-0.35, floorHeight * 0.5 - 0.10, 0);
    topRearBeam.castShadow = true;
    group.add(topRearBeam);
  }

  // 7. COMPOSICIÓN DE VENTANALES PLANOS AL RAS EN AMBOS PAÑOS BLANCOS POSTERIORES (6 Niveles)
  if (floorIndex === 0) {
    // PB: Amplios ventanales planos de piso a techo hacia el jardín posterior
    addDetailedRearWindow(group, -7.75, 0.05, 1.75, 2.65, 2, true, materials);
    addDetailedRearWindow(group, -5.80, 0.05, 0.72, 2.65, 1, false, materials);
    addDetailedRearWindow(group, -4.05, 0.05, 1.75, 2.65, 2, true, materials);

    addDetailedRearWindow(group, 3.60, 0.05, 1.70, 2.65, 2, true, materials);
    addDetailedRearWindow(group, 5.40, 0.05, 0.72, 2.65, 1, false, materials);
    addDetailedRearWindow(group, 7.15, 0.05, 1.70, 2.65, 2, true, materials);
  } else if (floorIndex === 1) {
    // P1: Ventanales planos de habitaciones del Dúplex
    addDetailedRearWindow(group, -7.70, 0.16, 1.65, 2.25, 2, true, materials);
    addDetailedRearWindow(group, -5.65, 0.16, 1.45, 2.25, 2, true, materials);
    addDetailedRearWindow(group, -3.85, 0.16, 0.75, 2.25, 1, false, materials);

    addDetailedRearWindow(group, 3.50, 0.16, 0.75, 2.25, 1, false, materials);
    addDetailedRearWindow(group, 5.25, 0.16, 1.45, 2.25, 2, true, materials);
    addDetailedRearWindow(group, 7.15, 0.16, 1.65, 2.25, 2, true, materials);
  } else if (floorIndex === 2 || floorIndex === 3) {
    // P2 y P3: 3 grandes ventanales planos alineados en cada ala
    addDetailedRearWindow(group, -7.75, 0.16, 1.65, 2.30, 2, true, materials);
    addDetailedRearWindow(group, -5.90, 0.16, 1.45, 2.30, 2, true, materials);
    addDetailedRearWindow(group, -4.05, 0.16, 1.65, 2.30, 2, true, materials);

    addDetailedRearWindow(group, 3.60, 0.16, 1.60, 2.30, 2, true, materials);
    addDetailedRearWindow(group, 5.40, 0.16, 1.40, 2.30, 2, true, materials);
    addDetailedRearWindow(group, 7.15, 0.16, 1.60, 2.30, 2, true, materials);
  } else if (floorIndex === 4) {
    // PH Piso Inferior (1ra Planta del Penthouse Dúplex): Amplios ventanales planos sociales y de suite
    addDetailedRearWindow(group, -7.75, 0.14, 1.75, 2.35, 2, true, materials);
    addDetailedRearWindow(group, -5.85, 0.14, 0.72, 2.35, 1, false, materials);
    addDetailedRearWindow(group, -4.05, 0.14, 1.75, 2.35, 2, true, materials);

    addDetailedRearWindow(group, 3.60, 0.14, 1.65, 2.35, 2, true, materials);
    addDetailedRearWindow(group, 5.40, 0.14, 0.72, 2.35, 1, false, materials);
    addDetailedRearWindow(group, 7.15, 0.14, 1.65, 2.35, 2, true, materials);
  } else {
    // PH Piso Superior (2da Planta del Penthouse Dúplex): Ventanales planos de las suites superiores
    addDetailedRearWindow(group, -7.65, 0.08, 1.75, 2.25, 3, true, materials);
    addDetailedRearWindow(group, -5.65, 0.08, 1.45, 2.25, 2, true, materials);
    addDetailedRearWindow(group, -3.85, 0.08, 0.75, 2.25, 1, false, materials);

    addDetailedRearWindow(group, 3.55, 0.08, 0.75, 2.25, 1, false, materials);
    addDetailedRearWindow(group, 5.30, 0.08, 1.45, 2.25, 2, true, materials);
    addDetailedRearWindow(group, 7.10, 0.08, 1.70, 2.25, 3, true, materials);
  }

  return group;
}

/**
 * ============================================================================
 * FACHADAS LATERALES DE ALTA PRECISIÓN (OESTE / IZQUIERDA Y ESTE / DERECHA)
 * ============================================================================
 */
function createLateralFacadeSegment(
  side: 'left' | 'right',
  floorHeight: number,
  materials: SceneMaterials,
  floorIndex: number,
  isTopLevel: boolean = false
): THREE.Group {
  const group = new THREE.Group();

  if (side === 'left') {
    // ========================================================================
    // FACHADA LATERAL IZQUIERDA / OESTE (X = -11.05m — RC-exterior.costado.izquierdo.jpeg)
    // ========================================================================
    const xSign = -1;

    // 1. Pilar Posterior del Pórtico de Concreto Visto Gris (z = -5.60 a -4.25)
    const backPier = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, floorHeight, 1.35),
      materials.boardFormedConcrete
    );
    backPier.position.set(0, 0, -4.925);
    backPier.castShadow = true;
    backPier.receiveShadow = true;
    group.add(backPier);

    // 2. Primera Franja Vertical Hundida Antracita con Ventanales (z = -4.25 a -3.50)
    const backChannel = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, floorHeight, 0.75),
      materials.bronzeMetal
    );
    backChannel.position.set(0.10, 0, -3.875);
    group.add(backChannel);

    addDetailedSideWindow(group, xSign, 0, -3.875, floorHeight - 0.28, 0.65, 1, true, materials);

    // 3. Gran Paño Blanco Marfil con Buñas Horizontales (z = -3.50 a +2.20, ancho = 5.70m)
    const whitePanelW = 5.70;
    const whitePanelCenterZ = -0.65;
    const whitePanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, floorHeight - 0.04, whitePanelW),
      materials.whiteGroovedCladding
    );
    whitePanel.position.set(0.06, 0, whitePanelCenterZ);
    whitePanel.castShadow = true;
    whitePanel.receiveShadow = true;
    group.add(whitePanel);

    // 4. Segunda Franja Vertical Hundida Antracita (z = +2.20 a +2.90)
    const frontChannel = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, floorHeight, 0.70),
      materials.bronzeMetal
    );
    frontChannel.position.set(0.10, 0, 2.55);
    group.add(frontChannel);

    addDetailedSideWindow(group, xSign, 0, 2.55, floorHeight - 0.28, 0.60, 1, true, materials);

    // 5. Franja Vertical Acanalada/Estriada Clara (Fluted Concrete Strip, z = +2.90 a +3.75)
    const flutedStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, floorHeight, 0.85),
      materials.flutedConcreteMat
    );
    flutedStrip.position.set(0.02, 0, 3.325);
    flutedStrip.castShadow = true;
    flutedStrip.receiveShadow = true;
    group.add(flutedStrip);

    // 6. Torre Vertical de Celosías Terracota en Esquina Frontal-Izquierda (z = +3.75 a +5.55)
    const leftCornerLouver = createVerticalTerracottaScreen(
      1.80,
      floorHeight,
      materials,
      10,
      false,
      true
    );
    leftCornerLouver.rotation.y = -Math.PI * 0.5;
    leftCornerLouver.position.set(-0.08, 0, 4.65);
    group.add(leftCornerLouver);

    addDetailedSideWindow(group, xSign, 0, 4.65, floorHeight - 0.35, 1.55, 2, false, materials, -0.18);

    if (isTopLevel) {
      const topFlutedFrieze = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.68, 7.15),
        materials.flutedConcreteMat
      );
      topFlutedFrieze.position.set(0.02, floorHeight * 0.5 - 0.34, -0.675);
      group.add(topFlutedFrieze);

      const topConcreteLintel = new THREE.Mesh(
        new THREE.BoxGeometry(0.58, 0.52, 9.6),
        materials.boardFormedConcrete
      );
      topConcreteLintel.position.set(0, floorHeight * 0.5 + 0.12, -0.8);
      topConcreteLintel.castShadow = true;
      group.add(topConcreteLintel);
    }

    if (floorIndex === 0) {
      addDetailedSideWindow(group, xSign, -0.25, -2.45, 2.35, 1.15, 2, false, materials);
      addDetailedSideWindow(group, xSign, -0.35, 0.85, 2.15, 1.35, 2, false, materials);
    } else if (floorIndex === 1) {
      addDetailedSideWindow(group, xSign, 0.15, -2.35, 1.85, 1.25, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.10, -0.15, 1.75, 1.05, 1, true, materials);
      addDetailedSideWindow(group, xSign, 0.10, 1.15, 1.75, 0.52, 1, false, materials);
    } else if (floorIndex === 2 || floorIndex === 3) {
      addDetailedSideWindow(group, xSign, 0.12, -2.55, 1.85, 1.15, 1, true, materials);
      addDetailedSideWindow(group, xSign, 0.12, -1.15, 1.85, 0.52, 1, false, materials);
      addDetailedSideWindow(group, xSign, 0.12, 0.35, 1.85, 1.35, 2, true, materials);
    } else if (floorIndex === 4) {
      // PH Piso Inferior (1er Piso del Penthouse Dúplex — RC-exterior.costado.izquierdo.jpeg)
      addDetailedSideWindow(group, xSign, -0.10, -2.45, 1.95, 1.08, 2, false, materials);
      addDetailedSideWindow(group, xSign, 0.05, 0.65, 2.10, 1.48, 2, true, materials);
    } else {
      // PH Piso Superior (2do Piso del Penthouse Dúplex — RC-exterior.costado.izquierdo.jpeg)
      addDetailedSideWindow(group, xSign, 0.04, -2.35, 1.85, 1.25, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.04, -0.15, 1.85, 0.98, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.04, 0.95, 1.85, 0.52, 1, false, materials);
    }
  } else {
    // ========================================================================
    // FACHADA LATERAL DERECHA / ESTE (X = +10.35m — LADO DEL PORTÓN, RC-exterior.entrada-costado.jpeg)
    // ========================================================================
    const xSign = 1;

    // 0. PUERTAS CORREDIZAS LATERALES DE SALIDA AL BALCÓN TRAS LA COLUMNA CILÍNDRICA (z = +4.95 a +6.45)
    // En Vidrio Ahumado Oscuro (`balconyDoorGlass`) con perfilería minimalista ultrafina (`slimDoorFrameMetal`) y rieles.
    // Conecta exactamente en (world X = +10.04m, world Z = +6.45m) con el ventanal frontal (`outerBayGroup`) del Ala Derecha.
    const sideBayZCenter = 5.70;
    const sideBayWidth = 1.50;
    const sideBayLocalX = -0.31; // world x = +10.04m, dejando ~1.61m de terraza lateral libre hasta xMax = +11.65m

    const sideBalconySlidingDoor = createMinimalistSlidingDoorAssembly(
      sideBayWidth,
      floorHeight - 0.08,
      2,
      materials,
      false
    );
    sideBalconySlidingDoor.rotation.y = Math.PI * 0.5;
    sideBalconySlidingDoor.position.set(sideBayLocalX, 0, sideBayZCenter);
    group.add(sideBalconySlidingDoor);

    const frontCornerSlimPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, floorHeight - 0.08, 0.036),
      materials.slimDoorFrameMetal
    );
    frontCornerSlimPost.position.set(sideBayLocalX, 0, sideBayZCenter + sideBayWidth * 0.5);
    group.add(frontCornerSlimPost);

    // Friso / losa de entrepiso en concreto visto en los niveles dúplex (PB+P1 y Penthouse, RC-exterior.entrada-costado.jpeg)
    if (floorIndex === 0 || floorIndex === 4) {
      const duplexSpandrel = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.54, sideBayWidth + 0.12),
        materials.boardFormedConcrete
      );
      duplexSpandrel.position.set(sideBayLocalX + 0.04, floorHeight * 0.5 - 0.27, sideBayZCenter);
      duplexSpandrel.castShadow = true;
      duplexSpandrel.receiveShadow = true;
      group.add(duplexSpandrel);
    }

    // 1. Torre Vertical de Celosías Terracota en Esquina Frontal-Derecha (z = +4.95 a +3.55, ancho = 1.40m)
    const rightCornerLouver = createVerticalTerracottaScreen(
      1.40,
      floorHeight,
      materials,
      9,
      false,
      true
    );
    rightCornerLouver.rotation.y = Math.PI * 0.5;
    rightCornerLouver.position.set(0.10, 0, 4.25);
    group.add(rightCornerLouver);

    addDetailedSideWindow(group, xSign, 0, 4.25, floorHeight - 0.30, 1.28, 2, false, materials, -0.18);

    // 2. Franja Vertical Blanca Acanalada entre la Celosía Terracota y el Gran Pilar de Concreto (z = +3.55 a +3.05)
    const frontWhiteStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, floorHeight, 0.52),
      materials.whiteGroovedCladding
    );
    frontWhiteStrip.position.set(-0.03, 0, 3.30);
    frontWhiteStrip.castShadow = true;
    frontWhiteStrip.receiveShadow = true;
    group.add(frontWhiteStrip);

    // 3. GRAN PILAR ESQUINERO DEL PÓRTICO DE CONCRETO VISTO GRIS (z = +3.05 a +1.65, ancho = 1.40m)
    // Sube continuo desde el jardín de PB hasta la viga superior del pórtico en "L" invertida (RC-exterior.entrada-costado.jpeg)
    const topExtraH = isTopLevel ? 0.44 : 0;
    const mainFrontPier = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, floorHeight + topExtraH, 1.40),
      materials.boardFormedConcrete
    );
    mainFrontPier.position.set(0.08, topExtraH * 0.5, 2.35);
    mainFrontPier.castShadow = true;
    mainFrontPier.receiveShadow = true;
    group.add(mainFrontPier);

    // 4. Primera Franja Vertical Hundida Antracita de Ventanas (z = +1.65 a +1.12) — Todas las plantas con cristal reflectivo
    const channel1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, floorHeight, 0.53),
      materials.bronzeMetal
    );
    channel1.position.set(-0.10, 0, 1.385);
    group.add(channel1);

    addDetailedSideWindow(group, xSign, 0, 1.385, floorHeight - 0.22, 0.44, 1, false, materials);

    // 5. PAÑO PRINCIPAL BLANCO CON BUÑAS HORIZONTALES (z = +1.12 a -2.75, ancho = 3.87m)
    const mainWhiteW = 3.87;
    const mainWhiteCenterZ = -0.815;
    const mainWhitePanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, floorHeight - 0.03, mainWhiteW),
      materials.whiteGroovedCladding
    );
    mainWhitePanel.position.set(-0.05, 0, mainWhiteCenterZ);
    mainWhitePanel.castShadow = true;
    mainWhitePanel.receiveShadow = true;
    group.add(mainWhitePanel);

    // 6. MACHÓN INTERMEDIO HUNDIDO DE CONCRETO VISTO + FRANJA VERTICAL OSCURA (z = -2.75 a -3.65)
    const midChannel = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, floorHeight, 0.42),
      materials.bronzeMetal
    );
    midChannel.position.set(-0.10, 0, -2.96);
    group.add(midChannel);
    addDetailedSideWindow(group, xSign, 0, -2.96, floorHeight - 0.22, 0.36, 1, false, materials);

    const midConcretePier = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, floorHeight, 0.52),
      materials.boardFormedConcrete
    );
    midConcretePier.position.set(0.0, 0, -3.41);
    midConcretePier.castShadow = true;
    midConcretePier.receiveShadow = true;
    group.add(midConcretePier);

    // 7. PAÑO POSTERIOR BLANCO CON BUÑAS HORIZONTALES (z = -3.65 a -5.05, ancho = 1.40m)
    const rearWhitePanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, floorHeight - 0.03, 1.40),
      materials.whiteGroovedCladding
    );
    rearWhitePanel.position.set(-0.05, 0, -4.35);
    rearWhitePanel.castShadow = true;
    rearWhitePanel.receiveShadow = true;
    group.add(rearWhitePanel);

    // 8. PILAR POSTERIOR DEL PÓRTICO DE CONCRETO VISTO (z = -5.05 a -5.65)
    const rearPier = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, floorHeight + topExtraH, 0.62),
      materials.boardFormedConcrete
    );
    rearPier.position.set(0.07, topExtraH * 0.5, -5.35);
    rearPier.castShadow = true;
    rearPier.receiveShadow = true;
    group.add(rearPier);

    if (isTopLevel) {
      // Viga Dintel Superior del Gran Pórtico en "L" Invertida de Concreto Visto (z = +3.05 a -5.65, largo = 8.70m)
      const topPortalBeam = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.82, 8.72),
        materials.boardFormedConcrete
      );
      topPortalBeam.position.set(0.08, floorHeight * 0.5 + 0.03, -1.30);
      topPortalBeam.castShadow = true;
      topPortalBeam.receiveShadow = true;
      group.add(topPortalBeam);
    }

    // 9. COMPOSICIÓN EXACTA DE VENTANAS EN LOS 6 PISOS SEGÚN `RC-exterior.entrada-costado.jpeg`
    if (floorIndex === 0) {
      // PB (Nivel Inferior del Dúplex de Jardín):
      addDetailedSideWindow(group, xSign, -0.30, 0.45, 2.15, 1.38, 2, false, materials);
      addDetailedSideWindow(group, xSign, -0.30, -1.35, 2.05, 0.46, 1, false, materials);
      addDetailedSideWindow(group, xSign, -0.30, -1.98, 2.05, 0.46, 1, false, materials);
      addDetailedSideWindow(group, xSign, -0.30, -4.25, 1.95, 0.48, 1, false, materials);
    } else if (floorIndex === 1) {
      // P1 (Nivel Superior del Dúplex de Jardín):
      addDetailedSideWindow(group, xSign, 0.10, -0.95, 1.85, 1.05, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.10, -2.12, 1.85, 0.96, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.10, -4.32, 1.75, 0.52, 1, false, materials);
    } else if (floorIndex === 2 || floorIndex === 3) {
      // P2 y P3: Trío característico de 3 ventanas dobles alineadas + ventana en paño posterior
      addDetailedSideWindow(group, xSign, 0.10, -0.22, 1.85, 0.94, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.10, -1.28, 1.85, 0.88, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.10, -2.22, 1.80, 0.74, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.10, -4.25, 1.80, 0.86, 2, true, materials);
    } else if (floorIndex === 4) {
      // PH Piso Inferior (5to Piso en RC-exterior.entrada-costado.jpeg):
      // Gran ventanal doble que arranca al ras del Gran Pilar de Concreto Visto (z = +1.75 a +0.15)
      // + ventana doble central desplazada + par de ventanas verticales estrechas a la derecha
      addDetailedSideWindow(group, xSign, 0.16, 0.95, 2.12, 1.60, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.04, -0.68, 1.88, 0.98, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.04, -1.84, 1.82, 0.42, 1, false, materials);
      addDetailedSideWindow(group, xSign, 0.04, -2.36, 1.82, 0.42, 1, false, materials);
      addDetailedSideWindow(group, xSign, 0.04, -4.25, 1.82, 0.82, 2, true, materials);
    } else {
      // PH Piso Superior (6to Piso en RC-exterior.entrada-costado.jpeg):
      // Paño blanco macizo a la izquierda + 2 ventanas altas dobles hacia la derecha + ranura vertical en paño posterior
      addDetailedSideWindow(group, xSign, 0.06, -0.78, 1.85, 1.08, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.06, -2.06, 1.85, 0.98, 2, true, materials);
      addDetailedSideWindow(group, xSign, 0.06, -4.35, 1.75, 0.38, 1, false, materials);
    }
  }

  return group;
}

/**
 * ============================================================================
 * PERFIL DE TRANSICIÓN DE VIDRIOS E ILUMINACIÓN SEGÚN HORA SOLAR
 * ============================================================================
 */
const GLASS_PROFILES: Record<
  SolarTimeMode,
  {
    opacity: number;
    color: THREE.Color;
    emissive: THREE.Color;
    emissiveIntensity: number;
    envMapIntensity: number;
    doorOpacity: number;
    doorColor: THREE.Color;
    doorEmissive: THREE.Color;
    doorEmissiveIntensity: number;
    doorEnvMapIntensity: number;
    balustradeOpacity: number;
    balustradeColor: THREE.Color;
    balustradeEmissive: THREE.Color;
    balustradeEmissiveIntensity: number;
    fresnelColor: THREE.Color;
    skyReflectionColor: THREE.Color;
    horizonGlowColor: THREE.Color;
    sunDirection: THREE.Vector3;
    specularStrength: number;
    interiorWarmth: number;
    refractionStrength: number;
    coveEmissive: THREE.Color;
    coveIntensity: number;
    interiorEmissive: THREE.Color;
    interiorIntensity: number;
    waterEmissive: THREE.Color;
    waterIntensity: number;
    poolLedIntensity: number;
    poolMosaicEmissiveIntensity: number;
    woodSoffitEmissive: THREE.Color;
    woodSoffitEmissiveIntensity: number;
  }
> = {
  morning: {
    opacity: 0.78,
    color: new THREE.Color(0xE8F6FF),
    emissive: new THREE.Color(0x1E4668),
    emissiveIntensity: 0.22,
    envMapIntensity: 2.65,
    doorOpacity: 0.80,
    doorColor: new THREE.Color(0xDCF0FC),
    doorEmissive: new THREE.Color(0x1A3D5C),
    doorEmissiveIntensity: 0.20,
    doorEnvMapIntensity: 2.60,
    balustradeOpacity: 0.38,
    balustradeColor: new THREE.Color(0xD8EEF6),
    balustradeEmissive: new THREE.Color(0x000000),
    balustradeEmissiveIntensity: 0.0,
    fresnelColor: new THREE.Color(0xE6F8FF),
    skyReflectionColor: new THREE.Color(0x8CD0F8),
    horizonGlowColor: new THREE.Color(0xF4FAFF),
    sunDirection: new THREE.Vector3(34, 48, 38).normalize(),
    specularStrength: 1.22,
    interiorWarmth: 0.34,
    refractionStrength: 0.46,
    coveEmissive: new THREE.Color(0xFFD28A),
    coveIntensity: 0.35,
    interiorEmissive: new THREE.Color(0xFFB85C),
    interiorIntensity: 0.32,
    waterEmissive: new THREE.Color(0x0A4B5C),
    waterIntensity: 0.25,
    poolLedIntensity: 0.45,
    poolMosaicEmissiveIntensity: 0.18,
    woodSoffitEmissive: new THREE.Color(0x000000),
    woodSoffitEmissiveIntensity: 0.0,
  },
  golden: {
    opacity: 0.76,
    color: new THREE.Color(0xF6E4D2),
    emissive: new THREE.Color(0x7A3B0C),
    emissiveIntensity: 0.44,
    envMapIntensity: 2.85,
    doorOpacity: 0.78,
    doorColor: new THREE.Color(0xEED8C4),
    doorEmissive: new THREE.Color(0x68320A),
    doorEmissiveIntensity: 0.40,
    doorEnvMapIntensity: 2.80,
    balustradeOpacity: 0.35,
    balustradeColor: new THREE.Color(0xF2DEC8),
    balustradeEmissive: new THREE.Color(0x4A2206),
    balustradeEmissiveIntensity: 0.26,
    fresnelColor: new THREE.Color(0xFFD292),
    skyReflectionColor: new THREE.Color(0xEC8E46),
    horizonGlowColor: new THREE.Color(0xFFC068),
    sunDirection: new THREE.Vector3(-48, 16.5, 34).normalize(),
    specularStrength: 1.42,
    interiorWarmth: 0.92,
    refractionStrength: 0.48,
    coveEmissive: new THREE.Color(0xFFB347),
    coveIntensity: 3.8,
    interiorEmissive: new THREE.Color(0xFFA032),
    interiorIntensity: 1.45,
    waterEmissive: new THREE.Color(0x0E5E74),
    waterIntensity: 0.62,
    poolLedIntensity: 2.8,
    poolMosaicEmissiveIntensity: 0.52,
    woodSoffitEmissive: new THREE.Color(0x66340E),
    woodSoffitEmissiveIntensity: 0.26,
  },
  night: {
    opacity: 0.62,
    color: new THREE.Color(0xC2E2FA),
    emissive: new THREE.Color(0xC87822),
    emissiveIntensity: 0.85,
    envMapIntensity: 1.45,
    doorOpacity: 0.66,
    doorColor: new THREE.Color(0xB4D8F4),
    doorEmissive: new THREE.Color(0xB0681C),
    doorEmissiveIntensity: 0.72,
    doorEnvMapIntensity: 1.45,
    balustradeOpacity: 0.26,
    balustradeColor: new THREE.Color(0xFFEDD2),
    balustradeEmissive: new THREE.Color(0x8C4E12),
    balustradeEmissiveIntensity: 0.55,
    fresnelColor: new THREE.Color(0xB8E2FF),
    skyReflectionColor: new THREE.Color(0x3A6898),
    horizonGlowColor: new THREE.Color(0xFFE0B2),
    sunDirection: new THREE.Vector3(18, 42, -28).normalize(),
    specularStrength: 1.02,
    interiorWarmth: 1.45,
    refractionStrength: 0.36,
    coveEmissive: new THREE.Color(0xFFC258),
    coveIntensity: 7.8,
    interiorEmissive: new THREE.Color(0xFFA83E),
    interiorIntensity: 2.85,
    waterEmissive: new THREE.Color(0x16B8D4),
    waterIntensity: 1.45,
    poolLedIntensity: 6.8,
    poolMosaicEmissiveIntensity: 1.15,
    woodSoffitEmissive: new THREE.Color(0x7A4214),
    woodSoffitEmissiveIntensity: 0.48,
  },
};

export function transitionGlassMaterials(
  materials: SceneMaterials,
  mode: SolarTimeMode,
  transitionSpeed: number = 0.12
): boolean {
  const target = GLASS_PROFILES[mode];
  const activeCaracasEnvTex = getCaracasShaderEnvironmentTexture(mode);
  const targetGoldenMix = mode === 'golden' ? 1.0 : 0.0;
  const targetNightMix = mode === 'night' ? 1.0 : 0.0;
  const glass = materials.architecturalGlass;
  const doorGlass = materials.balconyDoorGlass;
  const balustrade = materials.glassBalustrade;
  const cove = materials.coveLed;
  const glow = materials.interiorGlow;
  const water = materials.waterMirror;
  const poolLed = materials.poolUnderwaterLed;
  const poolMosaic = materials.poolMosaicTile;
  const woodSoffit = materials.woodSoffit;

  const t = transitionSpeed >= 1.0 ? 1.0 : Math.max(0.01, Math.min(1.0, transitionSpeed));

  glass.opacity = THREE.MathUtils.lerp(glass.opacity, target.opacity, t);
  glass.color.lerp(target.color, t);
  glass.emissive.lerp(target.emissive, t);
  glass.emissiveIntensity = THREE.MathUtils.lerp(glass.emissiveIntensity, target.emissiveIntensity, t);
  glass.envMapIntensity = THREE.MathUtils.lerp(glass.envMapIntensity, target.envMapIntensity, t);

  if (doorGlass) {
    doorGlass.opacity = THREE.MathUtils.lerp(doorGlass.opacity, target.doorOpacity, t);
    doorGlass.color.lerp(target.doorColor, t);
    doorGlass.emissive.lerp(target.doorEmissive, t);
    doorGlass.emissiveIntensity = THREE.MathUtils.lerp(
      doorGlass.emissiveIntensity,
      target.doorEmissiveIntensity,
      t
    );
    doorGlass.envMapIntensity = THREE.MathUtils.lerp(
      doorGlass.envMapIntensity,
      target.doorEnvMapIntensity,
      t
    );
  }

  balustrade.opacity = THREE.MathUtils.lerp(balustrade.opacity, target.balustradeOpacity, t);
  balustrade.color.lerp(target.balustradeColor, t);
  balustrade.emissive.lerp(target.balustradeEmissive, t);
  balustrade.emissiveIntensity = THREE.MathUtils.lerp(
    balustrade.emissiveIntensity,
    target.balustradeEmissiveIntensity,
    t
  );

  // Sincronización suave de uniforms GLSL (Cross-fade HDRI 2K de Caracas Mañana/Hora Dorada/Noche, refracción y Fresnel)
  [glass, doorGlass, balustrade].forEach((mat) => {
    const u = mat?.userData?.reflectiveGlassUniforms as ReflectiveGlassShaderUniforms | undefined;
    if (u) {
      if (u.uCaracasEnvMap.value !== activeCaracasEnvTex) {
        u.uCaracasEnvMap.value = activeCaracasEnvTex;
      }
      u.uGoldenHourMix.value = THREE.MathUtils.lerp(u.uGoldenHourMix.value, targetGoldenMix, t);
      u.uNightMix.value = THREE.MathUtils.lerp(u.uNightMix.value, targetNightMix, t);
      u.uFresnelColor.value.lerp(target.fresnelColor, t);
      u.uSkyReflectionColor.value.lerp(target.skyReflectionColor, t);
      u.uHorizonGlowColor.value.lerp(target.horizonGlowColor, t);
      u.uSunDirection.value.lerp(target.sunDirection, t).normalize();
      u.uSpecularStrength.value = THREE.MathUtils.lerp(
        u.uSpecularStrength.value,
        target.specularStrength,
        t
      );
      const targetRefract =
        mat === balustrade ? target.refractionStrength + 0.12 : target.refractionStrength;
      u.uRefractionStrength.value = THREE.MathUtils.lerp(
        u.uRefractionStrength.value,
        targetRefract,
        t
      );
      if (mat !== balustrade) {
        u.uInteriorWarmth.value = THREE.MathUtils.lerp(
          u.uInteriorWarmth.value,
          target.interiorWarmth,
          t
        );
      }
    }
  });

  cove.emissive.lerp(target.coveEmissive, t);
  cove.emissiveIntensity = THREE.MathUtils.lerp(cove.emissiveIntensity, target.coveIntensity, t);

  glow.emissive.lerp(target.interiorEmissive, t);
  glow.emissiveIntensity = THREE.MathUtils.lerp(glow.emissiveIntensity, target.interiorIntensity, t);

  if (water) {
    water.emissive.lerp(target.waterEmissive, t);
    water.emissiveIntensity = THREE.MathUtils.lerp(water.emissiveIntensity, target.waterIntensity, t);
  }

  if (poolLed) {
    poolLed.emissiveIntensity = THREE.MathUtils.lerp(poolLed.emissiveIntensity, target.poolLedIntensity, t);
  }

  if (poolMosaic) {
    poolMosaic.emissiveIntensity = THREE.MathUtils.lerp(
      poolMosaic.emissiveIntensity,
      target.poolMosaicEmissiveIntensity,
      t
    );
  }

  if (woodSoffit) {
    woodSoffit.emissive.lerp(target.woodSoffitEmissive, t);
    woodSoffit.emissiveIntensity = THREE.MathUtils.lerp(
      woodSoffit.emissiveIntensity,
      target.woodSoffitEmissiveIntensity,
      t
    );
  }

  return true;
}

/**
 * ============================================================================
 * ENSAMBLAJE INTEGRAL DE LA MAQUETA 3D DE RESIDENCIAS CARONÍ
 * ============================================================================
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
  transitionStep: (mode: SolarTimeMode, deltaFactor?: number) => boolean;
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

  /**
   * Crea una residencia completa por ala (Ala Izquierda = Norte, Ala Derecha = Sur)
   * que abarca desde la fachada principal acristalada con balcones (Z+) hasta la
   * fachada posterior plana de ventanas (Z- = -5.55m).
   */
  const registerFullWingResidence = (
    unitId: string,
    x: number,
    y: number,
    w: number,
    h: number,
    parentGroup: THREE.Group,
    isDuplex: boolean = false
  ) => {
    const d = 9.8; // Abarca de z = -5.2m (fachada posterior) a z = +4.6m (ventanal hacia terraza Z+)
    const zCenter = -0.3;
    const unitGroup = new THREE.Group();
    unitGroup.position.set(x, y, zCenter);
    const wingSide: 'left' | 'right' = x < 0 ? 'left' : 'right';

    // 1. Tabiquería interior arquitectónica seleccionable (visible en Despiece Vertical y a través del vidrio)
    const coreMat = materials.alabaster.clone();

    // Muro interior divisor de habitaciones posteriores
    const rearRoomsWall = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.25, h - 0.16, 0.28),
      coreMat
    );
    rearRoomsWall.position.set(0, 0, -1.65);
    rearRoomsWall.castShadow = true;
    rearRoomsWall.receiveShadow = true;
    (rearRoomsWall as any).userData = { unitId };
    unitGroup.add(rearRoomsWall);

    // Tabique longitudinal que separa las suites y baños
    const longPartition = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, h - 0.16, d - 0.8),
      coreMat
    );
    longPartition.position.set(wingSide === 'left' ? -0.55 : 0.55, 0, -0.35);
    longPartition.castShadow = true;
    (longPartition as any).userData = { unitId };
    unitGroup.add(longPartition);

    // Segundo tabique transversal hacia la zona social
    const midWall = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.48, h - 0.16, 0.24),
      coreMat
    );
    midWall.position.set(wingSide === 'left' ? -w * 0.24 : w * 0.24, 0, 1.15);
    (midWall as any).userData = { unitId };
    unitGroup.add(midWall);

    // Volumen interno para garantizar selección limpia por clic/hover desde cualquier ángulo
    const hitVolume = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.2, h - 0.14, d - 0.4),
      coreMat
    );
    hitVolume.scale.set(0.90, 0.90, 0.68);
    hitVolume.position.set(0, 0, -0.6);
    (hitVolume as any).userData = { unitId };
    unitGroup.add(hitVolume);

    if (unitMeshesMap[unitId]) {
      unitMeshesMap[unitId].push(rearRoomsWall, longPartition, midWall, hitVolume);
    }

    // 2. Losa de piso interior y plafón luminoso cálido (extendidos hasta el ventanal escalonado frontal Z+)
    const floorSlab = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.08, 0.18, d + 2.2),
      materials.interiorFloor
    );
    floorSlab.position.set(0, -h * 0.5 + 0.09, 0.85);
    (floorSlab as any).userData = { unitId };
    unitGroup.add(floorSlab);

    const ceilingGlow = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.90, 0.08, d * 0.82 + 1.6),
      materials.interiorGlow
    );
    ceilingGlow.position.set(0, h * 0.5 - 0.10, 0.75);
    unitGroup.add(ceilingGlow);

    // Pared interior revestida en listones de madera cálida (como en el corte perspectivado)
    const woodFeatureWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, h - 0.24, d * 0.78),
      materials.woodSoffit
    );
    woodFeatureWall.position.set(wingSide === 'left' ? -w * 0.46 : w * 0.46, 0, 0.2);
    unitGroup.add(woodFeatureWall);

    // 3. Mobiliario social delantero (hacia el ventanal Z+) y camas en las suites posteriores (hacia Z-)
    const sofa = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.48, 0.95),
      materials.furnitureFabric
    );
    sofa.position.set(wingSide === 'left' ? -w * 0.22 : w * 0.22, -h * 0.5 + 0.34, d * 0.28);
    unitGroup.add(sofa);

    const diningX = wingSide === 'left' ? w * 0.22 : -w * 0.22;
    const diningTable = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.52, 0.98),
      materials.furnitureWood
    );
    diningTable.position.set(diningX, -h * 0.5 + 0.36, d * 0.28);
    unitGroup.add(diningTable);

    // Lámpara colgante semiesférica negra sobre el comedor
    const domeGeo = new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const domeLamp = new THREE.Mesh(domeGeo, materials.bronzeMetal);
    domeLamp.position.set(diningX, -h * 0.5 + 1.85, d * 0.28);
    unitGroup.add(domeLamp);

    // Camas en las habitaciones posteriores (visibles en Despiece Vertical como en Axonometric...142207.jpg)
    const bedMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.42, 2.05),
      materials.furnitureFabric
    );
    bedMesh.position.set(wingSide === 'left' ? -w * 0.24 : w * 0.24, -h * 0.5 + 0.30, -d * 0.32);
    unitGroup.add(bedMesh);

    if (isDuplex) {
      // ======================================================================
      // ARQUITECTURA INTERNA DE DOBLE PISO (PLANTA BAJA DÚPLEX Y PENTHOUSE DÚPLEX)
      // Basado en `RC-exterior.PB-patio.jpeg` y `RC-exterior.ventanal-PH.jpeg`:
      // - Losa completa de entrepiso (2do Piso) sobre toda la mitad posterior (habitaciones)
      //   y sobre la bahía lateral exterior (`outerBay`), dejando el gran vacío de doble altura
      //   sobre el salón-comedor principal frente al ventanal en zig-zag.
      // ======================================================================
      const outerMezzW = w * 0.48;
      const outerMezzX = wingSide === 'left' ? -w * 0.5 + outerMezzW * 0.5 : w * 0.5 - outerMezzW * 0.5;
      const innerVoidX = wingSide === 'left' ? w * 0.5 - w * 0.26 : -w * 0.5 + w * 0.26;

      // 1. Losa del 2do Piso en la bahía lateral delantera (conecta con el friso de concreto visto del ventanal)
      const frontOuterMezzSlab = new THREE.Mesh(
        new THREE.BoxGeometry(outerMezzW, 0.28, d * 0.92 + 1.8),
        materials.boardFormedConcrete
      );
      frontOuterMezzSlab.position.set(outerMezzX, 0.05, 0.95);
      frontOuterMezzSlab.castShadow = true;
      frontOuterMezzSlab.receiveShadow = true;
      (frontOuterMezzSlab as any).userData = { unitId };
      unitGroup.add(frontOuterMezzSlab);

      // 2. Losa del 2do Piso en toda la mitad posterior (donde están las suites y el Family Room del Piso Superior)
      const rearSecondFloorSlab = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.16, 0.28, d * 0.54),
        materials.boardFormedConcrete
      );
      rearSecondFloorSlab.position.set(0, 0.05, -d * 0.21);
      rearSecondFloorSlab.castShadow = true;
      rearSecondFloorSlab.receiveShadow = true;
      (rearSecondFloorSlab as any).userData = { unitId };
      unitGroup.add(rearSecondFloorSlab);

      // Piso acabado del 2do nivel sobre la mezzanine
      const upperFloorFinish = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.22, 0.05, d * 0.52),
        materials.interiorFloor
      );
      upperFloorFinish.position.set(0, 0.21, -d * 0.21);
      unitGroup.add(upperFloorFinish);

      // Plafón luminoso cálido del 1er Piso (bajo la losa del 2do Piso, para que ambos niveles brillen por separado)
      const firstFloorCeilingGlow = new THREE.Mesh(
        new THREE.BoxGeometry(outerMezzW * 0.86, 0.05, d * 0.84 + 1.6),
        materials.interiorGlow
      );
      firstFloorCeilingGlow.position.set(outerMezzX, -0.11, 0.85);
      unitGroup.add(firstFloorCeilingGlow);

      // Líneas LED empotradas en el techo del 1er Piso y 2do Piso (visibles en RC-exterior.PB-patio.jpeg)
      [-0.85, 0.85].forEach((stripOffset) => {
        const ledStripLower = new THREE.Mesh(
          new THREE.BoxGeometry(outerMezzW * 0.72, 0.025, 0.06),
          materials.coveLed
        );
        ledStripLower.position.set(outerMezzX, -0.13, 1.4 + stripOffset);
        unitGroup.add(ledStripLower);

        const ledStripUpper = new THREE.Mesh(
          new THREE.BoxGeometry(outerMezzW * 0.72, 0.025, 0.06),
          materials.coveLed
        );
        ledStripUpper.position.set(outerMezzX, h * 0.5 - 0.14, 1.4 + stripOffset);
        unitGroup.add(ledStripUpper);
      });

      // 3. Baranda de cristal templado en "L" bordeando el vacío de doble altura en el 2do Piso
      const longBalustrade = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.92, d * 0.42),
        materials.glassBalustrade
      );
      longBalustrade.position.set(wingSide === 'left' ? -w * 0.02 : w * 0.02, 0.64, d * 0.24);
      unitGroup.add(longBalustrade);

      const transBalustrade = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.50, 0.92, 0.04),
        materials.glassBalustrade
      );
      transBalustrade.position.set(innerVoidX, 0.64, 0.55);
      unitGroup.add(transBalustrade);

      // Pasamanos superior de bronce oscuro en la mezzanine del 2do Piso
      const handrailTrans = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.50, 0.05, 0.07),
        materials.bronzeMetal
      );
      handrailTrans.position.set(innerVoidX, 1.11, 0.55);
      unitGroup.add(handrailTrans);

      // 4. Los 4 paneles horizontales de arte en relieve de madera sobre el muro blanco de doble altura
      // (Exactamente como se aprecia a través del ventanal en RC-exterior.ventanal-PH.jpeg)
      const artWallX = wingSide === 'left' ? w * 0.44 : -w * 0.44;
      for (let band = 0; band < 4; band++) {
        const bandY = -h * 0.24 + band * 0.72;
        const woodArtPanel = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.36, 2.25),
          materials.woodSoffit
        );
        woodArtPanel.position.set(artWallX, bandY, 2.65);
        unitGroup.add(woodArtPanel);
      }

      // 5. Mobiliario del 2do Piso (Camas en las suites altas y sofá de Family Room en la mezzanine)
      const upperBedMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.85, 0.42, 2.05),
        materials.furnitureFabric
      );
      upperBedMesh.position.set(wingSide === 'left' ? w * 0.22 : -w * 0.22, 0.42, -d * 0.30);
      unitGroup.add(upperBedMesh);

      const upperLoungeSofa = new THREE.Mesh(
        new THREE.BoxGeometry(1.95, 0.44, 0.88),
        materials.furnitureFabric
      );
      upperLoungeSofa.position.set(outerMezzX, 0.42, 2.15);
      unitGroup.add(upperLoungeSofa);

      // 6. Escalera interior escultórica conectando el Piso 1 y el Piso 2 del Dúplex
      const stairGroup = new THREE.Group();
      stairGroup.position.set(0, -h * 0.5 + 0.22, 0.45);
      for (let s = 0; s < 12; s++) {
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.05, 0.08, 0.28),
          materials.furnitureWood
        );
        stepMesh.position.set(0, s * 0.32, (s - 5.5) * 0.24);
        stairGroup.add(stepMesh);
      }
      unitGroup.add(stairGroup);
    }

    // 4. Ventanal escalonado en zig-zag con esquinas de vidrio a 90° en el frente (Z+)
    const steppedCurtainWall = createSteppedUnitCurtainWall(
      w,
      h - 0.14,
      materials,
      isDuplex,
      wingSide
    );
    steppedCurtainWall.position.set(0, 0, d * 0.5 - 0.15);
    unitGroup.add(steppedCurtainWall);

    parentGroup.add(unitGroup);
  };

  /**
   * 5 Columnas Cilíndricas Monumentales de Concreto Visto (Ø 0.62m) en la Fachada Principal (Z+)
   * + 2 Columnas Cilíndricas Interiores visibles tras el ventanal (RC-exterior.frontal.jpeg y RC-exterior.PB-patio.jpeg):
   * - Columna 1 (Extremo Izquierdo bajo curva del balcón): x = -9.55, z = +8.85
   * - Columna 2 (Flanco Izquierdo de la 1ra Celosía Terracota): x = -4.10, z = +9.62
   * - Columna 3 (Flanco Derecho de la 1ra Celosía Terracota, inicio de la curva en "S"): x = -1.05, z = +9.62
   * - Columna 4 (Flanco Derecho de la 2da Celosía Terracota, tras la curva en "S"): x = +4.68, z = +7.52
   * - Columna 5 (Extremo Derecho bajo el balcón derecho): x = +8.55, z = +7.42
   */
  const addMonumentalCylindricalColumns = (
    levelGroup: THREE.Group,
    yCenter: number,
    height: number,
    isTopPenthouse: boolean = false
  ) => {
    const colRadius = 0.30;
    const seamRingGeo = new THREE.CylinderGeometry(colRadius + 0.008, colRadius + 0.008, 0.025, 32);

    const frontCols = [
      { x: -9.45, z: 9.25, topExtra: 1.15 },
      { x: -4.10, z: 10.38, topExtra: 0.98 },
      { x: -1.10, z: 10.42, topExtra: 0.92 },
      { x: 4.68, z: 7.08, topExtra: 0.48 },
      { x: 10.05, z: 7.55, topExtra: 0.48 },
    ];

    frontCols.forEach((pos) => {
      const actualH = isTopPenthouse ? height + pos.topExtra : height;
      const actualY = isTopPenthouse ? yCenter + pos.topExtra * 0.5 : yCenter;
      const colGeo = new THREE.CylinderGeometry(colRadius, colRadius, actualH, 32);
      const col = new THREE.Mesh(colGeo, materials.boardFormedConcrete);
      col.position.set(pos.x, actualY, pos.z);
      col.castShadow = true;
      col.receiveShadow = true;
      levelGroup.add(col);

      const numRings = Math.max(2, Math.floor(actualH / 1.20));
      for (let r = 1; r < numRings; r++) {
        const ringY = actualY - actualH * 0.5 + (r / numRings) * actualH;
        const seamRing = new THREE.Mesh(seamRingGeo, materials.concreteSlab);
        seamRing.position.set(pos.x, ringY, pos.z);
        levelGroup.add(seamRing);
      }
    });

    // Columnas cilíndricas interiores visibles a través de los ventanales (RC-exterior.PB-patio.jpeg y RC-exterior.ventanal-PH.jpeg)
    const interiorColRadius = 0.25;
    const interiorColGeo = new THREE.CylinderGeometry(interiorColRadius, interiorColRadius, height - 0.1, 24);
    [
      { x: -2.60, z: 3.40 },
      { x: 3.60, z: 2.90 },
    ].forEach((ipos) => {
      const intCol = new THREE.Mesh(interiorColGeo, materials.boardFormedConcrete);
      intCol.position.set(ipos.x, yCenter, ipos.z);
      intCol.castShadow = true;
      levelGroup.add(intCol);
    });
  };

  /**
   * Las 2 Torres Verticales de Celosías Brise-Soleil en Terracota de la Fachada Principal (Z+)
   * Exactamente enmarcadas por las columnas cilíndricas como en `RC-exterior.frontal.jpeg`:
   * 1. Primera Torre Frontal: encajada entre Columna 2 (x = -4.10) y Columna 3 (x = -1.10) -> centro x = -2.60, z = +10.38
   * 2. Segunda Torre Frontal: junto al flanco izquierdo de la Columna 4 (x = +4.68) -> centro x = +3.35, z = +7.05
   */
  const addFacadeTerracottaSpines = (
    levelGroup: THREE.Group,
    yCenter: number,
    height: number,
    levelOffset: number = 0,
    isTopPenthouse: boolean = false
  ) => {
    const leftH = isTopPenthouse ? height + 0.90 : height;
    const leftY = isTopPenthouse ? yCenter + 0.45 : yCenter;
    const frontLeftCenterScreen = createVerticalTerracottaScreen(
      2.45,
      leftH,
      materials,
      13,
      true,
      true
    );
    frontLeftCenterScreen.position.set(-2.60, leftY, 10.36 + levelOffset * 0.18);
    levelGroup.add(frontLeftCenterScreen);

    const rightH = isTopPenthouse ? height + 0.42 : height;
    const rightY = isTopPenthouse ? yCenter + 0.21 : yCenter;
    const frontRightCenterScreen = createVerticalTerracottaScreen(
      2.05,
      rightH,
      materials,
      11,
      true,
      true
    );
    frontRightCenterScreen.position.set(3.35, rightY, 7.05 + levelOffset * 0.16);
    levelGroup.add(frontRightCenterScreen);
  };

  /**
   * Núcleo central de circulación vertical (ascensores y escalera presurizada)
   */
  const addCentralCoreWithStaircase = (
    levelGroup: THREE.Group,
    yCenter: number,
    height: number
  ) => {
    const coreGroup = new THREE.Group();
    coreGroup.position.set(-0.2, yCenter, -0.8);

    const leftCoreWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, height, 4.4),
      materials.boardFormedConcrete
    );
    leftCoreWall.position.x = -1.45;
    coreGroup.add(leftCoreWall);

    const rightCoreWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, height, 4.4),
      materials.boardFormedConcrete
    );
    rightCoreWall.position.x = 1.45;
    coreGroup.add(rightCoreWall);

    const coreInteriorBacking = new THREE.Mesh(
      new THREE.BoxGeometry(2.56, height - 0.14, 0.024),
      materials.windowInteriorBacking
    );
    coreInteriorBacking.position.z = 2.11;
    coreGroup.add(coreInteriorBacking);

    const coreGlass = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, height - 0.1, 0.04),
      materials.architecturalGlass
    );
    coreGlass.position.z = 2.15;
    coreGroup.add(coreGlass);

    const coreIguHighlight = new THREE.Mesh(
      new THREE.BoxGeometry(2.56, height - 0.14, 0.014),
      materials.glassBalustrade
    );
    coreIguHighlight.position.z = 2.18;
    coreGroup.add(coreIguHighlight);

    // Perfilería de muro cortina en las ventanas del núcleo central
    [-1.26, 0, 1.26].forEach((mx) => {
      const coreMullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.068, height - 0.08, 0.14),
        materials.bronzeMetal
      );
      coreMullion.position.set(mx, 0, 2.15);
      coreGroup.add(coreMullion);
    });
    const coreTopBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.075, 0.15),
      materials.bronzeMetal
    );
    coreTopBar.position.set(0, height * 0.5 - 0.05, 2.15);
    coreGroup.add(coreTopBar);

    const coreBotBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.075, 0.15),
      materials.bronzeMetal
    );
    coreBotBar.position.set(0, -height * 0.5 + 0.05, 2.15);
    coreGroup.add(coreBotBar);

    for (let s = 0; s < 9; s++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 0.12, 0.32),
        materials.boardFormedConcrete
      );
      step.position.set(-0.45, -height * 0.5 + 0.3 + s * (height / 10), -1.2 + s * 0.32);
      coreGroup.add(step);
    }

    levelGroup.add(coreGroup);
  };

  // ==========================================================================
  // 1. NIVEL SÓTANO CON LAS 4 PAREDES CUBIERTAS + 2 PISCINAS FRONTALES + ACCESO LATERAL
  // ==========================================================================
  const sotanoGroup = levelGroups.sotano;

  // Losa Inferior de Sótano 2 (y = -4.05m)
  const basementFloorGeo = new THREE.BoxGeometry(34.0, 0.45, 28.0);
  const basementFloor = new THREE.Mesh(basementFloorGeo, materials.podiumStone);
  basementFloor.position.set(0, -4.05, 0);
  basementFloor.receiveShadow = true;
  sotanoGroup.add(basementFloor);

  // Losa Intermedia de Sótano 1 (Mezzanine de estacionamiento)
  const midBasementSlab = new THREE.Mesh(
    new THREE.BoxGeometry(25.0, 0.28, 22.0),
    materials.concreteSlab
  );
  midBasementSlab.position.set(-3.2, -2.05, 0.0);
  midBasementSlab.receiveShadow = true;
  sotanoGroup.add(midBasementSlab);

  /**
   * Construye cada una de las 4 Paredes Ciegas Perimetrales del Estacionamiento (Sótano)
   * combinando un zócalo y contrafuertes en Revestimiento de Piedra Laja Partida (`parkingSplitStone`)
   * con paneles modulares de Concreto Visto Encofrado en Tablas (`parkingBoardConcrete`),
   * buñas de dilatación profundas, machones estructurales y albardilla de coronación.
   */
  const createDetailedParkingRetainingWall = (
    length: number,
    height: number,
    thickness: number,
    axis: 'x' | 'z',
    outwardSign: -1 | 1
  ): THREE.Group => {
    const wallGroup = new THREE.Group();

    const plinthH = 1.45;
    const upperConcreteH = height - plinthH;

    // 1. Cuerpo principal superior en Concreto Visto Encofrado en Tablas con conos de anclaje
    const concreteBodyGeo =
      axis === 'x'
        ? new THREE.BoxGeometry(length, upperConcreteH, thickness)
        : new THREE.BoxGeometry(thickness, upperConcreteH, length);
    const concreteBody = new THREE.Mesh(concreteBodyGeo, materials.parkingBoardConcrete);
    concreteBody.position.y = -height * 0.5 + plinthH + upperConcreteH * 0.5;
    concreteBody.castShadow = true;
    concreteBody.receiveShadow = true;
    wallGroup.add(concreteBody);

    // 2. Zócalo Inferior Estructural en Revestimiento de Piedra Laja / Basalto Partido
    const stonePlinthThickness = thickness + 0.14;
    const stonePlinthGeo =
      axis === 'x'
        ? new THREE.BoxGeometry(length + 0.14, plinthH, stonePlinthThickness)
        : new THREE.BoxGeometry(stonePlinthThickness, plinthH, length + 0.14);
    const stonePlinth = new THREE.Mesh(stonePlinthGeo, materials.parkingSplitStone);
    stonePlinth.position.y = -height * 0.5 + plinthH * 0.5;
    if (axis === 'x') {
      stonePlinth.position.z = outwardSign * 0.05;
    } else {
      stonePlinth.position.x = outwardSign * 0.05;
    }
    stonePlinth.castShadow = true;
    stonePlinth.receiveShadow = true;
    wallGroup.add(stonePlinth);

    // Cornisa / goterón intermedio de transición entre el zócalo de piedra y el concreto visto
    const transitionLedgeGeo =
      axis === 'x'
        ? new THREE.BoxGeometry(length + 0.22, 0.12, thickness + 0.22)
        : new THREE.BoxGeometry(thickness + 0.22, 0.12, length + 0.22);
    const transitionLedge = new THREE.Mesh(transitionLedgeGeo, materials.boardFormedConcrete);
    transitionLedge.position.y = -height * 0.5 + plinthH + 0.04;
    if (axis === 'x') {
      transitionLedge.position.z = outwardSign * 0.06;
    } else {
      transitionLedge.position.x = outwardSign * 0.06;
    }
    transitionLedge.castShadow = true;
    wallGroup.add(transitionLedge);

    // 3. Albardilla / Cornisa Superior de Coronación en Concreto Visto (en el borde del Nivel 0.00)
    const topCopingGeo =
      axis === 'x'
        ? new THREE.BoxGeometry(length + 0.28, 0.22, thickness + 0.26)
        : new THREE.BoxGeometry(thickness + 0.26, 0.22, length + 0.28);
    const topCoping = new THREE.Mesh(topCopingGeo, materials.boardFormedConcrete);
    topCoping.position.y = height * 0.5 - 0.06;
    if (axis === 'x') {
      topCoping.position.z = outwardSign * 0.06;
    } else {
      topCoping.position.x = outwardSign * 0.06;
    }
    topCoping.castShadow = true;
    topCoping.receiveShadow = true;
    wallGroup.add(topCoping);

    // 4. Machones / Pilastras Modulares alternando Concreto Visto y Revestimiento de Piedra + Buñas Verticales
    const numBays = Math.max(4, Math.round(length / 5.4));
    const baySpan = (length - 1.2) / numBays;
    for (let i = 0; i <= numBays; i++) {
      const offsetPos = -length * 0.5 + 0.6 + i * baySpan;
      const isCornerOrAlternate = i === 0 || i === numBays || i % 2 === 0;
      const pilasterW = isCornerOrAlternate ? 0.68 : 0.42;
      const pilasterDepth = thickness + 0.18;
      const pilasterMat =
        i === 0 || i === numBays ? materials.parkingSplitStone : materials.parkingBoardConcrete;

      const pilasterGeo =
        axis === 'x'
          ? new THREE.BoxGeometry(pilasterW, height - 0.14, pilasterDepth)
          : new THREE.BoxGeometry(pilasterDepth, height - 0.14, pilasterW);
      const pilaster = new THREE.Mesh(pilasterGeo, pilasterMat);
      if (axis === 'x') {
        pilaster.position.set(offsetPos, -0.04, outwardSign * 0.06);
      } else {
        pilaster.position.set(outwardSign * 0.06, -0.04, offsetPos);
      }
      pilaster.castShadow = true;
      pilaster.receiveShadow = true;
      wallGroup.add(pilaster);

      // Buñas verticales oscuras de dilatación entre paños de concreto visto
      if (i < numBays) {
        const midJointPos = offsetPos + baySpan * 0.5;
        const jointGeo =
          axis === 'x'
            ? new THREE.BoxGeometry(0.06, upperConcreteH - 0.16, thickness + 0.06)
            : new THREE.BoxGeometry(thickness + 0.06, upperConcreteH - 0.16, 0.06);
        const jointMesh = new THREE.Mesh(jointGeo, materials.bronzeMetal);
        const jointY = -height * 0.5 + plinthH + upperConcreteH * 0.5;
        if (axis === 'x') {
          jointMesh.position.set(midJointPos, jointY, outwardSign * 0.02);
        } else {
          jointMesh.position.set(outwardSign * 0.02, jointY, midJointPos);
        }
        wallGroup.add(jointMesh);
      }
    }

    // 5. Buña Horizontal Intermedia de Encofrado en el paño de Concreto Visto
    const horizRevealGeo =
      axis === 'x'
        ? new THREE.BoxGeometry(length - 0.2, 0.05, thickness + 0.06)
        : new THREE.BoxGeometry(thickness + 0.06, 0.05, length - 0.2);
    const horizReveal = new THREE.Mesh(horizRevealGeo, materials.bronzeMetal);
    horizReveal.position.y = -height * 0.5 + plinthH + upperConcreteH * 0.52;
    if (axis === 'x') {
      horizReveal.position.z = outwardSign * 0.02;
    } else {
      horizReveal.position.x = outwardSign * 0.02;
    }
    wallGroup.add(horizReveal);

    return wallGroup;
  };

  // LAS 4 PAREDES CIEGAS DEL ESTACIONAMIENTO CON ACABADO DE CONCRETO VISTO Y REVESTIMIENTO DE PIEDRA
  // 1. Pared Ciega Posterior del Estacionamiento (Z- = -13.76m)
  const backBasementWall = createDetailedParkingRetainingWall(34.0, 3.88, 0.48, 'x', -1);
  backBasementWall.position.set(0, -1.92, -13.76);
  sotanoGroup.add(backBasementWall);

  // 2. Pared Ciega Frontal del Estacionamiento (Z+ = +13.76m)
  const frontBasementWall = createDetailedParkingRetainingWall(34.0, 3.88, 0.48, 'x', 1);
  frontBasementWall.position.set(0, -1.92, 13.76);
  sotanoGroup.add(frontBasementWall);

  // 3. Pared Ciega Izquierda del Estacionamiento (X- = -16.76m)
  const leftBasementWall = createDetailedParkingRetainingWall(28.0, 3.88, 0.48, 'z', -1);
  leftBasementWall.position.set(-16.76, -1.92, 0);
  sotanoGroup.add(leftBasementWall);

  // 4. Pared Ciega Derecha del Estacionamiento (X+ = +16.76m)
  const rightBasementWall = createDetailedParkingRetainingWall(28.0, 3.88, 0.48, 'z', 1);
  rightBasementWall.position.set(16.76, -1.92, 0);
  sotanoGroup.add(rightBasementWall);

  // Rampa Vehicular Interna que desciende desde el portón perimetral derecho (X+ = +13.85m) hacia el sótano
  const internalRamp = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.30, 12.5),
    materials.parkingBoardConcrete
  );
  internalRamp.position.set(12.3, -1.85, 0.5);
  internalRamp.rotation.x = -0.26;
  internalRamp.castShadow = true;
  sotanoGroup.add(internalRamp);

  const rampSupportWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 3.6, 12.5),
    materials.parkingBoardConcrete
  );
  rampSupportWall.position.set(10.2, -1.95, 0.5);
  sotanoGroup.add(rampSupportWall);

  // Demarcación de líneas blancas de puestos de estacionamiento
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xEAE6DF });
  for (let px = -13.0; px <= 6.5; px += 2.85) {
    const stallLineLower = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 4.8), lineMat);
    stallLineLower.position.set(px, -3.81, -5.5);
    sotanoGroup.add(stallLineLower);

    const stallLineLowerFront = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 4.8), lineMat);
    stallLineLowerFront.position.set(px, -3.81, 5.5);
    sotanoGroup.add(stallLineLowerFront);

    if (px < 5.5) {
      const stallLineUpper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 4.8), lineMat);
      stallLineUpper.position.set(px, -1.90, -5.5);
      sotanoGroup.add(stallLineUpper);
    }
  }

  // Columnas cilíndricas estructurales del estacionamiento subterráneo
  const basementColGeo = new THREE.CylinderGeometry(0.30, 0.30, 3.85, 20);
  for (let bx = -11.5; bx <= 11.5; bx += 5.75) {
    for (let bz = -8.5; bz <= 8.5; bz += 5.65) {
      const bCol = new THREE.Mesh(basementColGeo, materials.parkingBoardConcrete);
      bCol.position.set(bx, -1.95, bz);
      bCol.castShadow = true;
      sotanoGroup.add(bCol);
    }
  }

  // Vehículos estacionados dentro del sótano (visibles en modo Despiece Vertical)
  const carPositions = [
    { x: -10.1, y: -3.55, z: -5.5, color: 0xEAE8E2 },
    { x: -4.4, y: -3.55, z: -5.5, color: 0x1E2226 },
    { x: 1.3, y: -3.55, z: -5.5, color: 0xD2CFC8 },
    { x: -7.2, y: -3.55, z: 5.5, color: 0x2C3038 },
    { x: -7.2, y: -1.65, z: -5.5, color: 0xF0EEE9 },
    { x: -1.5, y: -1.65, z: -5.5, color: 0x26292E },
  ];
  carPositions.forEach((cp) => {
    const carGroup = new THREE.Group();
    carGroup.position.set(cp.x, cp.y, cp.z);
    const carMat = new THREE.MeshStandardMaterial({
      color: cp.color,
      roughness: 0.20,
      metalness: 0.65,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.50, 4.25), carMat);
    body.position.y = 0.34;
    carGroup.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.52, 0.40, 2.15),
      materials.architecturalGlass
    );
    cabin.position.set(0, 0.75, -0.15);
    carGroup.add(cabin);
    sotanoGroup.add(carGroup);
  });

  // Losa Superior del Podio en Nivel 0.00:
  // - Jardín continuo de grama natural (`groundDeck`, de x = -16.8m hasta el muro perimetral del Portón en x = +13.90m)
  // - Calzada asfaltada exterior fuera del lindero (`eastStreetSlab`, de x = +13.90m a x = +17.10m)
  const groundDeckGeo = new THREE.BoxGeometry(30.70, 0.40, 28.0);
  const groundDeck = new THREE.Mesh(groundDeckGeo, materials.lawnGrassMat);
  groundDeck.position.set(-1.45, -0.20, 0);
  groundDeck.receiveShadow = true;
  sotanoGroup.add(groundDeck);

  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x2E3033,
    roughness: 0.88,
    metalness: 0.05,
  });
  const eastStreetSlab = new THREE.Mesh(
    new THREE.BoxGeometry(3.20, 0.40, 28.0),
    asphaltMat
  );
  eastStreetSlab.position.set(15.50, -0.20, 0);
  eastStreetSlab.receiveShadow = true;
  sotanoGroup.add(eastStreetSlab);

  // Terraza de Piso de Granito Gris con Esquina Curva en PB bajo los balcones (Z+)
  const pbPatioPts = buildContinuousBalconyPoints(0.15, 0.15);
  const pbPatioShape = new THREE.Shape(pbPatioPts);
  const pbPatioGeo = new THREE.ExtrudeGeometry(pbPatioShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    curveSegments: 36,
  });
  pbPatioGeo.rotateX(Math.PI / 2);
  const pbPatioMesh = new THREE.Mesh(pbPatioGeo, materials.interiorFloor);
  pbPatioMesh.position.y = 0.08;
  pbPatioMesh.receiveShadow = true;
  sotanoGroup.add(pbPatioMesh);

  // ==========================================================================
  // LAS DOS (2) PISCINAS PRIVADAS DE ALTA REALIDAD EN PLANTA BAJA (Z+)
  // ==========================================================================
  /**
   * Construye una piscina residencial de lujo hiperrealista con:
   * - Coronamiento perimetral hueco en piedra coralina blanca (`poolCopingStone`) y canaleta infinity
   * - Vaso interior revestido en mosaico vítreo azul turquesa (`poolMosaicTile`) con paredes y fondo
   * - Espejo de agua cristalino con ondas y reflejos (`waterMirror`)
   * - Escalera romana sumergida de 3 peldaños en gresite + escalera marina cromada (`stainlessSteel`)
   * - Playita húmeda (Sun-Shelf) con 2 tumbonas acuáticas blancas sumergidas
   * - Luminarias LED subacuáticas encastradas (`poolUnderwaterLed`)
   * - Solárium lateral en deck de madera teca con tumbonas tapizadas, mesas y sombrilla cuadrada
   * - Cerramiento de seguridad perimetral en cristal templado sin marco con pinzas de acero
   */
  const createRealisticLuxuryPool = (
    poolWidth: number,
    poolDepth: number,
    deckSide: 'left' | 'right'
  ): THREE.Group => {
    const poolGroup = new THREE.Group();
    const copingW = 0.34;
    const copingH = 0.24;

    // 1. Marco Perimetral Hueco de Piedra Coralina Blanca (Coping Frame)
    const outerShape = new THREE.Shape([
      new THREE.Vector2(-poolWidth * 0.5 - copingW, -poolDepth * 0.5 - copingW),
      new THREE.Vector2(poolWidth * 0.5 + copingW, -poolDepth * 0.5 - copingW),
      new THREE.Vector2(poolWidth * 0.5 + copingW, poolDepth * 0.5 + copingW),
      new THREE.Vector2(-poolWidth * 0.5 - copingW, poolDepth * 0.5 + copingW),
    ]);
    const innerHole = new THREE.Path([
      new THREE.Vector2(-poolWidth * 0.5, -poolDepth * 0.5),
      new THREE.Vector2(-poolWidth * 0.5, poolDepth * 0.5),
      new THREE.Vector2(poolWidth * 0.5, poolDepth * 0.5),
      new THREE.Vector2(poolWidth * 0.5, -poolDepth * 0.5),
    ]);
    outerShape.holes.push(innerHole);

    const copingGeo = new THREE.ExtrudeGeometry(outerShape, {
      depth: copingH,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    copingGeo.rotateX(Math.PI / 2);
    const copingMesh = new THREE.Mesh(copingGeo, materials.poolCopingStone);
    copingMesh.position.y = copingH;
    copingMesh.castShadow = true;
    copingMesh.receiveShadow = true;
    poolGroup.add(copingMesh);

    // Canaleta desbordante perimetral (Infinity Overflow Grille)
    const grilleOuter = new THREE.Shape([
      new THREE.Vector2(-poolWidth * 0.5 - copingW - 0.10, -poolDepth * 0.5 - copingW - 0.10),
      new THREE.Vector2(poolWidth * 0.5 + copingW + 0.10, -poolDepth * 0.5 - copingW - 0.10),
      new THREE.Vector2(poolWidth * 0.5 + copingW + 0.10, poolDepth * 0.5 + copingW + 0.10),
      new THREE.Vector2(-poolWidth * 0.5 - copingW - 0.10, poolDepth * 0.5 + copingW + 0.10),
    ]);
    grilleOuter.holes.push(
      new THREE.Path([
        new THREE.Vector2(-poolWidth * 0.5 - copingW, -poolDepth * 0.5 - copingW),
        new THREE.Vector2(-poolWidth * 0.5 - copingW, poolDepth * 0.5 + copingW),
        new THREE.Vector2(poolWidth * 0.5 + copingW, poolDepth * 0.5 + copingW),
        new THREE.Vector2(poolWidth * 0.5 + copingW, -poolDepth * 0.5 - copingW),
      ])
    );
    const grilleGeo = new THREE.ExtrudeGeometry(grilleOuter, {
      depth: 0.05,
      bevelEnabled: false,
    });
    grilleGeo.rotateX(Math.PI / 2);
    const grilleMesh = new THREE.Mesh(grilleGeo, materials.bronzeMetal);
    grilleMesh.position.y = 0.06;
    poolGroup.add(grilleMesh);

    // 2. Vaso Interior Revestido en Mosaico Vítreo Azul Turquesa (Gresite con cáusticas)
    const mosaicFloor = new THREE.Mesh(
      new THREE.BoxGeometry(poolWidth, 0.04, poolDepth),
      materials.poolMosaicTile
    );
    mosaicFloor.position.y = 0.04;
    mosaicFloor.receiveShadow = true;
    poolGroup.add(mosaicFloor);

    // 4 Paredes internas del vaso en gresite azul turquesa
    const frontInnerWall = new THREE.Mesh(
      new THREE.BoxGeometry(poolWidth, copingH - 0.02, 0.05),
      materials.poolMosaicTile
    );
    frontInnerWall.position.set(0, copingH * 0.5, poolDepth * 0.5 - 0.025);
    poolGroup.add(frontInnerWall);

    const backInnerWall = new THREE.Mesh(
      new THREE.BoxGeometry(poolWidth, copingH - 0.02, 0.05),
      materials.poolMosaicTile
    );
    backInnerWall.position.set(0, copingH * 0.5, -poolDepth * 0.5 + 0.025);
    poolGroup.add(backInnerWall);

    const leftInnerWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, copingH - 0.02, poolDepth),
      materials.poolMosaicTile
    );
    leftInnerWall.position.set(-poolWidth * 0.5 + 0.025, copingH * 0.5, 0);
    poolGroup.add(leftInnerWall);

    const rightInnerWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, copingH - 0.02, poolDepth),
      materials.poolMosaicTile
    );
    rightInnerWall.position.set(poolWidth * 0.5 - 0.025, copingH * 0.5, 0);
    poolGroup.add(rightInnerWall);

    // 3. Playita Húmeda (Wet Sun-Shelf) + 2 Tumbonas Acuáticas Sumergidas
    const shelfW = 1.85;
    const shelfSign = deckSide === 'left' ? -1 : 1;
    const shelfX = shelfSign * (poolWidth * 0.5 - shelfW * 0.5 - 0.04);
    const wetShelf = new THREE.Mesh(
      new THREE.BoxGeometry(shelfW, 0.13, poolDepth - 0.08),
      materials.poolMosaicTile
    );
    wetShelf.position.set(shelfX, 0.09, 0);
    poolGroup.add(wetShelf);

    // 2 tumbonas ergonómicas blancas sobre la playita de agua
    [-0.58, 0.58].forEach((lz) => {
      const aquaLounger = new THREE.Group();
      aquaLounger.position.set(shelfX, 0.18, lz);
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(1.32, 0.07, 0.58),
        materials.alabaster
      );
      aquaLounger.add(seat);
      const backrest = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.07, 0.58),
        materials.alabaster
      );
      backrest.position.set(shelfSign * 0.42, 0.12, 0);
      backrest.rotation.z = -shelfSign * 0.42;
      aquaLounger.add(backrest);
      poolGroup.add(aquaLounger);
    });

    // 4. Escalera Romana Sumergida de 3 Peldaños en Gresite en el extremo opuesto
    const stepSign = -shelfSign;
    for (let s = 0; s < 3; s++) {
      const stepW = 0.34 * (3 - s);
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(stepW, 0.045, 1.15),
        materials.poolMosaicTile
      );
      stepMesh.position.set(
        stepSign * (poolWidth * 0.5 - stepW * 0.5 - 0.04),
        0.06 + s * 0.05,
        -poolDepth * 0.5 + 0.62
      );
      poolGroup.add(stepMesh);
    }

    // 5. Escalera Marina de Acero Inoxidable Pulido con Pasamanos Curvos
    const ladderGroup = new THREE.Group();
    ladderGroup.position.set(stepSign * (poolWidth * 0.5 - 0.12), copingH, poolDepth * 0.5 - 0.55);
    const railRadius = 0.022;
    [-0.24, 0.24].forEach((rz) => {
      const vPost = new THREE.Mesh(
        new THREE.CylinderGeometry(railRadius, railRadius, 0.68, 12),
        materials.stainlessSteel
      );
      vPost.position.set(0, 0.22, rz);
      ladderGroup.add(vPost);

      const topArch = new THREE.Mesh(
        new THREE.CylinderGeometry(railRadius, railRadius, 0.28, 12),
        materials.stainlessSteel
      );
      topArch.rotation.z = Math.PI * 0.5;
      topArch.position.set(stepSign * 0.14, 0.55, rz);
      ladderGroup.add(topArch);

      const outerPost = new THREE.Mesh(
        new THREE.CylinderGeometry(railRadius, railRadius, 0.56, 12),
        materials.stainlessSteel
      );
      outerPost.position.set(stepSign * 0.28, 0.28, rz);
      ladderGroup.add(outerPost);
    });
    for (let r = 0; r < 2; r++) {
      const rung = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.48, 10),
        materials.stainlessSteel
      );
      rung.rotation.x = Math.PI * 0.5;
      rung.position.set(0, 0.02 + r * 0.14, 0);
      ladderGroup.add(rung);
    }
    poolGroup.add(ladderGroup);

    // 6. Luminarias Subacuáticas LED Encastradas en Ambas Paredes del Vaso + Cinta LED Cálida Perimetral
    const numLights = 5;
    const ledGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.025, 16);
    ledGeo.rotateX(Math.PI * 0.5);
    for (let i = 1; i <= numLights; i++) {
      const lx = -poolWidth * 0.5 + (i / (numLights + 1)) * poolWidth;
      const ledBack = new THREE.Mesh(ledGeo, materials.poolUnderwaterLed);
      ledBack.position.set(lx, 0.12, -poolDepth * 0.5 + 0.06);
      poolGroup.add(ledBack);

      const ledFront = new THREE.Mesh(ledGeo, materials.poolUnderwaterLed);
      ledFront.position.set(lx, 0.12, poolDepth * 0.5 - 0.06);
      poolGroup.add(ledFront);
    }

    // Cinta LED subacuática perimetral bajo el borde de piedra coralina
    const underCopingLed = new THREE.Mesh(
      new THREE.BoxGeometry(poolWidth - 0.06, 0.022, 0.03),
      materials.poolUnderwaterLed
    );
    underCopingLed.position.set(0, copingH - 0.04, -poolDepth * 0.5 + 0.03);
    poolGroup.add(underCopingLed);

    // 7. Espejo de Agua Cristalino con Ondas (Water Mirror)
    const waterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(poolWidth - 0.02, 0.03, poolDepth - 0.02),
      materials.waterMirror
    );
    waterMesh.position.y = copingH - 0.025;
    poolGroup.add(waterMesh);

    // 8. Solárium Lateral en Deck de Madera Teca con Iluminación Indirecta, Tumbonas y Sombrilla
    const deckW = 2.85;
    const deckCenterX = shelfSign * (poolWidth * 0.5 + copingW + deckW * 0.5 + 0.08);
    const woodDeck = new THREE.Mesh(
      new THREE.BoxGeometry(deckW, 0.10, poolDepth + copingW * 2),
      materials.woodSoffit
    );
    woodDeck.position.set(deckCenterX, 0.05, 0);
    woodDeck.receiveShadow = true;
    poolGroup.add(woodDeck);

    // Tira LED cálida empotrada bajo el borde del deck de madera teca y bolardos arquitectónicos nocturnos
    const deckCoveStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.03, poolDepth + copingW * 1.8),
      materials.coveLed
    );
    deckCoveStrip.position.set(deckCenterX - shelfSign * (deckW * 0.5 - 0.04), 0.035, 0);
    poolGroup.add(deckCoveStrip);

    [-poolDepth * 0.42, 0, poolDepth * 0.42].forEach((bz) => {
      const bollardPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.52, 12),
        materials.bronzeMetal
      );
      bollardPost.position.set(deckCenterX + shelfSign * (deckW * 0.5 - 0.14), 0.28, bz);
      bollardPost.castShadow = true;
      poolGroup.add(bollardPost);

      const bollardHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.048, 0.09, 12),
        materials.coveLed
      );
      bollardHead.position.set(deckCenterX + shelfSign * (deckW * 0.5 - 0.14), 0.52, bz);
      poolGroup.add(bollardHead);
    });

    // 2 tumbonas de solárium con base de madera teca, colchoneta marfil y cojín terracota
    [-0.55, 0.55].forEach((lxOffset) => {
      const sunLounger = new THREE.Group();
      sunLounger.position.set(deckCenterX + lxOffset, 0.14, 0.15);

      const woodFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.76, 0.12, 1.92),
        materials.furnitureWood
      );
      woodFrame.castShadow = true;
      sunLounger.add(woodFrame);

      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(0.70, 0.08, 1.32),
        materials.furnitureFabric
      );
      mattress.position.set(0, 0.09, 0.25);
      sunLounger.add(mattress);

      const reclinedBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.70, 0.08, 0.62),
        materials.furnitureFabric
      );
      reclinedBack.position.set(0, 0.24, -0.58);
      reclinedBack.rotation.x = 0.48;
      reclinedBack.castShadow = true;
      sunLounger.add(reclinedBack);

      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.07, 0.22),
        materials.cortenLouver
      );
      pillow.position.set(0, 0.34, -0.70);
      pillow.rotation.x = 0.48;
      sunLounger.add(pillow);

      poolGroup.add(sunLounger);
    });

    // Mesa auxiliar de teca y Sombrilla Arquitectónica Cuadrada en el solárium
    const sideTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.32, 16),
      materials.furnitureWood
    );
    sideTable.position.set(deckCenterX, 0.24, -0.25);
    sideTable.castShadow = true;
    poolGroup.add(sideTable);

    const umbrellaPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.045, 2.35, 12),
      materials.bronzeMetal
    );
    umbrellaPole.position.set(deckCenterX, 1.22, -0.85);
    umbrellaPole.castShadow = true;
    poolGroup.add(umbrellaPole);

    const umbrellaCanopy = new THREE.Mesh(
      new THREE.ConeGeometry(1.55, 0.42, 4),
      materials.alabaster
    );
    umbrellaCanopy.rotation.y = Math.PI * 0.25;
    umbrellaCanopy.position.set(deckCenterX, 2.38, -0.85);
    umbrellaCanopy.castShadow = true;
    poolGroup.add(umbrellaCanopy);

    // 9. Cerramiento Perimetral Bajo en Cristal Templado sin Marco con Herrajes de Acero
    const totalFenceW = poolWidth + copingW * 2 + deckW;
    const fenceCenterX = shelfSign * (deckW * 0.5);
    const frontGlassFence = new THREE.Mesh(
      new THREE.BoxGeometry(totalFenceW, 0.85, 0.03),
      materials.glassBalustrade
    );
    frontGlassFence.position.set(fenceCenterX, 0.46, poolDepth * 0.5 + copingW + 0.14);
    poolGroup.add(frontGlassFence);

    const numSpigots = 7;
    const spigotGeo = new THREE.BoxGeometry(0.06, 0.18, 0.08);
    for (let sp = 0; sp <= numSpigots; sp++) {
      const spX = fenceCenterX - totalFenceW * 0.5 + (sp / numSpigots) * totalFenceW;
      const spigot = new THREE.Mesh(spigotGeo, materials.stainlessSteel);
      spigot.position.set(spX, 0.11, poolDepth * 0.5 + copingW + 0.14);
      poolGroup.add(spigot);
    }

    return poolGroup;
  };

  // 1. PISCINA PRIVADA 01 — JARDÍN DEL DÚPLEX IZQUIERDO / NORTE (x = -5.85, z = +10.85)
  const luxuryPool1 = createRealisticLuxuryPool(7.2, 2.85, 'left');
  luxuryPool1.position.set(-5.85, 0.06, 10.85);
  sotanoGroup.add(luxuryPool1);

  // 2. PISCINA PRIVADA 02 — JARDÍN DEL DÚPLEX DERECHO / SUR (x = +4.25, z = +9.85, contenida dentro del muro del Portón)
  const luxuryPool2 = createRealisticLuxuryPool(5.6, 2.55, 'right');
  luxuryPool2.position.set(4.25, 0.06, 9.85);
  sotanoGroup.add(luxuryPool2);

  // Muro divisorio central en piedra laja carbón con coronación de concreto visto entre ambas piscinas
  const gardenDividerWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 1.65, 5.8),
    materials.darkSlateStone
  );
  gardenDividerWall.position.set(-0.45, 0.825, 9.2);
  gardenDividerWall.castShadow = true;
  sotanoGroup.add(gardenDividerWall);

  const gardenDividerCoping = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.10, 5.9),
    materials.boardFormedConcrete
  );
  gardenDividerCoping.position.set(-0.45, 1.68, 9.2);
  sotanoGroup.add(gardenDividerCoping);

  // Grupo de palmeras tropicales altas en la inflexión central de Planta Baja (RC-exterior.frontal.jpeg)
  const centerPalmPositions = [
    { x: 0.15, z: 8.2, h: 6.2 },
    { x: 0.65, z: 8.8, h: 5.4 },
    { x: -0.25, z: 9.1, h: 4.8 },
  ];
  centerPalmPositions.forEach((cp, idx) => {
    const palm = new THREE.Group();
    palm.position.set(cp.x, 0, cp.z);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.13, cp.h, 8),
      materials.trunkMaterial
    );
    trunk.position.y = cp.h * 0.5;
    trunk.castShadow = true;
    palm.add(trunk);

    const frondGeo = new THREE.BoxGeometry(0.24, 1.45, 0.05);
    for (let f = 0; f < 9; f++) {
      const angle = (f / 9) * Math.PI * 2;
      const frond = new THREE.Mesh(
        frondGeo,
        idx % 2 === 0 ? materials.foliageLight : materials.foliageAccent
      );
      frond.position.set(Math.cos(angle) * 0.45, cp.h - 0.15, Math.sin(angle) * 0.45);
      frond.rotation.z = Math.cos(angle) * 0.68;
      frond.rotation.x = Math.sin(angle) * 0.68;
      frond.castShadow = true;
      palm.add(frond);
    }
    sotanoGroup.add(palm);
  });

  // Mobiliario exterior de las terrazas de Planta Baja
  const pbDiningTable = new THREE.Mesh(
    new THREE.BoxGeometry(2.45, 0.54, 1.10),
    materials.furnitureWood
  );
  pbDiningTable.position.set(-6.4, 0.35, 6.65);
  pbDiningTable.castShadow = true;
  sotanoGroup.add(pbDiningTable);

  const pbSofaLeft = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 0.44, 0.92),
    materials.furnitureFabric
  );
  pbSofaLeft.position.set(-6.4, 0.30, 8.35);
  pbSofaLeft.castShadow = true;
  sotanoGroup.add(pbSofaLeft);

  const pbSofaRight = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 0.44, 0.92),
    materials.furnitureFabric
  );
  pbSofaRight.position.set(5.15, 0.30, 6.85);
  pbSofaRight.castShadow = true;
  sotanoGroup.add(pbSofaRight);

  // ==========================================================================
  // CERRAMIENTO PERIMETRAL Y LADO DEL PORTÓN (100% FIEL A `RC-exterior.entrada-costado.jpeg` Y `RC-exterior.entrada-costado.jpeg_2K_20261027142428.jpg`)
  // ==========================================================================
  // 1. Muro Frontal Continuo de Piedra Laja Carbón con Albardilla de Concreto Visto (Z+ = +13.45m, de x = -14.95m a +14.25m)
  const frontSlateWall = new THREE.Mesh(
    new THREE.BoxGeometry(29.2, 2.55, 0.55),
    materials.darkSlateStone
  );
  frontSlateWall.position.set(-0.35, 1.275, 13.45);
  frontSlateWall.castShadow = true;
  frontSlateWall.receiveShadow = true;
  sotanoGroup.add(frontSlateWall);

  const frontWallConcreteCap = new THREE.Mesh(
    new THREE.BoxGeometry(29.4, 0.14, 0.65),
    materials.parkingBoardConcrete
  );
  frontWallConcreteCap.position.set(-0.35, 2.58, 13.45);
  frontWallConcreteCap.castShadow = true;
  sotanoGroup.add(frontWallConcreteCap);

  // 2. Muro Lateral Izquierdo de Piedra Laja Carbón con Albardilla de Concreto Visto (X- = -14.95m)
  const leftSlateWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 2.55, 26.8),
    materials.darkSlateStone
  );
  leftSlateWall.position.set(-14.95, 1.275, 0.0);
  leftSlateWall.castShadow = true;
  sotanoGroup.add(leftSlateWall);

  const leftWallConcreteCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.14, 27.0),
    materials.parkingBoardConcrete
  );
  leftWallConcreteCap.position.set(-14.95, 2.58, 0.0);
  leftWallConcreteCap.castShadow = true;
  sotanoGroup.add(leftWallConcreteCap);

  // 3. Muro Posterior de Piedra Laja Carbón con Albardilla de Concreto Visto (Z- = -13.25m, de x = -14.95m a +14.95m)
  const backSlateWall = new THREE.Mesh(
    new THREE.BoxGeometry(29.9, 2.55, 0.55),
    materials.darkSlateStone
  );
  backSlateWall.position.set(0.0, 1.275, -13.25);
  backSlateWall.castShadow = true;
  backSlateWall.receiveShadow = true;
  sotanoGroup.add(backSlateWall);

  const backWallConcreteCap = new THREE.Mesh(
    new THREE.BoxGeometry(30.1, 0.14, 0.65),
    materials.parkingBoardConcrete
  );
  backWallConcreteCap.position.set(0.0, 2.58, -13.25);
  backWallConcreteCap.castShadow = true;
  sotanoGroup.add(backWallConcreteCap);

  // ==========================================================================
  // 4. CONJUNTO ARQUITECTÓNICO DEL LADO DEL PORTÓN EN EL LINDERO PERIMETRAL EXTERIOR (ESTE X+):
  //    Reconstruido al milímetro según `RC-exterior.entrada-costado.jpeg` y `RC-exterior.entrada-costado.jpeg_2K_20261027142428.jpg`
  // ==========================================================================
  // En `RC-exterior.entrada-costado.jpeg` y `RC-exterior.entrada-costado.jpeg_2K_20261027142428.jpg`:
  // - El PORTÓN VEHICULAR en listones verticales terracota NO está pegado al edificio sino en el MURO PERIMETRAL
  //   EXTERIOR del podio (`x = +13.85m`, de `z = +2.85m` a `z = +8.65m`), dejando íntegro detrás de él todo el
  //   jardín de grama de Planta Baja (`de x = +10.35m a +13.85m`) con su columna cilíndrica (`x = +10.05m, z = +7.55m`)
  //   y los 3 balcones que se extienden lateralmente hasta `x = +11.65m`.
  // - Sobre el Portón (`y = 2.08m a 2.88m`) corre el Muro Dintel de Piedra Laja Oscura (`darkSlateStone`)
  //   coronado de vegetación tropical que cierra el jardín de Planta Baja.
  // - A la izquierda del Portón (`z = +8.65m`, saliendo de `x = +13.85m` a `+15.25m`):
  //   El Muro en "L" de Concreto Visto Claro (`boardFormedConcrete`) que enmarca el costado izquierdo de la rampa
  //   y abraza la jardinera de la Palmera (`palmera`), seguido hacia la esquina frontal (`z = +8.65m a +13.45m`)
  //   por el muro perimetral de piedra laja (`x = +14.25m`) con paneles verticales de hiedra y la Garita integrada detrás.
  // - A la derecha del Portón (`z = +2.85m`, saliendo `1.10m` desde `x = +13.85m` hasta `x = +14.95m` y doblando a 90°
  //   hacia el fondo hasta `z = -13.25m`):
  //   El Muro Jardinera Perimetral en acabado oscuro carbón/marrón (`parkingSplitStone`) con hiedra trepadora en su base
  //   y vegetación exuberante (palmeras y árboles) frente a la fachada blanca de ventanas.
  const entranceComplexGroup = new THREE.Group();

  // 4A. PORTÓN VEHICULAR CONTINUO EN LISTONES VERTICALES TERRACOTA EN EL MURO PERIMETRAL (x = +13.85m, z = +2.85m a +8.65m)
  const portalCenterZ = 5.75;
  const totalPortalSpan = 5.80; // De z = +2.85m (alineado con el Gran Pilar de Concreto) a z = +8.65m (contra el Muro en L)
  const gateHeight = 2.08;

  const gateAndEntryGroup = new THREE.Group();
  gateAndEntryGroup.position.set(13.85, 0, portalCenterZ);

  // Muro Dintel Superior Continuo en Piedra Laja Negra/Carbón sobre el Portón (y = 2.08m a 2.88m)
  const slateLintelH = 0.80;
  const gateSlateLintel = new THREE.Mesh(
    new THREE.BoxGeometry(0.60, slateLintelH, totalPortalSpan + 0.40),
    materials.darkSlateStone
  );
  gateSlateLintel.position.set(0.04, gateHeight + slateLintelH * 0.5, 0.10);
  gateSlateLintel.castShadow = true;
  gateSlateLintel.receiveShadow = true;
  gateAndEntryGroup.add(gateSlateLintel);

  const gateLintelCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.10, totalPortalSpan + 0.50),
    materials.boardFormedConcrete
  );
  gateLintelCap.position.set(0.04, gateHeight + slateLintelH + 0.04, 0.10);
  gateAndEntryGroup.add(gateLintelCap);

  // Tira LED cálida empotrada bajo el dintel del Portón (Modo Noche)
  const portalSoffitLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.03, totalPortalSpan - 0.16),
    materials.coveLed
  );
  portalSoffitLed.position.set(0.16, gateHeight - 0.02, 0);
  gateAndEntryGroup.add(portalSoffitLed);

  // Cuerpo sólido del Portón Terracota (Hoja vehicular + Puerta peatonal integrada en el mismo plano acanalado)
  const vehGateBacking = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, gateHeight - 0.03, totalPortalSpan),
    materials.cortenLouver
  );
  vehGateBacking.position.set(0.0, gateHeight * 0.5, 0);
  vehGateBacking.castShadow = true;
  vehGateBacking.receiveShadow = true;
  gateAndEntryGroup.add(vehGateBacking);

  // Nervios verticales acanalados y sombras profundas a lo largo del Portón Terracota (tal como en RC-exterior.entrada-costado.jpeg)
  const numTotalRibs = 32;
  const ribGeo = new THREE.BoxGeometry(0.09, gateHeight - 0.03, 0.092);
  const darkGrooveGeo = new THREE.BoxGeometry(0.07, gateHeight - 0.05, 0.035);
  for (let g = 0; g < numTotalRibs; g++) {
    const gz = -totalPortalSpan * 0.5 + 0.09 + (g / (numTotalRibs - 1)) * (totalPortalSpan - 0.18);
    const rib = new THREE.Mesh(ribGeo, materials.cortenLouver);
    rib.position.set(0.055, gateHeight * 0.5, gz);
    rib.castShadow = true;
    rib.receiveShadow = true;
    gateAndEntryGroup.add(rib);

    const shadowLine = new THREE.Mesh(darkGrooveGeo, materials.bronzeMetal);
    shadowLine.position.set(0.04, gateHeight * 0.5, gz + 0.060);
    gateAndEntryGroup.add(shadowLine);
  }

  // Tirador sutil en acero inoxidable de la hoja peatonal integrada en el extremo izquierdo del portón
  const pedHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 1.25, 10),
    materials.stainlessSteel
  );
  pedHandle.position.set(0.12, gateHeight * 0.48, totalPortalSpan * 0.5 - 0.85);
  gateAndEntryGroup.add(pedHandle);

  entranceComplexGroup.add(gateAndEntryGroup);

  // 4B. MURO EN "L" DE CONCRETO VISTO CLARO A LA IZQUIERDA DEL PORTÓN + PALMERA + MURO PERIMETRAL DE PIEDRA LAJA CON HIEDRA
  // Exactamente como se observa a la izquierda del portón naranja en `RC-exterior.entrada-costado.jpeg` y `RC-exterior.entrada-costado.jpeg_2K_20261027142428.jpg`:
  // Un muro limpio en "L" de concreto visto gris claro (`height = 2.08m`) que sale desde el borde izquierdo
  // del portón (`z = +8.65m`, de `x = +13.85m` a `+15.25m`) y dobla hacia la izquierda (`z = +8.65m a +9.75m`).
  const leftConcreteCheekWall = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, gateHeight, 0.32),
    materials.boardFormedConcrete
  );
  leftConcreteCheekWall.position.set(14.55, gateHeight * 0.5, 8.65);
  leftConcreteCheekWall.castShadow = true;
  leftConcreteCheekWall.receiveShadow = true;
  entranceComplexGroup.add(leftConcreteCheekWall);

  const leftConcreteReturnWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, gateHeight, 1.15),
    materials.boardFormedConcrete
  );
  leftConcreteReturnWall.position.set(15.12, gateHeight * 0.5, 9.18);
  leftConcreteReturnWall.castShadow = true;
  leftConcreteReturnWall.receiveShadow = true;
  entranceComplexGroup.add(leftConcreteReturnWall);

  // Muro Perimetral de Piedra Laja Oscura que continúa desde el dintel del Portón hasta la esquina frontal (z = +8.65m a +13.45m, en x = +14.25m)
  const northSlateWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 2.88, 4.85),
    materials.darkSlateStone
  );
  northSlateWall.position.set(14.25, 1.44, 11.05);
  northSlateWall.castShadow = true;
  northSlateWall.receiveShadow = true;
  entranceComplexGroup.add(northSlateWall);

  const northSlateCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, 0.12, 4.95),
    materials.boardFormedConcrete
  );
  northSlateCap.position.set(14.25, 2.92, 11.05);
  entranceComplexGroup.add(northSlateCap);

  // Paneles verticales de hiedra verde sobre el muro perimetral de piedra laja a la izquierda del Portón (RC-exterior.entrada-costado.jpeg)
  const ivyLeafGeo = new THREE.DodecahedronGeometry(0.24, 1);
  [10.45, 11.65, 12.85].forEach((vz) => {
    for (let vy = 0.28; vy <= 2.35; vy += 0.34) {
      const vIvy = new THREE.Mesh(
        ivyLeafGeo,
        vy > 1.3 ? materials.foliageLight : materials.foliageDark
      );
      vIvy.scale.set(0.32, 1.15, 0.95);
      vIvy.position.set(14.56, vy, vz);
      entranceComplexGroup.add(vIvy);
    }
  });

  // Palmera arqueada y arbustos tropicales en la jardinera junto al Muro en "L" de Concreto Visto (RC-exterior.entrada-costado.jpeg)
  const entrancePalmGroup = new THREE.Group();
  entrancePalmGroup.position.set(14.72, 0.0, 9.75);
  const ePalmTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.12, 2.85, 8),
    materials.trunkMaterial
  );
  ePalmTrunk.position.y = 1.425;
  ePalmTrunk.rotation.z = -0.10;
  ePalmTrunk.castShadow = true;
  entrancePalmGroup.add(ePalmTrunk);

  const eFrondGeo = new THREE.BoxGeometry(0.22, 1.38, 0.04);
  for (let pf = 0; pf < 10; pf++) {
    const pAngle = (pf / 10) * Math.PI * 2;
    const eFrond = new THREE.Mesh(
      eFrondGeo,
      pf % 2 === 0 ? materials.foliageLight : materials.foliageAccent
    );
    eFrond.position.set(0.14 + Math.cos(pAngle) * 0.42, 2.72, Math.sin(pAngle) * 0.42);
    eFrond.rotation.z = Math.cos(pAngle) * 0.72;
    eFrond.rotation.x = Math.sin(pAngle) * 0.72;
    eFrond.castShadow = true;
    entrancePalmGroup.add(eFrond);
  }
  // Arbustos bajos al pie de la palmera y del muro en L de concreto
  for (let sb = 0; sb < 5; sb++) {
    const lowShrub = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.34, 1),
      sb % 2 === 0 ? materials.foliageDark : materials.foliageLight
    );
    lowShrub.scale.set(0.95, 0.65, 0.95);
    lowShrub.position.set(0.12, 0.30, -0.35 + sb * 0.36);
    entrancePalmGroup.add(lowShrub);
  }
  entranceComplexGroup.add(entrancePalmGroup);

  // GARITA DE VIGILANCIA INTEGRADA (Retranqueada limpiamente tras el Muro Perimetral de Piedra Laja en x = +13.25m, z = +10.85m)
  const garitaGroup = new THREE.Group();
  garitaGroup.position.set(13.25, 0, 10.85);

  const garitaBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.40, 2.35, 1.80),
    materials.boardFormedConcrete
  );
  garitaBody.position.set(0, 1.175, 0);
  garitaBody.castShadow = true;
  garitaGroup.add(garitaBody);

  // Ventana panorámica de la garita con marco perimetral hueco, fondo de profundidad y cristal reflectivo con brillo especular
  addDetailedSideWindow(garitaGroup, 1, 1.55, -0.15, 0.92, 1.30, 2, false, materials, 0.56);

  const garitaInteriorLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.90, 0.04, 1.20),
    materials.coveLed
  );
  garitaInteriorLight.position.set(0.05, 2.10, -0.10);
  garitaGroup.add(garitaInteriorLight);

  entranceComplexGroup.add(garitaGroup);

  // 4C. RAMPA DE ENTRADA VEHICULAR DE CONCRETO CLARO CON 5 FRANJAS OSCURAS + ACERA CON BROCAL CURVO
  // Se extiende desde el Portón Perimetral (`x = +13.85m`) hacia la calzada (`x = +16.25m`), encajada entre el
  // Muro en "L" de Concreto Visto (`z = +8.65m`) y el retorno del Muro Jardinera Oscuro (`z = +2.85m`)
  const apronWidth = totalPortalSpan;
  const apronDepth = 2.45;
  const rampGroup = new THREE.Group();
  rampGroup.position.set(15.05, 0.06, portalCenterZ);

  const rampBase = new THREE.Mesh(
    new THREE.BoxGeometry(apronDepth, 0.14, apronWidth),
    materials.travertine
  );
  rampBase.rotation.z = -0.045;
  rampBase.receiveShadow = true;
  rampGroup.add(rampBase);

  // Las 5 franjas transversales oscuras paralelas al portón (idénticas a RC-exterior.entrada-costado.jpeg)
  for (let r = -2; r <= 2; r++) {
    const rx = r * 0.44;
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.15, apronWidth - 0.16),
      materials.bronzeMetal
    );
    stripe.position.set(rx, -rx * 0.045 + 0.008, 0);
    rampGroup.add(stripe);
  }
  entranceComplexGroup.add(rampGroup);

  // Acera peatonal de concreto claro con brocal redondeado a la izquierda de la rampa (z = +8.65m a +13.76m, x = +14.55m a +15.85m)
  const northSidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.16, 5.10),
    materials.boardFormedConcrete
  );
  northSidewalk.position.set(15.20, 0.08, 11.20);
  northSidewalk.receiveShadow = true;
  entranceComplexGroup.add(northSidewalk);

  // 4D. MURO JARDINERA PERIMETRAL EN L (TEXTURIZADO CARBÓN/MARRÓN OSCURO) A LA DERECHA DEL PORTÓN (z = +2.85m a -13.25m)
  // Exactamente como en `RC-exterior.entrada-costado.jpeg` y `RC-exterior.entrada-costado.jpeg_2K_20261027142428.jpg`:
  // Nace en el borde derecho del Portón Perimetral (`z = +2.85m, x = +13.80m`), avanza un corto retorno de `1.15m`
  // hasta `x = +14.95m`, y dobla a 90° hacia el fondo (`z = +2.85m a -13.25m`), manteniendo un amplio jardín elevado
  // entre la fachada blanca de ventanas (`x = +10.35m`) y el muro perimetral (`x = +14.95m`).
  const rightGardenWallH = 2.58;

  // Corto tramo de retorno transversal en z = +2.85m (costado derecho de la rampa del Portón, de x = +13.80m a +14.95m)
  const rightGardenReturnWall = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, rightGardenWallH, 0.52),
    materials.parkingSplitStone
  );
  rightGardenReturnWall.position.set(14.38, rightGardenWallH * 0.5, 2.85);
  rightGardenReturnWall.castShadow = true;
  rightGardenReturnWall.receiveShadow = true;
  entranceComplexGroup.add(rightGardenReturnWall);

  const rightGardenReturnCap = new THREE.Mesh(
    new THREE.BoxGeometry(1.30, 0.12, 0.60),
    materials.boardFormedConcrete
  );
  rightGardenReturnCap.position.set(14.38, rightGardenWallH + 0.04, 2.85);
  entranceComplexGroup.add(rightGardenReturnCap);

  // Tramo longitudinal continuo en x = +14.95m (desde z = +2.85m hasta z = -13.25m, largo = 16.10m)
  const rightGardenWallLen = 16.10;
  const rightGardenWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, rightGardenWallH, rightGardenWallLen),
    materials.parkingSplitStone
  );
  rightGardenWall.position.set(14.95, rightGardenWallH * 0.5, -5.20);
  rightGardenWall.castShadow = true;
  rightGardenWall.receiveShadow = true;
  entranceComplexGroup.add(rightGardenWall);

  const rightGardenWallCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.12, rightGardenWallLen + 0.12),
    materials.boardFormedConcrete
  );
  rightGardenWallCap.position.set(14.95, rightGardenWallH + 0.04, -5.20);
  entranceComplexGroup.add(rightGardenWallCap);

  // Sustrato/jardín elevado dentro del muro perimetral derecho (entre la fachada blanca x = +10.35m y el muro x = +14.95m)
  const raisedRightGardenSoil = new THREE.Mesh(
    new THREE.BoxGeometry(4.30, 2.25, 15.80),
    materials.lawnGrassMat
  );
  raisedRightGardenSoil.position.set(12.55, 1.125, -5.20);
  raisedRightGardenSoil.receiveShadow = true;
  entranceComplexGroup.add(raisedRightGardenSoil);

  // Hiedra trepadora (climbing ivy) subiendo desde la base de la esquina y del frente del muro oscuro (RC-exterior.entrada-costado.jpeg)
  for (let ix = 13.85; ix <= 14.95; ix += 0.36) {
    const cornerIvyH = 0.78 + ((Math.round(ix * 10) * 3) % 5) * 0.22;
    for (let iy = 0.22; iy <= cornerIvyH; iy += 0.30) {
      const cIvy = new THREE.Mesh(
        ivyLeafGeo,
        iy > 0.85 ? materials.foliageLight : materials.foliageDark
      );
      cIvy.scale.set(0.85, 1.15, 0.35);
      cIvy.position.set(ix, iy, 3.14);
      entranceComplexGroup.add(cIvy);
    }
  }
  for (let iz = -12.4; iz <= 2.85; iz += 0.68) {
    const ivyClusterH = 0.70 + ((Math.abs(Math.round(iz * 10)) * 7) % 6) * 0.24;
    for (let iy = 0.22; iy <= ivyClusterH; iy += 0.30) {
      const ivy = new THREE.Mesh(
        ivyLeafGeo,
        iy > 0.85 ? materials.foliageLight : materials.foliageDark
      );
      ivy.scale.set(0.35, 1.15, 0.85);
      ivy.position.set(15.24, iy, iz);
      entranceComplexGroup.add(ivy);
    }
  }

  // Palmeras multifuste (Areca/Bambú) y follaje tropical denso dentro de la jardinera derecha (RC-exterior.entrada-costado.jpeg)
  const rightPlanterPalms = [
    { x: 12.85, z: 1.45, h: 5.4 },
    { x: 13.25, z: 0.15, h: 4.8 },
    { x: 12.65, z: -2.15, h: 4.5 },
    { x: 13.15, z: -5.40, h: 5.2 },
    { x: 12.95, z: -8.85, h: 5.8 },
  ];
  rightPlanterPalms.forEach((rp, idx) => {
    const rPalm = new THREE.Group();
    rPalm.position.set(rp.x, 2.20, rp.z);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.11, rp.h - 2.0, 8),
      materials.trunkMaterial
    );
    trunk.position.y = (rp.h - 2.0) * 0.5;
    trunk.castShadow = true;
    rPalm.add(trunk);

    const pFrondGeo = new THREE.BoxGeometry(0.22, 1.35, 0.04);
    for (let f = 0; f < 9; f++) {
      const angle = (f / 9) * Math.PI * 2;
      const frond = new THREE.Mesh(
        pFrondGeo,
        (idx + f) % 2 === 0 ? materials.foliageLight : materials.foliageAccent
      );
      frond.position.set(Math.cos(angle) * 0.42, rp.h - 2.1, Math.sin(angle) * 0.42);
      frond.rotation.z = Math.cos(angle) * 0.68;
      frond.rotation.x = Math.sin(angle) * 0.68;
      frond.castShadow = true;
      rPalm.add(frond);
    }
    entranceComplexGroup.add(rPalm);
  });

  sotanoGroup.add(entranceComplexGroup);

  // Vegetación exuberante sobre los muros perimetrales de piedra laja (frente, costados y fondo)
  const streetHedgeGeo = new THREE.DodecahedronGeometry(0.56, 1);
  for (let sx = -14.4; sx <= 13.8; sx += 0.90) {
    const mat = sx % 2 === 0 ? materials.foliageDark : materials.foliageLight;
    const frontHedge = new THREE.Mesh(streetHedgeGeo, mat);
    frontHedge.scale.set(1.20, 0.92, 0.95);
    frontHedge.position.set(sx, 2.75, 13.45);
    frontHedge.castShadow = true;
    sotanoGroup.add(frontHedge);
  }
  for (let sx = -14.4; sx <= 14.4; sx += 0.92) {
    const mat = sx % 2 === 0 ? materials.foliageDark : materials.foliageLight;
    const backHedge = new THREE.Mesh(streetHedgeGeo, mat);
    backHedge.scale.set(1.15, 0.88, 0.92);
    backHedge.position.set(sx, 2.72, -13.25);
    backHedge.castShadow = true;
    sotanoGroup.add(backHedge);
  }

  for (let sz = -12.6; sz <= 12.8; sz += 0.88) {
    const mat = sz % 2 === 0 ? materials.foliageLight : materials.foliageDark;
    const leftHedge = new THREE.Mesh(streetHedgeGeo, mat);
    leftHedge.scale.set(0.95, 0.92, 1.18);
    leftHedge.position.set(-14.95, 2.75, sz);
    leftHedge.castShadow = true;
    sotanoGroup.add(leftHedge);

    // Vegetación continua sobre el dintel de piedra laja del Portón Perimetral (z = +2.9 a +13.0, x = +13.88 a +14.25)
    // y dentro del Muro Jardinera Derecho (z = -12.6 a +2.6, x = +13.85)
    const rightHedge = new THREE.Mesh(streetHedgeGeo, mat);
    if (sz >= 2.9) {
      rightHedge.scale.set(0.95, 0.88, 1.15);
      const lintelX = sz <= 8.7 ? 13.88 : 14.25;
      rightHedge.position.set(lintelX, 3.12, sz);
    } else {
      rightHedge.scale.set(1.35, 1.05, 1.25);
      rightHedge.position.set(13.85, 2.85, sz);
    }
    rightHedge.castShadow = true;
    sotanoGroup.add(rightHedge);
  }

  // Árboles tropicales en el perímetro del terreno
  const treePositions = [
    { x: -15.4, z: 9.8, h: 6.8 },
    { x: -15.6, z: 2.0, h: 5.8 },
    { x: -15.2, z: -8.5, h: 6.6 },
    { x: 13.2, z: -10.8, h: 6.4 },
  ];
  treePositions.forEach((tp, idx) => {
    const tree = new THREE.Group();
    tree.position.set(tp.x, 0, tp.z);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.22, tp.h, 10),
      materials.trunkMaterial
    );
    trunk.position.y = tp.h * 0.5;
    trunk.castShadow = true;
    tree.add(trunk);

    const canopyMats = [materials.foliageDark, materials.foliageLight, materials.foliageAccent];
    for (let c = 0; c < 5; c++) {
      const crown = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.38 - c * 0.14, 1),
        canopyMats[(idx + c) % canopyMats.length]
      );
      crown.scale.set(1.25, 0.72, 1.15);
      crown.position.set(
        Math.cos(c * 1.4) * 0.65,
        tp.h - 0.3 + c * 0.35,
        Math.sin(c * 1.4) * 0.65
      );
      crown.castShadow = true;
      tree.add(crown);
    }
    sotanoGroup.add(tree);
  });

  buildingRoot.add(sotanoGroup);

  // ==========================================================================
  // 2. NIVEL PB + P1: RESIDENCIAS DÚPLEX DE JARDÍN (y = 0.00 a 7.70m)
  // ==========================================================================
  const pbGroup = levelGroups.pb;

  // Dos Residencias Dúplex de Jardín (Ala Izquierda = jardin-norte de x=-11.00 a -0.30, Ala Derecha = jardin-sur de x=-0.30 a +10.04)
  registerFullWingResidence('jardin-norte', -5.65, 3.85, 10.70, 7.4, pbGroup, true);
  registerFullWingResidence('jardin-sur', 4.87, 3.85, 10.34, 7.4, pbGroup, true);

  addCentralCoreWithStaircase(pbGroup, 3.85, 7.65);

  // En PB+P1 NO hay balcón intermedio a mitad de doble altura (como se ve en RC-exterior.frontal.jpeg y RC-exterior.PB-patio.jpeg):
  // las 5 columnas cilíndricas y las celosías terracota suben limpias los 7.70m hasta el 1er Balcón en P2.
  addMonumentalCylindricalColumns(pbGroup, 3.85, 7.70, false);
  addFacadeTerracottaSpines(pbGroup, 1.925, 3.85, 0.0, false);
  addFacadeTerracottaSpines(pbGroup, 5.775, 3.85, 0.0, false);

  // Fachadas Laterales (Oeste X- y Este X+) de PB y P1
  const leftLatPB = createLateralFacadeSegment('left', 3.85, materials, 0, false);
  leftLatPB.position.set(-11.05, 1.925, 0);
  pbGroup.add(leftLatPB);

  const rightLatPB = createLateralFacadeSegment('right', 3.85, materials, 0, false);
  rightLatPB.position.set(10.35, 1.925, 0);
  pbGroup.add(rightLatPB);

  const leftLatP1 = createLateralFacadeSegment('left', 3.85, materials, 1, false);
  leftLatP1.position.set(-11.05, 5.775, 0);
  pbGroup.add(leftLatP1);

  const rightLatP1 = createLateralFacadeSegment('right', 3.85, materials, 1, false);
  rightLatP1.position.set(10.35, 5.775, 0);
  pbGroup.add(rightLatP1);

  // Fachada Posterior Plana de Ventanas (Z- = -5.55m, SIN BALCONES) en PB y P1
  const rearPB = createRearWindowFacadeSegment(3.85, materials, 0, false);
  rearPB.position.set(0, 1.925, -5.55);
  pbGroup.add(rearPB);

  const rearP1 = createRearWindowFacadeSegment(3.85, materials, 1, false);
  rearP1.position.set(0, 5.775, -5.55);
  pbGroup.add(rearP1);

  buildingRoot.add(pbGroup);

  // ==========================================================================
  // 3. NIVEL P2: RESIDENCIAS DE HORIZONTE 02 (y = 7.70 a 11.55m) — 1er BALCÓN EN CURVA "S"
  // ==========================================================================
  const p2Group = levelGroups.p2;
  const p2BaseY = 7.70;
  const p2Height = 3.85;
  const p2CenterY = p2BaseY + p2Height * 0.5;

  registerFullWingResidence('residencia-02-norte', -5.65, p2CenterY, 10.70, p2Height - 0.15, p2Group, false);
  registerFullWingResidence('residencia-02-sur', 4.87, p2CenterY, 10.34, p2Height - 0.15, p2Group, false);

  addCentralCoreWithStaircase(p2Group, p2CenterY, p2Height);

  // 1ra TERRAZA CONTINUA EN CURVA "S" (Coronando el Dúplex PB+P1, en y = 7.70m)
  const balconyP2Front = createContinuousSCurveBalcony(materials, 0.0, true, false);
  balconyP2Front.position.y = p2BaseY;
  p2Group.add(balconyP2Front);

  addMonumentalCylindricalColumns(p2Group, p2CenterY, p2Height, false);
  addFacadeTerracottaSpines(p2Group, p2CenterY, p2Height, 0.0, false);

  const leftLatP2 = createLateralFacadeSegment('left', p2Height, materials, 2, false);
  leftLatP2.position.set(-11.05, p2CenterY, 0);
  p2Group.add(leftLatP2);

  const rightLatP2 = createLateralFacadeSegment('right', p2Height, materials, 2, false);
  rightLatP2.position.set(10.35, p2CenterY, 0);
  p2Group.add(rightLatP2);

  const rearP2 = createRearWindowFacadeSegment(p2Height, materials, 2, false);
  rearP2.position.set(0, p2CenterY, -5.55);
  p2Group.add(rearP2);

  buildingRoot.add(p2Group);

  // ==========================================================================
  // 4. NIVEL P3: RESIDENCIAS DE HORIZONTE 03 (y = 11.55 a 15.40m) — 2do BALCÓN EN CURVA "S"
  // ==========================================================================
  const p3Group = levelGroups.p3;
  const p3BaseY = 11.55;
  const p3Height = 3.85;
  const p3CenterY = p3BaseY + p3Height * 0.5;

  registerFullWingResidence('residencia-03-norte', -5.65, p3CenterY, 10.70, p3Height - 0.15, p3Group, false);
  registerFullWingResidence('residencia-03-sur', 4.87, p3CenterY, 10.34, p3Height - 0.15, p3Group, false);

  addCentralCoreWithStaircase(p3Group, p3CenterY, p3Height);

  // 2da TERRAZA CONTINUA EN CURVA "S" (y = 11.55m)
  const balconyP3Front = createContinuousSCurveBalcony(materials, 0.08, true, false);
  balconyP3Front.position.y = p3BaseY;
  p3Group.add(balconyP3Front);

  addMonumentalCylindricalColumns(p3Group, p3CenterY, p3Height, false);
  addFacadeTerracottaSpines(p3Group, p3CenterY, p3Height, 0.08, false);

  const leftLatP3 = createLateralFacadeSegment('left', p3Height, materials, 3, false);
  leftLatP3.position.set(-11.05, p3CenterY, 0);
  p3Group.add(leftLatP3);

  const rightLatP3 = createLateralFacadeSegment('right', p3Height, materials, 3, false);
  rightLatP3.position.set(10.35, p3CenterY, 0);
  p3Group.add(rightLatP3);

  const rearP3 = createRearWindowFacadeSegment(p3Height, materials, 3, false);
  rearP3.position.set(0, p3CenterY, -5.55);
  p3Group.add(rearP3);

  buildingRoot.add(p3Group);

  // ==========================================================================
  // 5. NIVEL MIRADOR (PENTHOUSE DÚPLEX DE DOBLE PISO, y = 15.40 a 23.10m — 2 PISOS COMPLETOS DE 3.85m = 7.70m)
  // ==========================================================================
  // Exactamente como el Dúplex de Planta Baja (PB + P1 = 7.70m), el Penthouse (Mirador Norte y Mirador Sur)
  // es de DOBLE PISO (PH Planta Baja de y = 15.40 a 19.25m + PH Planta Alta de y = 19.25 a 23.10m),
  // tal como se observa en `RC-exterior.ventanal-PH.jpeg`, `RC-exterior.frontal.jpeg`,
  // `RC-exterior.costado.izquierdo.jpeg` y `RC-exterior.entrada-costado.jpeg`.
  const miradorGroup = levelGroups.mirador;
  const miradorBaseY = 15.40;
  const miradorFloorH = 3.85;
  const miradorHeight = miradorFloorH * 2; // 7.70m (2 pisos completos)
  const miradorCenterY = miradorBaseY + miradorHeight * 0.5; // 19.25m
  const phLowerCenterY = miradorBaseY + miradorFloorH * 0.5; // 17.325m (1er piso del Penthouse)
  const phUpperCenterY = miradorBaseY + miradorFloorH * 1.5; // 21.175m (2do piso del Penthouse)

  registerFullWingResidence(
    'mirador-norte',
    -5.65,
    miradorCenterY,
    10.70,
    miradorHeight - 0.30,
    miradorGroup,
    true
  );
  registerFullWingResidence(
    'mirador-sur',
    4.87,
    miradorCenterY,
    10.34,
    miradorHeight - 0.30,
    miradorGroup,
    true
  );

  addCentralCoreWithStaircase(miradorGroup, miradorCenterY, miradorHeight);

  // 3ra TERRAZA JARDÍN SUPERIOR EN CURVA "S" DEL PENTHOUSE DÚPLEX (y = 15.40m)
  const balconyMiradorFront = createContinuousSCurveBalcony(materials, 0.14, true, true);
  balconyMiradorFront.position.y = miradorBaseY;
  miradorGroup.add(balconyMiradorFront);

  // Las 5 columnas cilíndricas frontales suben limpias los 2 pisos completos del Penthouse (7.70m+) hasta la cubierta en "V"
  addMonumentalCylindricalColumns(miradorGroup, miradorCenterY, miradorHeight, true);

  // Las 2 torres frontales de celosías terracota cubren el 1er piso y el 2do piso del Penthouse Dúplex
  addFacadeTerracottaSpines(miradorGroup, phLowerCenterY, miradorFloorH, 0.14, false);
  addFacadeTerracottaSpines(miradorGroup, phUpperCenterY, miradorFloorH, 0.14, true);

  // Fachadas Laterales (Oeste X- y Este X+) de los DOS pisos del Penthouse (Piso 1 en 17.325m y Piso 2 en 21.175m)
  const leftLatPHLower = createLateralFacadeSegment('left', miradorFloorH, materials, 4, false);
  leftLatPHLower.position.set(-11.05, phLowerCenterY, 0);
  miradorGroup.add(leftLatPHLower);

  const rightLatPHLower = createLateralFacadeSegment('right', miradorFloorH, materials, 4, false);
  rightLatPHLower.position.set(10.35, phLowerCenterY, 0);
  miradorGroup.add(rightLatPHLower);

  const leftLatPHUpper = createLateralFacadeSegment('left', miradorFloorH, materials, 5, true);
  leftLatPHUpper.position.set(-11.05, phUpperCenterY, 0);
  miradorGroup.add(leftLatPHUpper);

  const rightLatPHUpper = createLateralFacadeSegment('right', miradorFloorH, materials, 5, true);
  rightLatPHUpper.position.set(10.35, phUpperCenterY, 0);
  miradorGroup.add(rightLatPHUpper);

  // Fachada Posterior Plana de Ventanas (Z- = -5.55m, SIN BALCONES) en los DOS pisos del Penthouse
  const rearPHLower = createRearWindowFacadeSegment(miradorFloorH, materials, 4, false);
  rearPHLower.position.set(0, phLowerCenterY, -5.55);
  miradorGroup.add(rearPHLower);

  const rearPHUpper = createRearWindowFacadeSegment(miradorFloorH, materials, 5, true);
  rearPHUpper.position.set(0, phUpperCenterY, -5.55);
  miradorGroup.add(rearPHUpper);

  buildingRoot.add(miradorGroup);

  // ==========================================================================
  // 6. CUBIERTA MONUMENTAL PLEGADA EN "V" (Coronando el 2do Piso del Penthouse en y = 23.10m)
  // ==========================================================================
  const pergolaGroup = levelGroups.pergola;
  const monumentalCanopy = createMonumentalOrigamiCanopy(materials);
  monumentalCanopy.position.set(0, 23.10, 0);
  pergolaGroup.add(monumentalCanopy);
  buildingRoot.add(pergolaGroup);

  // ==========================================================================
  // 7. ANCLAJES 3D PARA HOTSPOTS E INTERACCIÓN DE UNIDADES
  // ==========================================================================
  const unitAnchors: UnitAnchor[] = [
    {
      id: 'jardin-norte',
      code: 'RC-PB-N',
      name: 'Jardín Norte (Dúplex)',
      levelKey: 'pb',
      position: new THREE.Vector3(-5.8, 4.2, 8.8),
    },
    {
      id: 'jardin-sur',
      code: 'RC-PB-S',
      name: 'Jardín Sur (Dúplex)',
      levelKey: 'pb',
      position: new THREE.Vector3(5.4, 4.2, 7.6),
    },
    {
      id: 'residencia-02-norte',
      code: 'RC-2-N',
      name: 'Residencia 2-N',
      levelKey: 'p2',
      position: new THREE.Vector3(-5.8, 9.6, 8.8),
    },
    {
      id: 'residencia-02-sur',
      code: 'RC-2-S',
      name: 'Residencia 2-S',
      levelKey: 'p2',
      position: new THREE.Vector3(5.4, 9.6, 7.6),
    },
    {
      id: 'residencia-03-norte',
      code: 'RC-3-N',
      name: 'Residencia 3-N',
      levelKey: 'p3',
      position: new THREE.Vector3(-5.8, 13.5, 8.8),
    },
    {
      id: 'residencia-03-sur',
      code: 'RC-3-S',
      name: 'Residencia 3-S',
      levelKey: 'p3',
      position: new THREE.Vector3(5.4, 13.5, 7.6),
    },
    {
      id: 'mirador-norte',
      code: 'RC-PH-N',
      name: 'Mirador Norte (PH Dúplex)',
      levelKey: 'mirador',
      position: new THREE.Vector3(-5.8, 19.2, 8.8),
    },
    {
      id: 'mirador-sur',
      code: 'RC-PH-S',
      name: 'Mirador Sur (PH Dúplex)',
      levelKey: 'mirador',
      position: new THREE.Vector3(5.4, 19.2, 7.6),
    },
  ];

  // ==========================================================================
  // 8. SISTEMA DE ILUMINACIÓN ARQUITECTÓNICA GLOBAL Y SOMBRAS DINÁMICAS (MAÑANA / HORA DORADA / NOCHE)
  // ==========================================================================
  const lightsGroup = new THREE.Group();

  const ambientLight = new THREE.AmbientLight(0xFFFBF2, 1.35);
  lightsGroup.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xD8E8F8, 0x8C7B65, 1.15);
  hemiLight.position.set(0, 45, 0);
  lightsGroup.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xFFFDF8, 2.85);
  sunLight.position.set(34, 48, 38);
  sunLight.target.position.set(0, 9.5, 0);
  lightsGroup.add(sunLight.target);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 6;
  sunLight.shadow.camera.far = 155;
  const d = 32;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0004;
  sunLight.shadow.normalBias = 0.018;
  sunLight.shadow.radius = 2.0;
  lightsGroup.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xD8E4F0, 1.18);
  fillLight.position.set(-32, 24, 28);
  lightsGroup.add(fillLight);

  // Luz rasante cálida de Hora Dorada (Atardecer en el oeste del valle de Caracas)
  const sunsetGrazingLight = new THREE.DirectionalLight(0xFF7B2E, 0.0);
  sunsetGrazingLight.position.set(-54, 14, 26);
  sunsetGrazingLight.target.position.set(0, 11.0, 0);
  lightsGroup.add(sunsetGrazingLight.target);
  lightsGroup.add(sunsetGrazingLight);

  const warmFacadeGlow = new THREE.PointLight(0xFFA845, 0.0, 38, 1.4);
  warmFacadeGlow.position.set(-1.5, 12.0, 11.0);
  lightsGroup.add(warmFacadeGlow);

  // Luminaria consolidada para el espejo de agua de las piscinas de Planta Baja
  // Se mantienen únicamente 2 PointLights con visible=true permanente para evitar
  // recompilaciones de shaders WebGL (NUM_POINT_LIGHTS constante) y desbordamientos en móviles.
  const poolUnderwaterLight = new THREE.PointLight(0x18D8F0, 0.0, 26, 1.4);
  poolUnderwaterLight.position.set(0.0, 1.2, 10.2);
  lightsGroup.add(poolUnderwaterLight);

  let targetSolarMode: SolarTimeMode = 'morning';
  const prevSunPos = new THREE.Vector3().copy(sunLight.position);

  // Constantes pre-alojadas fuera del bucle para Cero Garbage Collection (GC) por frame
  const sunPosMorning = new THREE.Vector3(34, 48, 38);
  const sunPosGolden = new THREE.Vector3(-48, 16.5, 34);
  const sunPosNight = new THREE.Vector3(18, 42, -28);

  const fillPosMorning = new THREE.Vector3(-32, 24, 28);
  const fillPosGolden = new THREE.Vector3(36, 26, 24);
  const fillPosNight = new THREE.Vector3(-28, 22, 24);

  const colSunMorning = new THREE.Color(0xFFFDF8);
  const colSunGolden = new THREE.Color(0xFF9238);
  const colSunNight = new THREE.Color(0x5B78B2);
  const colSunsetGrazing = new THREE.Color(0xFF6E24);

  const colAmbMorning = new THREE.Color(0xFFFBF2);
  const colAmbGolden = new THREE.Color(0xF6CCA2);
  const colAmbNight = new THREE.Color(0x1E283B);

  const colHemiSkyMorning = new THREE.Color(0xD8E8F8);
  const colHemiGndMorning = new THREE.Color(0x8C7B65);
  const colHemiSkyGolden = new THREE.Color(0xFF9E52);
  const colHemiGndGolden = new THREE.Color(0x4E3222);
  const colHemiSkyNight = new THREE.Color(0x1C2B48);
  const colHemiGndNight = new THREE.Color(0x14100C);

  const colFillMorning = new THREE.Color(0xD8E4F0);
  const colFillGolden = new THREE.Color(0x788CC4);
  const colFillNight = new THREE.Color(0x3A5078);

  const updateLightingMode = (mode: SolarTimeMode, immediate: boolean = false) => {
    targetSolarMode = mode;
    if (immediate) {
      transitionStep(mode, 1.0);
    }
  };

  const transitionStep = (mode: SolarTimeMode = targetSolarMode, deltaFactor: number = 0.08): boolean => {
    transitionGlassMaterials(materials, mode, deltaFactor);

    prevSunPos.copy(sunLight.position);
    const t = Math.max(0.01, Math.min(1.0, deltaFactor));

    if (mode === 'morning') {
      sunLight.position.lerp(sunPosMorning, t);
      sunLight.color.lerp(colSunMorning, t);
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, 2.85, t);
      sunLight.shadow.radius = THREE.MathUtils.lerp(sunLight.shadow.radius, 1.8, t);

      sunsetGrazingLight.intensity = THREE.MathUtils.lerp(sunsetGrazingLight.intensity, 0.0, t);

      ambientLight.color.lerp(colAmbMorning, t);
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, 1.35, t);

      hemiLight.color.lerp(colHemiSkyMorning, t);
      hemiLight.groundColor.lerp(colHemiGndMorning, t);
      hemiLight.intensity = THREE.MathUtils.lerp(hemiLight.intensity, 1.15, t);

      fillLight.position.lerp(fillPosMorning, t);
      fillLight.color.lerp(colFillMorning, t);
      fillLight.intensity = THREE.MathUtils.lerp(fillLight.intensity, 1.18, t);

      warmFacadeGlow.intensity = THREE.MathUtils.lerp(warmFacadeGlow.intensity, 0.0, t);
      poolUnderwaterLight.intensity = THREE.MathUtils.lerp(poolUnderwaterLight.intensity, 0.0, t);
    } else if (mode === 'golden') {
      sunLight.position.lerp(sunPosGolden, t);
      sunLight.color.lerp(colSunGolden, t);
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, 3.45, t);
      sunLight.shadow.radius = THREE.MathUtils.lerp(sunLight.shadow.radius, 3.2, t);

      sunsetGrazingLight.color.lerp(colSunsetGrazing, t);
      sunsetGrazingLight.intensity = THREE.MathUtils.lerp(sunsetGrazingLight.intensity, 1.38, t);

      ambientLight.color.lerp(colAmbGolden, t);
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, 0.98, t);

      hemiLight.color.lerp(colHemiSkyGolden, t);
      hemiLight.groundColor.lerp(colHemiGndGolden, t);
      hemiLight.intensity = THREE.MathUtils.lerp(hemiLight.intensity, 1.08, t);

      fillLight.position.lerp(fillPosGolden, t);
      fillLight.color.lerp(colFillGolden, t);
      fillLight.intensity = THREE.MathUtils.lerp(fillLight.intensity, 0.92, t);

      warmFacadeGlow.intensity = THREE.MathUtils.lerp(warmFacadeGlow.intensity, 2.85, t);
      poolUnderwaterLight.intensity = THREE.MathUtils.lerp(poolUnderwaterLight.intensity, 2.25, t);
    } else {
      sunLight.position.lerp(sunPosNight, t);
      sunLight.color.lerp(colSunNight, t);
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, 0.55, t);
      sunLight.shadow.radius = THREE.MathUtils.lerp(sunLight.shadow.radius, 2.6, t);

      sunsetGrazingLight.intensity = THREE.MathUtils.lerp(sunsetGrazingLight.intensity, 0.0, t);

      ambientLight.color.lerp(colAmbNight, t);
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, 0.62, t);

      hemiLight.color.lerp(colHemiSkyNight, t);
      hemiLight.groundColor.lerp(colHemiGndNight, t);
      hemiLight.intensity = THREE.MathUtils.lerp(hemiLight.intensity, 0.55, t);

      fillLight.position.lerp(fillPosNight, t);
      fillLight.color.lerp(colFillNight, t);
      fillLight.intensity = THREE.MathUtils.lerp(fillLight.intensity, 0.45, t);

      warmFacadeGlow.intensity = THREE.MathUtils.lerp(warmFacadeGlow.intensity, 5.2, t);
      poolUnderwaterLight.intensity = THREE.MathUtils.lerp(poolUnderwaterLight.intensity, 4.8, t);
    }

    const sunMovedDistSq = prevSunPos.distanceToSquared(sunLight.position);
    if (sunMovedDistSq > 0.00001 || deltaFactor >= 1.0) {
      sunLight.updateMatrixWorld();
      sunLight.target.updateMatrixWorld();
      sunLight.shadow.camera.updateProjectionMatrix();
      return true;
    }

    return false;
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
