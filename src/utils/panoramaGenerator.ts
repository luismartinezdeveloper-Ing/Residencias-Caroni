import { SolarTimeMode } from '../components/modals/3d/ArchitecturalScene';

export type PanoramaQuality = 'performance' | 'optimal' | 'ultra';

export interface PanoramaOptions {
  roomId: string;
  solarMode: SolarTimeMode;
  width?: number;
  height?: number;
  quality?: PanoramaQuality;
}

export interface AsyncPanoramaProgress {
  step: 'init' | 'sky' | 'architecture' | 'furniture' | 'lighting' | 'complete';
  percentage: number;
  statusText: string;
}

// Memory-managed texture cache with LRU limit to safeguard WebGL VRAM
const MAX_CACHED_PANORAMAS = 12;
const textureCache: Map<string, HTMLCanvasElement> = new Map();

export function clearPanoramaCache(): void {
  textureCache.clear();
}

export function getPanoramaCacheSize(): number {
  return textureCache.size;
}

export function getQualityDimensions(quality: PanoramaQuality = 'optimal'): { width: number; height: number } {
  switch (quality) {
    case 'performance':
      return { width: 1024, height: 512 };
    case 'ultra':
      return { width: 4096, height: 2048 };
    case 'optimal':
    default:
      return { width: 2048, height: 1024 };
  }
}

// Microtask yield helper so canvas drawing does not lock the browser UI or main thread
const yieldToMain = (): Promise<void> =>
  new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });

/**
 * Asynchronous, non-blocking equirectangular panorama generator.
 * Yields between computational phases to keep WebGL rendering and UI 60fps stable.
 */
export async function generateEquirectangularPanoramaAsync(
  options: PanoramaOptions,
  onProgress?: (progress: AsyncPanoramaProgress) => void
): Promise<HTMLCanvasElement> {
  const { roomId, solarMode, quality = 'optimal' } = options;
  const dims = getQualityDimensions(quality);
  const width = options.width || dims.width;
  const height = options.height || dims.height;
  const cacheKey = `${roomId}_${solarMode}_${width}x${height}`;

  if (textureCache.has(cacheKey)) {
    onProgress?.({
      step: 'complete',
      percentage: 100,
      statusText: 'Entorno 360° de alta fidelidad recuperado de memoria.',
    });
    return textureCache.get(cacheKey)!;
  }

  onProgress?.({
    step: 'init',
    percentage: 12,
    statusText: 'Iniciando canvas panorámico equirrectangular 360°...',
  });
  await yieldToMain();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });

  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D para la textura 360°');
  }

  // 1. SKY & OUTDOOR HORIZON BASE (Equirectangular 360° background)
  onProgress?.({
    step: 'sky',
    percentage: 30,
    statusText: 'Renderizando horizonte del Ávila, Hotel Humboldt y Valle de Caracas...',
  });
  renderOutdoorEnvironment(ctx, width, height, solarMode);
  await yieldToMain();

  // 2. ARCHITECTURAL ROOM ENVELOPE (Ceiling, Floor, Walls, Windows, Boiserie)
  onProgress?.({
    step: 'architecture',
    percentage: 58,
    statusText: 'Construyendo envolvente arquitectónica, ventanales Schüco y mármoles...',
  });
  renderRoomStructure(ctx, width, height, roomId, solarMode);
  await yieldToMain();

  // 3. ARCHITECTURAL FURNITURE & INTERIOR ARTWORK
  onProgress?.({
    step: 'furniture',
    percentage: 82,
    statusText: 'Generando mobiliario de autor italiano, arte cinético y detalles de lujo...',
  });
  renderInteriorFurniture(ctx, width, height, roomId, solarMode);
  await yieldToMain();

  // 4. LIGHTING AMBIENCE, COVE GLOW & SPECULAR HIGHLIGHTS
  onProgress?.({
    step: 'lighting',
    percentage: 95,
    statusText: 'Aplicando fotometría lumínica 2700K y resplandor atmosférico...',
  });
  renderLightingEffects(ctx, width, height, solarMode);
  await yieldToMain();

  // Evict oldest if cache exceeds maximum allowed panoramas
  if (textureCache.size >= MAX_CACHED_PANORAMAS) {
    const firstKey = textureCache.keys().next().value;
    if (firstKey) textureCache.delete(firstKey);
  }

  textureCache.set(cacheKey, canvas);

  onProgress?.({
    step: 'complete',
    percentage: 100,
    statusText: 'Entorno inmersivo listo con máxima fidelidad visual.',
  });

  return canvas;
}

export function generateEquirectangularPanorama(options: PanoramaOptions): HTMLCanvasElement {
  const { roomId, solarMode, quality = 'optimal' } = options;
  const dims = getQualityDimensions(quality);
  const width = options.width || dims.width;
  const height = options.height || dims.height;
  const cacheKey = `${roomId}_${solarMode}_${width}x${height}`;

  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return canvas;

  // 1. SKY & OUTDOOR HORIZON BASE (Equirectangular background)
  renderOutdoorEnvironment(ctx, width, height, solarMode);

  // 2. ARCHITECTURAL ROOM ENVELOPE (Ceiling, Floor, Walls, Windows)
  renderRoomStructure(ctx, width, height, roomId, solarMode);

  // 3. ARCHITECTURAL FURNITURE & INTERIOR ELEMENTS
  renderInteriorFurniture(ctx, width, height, roomId, solarMode);

  // 4. LIGHTING AMBIENCE & SPECULAR HIGHLIGHTS
  renderLightingEffects(ctx, width, height, solarMode);

  if (textureCache.size >= MAX_CACHED_PANORAMAS) {
    const firstKey = textureCache.keys().next().value;
    if (firstKey) textureCache.delete(firstKey);
  }

  textureCache.set(cacheKey, canvas);
  return canvas;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number = 8
) {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

/**
 * Photorealistic 360° Outdoor Panorama with Cerro El Ávila, Pico Humboldt,
 * Valle de Caracas and dynamic celestial atmosphere for all solar modes.
 */
function renderOutdoorEnvironment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  solarMode: SolarTimeMode
) {
  const horizonY = h * 0.52; // Eye-level natural horizon

  // 1. SKY SPHERE GRADIENT
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  if (solarMode === 'morning') {
    skyGrad.addColorStop(0, '#3875A8');    // Deep Caracas clear morning zenith
    skyGrad.addColorStop(0.35, '#6BA5D4'); // Bright tropical sky
    skyGrad.addColorStop(0.7, '#A8D2F2');  // Soft atmospheric haze
    skyGrad.addColorStop(0.92, '#DDEEFA'); // Radiant morning horizon
    skyGrad.addColorStop(1, '#F3F8FC');
  } else if (solarMode === 'golden') {
    skyGrad.addColorStop(0, '#2D234A');    // Deep twilight violet-blue
    skyGrad.addColorStop(0.3, '#753556');  // Magenta & mauve stratosphere
    skyGrad.addColorStop(0.55, '#C64F34'); // Rich crimson-amber
    skyGrad.addColorStop(0.8, '#EA8433');  // Golden hour blaze
    skyGrad.addColorStop(0.94, '#F7B95C'); // Luminous horizon
    skyGrad.addColorStop(1, '#FEE49E');
  } else {
    skyGrad.addColorStop(0, '#06080F');    // Deep cosmic night navy
    skyGrad.addColorStop(0.4, '#0D1322');  // Atmospheric indigo
    skyGrad.addColorStop(0.75, '#161F33'); // Valley light bounce
    skyGrad.addColorStop(0.95, '#1F2942');
    skyGrad.addColorStop(1, '#273452');
  }

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, horizonY + 30);

  // 2. CELESTIAL SUN & HAZE (Morning & Golden Hour)
  if (solarMode === 'morning') {
    // High Eastern Sun (Yaw ~ 60°, near x = w * 0.66)
    const sunX = w * 0.66;
    const sunY = horizonY - h * 0.36;

    const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 280);
    sunGlow.addColorStop(0, 'rgba(255, 255, 240, 1)');
    sunGlow.addColorStop(0.15, 'rgba(255, 245, 200, 0.7)');
    sunGlow.addColorStop(0.45, 'rgba(255, 230, 160, 0.25)');
    sunGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 280, 0, Math.PI * 2);
    ctx.fill();

    // Subtle sun flare streaks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(sunX + Math.cos(angle) * 320, sunY + Math.sin(angle) * 320);
      ctx.stroke();
    }
  } else if (solarMode === 'golden') {
    // Low Western Sun setting behind the mountain ridge (Yaw ~ -50°, near x = w * 0.36)
    const sunX = w * 0.36;
    const sunY = horizonY - h * 0.16;

    const sunsetGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 380);
    sunsetGlow.addColorStop(0, 'rgba(255, 250, 220, 1)');
    sunsetGlow.addColorStop(0.2, 'rgba(255, 180, 80, 0.85)');
    sunsetGlow.addColorStop(0.5, 'rgba(220, 80, 40, 0.35)');
    sunsetGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = sunsetGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 380, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. NIGHT STARS & GALAXY VEIL
  if (solarMode === 'night') {
    // Star cluster points with varying sizes and color temperatures
    ctx.save();
    for (let i = 0; i < 360; i++) {
      const sx = ((Math.sin(i * 127.3) * 43758.5453) % 1) * w;
      const sy = Math.abs((Math.cos(i * 93.7) * 23421.631) % 1) * (horizonY * 0.75);
      const sr = (i % 7 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.7);

      const isBlue = i % 5 === 0;
      const isWarm = i % 4 === 0;
      ctx.fillStyle = isBlue ? 'rgba(180, 215, 255, 0.9)' : isWarm ? 'rgba(255, 230, 190, 0.9)' : 'rgba(255, 255, 255, 0.8)';

      ctx.beginPath();
      ctx.arc(Math.abs(sx), sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 4. CERRO EL ÁVILA MOUNTAIN MASS (North View: Yaw centered around w * 0.50)
  const mountainCenter = w * 0.5;
  const mountainWidth = w * 0.85;

  ctx.save();

  // Background Secondary Mountain Layer (Deep aerial perspective)
  ctx.beginPath();
  ctx.moveTo(mountainCenter - mountainWidth * 0.65, horizonY);
  const backRidgePoints = [
    { x: mountainCenter - mountainWidth * 0.55, y: horizonY - h * 0.12 },
    { x: mountainCenter - mountainWidth * 0.38, y: horizonY - h * 0.22 },
    { x: mountainCenter - mountainWidth * 0.22, y: horizonY - h * 0.28 },
    { x: mountainCenter - mountainWidth * 0.05, y: horizonY - h * 0.32 }, // Pico Naiguatá Peak
    { x: mountainCenter + mountainWidth * 0.12, y: horizonY - h * 0.30 }, // Silla de Caracas
    { x: mountainCenter + mountainWidth * 0.28, y: horizonY - h * 0.26 }, // Pico Humboldt
    { x: mountainCenter + mountainWidth * 0.46, y: horizonY - h * 0.15 },
    { x: mountainCenter + mountainWidth * 0.62, y: horizonY },
  ];
  for (const pt of backRidgePoints) {
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.lineTo(w, horizonY);
  ctx.lineTo(0, horizonY);
  ctx.closePath();

  if (solarMode === 'morning') {
    ctx.fillStyle = '#467258'; // Soft atmospheric green
  } else if (solarMode === 'golden') {
    ctx.fillStyle = '#5A2A22'; // Violet-crimson sunset tone
  } else {
    ctx.fillStyle = '#0A0E18'; // Deep night ridge
  }
  ctx.fill();

  // Foreground Primary Mountain Ridge (Detailed slopes, ridges & valleys)
  ctx.beginPath();
  ctx.moveTo(mountainCenter - mountainWidth * 0.6, horizonY);

  const frontRidgePoints = [
    { x: mountainCenter - mountainWidth * 0.5, y: horizonY - h * 0.09 },
    { x: mountainCenter - mountainWidth * 0.35, y: horizonY - h * 0.18 },
    { x: mountainCenter - mountainWidth * 0.18, y: horizonY - h * 0.25 },
    { x: mountainCenter - mountainWidth * 0.02, y: horizonY - h * 0.30 }, // Pico Occidental
    { x: mountainCenter + mountainWidth * 0.15, y: horizonY - h * 0.27 }, // Cresta
    { x: mountainCenter + mountainWidth * 0.30, y: horizonY - h * 0.23 }, // Pico Oriental
    { x: mountainCenter + mountainWidth * 0.48, y: horizonY - h * 0.12 },
    { x: mountainCenter + mountainWidth * 0.6, y: horizonY },
  ];

  for (const pt of frontRidgePoints) {
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.lineTo(w, horizonY);
  ctx.lineTo(0, horizonY);
  ctx.closePath();

  if (solarMode === 'morning') {
    const mtnGrad = ctx.createLinearGradient(0, horizonY - h * 0.32, 0, horizonY);
    mtnGrad.addColorStop(0, '#1E4028'); // Deep tropical cloud forest canopy
    mtnGrad.addColorStop(0.4, '#2B5738');
    mtnGrad.addColorStop(0.8, '#3D734E');
    mtnGrad.addColorStop(1, '#538D66');
    ctx.fillStyle = mtnGrad;
  } else if (solarMode === 'golden') {
    const mtnGrad = ctx.createLinearGradient(0, horizonY - h * 0.32, 0, horizonY);
    mtnGrad.addColorStop(0, '#3E1C16');
    mtnGrad.addColorStop(0.5, '#682E22');
    mtnGrad.addColorStop(0.85, '#9A4B36');
    mtnGrad.addColorStop(1, '#BF6848');
    ctx.fillStyle = mtnGrad;
  } else {
    ctx.fillStyle = '#0F1626'; // High-contrast silhouette against night sky
  }
  ctx.fill();

  // Mountain Ridge Slopes Shading / Ray Highlights
  ctx.strokeStyle = solarMode === 'golden' ? 'rgba(255, 180, 100, 0.25)' : solarMode === 'morning' ? 'rgba(200, 240, 210, 0.15)' : 'rgba(30, 45, 70, 0.4)';
  ctx.lineWidth = 3;
  for (let s = -3; s <= 3; s++) {
    const startX = mountainCenter + s * (mountainWidth * 0.12);
    const startY = horizonY - h * 0.22 + Math.abs(s) * 15;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX - 25, horizonY - 10);
    ctx.stroke();
  }

  // 5. ICONIC HOTEL HUMBOLDT TOWER ON PICO EL ÁVILA (x = mountainCenter + mountainWidth * 0.28)
  const humboldtX = mountainCenter + mountainWidth * 0.28;
  const humboldtY = horizonY - h * 0.26 - 12;

  // Tower Structure
  ctx.fillStyle = solarMode === 'night' ? '#1E283A' : '#D0CBC0';
  ctx.fillRect(humboldtX - 4, humboldtY, 8, 14);

  // Tower Dome Beacon
  ctx.fillStyle = solarMode === 'night' ? '#FF4A3D' : '#8C7452';
  ctx.beginPath();
  ctx.arc(humboldtX, humboldtY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Night beacon pulse
  if (solarMode === 'night') {
    ctx.fillStyle = 'rgba(255, 60, 50, 0.8)';
    ctx.beginPath();
    ctx.arc(humboldtX, humboldtY, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. VALLE DE CARACAS & CITY SKYLINE FOOTHILLS
  const valleyGrad = ctx.createLinearGradient(0, horizonY - 20, 0, horizonY + 20);
  if (solarMode === 'morning') {
    valleyGrad.addColorStop(0, '#4A7558');
    valleyGrad.addColorStop(1, '#6F9E7F');
  } else if (solarMode === 'golden') {
    valleyGrad.addColorStop(0, '#7A4836');
    valleyGrad.addColorStop(1, '#A86C50');
  } else {
    valleyGrad.addColorStop(0, '#101624');
    valleyGrad.addColorStop(1, '#182033');
  }
  ctx.fillStyle = valleyGrad;
  ctx.fillRect(0, horizonY - 15, w, 35);

  // 7. CARACAS NIGHT CITY LIGHTS (Altamira, Las Mercedes, Country Club)
  if (solarMode === 'night') {
    ctx.save();
    for (let i = 0; i < 450; i++) {
      const cx = (i * 19.3) % w;
      const cy = horizonY - 12 + ((Math.sin(i * 33.1) * 0.5 + 0.5) * 28);
      const isAmber = i % 3 === 0;
      const isWarmWhite = i % 4 === 0;
      const isEmerald = i % 19 === 0;

      ctx.fillStyle = isAmber ? '#FFB852' : isWarmWhite ? '#FFF2D1' : isEmerald ? '#60E5A8' : '#FFFFFF';
      const size = (i % 9 === 0 ? 3 : i % 3 === 0 ? 2 : 1.2);
      ctx.fillRect(cx, cy, size, size);

      // Light glow
      if (i % 7 === 0) {
        ctx.fillStyle = isAmber ? 'rgba(255, 184, 82, 0.35)' : 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(cx + size * 0.5, cy + size * 0.5, size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Generates 360° Architectural Envelope:
 * - Ceiling with acoustic coffers and recessed Viabizzuno low-glare lights
 * - Floor with Roman Travertine Navona stone or Oak Parquet with specular floor sheen
 * - Schüco Bronze Structural Glazing framing El Ávila
 * - Natural Walnut Boiserie & Kinetic Artwork
 */
function renderRoomStructure(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  roomId: string,
  solarMode: SolarTimeMode
) {
  const horizonY = h * 0.52;
  const ceilingY = h * 0.24; // 3.20m high ceilings
  const floorY = h * 0.74;   // Ground plane

  const isTerrace = roomId === 'terraza';
  const isWoodFloor = roomId === 'master' || roomId === 'terraza';

  // ================= 1. CEILING (Equirectangular Zenith) =================
  if (!isTerrace) {
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, ceilingY);
    if (solarMode === 'night') {
      ceilGrad.addColorStop(0, '#100E0B');
      ceilGrad.addColorStop(0.6, '#1C1914');
      ceilGrad.addColorStop(1, '#2A251E');
    } else if (solarMode === 'golden') {
      ceilGrad.addColorStop(0, '#F5ECE3');
      ceilGrad.addColorStop(0.5, '#EAD9C8');
      ceilGrad.addColorStop(1, '#DFCCA6');
    } else {
      ceilGrad.addColorStop(0, '#FAF9F6');
      ceilGrad.addColorStop(0.6, '#EFEAE2');
      ceilGrad.addColorStop(1, '#E2DCD2');
    }
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, 0, w, ceilingY);

    // Architectural Coffer Ceiling Grid Lines (Recessed Channels)
    ctx.strokeStyle = solarMode === 'night' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(140, 116, 82, 0.2)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += w / 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ceilingY);
      ctx.stroke();
    }

    // Indirect 2700K LED Perimeter Cove Lighting
    const coveGrad = ctx.createLinearGradient(0, ceilingY - 14, 0, ceilingY + 8);
    if (solarMode === 'night') {
      coveGrad.addColorStop(0, 'rgba(255, 200, 120, 0.9)');
      coveGrad.addColorStop(0.5, 'rgba(255, 180, 80, 0.6)');
      coveGrad.addColorStop(1, 'transparent');
    } else if (solarMode === 'golden') {
      coveGrad.addColorStop(0, 'rgba(255, 220, 160, 0.8)');
      coveGrad.addColorStop(0.7, 'rgba(255, 190, 100, 0.4)');
      coveGrad.addColorStop(1, 'transparent');
    } else {
      coveGrad.addColorStop(0, 'rgba(255, 240, 210, 0.6)');
      coveGrad.addColorStop(1, 'transparent');
    }
    ctx.fillStyle = coveGrad;
    ctx.fillRect(0, ceilingY - 12, w, 24);

    // Recessed Dark-Light Downlight Spots (Viabizzuno spots along ceiling)
    for (let x = w / 32; x < w; x += w / 8) {
      ctx.fillStyle = '#1A1815';
      ctx.beginPath();
      ctx.arc(x, ceilingY - 24, 6, 0, Math.PI * 2);
      ctx.fill();

      // Spot light glow
      const spotGlow = ctx.createRadialGradient(x, ceilingY - 24, 2, x, ceilingY - 24, 20);
      spotGlow.addColorStop(0, solarMode === 'night' ? 'rgba(255, 210, 130, 0.95)' : 'rgba(255, 245, 220, 0.8)');
      spotGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = spotGlow;
      ctx.beginPath();
      ctx.arc(x, ceilingY - 24, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ================= 2. FLOOR (Travertino Romano or Oak Herringbone) =================
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
  if (isTerrace) {
    // Burmese Teak Decking
    if (solarMode === 'night') {
      floorGrad.addColorStop(0, '#382515');
      floorGrad.addColorStop(0.5, '#2B1B0F');
      floorGrad.addColorStop(1, '#1A1009');
    } else if (solarMode === 'golden') {
      floorGrad.addColorStop(0, '#8A5A35');
      floorGrad.addColorStop(0.5, '#6E4324');
      floorGrad.addColorStop(1, '#4A2A14');
    } else {
      floorGrad.addColorStop(0, '#7D5737');
      floorGrad.addColorStop(0.5, '#684528');
      floorGrad.addColorStop(1, '#4A301A');
    }
  } else if (isWoodFloor) {
    // Listone Giordano Natural European Oak
    if (solarMode === 'night') {
      floorGrad.addColorStop(0, '#423324');
      floorGrad.addColorStop(0.5, '#302418');
      floorGrad.addColorStop(1, '#1F160E');
    } else if (solarMode === 'golden') {
      floorGrad.addColorStop(0, '#BF9568');
      floorGrad.addColorStop(0.5, '#9C754C');
      floorGrad.addColorStop(1, '#705030');
    } else {
      floorGrad.addColorStop(0, '#AB875F');
      floorGrad.addColorStop(0.5, '#8D6D49');
      floorGrad.addColorStop(1, '#664C30');
    }
  } else {
    // Travertino Romano Navona Honed Marble
    if (solarMode === 'night') {
      floorGrad.addColorStop(0, '#352E25');
      floorGrad.addColorStop(0.4, '#28231C');
      floorGrad.addColorStop(1, '#181511');
    } else if (solarMode === 'golden') {
      floorGrad.addColorStop(0, '#E8D8C3');
      floorGrad.addColorStop(0.4, '#D2BFA4');
      floorGrad.addColorStop(1, '#AD987B');
    } else {
      floorGrad.addColorStop(0, '#EDE7DC');
      floorGrad.addColorStop(0.4, '#DFD6C6');
      floorGrad.addColorStop(1, '#C2B6A2');
    }
  }

  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, w, h - floorY);

  // Floor Perspective Tile Joints & Grid
  ctx.save();
  ctx.strokeStyle = isWoodFloor ? 'rgba(0, 0, 0, 0.22)' : 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1.2;

  const numSlices = isWoodFloor ? 64 : 32;
  for (let i = 0; i <= numSlices; i++) {
    const x = (i / numSlices) * w;
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo((x - w * 0.5) * 1.8 + w * 0.5, h);
    ctx.stroke();
  }

  // Transverse Joint Seams
  for (let y = floorY + 25; y < h; y += 40 + (y - floorY) * 0.3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Subtle Marble Specular Light Sheen reflecting the outdoor sky
  const floorSheen = ctx.createLinearGradient(w * 0.35, floorY, w * 0.65, floorY + 120);
  if (solarMode === 'golden') {
    floorSheen.addColorStop(0, 'transparent');
    floorSheen.addColorStop(0.5, 'rgba(255, 220, 160, 0.18)');
    floorSheen.addColorStop(1, 'transparent');
  } else if (solarMode === 'morning') {
    floorSheen.addColorStop(0, 'transparent');
    floorSheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.16)');
    floorSheen.addColorStop(1, 'transparent');
  } else {
    floorSheen.addColorStop(0, 'transparent');
    floorSheen.addColorStop(0.5, 'rgba(255, 200, 120, 0.08)');
    floorSheen.addColorStop(1, 'transparent');
  }
  ctx.fillStyle = floorSheen;
  ctx.fillRect(0, floorY, w, 140);

  ctx.restore();

  // ================= 3. WALLS & GLAZING =================
  if (!isTerrace) {
    renderWallPanels(ctx, w, h, ceilingY, floorY, roomId, solarMode);
  } else {
    renderTerraceRailing(ctx, w, h, floorY, solarMode);
  }
}

/**
 * Renders 360° Architectural Walls:
 * - North: Continuous Schüco Floor-to-Ceiling Glazing (Yaw -45° to +45°)
 * - East: Natural Fluted Walnut Boiserie with Carlos Cruz-Diez / Soto homage kinetic art
 * - South: Roman Travertine portal, bioethanol hearth & brass sconces
 * - West: Poliform custom cabinetry & illuminated wine cellar
 */
function renderWallPanels(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  topY: number,
  bottomY: number,
  roomId: string,
  solarMode: SolarTimeMode
) {
  const wallHeight = bottomY - topY;

  // Window Zone: Center North Sector (Yaw -45° to +45°, between w*0.25 and w*0.75)
  const windowLeft = w * 0.24;
  const windowRight = w * 0.76;

  // Solid Left East Wall (0 to windowLeft)
  const wallBaseColor = solarMode === 'night' ? '#251F18' : '#EDE8DE';
  ctx.fillStyle = wallBaseColor;
  ctx.fillRect(0, topY, windowLeft, wallHeight);

  // Solid Right West Wall (windowRight to w)
  ctx.fillRect(windowRight, topY, w - windowRight, wallHeight);

  // ================= EAST WALL: VERTICAL FLUTED WALNUT BOISERIE & ART =================
  ctx.save();
  const slatWidth = 14;
  const slatGap = 8;
  const slatColor = solarMode === 'night' ? '#1D150E' : '#573E28';
  ctx.fillStyle = slatColor;

  for (let x = 24; x < windowLeft - 40; x += (slatWidth + slatGap)) {
    // Slat body
    ctx.fillRect(x, topY, slatWidth, wallHeight);
    // Slat bevel highlight
    ctx.fillStyle = solarMode === 'night' ? 'rgba(255, 200, 130, 0.08)' : 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x, topY, 2, wallHeight);
    ctx.fillStyle = slatColor;
  }

  // Museum-Grade Kinetic Art Installation (Carlos Cruz-Diez Fisicromía Homage)
  if (roomId === 'salon' || roomId === 'master') {
    const artX = windowLeft * 0.45;
    const artY = topY + wallHeight * 0.28;
    const artW = windowLeft * 0.42;
    const artH = wallHeight * 0.44;

    // Artwork shadow & bronze frame
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(artX - 6, artY - 6, artW + 12, artH + 12);
    ctx.fillStyle = '#8C7452'; // Brushed Bronze Frame
    ctx.fillRect(artX - 4, artY - 4, artW + 8, artH + 8);

    // Chromatic Linear Art Stripes (Red, Green, Cyan, Gold lines)
    const numStripes = 28;
    const sW = artW / numStripes;
    for (let s = 0; s < numStripes; s++) {
      const sx = artX + s * sW;
      const palette = ['#E53935', '#43A047', '#1E88E5', '#FDD835', '#8E24AA', '#FB8C00'];
      ctx.fillStyle = palette[s % palette.length];
      ctx.fillRect(sx, artY, sW - 1, artH);
    }

    // Art Picture Spotlight (Dedicated ceiling wash)
    const artSpot = ctx.createRadialGradient(artX + artW * 0.5, artY + artH * 0.5, 10, artX + artW * 0.5, artY + artH * 0.5, artW);
    artSpot.addColorStop(0, 'rgba(255, 240, 200, 0.35)');
    artSpot.addColorStop(1, 'transparent');
    ctx.fillStyle = artSpot;
    ctx.fillRect(artX - 20, artY - 20, artW + 40, artH + 40);
  }
  ctx.restore();

  // ================= WEST WALL: POLIFORM CAVA & ARCHITECTURAL NICHES =================
  ctx.save();
  const westX = windowRight + 30;
  const westW = (w - windowRight) - 60;

  // Recessed Display Niche with Backlit Glass Cava
  ctx.fillStyle = solarMode === 'night' ? '#16130F' : '#32271E';
  ctx.fillRect(westX, topY + wallHeight * 0.15, westW, wallHeight * 0.7);

  // Bronze-tinted Glass Doors
  ctx.fillStyle = 'rgba(140, 116, 82, 0.25)';
  ctx.fillRect(westX + 6, topY + wallHeight * 0.15 + 6, westW - 12, wallHeight * 0.7 - 12);

  // Interior Wine Bottle Silhouettes & Backlit LEDs
  ctx.fillStyle = 'rgba(255, 200, 120, 0.85)';
  for (let row = 0; row < 4; row++) {
    const ry = topY + wallHeight * 0.22 + row * (wallHeight * 0.15);
    // Shelf LED line
    ctx.fillRect(westX + 12, ry + 18, westW - 24, 2);

    // Bottles
    ctx.fillStyle = '#0F120E';
    for (let b = 0; b < 6; b++) {
      const bx = westX + 24 + b * ((westW - 48) / 6);
      ctx.fillRect(bx, ry, 8, 18);
    }
    ctx.fillStyle = 'rgba(255, 200, 120, 0.85)';
  }
  ctx.restore();

  // ================= NORTH WINDOWS: SCHÜCO STRUCTURAL GLAZING =================
  ctx.save();
  const numPanes = 6;
  const paneWidth = (windowRight - windowLeft) / numPanes;

  // Header beam and base threshold (Schüco Anodized Dark Bronze AWS 75.SI+)
  ctx.fillStyle = '#14120F';
  ctx.fillRect(windowLeft, topY, windowRight - windowLeft, 14);
  ctx.fillRect(windowLeft, bottomY - 16, windowRight - windowLeft, 16);

  // Structural Vertical Mullions
  for (let i = 0; i <= numPanes; i++) {
    const mx = windowLeft + i * paneWidth;
    // Mullion body
    ctx.fillStyle = '#14120F';
    ctx.fillRect(mx - 5, topY, 10, wallHeight);
    // Bronze bevel accent
    ctx.fillStyle = '#8C7452';
    ctx.fillRect(mx - 1, topY, 2, wallHeight);
  }

  // Transom Horizontal Divide (Upper daylight louvre line)
  const transomY = topY + wallHeight * 0.22;
  ctx.fillStyle = '#14120F';
  ctx.fillRect(windowLeft, transomY, windowRight - windowLeft, 8);
  ctx.fillStyle = '#8C7452';
  ctx.fillRect(windowLeft, transomY + 3, windowRight - windowLeft, 2);

  // Acoustic Glass Tint & Soft Reflection Sheen
  const glassGrad = ctx.createLinearGradient(windowLeft, topY, windowRight, bottomY);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
  glassGrad.addColorStop(0.3, 'rgba(140, 116, 82, 0.05)');
  glassGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.04)');
  glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(windowLeft, topY + 14, windowRight - windowLeft, wallHeight - 30);

  ctx.restore();
}

function renderTerraceRailing(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  floorY: number,
  solarMode: SolarTimeMode
) {
  // Seamless Extra-Clear Glass Balustrade (180° Open Air Horizon)
  const railingTop = floorY - 70;

  // Glass panel
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(0, railingTop, w, 70);

  // Top Bronze Cap Railing
  ctx.fillStyle = '#8C7452';
  ctx.fillRect(0, railingTop - 6, w, 8);

  // Structural Stainless Steel Spigots at base
  ctx.fillStyle = '#A8A49C';
  for (let x = 20; x < w; x += 80) {
    ctx.fillRect(x, floorY - 14, 12, 14);
  }

  // Lush Tropical Planters (Monstera Deliciosa, Ficus Lyrata, Palms)
  renderTerracePlanters(ctx, w, floorY, solarMode);
}

function renderTerracePlanters(
  ctx: CanvasRenderingContext2D,
  w: number,
  floorY: number,
  solarMode: SolarTimeMode
) {
  // Built-in Travertine Planter Boxes on Left and Right flanks
  ctx.fillStyle = '#22281E';
  ctx.fillRect(0, floorY - 34, w * 0.24, 34);
  ctx.fillRect(w * 0.76, floorY - 34, w * 0.24, 34);

  // Planter Travertine Rim
  ctx.fillStyle = '#8C7452';
  ctx.fillRect(0, floorY - 36, w * 0.24, 4);
  ctx.fillRect(w * 0.76, floorY - 36, w * 0.24, 4);

  // Layered Tropical Leaves
  ctx.save();
  for (let i = 0; i < 55; i++) {
    const isLeft = i % 2 === 0;
    const x = isLeft ? (i * 14) : (w - i * 14);
    const y = floorY - 42 - (i % 6) * 10;
    const leafColor = solarMode === 'night' ? (i % 2 === 0 ? '#122418' : '#1A3322') : (i % 2 === 0 ? '#265434' : '#3D7A4E');

    ctx.fillStyle = leafColor;
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 32, (i % 5 - 2) * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Leaf center stem
    ctx.strokeStyle = solarMode === 'night' ? '#1E3D29' : '#5CA872';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.lineTo(x, y - 20);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Ultra-Refined Interior Furniture & Design Objects tailored per room.
 */
function renderInteriorFurniture(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  roomId: string,
  solarMode: SolarTimeMode
) {
  const floorY = h * 0.74;

  ctx.save();

  if (roomId === 'salon') {
    // ================= 1. MINOTTI FREEMAN CURVED SOFA IN IVORY BOUCLÉ =================
    const sofaX = w * 0.5;
    const sofaY = floorY + 45;

    // Contact Ambient Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(sofaX, sofaY + 36, 280, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sofa Plinth (Brushed Dark Bronze Base)
    ctx.fillStyle = '#2A231A';
    ctx.beginPath();
    drawRoundRect(ctx, sofaX - 260, sofaY - 35, 520, 75, 28);
    ctx.fill();

    // Sofa Cushion Back & Seating (Textured Bouclé)
    const sofaColor = solarMode === 'night' ? '#9E9484' : '#F6F2EA';
    ctx.fillStyle = sofaColor;
    ctx.beginPath();
    drawRoundRect(ctx, sofaX - 250, sofaY - 55, 500, 78, 24);
    ctx.fill();

    // Accent Pillows (Sage Green & Terracotta Velvet)
    ctx.fillStyle = solarMode === 'night' ? '#4A3D30' : '#8A5D44'; // Terracotta
    ctx.beginPath();
    drawRoundRect(ctx, sofaX - 210, sofaY - 50, 65, 45, 10);
    ctx.fill();

    ctx.fillStyle = solarMode === 'night' ? '#323E34' : '#5E7464'; // Sage
    ctx.beginPath();
    drawRoundRect(ctx, sofaX + 145, sofaY - 50, 65, 45, 10);
    ctx.fill();

    // ================= 2. TRAVERTINE MONOLITHIC COFFEE TABLE =================
    const tableW = 260;
    const tableH = 50;
    const tableX = sofaX - tableW * 0.5;
    const tableY = sofaY + 28;

    // Table drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(tableX - 10, tableY + tableH - 5, tableW + 20, 16);

    // Table Slab (Roman Travertine)
    ctx.fillStyle = solarMode === 'night' ? '#544A3D' : '#E5DDCF';
    ctx.beginPath();
    drawRoundRect(ctx, tableX, tableY, tableW, tableH, 12);
    ctx.fill();

    // Tabletop Accessories (Taschen Architecture Monograph & Bronze Sculpture)
    ctx.fillStyle = '#1A1815'; // Dark art book
    ctx.fillRect(sofaX - 60, tableY + 8, 40, 24);
    ctx.fillStyle = '#8C7452'; // Gold book title
    ctx.fillRect(sofaX - 56, tableY + 12, 16, 3);

    // Flos Brass Minimalist Sculpture
    ctx.fillStyle = '#8C7452';
    ctx.beginPath();
    ctx.arc(sofaX + 45, tableY + 20, 14, 0, Math.PI * 2);
    ctx.fill();

    // ================= 3. FLOS ARCO LAMP SLENDER CURVE =================
    ctx.strokeStyle = '#D4CEBF';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(sofaX - 260, sofaY - 70, 160, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Lamp Shade Dome
    ctx.fillStyle = '#E8E4D8';
    ctx.beginPath();
    ctx.arc(sofaX - 145, sofaY - 175, 20, 0, Math.PI);
    ctx.fill();

    // Lamp Warm Light Cone
    const lampGlow = ctx.createRadialGradient(sofaX - 145, sofaY - 165, 5, sofaX - 145, sofaY - 140, 100);
    lampGlow.addColorStop(0, solarMode === 'night' ? 'rgba(255, 210, 120, 0.7)' : 'rgba(255, 240, 200, 0.35)');
    lampGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(sofaX - 145, sofaY - 140, 100, 0, Math.PI * 2);
    ctx.fill();

  } else if (roomId === 'cocina') {
    // ================= 1. MONOLITHIC CALACATTA GOLD MARBLE ISLAND =================
    const islandX = w * 0.5;
    const islandY = floorY - 30;
    const islandW = 560;
    const islandH = 110;

    // Contact Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fillRect(islandX - islandW * 0.5 - 20, islandY + islandH - 5, islandW + 40, 36);

    // Calacatta Marble Face
    const marbleGrad = ctx.createLinearGradient(islandX - islandW * 0.5, 0, islandX + islandW * 0.5, 0);
    marbleGrad.addColorStop(0, '#EDE8DF');
    marbleGrad.addColorStop(0.3, '#FAF8F5');
    marbleGrad.addColorStop(0.7, '#F2EEE6');
    marbleGrad.addColorStop(1, '#EDE8DF');
    ctx.fillStyle = marbleGrad;
    ctx.fillRect(islandX - islandW * 0.5, islandY, islandW, islandH);

    // Bookmatched Grey & Gold Veining
    ctx.strokeStyle = 'rgba(140, 120, 95, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(islandX - 240, islandY + 15);
    ctx.lineTo(islandX - 120, islandY + 75);
    ctx.lineTo(islandX + 20, islandY + 35);
    ctx.lineTo(islandX + 180, islandY + 95);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(180, 150, 90, 0.35)'; // Golden sub-vein
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(islandX - 100, islandY + 70);
    ctx.lineTo(islandX - 30, islandY + 100);
    ctx.stroke();

    // Flush Gaggenau Induction Cooktop (Black Glass)
    ctx.fillStyle = '#141414';
    ctx.fillRect(islandX - 90, islandY - 6, 180, 12);

    // Suspended Brushed Brass Linear Pendant Luminaire
    ctx.fillStyle = '#8C7452';
    ctx.fillRect(islandX - 220, islandY - 140, 440, 6);
    // Suspension Cables
    ctx.fillStyle = '#A09C90';
    ctx.fillRect(islandX - 180, islandY - 220, 2, 80);
    ctx.fillRect(islandX + 180, islandY - 220, 2, 80);

    // Downward Linear LED Illumination onto Island
    const islandLight = ctx.createLinearGradient(0, islandY - 134, 0, islandY);
    islandLight.addColorStop(0, 'rgba(255, 235, 180, 0.6)');
    islandLight.addColorStop(1, 'transparent');
    ctx.fillStyle = islandLight;
    ctx.fillRect(islandX - 230, islandY - 134, 460, 134);

    // 3 Poliform Leather & Brass Bar Stools
    for (let i = -1; i <= 1; i++) {
      const bx = islandX + i * 160;
      // Brass rod legs
      ctx.fillStyle = '#8C7452';
      ctx.fillRect(bx - 4, islandY + 40, 8, 90);
      ctx.fillRect(bx - 18, islandY + 90, 36, 4); // Footrest ring

      // Cognac Italian Leather Cushion
      ctx.fillStyle = solarMode === 'night' ? '#4A2E1A' : '#7D4722';
      ctx.beginPath();
      ctx.ellipse(bx, islandY + 36, 32, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (roomId === 'master') {
    // ================= 1. FLOATING KING-SIZE DESIGNER BED =================
    const bedX = w * 0.5;
    const bedY = floorY - 15;
    const bedW = 520;

    // Contact Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fillRect(bedX - bedW * 0.5 - 20, bedY + 95, bedW + 40, 32);

    // Headboard in Warm Taupe Fluted Leather / Linen
    ctx.fillStyle = solarMode === 'night' ? '#3B3125' : '#7A6854';
    ctx.beginPath();
    drawRoundRect(ctx, bedX - bedW * 0.5, bedY - 100, bedW, 110, 18);
    ctx.fill();

    // Floating Cantilevered Walnut Nightstands
    ctx.fillStyle = '#422F1D';
    ctx.fillRect(bedX - bedW * 0.5 - 60, bedY - 20, 50, 24);
    ctx.fillRect(bedX + bedW * 0.5 + 10, bedY - 20, 50, 24);

    // Bedside Smoked Glass Pendant Globes
    for (const sx of [bedX - bedW * 0.5 - 35, bedX + bedW * 0.5 + 35]) {
      ctx.fillStyle = '#8C7452';
      ctx.fillRect(sx - 1, bedY - 140, 2, 80);
      ctx.fillStyle = solarMode === 'night' ? 'rgba(255, 200, 120, 0.9)' : 'rgba(255, 235, 180, 0.7)';
      ctx.beginPath();
      ctx.arc(sx, bedY - 60, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Italian Crisp Linen Bedding & Quilt
    ctx.fillStyle = solarMode === 'night' ? '#CDC5B8' : '#FAF8F5';
    ctx.beginPath();
    drawRoundRect(ctx, bedX - (bedW - 60) * 0.5, bedY - 25, bedW - 60, 105, 14);
    ctx.fill();

    // Layered Textured Taupe Throw Blanket
    ctx.fillStyle = solarMode === 'night' ? '#7A6E5F' : '#B8A894';
    ctx.beginPath();
    drawRoundRect(ctx, bedX - (bedW - 60) * 0.5, bedY + 35, bedW - 60, 45, 8);
    ctx.fill();

    // 4 Fluffy King Pillows
    ctx.fillStyle = '#F4EFEB';
    ctx.beginPath();
    drawRoundRect(ctx, bedX - 210, bedY - 55, 180, 40, 10);
    drawRoundRect(ctx, bedX + 30, bedY - 55, 180, 40, 10);
    ctx.fill();

  } else if (roomId === 'bano') {
    // ================= 1. ANTONIO LUPI AMBER CRISTALMOOD® BATHTUB =================
    const tubX = w * 0.5;
    const tubY = floorY + 18;

    // Contact Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(tubX, tubY + 30, 210, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Amber Translucent Resin Tub Shell
    const tubGrad = ctx.createLinearGradient(tubX - 190, tubY, tubX + 190, tubY);
    if (solarMode === 'night') {
      tubGrad.addColorStop(0, 'rgba(180, 95, 30, 0.9)');
      tubGrad.addColorStop(0.5, 'rgba(235, 145, 55, 0.85)');
      tubGrad.addColorStop(1, 'rgba(180, 95, 30, 0.9)');
    } else {
      tubGrad.addColorStop(0, 'rgba(215, 130, 45, 0.85)');
      tubGrad.addColorStop(0.5, 'rgba(255, 180, 85, 0.75)');
      tubGrad.addColorStop(1, 'rgba(215, 130, 45, 0.85)');
    }
    ctx.fillStyle = tubGrad;
    ctx.beginPath();
    ctx.ellipse(tubX, tubY, 195, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tub Rim Highlight
    ctx.strokeStyle = 'rgba(255, 240, 200, 0.65)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Gessi Floor-Mounted Freestanding Matte Bronze Faucet
    ctx.fillStyle = '#8C7452';
    ctx.fillRect(tubX + 145, tubY - 75, 10, 85);
    ctx.fillRect(tubX + 115, tubY - 75, 35, 10);

  } else if (roomId === 'terraza') {
    // ================= 1. PAOLA LENTI MODULAR OUTDOOR LOUNGE =================
    const lx = w * 0.5;
    const ly = floorY + 42;

    // Contact Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(lx, ly + 25, 260, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Low Teak Coffee Table
    ctx.fillStyle = '#5A381E';
    ctx.beginPath();
    drawRoundRect(ctx, lx - 130, ly, 260, 44, 12);
    ctx.fill();

    // Refreshment Tray with Sparkling Water & Citrus Glass
    ctx.fillStyle = '#D9D3C7';
    ctx.fillRect(lx - 40, ly + 8, 80, 28);
    ctx.fillStyle = '#8C7452';
    ctx.beginPath();
    ctx.arc(lx, ly + 22, 8, 0, Math.PI * 2);
    ctx.fill();

    // Outdoor Woven Armchairs with Terracotta & Ivory Pillows
    ctx.fillStyle = '#7A6B56';
    ctx.beginPath();
    ctx.ellipse(lx - 200, ly + 8, 55, 36, -0.25, 0, Math.PI * 2);
    ctx.ellipse(lx + 200, ly + 8, 55, 36, 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C87248'; // Terracotta cushion
    ctx.beginPath();
    ctx.arc(lx - 195, ly + 4, 18, 0, Math.PI * 2);
    ctx.arc(lx + 195, ly + 4, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Atmospheric Light Dispersion, Photometric Kelvin 2700K Hue & Ambient Occlusion.
 */
function renderLightingEffects(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  solarMode: SolarTimeMode
) {
  if (solarMode === 'night') {
    // Warm 2700K Architectural Interior Ambiance with Dark Sky Vignette
    const ambientGlow = ctx.createRadialGradient(w * 0.5, h * 0.45, 120, w * 0.5, h * 0.45, w * 0.7);
    ambientGlow.addColorStop(0, 'rgba(255, 195, 110, 0.22)');
    ambientGlow.addColorStop(0.5, 'rgba(255, 160, 60, 0.08)');
    ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, w, h);
  } else if (solarMode === 'golden') {
    // Radiant Golden Hour Sunlight Wash
    const goldenGlow = ctx.createRadialGradient(w * 0.4, h * 0.42, 100, w * 0.4, h * 0.42, w * 0.75);
    goldenGlow.addColorStop(0, 'rgba(255, 210, 140, 0.26)');
    goldenGlow.addColorStop(0.55, 'rgba(235, 145, 75, 0.12)');
    goldenGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = goldenGlow;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Crisp Natural Daylight with Subtle Warm Fill
    const morningGlow = ctx.createRadialGradient(w * 0.5, h * 0.4, 80, w * 0.5, h * 0.4, w * 0.65);
    morningGlow.addColorStop(0, 'rgba(255, 250, 240, 0.12)');
    morningGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = morningGlow;
    ctx.fillRect(0, 0, w, h);
  }
}
