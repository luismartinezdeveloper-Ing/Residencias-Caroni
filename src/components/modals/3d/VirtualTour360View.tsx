import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import {
  Compass,
  Volume2,
  VolumeX,
  DoorOpen,
  X,
  Sparkles,
  Sun,
  Moon,
  ArrowUpRight,
  RotateCw,
  Smartphone,
  Glasses,
  HelpCircle,
  Eye,
  CheckCircle2,
  Sliders,
  Zap,
  ShieldCheck,
  RefreshCw,
  Mic
} from 'lucide-react';
import { UnitData } from '../../../types/brand';
import { TOUR_ROOMS_DATA, TourHotspot } from '../../../data/virtualTourData';
import {
  generateEquirectangularPanorama,
  generateEquirectangularPanoramaAsync,
  PanoramaQuality,
  AsyncPanoramaProgress
} from '../../../utils/panoramaGenerator';
import { TourAudioAmbiance } from '../../../utils/tourAudioAmbiance';
import { SolarTimeMode } from './ArchitecturalScene';
import { build3DInteriorRoom, Apartment3DEnvironment } from './Apartment3DInterior';
import { WebXrTeleportManager } from './WebXrTeleportManager';
import { VoiceNavigationController, VoiceNavigationCommand, VoiceFeedback } from '../../../utils/voiceNavigationController';
import { VoiceControlHUD } from '../../ui/VoiceControlHUD';

export type VrImmersionState = 'idle' | 'confirming' | 'loading' | 'active' | 'error';

interface VirtualTour360ViewProps {
  selectedUnit: UnitData;
  solarTimeMode: SolarTimeMode;
  onSolarTimeChange?: (mode: SolarTimeMode) => void;
  onOpenAdvisor?: () => void;
  onRequestViewModeChange?: (mode: 'assembled' | 'exploded' | 'tour360' | 'floorplan' | 'pricing') => void;
}

export const VirtualTour360View: React.FC<VirtualTour360ViewProps> = ({
  selectedUnit,
  solarTimeMode,
  onSolarTimeChange,
  onOpenAdvisor,
  onRequestViewModeChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const radarConeRef = useRef<HTMLDivElement>(null);
  const hotspotElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Room & Visual States
  const [activeRoomId, setActiveRoomId] = useState<string>('salon');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [selectedSpecHotspot, setSelectedSpecHotspot] = useState<TourHotspot | null>(null);
  const [isGyroActive, setIsGyroActive] = useState<boolean>(false);

  // VR Immersion State Manager & Configuration
  const [vrState, setVrState] = useState<VrImmersionState>('idle');
  const [vrQuality, setVrQuality] = useState<PanoramaQuality>('optimal');
  const [vrEnableAudio, setVrEnableAudio] = useState<boolean>(true);
  const [vrEnableGyro, setVrEnableGyro] = useState<boolean>(true);
  const [vrLoadingProgress, setVrLoadingProgress] = useState<number>(0);
  const [vrLoadingStatus, setVrLoadingStatus] = useState<string>('');
  const [vrErrorMessage, setVrErrorMessage] = useState<string | null>(null);

  // 3D VR & Stereoscopic Display States
  const [isVrStereoMode, setIsVrStereoMode] = useState<boolean>(false);
  const [isWebXrSupported, setIsWebXrSupported] = useState<boolean>(false);
  const [isWebXrSessionActive, setIsWebXrSessionActive] = useState<boolean>(false);
  const [vrRefreshRate, setVrRefreshRate] = useState<number>(90);
  const [vrFps, setVrFps] = useState<number>(90);
  const [showVrHelp, setShowVrHelp] = useState<boolean>(false);
  const [gazeProgress, setGazeProgress] = useState<number>(0); // 0 to 100
  const [activeGazeTargetTitle, setActiveGazeTargetTitle] = useState<string | null>(null);

  // WebXR Hardware Teleport Manager Reference
  const webXrTeleportManagerRef = useRef<WebXrTeleportManager | null>(null);

  const currentRoom = useMemo(
    () => TOUR_ROOMS_DATA.find((r) => r.id === activeRoomId) || TOUR_ROOMS_DATA[0],
    [activeRoomId]
  );

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const stereoCameraRef = useRef<THREE.StereoCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const sphereTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const apartmentInteriorRef = useRef<Apartment3DEnvironment | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioAmbianceRef = useRef<TourAudioAmbiance | null>(null);

  // VR Visual tuning parameters
  const [vrExposure, setVrExposure] = useState<number>(1.0);
  const [vrFovPreset, setVrFovPreset] = useState<'normal' | 'wide' | 'ultra'>('wide');

  // Voice Navigation State
  const voiceControllerRef = useRef<VoiceNavigationController | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedback | null>(null);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<VoiceNavigationCommand | null>(null);

  // Gaze dwell timer & state refs
  const gazeRef = useRef<{
    targetId: string | null;
    targetType: 'portal' | 'spec' | 'room' | null;
    targetRoomId?: string;
    hotspotData?: TourHotspot;
    startTime: number | null;
    dwellDurationMs: number;
  }>({
    targetId: null,
    targetType: null,
    startTime: null,
    dwellDurationMs: 1300, // 1.3s gaze dwell
  });

  // Smooth Camera Orientation Controls
  const controlsRef = useRef({
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    yaw: currentRoom.initialYaw || 0,
    pitch: currentRoom.initialPitch || 0,
    targetYaw: currentRoom.initialYaw || 0,
    targetPitch: currentRoom.initialPitch || 0,
    fov: 70,
    targetFov: 70,
    activeRoomId: activeRoomId,
    isVrStereo: false,
  });

  // Sync ref flags
  useEffect(() => {
    controlsRef.current.activeRoomId = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    controlsRef.current.isVrStereo = isVrStereoMode;
  }, [isVrStereoMode]);

  const isAutoRotatingRef = useRef(false);
  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  // Audio Ambiance & Sound Effects
  useEffect(() => {
    audioAmbianceRef.current = new TourAudioAmbiance();
    return () => {
      audioAmbianceRef.current?.stop();
    };
  }, []);

  // Silent interaction callback (gaming beeps removed for clean architectural luxury experience)
  const playClickChime = useCallback(() => {}, []);

  const toggleAudio = () => {
    if (!audioAmbianceRef.current) return;
    if (isAudioPlaying) {
      audioAmbianceRef.current.stop();
      setIsAudioPlaying(false);
    } else {
      audioAmbianceRef.current.start();
      setIsAudioPlaying(true);
    }
  };

  // Check WebXR Capability on Mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr.isSessionSupported('immersive-vr')
        .then((supported: boolean) => {
          setIsWebXrSupported(supported);
        })
        .catch(() => {
          setIsWebXrSupported(false);
        });
    }
  }, []);

  // Update sphere texture synchronously or asynchronously
  const applyTextureToSphere = useCallback((canvas: HTMLCanvasElement) => {
    if (!sphereMeshRef.current) return;

    if (sphereTextureRef.current) {
      sphereTextureRef.current.dispose();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    sphereTextureRef.current = texture;

    const mat = sphereMeshRef.current.material as THREE.MeshBasicMaterial;
    mat.map = texture;
    mat.needsUpdate = true;
  }, []);

  // Dynamic 3D Interior Apartment Geometry Loader
  const load3DRoomInterior = useCallback((roomId: string, mode: SolarTimeMode) => {
    if (!sceneRef.current) return;
    if (apartmentInteriorRef.current) {
      sceneRef.current.remove(apartmentInteriorRef.current.group);
      apartmentInteriorRef.current.dispose();
      apartmentInteriorRef.current = null;
    }
    try {
      const interior = build3DInteriorRoom(roomId, mode);
      sceneRef.current.add(interior.group);
      apartmentInteriorRef.current = interior;

      if (webXrTeleportManagerRef.current) {
        webXrTeleportManagerRef.current.clearFloorMeshes();
        interior.group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            if (obj.name.toLowerCase().includes('floor') || (obj.geometry instanceof THREE.PlaneGeometry && obj.position.y <= 0.1)) {
              webXrTeleportManagerRef.current?.registerFloorMesh(obj);
            }
          }
        });
      }
    } catch (err) {
      console.warn('Error constructing 3D room interior:', err);
    }
  }, []);

  // Check native WebXR hardware availability on mount
  useEffect(() => {
    WebXrTeleportManager.isSupported().then((supported) => {
      setIsWebXrSupported(supported);
    });
  }, []);

  // Standard synchronous texture updater for 2D mode
  const updateSphereTexture = useCallback(
    (roomId: string, mode: SolarTimeMode, quality: PanoramaQuality = 'optimal') => {
      try {
        load3DRoomInterior(roomId, mode);
        const panoramaCanvas = generateEquirectangularPanorama({
          roomId,
          solarMode: mode,
          quality,
        });
        applyTextureToSphere(panoramaCanvas);
      } catch (err) {
        console.error('Error generating 360 panorama texture:', err);
      }
    },
    [applyTextureToSphere, load3DRoomInterior]
  );

  // Change room smoothly
  const handleSelectRoom = useCallback(
    async (roomId: string) => {
      const targetRoom = TOUR_ROOMS_DATA.find((r) => r.id === roomId);
      if (!targetRoom) return;

      playClickChime();
      setActiveRoomId(roomId);
      setSelectedSpecHotspot(null);

      // Reset gaze timer
      gazeRef.current.targetId = null;
      gazeRef.current.startTime = null;
      setGazeProgress(0);
      setActiveGazeTargetTitle(null);

      controlsRef.current.targetYaw = targetRoom.initialYaw || 0;
      controlsRef.current.targetPitch = targetRoom.initialPitch || 0;

      // In active VR mode, load texture asynchronously without blocking render loop
      if (isVrStereoMode) {
        try {
          const canvas = await generateEquirectangularPanoramaAsync({
            roomId,
            solarMode: solarTimeMode,
            quality: vrQuality,
          });
          applyTextureToSphere(canvas);
        } catch {
          updateSphereTexture(roomId, solarTimeMode, vrQuality);
        }
      }
    },
    [playClickChime, isVrStereoMode, solarTimeMode, vrQuality, applyTextureToSphere, updateSphereTexture]
  );

  // Mobile Device Orientation (Gyroscope) with strict NaN guards
  const enableDeviceOrientation = useCallback(() => {
    setIsGyroActive(true);
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (
        typeof e.alpha === 'number' &&
        !isNaN(e.alpha) &&
        typeof e.beta === 'number' &&
        !isNaN(e.beta)
      ) {
        controlsRef.current.targetYaw = -e.alpha;
        controlsRef.current.targetPitch = Math.max(-80, Math.min(80, e.beta - 45));
      }
    };
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
  }, []);

  const handleToggleGyro = async () => {
    if (isGyroActive) {
      setIsGyroActive(false);
      return;
    }

    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm === 'granted') {
          enableDeviceOrientation();
        } else {
          console.warn('Permiso de giroscopio no concedido por el usuario');
        }
      } catch (err) {
        console.warn('Gyro permission error en iOS:', err);
      }
    } else {
      enableDeviceOrientation();
    }
  };

  // ================= VR ASYNC IMMERSION LAUNCHER =================
  const handleStartVrImmersion = async () => {
    setVrState('loading');
    setVrLoadingProgress(10);
    setVrLoadingStatus('Inicializando pipeline WebGL estereoscópico...');
    setVrErrorMessage(null);

    try {
      // 1. Asynchronously generate 360 environment with chosen quality without blocking main thread
      const canvas = await generateEquirectangularPanoramaAsync(
        {
          roomId: activeRoomId,
          solarMode: solarTimeMode,
          quality: vrQuality,
        },
        (progress: AsyncPanoramaProgress) => {
          // Map 15-100% generator progress to 20-90% UI progress
          const mapped = 20 + Math.round((progress.percentage / 100) * 70);
          setVrLoadingProgress(mapped);
          setVrLoadingStatus(progress.statusText);
        }
      );

      // 2. Upload texture to GPU
      setVrLoadingProgress(92);
      setVrLoadingStatus('Cargando textura panorámica en memoria VRAM...');
      applyTextureToSphere(canvas);

      // 3. Pre-warm WebGL shader program and camera projections
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.compile(sceneRef.current, cameraRef.current);
      }

      // 4. Activate sensors and audio if selected
      if (vrEnableAudio && !isAudioPlaying && audioAmbianceRef.current) {
        audioAmbianceRef.current.start();
        setIsAudioPlaying(true);
      }

      if (vrEnableGyro) {
        handleToggleGyro();
      }

      // 5. Complete transition
      setVrLoadingProgress(100);
      setVrLoadingStatus('Calibración completa. Iniciando inmersión...');
      
      // Slight delay for smooth visual transition
      setTimeout(() => {
        setIsVrStereoMode(true);
        setVrState('active');
      }, 250);

    } catch (err: any) {
      console.error('Error during VR immersion asset loading:', err);
      setVrErrorMessage(err?.message || 'Error al compilar el entorno inmersivo');
      setVrState('error');
    }
  };

  const handleExitVrImmersion = () => {
    if (webXrTeleportManagerRef.current?.isWebXrActive) {
      webXrTeleportManagerRef.current.endWebXrSession();
    }
    setIsVrStereoMode(false);
    setIsWebXrSessionActive(false);
    setVrState('idle');
    // Restore optimal quality texture
    updateSphereTexture(activeRoomId, solarTimeMode, 'optimal');
  };

  // Open confirmation modal when user requests VR
  const handleRequestVr = () => {
    if (isVrStereoMode) {
      handleExitVrImmersion();
    } else {
      setVrState('confirming');
    }
  };

  // Native WebXR Immersive Session Launch with 90Hz Hardware Refresh & Teleportation
  const handleLaunchWebXr = async () => {
    if (!webXrTeleportManagerRef.current) return;
    try {
      setVrState('loading');
      setVrLoadingStatus('Calibrando sensor 6DoF y fijando tasa de refresco a 90Hz...');
      const success = await webXrTeleportManagerRef.current.startWebXrSession();
      if (success) {
        setIsWebXrSessionActive(true);
        setIsVrStereoMode(true);
        setVrState('active');
      } else {
        console.warn('Native WebXR session not granted, falling back to WebGL stereoscopic VR');
        handleStartVrImmersion();
      }
    } catch (err) {
      console.warn('WebXR launch fallback to stereoscopic 3D:', err);
      handleStartVrImmersion();
    }
  };

  // Voice Navigation Controller initialization and command execution
  useEffect(() => {
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

        if (cmd.type === 'GO_TO_ROOM') {
          handleSelectRoom(cmd.roomId);
        } else if (cmd.type === 'SET_SOLAR_MODE') {
          onSolarTimeChange?.(cmd.mode);
        } else if (cmd.type === 'SET_VIEW_MODE') {
          if (onRequestViewModeChange) {
            onRequestViewModeChange(cmd.mode);
          }
        } else if (cmd.type === 'TOGGLE_ROTATION') {
          setIsAutoRotating((prev) => (cmd.state !== undefined ? cmd.state : !prev));
        } else if (cmd.type === 'TOGGLE_AUDIO') {
          toggleAudio();
        } else if (cmd.type === 'TOGGLE_VR') {
          handleRequestVr();
        } else if (cmd.type === 'ZOOM') {
          if (cmd.direction === 'in') {
            controlsRef.current.targetFov = Math.max(35, controlsRef.current.targetFov - 15);
          } else if (cmd.direction === 'out') {
            controlsRef.current.targetFov = Math.min(100, controlsRef.current.targetFov + 15);
          } else {
            controlsRef.current.targetFov = 70;
          }
        } else if (cmd.type === 'OPEN_ADVISOR') {
          onOpenAdvisor?.();
        }
      },
    });

    return () => {
      controller.destroy();
    };
  }, [handleSelectRoom, onSolarTimeChange, onRequestViewModeChange, onOpenAdvisor]);

  const handleToggleVoiceControl = () => {
    if (voiceControllerRef.current) {
      voiceControllerRef.current.toggleListening();
    }
  };

  // Initialize WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth || container.parentElement?.clientWidth || window.innerWidth || 800, 320);
    const height = Math.max(container.clientHeight || container.parentElement?.clientHeight || window.innerHeight || 600, 240);

    // 1. Scene & Main Perspective Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(0, 1.6, 0); // Eye-level perspective inside 3D apartment
    cameraRef.current = camera;

    // 2. Three.js Standard StereoCamera for 3D Stereoscopic VR
    const stereoCamera = new THREE.StereoCamera();
    stereoCamera.eyeSep = 0.064; // Standard 64mm Interpupillary Distance
    stereoCameraRef.current = stereoCamera;

    // 3. WebGL Renderer with stability optimizations
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    renderer.debug.checkShaderErrors = false;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3b. WebXR Teleportation & Hardware 90Hz Manager
    const webXrMgr = new WebXrTeleportManager({
      renderer,
      scene,
      camera,
      onRoomChange: (newRoomId) => {
        handleSelectRoom(newRoomId);
      },
      onFpsUpdate: (fps, targetHz) => {
        setVrFps(fps);
        setVrRefreshRate(targetHz);
      },
      onSessionStateChange: (active, frameRate) => {
        setIsWebXrSessionActive(active);
        if (active) {
          setIsVrStereoMode(true);
          setVrState('active');
          setVrRefreshRate(frameRate);
        } else {
          setIsVrStereoMode(false);
          setVrState('idle');
        }
      },
    });
    webXrTeleportManagerRef.current = webXrMgr;

    // Handle WebGL Context Loss & Restoration for high stability
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost. Pausing rendering loop until restoration...');
      if (rendererRef.current) {
        rendererRef.current.setAnimationLoop(null);
      }
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored. Rebuilding shaders and textures...');
      updateSphereTexture(activeRoomId, solarTimeMode, vrQuality);
    };

    const domCanvas = renderer.domElement;
    domCanvas.addEventListener('webglcontextlost', handleContextLost, false);
    domCanvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // 4. Panoramic Inverted Sphere (Outside Vista 360)
    const sphereGeometry = new THREE.SphereGeometry(140, 64, 40);
    sphereGeometry.scale(-1, 1, 1); // Invert geometry inside-out

    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // 4b. Ambient 3D Spatial Particle Cloud for Natural Stereoscopic Depth in VR
    const particleCount = 160;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 55 + 15; // Floating in radius 15 to 70 units

      const sinPhi = Math.sin(phi);
      particlePositions[i * 3] = r * sinPhi * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.cos(phi);
      particlePositions[i * 3 + 2] = r * sinPhi * Math.sin(theta);
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffeac2,
      size: 1.1,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesMesh);
    particlesMeshRef.current = particlesMesh;

    // Initial texture load
    updateSphereTexture(activeRoomId, solarTimeMode, 'optimal');

    // 5. Animation & Spatial Gaze Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update WebXR Teleportation, Controller Raycasting, & 90Hz Physics Loop
      if (webXrTeleportManagerRef.current) {
        webXrTeleportManagerRef.current.update(time);
      }

      const cState = controlsRef.current;

      // Ensure no NaN values contaminate camera orientation
      if (!isFinite(cState.targetYaw) || isNaN(cState.targetYaw)) cState.targetYaw = 0;
      if (!isFinite(cState.targetPitch) || isNaN(cState.targetPitch)) cState.targetPitch = 0;
      if (!isFinite(cState.yaw) || isNaN(cState.yaw)) cState.yaw = cState.targetYaw;
      if (!isFinite(cState.pitch) || isNaN(cState.pitch)) cState.pitch = cState.targetPitch;
      if (!isFinite(cState.fov) || isNaN(cState.fov) || cState.fov < 20 || cState.fov > 120) {
        cState.fov = 70;
        cState.targetFov = 70;
      }

      // Auto rotation (only in flat 2D mode when not dragging)
      if (isAutoRotatingRef.current && !cState.isDragging && !cState.isVrStereo) {
        cState.targetYaw += delta * 12; // 12 deg/s
      }

      // Smooth interpolation damping
      cState.yaw += (cState.targetYaw - cState.yaw) * 0.14;
      cState.pitch += (cState.targetPitch - cState.pitch) * 0.14;
      cState.fov += (cState.targetFov - cState.fov) * 0.15;

      // Clamp pitch (-85 to 85)
      cState.pitch = Math.max(-85, Math.min(85, cState.pitch));
      cState.targetPitch = Math.max(-85, Math.min(85, cState.targetPitch));

      camera.fov = cState.fov;

      // Ambient spatial depth particles subtle motion in VR
      if (particlesMeshRef.current) {
        particlesMeshRef.current.rotation.y = time * 0.00004;
        particlesMeshRef.current.rotation.x = Math.sin(time * 0.00003) * 0.05;
      }

      // Convert Pitch / Yaw to 3D Camera LookAt Vector
      const phi = THREE.MathUtils.degToRad(90 - cState.pitch);
      const theta = THREE.MathUtils.degToRad(cState.yaw);

      const target = new THREE.Vector3(
        camera.position.x + 500 * Math.sin(phi) * Math.cos(theta),
        camera.position.y + 500 * Math.cos(phi),
        camera.position.z + 500 * Math.sin(phi) * Math.sin(theta)
      );

      camera.lookAt(target);

      // ================= VR Gaze-Dwell Interaction Calculation =================
      const currentRoomData = TOUR_ROOMS_DATA.find((r) => r.id === cState.activeRoomId);
      let detectedGazeHotspot: TourHotspot | null = null;

      if (cState.isVrStereo && currentRoomData) {
        // Compute forward look direction vector normalized
        const lookDir = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta)
        ).normalize();

        for (const h of currentRoomData.hotspots) {
          const hPhi = THREE.MathUtils.degToRad(90 - h.pitch);
          const hTheta = THREE.MathUtils.degToRad(h.yaw);
          const hVec = new THREE.Vector3(
            Math.sin(hPhi) * Math.cos(hTheta),
            Math.cos(hPhi),
            Math.sin(hPhi) * Math.sin(hTheta)
          ).normalize();

          // Angle tolerance: ~14 degrees (dot > 0.97)
          const dot = lookDir.dot(hVec);
          if (dot > 0.97) {
            detectedGazeHotspot = h;
            break;
          }
        }

        // Process Gaze Timer
        if (detectedGazeHotspot) {
          if (gazeRef.current.targetId === detectedGazeHotspot.id) {
            if (gazeRef.current.startTime) {
              const elapsed = performance.now() - gazeRef.current.startTime;
              const progress = Math.min(100, (elapsed / gazeRef.current.dwellDurationMs) * 100);
              setGazeProgress(progress);

              // Gaze Completed! Trigger Action
              if (progress >= 100) {
                if (detectedGazeHotspot.type === 'portal' && detectedGazeHotspot.targetRoomId) {
                  handleSelectRoom(detectedGazeHotspot.targetRoomId);
                } else if (detectedGazeHotspot.type === 'spec') {
                  playClickChime();
                  setSelectedSpecHotspot(detectedGazeHotspot);
                  gazeRef.current.targetId = null;
                  gazeRef.current.startTime = null;
                  setGazeProgress(0);
                  setActiveGazeTargetTitle(null);
                }
              }
            }
          } else {
            // New target locked
            gazeRef.current.targetId = detectedGazeHotspot.id;
            gazeRef.current.targetType = detectedGazeHotspot.type;
            gazeRef.current.startTime = performance.now();
            setActiveGazeTargetTitle(detectedGazeHotspot.title);
            setGazeProgress(5);
          }
        } else {
          // No target in gaze
          if (gazeRef.current.targetId) {
            gazeRef.current.targetId = null;
            gazeRef.current.startTime = null;
            setGazeProgress(0);
            setActiveGazeTargetTitle(null);
          }
        }
      }

      // ================= WebXR Native vs Stereoscopic Dual-Viewport vs Monoscopic Render =================
      if (renderer.xr.isPresenting) {
        // Native WebXR Hardware Direct Stereoscopic Render (90Hz Target)
        renderer.render(scene, camera);
      } else if (cState.isVrStereo && container) {
        const fullW = container.clientWidth || window.innerWidth;
        const fullH = container.clientHeight || window.innerHeight;
        const halfW = Math.floor(fullW / 2);

        // Set eye camera aspect ratio (half width per eye)
        camera.aspect = halfW / Math.max(fullH, 1);
        camera.updateProjectionMatrix();

        if (stereoCameraRef.current) {
          stereoCameraRef.current.update(camera);
          renderer.setScissorTest(true);

          // 1. Render Left Eye Viewport
          renderer.setScissor(0, 0, halfW, fullH);
          renderer.setViewport(0, 0, halfW, fullH);
          renderer.render(scene, stereoCameraRef.current.cameraL);

          // 2. Render Right Eye Viewport
          renderer.setScissor(halfW, 0, halfW, fullH);
          renderer.setViewport(halfW, 0, halfW, fullH);
          renderer.render(scene, stereoCameraRef.current.cameraR);

          renderer.setScissorTest(false);
        } else {
          renderer.render(scene, camera);
        }
      } else {
        // Standard 2D Monoscopic Render
        if (container) {
          const fullW = container.clientWidth || window.innerWidth;
          const fullH = container.clientHeight || window.innerHeight;
          if (fullW > 0 && fullH > 0) {
            camera.aspect = fullW / fullH;
            camera.updateProjectionMatrix();
            renderer.setViewport(0, 0, fullW, fullH);
          }
        }
        renderer.render(scene, camera);
      }

      // Rotate radar vision cone directly via DOM ref
      if (radarConeRef.current) {
        radarConeRef.current.style.transform = `rotate(${-cState.yaw - 90}deg)`;
      }

      // Project hotspots to 2D Screen Coordinates (only in non-VR mode)
      if (container && !cState.isVrStereo) {
        const cWidth = container.clientWidth;
        const cHeight = container.clientHeight;

        if (currentRoomData && cWidth > 0 && cHeight > 0) {
          currentRoomData.hotspots.forEach((h) => {
            const el = hotspotElementsRef.current.get(h.id);
            if (!el) return;

            const hPhi = THREE.MathUtils.degToRad(90 - h.pitch);
            const hTheta = THREE.MathUtils.degToRad(h.yaw);

            const hVec = new THREE.Vector3(
              camera.position.x + 500 * Math.sin(hPhi) * Math.cos(hTheta),
              camera.position.y + 500 * Math.cos(hPhi),
              camera.position.z + 500 * Math.sin(hPhi) * Math.sin(hTheta)
            );

            const screenVec = hVec.clone().project(camera);
            const isVisible = screenVec.z < 1 && screenVec.z > -1;
            const sx = (screenVec.x * 0.5 + 0.5) * cWidth;
            const sy = (-(screenVec.y * 0.5) + 0.5) * cHeight;

            if (isVisible && sx >= -60 && sx <= cWidth + 60 && sy >= -60 && sy <= cHeight + 60) {
              el.style.display = 'block';
              el.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%)`;
            } else {
              el.style.display = 'none';
            }
          });
        }
      } else {
        // Hide standard 2D overlay hotspots in VR mode (they are navigated via reticle gaze)
        hotspotElementsRef.current.forEach((el) => {
          el.style.display = 'none';
        });
      }
    };

    renderer.setAnimationLoop(animate);

    // 6. Responsive Resize Handlers
    const updateDimensions = (w: number, h: number) => {
      if (w <= 0 || h <= 0 || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const handleWindowResize = () => {
      if (!container) return;
      updateDimensions(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleWindowResize);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          updateDimensions(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    const timer1 = setTimeout(() => {
      if (container) updateDimensions(container.clientWidth, container.clientHeight);
    }, 100);

    const timer2 = setTimeout(() => {
      if (container) updateDimensions(container.clientWidth, container.clientHeight);
    }, 350);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      domCanvas.removeEventListener('webglcontextlost', handleContextLost);
      domCanvas.removeEventListener('webglcontextrestored', handleContextRestored);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      if (rendererRef.current) {
        rendererRef.current.setAnimationLoop(null);
        rendererRef.current.dispose();
      }
      if (webXrTeleportManagerRef.current) {
        webXrTeleportManagerRef.current.dispose();
        webXrTeleportManagerRef.current = null;
      }
      if (sphereTextureRef.current) {
        sphereTextureRef.current.dispose();
      }
      if (sphereMeshRef.current) {
        sphereMeshRef.current.geometry.dispose();
      }
      if (particlesMeshRef.current) {
        particlesMeshRef.current.geometry.dispose();
      }
      if (apartmentInteriorRef.current) {
        apartmentInteriorRef.current.dispose();
        apartmentInteriorRef.current = null;
      }
    };
  }, [activeRoomId, solarTimeMode, vrQuality, updateSphereTexture, handleSelectRoom, playClickChime]);

  // Sync 3D lighting when solar time mode changes
  useEffect(() => {
    if (apartmentInteriorRef.current) {
      apartmentInteriorRef.current.updateSolarMode(solarTimeMode);
    }
  }, [solarTimeMode]);

  // Sync texture when active room or solar mode changes in 2D mode
  useEffect(() => {
    if (!isVrStereoMode) {
      updateSphereTexture(activeRoomId, solarTimeMode, 'optimal');
    }
  }, [activeRoomId, solarTimeMode, isVrStereoMode, updateSphereTexture]);

  // Pointer & Drag Interactions (Available in both 2D and VR Mode)
  const handlePointerDown = (e: React.PointerEvent) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported
    }
    controlsRef.current.isDragging = true;
    controlsRef.current.prevMouseX = e.clientX;
    controlsRef.current.prevMouseY = e.clientY;
    setIsAutoRotating(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!controlsRef.current.isDragging) return;

    const deltaX = e.clientX - controlsRef.current.prevMouseX;
    const deltaY = e.clientY - controlsRef.current.prevMouseY;

    controlsRef.current.prevMouseX = e.clientX;
    controlsRef.current.prevMouseY = e.clientY;

    const sensitivity = (controlsRef.current.fov / 70) * 0.16;
    controlsRef.current.targetYaw -= deltaX * sensitivity;
    controlsRef.current.targetPitch += deltaY * sensitivity;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    controlsRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.04;
    const newFov = Math.max(35, Math.min(90, controlsRef.current.targetFov + zoomDelta));
    controlsRef.current.targetFov = newFov;
  };

  return (
    <div className="relative w-full h-full min-h-[360px] flex flex-col select-none overflow-hidden bg-[#14120E] text-[#FAF9F6]">
      {/* ================= 360 WebGL Canvas Viewport ================= */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none relative"
      />

      {/* ================= 3D VR Stereoscopic Split Divider & Dual Reticles ================= */}
      {isVrStereoMode && (
        <div className="absolute inset-0 pointer-events-none z-30 flex">
          {/* Vertical Lens Separator Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-black/80 -translate-x-1/2 z-40" />

          {/* Left Eye Reticle & Spatial HUD */}
          <div className="w-1/2 h-full relative flex items-center justify-center pointer-events-none">
            {/* Gaze Target Info Floating Pill */}
            {activeGazeTargetTitle && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-[#1B1813]/90 border border-[#8C7452] px-3 py-1 rounded-full text-[10px] font-meta uppercase tracking-wider text-[#F5C780] shadow-xl flex items-center gap-1.5 animate-pulse pointer-events-none">
                <Eye className="w-3 h-3 text-[#8C7452]" />
                <span>{activeGazeTargetTitle}</span>
              </div>
            )}

            {/* Circular Progress Ring Gaze Reticle */}
            <div className="relative w-8 h-8 flex items-center justify-center pointer-events-none">
              <svg className="w-8 h-8 -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  className="stroke-[#8C7452]/40"
                  strokeWidth="2"
                  fill="transparent"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  className="stroke-emerald-400 transition-all duration-75"
                  strokeWidth="3"
                  strokeDasharray={75.4}
                  strokeDashoffset={75.4 - (75.4 * gazeProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className={`w-2 h-2 rounded-full transition-transform ${gazeProgress > 0 ? 'bg-emerald-400 scale-125' : 'bg-white/80'}`} />
            </div>

            {/* Left Eye Label */}
            <div className="absolute bottom-6 left-6 font-mono text-[9px] text-[#8C8678] tracking-widest uppercase opacity-60 pointer-events-none">
              OJO IZQ · {currentRoom.name}
            </div>
          </div>

          {/* Right Eye Reticle & Spatial HUD */}
          <div className="w-1/2 h-full relative flex items-center justify-center pointer-events-none">
            {/* Gaze Target Info Floating Pill */}
            {activeGazeTargetTitle && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-[#1B1813]/90 border border-[#8C7452] px-3 py-1 rounded-full text-[10px] font-meta uppercase tracking-wider text-[#F5C780] shadow-xl flex items-center gap-1.5 animate-pulse pointer-events-none">
                <Eye className="w-3 h-3 text-[#8C7452]" />
                <span>{activeGazeTargetTitle}</span>
              </div>
            )}

            {/* Circular Progress Ring Gaze Reticle */}
            <div className="relative w-8 h-8 flex items-center justify-center pointer-events-none">
              <svg className="w-8 h-8 -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  className="stroke-[#8C7452]/40"
                  strokeWidth="2"
                  fill="transparent"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  className="stroke-emerald-400 transition-all duration-75"
                  strokeWidth="3"
                  strokeDasharray={75.4}
                  strokeDashoffset={75.4 - (75.4 * gazeProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className={`w-2 h-2 rounded-full transition-transform ${gazeProgress > 0 ? 'bg-emerald-400 scale-125' : 'bg-white/80'}`} />
            </div>

            {/* Right Eye Label */}
            <div className="absolute bottom-6 right-6 font-mono text-[9px] text-[#8C8678] tracking-widest uppercase opacity-60 pointer-events-none">
              OJO DER · ESTEREO 3D
            </div>
          </div>

          {/* Floating Exit VR & Controls Header */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center gap-2 bg-[#1B1813]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#8C7452]/60 shadow-2xl flex-wrap justify-center max-w-[96vw]">
            <span className="font-meta text-[10px] uppercase text-[#FAF9F6] font-bold tracking-wider flex items-center gap-1.5">
              <Glasses className="w-3.5 h-3.5 text-[#F5C780]" />
              <span className="hidden sm:inline">VR 3D</span>
            </span>

            {/* Solar Time quick switch in VR */}
            <div className="flex items-center bg-[#2A241C] p-0.5 rounded-full border border-[#8C7452]/40">
              <button
                onClick={() => onSolarTimeChange?.('morning')}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  solarTimeMode === 'morning' ? 'bg-[#8C7452] text-white shadow-sm' : 'text-[#C9C4B5] hover:text-white'
                }`}
                title="10:00 AM · Sol Matutino"
              >
                <Sun className="w-3 h-3" />
              </button>
              <button
                onClick={() => onSolarTimeChange?.('golden')}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  solarTimeMode === 'golden' ? 'bg-[#8C7452] text-white shadow-sm' : 'text-[#C9C4B5] hover:text-white'
                }`}
                title="5:30 PM · Ocaso Dorado"
              >
                <Sparkles className="w-3 h-3" />
              </button>
              <button
                onClick={() => onSolarTimeChange?.('night')}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  solarTimeMode === 'night' ? 'bg-[#8C7452] text-white shadow-sm' : 'text-[#C9C4B5] hover:text-white'
                }`}
                title="8:30 PM · Noche de Gala"
              >
                <Moon className="w-3 h-3" />
              </button>
            </div>

            {/* FOV Lens Quick Presets in VR */}
            <div className="hidden md:flex items-center gap-1 bg-[#2A241C] px-2 py-0.5 rounded-full border border-[#8C7452]/40 text-[9px] font-mono text-[#C9C4B5]">
              <span className="text-[#8C7452] font-bold">Lente:</span>
              <button
                onClick={() => {
                  controlsRef.current.targetFov = 64;
                  setVrFovPreset('normal');
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${vrFovPreset === 'normal' ? 'bg-[#8C7452] text-white font-bold' : 'hover:text-white'}`}
              >
                64°
              </button>
              <button
                onClick={() => {
                  controlsRef.current.targetFov = 74;
                  setVrFovPreset('wide');
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${vrFovPreset === 'wide' ? 'bg-[#8C7452] text-white font-bold' : 'hover:text-white'}`}
              >
                74°
              </button>
              <button
                onClick={() => {
                  controlsRef.current.targetFov = 84;
                  setVrFovPreset('ultra');
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${vrFovPreset === 'ultra' ? 'bg-[#8C7452] text-white font-bold' : 'hover:text-white'}`}
              >
                84°
              </button>
            </div>

            {/* Gyro toggle in VR */}
            <button
              onClick={handleToggleGyro}
              className={`text-[9px] font-meta uppercase px-2 py-1 rounded-full border transition-colors flex items-center gap-1 cursor-pointer ${
                isGyroActive
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-[#2A241C] border-[#8C7452]/50 text-[#C9C4B5] hover:text-white'
              }`}
              title="Activar sensor giroscópico"
            >
              <Smartphone className="w-3 h-3" />
              <span>{isGyroActive ? 'Giroscopio ON' : 'Giroscopio'}</span>
            </button>

            <button
              onClick={handleExitVrImmersion}
              className="bg-[#8C7452] hover:bg-[#735D3F] text-white text-[9px] font-meta uppercase px-2.5 py-1 rounded-full cursor-pointer transition-colors font-semibold"
            >
              Salir VR
            </button>
          </div>

          {/* Floating Bottom Room Selector in VR */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center gap-1.5 bg-[#1B1813]/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[#8C7452]/50 shadow-2xl overflow-x-auto max-w-[92vw]">
            {TOUR_ROOMS_DATA.map((rm) => (
              <button
                key={rm.id}
                onClick={() => handleSelectRoom(rm.id)}
                className={`px-2.5 py-1 rounded-xl text-[9px] font-meta uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  rm.id === activeRoomId
                    ? 'bg-[#8C7452] text-white font-bold shadow-sm'
                    : 'text-[#C9C4B5] hover:text-white hover:bg-white/10'
                }`}
              >
                {rm.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= Interactive 3D Projected Hotspots Layer (2D Mode) ================= */}
      {!isVrStereoMode && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {currentRoom.hotspots.map((hotspot) => {
            const isPortal = hotspot.type === 'portal';

            return (
              <div
                key={hotspot.id}
                ref={(el) => {
                  if (el) {
                    hotspotElementsRef.current.set(hotspot.id, el);
                  } else {
                    hotspotElementsRef.current.delete(hotspot.id);
                  }
                }}
                style={{
                  left: '0px',
                  top: '0px',
                  display: 'none',
                  willChange: 'transform',
                }}
                className="absolute pointer-events-auto"
              >
                {isPortal ? (
                  /* Portal Hotspot: Navigation to another room */
                  <button
                    onClick={() => hotspot.targetRoomId && handleSelectRoom(hotspot.targetRoomId)}
                    className="group relative flex items-center justify-center p-2 rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    title={hotspot.title}
                  >
                    {/* Outer Pulsing Waves */}
                    <span className="absolute w-12 h-12 rounded-full bg-[#8C7452]/40 animate-ping" />
                    <span className="absolute w-9 h-9 rounded-full bg-[#1B1813]/80 backdrop-blur-md border border-[#8C7452] shadow-xl" />

                    {/* Icon */}
                    <DoorOpen className="w-4 h-4 text-[#FAF9F6] relative z-10 group-hover:text-[#F5C780] transition-colors" />

                    {/* Hover Floating Pill Tag */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#1B1813]/90 text-[#FAF9F6] border border-[#8C7452]/60 px-2.5 py-1 rounded-full text-[9px] font-meta uppercase tracking-wider whitespace-nowrap shadow-lg opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>{hotspot.title}</span>
                      <ArrowUpRight className="w-2.5 h-2.5 text-[#8C7452]" />
                    </div>
                  </button>
                ) : (
                  /* Spec Hotspot: Material & Technical Inspection */
                  <button
                    onClick={() => setSelectedSpecHotspot(hotspot)}
                    className="group relative flex items-center justify-center p-2 rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    title={hotspot.title}
                  >
                    {/* Diamond Icon Pin */}
                    <span className="absolute w-10 h-10 rounded-full bg-emerald-500/25 animate-ping" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1B1813] to-[#3D3528] border-2 border-[#8C7452] text-[#FAF9F6] flex items-center justify-center shadow-2xl relative z-10 group-hover:border-emerald-400 transition-colors">
                      <Sparkles className="w-3.5 h-3.5 text-[#F5C780]" />
                    </div>

                    {/* Floating Tag */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/95 text-[#1B1813] border border-[#8C7452]/40 px-2.5 py-0.5 rounded-full text-[9px] font-meta uppercase tracking-wider whitespace-nowrap shadow-md flex items-center gap-1 group-hover:bg-[#8C7452] group-hover:text-white transition-colors">
                      <span className="font-semibold">{hotspot.title}</span>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= Top Info & Status Bar (2D Mode) ================= */}
      {!isVrStereoMode && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
          {/* Current Room Title Card */}
          <div className="bg-[#1B1813]/85 backdrop-blur-xl border border-[#8C7452]/40 rounded-2xl px-4 py-2 shadow-2xl pointer-events-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#8C7452]/30 border border-[#8C7452] flex items-center justify-center text-[#F5C780]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-[#FAF9F6]">{currentRoom.name}</span>
                <span className="font-mono text-[10px] text-[#8C7452] font-semibold">
                  {currentRoom.areaM2} m²
                </span>
              </div>
              <div className="font-meta text-[8.5px] text-[#C9C4B5] uppercase tracking-widest">
                {selectedUnit.name} · {currentRoom.viewOrientation}
              </div>
            </div>
          </div>

          {/* Top Right Actions: Voice Control, VR, WebXR, Solar, Audio, Auto-Rotate & Gyro */}
          <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap justify-end">
            {/* Voice Control Button & HUD */}
            <VoiceControlHUD
              isListening={isVoiceListening}
              isSupported={isVoiceSupported}
              feedback={voiceFeedback}
              lastCommand={lastVoiceCommand}
              onToggleListening={handleToggleVoiceControl}
              contextMode="tour360"
            />

            {/* 3D VR Stereoscopic Split-Screen Button with Setup Launcher */}
            <button
              onClick={handleRequestVr}
              className="bg-gradient-to-r from-[#8C7452] to-[#B8986B] text-[#1B1813] hover:brightness-110 font-meta font-bold text-[11px] px-3.5 py-2 rounded-full shadow-xl flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 uppercase tracking-wider"
              title="Configurar y activar experiencia de Realidad Virtual 3D"
            >
              <Glasses className="w-4 h-4" />
              <span>Modo VR (3D)</span>
            </button>

            {/* Native WebXR Button (If supported by device) */}
            {isWebXrSupported && (
              <button
                onClick={handleLaunchWebXr}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-meta font-bold text-[11px] px-3.5 py-2 rounded-full shadow-xl flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 uppercase tracking-wider"
                title="Lanzar experiencia inmersiva WebXR nativa"
              >
                <Glasses className="w-4 h-4" />
                <span>WebXR</span>
              </button>
            )}

            {/* VR Instructions Modal trigger */}
            <button
              onClick={() => setShowVrHelp(true)}
              className="p-2 rounded-full bg-[#1B1813]/85 text-[#C9C4B5] border border-[#8C7452]/40 hover:text-white transition-colors cursor-pointer"
              title="Guía de uso VR & 3D"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Solar Ambiance Selector */}
            <div className="flex items-center bg-[#1B1813]/85 backdrop-blur-xl border border-[#8C7452]/40 p-0.5 rounded-full shadow-lg">
              <button
                onClick={() => onSolarTimeChange?.('morning')}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  solarTimeMode === 'morning' ? 'bg-[#8C7452] text-white shadow-sm' : 'text-[#C9C4B5] hover:text-white'
                }`}
                title="10:00 AM · Sol Matutino"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSolarTimeChange?.('golden')}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  solarTimeMode === 'golden' ? 'bg-[#8C7452] text-white shadow-sm' : 'text-[#C9C4B5] hover:text-white'
                }`}
                title="5:30 PM · Ocaso Dorado sobre El Ávila"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSolarTimeChange?.('night')}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  solarTimeMode === 'night' ? 'bg-[#8C7452] text-white shadow-sm' : 'text-[#C9C4B5] hover:text-white'
                }`}
                title="8:30 PM · Noche de Gala"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ambient Sound Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-full border transition-all shadow-md cursor-pointer ${
                isAudioPlaying
                  ? 'bg-[#8C7452] text-white border-[#8C7452]'
                  : 'bg-[#1B1813]/85 text-[#C9C4B5] border-[#8C7452]/40 hover:text-white'
              }`}
              title={isAudioPlaying ? 'Silenciar ambiente' : 'Activar sonido ambiental de la brisa'}
            >
              {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* 360 Auto-Rotate */}
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`p-2 rounded-full border transition-all shadow-md cursor-pointer ${
                isAutoRotating
                  ? 'bg-[#8C7452] text-white border-[#8C7452] animate-pulse'
                  : 'bg-[#1B1813]/85 text-[#C9C4B5] border-[#8C7452]/40 hover:text-white'
              }`}
              title={isAutoRotating ? 'Pausar recorrido 360°' : 'Iniciar giro continuo 360°'}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Gyroscope for Mobile */}
            <button
              onClick={handleToggleGyro}
              className={`p-2 rounded-full border transition-all shadow-md cursor-pointer ${
                isGyroActive
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#1B1813]/85 text-[#C9C4B5] border-[#8C7452]/40 hover:text-white'
              }`}
              title="Activar sensor giroscópico"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= Top-Right Mini Floorplan Radar (2D Mode) ================= */}
      {!isVrStereoMode && (
        <div className="absolute top-16 right-3 pointer-events-auto z-30 hidden sm:block">
          <div className="bg-[#1B1813]/90 backdrop-blur-xl border border-[#8C7452]/40 rounded-2xl p-2.5 shadow-2xl w-40">
            <div className="flex items-center justify-between text-[8px] font-meta uppercase tracking-wider text-[#8C8678] mb-1.5">
              <span>Radar Espacial</span>
              <span className="text-[#8C7452] font-semibold">{currentRoom.name.split(' ')[0]}</span>
            </div>

            {/* Floorplan Box Schematic */}
            <div className="relative w-full h-24 bg-[#2A241C] rounded-xl border border-[#8C7452]/30 overflow-hidden">
              {/* North Indicator */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[7px] font-mono text-emerald-400 font-bold tracking-widest uppercase">
                ▲ N · ÁVILA
              </div>

              {/* Room Nodes on Radar */}
              {TOUR_ROOMS_DATA.map((rm) => {
                const isSelected = rm.id === activeRoomId;
                return (
                  <button
                    key={rm.id}
                    onClick={() => handleSelectRoom(rm.id)}
                    style={{
                      left: `${rm.radarPos.x}%`,
                      top: `${rm.radarPos.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute w-3.5 h-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-400 ring-2 ring-emerald-300 ring-offset-1 ring-offset-[#1B1813] z-20 scale-125'
                        : 'bg-[#8C7452]/70 hover:bg-[#8C7452] hover:scale-110 z-10'
                    }`}
                    title={`Ir a ${rm.name}`}
                  >
                    {/* Active Dynamic FOV Vision Cone that rotates in real time via ref */}
                    {isSelected && (
                      <div
                        ref={radarConeRef}
                        className="absolute w-12 h-12 pointer-events-none origin-center"
                      >
                        <div className="w-full h-full bg-gradient-to-t from-emerald-400/40 via-emerald-400/10 to-transparent clip-triangle" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= Bottom Room Selector Carousel Dock (2D Mode) ================= */}
      {!isVrStereoMode && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 pointer-events-none z-30">
          {/* Left Side: Room Carousel */}
          <div className="bg-[#1B1813]/90 backdrop-blur-xl border border-[#8C7452]/40 rounded-2xl p-1.5 shadow-2xl pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[calc(100%-120px)] sm:max-w-none">
            {TOUR_ROOMS_DATA.map((room, idx) => {
              const isActive = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room.id)}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#8C7452] text-[#FAF9F6] shadow-md font-semibold'
                      : 'text-[#C9C4B5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="font-mono text-[9px] opacity-75">0{idx + 1}</span>
                  <span className="font-display text-xs whitespace-nowrap">{room.name}</span>
                  <span className="font-mono text-[9px] opacity-80 hidden md:inline">
                    {room.areaM2}m²
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Side: Quick Advisor Trigger */}
          {onOpenAdvisor && (
            <button
              onClick={onOpenAdvisor}
              className="bg-[#8C7452] hover:bg-[#A38760] text-[#1B1813] font-meta font-bold text-xs px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 transition-all cursor-pointer pointer-events-auto shrink-0 hover:scale-105 active:scale-95"
              title="Preguntar al Asesor IA sobre este ambiente"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Consultar Asesor</span>
            </button>
          )}
        </div>
      )}

      {/* ================= VR IMMERSION CONFIRMATION & SETUP MODAL ================= */}
      <AnimatePresence>
        {vrState === 'confirming' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              className="bg-[#1B1813] text-[#FAF9F6] border border-[#8C7452] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              {/* Subtle Ambient Gold Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8C7452]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setVrState('idle')}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-[#C9C4B5] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8C7452] to-[#B8986B] text-[#1B1813] flex items-center justify-center shadow-lg">
                  <Glasses className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#FAF9F6]">
                    Confirmación de Inmersión VR
                  </h3>
                  <p className="font-meta text-[9.5px] text-[#F5C780] uppercase tracking-widest">
                    Carga Asíncrona & Optimización WebGL
                  </p>
                </div>
              </div>

              {/* VR Options & Calibration Form */}
              <div className="space-y-4 text-xs font-serif">
                {/* 1. Visual Quality Selection */}
                <div className="bg-[#2A241C] p-3.5 rounded-2xl border border-[#8C7452]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-meta text-[10px] uppercase tracking-wider text-[#C9C4B5] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#8C7452]" />
                      <span>Perfil de Renderizado</span>
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-semibold">
                      {vrQuality === 'performance' ? '1080p · 60fps' : vrQuality === 'optimal' ? '2K · Balance' : '4K · Ultra HD'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { id: 'performance', label: 'Rendimiento', sub: '1080p · Móviles' },
                      { id: 'optimal', label: 'Óptimo', sub: '2K · Recomendado' },
                      { id: 'ultra', label: 'Ultra HDR', sub: '4K · Máxima Nitidez' },
                    ].map((q) => (
                      <button
                        key={q.id}
                        onClick={() => setVrQuality(q.id as PanoramaQuality)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          vrQuality === q.id
                            ? 'bg-[#8C7452] border-[#F5C780] text-white font-bold shadow-md scale-[1.02]'
                            : 'bg-[#1B1813] border-[#8C7452]/30 text-[#C9C4B5] hover:text-white hover:border-[#8C7452]'
                        }`}
                      >
                        <div className="text-[11px] font-meta">{q.label}</div>
                        <div className="text-[8.5px] opacity-75 font-sans mt-0.5">{q.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Device Sensors & Audio Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Gyroscope toggle */}
                  <button
                    onClick={() => setVrEnableGyro(!vrEnableGyro)}
                    className={`p-3 rounded-2xl border text-left transition-colors cursor-pointer flex items-center justify-between ${
                      vrEnableGyro
                        ? 'bg-[#2A241C] border-emerald-500/60 text-white'
                        : 'bg-[#1B1813] border-[#8C7452]/30 text-[#8C8678]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className={`w-4 h-4 ${vrEnableGyro ? 'text-emerald-400' : 'text-[#8C8678]'}`} />
                      <div>
                        <div className="font-meta text-[10px] uppercase tracking-wider font-semibold">
                          Giroscopio
                        </div>
                        <div className="text-[8.5px] text-[#C9C4B5]">Seguimiento de cabeza</div>
                      </div>
                    </div>
                    {vrEnableGyro ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-[#8C8678]" />
                    )}
                  </button>

                  {/* Audio Ambiance toggle */}
                  <button
                    onClick={() => setVrEnableAudio(!vrEnableAudio)}
                    className={`p-3 rounded-2xl border text-left transition-colors cursor-pointer flex items-center justify-between ${
                      vrEnableAudio
                        ? 'bg-[#2A241C] border-emerald-500/60 text-white'
                        : 'bg-[#1B1813] border-[#8C7452]/30 text-[#8C8678]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className={`w-4 h-4 ${vrEnableAudio ? 'text-emerald-400' : 'text-[#8C8678]'}`} />
                      <div>
                        <div className="font-meta text-[10px] uppercase tracking-wider font-semibold">
                          Sonorización
                        </div>
                        <div className="text-[8.5px] text-[#C9C4B5]">Brisa de El Ávila</div>
                      </div>
                    </div>
                    {vrEnableAudio ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-[#8C8678]" />
                    )}
                  </button>
                </div>

                {/* Performance & Security Note */}
                <div className="flex items-center gap-2 text-[10px] text-[#C9C4B5] bg-[#14120E] p-2.5 rounded-xl border border-[#8C7452]/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    La carga asíncrona previene caídas de FPS y asegura estabilidad del hilo principal.
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setVrState('idle')}
                  className="flex-1 bg-[#2A241C] hover:bg-[#3D3528] text-[#C9C4B5] hover:text-white font-meta text-xs uppercase tracking-wider py-3 rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancelar (2D)
                </button>

                <button
                  onClick={handleStartVrImmersion}
                  className="flex-2 bg-gradient-to-r from-[#8C7452] to-[#B8986B] text-[#1B1813] hover:brightness-110 font-meta font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>Iniciar Inmersión VR</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= VR ASYNC LOADING PROGRESS HUD ================= */}
      <AnimatePresence>
        {vrState === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#14120E]/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="max-w-md w-full flex flex-col items-center space-y-6">
              {/* Rotating Gold Compass Ring */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#8C7452]/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-2 border-[#8C7452] border-t-transparent animate-spin" />
                <Glasses className="w-7 h-7 text-[#F5C780] absolute" />
              </div>

              {/* Title & Status */}
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-lg text-[#FAF9F6]">
                  Preparando Entorno Inmersivo VR
                </h3>
                <p className="font-mono text-xs text-[#F5C780] h-5 transition-all">
                  {vrLoadingStatus || 'Cargando estratos arquitectónicos...'}
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-[#2A241C] h-2.5 rounded-full border border-[#8C7452]/40 overflow-hidden relative shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#8C7452] via-emerald-400 to-[#F5C780]"
                  style={{ width: `${vrLoadingProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>

              <div className="flex items-center justify-between w-full text-[10px] font-mono text-[#8C8678]">
                <span>MODO {vrQuality.toUpperCase()}</span>
                <span>{vrLoadingProgress}%</span>
                <span>WEBGL 60 FPS</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= VR ERROR RECOVERY MODAL ================= */}
      <AnimatePresence>
        {vrState === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#1B1813] text-[#FAF9F6] border border-rose-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <X className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-base">Error al Iniciar VR</h4>
              <p className="text-xs text-[#C9C4B5] font-serif leading-relaxed">
                {vrErrorMessage || 'Ocurrió una interrupción al cargar el búfer estereoscópico.'}
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleExitVrImmersion}
                  className="flex-1 bg-[#2A241C] text-white py-2.5 rounded-xl font-meta text-xs uppercase"
                >
                  Volver a 2D
                </button>
                <button
                  onClick={handleStartVrImmersion}
                  className="flex-1 bg-[#8C7452] text-white py-2.5 rounded-xl font-meta text-xs uppercase font-bold flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reintentar</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= Material / Spec Hotspot Details Modal Card ================= */}
      <AnimatePresence>
        {selectedSpecHotspot && selectedSpecHotspot.specDetails && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 w-[320px] sm:w-[400px] bg-[#FAF9F6] text-[#1B1813] border border-[#8C7452]/40 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] p-5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#C9C4B5]/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#8C7452]/20 text-[#8C7452]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-meta text-[8.5px] uppercase tracking-widest text-[#8C8678] block">
                    {selectedSpecHotspot.specDetails.category}
                  </span>
                  <h4 className="font-display font-bold text-sm text-[#1B1813]">
                    {selectedSpecHotspot.title}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedSpecHotspot(null)}
                className="text-[#8C8678] hover:text-[#1B1813] p-1 rounded-full hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Spec Details */}
            <div className="space-y-2.5 text-xs font-serif">
              <div className="bg-white p-3 rounded-2xl border border-[#C9C4B5]/40 space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-meta uppercase text-[#8C8678] tracking-wider">Material:</span>
                  <span className="font-medium text-[#1B1813] text-right">
                    {selectedSpecHotspot.specDetails.material}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-meta uppercase text-[#8C8678] tracking-wider">Origen / Firma:</span>
                  <span className="font-medium text-[#8C7452] text-right">
                    {selectedSpecHotspot.specDetails.brandOrOrigin}
                  </span>
                </div>
              </div>

              <p className="text-[#5C5549] text-xs leading-relaxed pt-1">
                {selectedSpecHotspot.specDetails.description}
              </p>
            </div>

            {/* Action */}
            <div className="mt-4 pt-3 border-t border-[#C9C4B5]/40 flex justify-end">
              <button
                onClick={() => setSelectedSpecHotspot(null)}
                className="w-full bg-[#1B1813] hover:bg-[#8C7452] text-[#FAF9F6] font-meta text-xs uppercase tracking-wider py-2 rounded-xl transition-colors cursor-pointer"
              >
                Entendido · Continuar Recorrido
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= VR & 3D Help Modal ================= */}
      <AnimatePresence>
        {showVrHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#FAF9F6] text-[#1B1813] border border-[#8C7452] rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowVrHelp(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-[#8C8678] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#8C7452]/20 text-[#8C7452] flex items-center justify-center">
                  <Glasses className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#1B1813]">Experiencia 3D & Realidad Virtual</h3>
                  <p className="font-meta text-[10px] text-[#8C7452] uppercase tracking-wider">Inmersión Arquitectónica Total</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-[#5C5549] font-serif leading-relaxed">
                <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-[#C9C4B5]/40">
                  <span className="font-bold text-[#8C7452] font-mono text-sm">01</span>
                  <div>
                    <strong className="text-[#1B1813] block font-sans">Gafas VR / Cardboard Móvil:</strong>
                    Activa el botón <strong className="text-[#8C7452]">Modo VR (3D)</strong>, confirma la calidad de render deseada y coloca tu teléfono móvil en horizontal dentro de tu visor o gafas VR.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-[#C9C4B5]/40">
                  <span className="font-bold text-[#8C7452] font-mono text-sm">02</span>
                  <div>
                    <strong className="text-[#1B1813] block font-sans">Navegación con la Mirada (Look & Dwell):</strong>
                    Apunta la mirilla central hacia cualquier puerta o punto de material durante <strong>1.3 segundos</strong> para teletransportarte o ver la ficha sin necesidad de tocar la pantalla.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-[#C9C4B5]/40">
                  <span className="font-bold text-[#8C7452] font-mono text-sm">03</span>
                  <div>
                    <strong className="text-[#1B1813] block font-sans">Meta Quest & Apple Vision Pro:</strong>
                    Si usas un visor compatible, el botón <strong className="text-emerald-700">WebXR</strong> se habilitará para iniciar una sesión espacial nativa.
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    setShowVrHelp(false);
                    handleRequestVr();
                  }}
                  className="flex-1 bg-[#1B1813] hover:bg-[#8C7452] text-[#FAF9F6] font-meta text-xs uppercase tracking-wider py-3 rounded-xl transition-colors cursor-pointer font-semibold flex items-center justify-center gap-2"
                >
                  <Glasses className="w-4 h-4" />
                  <span>Configurar Inmersión VR</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
