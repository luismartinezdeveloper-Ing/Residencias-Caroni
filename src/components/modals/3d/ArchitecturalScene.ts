import * as THREE from 'three';
import { UnitData } from '../../../types/brand';

export type SolarTimeMode = 'morning' | 'golden' | 'night';

export interface SceneMaterials {
  travertine: THREE.MeshStandardMaterial;
  travertineDark: THREE.MeshStandardMaterial;
  concreteSlab: THREE.MeshStandardMaterial;
  aluminumFrame: THREE.MeshStandardMaterial;
  architecturalGlass: THREE.MeshPhysicalMaterial;
  glassBalustrade: THREE.MeshPhysicalMaterial;
  interiorGlow: THREE.MeshStandardMaterial;
  coveLed: THREE.MeshStandardMaterial;
  interiorWood: THREE.MeshStandardMaterial;
  interiorIsland: THREE.MeshStandardMaterial;
  planterFoliage: THREE.MeshStandardMaterial;
  creeperFoliage: THREE.MeshStandardMaterial;
  planterBox: THREE.MeshStandardMaterial;
  gardenGrass: THREE.MeshStandardMaterial;
  woodPergola: THREE.MeshStandardMaterial;
  woodDeck: THREE.MeshStandardMaterial;
  bronzeAccent: THREE.MeshStandardMaterial;
  waterMirror: THREE.MeshPhysicalMaterial;
  sotanoMat: THREE.MeshStandardMaterial;
  inkLine: THREE.LineBasicMaterial;
  highlightMat: THREE.MeshStandardMaterial;
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
 * Helper to configure Trilinear Texture Mipmapping and Anisotropic Filtering on textures.
 * This completely eliminates visual shimmering, sparkling, and moiré noise when the camera
 * is far or viewing the building at oblique / grazing angles.
 */
export function setupTextureMipmappingAndAnisotropy<T extends THREE.Texture>(
  texture: T,
  maxAnisotropy: number = 16
): T {
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter; // Trilinear Mipmap Filtering
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.max(1, Math.min(maxAnisotropy, 16)); // Hardware Anisotropic Filtering (typically 8x-16x)
  texture.needsUpdate = true;
  return texture;
}

// Procedural high-res Roman Travertine stone texture generator with Ashlar Masonry & Recessed Joint Reveals (Buñas Rehundidas)
function createTravertineTexture(maxAnisotropy: number = 16): { colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
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
    // 1. Base Travertino Romano Cream Matrix (#FAF7F2 to #F3EFE6)
    ctx.fillStyle = '#F8F5EE';
    ctx.fillRect(0, 0, 1024, 1024);

    // Neutral baseline for bump/height map (128 medium gray)
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    // Baseline roughness for honed matte stone (roughness ~ 0.58)
    rCtx.fillStyle = '#949494';
    rCtx.fillRect(0, 0, 1024, 1024);

    // 2. Micro stone pores and natural mineral grain (Poro Abierto)
    for (let i = 0; i < 90000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const gray = Math.floor(236 + Math.random() * 19);
      ctx.fillStyle = `rgb(${gray}, ${gray - 5}, ${gray - 12})`;
      ctx.fillRect(x, y, 1.5, 1.5);

      const bVal = Math.floor(122 + (Math.random() - 0.5) * 22);
      bCtx.fillStyle = `rgb(${bVal}, ${bVal}, ${bVal})`;
      bCtx.fillRect(x, y, 1.5, 1.5);

      const rVal = Math.floor(140 + Math.random() * 30);
      rCtx.fillStyle = `rgb(${rVal}, ${rVal}, ${rVal})`;
      rCtx.fillRect(x, y, 1.5, 1.5);
    }

    // 3. Organic Sedimentary Strata & Veining (Vetas Naturales del Travertino)
    for (let j = 0; j < 48; j++) {
      const y = Math.random() * 1024;
      const alpha = 0.10 + Math.random() * 0.16;
      ctx.strokeStyle = `rgba(196, 185, 166, ${alpha})`;
      ctx.lineWidth = 1.2 + Math.random() * 3.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        260,
        y + (Math.random() - 0.5) * 25,
        680,
        y + (Math.random() - 0.5) * 30,
        1024,
        y + (Math.random() - 0.5) * 15
      );
      ctx.stroke();

      bCtx.strokeStyle = `rgba(${Math.floor(105 - alpha * 70)}, 105, 105, 0.45)`;
      bCtx.lineWidth = ctx.lineWidth;
      bCtx.beginPath();
      bCtx.moveTo(0, y);
      bCtx.bezierCurveTo(
        260,
        y + (Math.random() - 0.5) * 25,
        680,
        y + (Math.random() - 0.5) * 30,
        1024,
        y + (Math.random() - 0.5) * 15
      );
      bCtx.stroke();
    }

    // 4. Architectural Ashlar Masonry Joints & Recessed Shadow Reveals (Despiece de Cantería con Buñas Rehundidas)
    // Horizontal Courses (Hileras de 128px ~ 60cm de sillar arquitectónico)
    const rowHeight = 128;
    const blockWidth = 256; // 120cm sillar

    for (let r = 0; r <= 8; r++) {
      const y = r * rowHeight;

      // Deep recessed horizontal joint reveal (Buña horizontal rehundida de 20mm)
      // Color channel: darker shadow crevice
      ctx.fillStyle = 'rgba(75, 68, 58, 0.55)';
      ctx.fillRect(0, y - 2, 1024, 4);

      // Height bump channel: deep crevice (black) with bevel
      bCtx.fillStyle = '#202020';
      bCtx.fillRect(0, y - 2, 1024, 4);
      bCtx.fillStyle = '#555555';
      bCtx.fillRect(0, y - 4, 1024, 2);
      bCtx.fillRect(0, y + 2, 1024, 2);

      // Roughness channel: high diffuse inside crevice
      rCtx.fillStyle = '#C0C0C0';
      rCtx.fillRect(0, y - 2, 1024, 4);

      // Staggered Vertical Ashlar Joints (Traba a Matajunta de cantería)
      const xOffset = (r % 2 === 0) ? 0 : blockWidth * 0.5;
      for (let bx = xOffset; bx <= 1024; bx += blockWidth) {
        ctx.fillStyle = 'rgba(75, 68, 58, 0.5)';
        ctx.fillRect(bx - 2, y, 4, rowHeight);

        bCtx.fillStyle = '#222222';
        bCtx.fillRect(bx - 2, y, 4, rowHeight);
        bCtx.fillStyle = '#555555';
        bCtx.fillRect(bx - 4, y, 2, rowHeight);
        bCtx.fillRect(bx + 2, y, 2, rowHeight);

        rCtx.fillStyle = '#C0C0C0';
        rCtx.fillRect(bx - 2, y, 4, rowHeight);
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

// Procedural Equirectangular Environment Map for real IBL reflections (360° Sky + Ávila + Valley Horizon + Ground)
export function createArchitecturalEnvironmentMap(mode: SolarTimeMode): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (mode === 'morning') {
    // 1. Crisp 360° Celestial Dome
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 290);
    skyGrad.addColorStop(0, '#4A729A');
    skyGrad.addColorStop(0.45, '#8CB6D4');
    skyGrad.addColorStop(0.85, '#DCEBF5');
    skyGrad.addColorStop(1, '#FAF5E8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 290);

    // 2. Morning Sun Glow in Equirectangular Space
    const sunGrad = ctx.createRadialGradient(280, 110, 6, 280, 110, 160);
    sunGrad.addColorStop(0, 'rgba(255, 255, 245, 1)');
    sunGrad.addColorStop(0.25, 'rgba(255, 248, 215, 0.6)');
    sunGrad.addColorStop(0.7, 'rgba(255, 240, 190, 0.15)');
    sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 1024, 290);

    // 3. Continuous 360° Mountain Silhouette & Caracas Horizon (Seamless at X=0 and X=1024)
    ctx.fillStyle = '#6E847C';
    ctx.beginPath();
    ctx.moveTo(0, 290);
    ctx.lineTo(0, 245);
    ctx.bezierCurveTo(160, 220, 320, 185, 480, 210);
    ctx.bezierCurveTo(640, 235, 800, 205, 960, 235);
    ctx.lineTo(1024, 245);
    ctx.lineTo(1024, 290);
    ctx.closePath();
    ctx.fill();

    // 4. Atmospheric Horizon Haze
    const hazeGrad = ctx.createLinearGradient(0, 240, 0, 290);
    hazeGrad.addColorStop(0, 'rgba(220, 235, 245, 0)');
    hazeGrad.addColorStop(1, 'rgba(250, 245, 232, 0.7)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, 240, 1024, 50);

    // 5. Ground / Urban Pedestal Plane
    const groundGrad = ctx.createLinearGradient(0, 290, 0, 512);
    groundGrad.addColorStop(0, '#DDD7CB');
    groundGrad.addColorStop(0.4, '#C8BFAD');
    groundGrad.addColorStop(1, '#8A8272');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 290, 1024, 222);
  } else if (mode === 'golden') {
    // 1. Golden Hour Warm Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 290);
    skyGrad.addColorStop(0, '#263856');
    skyGrad.addColorStop(0.35, '#9C5840');
    skyGrad.addColorStop(0.7, '#E08038');
    skyGrad.addColorStop(1, '#FFCA75');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 290);

    // 2. Sunset Sun Glow
    const sunGrad = ctx.createRadialGradient(780, 210, 10, 780, 210, 240);
    sunGrad.addColorStop(0, 'rgba(255, 248, 210, 1)');
    sunGrad.addColorStop(0.35, 'rgba(255, 160, 80, 0.65)');
    sunGrad.addColorStop(0.8, 'rgba(255, 110, 40, 0.2)');
    sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 1024, 290);

    // 3. Warm Mountain Silhouette
    ctx.fillStyle = '#3E242B';
    ctx.beginPath();
    ctx.moveTo(0, 290);
    ctx.lineTo(0, 245);
    ctx.bezierCurveTo(160, 220, 320, 185, 480, 210);
    ctx.bezierCurveTo(640, 235, 800, 205, 960, 235);
    ctx.lineTo(1024, 245);
    ctx.lineTo(1024, 290);
    ctx.closePath();
    ctx.fill();

    // 4. Ground
    const groundGrad = ctx.createLinearGradient(0, 290, 0, 512);
    groundGrad.addColorStop(0, '#6B4A34');
    groundGrad.addColorStop(1, '#2B1A13');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 290, 1024, 222);
  } else {
    // 1. Deep Twilight / Night Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 290);
    skyGrad.addColorStop(0, '#090D16');
    skyGrad.addColorStop(0.55, '#121A2C');
    skyGrad.addColorStop(0.85, '#1D2436');
    skyGrad.addColorStop(1, '#342E35');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 290);

    // 2. Distant Night Mountain Silhouette
    ctx.fillStyle = '#0B0F18';
    ctx.beginPath();
    ctx.moveTo(0, 290);
    ctx.lineTo(0, 250);
    ctx.bezierCurveTo(160, 230, 320, 195, 480, 225);
    ctx.bezierCurveTo(640, 245, 800, 215, 960, 245);
    ctx.lineTo(1024, 250);
    ctx.lineTo(1024, 290);
    ctx.closePath();
    ctx.fill();

    // 3. Ground
    ctx.fillStyle = '#07090E';
    ctx.fillRect(0, 290, 1024, 222);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

export function createArchitecturalMaterials(maxAnisotropy: number = 16): SceneMaterials {
  const { colorMap, bumpMap, roughnessMap } = createTravertineTexture(maxAnisotropy);

  return {
    travertine: new THREE.MeshStandardMaterial({
      color: 0xFAF8F4,
      map: colorMap,
      bumpMap: bumpMap,
      bumpScale: 0.065, // Enhanced tactile relief for ashlar joints and travertine pores
      roughnessMap: roughnessMap,
      roughness: 0.62,
      metalness: 0.02,
    }),
    travertineDark: new THREE.MeshStandardMaterial({
      color: 0xE8E2D4,
      map: colorMap,
      bumpMap: bumpMap,
      bumpScale: 0.05,
      roughnessMap: roughnessMap,
      roughness: 0.72,
      metalness: 0.04,
    }),
    concreteSlab: new THREE.MeshStandardMaterial({
      color: 0xE8E2D6,
      roughness: 0.75,
      metalness: 0.02,
    }),
    aluminumFrame: new THREE.MeshStandardMaterial({
      color: 0x161514,
      roughness: 0.22,
      metalness: 0.88,
    }),
    architecturalGlass: new THREE.MeshPhysicalMaterial({
      color: 0x0F1419, // Deep Obsidian Architectural Smoked Glass (95% opacidad en modo diurno)
      transparent: true,
      opacity: 0.95, // Opacidad al 95% para un tinte oscuro de alto control solar
      roughness: 0.03,
      metalness: 0.16,
      transmission: 0.0,
      ior: 1.54,
      reflectivity: 0.90,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xFFFFFF),
      envMapIntensity: 1.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    glassBalustrade: new THREE.MeshPhysicalMaterial({
      color: 0x14191E, // Deep Smoked Laminated Glass Balustrade
      transparent: true,
      opacity: 0.78, // Tono ahumado oscuro profundo en barandillas
      roughness: 0.02,
      metalness: 0.12,
      transmission: 0.0,
      ior: 1.52,
      reflectivity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      specularIntensity: 0.95,
      specularColor: new THREE.Color(0xFFFFFF),
      envMapIntensity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    interiorGlow: new THREE.MeshStandardMaterial({
      color: 0xFFF6E8,
      emissive: 0xFFA032, // Warm 2700K Architectural LED Cove Glow
      emissiveIntensity: 0.9,
      roughness: 0.6,
    }),
    coveLed: new THREE.MeshStandardMaterial({
      color: 0xFFF8E7,
      emissive: 0xFFB347, // 2700K Warm Linear LED Architectural Fixture
      emissiveIntensity: 3.5, // Crisp high visibility glow
      roughness: 0.1,
    }),
    interiorWood: new THREE.MeshStandardMaterial({
      color: 0x825C3A,
      roughness: 0.45,
      metalness: 0.06,
    }),
    interiorIsland: new THREE.MeshStandardMaterial({
      color: 0xF5F0E6,
      roughness: 0.35,
      metalness: 0.1,
    }),
    planterFoliage: new THREE.MeshStandardMaterial({
      color: 0x2E4A28,
      roughness: 0.6,
      metalness: 0.02,
    }),
    creeperFoliage: new THREE.MeshStandardMaterial({
      color: 0x3D6334,
      roughness: 0.55,
      metalness: 0.02,
    }),
    planterBox: new THREE.MeshStandardMaterial({
      color: 0x8C7452,
      roughness: 0.5,
      metalness: 0.15,
    }),
    gardenGrass: new THREE.MeshStandardMaterial({
      color: 0x486E3A,
      roughness: 0.88,
      metalness: 0.01,
    }),
    woodPergola: new THREE.MeshStandardMaterial({
      color: 0x2E251C,
      roughness: 0.55,
      metalness: 0.1,
    }),
    woodDeck: new THREE.MeshStandardMaterial({
      color: 0x8A6D4B,
      roughness: 0.4,
      metalness: 0.05,
    }),
    bronzeAccent: new THREE.MeshStandardMaterial({
      color: 0x8C7452,
      roughness: 0.35,
      metalness: 0.75,
    }),
    waterMirror: new THREE.MeshPhysicalMaterial({
      color: 0x2A4048,
      transparent: true,
      opacity: 0.88,
      roughness: 0.06,
      metalness: 0.2,
      transmission: 0.65,
      ior: 1.333,
      reflectivity: 0.95,
      clearcoat: 1.0,
    }),
    sotanoMat: new THREE.MeshStandardMaterial({
      color: 0x24201A,
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

// Procedural stratified botanical cluster with cascading vines
function createRichFoliageCluster(
  width: number,
  height: number,
  depth: number,
  materials: SceneMaterials
): THREE.Group {
  const group = new THREE.Group();
  const leafCount = Math.max(5, Math.floor(width * 2.8));

  // 1. Shrub & Monstera Core
  for (let i = 0; i < leafCount; i++) {
    const leafGeo = new THREE.DodecahedronGeometry(0.32 + Math.random() * 0.3, 1);
    const leafMesh = new THREE.Mesh(leafGeo, materials.planterFoliage);
    leafMesh.position.set(
      (Math.random() - 0.5) * (width * 0.85),
      (Math.random() - 0.1) * height + 0.1,
      (Math.random() - 0.5) * (depth * 0.75)
    );
    leafMesh.scale.set(1 + Math.random() * 0.4, 0.7 + Math.random() * 0.5, 1 + Math.random() * 0.4);
    leafMesh.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4);
    leafMesh.castShadow = true;
    group.add(leafMesh);
  }

  // 2. Cascading Trailing Creepers (Enredaderas colgantes cayendo por el travertino)
  const creeperCount = Math.max(3, Math.floor(width * 1.5));
  for (let c = 0; c < creeperCount; c++) {
    const x = (Math.random() - 0.5) * (width * 0.9);
    const vineLength = 0.6 + Math.random() * 1.4;
    const dropSteps = 4;

    for (let s = 0; s < dropSteps; s++) {
      const dropY = -((s / dropSteps) * vineLength);
      const vineGeo = new THREE.SphereGeometry(0.18 + Math.random() * 0.12, 6, 6);
      const vineMesh = new THREE.Mesh(vineGeo, materials.creeperFoliage);
      vineMesh.position.set(
        x + (Math.random() - 0.5) * 0.2,
        dropY,
        depth * 0.5 + 0.08
      );
      vineMesh.scale.set(1.2, 0.7, 0.9);
      vineMesh.castShadow = true;
      group.add(vineMesh);
    }
  }

  return group;
}

// Cleanly bounded Architectural Terrace with Travertine Slab, Inset Teak Deck, Slim Planter & Glass Balustrade
function createArchitecturalTerrace(
  width: number,
  depth: number,
  materials: SceneMaterials,
  options: {
    hasWoodDeck?: boolean;
    hasPlanter?: boolean;
    isFacingNorth?: boolean;
  } = {}
): THREE.Group {
  const group = new THREE.Group();
  const terraceWidth = width;

  // 1. Structural Concrete / Travertine Base Slab (Losa estructural de balcón)
  const slabHeight = 0.28;
  const floorGeo = new THREE.BoxGeometry(terraceWidth, slabHeight, depth);
  const floorMesh = new THREE.Mesh(floorGeo, materials.travertine);
  floorMesh.position.set(0, slabHeight * 0.5, 0);
  floorMesh.receiveShadow = true;
  floorMesh.castShadow = true;
  group.add(floorMesh);

  // Structural edge inking for architectural linework
  const floorLine = new THREE.LineSegments(new THREE.EdgesGeometry(floorGeo), materials.inkLine);
  floorMesh.add(floorLine);

  // 2. Inset Teak Wood Deck (Deck de madera Ipe/Teca enmarcado en travertino, sin colisiones)
  if (options.hasWoodDeck) {
    const deckMargin = 0.12;
    const deckW = terraceWidth - deckMargin * 2;
    const deckD = depth - deckMargin * 2;
    const deckH = 0.04;
    const deckGeo = new THREE.BoxGeometry(deckW, deckH, deckD);
    const deckMesh = new THREE.Mesh(deckGeo, materials.woodDeck);
    // Positioned flush on top of the travertine slab, perfectly inside the terrace boundary
    deckMesh.position.set(0, slabHeight + deckH * 0.5, 0);
    deckMesh.receiveShadow = true;
    deckMesh.castShadow = true;
    group.add(deckMesh);
  }

  // 3. Perimeter Edge Planter with Biofilia (Flush at outer edge, no wall clipping)
  if (options.hasPlanter) {
    const planterD = 0.65;
    const planterH = 0.55;
    const planterOffsetZ = (depth * 0.5) - (planterD * 0.5);
    const signedPlanterZ = options.isFacingNorth ? -planterOffsetZ : planterOffsetZ;

    const planterGeo = new THREE.BoxGeometry(terraceWidth - 0.2, planterH, planterD);
    const planterMesh = new THREE.Mesh(planterGeo, materials.travertine);
    planterMesh.position.set(0, slabHeight + planterH * 0.5, signedPlanterZ);
    planterMesh.receiveShadow = true;
    planterMesh.castShadow = true;
    group.add(planterMesh);

    // Slim Bronze trim on planter
    const capGeo = new THREE.BoxGeometry(terraceWidth - 0.2, 0.03, planterD);
    const capMesh = new THREE.Mesh(capGeo, materials.bronzeAccent);
    capMesh.position.set(0, slabHeight + planterH, signedPlanterZ);
    group.add(capMesh);

    // Foliage inside planter
    const foliage = createRichFoliageCluster(terraceWidth - 0.6, planterH * 1.3, planterD * 0.8, materials);
    foliage.position.set(0, slabHeight + planterH, signedPlanterZ);
    group.add(foliage);

    // Warm Under-Planter LED Grazing Strip (Luz rasante cálida 2700K bajo jardinera sobre el deck)
    const grazeGeo = new THREE.BoxGeometry(terraceWidth - 0.4, 0.02, 0.03);
    const grazeMesh = new THREE.Mesh(grazeGeo, materials.coveLed);
    grazeMesh.position.set(0, slabHeight + 0.02, signedPlanterZ + (options.isFacingNorth ? (planterD * 0.5 - 0.03) : (-planterD * 0.5 + 0.03)));
    group.add(grazeMesh);
  }

  // 4. Glass Balustrade at the outer perimeter (Flush with terrace outer edge)
  const balustradeZ = options.isFacingNorth ? -(depth * 0.5) : (depth * 0.5);
  const balustrade = createGlassBalustrade(terraceWidth, 1.05, materials);
  balustrade.position.set(0, slabHeight, balustradeZ);
  if (options.isFacingNorth) {
    balustrade.rotation.y = Math.PI;
  }
  group.add(balustrade);

  return group;
}

// Realistic Planter Box with Travertine trim, Live Foliage & Cascading Vines
function createPlanterWithVegetation(
  width: number,
  height: number,
  depth: number,
  materials: SceneMaterials
): THREE.Group {
  const group = new THREE.Group();

  // Planter Box (Piedra Travertino)
  const boxGeo = new THREE.BoxGeometry(width, height, depth);
  const boxMesh = new THREE.Mesh(boxGeo, materials.travertine);
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = true;
  group.add(boxMesh);

  // Metal cap trim (Flush width)
  const capGeo = new THREE.BoxGeometry(width, 0.04, depth);
  const capMesh = new THREE.Mesh(capGeo, materials.bronzeAccent);
  capMesh.position.y = height * 0.5;
  group.add(capMesh);

  // Top Foliage
  const foliage = createRichFoliageCluster(width - 0.2, height * 1.5, depth * 0.85, materials);
  foliage.position.y = height * 0.5;
  group.add(foliage);

  return group;
}

// Realistic Glass Balustrade with Seamless Recessed Base Shoe & Brushed Bronze Top Cap
function createGlassBalustrade(
  width: number,
  height: number,
  materials: SceneMaterials
): THREE.Group {
  const group = new THREE.Group();

  // 1. Tempered / Laminated Structural Glass Panel
  const glassGeo = new THREE.PlaneGeometry(width, height);
  const glassMesh = new THREE.Mesh(glassGeo, materials.glassBalustrade);
  glassMesh.position.y = height * 0.5;
  group.add(glassMesh);

  // 2. Brushed Bronze Top Handrail Pletina (Pletina superior de 40x15 mm en bronce cepillado)
  const capGeo = new THREE.BoxGeometry(width, 0.025, 0.045);
  const capMesh = new THREE.Mesh(capGeo, materials.bronzeAccent);
  capMesh.position.y = height;
  capMesh.castShadow = true;
  group.add(capMesh);

  // 3. Recessed Base Shoe Profile in Dark Graphite (Zapata estructural embutida en losa)
  const shoeGeo = new THREE.BoxGeometry(width, 0.05, 0.05);
  const shoeMesh = new THREE.Mesh(shoeGeo, materials.aluminumFrame);
  shoeMesh.position.y = 0.025;
  group.add(shoeMesh);

  // 4. Subtle Vertical Glass Joint Clips at 1.80m Intervals
  const clipCount = Math.max(1, Math.floor(width / 1.8));
  const step = width / (clipCount + 1);
  for (let i = 1; i <= clipCount; i++) {
    const cx = -width * 0.5 + i * step;
    const clipGeo = new THREE.BoxGeometry(0.02, 0.06, 0.035);
    const clip = new THREE.Mesh(clipGeo, materials.bronzeAccent);
    clip.position.set(cx, 0.03, 0);
    group.add(clip);
  }

  return group;
}

// Pre-instantiated static profiles to guarantee ZERO garbage-collection allocations per frame
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
    // En modo diurno: Vidrios oscuros / obsidiana con control solar arquitectónico al 95% de opacidad
    opacity: 0.95,
    color: new THREE.Color(0x0F1419),
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0.0,
    envMapIntensity: 1.05,
    balustradeOpacity: 0.78,
    balustradeColor: new THREE.Color(0x14191E),
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
    // Al atardecer: Tonalidad bronce cálida con reflejos dorados y sutil translucidez hacia el interior
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
    // En modo nocturno: El vidrio se vuelve ultra translúcido y emite resplandor cálido interior (efecto linterna)
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
 * Función de transición controlada para materiales de vidrio, iluminación arquitectónica y envolventes:
 * - Cuando se activa el modo nocturno (o de baja luz):
 *    1. Aumenta la emisividad cálida (emissive 2700K) de manera controlada simulando el resplandor de luminarias interiores (efecto linterna arquitectónica).
 *    2. Reduce la opacidad (alpha transparency) para asegurar máxima permeabilidad y legibilidad de la arquitectura interior.
 *    3. Disminuye la reflectividad especular del cielo oscuro para evitar que los vidrios se oscurezcan.
 *    4. Activa las tiras LED perimetrales (coveLed), el resplandor de losas (interiorGlow) y la iluminación subacuática de piscinas (waterMirror).
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
    return false; // Settled
  }

  const t = Math.max(0.01, Math.min(1.0, transitionSpeed));

  // Check if properties are close enough to skip or complete
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
    return false; // Settled
  }

  // Interpolar propiedades del vidrio de fachada principal
  glass.opacity = THREE.MathUtils.lerp(glass.opacity, target.opacity, t);
  glass.color.lerp(target.color, t);
  glass.emissive.lerp(target.emissive, t);
  glass.emissiveIntensity = THREE.MathUtils.lerp(glass.emissiveIntensity, target.emissiveIntensity, t);
  glass.envMapIntensity = THREE.MathUtils.lerp(glass.envMapIntensity, target.envMapIntensity, t);

  // Interpolar propiedades del vidrio de barandillas
  balustrade.opacity = THREE.MathUtils.lerp(balustrade.opacity, target.balustradeOpacity, t);
  balustrade.color.lerp(target.balustradeColor, t);
  balustrade.emissive.lerp(target.balustradeEmissive, t);
  balustrade.emissiveIntensity = THREE.MathUtils.lerp(balustrade.emissiveIntensity, target.balustradeEmissiveIntensity, t);

  // Interpolar tiras LED perimetrales y luminarias interiores
  cove.emissive.lerp(target.coveEmissive, t);
  cove.emissiveIntensity = THREE.MathUtils.lerp(cove.emissiveIntensity, target.coveIntensity, t);

  glow.emissive.lerp(target.interiorEmissive, t);
  glow.emissiveIntensity = THREE.MathUtils.lerp(glow.emissiveIntensity, target.interiorIntensity, t);

  // Iluminación subacuática de piscinas
  if (water) {
    water.emissive.lerp(target.waterEmissive, t);
    water.emissiveIntensity = THREE.MathUtils.lerp(water.emissiveIntensity, target.waterIntensity, t);
  }

  return true; // Still transitioning
}

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

  // Detailed Unit Module with Multi-Panel Glazing, Cantilevers, Slabs, Inhabited Interior & Columns
  const createDetailedUnitModule = (
    w: number,
    h: number,
    d: number,
    unitId: string,
    isUpperDuplex: boolean = false
  ): THREE.Group => {
    const group = new THREE.Group();

    // 1. Primary Structural Enclosure: Blind Side Shear Walls & Ceiling (Open Interior Cavity)
    const wallThick = 0.40;
    const slabThickness = 0.32;
    const innerW = w - wallThick * 2;
    const innerH = h - slabThickness * 2;

    // Left Blind Shear Wall in Roman Travertine (Muro ciego lateral este/oeste con buñas)
    const leftWallGeo = new THREE.BoxGeometry(wallThick, h, d);
    const leftWall = new THREE.Mesh(leftWallGeo, materials.travertine);
    leftWall.position.set(-w * 0.5 + wallThick * 0.5, 0, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    (leftWall as any).userData = { unitId };
    group.add(leftWall);

    // Right Blind Shear Wall in Roman Travertine
    const rightWall = new THREE.Mesh(leftWallGeo, materials.travertine);
    rightWall.position.set(w * 0.5 - wallThick * 0.5, 0, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    (rightWall as any).userData = { unitId };
    group.add(rightWall);

    // Top Ceiling Slab
    const ceilingGeo = new THREE.BoxGeometry(w, slabThickness, d);
    const ceilingMesh = new THREE.Mesh(ceilingGeo, materials.travertineDark);
    ceilingMesh.position.set(0, h * 0.5 - slabThickness * 0.5, 0);
    ceilingMesh.receiveShadow = true;
    group.add(ceilingMesh);

    // Internal Dividing Travertine Wall (Center-back structural spine)
    const spineGeo = new THREE.BoxGeometry(0.35, innerH, d * 0.4);
    const spineMesh = new THREE.Mesh(spineGeo, materials.travertine);
    spineMesh.position.set(w * 0.05, 0, -d * 0.15);
    spineMesh.receiveShadow = true;
    group.add(spineMesh);

    if (unitMeshesMap[unitId]) {
      unitMeshesMap[unitId].push(leftWall, rightWall);
    }

    // Architectural Edge Inking on outer profile
    const outerBoundingGeo = new THREE.BoxGeometry(w, h, d);
    const edgesGeom = new THREE.EdgesGeometry(outerBoundingGeo);
    const line = new THREE.LineSegments(edgesGeom, materials.inkLine);
    group.add(line);

    // 2. Concrete Bottom Slab Plate (Losa Estructural Inferior)
    const bottomSlabGeo = new THREE.BoxGeometry(w, slabThickness, d);
    const bottomSlab = new THREE.Mesh(bottomSlabGeo, materials.concreteSlab);
    bottomSlab.position.set(0, -h * 0.5 + slabThickness * 0.5, 0);
    bottomSlab.castShadow = true;
    bottomSlab.receiveShadow = true;
    group.add(bottomSlab);

    // 3. Facade Glazing with Architectural Mullions & Sliding Doors (Front & Back - Floor-to-Ceiling)
    const glassOffset = d * 0.505;
    const windowW = innerW;
    const windowH = innerH;

    // Front (Z+) Glazing & Architectural Perimeter Frame
    const frontGlassGeo = new THREE.PlaneGeometry(windowW, windowH);
    const frontGlass = new THREE.Mesh(frontGlassGeo, materials.architecturalGlass);
    frontGlass.position.set(0, 0, glassOffset);
    group.add(frontGlass);

    // Slim top frame header (Flush against ceiling slab)
    const topHeaderGeo = new THREE.BoxGeometry(windowW + 0.04, 0.06, 0.10);
    const frontTopHeader = new THREE.Mesh(topHeaderGeo, materials.aluminumFrame);
    frontTopHeader.position.set(0, windowH * 0.5 - 0.03, glassOffset);
    group.add(frontTopHeader);

    // Slim left and right side jambs
    const sideJambGeo = new THREE.BoxGeometry(0.06, windowH, 0.10);
    const frontLeftJamb = new THREE.Mesh(sideJambGeo, materials.aluminumFrame);
    frontLeftJamb.position.set(-windowW * 0.5 + 0.03, 0, glassOffset);
    group.add(frontLeftJamb);

    const frontRightJamb = new THREE.Mesh(sideJambGeo, materials.aluminumFrame);
    frontRightJamb.position.set(windowW * 0.5 - 0.03, 0, glassOffset);
    group.add(frontRightJamb);

    // Front Mullions (1.80m Architectural Vano Modularity)
    const bayCount = Math.max(3, Math.round(windowW / 1.8));
    const baySpacing = windowW / bayCount;
    for (let b = 1; b < bayCount; b++) {
      const mx = -windowW * 0.5 + b * baySpacing;
      // Vertical Mullion (Montante vertical grafito de piso a techo)
      const mullionGeo = new THREE.BoxGeometry(0.06, windowH, 0.12);
      const mullionMesh = new THREE.Mesh(mullionGeo, materials.aluminumFrame);
      mullionMesh.position.set(mx, 0, glassOffset);
      mullionMesh.castShadow = true;
      group.add(mullionMesh);
    }

    // Horizontal Transom (Travesaño horizontal intermedio)
    const transomGeo = new THREE.BoxGeometry(windowW, 0.05, 0.10);
    const transomMesh = new THREE.Mesh(transomGeo, materials.aluminumFrame);
    transomMesh.position.set(0, windowH * 0.15, glassOffset);
    group.add(transomMesh);

    // Recessed Floor Sliding Guide in Slab (Guía inferior en contacto con losa)
    const floorGuideGeo = new THREE.BoxGeometry(windowW + 0.04, 0.04, 0.14);
    const floorGuide = new THREE.Mesh(floorGuideGeo, materials.aluminumFrame);
    floorGuide.position.set(0, -windowH * 0.5 + 0.02, glassOffset);
    group.add(floorGuide);

    // Back (Z-) Glazing & Frame (Floor-to-Ceiling)
    const backGlass = new THREE.Mesh(frontGlassGeo, materials.architecturalGlass);
    backGlass.position.set(0, 0, -glassOffset);
    backGlass.rotation.y = Math.PI;
    group.add(backGlass);

    // Slim top frame header
    const backTopHeader = new THREE.Mesh(topHeaderGeo, materials.aluminumFrame);
    backTopHeader.position.set(0, windowH * 0.5 - 0.03, -glassOffset);
    group.add(backTopHeader);

    // Slim left and right side jambs
    const backLeftJamb = new THREE.Mesh(sideJambGeo, materials.aluminumFrame);
    backLeftJamb.position.set(-windowW * 0.5 + 0.03, 0, -glassOffset);
    group.add(backLeftJamb);

    const backRightJamb = new THREE.Mesh(sideJambGeo, materials.aluminumFrame);
    backRightJamb.position.set(windowW * 0.5 - 0.03, 0, -glassOffset);
    group.add(backRightJamb);

    // Back Mullions & Transoms
    for (let b = 1; b < bayCount; b++) {
      const mx = -windowW * 0.5 + b * baySpacing;
      const mullionGeo = new THREE.BoxGeometry(0.06, windowH, 0.12);
      const mullionMesh = new THREE.Mesh(mullionGeo, materials.aluminumFrame);
      mullionMesh.position.set(mx, 0, -glassOffset);
      mullionMesh.castShadow = true;
      group.add(mullionMesh);
    }

    const backTransom = new THREE.Mesh(transomGeo, materials.aluminumFrame);
    backTransom.position.set(0, windowH * 0.15, -glassOffset);
    group.add(backTransom);

    const backFloorGuide = new THREE.Mesh(floorGuideGeo, materials.aluminumFrame);
    backFloorGuide.position.set(0, -windowH * 0.5 + 0.02, -glassOffset);
    group.add(backFloorGuide);

    // Ceiling Perimeter LED Cove Light (Garganta de luz indirecta 2700K perimetral en cielorraso)
    const coveW = w * 0.88;
    const coveD = d * 0.88;
    const coveLightGeo = new THREE.BoxGeometry(coveW, 0.03, 0.05);
    const coveLightFront = new THREE.Mesh(coveLightGeo, materials.coveLed);
    coveLightFront.position.set(0, h * 0.44, d * 0.38);
    group.add(coveLightFront);

    const coveLightBack = new THREE.Mesh(coveLightGeo, materials.coveLed);
    coveLightBack.position.set(0, h * 0.44, -d * 0.38);
    group.add(coveLightBack);

    // 4. Inhabited Interior Spatial Detailing & Double-Height Mezzanine (Visible through Glass)
    if (!isUpperDuplex) {
      // Ground / Lower Floor Interior
      // Wood Slatted Feature Wall
      const woodWallGeo = new THREE.BoxGeometry(w * 0.42, h * 0.72, 0.08);
      const woodWall = new THREE.Mesh(woodWallGeo, materials.interiorWood);
      woodWall.position.set(-w * 0.24, 0, -d * 0.32);
      group.add(woodWall);

      // Accent Wall Wash Downlight on Wood Slat Wall
      const wallWashGeo = new THREE.BoxGeometry(w * 0.40, 0.025, 0.04);
      const wallWash = new THREE.Mesh(wallWashGeo, materials.coveLed);
      wallWash.position.set(-w * 0.24, h * 0.42, -d * 0.30);
      group.add(wallWash);

      // Kitchen Island with Quartz Top
      const islandGeo = new THREE.BoxGeometry(2.8, 0.9, 1.2);
      const islandMesh = new THREE.Mesh(islandGeo, materials.interiorIsland);
      islandMesh.position.set(w * 0.22, -h * 0.35 + 0.45, 0.5);
      group.add(islandMesh);

      // Suspended Minimalist Linear Chandelier
      const lightBarGeo = new THREE.BoxGeometry(2.4, 0.04, 0.04);
      const lightBar = new THREE.Mesh(lightBarGeo, materials.coveLed);
      lightBar.position.set(w * 0.22, h * 0.15, 0.5);
      group.add(lightBar);

      // Warm Interior Ceiling Downlight Floor Glow
      const interiorFloorGeo = new THREE.BoxGeometry(w * 0.94, 0.06, d * 0.94);
      const interiorFloor = new THREE.Mesh(interiorFloorGeo, materials.interiorGlow);
      interiorFloor.position.set(0, -h * 0.46, 0);
      group.add(interiorFloor);
    } else {
      // Upper Duplex Level: Cantilevered Mezzanine / Family Room with Void to Lower Living Room (Doble Altura 6.50m)
      const mezzanineDepth = d * 0.55;
      const mezzanineGeo = new THREE.BoxGeometry(w * 0.88, 0.26, mezzanineDepth);
      const mezzanineMesh = new THREE.Mesh(mezzanineGeo, materials.concreteSlab);
      mezzanineMesh.position.set(0, -h * 0.38, -d * 0.2);
      group.add(mezzanineMesh);

      // Mezzanine Glass Guardrail overlooking Double-Height Living Room
      const mezzRail = createGlassBalustrade(w * 0.86, 0.95, materials);
      mezzRail.position.set(0, -h * 0.25, -d * 0.2 + mezzanineDepth * 0.5);
      group.add(mezzRail);

      // Upper Library / Studio Slatted Bookcase
      const libraryGeo = new THREE.BoxGeometry(w * 0.35, h * 0.65, 0.12);
      const libraryMesh = new THREE.Mesh(libraryGeo, materials.interiorWood);
      libraryMesh.position.set(-w * 0.25, 0.1, -d * 0.42);
      group.add(libraryMesh);

      // Library Indirect Top Wash
      const libraryWash = new THREE.Mesh(new THREE.BoxGeometry(w * 0.34, 0.02, 0.04), materials.coveLed);
      libraryWash.position.set(-w * 0.25, h * 0.42, -d * 0.40);
      group.add(libraryWash);

      // Upper Ambient Glow
      const upperGlowGeo = new THREE.BoxGeometry(w * 0.85, 0.04, mezzanineDepth);
      const upperGlow = new THREE.Mesh(upperGlowGeo, materials.interiorGlow);
      upperGlow.position.set(0, -h * 0.35, -d * 0.2);
      group.add(upperGlow);
    }

    // 5. Structural Concrete Columns on Facade
    const col1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, h, 0.45), materials.travertine);
    col1.position.set(-w * 0.46, 0, glassOffset + 0.1);
    col1.castShadow = true;
    group.add(col1);

    const col2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, h, 0.45), materials.travertine);
    col2.position.set(w * 0.46, 0, glassOffset + 0.1);
    col2.castShadow = true;
    group.add(col2);

    return group;
  };

  // --- SÓTANO PRIVADO (-3.50 m · 36 puestos) ---
  const sotanoBaseGeo = new THREE.BoxGeometry(24.5, 3.5, 18.5);
  const sotanoMesh = new THREE.Mesh(sotanoBaseGeo, materials.sotanoMat);
  sotanoMesh.position.set(0, -2.75, 0);
  sotanoMesh.receiveShadow = true;
  sotanoMesh.castShadow = true;
  levelGroups.sotano.add(sotanoMesh);

  const sotanoLines = new THREE.LineSegments(new THREE.EdgesGeometry(sotanoBaseGeo), materials.inkLine);
  sotanoMesh.add(sotanoLines);

  // Parking Entrance Ramp with Security Wall
  const rampGeo = new THREE.BoxGeometry(5.0, 0.4, 8.0);
  const rampMesh = new THREE.Mesh(rampGeo, materials.sotanoMat);
  rampMesh.rotation.x = 0.28;
  rampMesh.position.set(-9.2, -3.2, 10.5);
  rampMesh.receiveShadow = true;
  levelGroups.sotano.add(rampMesh);

  // --- PLANTA BAJA & 1 (DÚPLEX: COTA ±0.00 a +8.50 m) ---
  // 1. Jardín Norte (1.030,45 m² · Dúplex)
  const jnLiving = createDetailedUnitModule(10.8, 4.25, 14.0, 'jardin-norte');
  jnLiving.position.set(-5.6, 1.125, 0);
  levelGroups.pb.add(jnLiving);

  const jnUpper = createDetailedUnitModule(10.8, 4.25, 14.0, 'jardin-norte', true);
  jnUpper.position.set(-5.6, 5.375, 0);
  levelGroups.pb.add(jnUpper);

  // Jardín Privado Exterior Norte (1.030,45 m² · 350 m² jardín libre continuo) con Piscina / Carril de Nado Privado
  const jnGardenGeo = new THREE.BoxGeometry(11.0, 0.4, 9.5);
  const jnGardenMesh = new THREE.Mesh(jnGardenGeo, materials.gardenGrass);
  jnGardenMesh.position.set(-5.6, -0.9, -11.75);
  jnGardenMesh.receiveShadow = true;
  levelGroups.pb.add(jnGardenMesh);

  // Private Lap Pool (Piscina privada de borde infinito en jardín norte)
  const poolW = 7.8;
  const poolD = 2.4;
  const poolWaterGeo = new THREE.BoxGeometry(poolW, 0.12, poolD);
  const poolWater = new THREE.Mesh(poolWaterGeo, materials.waterMirror);
  poolWater.position.set(-5.6, -0.72, -12.5);
  poolWater.receiveShadow = true;
  levelGroups.pb.add(poolWater);

  const poolBorderGeo = new THREE.BoxGeometry(poolW + 0.5, 0.22, poolD + 0.5);
  const poolBorder = new THREE.Mesh(poolBorderGeo, materials.travertine);
  poolBorder.position.set(-5.6, -0.82, -12.5);
  poolBorder.receiveShadow = true;
  levelGroups.pb.add(poolBorder);

  // Teak Solarium Deck adjacent to pool
  const solariumGeo = new THREE.BoxGeometry(poolW + 0.5, 0.08, 1.4);
  const solariumMesh = new THREE.Mesh(solariumGeo, materials.woodDeck);
  solariumMesh.position.set(-5.6, -0.72, -10.2);
  solariumMesh.receiveShadow = true;
  levelGroups.pb.add(solariumMesh);

  // Stepping Travertine Pavers on Grass
  for (let step = -4.2; step <= 4.2; step += 1.7) {
    const paverGeo = new THREE.BoxGeometry(1.2, 0.08, 0.7);
    const paver = new THREE.Mesh(paverGeo, materials.travertine);
    paver.position.set(-5.6 + step, -0.68, -8.6);
    paver.receiveShadow = true;
    levelGroups.pb.add(paver);
  }

  const jnGardenPlanter = createPlanterWithVegetation(10.8, 0.7, 0.9, materials);
  jnGardenPlanter.position.set(-5.6, -0.55, -16.0);
  levelGroups.pb.add(jnGardenPlanter);

  // 2. Jardín Sur (931,00 m² · Dúplex)
  const jsLiving = createDetailedUnitModule(10.8, 4.25, 14.0, 'jardin-sur');
  jsLiving.position.set(5.6, 1.125, 0);
  levelGroups.pb.add(jsLiving);

  const jsUpper = createDetailedUnitModule(10.8, 4.25, 14.0, 'jardin-sur', true);
  jsUpper.position.set(5.6, 5.375, 0);
  levelGroups.pb.add(jsUpper);

  // Jardín Privado Exterior Sur
  const jsGardenGeo = new THREE.BoxGeometry(11.0, 0.4, 8.0);
  const jsGardenMesh = new THREE.Mesh(jsGardenGeo, materials.gardenGrass);
  jsGardenMesh.position.set(5.6, -0.9, 11.0);
  jsGardenMesh.receiveShadow = true;
  levelGroups.pb.add(jsGardenMesh);

  const jsGardenPlanter = createPlanterWithVegetation(10.8, 0.7, 0.9, materials);
  jsGardenPlanter.position.set(5.6, -0.55, 14.6);
  levelGroups.pb.add(jsGardenPlanter);

  // Central Double-Height Glazed Lobby with Reflective Water Mirror
  const lobbyGeo = new THREE.BoxGeometry(2.4, 8.5, 6.2);
  const lobbyMesh = new THREE.Mesh(lobbyGeo, materials.architecturalGlass);
  lobbyMesh.position.set(0, 3.25, 0);
  levelGroups.pb.add(lobbyMesh);
  lobbyMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(lobbyGeo), materials.inkLine));

  // Reflective Entry Water Mirror (Espejo de agua de acceso)
  const waterGeo = new THREE.BoxGeometry(3.6, 0.15, 4.5);
  const waterMesh = new THREE.Mesh(waterGeo, materials.waterMirror);
  waterMesh.position.set(0, -0.7, 8.5);
  waterMesh.receiveShadow = true;
  levelGroups.pb.add(waterMesh);

  const waterBorderGeo = new THREE.BoxGeometry(3.8, 0.25, 4.7);
  const waterBorder = new THREE.Mesh(waterBorderGeo, materials.travertine);
  waterBorder.position.set(0, -0.8, 8.5);
  levelGroups.pb.add(waterBorder);

  // --- NIVEL P2 (COTA +8.50 a +12.75 m) ---
  // 3. Residencia 02 Norte (415,45 m²)
  const r02N = createDetailedUnitModule(10.8, 4.25, 14.0, 'residencia-02-norte');
  r02N.position.set(-5.6, 9.625, 0);
  levelGroups.p2.add(r02N);

  const r02NTerrace = createArchitecturalTerrace(10.8, 2.4, materials, {
    hasPlanter: true,
    isFacingNorth: true,
  });
  r02NTerrace.position.set(-5.6, 7.5, -8.2);
  levelGroups.p2.add(r02NTerrace);

  // 4. Residencia 02 Sur (415,80 m²)
  const r02S = createDetailedUnitModule(10.8, 4.25, 14.0, 'residencia-02-sur');
  r02S.position.set(5.6, 9.625, 0);
  levelGroups.p2.add(r02S);

  const r02STerrace = createArchitecturalTerrace(10.8, 2.4, materials, {
    hasPlanter: true,
    isFacingNorth: false,
  });
  r02STerrace.position.set(5.6, 7.5, 8.2);
  levelGroups.p2.add(r02STerrace);

  // --- NIVEL P3 (COTA +12.75 a +17.00 m) ---
  // 5. Residencia 03 Norte (415,45 m²)
  const r03N = createDetailedUnitModule(10.8, 4.25, 14.0, 'residencia-03-norte');
  r03N.position.set(-5.6, 13.875, 0);
  levelGroups.p3.add(r03N);

  const r03NTerrace = createArchitecturalTerrace(10.8, 2.4, materials, {
    hasPlanter: true,
    isFacingNorth: true,
  });
  r03NTerrace.position.set(-5.6, 11.75, -8.2);
  levelGroups.p3.add(r03NTerrace);

  // 6. Residencia 03 Sur (415,80 m²)
  const r03S = createDetailedUnitModule(10.8, 4.25, 14.0, 'residencia-03-sur');
  r03S.position.set(5.6, 13.875, 0);
  levelGroups.p3.add(r03S);

  const r03STerrace = createArchitecturalTerrace(10.8, 2.4, materials, {
    hasPlanter: true,
    isFacingNorth: false,
  });
  r03STerrace.position.set(5.6, 11.75, 8.2);
  levelGroups.p3.add(r03STerrace);

  // --- NIVEL MIRADOR / PENT-HOUSES (+17.00 a +25.50 m) ---
  // 7. Mirador Norte (590,70 m²)
  const mNorte = createDetailedUnitModule(10.8, 4.25, 14.0, 'mirador-norte');
  mNorte.position.set(-5.6, 18.125, 0);
  levelGroups.mirador.add(mNorte);

  const mNorteTerrace = createArchitecturalTerrace(10.8, 2.4, materials, {
    hasWoodDeck: true,
    hasPlanter: true,
    isFacingNorth: true,
  });
  mNorteTerrace.position.set(-5.6, 16.0, -8.2);
  levelGroups.mirador.add(mNorteTerrace);

  // Rooftop Reflective Water Feature / Hydro-Spa on Mirador Norte (Ávila View)
  const roofSpaWater = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 1.6), materials.waterMirror);
  roofSpaWater.position.set(-8.2, 16.35, -8.2);
  roofSpaWater.receiveShadow = true;
  levelGroups.mirador.add(roofSpaWater);

  const roofSpaRim = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.22, 1.9), materials.travertine);
  roofSpaRim.position.set(-8.2, 16.25, -8.2);
  roofSpaRim.receiveShadow = true;
  levelGroups.mirador.add(roofSpaRim);

  // 8. Mirador Sur (585,50 m²)
  const mSur = createDetailedUnitModule(10.8, 4.25, 14.0, 'mirador-sur');
  mSur.position.set(5.6, 18.125, 0);
  levelGroups.mirador.add(mSur);

  const mSurTerrace = createArchitecturalTerrace(10.8, 2.4, materials, {
    hasWoodDeck: true,
    hasPlanter: true,
    isFacingNorth: false,
  });
  mSurTerrace.position.set(5.6, 16.0, 8.2);
  levelGroups.mirador.add(mSurTerrace);

  // --- PÉRGOLADO Y REMATE ARQUITECTÓNICO (+20.50 a +22.00 m) ---
  for (let i = -10.0; i <= 10.0; i += 2.0) {
    const beamGeo = new THREE.BoxGeometry(0.2, 0.35, 14.0);
    const beamMesh = new THREE.Mesh(beamGeo, materials.woodPergola);
    beamMesh.position.set(i, 20.4, 0);
    beamMesh.castShadow = true;
    levelGroups.pergola.add(beamMesh);
  }

  // Cross Beams (Flush with perimeter width)
  for (let bz = -5.0; bz <= 5.0; bz += 2.5) {
    const crossBeamGeo = new THREE.BoxGeometry(21.6, 0.22, 0.22);
    const crossBeam = new THREE.Mesh(crossBeamGeo, materials.woodPergola);
    crossBeam.position.set(0, 20.6, bz);
    crossBeam.castShadow = true;
    levelGroups.pergola.add(crossBeam);
  }

  // Add all level groups to building root
  Object.keys(levelGroups).forEach((k) => buildingRoot.add(levelGroups[k]));

  // --- 3D HOTSPOT ANCHORS FOR INTERACTIVE NAVIGATION ---
  const unitAnchors: UnitAnchor[] = [
    {
      unitId: 'jardin-norte',
      name: 'Jardín Norte',
      code: 'JN',
      level: 'PB + 1',
      position: new THREE.Vector3(-5.6, 3.25, -7.5),
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
      position: new THREE.Vector3(-5.6, 9.6, -7.5),
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
      position: new THREE.Vector3(-5.6, 13.85, -7.5),
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
      position: new THREE.Vector3(-5.6, 18.5, -6.5),
      totalArea: 590.7,
    },
    {
      unitId: 'mirador-sur',
      name: 'Mirador Sur',
      code: 'MS',
      level: 'PH',
      position: new THREE.Vector3(5.6, 18.5, 6.5),
      totalArea: 585.5,
    },
  ];

  // --- MULTI-STATE SOLAR LIGHTING RIG (Morning, Golden Hour, Luxury Night) ---
  const lightsGroup = new THREE.Group();

  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.95);
  lightsGroup.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xFFFAF2, 1.5);
  sunLight.position.set(40, 65, 35);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 180;
  const d = 36;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0001;
  sunLight.shadow.normalBias = 0.03;
  sunLight.shadow.radius = 1.5;
  lightsGroup.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xEFEBE0, 0.65);
  fillLight.position.set(-35, 30, -30);
  lightsGroup.add(fillLight);

  const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xEFEBE0, 0.75);
  lightsGroup.add(hemisphereLight);

  // Interior warm point lights per architectural zone
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
    // Interpola suavemente materiales de vidrio (con memoización y zero allocations)
    const glassStillTransitioning = transitionGlassMaterials(materials, mode, deltaFactor);

    if (!isLightingTransitioning && !glassStillTransitioning) {
      return; // Fully settled, zero CPU calculation
    }

    const cfg = LIGHTING_TARGETS[mode];
    const d = Math.max(0.01, Math.min(1.0, deltaFactor));

    // Check light convergence
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

    // Interpolar iluminación del entorno y luminarias interiores
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
