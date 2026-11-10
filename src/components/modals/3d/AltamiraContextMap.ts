import * as THREE from 'three';
import { SolarTimeMode } from './ArchitecturalScene';

export interface AltamiraContextController {
  rootGroup: THREE.Group;
  updateContextSolarMode: (mode: SolarTimeMode, deltaFactor?: number, cameraPosition?: THREE.Vector3) => void;
  setAvilaDebugMode: (enabled: boolean) => void;
  getAvilaFurthestPointDistance: (cameraPosition: THREE.Vector3) => number;
  avilaMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
  updateCameraPosition?: (cameraPos: THREE.Vector3) => void;
}

/**
 * Función de altura topográfica real del Parque Nacional El Ávila (Waraira Repano)
 * visto desde Altamira (Transversal 8), abarcando desde el Pico Occidental y Hotel Humboldt (Oeste)
 * pasando por Sabas Nieves, Silla de Caracas y Pico Oriental (Centro-Norte) hasta Pico Naiguatá (Este).
 */
function sampleAvilaElevation(x: number, z: number): number {
  // z va desde -22m (piedemonte norte de Altamira / Cota Mil) hasta -125m (cumbre maestra de la cordillera)
  const depthNorm = THREE.MathUtils.clamp((-z - 22.0) / 103.0, 0.0, 1.0);
  if (depthNorm <= 0.0) return 0.0;

  // Perfil de ascenso firme y continuo desde la Cota Mil hacia la fila maestra (vertiente sur imponente)
  const ridgeEnvelope = Math.pow(Math.sin(depthNorm * Math.PI * 0.52), 1.10);

  // Hitos longitudinales auténticos del Waraira Repano (Oeste a Este: x de -145 a +145)
  // 1. Hotel Humboldt / Pico El Ávila (x ~ -54m) con meseta cimera de ~68m
  const humboldtPeak = 68.0 * Math.exp(-Math.pow((x + 54.0) / 18.0, 2.0));
  // 2. Pico Occidental (x ~ -28m, cumbre majestuosa de ~82m)
  const occidentalPeak = 82.0 * Math.exp(-Math.pow((x + 28.0) / 18.5, 2.0));
  // 3. Fila de La Silla de Caracas (x ~ -4m a 0m) con cota de ~64m y Pico Oriental (x ~ +20m, cota ~88m)
  const sillaSaddle = 64.0 * Math.exp(-Math.pow((x + 2.0) / 16.0, 2.0));
  const orientalPeak = 88.0 * Math.exp(-Math.pow((x - 20.0) / 19.0, 2.0));
  // 4. Estribación Galindo (x ~ +50m) y Macizo de Pico Naiguatá (x ~ +78m, cumbre más alta de ~94m)
  const naiguataPeak = 94.0 * Math.exp(-Math.pow((x - 78.0) / 25.0, 2.0));
  const easternSpur = 58.0 * Math.exp(-Math.pow((x - 115.0) / 24.0, 2.0));
  const westernSpur = 52.0 * Math.exp(-Math.pow((x + 112.0) / 23.0, 2.0));

  const mainCrestHeight =
    westernSpur +
    humboldtPeak +
    occidentalPeak +
    sillaSaddle +
    orientalPeak +
    naiguataPeak +
    easternSpur;

  // Quebradas y contrafuertes verticales característicos del Waraira Repano
  // (Quebrada Chacao, Quebrada Quintero, Quebrada Sebucán y Fila de Sabas Nieves)
  const spurRidges =
    Math.sin(x * 0.18 + z * 0.08) * 5.8 +
    Math.cos(x * 0.38 - z * 0.12) * 3.8 +
    Math.sin(x * 0.78 + z * 0.16) * 2.2 +
    Math.sin(x * 1.40 - z * 0.28) * 0.9;

  // Estribaciones menores del piedemonte sobre la Cota Mil
  const foothillsSubRidge =
    Math.sin(depthNorm * Math.PI * 1.40) *
    (9.5 + 4.0 * Math.cos(x * 0.14)) *
    (1.0 - depthNorm * 0.40);

  // Micro-relieve de roca metamórfica (esquistos y cuarcitas de la Cordillera de la Costa)
  const rockFacetNoise =
    Math.sin(x * 2.8 + z * 1.9) * 0.45 +
    Math.cos(x * 1.7 - z * 3.2) * 0.35;

  // Atenuación suave en los extremos laterales del arco panorámico (x > 105m)
  const lateralFade = 1.0 - THREE.MathUtils.smoothstep(Math.abs(x), 105.0, 145.0);

  const rawHeight =
    (mainCrestHeight * ridgeEnvelope +
      spurRidges * Math.pow(depthNorm, 0.65) +
      foothillsSubRidge +
      rockFacetNoise) *
    lateralFade;

  return Math.max(0.0, rawHeight);
}

let cachedAltamiraMapCanvas: HTMLCanvasElement | null = null;

/**
 * Genera la textura cartográfica de la Maqueta Urbana de Altamira con caché de lienzo 2D
 * (Transversal 8, 2da y 3ra Avenida, retícula topográfica, cotas en bronce y drenaje visual).
 */
function createAltamiraCartographicMapTexture(maxAnisotropy: number): THREE.CanvasTexture {
  if (!cachedAltamiraMapCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const cx = 1024;
      const cy = 1024;

      // 1. Fondo base de maqueta arquitectónica en basalto antracita cálido
      const bgGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 1020);
      bgGrad.addColorStop(0.0, '#221E19');
      bgGrad.addColorStop(0.55, '#1B1814');
      bgGrad.addColorStop(0.85, '#15120F');
      bgGrad.addColorStop(1.0, '#0E0C0A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 2048, 2048);

      // 2. Retícula cartográfica fina de ingeniería (UTM Caracas / Chacao)
      ctx.strokeStyle = 'rgba(201, 168, 106, 0.08)';
      ctx.lineWidth = 1;
      const gridStep = 32;
      for (let i = 0; i <= 2048; i += gridStep) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 2048);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(2048, i);
        ctx.stroke();
      }

      // Retícula principal cada 128px con cruces topográficas
      ctx.strokeStyle = 'rgba(201, 168, 106, 0.16)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 2048; i += 128) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 2048);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(2048, i);
        ctx.stroke();
      }

      // 3. Curvas de nivel topográficas suaves del piedemonte de Altamira (pendiente Norte -> Sur)
      ctx.strokeStyle = 'rgba(201, 168, 106, 0.14)';
      ctx.lineWidth = 1.4;
      for (let c = 0; c < 18; c++) {
        const baseY = 120 + c * 105;
        ctx.beginPath();
        for (let x = 0; x <= 2048; x += 24) {
          const wave =
            Math.sin(x * 0.0045 + c * 0.5) * 28 +
            Math.cos(x * 0.011 - c * 0.3) * 14;
          const y = baseY + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 4. Anillos concéntricos de compás solar y graduación acimutal
      const rings = [340, 560, 780, 940, 990];
      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle =
          idx === rings.length - 1
            ? 'rgba(201, 168, 106, 0.42)'
            : 'rgba(201, 168, 106, 0.18)';
        ctx.lineWidth = idx === rings.length - 1 ? 3 : 1.5;
        ctx.stroke();
      });

      // Marcas de grados en el anillo perimetral exterior
      for (let deg = 0; deg < 360; deg += 3) {
        const rad = (deg * Math.PI) / 180;
        const isMajor = deg % 15 === 0;
        const rInner = isMajor ? 945 : 968;
        const rOuter = 988;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rad) * rInner, cy + Math.sin(rad) * rInner);
        ctx.lineTo(cx + Math.cos(rad) * rOuter, cy + Math.sin(rad) * rOuter);
        ctx.strokeStyle = isMajor
          ? 'rgba(201, 168, 106, 0.48)'
          : 'rgba(201, 168, 106, 0.20)';
        ctx.lineWidth = isMajor ? 2.2 : 1.0;
        ctx.stroke();
      }
    }
    cachedAltamiraMapCanvas = canvas;
  }

  const texture = new THREE.CanvasTexture(cachedAltamiraMapCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Crea una placa cartográfica de alta resolución para nombres de calles y referencias cardinales.
 */
function createStreetLabelMesh(
  text: string,
  subtext: string | null,
  width: number,
  depth: number,
  maxAnisotropy: number
): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 1024, 192);

    // Fondo translúcido tipo placa de bronce/antracita grabada
    ctx.fillStyle = 'rgba(18, 16, 13, 0.78)';
    ctx.beginPath();
    ctx.roundRect(16, 22, 992, 148, 22);
    ctx.fill();

    ctx.strokeStyle = 'rgba(201, 168, 106, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(16, 22, 992, 148, 22);
    ctx.stroke();

    // Líneas ornamentales laterales
    ctx.strokeStyle = 'rgba(201, 168, 106, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(46, 96);
    ctx.lineTo(126, 96);
    ctx.moveTo(898, 96);
    ctx.lineTo(978, 96);
    ctx.stroke();

    ctx.fillStyle = '#F5EFE4';
    ctx.font = '600 44px "Inter", "Helvetica Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 512, subtext ? 78 : 96);

    if (subtext) {
      ctx.fillStyle = '#C9A86A';
      ctx.font = '500 26px "Inter", "Helvetica Neue", sans-serif';
      ctx.fillText(subtext, 512, 130);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;

  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const geo = new THREE.PlaneGeometry(width, depth);
  geo.rotateX(-Math.PI * 0.5);
  return new THREE.Mesh(geo, mat);
}

/**
 * Crea la textura radial para los halos cálidos de iluminación vial sobre las avenidas de Altamira.
 */
function createStreetLightPoolTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 4, 128, 128, 124);
    grad.addColorStop(0.0, 'rgba(255, 198, 112, 0.95)');
    grad.addColorStop(0.35, 'rgba(255, 162, 68, 0.52)');
    grad.addColorStop(0.7, 'rgba(235, 125, 38, 0.16)');
    grad.addColorStop(1.0, 'rgba(235, 125, 38, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Crea la textura difusa de bruma orográfica para las faldas y cañadas de El Ávila.
 */
function createAvilaMistTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 256);
    const grad = ctx.createRadialGradient(256, 128, 18, 256, 128, 245);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.55)');
    grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.28)');
    grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.08)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Construye el sistema completo de Maqueta Cartográfica 3D de Altamira + Cordillera Volumétrica 3D de El Ávila
 * con sincronización dinámica para Día, Hora Dorada y Noche.
 */
export function createAltamiraUrbanMapAndAvilaBackdrop(
  maxAnisotropy: number = 16
): AltamiraContextController {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'AltamiraUrbanMapAndAvilaBackdrop';

  // Nivel base justo debajo de la losa inferior del sótano (-4.22m)
  const baseY = -4.22;

  // ==========================================================================
  // 1. MESA CARTOGRÁFICA CIRCULAR BISELADA DE ALTAMIRA (R = 88m)
  // ==========================================================================
  const mapTex = createAltamiraCartographicMapTexture(maxAnisotropy);
  const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    map: mapTex,
    roughness: 0.86,
    metalness: 0.08,
  });

  const tableCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(86.0, 88.0, 0.72, 96),
    tableMaterial
  );
  tableCylinder.position.y = baseY - 0.36;
  tableCylinder.receiveShadow = true;
  rootGroup.add(tableCylinder);

  // Bisel perimetral en bronce satinado de la maqueta
  const rimRingMat = new THREE.MeshStandardMaterial({
    color: 0xC9A86A,
    roughness: 0.32,
    metalness: 0.78,
  });
  const outerBrassRing = new THREE.Mesh(
    new THREE.RingGeometry(85.2, 86.0, 96),
    rimRingMat
  );
  outerBrassRing.rotation.x = -Math.PI * 0.5;
  outerBrassRing.position.y = baseY + 0.01;
  rootGroup.add(outerBrassRing);

  // ==========================================================================
  // 2. TRAZADO VIAL 3D DE ALTAMIRA (TRANSVERSAL 8, 2DA AVENIDA Y 3RA AVENIDA)
  // ==========================================================================
  const roadAsphaltMat = new THREE.MeshStandardMaterial({
    color: 0x161513,
    roughness: 0.78,
    metalness: 0.10,
  });

  const sidewalkStoneMat = new THREE.MeshStandardMaterial({
    color: 0x28241E,
    roughness: 0.72,
    metalness: 0.06,
  });

  const curbBronzeMat = new THREE.MeshStandardMaterial({
    color: 0x8C7452,
    roughness: 0.42,
    metalness: 0.55,
  });

  const roadLineMat = new THREE.MeshBasicMaterial({
    color: 0xC9A86A,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  // Calzadas principales
  // A. Transversal 8 de Altamira (Eje Este-Oeste frente a la fachada Sur Z+ = +18.2m)
  const transversal8Road = new THREE.Mesh(
    new THREE.BoxGeometry(142.0, 0.06, 7.6),
    roadAsphaltMat
  );
  transversal8Road.position.set(0, baseY + 0.03, 18.2);
  transversal8Road.receiveShadow = true;
  rootGroup.add(transversal8Road);

  // B. Pasaje Urbano Norte / Transversal 9 (Eje Este-Oeste al norte Z- = -18.2m)
  const northCorridorRoad = new THREE.Mesh(
    new THREE.BoxGeometry(136.0, 0.06, 6.2),
    roadAsphaltMat
  );
  northCorridorRoad.position.set(0, baseY + 0.03, -18.2);
  northCorridorRoad.receiveShadow = true;
  rootGroup.add(northCorridorRoad);

  // C. 2da Avenida de Altamira (Eje Norte-Sur al Oeste X- = -22.2m)
  const av2Road = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, 0.06, 128.0),
    roadAsphaltMat
  );
  av2Road.position.set(-22.2, baseY + 0.03, 4.0);
  av2Road.receiveShadow = true;
  rootGroup.add(av2Road);

  // Isla central arborizada de la 2da Avenida de Altamira
  const av2Medians = [
    { z: -31.0, len: 16.0 },
    { z: 0.0, len: 26.0 },
    { z: 36.0, len: 20.0 },
  ];
  av2Medians.forEach((m) => {
    const medianCurb = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.18, m.len),
      sidewalkStoneMat
    );
    medianCurb.position.set(-22.2, baseY + 0.09, m.z);
    medianCurb.receiveShadow = true;
    rootGroup.add(medianCurb);

    const medianGrass = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.22, m.len - 0.6),
      new THREE.MeshStandardMaterial({ color: 0x263B25, roughness: 0.88 })
    );
    medianGrass.position.set(-22.2, baseY + 0.11, m.z);
    rootGroup.add(medianGrass);
  });

  // D. 3ra Avenida de Altamira (Eje Norte-Sur al Este X+ = +21.0m, conectando con el acceso de Residencias Caroní)
  const av3Road = new THREE.Mesh(
    new THREE.BoxGeometry(8.2, 0.06, 128.0),
    roadAsphaltMat
  );
  av3Road.position.set(21.0, baseY + 0.03, 4.0);
  av3Road.receiveShadow = true;
  rootGroup.add(av3Road);

  // Líneas divisorias discontinuas y pasos peatonales cebreados en las intersecciones de Altamira
  const dashGeoEW = new THREE.PlaneGeometry(2.2, 0.14);
  dashGeoEW.rotateX(-Math.PI * 0.5);
  for (let x = -64; x <= 64; x += 4.8) {
    if (Math.abs(x + 22.2) < 5.5 || Math.abs(x - 21.0) < 5.5) continue;
    const dashT8 = new THREE.Mesh(dashGeoEW, roadLineMat);
    dashT8.position.set(x, baseY + 0.07, 18.2);
    rootGroup.add(dashT8);

    const dashNorth = new THREE.Mesh(dashGeoEW, roadLineMat);
    dashNorth.position.set(x, baseY + 0.07, -18.2);
    rootGroup.add(dashNorth);
  }

  const dashGeoNS = new THREE.PlaneGeometry(0.14, 2.2);
  dashGeoNS.rotateX(-Math.PI * 0.5);
  for (let z = -46; z <= 56; z += 4.8) {
    if (Math.abs(z - 18.2) < 5.0 || Math.abs(z + 18.2) < 4.5) continue;
    const dashAv3 = new THREE.Mesh(dashGeoNS, roadLineMat);
    dashAv3.position.set(21.0, baseY + 0.07, z);
    rootGroup.add(dashAv3);
  }

  // Pasos peatonales (cebras arquitectónicas en las esquinas de Transversal 8 con 2da y 3ra Av.)
  const crosswalkLocations = [
    { x: -16.8, z: 18.2, rotY: 0, width: 5.8 },
    { x: -27.6, z: 18.2, rotY: 0, width: 5.8 },
    { x: 15.8, z: 18.2, rotY: 0, width: 5.8 },
    { x: 26.2, z: 18.2, rotY: 0, width: 5.8 },
    { x: -22.2, z: 13.4, rotY: Math.PI * 0.5, width: 6.8 },
    { x: 21.0, z: 13.4, rotY: Math.PI * 0.5, width: 6.4 },
  ];
  const stripeGeo = new THREE.PlaneGeometry(1.8, 0.32);
  stripeGeo.rotateX(-Math.PI * 0.5);
  crosswalkLocations.forEach((cw) => {
    const cwGroup = new THREE.Group();
    cwGroup.position.set(cw.x, baseY + 0.072, cw.z);
    cwGroup.rotation.y = cw.rotY;
    const count = Math.floor(cw.width / 0.68);
    for (let i = 0; i < count; i++) {
      const s = new THREE.Mesh(stripeGeo, roadLineMat);
      s.position.z = -cw.width * 0.5 + 0.34 + i * 0.68;
      cwGroup.add(s);
    }
    rootGroup.add(cwGroup);
  });

  // ==========================================================================
  // 3. MANZANAS URBANAS DE ALTAMIRA Y ACERAS PERIMETRALES EN BAJO RELIEVE
  // ==========================================================================
  // Acera perimetral de la manzana central de Residencias Caroní
  const centralBlockSidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(35.8, 0.18, 29.2),
    sidewalkStoneMat
  );
  centralBlockSidewalk.position.set(-0.6, baseY + 0.09, -0.2);
  centralBlockSidewalk.receiveShadow = true;
  rootGroup.add(centralBlockSidewalk);

  const centralBlockBronzeBorder = new THREE.Mesh(
    new THREE.BoxGeometry(36.05, 0.19, 29.45),
    curbBronzeMat
  );
  centralBlockBronzeBorder.position.set(-0.6, baseY + 0.08, -0.2);
  rootGroup.add(centralBlockBronzeBorder);

  // Definición de las 8 manzanas vecinas de Altamira alrededor de Residencias Caroní
  const neighborBlocks = [
    // Oeste de 2da Avenida (Manzana Central-Oeste)
    { x: -45.5, z: -0.2, w: 34.0, d: 29.2 },
    // Este de 3ra Avenida (Manzana Central-Este)
    { x: 43.5, z: -0.2, w: 34.0, d: 29.2 },
    // Sur de Transversal 8 (Manzanas Suroeste, Sur-Centro y Sureste)
    { x: -45.5, z: 37.5, w: 34.0, d: 28.0 },
    { x: -0.6, z: 37.5, w: 35.8, d: 28.0 },
    { x: 43.5, z: 37.5, w: 34.0, d: 28.0 },
    // Norte hacia el piedemonte de El Ávila (Manzanas Noroeste, Norte-Centro y Noreste)
    { x: -45.5, z: -27.2, w: 34.0, d: 9.2 },
    { x: -0.6, z: -27.2, w: 35.8, d: 9.2 },
    { x: 43.5, z: -27.2, w: 34.0, d: 9.2 },
  ];

  neighborBlocks.forEach((b) => {
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(b.w, 0.18, b.d),
      sidewalkStoneMat
    );
    sidewalk.position.set(b.x, baseY + 0.09, b.z);
    sidewalk.receiveShadow = true;
    rootGroup.add(sidewalk);

    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(b.w + 0.24, 0.16, b.d + 0.24),
      curbBronzeMat
    );
    curb.position.set(b.x, baseY + 0.075, b.z);
    rootGroup.add(curb);

    // Sustrato interior ajardinado de cada manzana vecina
    const innerLawn = new THREE.Mesh(
      new THREE.BoxGeometry(b.w - 2.6, 0.22, b.d - 2.6),
      new THREE.MeshStandardMaterial({
        color: 0x1F2C1E,
        roughness: 0.90,
        metalness: 0.02,
      })
    );
    innerLawn.position.set(b.x, baseY + 0.11, b.z);
    innerLawn.receiveShadow = true;
    rootGroup.add(innerLawn);
  });

  // ==========================================================================
  // 4. RÓTULOS CARTOGRÁFICOS DE CALLES Y AVENIDAS DE ALTAMIRA
  // ==========================================================================
  const labelT8Front = createStreetLabelMesh(
    'TRANSVERSAL 8 · ALTAMIRA',
    'CHACAO · CARACAS',
    18.5,
    3.2,
    maxAnisotropy
  );
  labelT8Front.position.set(-0.5, baseY + 0.085, 18.2);
  rootGroup.add(labelT8Front);

  const labelAv2 = createStreetLabelMesh(
    '2DA AVENIDA DE ALTAMIRA',
    'SENTIDO SUR — NORTE',
    19.0,
    3.1,
    maxAnisotropy
  );
  labelAv2.rotation.y = Math.PI * 0.5;
  labelAv2.position.set(-22.2, baseY + 0.22, 0.0);
  rootGroup.add(labelAv2);

  const labelAv3 = createStreetLabelMesh(
    '3RA AVENIDA DE ALTAMIRA',
    'ACCESO RESIDENCIAS CARONÍ',
    19.0,
    3.1,
    maxAnisotropy
  );
  labelAv3.rotation.y = -Math.PI * 0.5;
  labelAv3.position.set(21.0, baseY + 0.085, 0.0);
  rootGroup.add(labelAv3);

  const labelNorthAvila = createStreetLabelMesh(
    'NORTE · PARQUE NACIONAL EL ÁVILA',
    'WARAIRA REPANO · COTA 1.000 — 2.765 MSNM',
    22.0,
    3.4,
    maxAnisotropy
  );
  labelNorthAvila.position.set(0.0, baseY + 0.085, -18.2);
  rootGroup.add(labelNorthAvila);

  // ==========================================================================
  // 5. VOLÚMENES BAJOS ESTILIZADOS DE EDIFICIOS VECINOS DE ALTAMIRA
  // ==========================================================================
  const massingMat = new THREE.MeshStandardMaterial({
    color: 0x2B2620,
    roughness: 0.62,
    metalness: 0.08,
    transparent: true,
    opacity: 0.90,
  });

  const massingRoofMat = new THREE.MeshStandardMaterial({
    color: 0x38322A,
    roughness: 0.54,
    metalness: 0.14,
  });

  const massingEdgeMat = new THREE.LineBasicMaterial({
    color: 0xC9A86A,
    transparent: true,
    opacity: 0.30,
  });

  const neighborWindowMat = new THREE.MeshStandardMaterial({
    color: 0x2C3A48,
    emissive: new THREE.Color(0xFFB052),
    emissiveIntensity: 0.04,
    roughness: 0.25,
    metalness: 0.4,
  });

  const neighborBuildingsSpec = [
    // Oeste (al otro lado de la 2da Avenida)
    { x: -36.5, z: 6.5, w: 11.5, h: 7.2, d: 10.2, floors: 3 },
    { x: -37.2, z: -7.5, w: 10.8, h: 5.4, d: 9.6, floors: 2 },
    { x: -53.0, z: 0.5, w: 12.0, h: 9.2, d: 16.0, floors: 4 },
    // Este (al otro lado de la 3ra Avenida)
    { x: 34.5, z: 6.2, w: 11.2, h: 6.8, d: 10.0, floors: 3 },
    { x: 35.2, z: -7.2, w: 10.4, h: 5.2, d: 9.5, floors: 2 },
    { x: 51.0, z: -0.5, w: 12.5, h: 8.8, d: 15.5, floors: 4 },
    // Sur (al otro lado de la Transversal 8, más bajos para no obstruir la vista frontal)
    { x: -36.5, z: 32.0, w: 12.5, h: 5.5, d: 10.5, floors: 2 },
    { x: -9.5, z: 33.5, w: 12.0, h: 4.4, d: 9.2, floors: 2 },
    { x: 9.0, z: 33.5, w: 11.8, h: 4.2, d: 9.0, floors: 2 },
    { x: 35.0, z: 32.0, w: 12.2, h: 5.8, d: 10.5, floors: 2 },
    // Norte (Quintas bajas al pie del Ávila)
    { x: -35.0, z: -26.8, w: 11.0, h: 4.5, d: 6.2, floors: 2 },
    { x: -9.2, z: -26.8, w: 11.5, h: 4.2, d: 6.0, floors: 2 },
    { x: 8.8, z: -26.8, w: 11.2, h: 4.2, d: 6.0, floors: 2 },
    { x: 34.5, z: -26.8, w: 11.0, h: 4.6, d: 6.2, floors: 2 },
  ];

  neighborBuildingsSpec.forEach((nb) => {
    const bGroup = new THREE.Group();
    bGroup.position.set(nb.x, baseY + 0.22, nb.z);

    // Volumen principal
    const mainGeo = new THREE.BoxGeometry(nb.w, nb.h, nb.d);
    const mainMesh = new THREE.Mesh(mainGeo, massingMat);
    mainMesh.position.y = nb.h * 0.5;
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    bGroup.add(mainMesh);

    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mainGeo), massingEdgeMat);
    edges.position.y = nb.h * 0.5;
    bGroup.add(edges);

    // Ático / volumen secundario retranqueado
    const penthouseW = nb.w * 0.64;
    const penthouseH = 1.65;
    const penthouseD = nb.d * 0.62;
    const phGeo = new THREE.BoxGeometry(penthouseW, penthouseH, penthouseD);
    const phMesh = new THREE.Mesh(phGeo, massingRoofMat);
    phMesh.position.set(nb.w * 0.08, nb.h + penthouseH * 0.5, -nb.d * 0.06);
    phMesh.castShadow = true;
    phMesh.receiveShadow = true;
    bGroup.add(phMesh);

    const phEdges = new THREE.LineSegments(new THREE.EdgesGeometry(phGeo), massingEdgeMat);
    phEdges.position.copy(phMesh.position);
    bGroup.add(phEdges);

    // Franjas horizontales de entrepiso y ventanas estilizadas
    for (let f = 1; f <= nb.floors; f++) {
      const fy = (f - 0.42) * (nb.h / nb.floors);
      const winBand = new THREE.Mesh(
        new THREE.BoxGeometry(nb.w + 0.06, 0.44, nb.d + 0.06),
        neighborWindowMat
      );
      winBand.position.y = fy;
      bGroup.add(winBand);
    }

    rootGroup.add(bGroup);
  });

  // ==========================================================================
  // 6. ARBOLADO URBANO DE ALTAMIRA / CHACAO (CAOBAS, JABILLOS Y ARAGUANEYES)
  // ==========================================================================
  const urbanTrunkMat = new THREE.MeshStandardMaterial({
    color: 0x3D2E22,
    roughness: 0.88,
  });
  const canopyEmeraldMat = new THREE.MeshStandardMaterial({
    color: 0x26462C,
    roughness: 0.78,
  });
  const canopyOliveMat = new THREE.MeshStandardMaterial({
    color: 0x365934,
    roughness: 0.76,
  });
  const canopyAraguaneyMat = new THREE.MeshStandardMaterial({
    color: 0xB88B28,
    roughness: 0.72,
  });

  const urbanTreeCoords: { x: number; z: number; scale: number; isAraguaney?: boolean }[] = [
    // Isla central y aceras de la 2da Avenida
    { x: -22.2, z: -36.0, scale: 1.05 },
    { x: -22.2, z: -26.0, scale: 0.95, isAraguaney: true },
    { x: -22.2, z: -9.5, scale: 1.0 },
    { x: -22.2, z: 0.0, scale: 1.12 },
    { x: -22.2, z: 9.5, scale: 0.96 },
    { x: -22.2, z: 30.0, scale: 1.08, isAraguaney: true },
    { x: -22.2, z: 41.0, scale: 0.94 },
    // Aceras de la 3ra Avenida
    { x: 26.8, z: -12.0, scale: 1.02 },
    { x: 26.8, z: -2.0, scale: 0.92 },
    { x: 26.8, z: 11.0, scale: 1.06, isAraguaney: true },
    { x: 26.8, z: 26.0, scale: 0.98 },
    // Aceras de la Transversal 8 de Altamira
    { x: -42.0, z: 23.0, scale: 1.04 },
    { x: -30.5, z: 23.0, scale: 0.95 },
    { x: -14.0, z: 23.0, scale: 0.88 },
    { x: 14.0, z: 23.0, scale: 0.90 },
    { x: 30.0, z: 23.0, scale: 1.05, isAraguaney: true },
    { x: 42.5, z: 23.0, scale: 0.96 },
    // Piedemonte norte (Transversal 9 / falda de El Ávila)
    { x: -42.0, z: -22.5, scale: 1.15 },
    { x: -28.0, z: -22.5, scale: 1.08 },
    { x: -14.5, z: -22.5, scale: 1.02, isAraguaney: true },
    { x: 14.5, z: -22.5, scale: 1.04 },
    { x: 28.5, z: -22.5, scale: 1.12 },
    { x: 42.0, z: -22.5, scale: 1.10, isAraguaney: true },
  ];

  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.20, 2.2, 8);
  const foliageGeoMain = new THREE.DodecahedronGeometry(1.35, 1);
  const foliageGeoSub = new THREE.DodecahedronGeometry(0.95, 1);

  urbanTreeCoords.forEach((tc, i) => {
    const tGroup = new THREE.Group();
    tGroup.position.set(tc.x, baseY + 0.20, tc.z);
    tGroup.scale.setScalar(tc.scale);

    const trunk = new THREE.Mesh(trunkGeo, urbanTrunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    tGroup.add(trunk);

    const primaryMat = tc.isAraguaney
      ? canopyAraguaneyMat
      : i % 2 === 0
      ? canopyEmeraldMat
      : canopyOliveMat;

    const crownMain = new THREE.Mesh(foliageGeoMain, primaryMat);
    crownMain.scale.set(1.25, 0.78, 1.20);
    crownMain.position.set(0, 2.55, 0);
    crownMain.castShadow = true;
    crownMain.receiveShadow = true;
    tGroup.add(crownMain);

    const crownLeft = new THREE.Mesh(foliageGeoSub, primaryMat);
    crownLeft.scale.set(1.1, 0.72, 1.05);
    crownLeft.position.set(-0.75, 2.25, 0.35);
    crownLeft.castShadow = true;
    tGroup.add(crownLeft);

    const crownRight = new THREE.Mesh(foliageGeoSub, primaryMat);
    crownRight.scale.set(1.05, 0.75, 1.1);
    crownRight.position.set(0.72, 2.32, -0.32);
    crownRight.castShadow = true;
    tGroup.add(crownRight);

    rootGroup.add(tGroup);
  });

  // ==========================================================================
  // 7. ILUMINACIÓN VIAL CÁLIDA DE ALTAMIRA (OCASO / HORA DORADA Y NOCHE)
  // ==========================================================================
  const lampBulbMat = new THREE.MeshStandardMaterial({
    color: 0xFFE2B0,
    emissive: new THREE.Color(0xFFA834),
    emissiveIntensity: 0.05,
    roughness: 0.15,
  });

  const lightPoolTex = createStreetLightPoolTexture();
  const lightPoolMat = new THREE.MeshBasicMaterial({
    map: lightPoolTex,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });

  const warmTrafficTrailMat = new THREE.MeshBasicMaterial({
    color: 0xFFAE42,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const lampPostCoords = [
    // Transversal 8 de Altamira
    { x: -34.0, z: 14.2, rotY: 0 },
    { x: -16.5, z: 14.2, rotY: 0 },
    { x: -4.5, z: 22.1, rotY: Math.PI },
    { x: 14.5, z: 14.2, rotY: 0 },
    { x: 32.0, z: 14.2, rotY: 0 },
    // 2da Avenida de Altamira
    { x: -17.8, z: -10.0, rotY: -Math.PI * 0.5 },
    { x: -17.8, z: 6.0, rotY: -Math.PI * 0.5 },
    { x: -26.5, z: 26.0, rotY: Math.PI * 0.5 },
    // 3ra Avenida de Altamira (frente al portón y acceso de Residencias Caroní)
    { x: 16.8, z: -9.0, rotY: Math.PI * 0.5 },
    { x: 16.8, z: 8.5, rotY: Math.PI * 0.5 },
    { x: 25.2, z: 26.0, rotY: -Math.PI * 0.5 },
  ];

  const poleGeo = new THREE.CylinderGeometry(0.05, 0.07, 2.75, 8);
  const armGeo = new THREE.BoxGeometry(0.05, 0.05, 0.85);
  const headGeo = new THREE.BoxGeometry(0.22, 0.06, 0.36);
  const poolPlaneGeo = new THREE.PlaneGeometry(7.8, 7.8);
  poolPlaneGeo.rotateX(-Math.PI * 0.5);

  lampPostCoords.forEach((lp) => {
    const postGroup = new THREE.Group();
    postGroup.position.set(lp.x, baseY + 0.18, lp.z);
    postGroup.rotation.y = lp.rotY;

    const pole = new THREE.Mesh(poleGeo, curbBronzeMat);
    pole.position.y = 1.375;
    pole.castShadow = true;
    postGroup.add(pole);

    const arm = new THREE.Mesh(armGeo, curbBronzeMat);
    arm.position.set(0, 2.72, 0.38);
    postGroup.add(arm);

    const bulb = new THREE.Mesh(headGeo, lampBulbMat);
    bulb.position.set(0, 2.68, 0.72);
    postGroup.add(bulb);

    const groundHalo = new THREE.Mesh(poolPlaneGeo, lightPoolMat);
    groundHalo.position.set(0, 0.02, 1.35);
    postGroup.add(groundHalo);

    rootGroup.add(postGroup);
  });

  // Estelas lumínicas viales continuas sobre Transversal 8, 2da Av. y 3ra Av. (visibles en Ocaso y Noche)
  const t8LightTrail = new THREE.Mesh(
    new THREE.PlaneGeometry(118.0, 0.32).rotateX(-Math.PI * 0.5),
    warmTrafficTrailMat
  );
  t8LightTrail.position.set(0, baseY + 0.08, 19.6);
  rootGroup.add(t8LightTrail);

  const av2LightTrail = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 108.0).rotateX(-Math.PI * 0.5),
    warmTrafficTrailMat
  );
  av2LightTrail.position.set(-20.2, baseY + 0.08, 4.0);
  rootGroup.add(av2LightTrail);

  const av3LightTrail = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 108.0).rotateX(-Math.PI * 0.5),
    warmTrafficTrailMat
  );
  av3LightTrail.position.set(19.2, baseY + 0.08, 4.0);
  rootGroup.add(av3LightTrail);

  // ==========================================================================
  // 8. CORDILLERA VOLUMÉTRICA 3D DE EL ÁVILA (WARAIRA REPANO)
  //    CON CURVAS DE NIVEL TOPOGRÁFICAS REALISTAS Y SHADER DE PROFUNDIDAD ATMOSFÉRICA (BRUMA)
  // ==========================================================================
  const avilaGroup = new THREE.Group();
  avilaGroup.name = 'AvilaMountainVolumetricRange';
  avilaGroup.position.y = baseY;

  // Malla topográfica de alta resolución que abraza el horizonte norte de Caracas (hasta 94m de altura)
  const segX = 240;
  const segZ = 80;
  const minX = -145.0;
  const maxX = 145.0;
  const minZ = -125.0;
  const maxZ = -22.0;

  const vertexCount = (segX + 1) * (segZ + 1);
  const positions = new Float32Array(vertexCount * 3);
  const indices: number[] = [];

  let vIdx = 0;
  for (let iz = 0; iz <= segZ; iz++) {
    const z = minZ + (iz / segZ) * (maxZ - minZ);
    for (let ix = 0; ix <= segX; ix++) {
      const x = minX + (ix / segX) * (maxX - minX);
      // Curvatura panorámica en arco que rodea el valle de Altamira
      const arcZOffset = Math.pow(x / 145.0, 2.0) * 18.0;
      const worldZ = z + arcZOffset;
      const elev = sampleAvilaElevation(x, z);

      positions[vIdx * 3] = x;
      positions[vIdx * 3 + 1] = elev;
      positions[vIdx * 3 + 2] = worldZ;

      vIdx++;
    }
  }

  for (let iz = 0; iz < segZ; iz++) {
    for (let ix = 0; ix < segX; ix++) {
      const a = iz * (segX + 1) + ix;
      const b = iz * (segX + 1) + (ix + 1);
      const c = (iz + 1) * (segX + 1) + ix;
      const d = (iz + 1) * (segX + 1) + (ix + 1);

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const avilaTerrainGeo = new THREE.BufferGeometry();
  avilaTerrainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  avilaTerrainGeo.setIndex(indices);
  avilaTerrainGeo.computeVertexNormals();
  avilaTerrainGeo.computeBoundingBox();
  avilaTerrainGeo.computeBoundingSphere();

  // ==========================================================================
  // SHADERMATERIAL PERSONALIZADO CON BRUMA ATMOSFÉRICA BASADA EN PROFUNDIDAD (DEPTH-BASED FOG)
  // Utiliza la posición de la cámara y la profundidad del Z-Buffer (espacio de vista)
  // para aplicar una bruma atmosférica que incrementa gradualmente su densidad
  // con la distancia, reforzando la escala monumental y profundidad visual del Ávila.
  // ==========================================================================
  const avilaVertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    varying float vElevation;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vElevation = position.y;

      vNormal = normalize(mat3(modelMatrix) * normal);

      vec4 mvPosition = viewMatrix * worldPos;
      vViewPosition = -mvPosition.xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const avilaFragmentShader = `
    uniform vec3 uCameraPos;
    uniform float uFogNear;
    uniform float uFogFar;
    uniform float uFogDensity;
    uniform float uMaxFogFactor;
    uniform vec3 uFogColor;
    uniform vec3 uTerrainBaseColor;
    uniform vec3 uTerrainPeakColor;
    uniform vec3 uSunDirection;
    uniform vec3 uSunColor;
    uniform vec3 uAmbientColor;

    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    varying float vElevation;

    void main() {
      // 1. Profundidad del Z-Buffer (eje óptico de vista z) y distancia euclidiana al visor
      float viewDepth = vViewPosition.z;
      float distToCamera = length(vWorldPosition - uCameraPos);
      float effectiveDepth = max(viewDepth, distToCamera);

      // 2. Bruma atmosférica progresiva basada en profundidad (depth-based fog)
      float depthFog = smoothstep(uFogNear, uFogFar, effectiveDepth);
      depthFog = pow(depthFog, uFogDensity);
      depthFog = clamp(depthFog, 0.0, uMaxFogFactor);

      // Bruma sutil en el piedemonte sobre la Cota Mil para anclar la montaña frente a la ciudad
      float valleyMist = clamp((18.0 - vElevation) / 28.0, 0.0, 1.0) * 0.10;
      float totalMist = clamp(depthFog + valleyMist * (1.0 - depthFog), 0.0, uMaxFogFactor);

      // 3. Iluminación volumétrica y gradiente de relieve metamórfico
      vec3 normal = normalize(vNormal);
      vec3 sunDir = normalize(uSunDirection);
      float nDotL = max(dot(normal, sunDir), 0.0);

      // Transición de cota (bosque nublado exuberante a roca metamórfica en las cumbres)
      float elevFactor = clamp(vElevation / 90.0, 0.0, 1.0);
      vec3 terrainAlbedo = mix(uTerrainBaseColor, uTerrainPeakColor, elevFactor * 0.40);

      // Luz solar directa con modelado de sombras y luz ambiental difusa
      vec3 diffuse = terrainAlbedo * (uAmbientColor + uSunColor * (nDotL * 0.72 + 0.28));

      // Resalte de silueta atmosférica en las crestas superiores contra el horizonte
      vec3 viewDir = normalize(uCameraPos - vWorldPosition);
      float rim = 1.0 - max(dot(viewDir, normal), 0.0);
      diffuse += uSunColor * pow(rim, 3.8) * 0.18;

      // 4. Fusión de bruma atmosférica (Bruma del Waraira Repano)
      vec3 finalColor = mix(diffuse, uFogColor, totalMist);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const avilaShaderUniforms = {
    uCameraPos: { value: new THREE.Vector3(0, 20, 92) },
    uFogNear: { value: 60.0 },
    uFogFar: { value: 275.0 },
    uFogDensity: { value: 1.15 },
    uMaxFogFactor: { value: 0.64 }, // Tope equilibrado para nunca lavar las crestas
    uFogColor: { value: new THREE.Color(0x8BA3BA) },
    uTerrainBaseColor: { value: new THREE.Color(0x2A6232) },
    uTerrainPeakColor: { value: new THREE.Color(0x3B6B38) },
    uSunDirection: { value: new THREE.Vector3(34, 48, 38).normalize() },
    uSunColor: { value: new THREE.Color(0xFFFDF8) },
    uAmbientColor: { value: new THREE.Color(0x35281E) },
  };

  const avilaTerrainShaderMat = new THREE.ShaderMaterial({
    uniforms: avilaShaderUniforms,
    vertexShader: avilaVertexShader,
    fragmentShader: avilaFragmentShader,
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: true,
    transparent: false,
  });

  // Material de diagnóstico UNLIT (MeshBasicMaterial color: red 0xFF0000)
  // Permite verificar instantáneamente la visibilidad, posición en el espacio de coordenadas
  // y descartar cualquier problema de oclusión o iluminación/sombra/niebla.
  const avilaDebugMat = new THREE.MeshBasicMaterial({
    color: 0xFF0000,
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: true,
    fog: false,
    wireframe: false,
  });
  let isAvilaDebugActive = false;

  const avilaTerrainMesh = new THREE.Mesh<THREE.BufferGeometry, THREE.Material>(
    avilaTerrainGeo,
    avilaTerrainShaderMat
  );
  avilaTerrainMesh.receiveShadow = true;
  avilaTerrainMesh.castShadow = true;
  avilaTerrainMesh.frustumCulled = false; // Garantiza renderizado incondicional sin descarte por frustum
  avilaTerrainMesh.renderOrder = 0; // renderOrder 0 para el fondo montañoso del Ávila
  avilaGroup.add(avilaTerrainMesh);

  // 8B. Curvas de Nivel Topográficas Tridimensionales en Bronce (#C9A86A)
  // Complementan el shader con aristas táctiles de maqueta a cotas maestras equidistantes
  const contourMaterial = new THREE.LineBasicMaterial({
    color: 0xC9A86A,
    transparent: true,
    opacity: 0.68,
    fog: false,
  });

  const contourHeights = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0];
  const numSampleCols = 190;

  contourHeights.forEach((targetH) => {
    const contourPts: THREE.Vector3[] = [];
    for (let ix = 0; ix <= numSampleCols; ix++) {
      const x = minX + (ix / numSampleCols) * (maxX - minX);
      // Búsqueda biseccional de la coordenada Z donde la montaña alcanza exactamente targetH
      let bestZ = 0;
      let found = false;
      for (let sZ = maxZ; sZ >= minZ; sZ -= 1.4) {
        const h0 = sampleAvilaElevation(x, sZ);
        const h1 = sampleAvilaElevation(x, sZ - 1.4);
        if ((h0 <= targetH && h1 >= targetH) || (h0 >= targetH && h1 <= targetH)) {
          const t = Math.abs(h1 - h0) > 0.001 ? (targetH - h0) / (h1 - h0) : 0.5;
          bestZ = sZ - t * 1.4;
          found = true;
          break;
        }
      }
      if (found) {
        const arcZOffset = Math.pow(x / 145.0, 2.0) * 18.0;
        contourPts.push(new THREE.Vector3(x, targetH + 0.14, bestZ + arcZOffset));
      }
    }
    if (contourPts.length > 4) {
      const cGeo = new THREE.BufferGeometry().setFromPoints(contourPts);
      const cLine = new THREE.Line(cGeo, contourMaterial);
      avilaGroup.add(cLine);
    }
  });

  // Fila maestra longitudinal de cumbres (cresta divisoria de aguas de la Cordillera de la Costa)
  const crestLinePts: THREE.Vector3[] = [];
  for (let ix = 0; ix <= 220; ix++) {
    const x = minX + (ix / 220) * (maxX - minX);
    let maxH = 0;
    let maxHZ = -74.0;
    for (let sZ = maxZ; sZ >= minZ; sZ -= 1.8) {
      const h = sampleAvilaElevation(x, sZ);
      if (h > maxH) {
        maxH = h;
        maxHZ = sZ;
      }
    }
    if (maxH > 2.0) {
      const arcZOffset = Math.pow(x / 145.0, 2.0) * 18.0;
      crestLinePts.push(new THREE.Vector3(x, maxH + 0.18, maxHZ + arcZOffset));
    }
  }
  if (crestLinePts.length > 4) {
    const crestGeo = new THREE.BufferGeometry().setFromPoints(crestLinePts);
    const crestLine = new THREE.Line(crestGeo, contourMaterial);
    avilaGroup.add(crestLine);
  }

  // 8C. Silueta Arquitectónica a Escala del Hotel Humboldt y Faro en la Cumbre (x = -54m, z = -84m)
  const humboldtX = -54.0;
  const humboldtZ = -84.0;
  const humboldtArcZ = humboldtZ + Math.pow(humboldtX / 145.0, 2.0) * 18.0;
  const humboldtBaseY = sampleAvilaElevation(humboldtX, humboldtZ);

  const humboldtGroup = new THREE.Group();
  humboldtGroup.position.set(humboldtX, humboldtBaseY - 0.2, humboldtArcZ);

  const humboldtTowerMat = new THREE.MeshStandardMaterial({
    color: 0xE8D5B5,
    emissive: new THREE.Color(0xFFA83E),
    emissiveIntensity: 0.25,
    roughness: 0.28,
    metalness: 0.72,
  });

  const humboldtTower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.95, 5.2, 16),
    humboldtTowerMat
  );
  humboldtTower.position.y = 2.6;
  humboldtGroup.add(humboldtTower);

  const humboldtObservationLounge = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.15, 0.75, 16),
    new THREE.MeshStandardMaterial({
      color: 0x223548,
      emissive: new THREE.Color(0xFFBA55),
      emissiveIntensity: 0.35,
      metalness: 0.8,
      roughness: 0.2,
    })
  );
  humboldtObservationLounge.position.y = 5.2;
  humboldtGroup.add(humboldtObservationLounge);

  const humboldtSpire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.09, 2.2, 8),
    rimRingMat
  );
  humboldtSpire.position.y = 6.6;
  humboldtGroup.add(humboldtSpire);

  const humboldtBeaconMat = new THREE.MeshBasicMaterial({
    color: 0xFFE89A,
  });
  const humboldtBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 12),
    humboldtBeaconMat
  );
  humboldtBeacon.position.y = 7.75;
  humboldtGroup.add(humboldtBeacon);

  avilaGroup.add(humboldtGroup);

  avilaGroup.renderOrder = 0;
  avilaGroup.traverse((child) => {
    child.renderOrder = 0;
  });

  rootGroup.add(avilaGroup);

  // ==========================================================================
  // 9. MOTOR DE INTERPOLACIÓN SOLAR CONTINUA (DÍA / HORA DORADA / NOCHE)
  // ==========================================================================
  let currentGoldenMix = 0.0;
  let currentNightMix = 0.0;

  const sunDirMorning = new THREE.Vector3(34, 48, 38).normalize();
  const sunDirGolden = new THREE.Vector3(-48, 16.5, 34).normalize();
  const sunDirNight = new THREE.Vector3(18, 42, -28).normalize();

  const sunColMorning = new THREE.Color(0xFFFDF8);
  const sunColGolden = new THREE.Color(0xFF9238);
  const sunColNight = new THREE.Color(0x5B78B2);

  const skyColMorning = new THREE.Color(0xD8E8F8);
  const skyColGolden = new THREE.Color(0xF6CCA2);
  const skyColNight = new THREE.Color(0x1E283B);

  const groundAmbientMorning = new THREE.Color(0x35281E);
  const groundAmbientGolden = new THREE.Color(0x422214);
  const groundAmbientNight = new THREE.Color(0x10151E);

  const contourColorMorning = new THREE.Color(0xC9A86A);
  const contourColorGolden = new THREE.Color(0xFFA83E);
  const contourColorNight = new THREE.Color(0xDFC47B);

  const bgMorning = new THREE.Color('#141311');
  const bgGolden = new THREE.Color('#1A140F');
  const bgNight = new THREE.Color('#0A0A0E');

  const avilaBaseColGolden = new THREE.Color(0x733718);
  const avilaBaseColNight = new THREE.Color(0x142030);
  const avilaBaseColMorning = new THREE.Color(0x265A2C);

  const avilaPeakColGolden = new THREE.Color(0x9C542E);
  const avilaPeakColNight = new THREE.Color(0x1D2D42);
  const avilaPeakColMorning = new THREE.Color(0x3B6B38);

  const avilaFogColGolden = new THREE.Color(0xB86B3D);
  const avilaFogColNight = new THREE.Color(0x0F1826);
  const avilaFogColMorning = new THREE.Color(0x8BA3BA);

  const massingColNight = new THREE.Color(0x181B24);
  const massingColGolden = new THREE.Color(0x32251C);
  const massingColMorning = new THREE.Color(0x2B2620);

  const tableTintNight = new THREE.Color(0x9AA6B8);
  const tableTintGolden = new THREE.Color(0xF6D2AE);
  const tableTintMorning = new THREE.Color(0xFFFFFF);

  const updateContextSolarMode = (
    mode: SolarTimeMode,
    deltaFactor: number = 0.08,
    cameraPosition?: THREE.Vector3
  ) => {
    const t = Math.max(0.01, Math.min(1.0, deltaFactor));
    const targetGolden = mode === 'golden' ? 1.0 : 0.0;
    const targetNight = mode === 'night' ? 1.0 : 0.0;

    currentGoldenMix = THREE.MathUtils.lerp(currentGoldenMix, targetGolden, t);
    currentNightMix = THREE.MathUtils.lerp(currentNightMix, targetNight, t);

    const nowSeconds = typeof performance !== 'undefined' ? performance.now() * 0.001 : Date.now() * 0.001;

    // Actualizar posición de la cámara en el shader de bruma atmosférica basada en profundidad
    if (cameraPosition) {
      avilaShaderUniforms.uCameraPos.value.copy(cameraPosition);
    }

    // 1. Color, bruma y propiedades del ShaderMaterial del Ávila según el modo solar (Cero GC en bucle)
    if (!isAvilaDebugActive) {
      const targetBaseCol =
        mode === 'golden' ? avilaBaseColGolden : mode === 'night' ? avilaBaseColNight : avilaBaseColMorning;
      const targetPeakCol =
        mode === 'golden' ? avilaPeakColGolden : mode === 'night' ? avilaPeakColNight : avilaPeakColMorning;
      const targetFogCol =
        mode === 'golden' ? avilaFogColGolden : mode === 'night' ? avilaFogColNight : avilaFogColMorning;
      const targetSunDir =
        mode === 'golden' ? sunDirGolden : mode === 'night' ? sunDirNight : sunDirMorning;
      const targetSunCol =
        mode === 'golden' ? sunColGolden : mode === 'night' ? sunColNight : sunColMorning;
      const targetAmbient =
        mode === 'golden' ? groundAmbientGolden : mode === 'night' ? groundAmbientNight : groundAmbientMorning;

      avilaShaderUniforms.uTerrainBaseColor.value.lerp(targetBaseCol, t);
      avilaShaderUniforms.uTerrainPeakColor.value.lerp(targetPeakCol, t);
      avilaShaderUniforms.uFogColor.value.lerp(targetFogCol, t);
      avilaShaderUniforms.uSunDirection.value.lerp(targetSunDir, t).normalize();
      avilaShaderUniforms.uSunColor.value.lerp(targetSunCol, t);
      avilaShaderUniforms.uAmbientColor.value.lerp(targetAmbient, t);
    }

    // 2. Curvas de nivel topográficas
    const targetContourCol =
      mode === 'golden' ? contourColorGolden : mode === 'night' ? contourColorNight : contourColorMorning;
    contourMaterial.color.lerp(targetContourCol, t);
    contourMaterial.opacity = THREE.MathUtils.lerp(
      contourMaterial.opacity,
      mode === 'golden' ? 0.92 : mode === 'night' ? 0.78 : 0.72,
      t
    );

    // 5. Faro y Torre del Hotel Humboldt
    humboldtTowerMat.emissiveIntensity = THREE.MathUtils.lerp(
      humboldtTowerMat.emissiveIntensity,
      mode === 'night' ? 2.8 : mode === 'golden' ? 1.8 : 0.4,
      t
    );
    const beaconPulse = Math.pow(Math.sin(nowSeconds * 3.5), 8.0);
    humboldtBeaconMat.color.setHex(mode === 'night' || mode === 'golden' ? (beaconPulse > 0.35 ? 0xFFFFAA : 0xFFA030) : 0xE6D0A0);

    // 6. Iluminación vial de Altamira y edificios vecinos
    const targetLampEmissive = mode === 'night' ? 2.6 : mode === 'golden' ? 1.55 : 0.05;
    lampBulbMat.emissiveIntensity = THREE.MathUtils.lerp(lampBulbMat.emissiveIntensity, targetLampEmissive, t);

    const targetPoolOpacity = mode === 'night' ? 0.82 : mode === 'golden' ? 0.48 : 0.0;
    lightPoolMat.opacity = THREE.MathUtils.lerp(lightPoolMat.opacity, targetPoolOpacity, t);

    const targetTrailOpacity = mode === 'night' ? 0.58 : mode === 'golden' ? 0.34 : 0.0;
    warmTrafficTrailMat.opacity = THREE.MathUtils.lerp(warmTrafficTrailMat.opacity, targetTrailOpacity, t);

    const targetNeighborWinGlow = mode === 'night' ? 1.25 : mode === 'golden' ? 0.65 : 0.04;
    neighborWindowMat.emissiveIntensity = THREE.MathUtils.lerp(neighborWindowMat.emissiveIntensity, targetNeighborWinGlow, t);

    const targetMassingColor =
      mode === 'night' ? massingColNight : mode === 'golden' ? massingColGolden : massingColMorning;
    massingMat.color.lerp(targetMassingColor, t);

    const targetTableTint =
      mode === 'night' ? tableTintNight : mode === 'golden' ? tableTintGolden : tableTintMorning;
    tableMaterial.color.lerp(targetTableTint, t);
  };

  /**
   * Conmuta dinámicamente entre el ShaderMaterial personalizado con bruma atmosférica
   * y el material de prueba unlit (THREE.MeshBasicMaterial con color rojo 0xFF0000).
   */
  const setAvilaDebugMode = (enabled: boolean) => {
    isAvilaDebugActive = enabled;
    avilaTerrainMesh.material = enabled ? avilaDebugMat : avilaTerrainShaderMat;
    avilaTerrainMesh.renderOrder = 0;
    avilaTerrainMesh.visible = true;
    if (avilaTerrainMesh.material instanceof THREE.Material) {
      avilaTerrainMesh.material.needsUpdate = true;
    }
  };

  /**
   * Calcula en O(1) (8 vértices del BoundingBox en lugar de 19.521 vértices por frame)
   * la distancia euclidiana máxima desde la cámara hasta el extremo más lejano de El Ávila.
   */
  const getAvilaFurthestPointDistance = (cameraPosition: THREE.Vector3): number => {
    const bbox = avilaTerrainGeo.boundingBox;
    if (!bbox) return 400;

    avilaTerrainMesh.updateMatrixWorld(true);
    const m = avilaTerrainMesh.matrixWorld.elements;
    const min = bbox.min;
    const max = bbox.max;

    const cx = cameraPosition.x;
    const cy = cameraPosition.y;
    const cz = cameraPosition.z;

    let maxDistSq = 0;
    const xs = [min.x, max.x];
    const ys = [min.y, max.y];
    const zs = [min.z, max.z];

    for (let xi = 0; xi < 2; xi++) {
      const vx = xs[xi];
      for (let yi = 0; yi < 2; yi++) {
        const vy = ys[yi];
        for (let zi = 0; zi < 2; zi++) {
          const vz = zs[zi];
          const wx = m[0] * vx + m[4] * vy + m[8] * vz + m[12];
          const wy = m[1] * vx + m[5] * vy + m[9] * vz + m[13];
          const wz = m[2] * vx + m[6] * vy + m[10] * vz + m[14];

          const dx = wx - cx;
          const dy = wy - cy;
          const dz = wz - cz;
          const dSq = dx * dx + dy * dy + dz * dz;
          if (dSq > maxDistSq) {
            maxDistSq = dSq;
          }
        }
      }
    }

    return Math.sqrt(maxDistSq);
  };

  const updateCameraPosition = (cameraPos: THREE.Vector3) => {
    avilaShaderUniforms.uCameraPos.value.copy(cameraPos);
  };

  return {
    rootGroup,
    updateContextSolarMode,
    setAvilaDebugMode,
    getAvilaFurthestPointDistance,
    avilaMesh: avilaTerrainMesh,
    updateCameraPosition,
  };
}
