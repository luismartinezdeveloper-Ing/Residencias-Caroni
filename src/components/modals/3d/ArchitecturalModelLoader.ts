/**
 * ============================================================================
 * RESIDENCIAS CARONÍ — CARGADOR DEL MODELO 3D ARQUITECTÓNICO REAL
 * ============================================================================
 * Arquitectura & Diseño: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Ingeniería de Software & Experiencia Interactiva: Ing. Luis Martinez
 *
 * Integra el modelo maestro GLB texturizado en Blender 5.2 LTS
 * ('/models/residencias_caroni_model.glb') en la escena de Three.js.
 *
 * Mapea la jerarquía de nodos a las 8 residencias exclusivas y núcleos estructurales:
 * - PB_Norte / PB_Sur         -> 'jardin-norte' / 'jardin-sur' (Nivel PB)
 * - Nivel1_Norte / Nivel1_Sur -> 'residencia-02-norte' / 'residencia-02-sur' (Nivel P2)
 * - Nivel2_Norte / Nivel2_Sur -> 'residencia-03-norte' / 'residencia-03-sur' (Nivel P3)
 * - PH_Norte / PH_Sur         -> 'mirador-norte' / 'mirador-sur' (Nivel Mirador)
 * - Estructura_Core           -> Núcleo vertical, columnas y basamento (Sótano / Core)
 * ============================================================================
 */

import * as THREE from 'three';
import {
  SceneMaterials,
  SolarTimeMode,
  UnitAnchor,
  UnitMeshRegistry,
  buildCompleteBuildingScene,
} from './ArchitecturalScene';
import { Progressive3DPipelineInstance } from './Progressive3DAssetPipeline';

export interface ArchitecturalBuildingLoadResult {
  buildingRoot: THREE.Group;
  unitMeshesMap: UnitMeshRegistry;
  levelGroups: { [key: string]: THREE.Group };
  unitAnchors: UnitAnchor[];
  lightsGroup: THREE.Group;
  updateLightingMode: (mode: SolarTimeMode, immediate?: boolean) => void;
  transitionStep: (mode: SolarTimeMode, deltaFactor?: number) => boolean;
  isRealGLBModel: boolean;
}

const UNIT_NODE_MAPPING: Record<
  string,
  {
    unitId: string;
    levelKey: 'pb' | 'p2' | 'p3' | 'mirador';
    code: string;
    name: string;
  }
> = {
  PB_Norte: {
    unitId: 'jardin-norte',
    levelKey: 'pb',
    code: 'RC-PB-N',
    name: 'Jardín Norte (Dúplex)',
  },
  PB_Sur: {
    unitId: 'jardin-sur',
    levelKey: 'pb',
    code: 'RC-PB-S',
    name: 'Jardín Sur (Dúplex)',
  },
  Nivel1_Norte: {
    unitId: 'residencia-02-norte',
    levelKey: 'p2',
    code: 'RC-2-N',
    name: 'Residencia 2-N',
  },
  Nivel1_Sur: {
    unitId: 'residencia-02-sur',
    levelKey: 'p2',
    code: 'RC-2-S',
    name: 'Residencia 2-S',
  },
  Nivel2_Norte: {
    unitId: 'residencia-03-norte',
    levelKey: 'p3',
    code: 'RC-3-N',
    name: 'Residencia 3-N',
  },
  Nivel2_Sur: {
    unitId: 'residencia-03-sur',
    levelKey: 'p3',
    code: 'RC-3-S',
    name: 'Residencia 3-S',
  },
  PH_Norte: {
    unitId: 'mirador-norte',
    levelKey: 'mirador',
    code: 'RC-PH-N',
    name: 'Mirador Norte (PH)',
  },
  PH_Sur: {
    unitId: 'mirador-sur',
    levelKey: 'mirador',
    code: 'RC-PH-S',
    name: 'Mirador Sur (PH)',
  },
};

/**
 * Mejora físicamente los materiales de las mallas importadas (vidrio con refracción
 * e IOR 1.52, agua de piscina con transmisión, maderas nobles de teca, perfiles
 * obsidiana, piedra laja negra y concreto visto obra limpia).
 */
function enhanceMeshMaterialForPhotorealism(mesh: THREE.Mesh): void {
  if (!mesh.material) return;
  const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  if (!(mat instanceof THREE.MeshStandardMaterial)) return;

  const matName = (mat.name || '').toLowerCase();
  const objName = (mesh.name || '').toLowerCase();

  // 1. Vidrio arquitectónico / Cristales dobles piso a techo / Barandas
  if (
    matName.includes('vidrio') ||
    matName.includes('glass') ||
    objName.includes('vidrio') ||
    objName.includes('glass') ||
    (mat as any).transmission > 0.1 ||
    mat.transparent
  ) {
    const isBalcony = matName.includes('baranda') || objName.includes('baranda');
    const physicalGlass = new THREE.MeshPhysicalMaterial({
      name: mat.name,
      color: isBalcony ? new THREE.Color(0x3a5464) : new THREE.Color(0x283b48),
      transmission: isBalcony ? 0.85 : 0.92,
      opacity: 0.35,
      transparent: true,
      roughness: isBalcony ? 0.04 : 0.02,
      ior: 1.52,
      thickness: isBalcony ? 0.4 : 0.6,
      specularIntensity: 0.85,
      specularColor: new THREE.Color(0xffffff),
      clearcoat: 0.3,
      clearcoatRoughness: 0.04,
      envMapIntensity: 0.8,
      depthWrite: false,
    });
    mesh.material = physicalGlass;
    mesh.renderOrder = 20;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    return;
  }

  // 2. Espejos de agua / Piscinas privadas
  if (
    matName.includes('agua') ||
    matName.includes('water') ||
    matName.includes('piscina') ||
    objName.includes('piscina')
  ) {
    const poolWater = new THREE.MeshPhysicalMaterial({
      name: mat.name,
      color: new THREE.Color(0x187898),
      transmission: 0.85,
      opacity: 0.80,
      transparent: true,
      roughness: 0.03,
      ior: 1.333,
      reflectivity: 0.85,
      clearcoat: 0.8,
      envMapIntensity: 1.2,
      depthWrite: false,
    });
    mesh.material = poolWater;
    mesh.renderOrder = 18;
    return;
  }

  // 3. Maderas nobles / Celosías y louvers de teca de autor
  if (
    matName.includes('madera') ||
    matName.includes('wood') ||
    matName.includes('teca') ||
    objName.includes('celosia') ||
    objName.includes('louver')
  ) {
    mat.color.setHex(0x7A451E); // Teca noble curada ámbar cálido
    mat.roughness = 0.38;
    mat.metalness = 0.04;
    mat.envMapIntensity = 0.85;
    mat.needsUpdate = true;
    return;
  }

  // 4. Perfiles metálicos oscuros / Obsidiana y aluminio carbón anodizado
  if (
    matName.includes('carbon') ||
    matName.includes('perfil') ||
    matName.includes('marco') ||
    matName.includes('bronce')
  ) {
    mat.color.setHex(0x141414); // Negro carbón obsidiana profundo
    mat.metalness = 0.88;
    mat.roughness = 0.22;
    mat.envMapIntensity = 0.95;
    mat.needsUpdate = true;
    return;
  }

  // 5. Piedra laja negra / Basamento volcánico de Caracas
  if (
    matName.includes('laja') ||
    matName.includes('slate') ||
    matName.includes('basamento') ||
    matName.includes('sotano')
  ) {
    mat.color.setHex(0x22201E); // Laja negra volcánica Caracas
    mat.roughness = 0.78;
    mat.metalness = 0.06;
    mat.envMapIntensity = 0.55;
    mat.needsUpdate = true;
    return;
  }

  // 6. Terracota / Corten arquitectónico
  if (
    matName.includes('terracota') ||
    matName.includes('corten') ||
    matName.includes('revestimiento')
  ) {
    mat.color.setHex(0x9E4B28); // Terracota cálida de autor
    mat.roughness = 0.52;
    mat.metalness = 0.12;
    mat.envMapIntensity = 0.75;
    mat.needsUpdate = true;
    return;
  }

  // 7. Vegetación de jardineras
  if (
    matName.includes('vegetacion') ||
    matName.includes('planta') ||
    matName.includes('jardin')
  ) {
    mat.color.setHex(0x284820);
    mat.roughness = 0.65;
    mat.needsUpdate = true;
    return;
  }

  // 8. Granito y travertino de pisos y terrazas
  if (
    matName.includes('granito') ||
    matName.includes('piso') ||
    matName.includes('terraza')
  ) {
    mat.color.setHex(0xA8A296); // Granito greige cálido
    mat.roughness = 0.58;
    mat.metalness = 0.04;
    mat.envMapIntensity = 0.70;
    mat.needsUpdate = true;
    return;
  }

  // 9. Concretos vistos (columnas, vigas y losas de entrepiso)
  mat.color.setHex(0x8A867E); // Concreto visto obra limpia gris cálido (NO blanco)
  mat.roughness = 0.65;
  mat.metalness = 0.02;
  mat.envMapIntensity = 0.65;
  mat.needsUpdate = true;
}

/**
 * Genera un plano de sombra de contacto (Ambient Occlusion suave)
 * en la base del edificio para anclarlo fotográficamente al terreno.
 */
function createBuildingContactShadowPlane(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    grad.addColorStop(0.0, 'rgba(15, 14, 12, 0.70)');
    grad.addColorStop(0.35, 'rgba(20, 18, 15, 0.45)');
    grad.addColorStop(0.65, 'rgba(25, 22, 18, 0.18)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(72, 60);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(geo, mat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(0, 0.01, -2.0);
  plane.renderOrder = 2;
  return plane;
}

/**
 * Añade luces cálidas tenues en el interior de los apartamentos para
 * simular vida y profundidad tras los ventanales de piso a techo.
 */
function addWarmInteriorLighting(levelGroups: { [key: string]: THREE.Group }): void {
  const levels = [
    { group: levelGroups.pb, y: 3.5, span: 10.0 },
    { group: levelGroups.p2, y: 3.5, span: 10.0 },
    { group: levelGroups.p3, y: 3.5, span: 10.0 },
    { group: levelGroups.mirador, y: 3.5, span: 10.0 },
  ];

  levels.forEach(({ group, y, span }) => {
    const lightNorte = new THREE.PointLight(0xffdfb0, 1.4, 16, 1.2);
    lightNorte.position.set(-span * 0.65, y, -2.5);
    group.add(lightNorte);

    const lightSur = new THREE.PointLight(0xffdfb0, 1.4, 16, 1.2);
    lightSur.position.set(span * 0.65, y, -2.5);
    group.add(lightSur);
  });
}

/**
 * Carga e inicializa el modelo arquitectónico real de Residencias Caroní.
 * Si el archivo GLB no está disponible o falla la decodificación, conmuta
 * limpiamente al modelo procedural de respaldo sin interrumpir la experiencia.
 */
export async function loadArchitecturalBuilding(
  assetPipeline: Progressive3DPipelineInstance | null,
  materials: SceneMaterials,
  modelUrl: string = '/models/residencias_caroni_model.glb'
): Promise<ArchitecturalBuildingLoadResult> {
  // Inicializar siempre el generador base para obtener el sistema de luces,
  // controladores de modo solar y la opción de fallback.
  const fallbackScene = buildCompleteBuildingScene(materials);

  if (!assetPipeline || typeof window === 'undefined') {
    return {
      ...fallbackScene,
      isRealGLBModel: false,
    };
  }

  try {
    const gltf = await assetPipeline.loadCompressedGLTF(modelUrl);
    if (!gltf || !gltf.scene) {
      throw new Error('GLTF scene is empty');
    }

    const gltfRoot = gltf.scene;

    const buildingRoot = new THREE.Group();
    buildingRoot.name = 'ResidenciasCaroni_RealBuilding';

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

    levelGroups.sotano.name = 'Level_Sotano';
    levelGroups.pb.name = 'Level_PB';
    levelGroups.p2.name = 'Level_P2';
    levelGroups.p3.name = 'Level_P3';
    levelGroups.mirador.name = 'Level_Mirador';
    levelGroups.pergola.name = 'Level_Pergola';

    buildingRoot.add(levelGroups.sotano);
    buildingRoot.add(levelGroups.pb);
    buildingRoot.add(levelGroups.p2);
    buildingRoot.add(levelGroups.p3);
    buildingRoot.add(levelGroups.mirador);
    buildingRoot.add(levelGroups.pergola);

    const unitAnchors: UnitAnchor[] = [];

    // Recorrer los hijos principales del modelo importado
    const childrenList = [...gltfRoot.children];

    childrenList.forEach((node) => {
      const mapping = UNIT_NODE_MAPPING[node.name];

      if (mapping) {
        // Asignar el nodo a su grupo de nivel correspondiente
        levelGroups[mapping.levelKey].add(node);

        // Recorrer todas las mallas del apartamento
        node.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Almacenar metadatos para raycasting y resaltado
            mesh.userData = {
              ...(mesh.userData || {}),
              unitId: mapping.unitId,
              levelKey: mapping.levelKey,
              isRealModel: true,
            };

            // Respaldar color original del material para el sistema de hover
            if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).color) {
              const stdMat = mesh.material as THREE.MeshStandardMaterial;
              mesh.userData.origColor = stdMat.color.getHex();
              mesh.userData.origEmissive = stdMat.emissive ? stdMat.emissive.getHex() : 0x000000;
              mesh.userData.origEmissiveIntensity = stdMat.emissiveIntensity ?? 0;
            }

            unitMeshesMap[mapping.unitId].push(mesh);
          }
        });

        // Calcular posición precisa del ancla para rótulo flotante 3D
        const box = new THREE.Box3().setFromObject(node);
        if (!box.isEmpty()) {
          const center = box.getCenter(new THREE.Vector3());
          // Anclar en la fachada frontal (Z+)
          const anchorPos = new THREE.Vector3(
            center.x,
            center.y + 0.5,
            Math.max(center.z, box.max.z) + 1.2
          );

          unitAnchors.push({
            id: mapping.unitId,
            code: mapping.code,
            name: mapping.name,
            levelKey: mapping.levelKey,
            position: anchorPos,
          });
        }
      } else if (node.name === 'Estructura_Core') {
        levelGroups.sotano.add(node);
        node.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData = {
              ...(child.userData || {}),
              isRealModel: true,
            };
          }
        });
      } else {
        // Otros elementos (columnas independientes, pérgola o losas)
        const box = new THREE.Box3().setFromObject(node);
        const center = box.getCenter(new THREE.Vector3());
        node.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData = {
              ...(child.userData || {}),
              isRealModel: true,
            };
          }
        });

        if (center.y > 22.0) {
          levelGroups.pergola.add(node);
        } else if (center.y > 14.0) {
          levelGroups.p3.add(node);
        } else if (center.y > 7.0) {
          levelGroups.p2.add(node);
        } else if (center.y > 2.0) {
          levelGroups.pb.add(node);
        } else {
          levelGroups.sotano.add(node);
        }
      }
    });

    // Aplicar mejoras fotográficas a los materiales del modelo GLB
    buildingRoot.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        enhanceMeshMaterialForPhotorealism(child as THREE.Mesh);
      }
    });

    // Añadir sombra de contacto y luces interiores
    levelGroups.sotano.add(createBuildingContactShadowPlane());
    addWarmInteriorLighting(levelGroups);

    return {
      buildingRoot,
      unitMeshesMap,
      levelGroups,
      unitAnchors: unitAnchors.length > 0 ? unitAnchors : fallbackScene.unitAnchors,
      lightsGroup: fallbackScene.lightsGroup,
      updateLightingMode: fallbackScene.updateLightingMode,
      transitionStep: fallbackScene.transitionStep,
      isRealGLBModel: true,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[3D-PIPELINE] No se pudo cargar el modelo GLB comprimido, activando fallback procedural:',
      err
    );
    return {
      ...fallbackScene,
      isRealGLBModel: false,
    };
  }
}
