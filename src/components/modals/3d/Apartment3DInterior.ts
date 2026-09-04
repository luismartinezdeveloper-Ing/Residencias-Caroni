import * as THREE from 'three';
import { SolarTimeMode } from './ArchitecturalScene';

/**
 * Procedural 3D Interior Apartment Geometry Generator
 * Generates true 3D spatial rooms with furniture, cabinetry, lighting, fixtures,
 * materials, and architectural details for immersive 360° and Stereoscopic VR tours.
 */

export interface Apartment3DEnvironment {
  group: THREE.Group;
  lights: THREE.Light[];
  updateSolarMode: (mode: SolarTimeMode) => void;
  dispose: () => void;
}

// Advanced PBR Texture Generator with Color, Bump/Normal and Roughness Maps
interface PBRTextureSet {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

// 1. Mármol Calacatta Vagli / Gold PBR (1024x1024 con vetas doradas/grises y micro-relieve)
function createCalacattaMarblePBR(): PBRTextureSet {
  const size = 1024;
  const cCanvas = document.createElement('canvas');
  cCanvas.width = size;
  cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d')!;

  // Fondo blanco cálido marfil de Carrara
  cCtx.fillStyle = '#FAF8F4';
  cCtx.fillRect(0, 0, size, size);

  // Bump baseline (128 gris neutro)
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Rugosidad base pulida (roughness ~ 0.15)
  rCtx.fillStyle = '#262626';
  rCtx.fillRect(0, 0, size, size);

  // Micro cristalización translúcida del mármol
  for (let i = 0; i < 40000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const g = Math.floor(248 + Math.random() * 7);
    cCtx.fillStyle = `rgba(${g}, ${g - 3}, ${g - 8}, 0.5)`;
    cCtx.fillRect(x, y, 2, 2);
  }

  // Vetas primarias dramáticas Calacatta (Gris grafito + toques de oro y ámbar)
  const veinCount = 18;
  for (let v = 0; v < veinCount; v++) {
    const isGold = v % 3 === 0;
    const startX = Math.random() * size;
    const startY = 0;

    cCtx.beginPath();
    cCtx.moveTo(startX, startY);
    bCtx.beginPath();
    bCtx.moveTo(startX, startY);
    rCtx.beginPath();
    rCtx.moveTo(startX, startY);

    const cp1x = startX + (Math.random() - 0.5) * 400;
    const cp1y = size * 0.33 + (Math.random() - 0.5) * 100;
    const cp2x = startX + (Math.random() - 0.5) * 450;
    const cp2y = size * 0.66 + (Math.random() - 0.5) * 100;
    const endX = startX + (Math.random() - 0.5) * 350;
    const endY = size;

    cCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    bCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    rCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);

    const lineWidth = isGold ? 1.5 + Math.random() * 2.5 : 2.5 + Math.random() * 5.0;
    cCtx.lineWidth = lineWidth;
    cCtx.strokeStyle = isGold ? 'rgba(195, 155, 95, 0.45)' : 'rgba(90, 85, 80, 0.35)';
    cCtx.stroke();

    // Bump sutil en las vetas
    bCtx.lineWidth = lineWidth;
    bCtx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    bCtx.stroke();

    // Las vetas son ligeramente más mates que el fondo pulido
    rCtx.lineWidth = lineWidth;
    rCtx.strokeStyle = 'rgba(90, 90, 90, 0.5)';
    rCtx.stroke();
  }

  const colorMap = new THREE.CanvasTexture(cCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { colorMap, bumpMap, roughnessMap };
}

// 2. Roble Europeo Ahumado / Nogal Canaletto PBR (1024x1024 con relieve de veta leñosa)
function createEuropeanOakWoodPBR(): PBRTextureSet {
  const size = 1024;
  const cCanvas = document.createElement('canvas');
  cCanvas.width = size;
  cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d')!;

  // Tono base nogal/roble arquitectónico
  cCtx.fillStyle = '#68452B';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Rugosidad satinada (roughness ~ 0.48)
  rCtx.fillStyle = '#7A7A7A';
  rCtx.fillRect(0, 0, size, size);

  // Vetas longitudinales de alta resolución
  for (let i = 0; i < 900; i++) {
    const y = (i * 1.15) % size;
    const isDark = i % 2 === 0;
    cCtx.fillStyle = isDark ? 'rgba(50, 30, 16, 0.22)' : 'rgba(150, 105, 65, 0.16)';
    cCtx.fillRect(0, y, size, 1.2 + Math.random() * 2.2);

    bCtx.fillStyle = isDark ? 'rgba(55, 55, 55, 0.25)' : 'rgba(165, 165, 165, 0.25)';
    bCtx.fillRect(0, y, size, 1.2 + Math.random() * 2.2);
  }

  // Nudos de madera sutiles
  for (let k = 0; k < 6; k++) {
    const kx = Math.random() * size;
    const ky = Math.random() * size;
    cCtx.fillStyle = 'rgba(40, 22, 10, 0.35)';
    cCtx.beginPath();
    cCtx.ellipse(kx, ky, 6, 22, Math.PI / 12, 0, Math.PI * 2);
    cCtx.fill();

    bCtx.fillStyle = 'rgba(40, 40, 40, 0.4)';
    bCtx.beginPath();
    bCtx.ellipse(kx, ky, 6, 22, Math.PI / 12, 0, Math.PI * 2);
    bCtx.fill();
  }

  const colorMap = new THREE.CanvasTexture(cCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { colorMap, bumpMap, roughnessMap };
}

// 3. Travertino Navona Honed PBR (1024x1024 con microporos sedimentarios y juntas)
function createTravertineNavonaPBR(): PBRTextureSet {
  const size = 1024;
  const cCanvas = document.createElement('canvas');
  cCanvas.width = size;
  cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d')!;

  // Base caliza crema travertino
  cCtx.fillStyle = '#E8E1D3';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Rugosidad apomazada mate (roughness ~ 0.38)
  rCtx.fillStyle = '#606060';
  rCtx.fillRect(0, 0, size, size);

  // Micro porosidad de cantera y sedimentos
  for (let i = 0; i < 45000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const c = Math.floor(215 + Math.random() * 25);
    cCtx.fillStyle = `rgb(${c}, ${c - 8}, ${c - 18})`;
    cCtx.fillRect(x, y, 1.5, 1.5);

    const b = Math.floor(115 + Math.random() * 25);
    bCtx.fillStyle = `rgb(${b}, ${b}, ${b})`;
    bCtx.fillRect(x, y, 1.5, 1.5);
  }

  // Veteado horizontal estratificado natural
  for (let s = 0; s < 36; s++) {
    const y = Math.random() * size;
    cCtx.strokeStyle = 'rgba(180, 168, 148, 0.22)';
    cCtx.lineWidth = 2 + Math.random() * 3;
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    cCtx.bezierCurveTo(size * 0.3, y + 8, size * 0.7, y - 8, size, y);
    cCtx.stroke();

    bCtx.strokeStyle = 'rgba(100, 100, 100, 0.25)';
    bCtx.lineWidth = cCtx.lineWidth;
    bCtx.beginPath();
    bCtx.moveTo(0, y);
    bCtx.bezierCurveTo(size * 0.3, y + 8, size * 0.7, y - 8, size, y);
    bCtx.stroke();
  }

  // Despiece de baldosas de gran formato 120x60cm con llaga fina
  const tileCols = 4;
  const tileRows = 8;
  const colW = size / tileCols;
  const rowH = size / tileRows;

  cCtx.strokeStyle = 'rgba(130, 120, 105, 0.35)';
  cCtx.lineWidth = 1.8;
  bCtx.strokeStyle = '#404040';
  bCtx.lineWidth = 2.0;

  for (let col = 1; col < tileCols; col++) {
    const x = col * colW;
    cCtx.beginPath();
    cCtx.moveTo(x, 0);
    cCtx.lineTo(x, size);
    cCtx.stroke();

    bCtx.beginPath();
    bCtx.moveTo(x, 0);
    bCtx.lineTo(x, size);
    bCtx.stroke();
  }

  for (let row = 1; row < tileRows; row++) {
    const y = row * rowH;
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    cCtx.lineTo(size, y);
    cCtx.stroke();

    bCtx.beginPath();
    bCtx.moveTo(0, y);
    bCtx.lineTo(size, y);
    bCtx.stroke();
  }

  const colorMap = new THREE.CanvasTexture(cCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { colorMap, bumpMap, roughnessMap };
}

// 4. Tejido Bouclé Dedar Milano PBR (micro-tramado textil de alta densidad)
function createBoucleFabricPBR(): PBRTextureSet {
  const size = 512;
  const cCanvas = document.createElement('canvas');
  cCanvas.width = size;
  cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d')!;

  cCtx.fillStyle = '#F4EFE6';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Superficie textil muy rugosa y suave (roughness ~ 0.95)
  rCtx.fillStyle = '#F2F2F2';
  rCtx.fillRect(0, 0, size, size);

  // Bucles textiles
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      if ((x + y) % 8 === 0) {
        cCtx.fillStyle = 'rgba(185, 172, 155, 0.35)';
        cCtx.fillRect(x, y, 2, 2);

        bCtx.fillStyle = '#B0B0B0';
        bCtx.fillRect(x, y, 2, 2);
      } else {
        bCtx.fillStyle = '#656565';
        bCtx.fillRect(x, y, 2, 2);
      }
    }
  }

  const colorMap = new THREE.CanvasTexture(cCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(4, 4);

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 4);

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 4);

  return { colorMap, bumpMap, roughnessMap };
}

// 5. Alfombra de Diseño Geométrico Contemporáneo PBR
function createDesignerRugPBR(): PBRTextureSet {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Tono base de lana virgen cruda
  ctx.fillStyle = '#E5DFD4';
  ctx.fillRect(0, 0, size, size);

  // Trazos lineales minimalistas en carbón y arena
  ctx.strokeStyle = 'rgba(120, 105, 90, 0.35)';
  ctx.lineWidth = 4;
  for (let i = 0; i < size; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // Micro-textura de nudo de alfombra
  for (let i = 0; i < 30000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = 'rgba(90, 80, 70, 0.08)';
    ctx.fillRect(x, y, 2, 2);
  }

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;

  return {
    colorMap,
    bumpMap: colorMap,
    roughnessMap: colorMap,
  };
}

export function build3DInteriorRoom(
  roomId: string,
  solarMode: SolarTimeMode
): Apartment3DEnvironment {
  const group = new THREE.Group();
  const lights: THREE.Light[] = [];

  // Material Palette - High Fidelity PBR Textures
  const woodPBR = createEuropeanOakWoodPBR();
  const fabricPBR = createBoucleFabricPBR();
  const rugPBR = createDesignerRugPBR();
  const marblePBR = createCalacattaMarblePBR();
  const travertinePBR = createTravertineNavonaPBR();

  const matFloorTravertine = new THREE.MeshStandardMaterial({
    map: travertinePBR.colorMap,
    bumpMap: travertinePBR.bumpMap,
    bumpScale: 0.015,
    roughnessMap: travertinePBR.roughnessMap,
    color: 0xF2ECE2,
    roughness: 0.35,
    metalness: 0.03,
  });

  const matFloorWood = new THREE.MeshStandardMaterial({
    map: woodPBR.colorMap,
    bumpMap: woodPBR.bumpMap,
    bumpScale: 0.02,
    roughnessMap: woodPBR.roughnessMap,
    color: 0x94653F,
    roughness: 0.46,
    metalness: 0.02,
  });

  const matCeiling = new THREE.MeshStandardMaterial({
    color: 0xF8F7F4,
    roughness: 0.9,
  });

  const matWallIvory = new THREE.MeshStandardMaterial({
    color: 0xF0ECE1,
    roughness: 0.85,
  });

  const matWallWalnut = new THREE.MeshStandardMaterial({
    map: woodPBR.colorMap,
    bumpMap: woodPBR.bumpMap,
    bumpScale: 0.018,
    color: 0x54351F,
    roughness: 0.52,
  });

  const matBronze = new THREE.MeshStandardMaterial({
    color: 0x8C7452,
    metalness: 0.88,
    roughness: 0.22,
  });

  const matDarkMetal = new THREE.MeshStandardMaterial({
    color: 0x161512,
    metalness: 0.85,
    roughness: 0.3,
  });

  const matBoucleWhite = new THREE.MeshStandardMaterial({
    map: fabricPBR.colorMap,
    bumpMap: fabricPBR.bumpMap,
    bumpScale: 0.025,
    roughnessMap: fabricPBR.roughnessMap,
    color: 0xF8F5EC,
    roughness: 0.94,
  });

  const matVelvetSage = new THREE.MeshStandardMaterial({
    color: 0x46664F,
    roughness: 0.78,
  });

  const matVelvetTerracotta = new THREE.MeshStandardMaterial({
    color: 0xA35032,
    roughness: 0.78,
  });

  const matMarbleCalacatta = new THREE.MeshStandardMaterial({
    map: marblePBR.colorMap,
    bumpMap: marblePBR.bumpMap,
    bumpScale: 0.012,
    roughnessMap: marblePBR.roughnessMap,
    color: 0xFFFDF7,
    roughness: 0.16,
    metalness: 0.04,
  });

  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.2,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.9,
    ior: 1.5,
  });

  const matLedGlow = new THREE.MeshBasicMaterial({
    color: 0xFFE0A0,
  });

  const matFoliage = new THREE.MeshStandardMaterial({
    color: 0x2A5E38,
    roughness: 0.6,
  });

  // Lighting Rig (Kelvin 2700K warm interior + directional solar)
  const ambientLight = new THREE.AmbientLight(0xFFF2DC, solarMode === 'night' ? 0.7 : 1.4);
  group.add(ambientLight);
  lights.push(ambientLight);

  const sunLight = new THREE.DirectionalLight(
    solarMode === 'morning' ? 0xFFF4D4 : solarMode === 'golden' ? 0xFFA450 : 0x406090,
    solarMode === 'morning' ? 1.8 : solarMode === 'golden' ? 2.2 : 0.4
  );
  sunLight.position.set(solarMode === 'golden' ? -15 : 15, 20, -10);
  group.add(sunLight);
  lights.push(sunLight);

  // Ceiling Downlights & Coves
  const ceilingPoint1 = new THREE.PointLight(0xFFDA9E, solarMode === 'night' ? 2.2 : 1.0, 18, 1.2);
  ceilingPoint1.position.set(0, 3.2, 0);
  group.add(ceilingPoint1);
  lights.push(ceilingPoint1);

  const ceilingPoint2 = new THREE.PointLight(0xFFDA9E, solarMode === 'night' ? 1.8 : 0.8, 14, 1.2);
  ceilingPoint2.position.set(0, 3.2, 4);
  group.add(ceilingPoint2);
  lights.push(ceilingPoint2);

  // Room Dimensions (Width X: 14m, Height Y: 3.4m, Depth Z: 12m)
  const roomW = 14;
  const roomH = 3.4;
  const roomD = 12;
  const floorY = 0;
  const ceilingY = roomH;

  // 1. ARCHITECTURAL ENVELOPE (Floor, Ceiling, Back Wall, Side Walls)
  const isTerrace = roomId === 'terraza';
  const isMaster = roomId === 'master';

  // Floor
  const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMesh = new THREE.Mesh(floorGeo, (isTerrace || isMaster) ? matFloorWood : matFloorTravertine);
  floorMesh.position.set(0, floorY, 0);
  group.add(floorMesh);

  // Baseboard trim
  const baseboardGeo = new THREE.BoxGeometry(roomW, 0.12, 0.03);
  const baseboard = new THREE.Mesh(baseboardGeo, matWallWalnut);
  baseboard.position.set(0, 0.06, roomD / 2 - 0.02);
  group.add(baseboard);

  // Ceiling (with recessed coffer channel)
  if (!isTerrace) {
    const ceilGeo = new THREE.PlaneGeometry(roomW, roomD);
    ceilGeo.rotateX(Math.PI / 2);
    const ceilMesh = new THREE.Mesh(ceilGeo, matCeiling);
    ceilMesh.position.set(0, ceilingY, 0);
    group.add(ceilMesh);

    // Perimeter Cove Lighting Beam
    const coveGeo = new THREE.BoxGeometry(roomW - 0.6, 0.04, roomD - 0.6);
    const coveMesh = new THREE.Mesh(coveGeo, matLedGlow);
    coveMesh.position.set(0, ceilingY - 0.04, 0);
    group.add(coveMesh);

    // Recessed Dark-Light Downlight Fixtures (Viabizzuno Spots)
    for (let x = -4; x <= 4; x += 2.5) {
      for (let z = -3; z <= 3; z += 3) {
        const spotGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16);
        const spotMesh = new THREE.Mesh(spotGeo, matDarkMetal);
        spotMesh.position.set(x, ceilingY - 0.02, z);
        group.add(spotMesh);

        const spotBulb = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), matLedGlow);
        spotBulb.rotation.x = Math.PI / 2;
        spotBulb.position.set(x, ceilingY - 0.041, z);
        group.add(spotBulb);
      }
    }

    // Rear Solid South Wall
    const backWallGeo = new THREE.PlaneGeometry(roomW, roomH);
    const backWall = new THREE.Mesh(backWallGeo, matWallIvory);
    backWall.position.set(0, roomH / 2, roomD / 2);
    backWall.rotation.y = Math.PI;
    group.add(backWall);

    // East Side Wall (Fluted Walnut Boiserie)
    const eastWallGeo = new THREE.PlaneGeometry(roomD, roomH);
    const eastWall = new THREE.Mesh(eastWallGeo, matWallIvory);
    eastWall.position.set(-roomW / 2, roomH / 2, 0);
    eastWall.rotation.y = Math.PI / 2;
    group.add(eastWall);

    // Fluted vertical wood slats on East Wall
    const slatW = 0.08;
    const slatD = 0.04;
    const slatGeo = new THREE.BoxGeometry(slatD, roomH, slatW);
    for (let z = -roomD / 2 + 1; z < roomD / 2 - 1; z += 0.16) {
      const slatMesh = new THREE.Mesh(slatGeo, matWallWalnut);
      slatMesh.position.set(-roomW / 2 + 0.03, roomH / 2, z);
      group.add(slatMesh);
    }

    // West Side Wall (Wall with Doorway & Display Niches)
    const westWallGeo = new THREE.PlaneGeometry(roomD, roomH);
    const westWall = new THREE.Mesh(westWallGeo, matWallIvory);
    westWall.position.set(roomW / 2, roomH / 2, 0);
    westWall.rotation.y = -Math.PI / 2;
    group.add(westWall);

    // Built-in illuminated display bookcase / bar on West Wall
    const barBoxGeo = new THREE.BoxGeometry(0.6, 2.4, 3.2);
    const barBox = new THREE.Mesh(barBoxGeo, matWallWalnut);
    barBox.position.set(roomW / 2 - 0.3, 1.2, 0);
    group.add(barBox);

    // Shelves with LED lines
    for (let sy = 0.6; sy <= 2.0; sy += 0.45) {
      const shelfGeo = new THREE.BoxGeometry(0.55, 0.03, 3.0);
      const shelf = new THREE.Mesh(shelfGeo, matBronze);
      shelf.position.set(roomW / 2 - 0.32, sy, 0);
      group.add(shelf);

      // Glass bottles & decanters on shelves
      for (let bx = -1.1; bx <= 1.1; bx += 0.35) {
        const bottleGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.28, 12);
        const bottle = new THREE.Mesh(bottleGeo, matGlass);
        bottle.position.set(roomW / 2 - 0.32, sy + 0.15, bx);
        group.add(bottle);
      }
    }
  }

  // 2. FRONT NORTH FACADE: SCHÜCO FLOOR-TO-CEILING GLASS & BRONZE MULLIONS
  const windowZ = -roomD / 2;
  const mullionThickness = 0.08;
  const numPanes = 5;
  const paneWidth = roomW / numPanes;

  // Window header and sill frames
  const frameHGeo = new THREE.BoxGeometry(roomW, 0.14, 0.12);
  const frameTop = new THREE.Mesh(frameHGeo, matDarkMetal);
  frameTop.position.set(0, roomH - 0.07, windowZ);
  group.add(frameTop);

  const frameBottom = new THREE.Mesh(frameHGeo, matDarkMetal);
  frameBottom.position.set(0, 0.07, windowZ);
  group.add(frameBottom);

  // Vertical Mullions & Glass Panes
  for (let i = 0; i <= numPanes; i++) {
    const mx = -roomW / 2 + i * paneWidth;
    const mullionGeo = new THREE.BoxGeometry(mullionThickness, roomH, 0.12);
    const mullion = new THREE.Mesh(mullionGeo, matDarkMetal);
    mullion.position.set(mx, roomH / 2, windowZ);
    group.add(mullion);

    // Bronze interior accent fin
    const finGeo = new THREE.BoxGeometry(0.02, roomH, 0.08);
    const fin = new THREE.Mesh(finGeo, matBronze);
    fin.position.set(mx, roomH / 2, windowZ + 0.08);
    group.add(fin);
  }

  for (let i = 0; i < numPanes; i++) {
    const px = -roomW / 2 + (i + 0.5) * paneWidth;
    const glassPaneGeo = new THREE.PlaneGeometry(paneWidth - 0.04, roomH - 0.2);
    const glassPane = new THREE.Mesh(glassPaneGeo, matGlass);
    glassPane.position.set(px, roomH / 2, windowZ);
    group.add(glassPane);
  }

  // 3. ROOM SPECIFIC 3D LUXURY FURNITURE & OBJECTS
  if (roomId === 'salon') {
    // ================= GRAN SALÓN 3D FURNITURE =================
    // A. Large Textured Designer Area Rug
    const rugGeo = new THREE.PlaneGeometry(5.6, 4.4);
    rugGeo.rotateX(-Math.PI / 2);
    const rug = new THREE.Mesh(rugGeo, new THREE.MeshStandardMaterial({
      map: rugPBR.colorMap,
      bumpMap: rugPBR.bumpMap,
      bumpScale: 0.02,
      roughness: 0.95,
    }));
    rug.position.set(0, 0.01, 0.5);
    group.add(rug);

    // B. Minotti Curved Luxury Sofa (Ivory Bouclé)
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(0, 0, 1.6);

    // Sofa Plinth Base (Dark Bronze)
    const baseGeo = new THREE.BoxGeometry(3.6, 0.12, 1.2);
    const sofaBase = new THREE.Mesh(baseGeo, matDarkMetal);
    sofaBase.position.set(0, 0.06, 0);
    sofaGroup.add(sofaBase);

    // Sofa Main Seat Cushion
    const seatGeo = new THREE.BoxGeometry(3.5, 0.38, 1.15);
    const sofaSeat = new THREE.Mesh(seatGeo, matBoucleWhite);
    sofaSeat.position.set(0, 0.31, 0);
    sofaGroup.add(sofaSeat);

    // Sofa Backrest
    const backGeo = new THREE.BoxGeometry(3.5, 0.52, 0.32);
    const sofaBack = new THREE.Mesh(backGeo, matBoucleWhite);
    sofaBack.position.set(0, 0.65, 0.42);
    sofaGroup.add(sofaBack);

    // Left and Right Armrests
    const armGeo = new THREE.BoxGeometry(0.35, 0.38, 1.15);
    const armL = new THREE.Mesh(armGeo, matBoucleWhite);
    armL.position.set(-1.6, 0.52, 0);
    sofaGroup.add(armL);

    const armR = new THREE.Mesh(armGeo, matBoucleWhite);
    armR.position.set(1.6, 0.52, 0);
    sofaGroup.add(armR);

    // Accent Pillows (Sage Green & Terracotta Velvet)
    const pillowGeo = new THREE.BoxGeometry(0.55, 0.42, 0.16);
    const pillow1 = new THREE.Mesh(pillowGeo, matVelvetSage);
    pillow1.position.set(-1.1, 0.65, 0.28);
    pillow1.rotation.y = 0.25;
    pillow1.rotation.z = -0.1;
    sofaGroup.add(pillow1);

    const pillow2 = new THREE.Mesh(pillowGeo, matVelvetTerracotta);
    pillow2.position.set(1.1, 0.65, 0.28);
    pillow2.rotation.y = -0.25;
    pillow2.rotation.z = 0.1;
    sofaGroup.add(pillow2);

    const pillow3 = new THREE.Mesh(pillowGeo, matBoucleWhite);
    pillow3.position.set(0.1, 0.65, 0.32);
    sofaGroup.add(pillow3);

    group.add(sofaGroup);

    // C. Monolithic Roman Travertine Coffee Table (Low Italian Design)
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0, -0.4);

    const tableTopGeo = new THREE.BoxGeometry(2.0, 0.14, 1.0);
    const tableTop = new THREE.Mesh(tableTopGeo, matFloorTravertine);
    tableTop.position.set(0, 0.32, 0);
    tableGroup.add(tableTop);

    // Table Massive Legs
    const legGeo = new THREE.BoxGeometry(0.25, 0.25, 0.8);
    const leg1 = new THREE.Mesh(legGeo, matFloorTravertine);
    leg1.position.set(-0.7, 0.125, 0);
    tableGroup.add(leg1);

    const leg2 = new THREE.Mesh(legGeo, matFloorTravertine);
    leg2.position.set(0.7, 0.125, 0);
    tableGroup.add(leg2);

    // Tabletop Design Objects: Monograph Books & Bronze Sculpture
    const book1Geo = new THREE.BoxGeometry(0.34, 0.04, 0.26);
    const book1 = new THREE.Mesh(book1Geo, matDarkMetal);
    book1.position.set(-0.4, 0.41, 0.1);
    book1.rotation.y = 0.15;
    tableGroup.add(book1);

    const book2Geo = new THREE.BoxGeometry(0.3, 0.03, 0.22);
    const book2 = new THREE.Mesh(book2Geo, matBronze);
    book2.position.set(-0.4, 0.445, 0.1);
    book2.rotation.y = -0.1;
    tableGroup.add(book2);

    const sculptGeo = new THREE.DodecahedronGeometry(0.09);
    const sculpture = new THREE.Mesh(sculptGeo, matBronze);
    sculpture.position.set(0.45, 0.48, -0.05);
    tableGroup.add(sculpture);

    group.add(tableGroup);

    // D. Two Accent Lounge Chairs (Cassina / B&B Italia style)
    const chairGroupL = new THREE.Group();
    chairGroupL.position.set(-2.4, 0, 0.2);
    chairGroupL.rotation.y = Math.PI / 4;

    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.2, 0.85), matVelvetSage);
    chairSeat.position.set(0, 0.38, 0);
    chairGroupL.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.18), matVelvetSage);
    chairBack.position.set(0, 0.65, 0.35);
    chairGroupL.add(chairBack);

    // Bronze slender legs
    for (const lx of [-0.36, 0.36]) {
      for (const lz of [-0.36, 0.36]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.32), matBronze);
        leg.position.set(lx, 0.16, lz);
        chairGroupL.add(leg);
      }
    }
    group.add(chairGroupL);

    // E. Flos Arco Iconic Floor Lamp (Curved steel arch + Marble base)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-3.2, 0, 2.4);

    const lampBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.55, 0.24), matMarbleCalacatta);
    lampBase.position.set(0, 0.275, 0);
    lampGroup.add(lampBase);

    // Arch curve
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.55, 0),
      new THREE.Vector3(0.5, 3.2, -1.2),
      new THREE.Vector3(2.2, 2.1, -2.4)
    );
    const archGeo = new THREE.TubeGeometry(curve, 32, 0.02, 8, false);
    const archMesh = new THREE.Mesh(archGeo, matBronze);
    lampGroup.add(archMesh);

    // Lamp Dome shade
    const shadeGeo = new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const shade = new THREE.Mesh(shadeGeo, matBronze);
    shade.position.set(2.2, 2.1, -2.4);
    shade.rotation.x = Math.PI;
    lampGroup.add(shade);

    // Lamp Warm Light
    const flosPoint = new THREE.PointLight(0xFFDA9E, solarMode === 'night' ? 2.5 : 1.2, 8, 1.4);
    flosPoint.position.set(2.2, 1.9, -2.4);
    lampGroup.add(flosPoint);
    lights.push(flosPoint);

    group.add(lampGroup);

    // F. Kinetic Art Relief on Back Wall (Cruz-Diez / Soto)
    const artGroup = new THREE.Group();
    artGroup.position.set(0, 1.8, roomD / 2 - 0.05);

    const artFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 0.08), matBronze);
    artGroup.add(artFrame);

    // Chromatic kinetic slats
    const numColors = 32;
    const artW = 3.0;
    const artH = 1.4;
    const colorPalette = [0xE53935, 0x43A047, 0x1E88E5, 0xFDD835, 0x8E24AA, 0xFB8C00];
    for (let c = 0; c < numColors; c++) {
      const cx = -artW / 2 + (c + 0.5) * (artW / numColors);
      const cMat = new THREE.MeshStandardMaterial({
        color: colorPalette[c % colorPalette.length],
        roughness: 0.4,
      });
      const slatMesh = new THREE.Mesh(new THREE.BoxGeometry(artW / numColors - 0.02, artH, 0.04), cMat);
      slatMesh.position.set(cx, 0, 0.04);
      artGroup.add(slatMesh);
    }
    group.add(artGroup);

    // G. Large Luxury Indoor Planter with Monstera / Ficus Foliage
    const planterGroup = new THREE.Group();
    planterGroup.position.set(3.8, 0, -3.2);

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.32, 0.8, 24), matFloorTravertine);
    pot.position.set(0, 0.4, 0);
    planterGroup.add(pot);

    // Foliage leaves
    for (let l = 0; l < 18; l++) {
      const leafAngle = (l / 18) * Math.PI * 2;
      const leafGeo = new THREE.SphereGeometry(0.35, 8, 8);
      leafGeo.scale(1.2, 0.1, 0.6);
      const leaf = new THREE.Mesh(leafGeo, matFoliage);
      leaf.position.set(
        Math.cos(leafAngle) * 0.45,
        0.8 + Math.random() * 0.7,
        Math.sin(leafAngle) * 0.45
      );
      leaf.rotation.y = leafAngle;
      leaf.rotation.z = 0.35;
      planterGroup.add(leaf);
    }
    group.add(planterGroup);

  } else if (roomId === 'cocina') {
    // ================= COCINA GOURMET 3D =================
    // A. Monolithic Calacatta Gold Marble Kitchen Island
    const islandGroup = new THREE.Group();
    islandGroup.position.set(0, 0, 0);

    const islandBodyGeo = new THREE.BoxGeometry(4.2, 0.95, 1.4);
    const islandBody = new THREE.Mesh(islandBodyGeo, matMarbleCalacatta);
    islandBody.position.set(0, 0.475, 0);
    islandGroup.add(islandBody);

    // Recessed dark kick-plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.1, 1.2), matDarkMetal);
    plinth.position.set(0, 0.05, 0);
    islandGroup.add(plinth);

    // Flush Gaggenau Induction Cooktop
    const cooktop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.55), matDarkMetal);
    cooktop.position.set(-0.8, 0.96, 0);
    islandGroup.add(cooktop);

    // Undermount Black Sink & Gooseneck Bronze Faucet
    const sink = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 0.45), matDarkMetal);
    sink.position.set(0.9, 0.955, 0);
    islandGroup.add(sink);

    const faucet = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16, Math.PI), matBronze);
    faucet.position.set(0.9, 1.15, -0.22);
    faucet.rotation.z = Math.PI;
    islandGroup.add(faucet);

    // Suspended Brushed Brass Linear Pendant Fixture
    const pendant = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 0.08), matBronze);
    pendant.position.set(0, 2.4, 0);
    islandGroup.add(pendant);

    // Linear LED light underneath
    const linearLight = new THREE.PointLight(0xFFE8BA, solarMode === 'night' ? 2.5 : 1.2, 6);
    linearLight.position.set(0, 2.3, 0);
    islandGroup.add(linearLight);
    lights.push(linearLight);

    // 3 Designer Leather & Brass Bar Stools
    for (let s = -1.2; s <= 1.2; s += 1.2) {
      const stoolGroup = new THREE.Group();
      stoolGroup.position.set(s, 0, 1.1);

      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24), matVelvetTerracotta);
      seat.position.set(0, 0.68, 0);
      stoolGroup.add(seat);

      // 4 metal legs
      for (const lx of [-0.15, 0.15]) {
        for (const lz of [-0.15, 0.15]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.68), matDarkMetal);
          leg.position.set(lx, 0.34, lz);
          stoolGroup.add(leg);
        }
      }
      islandGroup.add(stoolGroup);
    }

    group.add(islandGroup);

    // Rear Cabinetry Tall Wall
    const tallCabinets = new THREE.Mesh(new THREE.BoxGeometry(roomW - 2, 2.8, 0.8), matWallWalnut);
    tallCabinets.position.set(0, 1.4, roomD / 2 - 0.4);
    group.add(tallCabinets);

    // Integrated Black Glass Miele Ovens
    for (const ox of [-0.9, 0.9]) {
      const oven = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.05), matDarkMetal);
      oven.position.set(ox, 1.4, roomD / 2 - 0.78);
      group.add(oven);
    }

  } else if (roomId === 'master') {
    // ================= MASTER SUITE 3D =================
    // A. Floating King-Size Bed
    const bedGroup = new THREE.Group();
    bedGroup.position.set(0, 0, 1.2);

    // Upholstered Headboard Wall
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.6, 0.18), matBoucleWhite);
    headboard.position.set(0, 0.8, 1.8);
    bedGroup.add(headboard);

    // Bed Mattress & Base
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 2.2), matBoucleWhite);
    mattress.position.set(0, 0.4, 0.6);
    bedGroup.add(mattress);

    // Duvet and Folded Bed Runner
    const runner = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.46, 0.8), matVelvetTerracotta);
    runner.position.set(0, 0.405, 0.1);
    bedGroup.add(runner);

    // 4 Fluffy King Pillows
    for (const px of [-0.6, 0.6]) {
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.45), matBoucleWhite);
      pillow.position.set(px, 0.72, 1.4);
      pillow.rotation.x = -0.25;
      bedGroup.add(pillow);
    }

    // Floating Walnut Nightstands & Bedside Lamps
    for (const nx of [-1.8, 1.8]) {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.25, 0.45), matWallWalnut);
      stand.position.set(nx, 0.45, 1.6);
      bedGroup.add(stand);

      // Bedside Pendant Glass Globe
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), matGlass);
      globe.position.set(nx, 1.2, 1.6);
      bedGroup.add(globe);

      const bulbLight = new THREE.PointLight(0xFFD89E, solarMode === 'night' ? 1.4 : 0.6, 4);
      bulbLight.position.set(nx, 1.2, 1.6);
      bedGroup.add(bulbLight);
      lights.push(bulbLight);
    }

    group.add(bedGroup);

  } else if (roomId === 'bano') {
    // ================= BAÑO SPA 3D =================
    // A. Sculptural Amber Resin Bathtub (Antonio Lupi Cristalmood®)
    const tubGroup = new THREE.Group();
    tubGroup.position.set(0, 0, -1.0);

    const tubMat = new THREE.MeshPhysicalMaterial({
      color: 0xDB7C26,
      transparent: true,
      opacity: 0.82,
      roughness: 0.1,
      transmission: 0.7,
      ior: 1.45,
    });

    const tubOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 0.68, 32), tubMat);
    tubOuter.position.set(0, 0.34, 0);
    tubOuter.scale.set(1.4, 1, 0.9);
    tubGroup.add(tubOuter);

    // Floor-Mounted Bronze Faucet
    const bathFaucet = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.95), matBronze);
    bathFaucet.position.set(1.4, 0.475, 0);
    tubGroup.add(bathFaucet);

    group.add(tubGroup);

    // B. Floating Double Vanity with Backlit Circular Mirrors
    const vanity = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 0.65), matFloorTravertine);
    vanity.position.set(0, 0.75, roomD / 2 - 0.35);
    group.add(vanity);

    for (const vx of [-0.9, 0.9]) {
      // Vessel Sink
      const sink = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.15, 24), matBoucleWhite);
      sink.position.set(vx, 1.02, roomD / 2 - 0.35);
      group.add(sink);

      // Backlit Circular Mirror
      const mirror = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), matDarkMetal);
      mirror.position.set(vx, 1.8, roomD / 2 - 0.04);
      group.add(mirror);

      const mirrorHalo = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.48, 32), matLedGlow);
      mirrorHalo.position.set(vx, 1.8, roomD / 2 - 0.035);
      group.add(mirrorHalo);
    }

  } else if (roomId === 'terraza') {
    // ================= TERRAZA PANORÁMICA 3D =================
    // A. Burmese Teak Decking Planks
    // B. Seamless Glass Balustrade on Perimeter
    const railingGeo = new THREE.PlaneGeometry(roomW, 1.1);
    const railing = new THREE.Mesh(railingGeo, matGlass);
    railing.position.set(0, 0.55, -roomD / 2);
    group.add(railing);

    // Bronze Cap Railing
    const capRail = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.06, 0.08), matBronze);
    capRail.position.set(0, 1.1, -roomD / 2);
    group.add(capRail);

    // Modular Outdoor Lounge Sofa (Paola Lenti)
    const outSofa = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.38, 1.2), matVelvetSage);
    outSofa.position.set(0, 0.19, 0.8);
    group.add(outSofa);

    const outBack = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 0.28), matVelvetSage);
    outBack.position.set(0, 0.55, 1.3);
    group.add(outBack);

    // Outdoor Low Teak Coffee Table
    const outTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 0.9), matFloorWood);
    outTable.position.set(0, 0.14, -0.6);
    group.add(outTable);

    // Built-in Perimeter Planter Boxes with Lush Palms
    for (const px of [-roomW / 2 + 1.2, roomW / 2 - 1.2]) {
      const planterBox = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 1.0), matFloorTravertine);
      planterBox.position.set(px, 0.325, -roomD / 2 + 0.8);
      group.add(planterBox);

      // Tropical Palm foliage
      for (let p = 0; p < 12; p++) {
        const palmAngle = (p / 12) * Math.PI * 2;
        const palmLeaf = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 1.4), matFoliage);
        palmLeaf.position.set(px, 0.9, -roomD / 2 + 0.8);
        palmLeaf.rotation.z = Math.cos(palmAngle) * 0.6;
        palmLeaf.rotation.x = Math.sin(palmAngle) * 0.6;
        group.add(palmLeaf);
      }
    }
  }

  // Update Solar Lighting method
  const updateSolarMode = (mode: SolarTimeMode) => {
    ambientLight.color.setHex(0xFFF2DC);
    ambientLight.intensity = mode === 'night' ? 0.7 : 1.4;

    if (mode === 'morning') {
      sunLight.color.setHex(0xFFF4D4);
      sunLight.intensity = 1.8;
      sunLight.position.set(15, 20, -10);
    } else if (mode === 'golden') {
      sunLight.color.setHex(0xFFA450);
      sunLight.intensity = 2.2;
      sunLight.position.set(-15, 15, -10);
    } else {
      sunLight.color.setHex(0x406090);
      sunLight.intensity = 0.4;
      sunLight.position.set(0, 10, -10);
    }

    ceilingPoint1.intensity = mode === 'night' ? 2.4 : 1.0;
    ceilingPoint2.intensity = mode === 'night' ? 2.0 : 0.8;
  };

  const dispose = () => {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });
    // Dispose PBR texture maps
    woodPBR.colorMap.dispose();
    woodPBR.bumpMap.dispose();
    woodPBR.roughnessMap.dispose();

    fabricPBR.colorMap.dispose();
    fabricPBR.bumpMap.dispose();
    fabricPBR.roughnessMap.dispose();

    rugPBR.colorMap.dispose();

    marblePBR.colorMap.dispose();
    marblePBR.bumpMap.dispose();
    marblePBR.roughnessMap.dispose();

    travertinePBR.colorMap.dispose();
    travertinePBR.bumpMap.dispose();
    travertinePBR.roughnessMap.dispose();
  };

  return {
    group,
    lights,
    updateSolarMode,
    dispose,
  };
}
