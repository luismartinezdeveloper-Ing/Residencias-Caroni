import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { Maximize2, Minimize2, Sun, Moon, Sparkles, Layers, Compass, RotateCw, ShieldCheck, DollarSign, FileDown, MessageSquare, CheckCircle, Unlock, Building2, Mic } from 'lucide-react';
import { UnitData } from '../../types/brand';
import { AIChatbot } from './AIChatbot';
import { VirtualTour360View } from './3d/VirtualTour360View';
import { UNITS_DATA, BRAND_INFO, MILESTONES_DATA } from '../../data/brandData';
import { CaroniIsotype, ArchitecturalElevation, FloorPlanSchema } from '../ui/ArchitecturalDrawings';
import { useConfidentiality } from '../../context/ConfidentialityContext';
import { VoiceNavigationController, VoiceNavigationCommand, VoiceFeedback } from '../../utils/voiceNavigationController';
import { VoiceControlHUD } from '../ui/VoiceControlHUD';
import {
  createArchitecturalMaterials,
  buildCompleteBuildingScene,
  createArchitecturalEnvironmentMap,
  SceneMaterials,
  UnitMeshRegistry,
  UnitAnchor,
  SolarTimeMode,
} from './3d/ArchitecturalScene';

interface Architectural3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUnit: UnitData;
  onSelectUnit: (unit: UnitData) => void;
  onEmitLoi: (unit: UnitData) => void;
  initialViewMode?: 'assembled' | 'exploded' | 'tour360' | 'floorplan' | 'pricing';
}

export const Architectural3DModal: React.FC<Architectural3DModalProps> = ({
  isOpen,
  onClose,
  selectedUnit,
  onSelectUnit,
  onEmitLoi,
  initialViewMode = 'assembled',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { isAccredited, activeLead, credentials } = useConfidentiality();

  const VALID_VIEW_MODES = ['assembled', 'exploded', 'tour360', 'floorplan', 'pricing'];
  const sanitizedInitial = typeof initialViewMode === 'string' && VALID_VIEW_MODES.includes(initialViewMode)
    ? initialViewMode
    : 'assembled';

  // States
  const [viewMode, setViewMode] = useState<'assembled' | 'exploded' | 'tour360' | 'floorplan' | 'pricing'>(sanitizedInitial);

  useEffect(() => {
    if (isOpen && typeof initialViewMode === 'string' && VALID_VIEW_MODES.includes(initialViewMode)) {
      setViewMode(initialViewMode);
    }
  }, [isOpen, initialViewMode]);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [activeFloorFilter, setActiveFloorFilter] = useState<'ALL' | 'PB' | 'P2' | 'P3' | 'MIRADOR'>('ALL');
  const [cameraView, setCameraView] = useState<'iso' | 'north' | 'south' | 'top'>('iso');
  const [solarTimeMode, setSolarTimeMode] = useState<SolarTimeMode>('morning');
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<{
    unit: UnitData;
    x: number;
    y: number;
  } | null>(null);
  const [hasWebGLError, setHasWebGLError] = useState<boolean>(false);
  const [retryKey, setRetryKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [planType, setPlanType] = useState<'Social' | 'Privada'>('Social');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Voice Navigation State
  const voiceControllerRef = useRef<VoiceNavigationController | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedback | null>(null);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<VoiceNavigationCommand | null>(null);

  // Ref to hold states for requestAnimationFrame loop without stale closures
  const isRotatingRef = useRef<boolean>(false);
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  const solarModeRef = useRef<SolarTimeMode>('morning');
  useEffect(() => {
    solarModeRef.current = solarTimeMode;
  }, [solarTimeMode]);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pmremGenRef = useRef<THREE.PMREMGenerator | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const materialsRef = useRef<SceneMaterials | null>(null);
  const groundMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const updateLightingModeRef = useRef<((mode: SolarTimeMode, immediate?: boolean) => void) | null>(null);
  const transitionStepRef = useRef<((mode: SolarTimeMode, deltaFactor?: number) => void) | null>(null);
  const updateEnvMapRef = useRef<((mode: SolarTimeMode) => void) | null>(null);

  // References to 3D elements
  const unitMeshesRef = useRef<UnitMeshRegistry>({});
  const levelGroupsRef = useRef<{ [key: string]: THREE.Group }>({});
  const unitAnchorsRef = useRef<UnitAnchor[]>([]);
  const connectionLinesGroupRef = useRef<THREE.Group | null>(null);
  const buildingRootRef = useRef<THREE.Group | null>(null);

  // Interaction controls state
  const DEFAULT_ZOOM = 90; // Decreased initial zoom (larger distance)
  const MAX_ZOOM = 130;
  const MIN_ZOOM = 30;
  const controlsStateRef = useRef({
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    rotationX: 0.45, // Starts slightly elevated for dramatic cinematic glide-in
    rotationY: -1.15, // Starts with a slight yaw offset
    targetRotationX: 0.32, // Calibrated target isometric angle
    targetRotationY: -0.78,
    zoom: 118, // Starts further back for smooth camera descent
    targetZoom: DEFAULT_ZOOM,
    targetLookAtY: 10.5,
    currentLookAtY: 10.5,
    currentExplosion: 0,
    targetExplosion: 0,
    initialPinchDist: 0,
    initialPinchZoom: DEFAULT_ZOOM,
  });

  // Sync explosion target when viewMode changes
  useEffect(() => {
    if (viewMode === 'exploded') {
      controlsStateRef.current.targetExplosion = 1.0;
    } else {
      controlsStateRef.current.targetExplosion = 0.0;
    }
  }, [viewMode]);

  // Sync Lighting Mode & Environment Reflections (Morning / Golden Hour / Night)
  useEffect(() => {
    if (updateLightingModeRef.current) {
      updateLightingModeRef.current(solarTimeMode);
    }
    if (updateEnvMapRef.current) {
      updateEnvMapRef.current(solarTimeMode);
    }
    if (sceneRef.current) {
      if (solarTimeMode === 'morning') {
        sceneRef.current.background = new THREE.Color('#141311'); // Dark Studio Gallery Matutino (tonalidad sobria contemporánea)
      } else if (solarTimeMode === 'golden') {
        sceneRef.current.background = new THREE.Color('#1A140F'); // Dark Amber Crepuscular
      } else {
        sceneRef.current.background = new THREE.Color('#0A0A0E'); // Midnight Obsidian Puro
      }
    }
    if (groundMatRef.current) {
      if (solarTimeMode === 'night') {
        groundMatRef.current.color.setHex(0x12141A);
      } else if (solarTimeMode === 'golden') {
        groundMatRef.current.color.setHex(0x221B14);
      } else {
        groundMatRef.current.color.setHex(0x1A1815);
      }
    }
  }, [solarTimeMode]);

  // Filter Floor Visibility and Highlight Selected Unit
  useEffect(() => {
    const groups = levelGroupsRef.current;
    if (!groups) return;

    // Floor visibility filter
    if (groups.sotano) groups.sotano.visible = activeFloorFilter === 'ALL' || activeFloorFilter === 'PB';
    if (groups.pb) groups.pb.visible = activeFloorFilter === 'ALL' || activeFloorFilter === 'PB';
    if (groups.p2) groups.p2.visible = activeFloorFilter === 'ALL' || activeFloorFilter === 'P2';
    if (groups.p3) groups.p3.visible = activeFloorFilter === 'ALL' || activeFloorFilter === 'P3';
    if (groups.mirador) groups.mirador.visible = activeFloorFilter === 'ALL' || activeFloorFilter === 'MIRADOR';
    if (groups.pergola) groups.pergola.visible = activeFloorFilter === 'ALL' || activeFloorFilter === 'MIRADOR';

    // Unit highlighting & transparency management
    if (unitMeshesRef.current) {
      (Object.entries(unitMeshesRef.current) as [string, THREE.Mesh[]][]).forEach(([unitId, meshes]) => {
        const isSelected = unitId === selectedUnit.id;
        const isHovered = unitId === hoveredUnitId;

        meshes.forEach((mesh) => {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (!mat) return;

          if (isSelected) {
            mat.color.setHex(0xFFFFFF);
            mat.emissive.setHex(0xC9A86A); // Warm gold architectural glow
            mat.emissiveIntensity = solarTimeMode === 'night' ? 0.95 : 0.65;
          } else if (isHovered) {
            mat.color.setHex(0xFFFFFF);
            mat.emissive.setHex(0x8C7452);
            mat.emissiveIntensity = 0.35;
          } else {
            mat.color.setHex(solarTimeMode === 'night' ? 0xCBC4B6 : 0xFAF8F4);
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        });
      });
    }
  }, [selectedUnit, hoveredUnitId, activeFloorFilter, solarTimeMode]);

  // Smooth cinematic camera focus transition to selected unit
  const focusCameraOnUnit = (unit: UnitData) => {
    setIsRotating(false);
    if (unit.orientation === 'Norte') {
      controlsStateRef.current.targetRotationY = Math.PI * 0.95;
    } else {
      controlsStateRef.current.targetRotationY = -0.05;
    }

    if (unit.typology === 'Jardín') {
      controlsStateRef.current.targetRotationX = 0.2;
      controlsStateRef.current.targetZoom = 52;
      controlsStateRef.current.targetLookAtY = 4.5;
    } else if (unit.level === 'P2') {
      controlsStateRef.current.targetRotationX = 0.15;
      controlsStateRef.current.targetZoom = 50;
      controlsStateRef.current.targetLookAtY = 9.6;
    } else if (unit.level === 'P3') {
      controlsStateRef.current.targetRotationX = 0.15;
      controlsStateRef.current.targetZoom = 50;
      controlsStateRef.current.targetLookAtY = 13.8;
    } else if (unit.typology === 'Mirador') {
      controlsStateRef.current.targetRotationX = 0.25;
      controlsStateRef.current.targetZoom = 52;
      controlsStateRef.current.targetLookAtY = 18.5;
    }
  };

  // Main Three.js Scene Setup & Render Engine
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;

    // 1. SCENE
    scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // 2. CAMERA (Calibrated wide architectural FOV)
    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 20, DEFAULT_ZOOM);
    cameraRef.current = camera;

    // 3. RENDERER (Safely initialize with Hardware MSAA & Desktop Anti-Aliasing Tuning)
    const isDesktopDevice =
      typeof window !== 'undefined' &&
      !('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
      window.innerWidth >= 768;
    const optimalPixelRatio = isDesktopDevice
      ? Math.min(Math.max(window.devicePixelRatio || 1, 1.75), 2.0)
      : Math.min(window.devicePixelRatio || 1, 2.0);

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true, // Native MSAA (Multi-sample Anti-Aliasing) on the WebGL framebuffer
        alpha: true,
        powerPreference: isDesktopDevice ? 'high-performance' : 'default',
        precision: 'highp',
        stencil: false,
        depth: true,
        failIfMajorPerformanceCaveat: false,
      });
      renderer.debug.checkShaderErrors = false; // Suppresses non-fatal ANGLE/DirectX HLSL compiler warning logs and prevents synchronous GPU pipeline stalls
      renderer.setSize(width, height);
      renderer.setPixelRatio(optimalPixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      rendererRef.current = renderer;

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);
      setHasWebGLError(false);
    } catch (e) {
      console.warn('WebGLRenderer context creation failed, using vector fallback:', e);
      setHasWebGLError(true);
      return;
    }

    // 4. ENVIRONMENT MAP & IBL GENERATOR (Pre-cached for instant 0ms switching)
    const pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();
    pmremGenRef.current = pmremGen;

    const envMapCache = new Map<SolarTimeMode, THREE.Texture>();
    (['morning', 'golden', 'night'] as SolarTimeMode[]).forEach((m) => {
      try {
        const envTex = createArchitecturalEnvironmentMap(m);
        const renderTarget = pmremGen.fromEquirectangular(envTex);
        envMapCache.set(m, renderTarget.texture);
        envTex.dispose();
      } catch (err) {
        console.warn('Failed to pre-cache env map for mode:', m, err);
      }
    });

    const updateEnvMap = (mode: SolarTimeMode) => {
      if (!scene) return;
      const cached = envMapCache.get(mode);
      if (cached) {
        scene.environment = cached;
      }
    };
    updateEnvMapRef.current = updateEnvMap;
    updateEnvMap(solarModeRef.current);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost - switching to fallback');
      setHasWebGLError(true);
    };

    const handleContextRestored = () => {
      console.info('WebGL context restored - reloading 3D model');
      setHasWebGLError(false);
      setRetryKey((k) => k + 1);
    };

    if (renderer && renderer.domElement) {
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
      renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);
    }

    // 5. MATERIALS & FULL SCENE BUILDING (With hardware Anisotropic Filtering & Texture Mipmapping)
    const maxAnisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 16;
    const materials = createArchitecturalMaterials(maxAnisotropy);
    materialsRef.current = materials;

    const {
      buildingRoot,
      unitMeshesMap,
      levelGroups,
      unitAnchors,
      lightsGroup,
      updateLightingMode,
      transitionStep,
    } = buildCompleteBuildingScene(materials);

    scene.add(buildingRoot);
    scene.add(lightsGroup);
    buildingRootRef.current = buildingRoot;
    unitMeshesRef.current = unitMeshesMap;
    levelGroupsRef.current = levelGroups;
    unitAnchorsRef.current = unitAnchors;
    updateLightingModeRef.current = updateLightingMode;
    transitionStepRef.current = transitionStep;

    updateLightingMode(solarModeRef.current, true);

    // 5. PEDESTAL & GROUND
    const groundGeo = new THREE.CylinderGeometry(36, 36, 0.6, 64);
    const initialGroundColor =
      solarModeRef.current === 'night'
        ? 0x12141A
        : solarModeRef.current === 'golden'
        ? 0x221B14
        : 0x1A1815;
    const groundMat = new THREE.MeshStandardMaterial({
      color: initialGroundColor,
      roughness: 0.92,
      metalness: 0.08,
    });
    groundMatRef.current = groundMat;
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -4.5;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Retícula arquitectónica refinada en bronce satinado
    const gridHelper = new THREE.GridHelper(52, 26, 0xC9A86A, 0x3A342B);
    gridHelper.position.y = -4.19;
    scene.add(gridHelper);

    // Ávila Mountain Background Silhouette (con trazo nítido arquitectónico)
    const mountainPoints = [
      new THREE.Vector3(-65, -4.0, -42),
      new THREE.Vector3(-45, 11, -42),
      new THREE.Vector3(-22, 19, -42),
      new THREE.Vector3(0, 24, -42),
      new THREE.Vector3(26, 17, -42),
      new THREE.Vector3(48, 13, -42),
      new THREE.Vector3(65, -4.0, -42),
    ];
    const mountainGeo = new THREE.BufferGeometry().setFromPoints(mountainPoints);
    const mountainMat = new THREE.LineBasicMaterial({
      color: 0xC9A86A,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.45,
    });
    const mountainLine = new THREE.Line(mountainGeo, mountainMat);
    scene.add(mountainLine);

    // Dotted Structural Connection Lines for Exploded View
    const connLinesGroup = new THREE.Group();
    const lineCoords = [
      [-11.0, -8.0],
      [11.0, -8.0],
      [-11.0, 8.0],
      [11.0, 8.0],
    ];

    lineCoords.forEach(([x, z]) => {
      const linePoints = [
        new THREE.Vector3(x, -4.0, z),
        new THREE.Vector3(x, 26.5, z),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const dottedLineMat = new THREE.LineDashedMaterial({
        color: 0x8C7452,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: true,
        opacity: 0.6,
      });
      const axisLine = new THREE.Line(lineGeo, dottedLineMat);
      axisLine.computeLineDistances();
      connLinesGroup.add(axisLine);
    });

    connLinesGroup.visible = false;
    scene.add(connLinesGroup);
    connectionLinesGroupRef.current = connLinesGroup;

    // Pre-compile all scene shaders and materials asynchronously/immediately on the GPU
    // This prevents first-frame hitching and ensures instant interaction smoothness
    try {
      if (renderer && scene && camera) {
        renderer.compile(scene, camera);
      }
    } catch {
      // Ignore fallback
    }

    // 6. RAYCASTING INTERACTIVITY (Hover / Click on 3D building)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Cache selectable meshes once to avoid array re-allocations on every mousemove
    const allSelectableMeshes: THREE.Mesh[] = [];
    Object.values(unitMeshesMap).forEach((meshes) => allSelectableMeshes.push(...meshes));

    const getRaycastHit = (clientX: number, clientY: number) => {
      if (!mountRef.current || !camera || !buildingRoot || allSelectableMeshes.length === 0) return null;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(allSelectableMeshes, false);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const uId = (hitMesh as any).userData?.unitId;
        return uId || null;
      }
      return null;
    };

    // EVENT HANDLERS
    let clickStartX = 0;
    let clickStartY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('button') || (e.target as HTMLElement)?.closest('.hotspot-badge')) return;
      controlsStateRef.current.isDragging = true;
      controlsStateRef.current.prevMouseX = e.clientX;
      controlsStateRef.current.prevMouseY = e.clientY;
      clickStartX = e.clientX;
      clickStartY = e.clientY;
      setIsRotating(false);
      if (mountRef.current) {
        mountRef.current.style.cursor = 'grabbing';
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (controlsStateRef.current.isDragging) {
        const deltaX = e.clientX - controlsStateRef.current.prevMouseX;
        const deltaY = e.clientY - controlsStateRef.current.prevMouseY;

        controlsStateRef.current.targetRotationY += deltaX * 0.007;
        controlsStateRef.current.targetRotationX = Math.max(
          -0.08,
          Math.min(1.35, controlsStateRef.current.targetRotationX + deltaY * 0.007)
        );

        controlsStateRef.current.prevMouseX = e.clientX;
        controlsStateRef.current.prevMouseY = e.clientY;
      } else {
        // Raycast hover check
        const hitUnitId = getRaycastHit(e.clientX, e.clientY);
        setHoveredUnitId(hitUnitId);
        
        // Dynamic architectural cursor feedback
        if (mountRef.current) {
          if (hitUnitId) {
            mountRef.current.style.cursor = 'pointer';
          } else {
            mountRef.current.style.cursor = 'grab';
          }
        }

        if (hitUnitId) {
          const foundUnit = UNITS_DATA.find((u) => u.id === hitUnitId);
          if (foundUnit && mountRef.current) {
            const rect = mountRef.current.getBoundingClientRect();
            setHoverTooltip({
              unit: foundUnit,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }
        } else {
          setHoverTooltip(null);
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      controlsStateRef.current.isDragging = false;
      if (mountRef.current) {
        mountRef.current.style.cursor = hoveredUnitId ? 'pointer' : 'grab';
      }
      const dist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);
      if (dist < 5) {
        const hitUnitId = getRaycastHit(e.clientX, e.clientY);
        if (hitUnitId) {
          const found = UNITS_DATA.find((u) => u.id === hitUnitId);
          if (found) {
            onSelectUnit(found);
            focusCameraOnUnit(found);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      controlsStateRef.current.targetZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, controlsStateRef.current.targetZoom + e.deltaY * 0.04)
      );
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Touch support with Pinch-to-Zoom
    const getTouchDistance = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.closest('button') || (e.target as HTMLElement)?.closest('.hotspot-badge')) return;
      if (e.touches.length === 1) {
        controlsStateRef.current.isDragging = true;
        controlsStateRef.current.prevMouseX = e.touches[0].clientX;
        controlsStateRef.current.prevMouseY = e.touches[0].clientY;
        setIsRotating(false);
      } else if (e.touches.length === 2) {
        controlsStateRef.current.isDragging = false;
        controlsStateRef.current.initialPinchDist = getTouchDistance(e.touches[0], e.touches[1]);
        controlsStateRef.current.initialPinchZoom = controlsStateRef.current.targetZoom;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && controlsStateRef.current.isDragging) {
        const deltaX = e.touches[0].clientX - controlsStateRef.current.prevMouseX;
        const deltaY = e.touches[0].clientY - controlsStateRef.current.prevMouseY;

        controlsStateRef.current.targetRotationY += deltaX * 0.007;
        controlsStateRef.current.targetRotationX = Math.max(
          -0.08,
          Math.min(1.35, controlsStateRef.current.targetRotationX + deltaY * 0.007)
        );

        controlsStateRef.current.prevMouseX = e.touches[0].clientX;
        controlsStateRef.current.prevMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2 && controlsStateRef.current.initialPinchDist > 0) {
        const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
        const factor = controlsStateRef.current.initialPinchDist / Math.max(currentDist, 10);
        const newZoom = controlsStateRef.current.initialPinchZoom * factor;
        controlsStateRef.current.targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        controlsStateRef.current.isDragging = false;
        controlsStateRef.current.initialPinchDist = 0;
      } else if (e.touches.length === 1) {
        controlsStateRef.current.isDragging = true;
        controlsStateRef.current.prevMouseX = e.touches[0].clientX;
        controlsStateRef.current.prevMouseY = e.touches[0].clientY;
        controlsStateRef.current.initialPinchDist = 0;
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      const currentIsDesktop =
        typeof window !== 'undefined' &&
        !('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
        window.innerWidth >= 768;
      const currentPixelRatio = currentIsDesktop
        ? Math.min(Math.max(window.devicePixelRatio || 1, 1.75), 2.0)
        : Math.min(window.devicePixelRatio || 1, 2.0);

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(currentPixelRatio);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (isRotatingRef.current) {
        controlsStateRef.current.targetRotationY += 0.0035;
      }

      // Smooth damping
      controlsStateRef.current.rotationX +=
        (controlsStateRef.current.targetRotationX - controlsStateRef.current.rotationX) * 0.09;
      controlsStateRef.current.rotationY +=
        (controlsStateRef.current.targetRotationY - controlsStateRef.current.rotationY) * 0.09;
      controlsStateRef.current.zoom +=
        (controlsStateRef.current.targetZoom - controlsStateRef.current.zoom) * 0.09;
      controlsStateRef.current.currentLookAtY +=
        (controlsStateRef.current.targetLookAtY - controlsStateRef.current.currentLookAtY) * 0.08;
      controlsStateRef.current.currentExplosion +=
        (controlsStateRef.current.targetExplosion - controlsStateRef.current.currentExplosion) * 0.09;

      const exp = controlsStateRef.current.currentExplosion;

      const groups = levelGroupsRef.current;
      if (groups && groups.pb) {
        groups.sotano.position.y = -6.5 * exp;
        groups.pb.position.y = 0;
        groups.p2.position.y = 4.8 * exp;
        groups.p3.position.y = 9.6 * exp;
        groups.mirador.position.y = 14.4 * exp;
        groups.pergola.position.y = 18.2 * exp;
      }

      if (connectionLinesGroupRef.current) {
        connectionLinesGroupRef.current.visible = exp > 0.05;
      }

      const rX = controlsStateRef.current.rotationX;
      const rY = controlsStateRef.current.rotationY;
      const zoom = controlsStateRef.current.zoom;
      const lookAtY = controlsStateRef.current.currentLookAtY + exp * 6;

      camera.position.x = Math.sin(rY) * Math.cos(rX) * zoom;
      camera.position.y = Math.sin(rX) * zoom + lookAtY;
      camera.position.z = Math.cos(rY) * Math.cos(rX) * zoom;
      camera.lookAt(0, lookAtY, 0);

      // Continuous smooth interpolation for glass materials and architectural lighting
      if (transitionStepRef.current) {
        transitionStepRef.current(solarModeRef.current, 0.08);
      }

      try {
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      } catch (renderError) {
        console.warn('Render frame skipped:', renderError);
      }
    };

    animate();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (pmremGenRef.current) {
        try {
          envMapCache.forEach((tex) => tex.dispose());
          envMapCache.clear();
          pmremGenRef.current.dispose();
        } catch {
          // ignore
        }
      }

      if (renderer) {
        if (renderer.domElement) {
          renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
          renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
        }
        if (scene) {
          if (scene.environment) {
            scene.environment.dispose();
          }
          scene.traverse((obj) => {
            if ((obj as THREE.Mesh).geometry) {
              (obj as THREE.Mesh).geometry.dispose();
            }
            if ((obj as THREE.Mesh).material) {
              const mat = (obj as THREE.Mesh).material;
              if (Array.isArray(mat)) {
                mat.forEach((m) => m.dispose());
              } else if (mat && typeof (mat as any).dispose === 'function') {
                (mat as any).dispose();
              }
            }
          });
        }
        try {
          renderer.dispose();
        } catch {
          // teardown disposal
        }
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [isOpen, onClose, retryKey]);

  // Camera Presets
  const setCameraPreset = (preset: 'iso' | 'north' | 'south' | 'top') => {
    setCameraView(preset);
    setIsRotating(false);
    controlsStateRef.current.targetLookAtY = 10.5;

    if (preset === 'iso') {
      controlsStateRef.current.targetRotationX = 0.32;
      controlsStateRef.current.targetRotationY = -0.78;
      controlsStateRef.current.targetZoom = DEFAULT_ZOOM;
    } else if (preset === 'north') {
      controlsStateRef.current.targetRotationX = 0.04;
      controlsStateRef.current.targetRotationY = Math.PI;
      controlsStateRef.current.targetZoom = DEFAULT_ZOOM - 4;
    } else if (preset === 'south') {
      controlsStateRef.current.targetRotationX = 0.04;
      controlsStateRef.current.targetRotationY = 0;
      controlsStateRef.current.targetZoom = DEFAULT_ZOOM - 4;
    } else if (preset === 'top') {
      controlsStateRef.current.targetRotationX = 1.48;
      controlsStateRef.current.targetRotationY = 0;
      controlsStateRef.current.targetZoom = DEFAULT_ZOOM - 8;
    }
  };

  const handleZoomChange = (delta: number) => {
    controlsStateRef.current.targetZoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, controlsStateRef.current.targetZoom + delta)
    );
  };

  const handleResetView = () => {
    setCameraPreset('iso');
    setViewMode('assembled');
    setActiveFloorFilter('ALL');
  };

  // Voice Navigation Controller initialization & command dispatching
  useEffect(() => {
    if (!isOpen) {
      if (voiceControllerRef.current) {
        voiceControllerRef.current.stopListening();
      }
      return;
    }

    const controller = new VoiceNavigationController();
    voiceControllerRef.current = controller;
    setIsVoiceSupported(controller.getSupported());

    controller.setCallbacks({
      onListeningChange: (listening) => {
        setIsVoiceListening(listening);
      },
      onFeedback: (fb) => {
        setVoiceFeedback(fb);
      },
      onCommand: (cmd) => {
        setLastVoiceCommand(cmd);

        if (cmd.type === 'SET_VIEW_MODE') {
          setViewMode(cmd.mode);
        } else if (cmd.type === 'GO_TO_ROOM') {
          // Switch to 360 tour
          setViewMode('tour360');
        } else if (cmd.type === 'SET_SOLAR_MODE') {
          setSolarTimeMode(cmd.mode);
        } else if (cmd.type === 'SET_CAMERA_VIEW') {
          setCameraPreset(cmd.view);
        } else if (cmd.type === 'TOGGLE_ROTATION') {
          setIsRotating((prev) => (cmd.state !== undefined ? cmd.state : !prev));
        } else if (cmd.type === 'ZOOM') {
          if (cmd.direction === 'in') {
            handleZoomChange(-15);
          } else if (cmd.direction === 'out') {
            handleZoomChange(15);
          } else {
            handleResetView();
          }
        } else if (cmd.type === 'RESET_VIEW') {
          handleResetView();
        } else if (cmd.type === 'OPEN_ADVISOR') {
          setIsChatOpen(true);
        } else if (cmd.type === 'SELECT_UNIT') {
          const found = UNITS_DATA.find((u) => u.id === cmd.unitId);
          if (found) {
            onSelectUnit(found);
          }
        }
      },
    });

    return () => {
      controller.destroy();
    };
  }, [isOpen, onSelectUnit]);

  const handleToggleVoiceControl = () => {
    if (voiceControllerRef.current) {
      voiceControllerRef.current.toggleListening();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0908]/85 backdrop-blur-xl p-2 sm:p-4 md:p-6 cursor-default"
        >
          {/* Modal Container: Studio Arquitectónico de Alta Gama */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full bg-[#14120E] text-[#FAF8F5] border border-[#C9A86A]/30 shadow-[0_30px_90px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-300 ${
              isFullscreen
                ? 'h-screen max-h-none w-screen max-w-none m-0 border-none rounded-none'
                : 'w-full h-full max-w-[1800px] rounded-3xl'
            }`}
          >
            {/* Top Institutional Header */}
            <div className="flex flex-wrap items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 bg-[#1B1813] border-b border-[#C9A86A]/20 gap-2 shrink-0 shadow-md">
              {/* Brand Title */}
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <CaroniIsotype size={24} color="#C9A86A" className="shrink-0" />
                <div className="min-w-0">
                  <div className="font-display text-sm sm:text-base md:text-lg text-[#FAF8F5] leading-none truncate">
                    Estudio Volumétrico 3D & Estratos
                  </div>
                  <div className="font-meta text-[8.5px] sm:text-[9.5px] text-[#C9A86A] tracking-[0.2em] mt-0.5 truncate font-semibold">
                    MAQUETA DIGITAL A TINTA · AÑIL ARQUITECTURA
                  </div>
                </div>
              </div>

              {/* 5 Main View Modes Tabs */}
              <div className="flex items-center border border-white/10 bg-black/50 p-1 rounded-full overflow-x-auto no-scrollbar max-w-full order-3 sm:order-2 shrink-0 shadow-inner gap-1">
                {[
                  { id: 'assembled', label: '01 · MONOLÍTICO' },
                  { id: 'exploded', label: '02 · DESPIECE VERTICAL' },
                  { id: 'tour360', label: '03 · TOUR 360° INTERIORES 🧭' },
                  { id: 'floorplan', label: '04 · PLANTA 2D' },
                  { id: 'pricing', label: '05 · PRECIOS EXCLUSIVOS 🔓' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`font-meta text-[8.5px] sm:text-[9.5px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer min-h-[28px] flex items-center justify-center ${
                      viewMode === mode.id
                        ? 'bg-[#C9A86A] text-[#0A0908] font-bold shadow-md'
                        : mode.id === 'tour360'
                        ? 'text-emerald-300 bg-emerald-950/50 font-semibold hover:bg-emerald-900/60 border border-emerald-500/40'
                        : mode.id === 'pricing'
                        ? 'text-[#C9A86A] font-semibold hover:bg-white/10'
                        : 'text-[#C9C4B5] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Header Right Actions: Voice Control + 3-State Solar Simulation + Hotspots + Fullscreen + Close */}
              <div className="flex items-center space-x-1.5 order-2 sm:order-3">
                {/* Voice Navigation HUD Controller */}
                <VoiceControlHUD
                  isListening={isVoiceListening}
                  isSupported={isVoiceSupported}
                  feedback={voiceFeedback}
                  lastCommand={lastVoiceCommand}
                  onToggleListening={handleToggleVoiceControl}
                  contextMode={viewMode === 'tour360' ? 'tour360' : 'building'}
                />

                {/* 3-State Solar Time Simulation Toggle */}
                <div className="flex items-center border border-[#C9A86A]/30 bg-black/60 p-0.5 rounded-full shadow-inner">
                  <button
                    onClick={() => setSolarTimeMode('morning')}
                    className={`font-meta text-[8.5px] sm:text-[9.5px] px-2 sm:px-2.5 py-1 rounded-full transition-colors flex items-center space-x-1 cursor-pointer min-h-[26px] ${
                      solarTimeMode === 'morning'
                        ? 'bg-[#C9A86A] text-[#0A0908] font-bold shadow-xs'
                        : 'text-[#C9C4B5] hover:text-white hover:bg-white/10'
                    }`}
                    title="10:00 AM · Sol Matutino (Alta claridad y cielo azul)"
                  >
                    <Sun className={`w-3 h-3 ${solarTimeMode === 'morning' ? 'text-[#0A0908]' : 'text-[#C9A86A]'}`} />
                    <span className="hidden xl:inline">10:00 AM</span>
                  </button>

                  <button
                    onClick={() => setSolarTimeMode('golden')}
                    className={`font-meta text-[8.5px] sm:text-[9.5px] px-2 sm:px-2.5 py-1 rounded-full transition-colors flex items-center space-x-1 cursor-pointer min-h-[26px] ${
                      solarTimeMode === 'golden'
                        ? 'bg-[#C9A86A] text-[#0A0908] font-bold shadow-xs'
                        : 'text-[#C9C4B5] hover:text-white hover:bg-white/10'
                    }`}
                    title="5:30 PM · Hora Dorada (Ocaso sobre El Ávila y sombras rasantes)"
                  >
                    <Sparkles className={`w-3 h-3 ${solarTimeMode === 'golden' ? 'text-[#0A0908]' : 'text-[#C9A86A]'}`} />
                    <span className="hidden xl:inline">5:30 PM</span>
                  </button>

                  <button
                    onClick={() => setSolarTimeMode('night')}
                    className={`font-meta text-[8.5px] sm:text-[9.5px] px-2 sm:px-2.5 py-1 rounded-full transition-colors flex items-center space-x-1 cursor-pointer min-h-[26px] ${
                      solarTimeMode === 'night'
                        ? 'bg-[#C9A86A] text-[#0A0908] font-bold shadow-xs'
                        : 'text-[#C9C4B5] hover:text-white hover:bg-white/10'
                    }`}
                    title="8:30 PM · Noche de Gala (Iluminación interior cálida habitada)"
                  >
                    <Moon className={`w-3 h-3 ${solarTimeMode === 'night' ? 'text-[#0A0908]' : 'text-[#C9A86A]'}`} />
                    <span className="hidden xl:inline">8:30 PM</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="font-meta text-[8.5px] sm:text-[9.5px] px-2.5 sm:px-3 py-1 sm:py-1.5 border border-[#C9A86A]/30 bg-black/50 hover:bg-[#C9A86A]/20 text-[#FAF8F5] transition-colors flex items-center space-x-1 cursor-pointer shadow-xs rounded-full min-h-[28px]"
                  title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla Completa'}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-3 h-3 text-[#C9A86A]" />
                      <span className="hidden sm:inline">REDUCIR</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3 h-3 text-[#C9A86A]" />
                      <span className="hidden sm:inline">ENFOQUE</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="font-meta text-[9px] sm:text-[9.5px] px-3.5 sm:px-4 py-2 sm:py-1.5 border border-[#C9A86A]/40 bg-[#C9A86A]/10 hover:bg-[#C9A86A] hover:text-[#0A0908] text-[#FAF8F5] transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-xs rounded-full min-h-[44px] sm:min-h-[28px]"
                  title="Cerrar Maqueta 3D"
                  aria-label="Cerrar Maqueta 3D"
                >
                  <span className="font-semibold">CERRAR</span>
                  <span className="font-bold">✕</span>
                </button>
              </div>
            </div>

            {/* Modal Body: 3D Viewport + Technical Sidebar */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 relative min-h-0 overflow-y-auto lg:overflow-hidden">
              {/* Main 3D Canvas Viewport - Now Full Width */}
              <div className="col-span-1 lg:col-span-12 relative h-full min-h-[340px] bg-transparent shrink-0 overflow-hidden">
                
                {/* 2D Floor Plan Overlay View */}
                <AnimatePresence>
                  {/* 360 INTERIOR VIRTUAL TOUR OVERLAY */}
                  {viewMode === 'tour360' && (
                    <motion.div
                      key="tour360-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 z-20 bg-[#14120E]"
                    >
                      <VirtualTour360View
                        selectedUnit={selectedUnit}
                        solarTimeMode={solarTimeMode}
                        onSolarTimeChange={setSolarTimeMode}
                        onOpenAdvisor={() => setIsChatOpen(true)}
                        onRequestViewModeChange={(mode) => setViewMode(mode)}
                      />
                    </motion.div>
                  )}

                  {viewMode === 'floorplan' && (
                    <motion.div
                      key="2d-view"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 z-20 bg-[#FAF9F6] flex flex-col pt-16 sm:pt-20 pb-4 px-4 sm:px-12 lg:px-20 overflow-y-auto"
                    >
                      <div className="flex justify-center mb-6 z-30 pointer-events-auto relative mt-4">
                        <div className="flex items-center border border-[#1B1813] bg-white p-1 rounded-full shadow-sm">
                          {selectedUnit.typology !== 'Residencia' ? (
                            <>
                              <button 
                                onClick={() => setPlanType('Social')}
                                className={`font-meta text-[8.5px] sm:text-[9.5px] px-3.5 sm:px-4.5 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer min-h-[30px] flex items-center justify-center ${
                                  planType === 'Social' 
                                    ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold shadow-2xs' 
                                    : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                                }`}
                              >
                                {selectedUnit.typology === 'Jardín' ? 'PLANTA INFERIOR (SOCIAL)' : 'PLANTA PRINCIPAL'}
                              </button>
                              <button 
                                onClick={() => setPlanType('Privada')}
                                className={`font-meta text-[8.5px] sm:text-[9.5px] px-3.5 sm:px-4.5 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer min-h-[30px] flex items-center justify-center ${
                                  planType === 'Privada' 
                                    ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold shadow-2xs' 
                                    : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                                }`}
                              >
                                {selectedUnit.typology === 'Jardín' ? 'PLANTA SUPERIOR (PRIVADA)' : 'NIVEL DE HABITACIONES'}
                              </button>
                            </>
                          ) : (
                            <span className="font-meta text-[8.5px] sm:text-[9.5px] px-3.5 sm:px-4.5 py-1.5 rounded-full whitespace-nowrap bg-[#1B1813] text-[#EFEBE0] font-semibold min-h-[30px] flex items-center justify-center">
                              PLANTA COMPLETA (UNA PLANTA)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center my-auto">
                        <FloorPlanSchema 
                          typology={selectedUnit.typology as any} 
                          orientation={selectedUnit.orientation as any}
                          planType={planType} 
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* UNLOCKED PRICING & FINANCIAL SCHEDULE OVERLAY */}
                  {viewMode === 'pricing' && (
                    <motion.div
                      key="pricing-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.35 }}
                      className="absolute inset-0 z-20 bg-[#FAF9F6] flex flex-col p-4 sm:p-8 md:p-10 overflow-y-auto"
                    >
                      {/* Header of Pricing Screen */}
                      <div className="max-w-5xl mx-auto w-full space-y-6">
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#C9C4B5] pb-4 gap-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-[#8C7452]"></span>
                              <span className="font-meta text-[9.5px] text-[#8C7452] tracking-[0.22em] uppercase font-semibold">
                                LISTA OFICIAL DE PRECIOS DE PREVENTA
                              </span>
                            </div>
                            <h2 className="font-display text-2xl sm:text-3xl text-[#1B1813] mt-1">
                              Matriz Financiera & Valuación por Residencia
                            </h2>
                          </div>

                          <div className="bg-[#1B1813] text-[#EFEBE0] px-4 py-2 rounded-full text-xs font-meta flex items-center space-x-2 self-start md:self-auto">
                            <Unlock className="w-3.5 h-3.5 text-[#8C7452]" />
                            <span>Acreditado: {credentials?.holderName || activeLead?.fullName || 'Comprador Registrado'}</span>
                          </div>
                        </div>

                        {/* 8 Units Complete Pricing Table */}
                        <div className="bg-white rounded-2xl border border-[#C9C4B5] overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-serif">
                              <thead className="bg-[#1B1813] text-[#EFEBE0] font-meta text-[9px] uppercase tracking-wider">
                                <tr>
                                  <th className="p-3">Unidad</th>
                                  <th className="p-3">Nivel</th>
                                  <th className="p-3 text-right">Int. / Ext.</th>
                                  <th className="p-3 text-right">Total m²</th>
                                  <th className="p-3 text-right">USD / m²</th>
                                  <th className="p-3 text-right">Precio Total USD</th>
                                  <th className="p-3 text-right">Reserva (10%)</th>
                                  <th className="p-3 text-center">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#C9C4B5]/40 font-mono text-[11px]">
                                {UNITS_DATA.map((u) => {
                                  const isCurrent = u.id === selectedUnit.id;
                                  const extArea = (u.terraceArea || 0) + (u.gardenArea || 0);
                                  const unitRate = u.typology === 'Mirador' ? 3600 : u.typology === 'Jardín' ? 2950 : 3300;
                                  const unitTotal = Math.round(u.totalArea * unitRate);
                                  return (
                                    <tr
                                      key={u.id}
                                      onClick={() => onSelectUnit(u)}
                                      className={`transition-colors cursor-pointer ${
                                        isCurrent
                                          ? 'bg-[#8C7452]/15 font-semibold text-[#1B1813]'
                                          : 'hover:bg-[#FAF9F6] text-[#1B1813]'
                                      }`}
                                    >
                                      <td className="p-3 font-display text-xs text-[#1B1813]">{u.name}</td>
                                      <td className="p-3 font-meta text-[10px] text-[#8C8678]">{u.level}</td>
                                      <td className="p-3 text-right text-[#8C8678]">
                                        {u.interiorArea}m² / {extArea > 0 ? `${extArea}m²` : '—'}
                                      </td>
                                      <td className="p-3 text-right font-bold text-[#1B1813]">{u.totalArea} m²</td>
                                      <td className="p-3 text-right text-[#8C7452]">
                                        ${unitRate.toLocaleString('es-VE')}
                                      </td>
                                      <td className="p-3 text-right font-bold text-[#1B1813]">
                                        ${unitTotal.toLocaleString('es-VE')}
                                      </td>
                                      <td className="p-3 text-right text-[#8C8678]">
                                        ${Math.round(unitTotal * 0.1).toLocaleString('es-VE')}
                                      </td>
                                      <td className="p-3 text-center">
                                        <span
                                          className={`font-meta text-[8.5px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                            u.status === 'disponible'
                                              ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/30 font-semibold'
                                              : u.status === 'en_reserva'
                                              ? 'bg-[#E65100]/10 text-[#E65100] border border-[#E65100]/30'
                                              : 'bg-[#C9C4B5]/30 text-[#8C8678]'
                                          }`}
                                        >
                                          {u.status === 'disponible' ? 'Disponible' : u.status === 'en_reserva' ? 'En Reserva' : 'Comprometida'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Escrow Payment Milestones Schedule */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-5 rounded-2xl border border-[#C9C4B5] space-y-3">
                            <span className="font-meta text-[9px] text-[#8C7452] uppercase tracking-wider block">
                              ESTRUCTURA DE PAGO FIDUCIARIO
                            </span>
                            <h3 className="font-display text-lg text-[#1B1813]">
                              7 Hitos Certificados en Cuenta Escrow
                            </h3>
                            <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
                              Los fondos permanecen protegidos bajo fideicomiso y únicamente son desembolsados contra certificación técnica de avance avalada por la dirección de obra de Añil Arquitectura.
                            </p>
                            
                            <div className="space-y-2 pt-2 text-xs font-serif">
                              {[
                                { label: '01 · Señal de Reserva (Hold Privado)', pct: '10%' },
                                { label: '02 · Firma de Opción a Compra y Registro', pct: '15%' },
                                { label: '03 · Culminación de Estructura de Concreto', pct: '15%' },
                                { label: '04 · Fachadas y Cerramientos de Travertino', pct: '15%' },
                                { label: '05 · Instalaciones MEP y Respaldo Total', pct: '15%' },
                                { label: '06 · Acabados Nobles e Interiores', pct: '15%' },
                                { label: '07 · Protocolización y Entrega de Llaves', pct: '15%' },
                              ].map((step, i) => (
                                <div key={i} className="flex justify-between py-1 border-b border-[#C9C4B5]/40 text-[#1B1813]">
                                  <span className="text-xs">{step.label}</span>
                                  <span className="font-mono font-bold text-[#8C7452]">{step.pct}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Direct Advisory & WhatsApp Action Box */}
                          <div className="bg-[#1B1813] text-[#EFEBE0] p-6 rounded-2xl border border-[#8C7452]/40 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <span className="font-meta text-[9px] text-[#8C7452] uppercase tracking-widest block">
                                ATENCIÓN DIRECTA A COMPRADORES
                              </span>
                              <h3 className="font-display text-xl text-[#FAF8F5]">
                                Concertar Sesión con Añil Arquitectura
                              </h3>
                              <p className="font-serif text-xs text-[#C9C4B5] leading-relaxed">
                                Consulte opciones de personalización espacial, visitas privadas al showroom o emita una carta de interés (LOI) sobre <strong>{selectedUnit.name}</strong>.
                              </p>
                            </div>

                            <div className="space-y-2.5 pt-2">
                              <a
                                href={`https://wa.me/584140000000?text=Hola,%20me%20comunico%20desde%20el%20Visor%203D%20de%20Residencias%20Caron%C3%AD.%20Mi%20nombre%20es%20${encodeURIComponent(credentials?.holderName || activeLead?.fullName || 'Comprador')}%20y%20deseo%20consultar%20disponibilidad%20sobre%20${encodeURIComponent(selectedUnit.name)}.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#8C7452] hover:bg-[#A38760] text-[#0C0B0A] font-meta font-bold text-xs py-3 px-5 rounded-full flex items-center justify-center space-x-2 transition-all cursor-pointer"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>CONSULTAR ASESOR VÍA WHATSAPP</span>
                              </a>

                              <button
                                onClick={() => setViewMode('assembled')}
                                className="w-full bg-white/10 hover:bg-white/20 text-[#EFEBE0] border border-white/20 font-meta text-xs py-3 px-5 rounded-full flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                              >
                                <Building2 className="w-4 h-4 text-[#8C7452]" />
                                <span>VOLVER A LA MAQUETA 3D</span>
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3D ENGINE */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${(viewMode === 'assembled' || viewMode === 'exploded') ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                  {hasWebGLError ? (
                    <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between overflow-y-auto bg-transparent">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C9C4B5] pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-[#8C7452]" />
                          <span className="font-meta text-[9px] text-[#1B1813] font-semibold">
                            ESTUDIO ESTRATIGRÁFICO VECTORIAL
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setHasWebGLError(false);
                            setRetryKey((k) => k + 1);
                          }}
                          className="font-meta text-[8.5px] px-2.5 py-1 bg-[#1B1813] text-[#EFEBE0] hover:bg-[#8C7452] transition-colors cursor-pointer"
                        >
                          REINTENTAR RENDER 3D ↺
                        </button>
                      </div>
                      
                      <div className="my-auto py-2 flex items-center justify-center">
                        <ArchitecturalElevation
                          className="max-h-[300px] sm:max-h-[380px] w-full"
                          highlightLevel={activeFloorFilter === 'ALL' ? undefined : activeFloorFilter}
                          selectedUnitId={selectedUnit.id}
                          onSelectUnitId={(uId) => {
                            const found = UNITS_DATA.find((u) => u.id === uId);
                            if (found) onSelectUnit(found);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      ref={mountRef}
                      className="w-full h-full cursor-architectural-orbit relative overflow-hidden"
                    />
                  )}

                  {/* Hover HUD Tooltip */}
                  {hoverTooltip && (
                    <div
                      style={{
                        left: `${Math.min(hoverTooltip.x + 14, (mountRef.current?.clientWidth || 600) - 200)}px`,
                        top: `${Math.max(hoverTooltip.y - 50, 15)}px`,
                      }}
                      className="absolute z-30 pointer-events-none bg-[#14120E]/90 backdrop-blur-md text-[#FAF8F5] border border-[#C9A86A]/40 rounded-xl px-3.5 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-display text-xs text-[#FAF8F5] font-semibold">{hoverTooltip.unit.name}</span>
                        <span className="font-mono text-[9.5px] text-[#C9A86A] font-bold">{hoverTooltip.unit.level}</span>
                      </div>
                      <div className="font-mono text-[10px] text-[#C9C4B5] font-medium mt-0.5">
                        {hoverTooltip.unit.totalArea.toLocaleString('es-VE', { minimumFractionDigits: 2 })} m² · {hoverTooltip.unit.rooms} hab
                      </div>
                    </div>
                  )}

                  {/* Top Overlay: Stratum Filter Bar */}
                  <div className={`absolute top-2 left-2 right-2 sm:left-4 sm:right-auto flex flex-wrap items-center justify-between sm:justify-start gap-2 pointer-events-none z-30 transition-opacity duration-300 ${(viewMode === 'assembled' || viewMode === 'exploded') ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="bg-[#14120E]/90 backdrop-blur-md border border-[#C9A86A]/30 rounded-2xl p-1.5 sm:p-2 flex flex-col gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] pointer-events-auto max-w-full overflow-hidden">
                      <div className="flex items-center justify-between px-1">
                        <span className="font-meta text-[8px] sm:text-[9px] text-[#C9C4B5] tracking-wider uppercase">
                          Estratos en corte
                        </span>
                        <span className="font-meta text-[8.5px] sm:text-[9.5px] text-[#C9A86A] font-semibold">
                          {activeFloorFilter}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
                        {[
                          { id: 'ALL', label: 'TODOS' },
                          { id: 'PB', label: 'PB DÚPLEX' },
                          { id: 'P2', label: 'P2' },
                          { id: 'P3', label: 'P3' },
                          { id: 'MIRADOR', label: 'MIRADORES' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setActiveFloorFilter(f.id as any)}
                            className={`font-meta text-[8.5px] sm:text-[9.5px] px-2.5 sm:px-3 py-1 border rounded-full whitespace-nowrap transition-all cursor-pointer min-h-[26px] flex items-center justify-center ${
                              activeFloorFilter === f.id
                                ? 'bg-[#C9A86A] text-[#0A0908] border-[#C9A86A] font-bold shadow-xs'
                                : 'bg-black/40 text-[#C9C4B5] border-white/10 hover:border-[#C9A86A]/50 hover:text-white'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Consolidated Dock: Camera Views + Rotate 360 + Zoom Controls */}
                  <div className={`absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-30 transition-opacity duration-300 ${(viewMode === 'assembled' || viewMode === 'exploded') ? 'opacity-100' : 'opacity-0'}`}>
                    
                    {/* Left Group: Camera Presets & Orbit Toggle */}
                    <div className="bg-[#14120E]/90 backdrop-blur-md border border-[#C9A86A]/30 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.6)] pointer-events-auto max-w-full overflow-x-auto no-scrollbar">
                      <span className="font-meta text-[8px] sm:text-[9px] text-[#C9C4B5] tracking-wider uppercase shrink-0 hidden md:inline">
                        Perspectiva:
                      </span>
                      <div className="flex items-center gap-1">
                        {[
                          { id: 'iso', label: 'ISOMÉTRICA' },
                          { id: 'north', label: 'NORTE (ÁVILA)' },
                          { id: 'south', label: 'SUR' },
                          { id: 'top', label: 'PLANTA' },
                        ].map((cam) => (
                          <button
                            key={cam.id}
                            onClick={() => setCameraPreset(cam.id as any)}
                            className={`font-meta text-[8px] sm:text-[9px] px-2 sm:px-2.5 py-1 border rounded-full whitespace-nowrap transition-all cursor-pointer min-h-[26px] flex items-center justify-center ${
                              cameraView === cam.id
                                ? 'bg-[#C9A86A] text-[#0A0908] border-[#C9A86A] font-bold shadow-xs'
                                : 'bg-black/40 text-[#C9C4B5] border-white/10 hover:border-[#C9A86A]/50 hover:text-white'
                            }`}
                          >
                            {cam.label}
                          </button>
                        ))}

                        {/* 360 Rotate Button */}
                        <button
                          onClick={() => setIsRotating(!isRotating)}
                          className={`font-meta text-[8px] sm:text-[9px] px-2.5 py-1 border rounded-full whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer min-h-[26px] ${
                            isRotating
                              ? 'bg-[#C9A86A] text-[#0A0908] border-[#C9A86A] font-bold shadow-xs'
                              : 'bg-black/40 text-[#C9C4B5] border-white/10 hover:border-[#C9A86A]/50 hover:text-white'
                          }`}
                        >
                          <span>{isRotating ? '■' : '▶'}</span>
                          <span>{isRotating ? 'PAUSA' : '360°'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Group: Zoom In / Zoom Out / Reset View */}
                    <div className="bg-[#14120E]/90 backdrop-blur-md border border-[#C9A86A]/30 rounded-full px-2 py-1 flex flex-row items-center gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] pointer-events-auto">
                      <button
                        onClick={() => handleZoomChange(10)}
                        title="Alejar modelo"
                        className="font-mono text-sm w-7 h-7 flex items-center justify-center rounded-full border border-white/10 bg-black/40 hover:bg-[#C9A86A] hover:text-[#0A0908] text-[#FAF8F5] transition-all cursor-pointer active:scale-95"
                      >
                        −
                      </button>
                      <button
                        onClick={handleResetView}
                        title="Encuadre inicial estándar"
                        className="font-meta text-[8px] sm:text-[9px] px-2.5 h-7 flex items-center justify-center rounded-full border border-white/10 bg-black/40 hover:border-[#C9A86A] hover:text-[#C9A86A] text-[#C9C4B5] transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        REAJUSTAR
                      </button>
                      <button
                        onClick={() => handleZoomChange(-10)}
                        title="Acercar modelo"
                        className="font-mono text-sm w-7 h-7 flex items-center justify-center rounded-full border border-white/10 bg-black/40 hover:bg-[#C9A86A] hover:text-[#0A0908] text-[#FAF8F5] transition-all cursor-pointer active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Floating AI Advisor Button */}
                  <div className={`absolute bottom-16 sm:bottom-20 right-3 z-40 pointer-events-auto transition-opacity duration-300 ${(viewMode !== 'assembled' && viewMode !== 'exploded') || isChatOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="bg-[#1B1813] hover:bg-[#8C7452] text-[#EFEBE0] shadow-[0_10px_30px_rgba(27,24,19,0.3)] border border-[#8C7452]/50 rounded-2xl px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 transition-all cursor-pointer group hover:scale-105 active:scale-95"
                      title="Abrir Chatbot / Agente IA con el contexto de este piso"
                    >
                      <div className="bg-[#8C7452] p-1.5 rounded-full shadow-inner">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1B1813]" />
                      </div>
                      <div className="flex flex-col text-left leading-none">
                        <span className="font-meta text-[8px] sm:text-[9px] tracking-wider text-[#C9C4B5] mb-0.5 uppercase">Consultar Asesor IA</span>
                        <span className="font-display text-[10px] sm:text-xs font-semibold text-white tracking-wide truncate max-w-[120px] sm:max-w-[180px]">Analizar {selectedUnit.level}</span>
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* AI Chatbot Overlay - Root Level in Modal */}
            <AIChatbot 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)} 
              selectedUnit={selectedUnit} 
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
