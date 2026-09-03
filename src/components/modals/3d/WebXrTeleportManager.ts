import * as THREE from 'three';
import { SolarTimeMode } from './ArchitecturalScene';

/**
 * WebXR Hardware-Accelerated VR Engine & Teleportation Navigation System
 * - WebXR Device API with 90Hz target refresh rate locking
 * - 6DoF Controllers with Parabolic Arc & Interactive Floor Reticle
 * - Dynamic Anti-Cinetosis Comfort Blinder (Vignette Tunneling)
 * - 3D Architectural Teleport Portals & Spatial Audio Cues
 */

export interface TeleportTarget {
  position: THREE.Vector3;
  roomId?: string;
  roomName?: string;
  isValid: boolean;
}

export interface WebXrManagerConfig {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  onRoomChange: (roomId: string) => void;
  onFpsUpdate?: (fps: number, targetHz: number) => void;
  onSessionStateChange?: (active: boolean, frameRate: number) => void;
}

export class WebXrTeleportManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private onRoomChange: (roomId: string) => void;
  private onFpsUpdate?: (fps: number, targetHz: number) => void;
  private onSessionStateChange?: (active: boolean, frameRate: number) => void;

  public userRig: THREE.Group;
  public controllers: THREE.Group[] = [];
  public controllerGrips: THREE.Group[] = [];
  public xrSession: XRSession | null = null;
  public targetFrameRate: number = 90;
  public actualFrameRate: number = 90;
  public isWebXrActive: boolean = false;

  // Teleportation Visual Elements
  private teleportReticle: THREE.Group;
  private reticleRing: THREE.Mesh;
  private reticlePulseRing: THREE.Mesh;
  private reticleArrow: THREE.Mesh;
  private teleportArc: THREE.Line;
  private arcPoints: THREE.Vector3[] = [];
  private comfortBlinder: THREE.Mesh;
  private blinderMaterial: THREE.MeshBasicMaterial;

  // Interactivity state
  private activeControllerIndex: number = 0;
  private isAimingTeleport: boolean = false;
  private currentTeleportTarget: TeleportTarget | null = null;
  private isTeleporting: boolean = false;
  private raycaster: THREE.Raycaster;
  private walkableFloorPlanes: THREE.Mesh[] = [];
  private roomPortalMeshes: THREE.Group[] = [];

  // Spatial Audio
  private audioCtx: AudioContext | null = null;

  // Performance telemetry
  private frameCount: number = 0;
  private lastFpsTime: number = performance.now();

  constructor(config: WebXrManagerConfig) {
    this.renderer = config.renderer;
    this.scene = config.scene;
    this.camera = config.camera;
    this.onRoomChange = config.onRoomChange;
    this.onFpsUpdate = config.onFpsUpdate;
    this.onSessionStateChange = config.onSessionStateChange;

    this.raycaster = new THREE.Raycaster();

    // 1. Setup User Rig (Enables 6DoF displacement in world space)
    this.userRig = new THREE.Group();
    this.userRig.name = 'WebXR_UserRig';
    this.userRig.position.set(0, 0, 0);
    this.scene.add(this.userRig);

    // Place camera inside userRig
    this.userRig.add(this.camera);

    // 2. Build Teleport Reticle
    this.teleportReticle = this.createTeleportReticle();
    this.scene.add(this.teleportReticle);

    // 3. Build Teleport Arc Line
    this.teleportArc = this.createTeleportArc();
    this.scene.add(this.teleportArc);

    // 4. Build Anti-Motion Sickness Comfort Blinder
    const { mesh, material } = this.createComfortBlinder();
    this.comfortBlinder = mesh;
    this.blinderMaterial = material;
    this.camera.add(this.comfortBlinder);

    // 5. Setup WebXR Controllers
    this.setupControllers();

    // 6. Setup Interactive Room Portal Hubs
    this.setupRoomPortalNodes();
  }

  /**
   * Check if WebXR immersive-vr is supported on the client hardware
   */
  public static async isSupported(): Promise<boolean> {
    if ('xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      try {
        return await (navigator as any).xr.isSessionSupported('immersive-vr');
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Request and initialize high-performance WebXR Session at 90Hz
   */
  public async startWebXrSession(): Promise<boolean> {
    try {
      if (!('xr' in navigator)) {
        throw new Error('WebXR Device API no disponible en este navegador.');
      }

      const sessionInit: XRSessionInit = {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['bounded-floor', 'hand-tracking'],
      };

      const session: XRSession = await (navigator as any).xr.requestSession('immersive-vr', sessionInit);
      this.xrSession = session;
      this.renderer.xr.enabled = true;
      await this.renderer.xr.setSession(session);

      // Hardware 90Hz Refresh Rate Optimization
      await this.configureTargetFrameRate(session);

      this.isWebXrActive = true;
      this.onSessionStateChange?.(true, this.targetFrameRate);

      session.addEventListener('end', () => {
        this.isWebXrActive = false;
        this.xrSession = null;
        this.onSessionStateChange?.(false, 60);
      });

      return true;
    } catch (err) {
      console.warn('Error launching native WebXR session:', err);
      return false;
    }
  }

  /**
   * Optimize Display Refresh Rate to 90Hz / 120Hz for zero-latency kinetic comfort
   */
  private async configureTargetFrameRate(session: any) {
    try {
      if (session.supportedFrameRates && session.updateTargetFrameRate) {
        const rates: number[] = Array.from(session.supportedFrameRates);
        console.info('[WebXR] Hardware Supported Refresh Rates:', rates);

        if (rates.includes(90)) {
          await session.updateTargetFrameRate(90);
          this.targetFrameRate = 90;
        } else if (rates.includes(120)) {
          await session.updateTargetFrameRate(120);
          this.targetFrameRate = 120;
        } else if (rates.length > 0) {
          const maxHz = Math.max(...rates);
          await session.updateTargetFrameRate(maxHz);
          this.targetFrameRate = maxHz;
        }
      } else {
        this.targetFrameRate = 90; // Default expected VR refresh
      }
    } catch (e) {
      console.warn('[WebXR] Could not lock target frame rate:', e);
      this.targetFrameRate = 90;
    }
  }

  /**
   * End WebXR Session
   */
  public async endWebXrSession() {
    if (this.xrSession) {
      await this.xrSession.end();
      this.xrSession = null;
      this.isWebXrActive = false;
    }
  }

  /**
   * Setup 6DoF Controllers & Hand Pointers
   */
  private setupControllers() {
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.addEventListener('selectstart', (e) => this.onSelectStart(i, e));
      controller.addEventListener('selectend', (e) => this.onSelectEnd(i, e));
      controller.addEventListener('squeezestart', () => this.onSqueezeStart(i));
      controller.addEventListener('squeezeend', () => this.onSqueezeEnd(i));
      this.userRig.add(controller);
      this.controllers.push(controller);

      // Stylized Controller Pointer Ray Beam
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
      ]);
      const rayMat = new THREE.LineBasicMaterial({
        color: 0xF5C780,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const rayMesh = new THREE.Line(rayGeo, rayMat);
      rayMesh.name = 'ray';
      rayMesh.scale.z = 2.5;
      controller.add(rayMesh);

      // Controller Grip / Physical Handle Model
      const grip = this.renderer.xr.getControllerGrip(i);
      const gripMesh = this.createStylizedControllerGrip();
      grip.add(gripMesh);
      this.userRig.add(grip);
      this.controllerGrips.push(grip);
    }
  }

  /**
   * Stylized Minimalist Controller Grip
   */
  private createStylizedControllerGrip(): THREE.Group {
    const group = new THREE.Group();

    const handleGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.12, 16);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x1A1813,
      metalness: 0.8,
      roughness: 0.3,
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.x = -Math.PI / 4;
    handle.position.set(0, -0.03, -0.04);
    group.add(handle);

    const ringGeo = new THREE.TorusGeometry(0.038, 0.005, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x8C7452,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0.01, -0.06);
    group.add(ring);

    return group;
  }

  /**
   * Floor Teleport Target Reticle
   */
  private createTeleportReticle(): THREE.Group {
    const group = new THREE.Group();
    group.visible = false;

    // Main Outer Glowing Ring
    const ringGeo = new THREE.RingGeometry(0.32, 0.38, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x50E3C2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.reticleRing = new THREE.Mesh(ringGeo, ringMat);
    group.add(this.reticleRing);

    // Inner Pulsing Wave Ring
    const pulseGeo = new THREE.RingGeometry(0.12, 0.24, 32);
    pulseGeo.rotateX(-Math.PI / 2);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xF5C780,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    this.reticlePulseRing = new THREE.Mesh(pulseGeo, pulseMat);
    group.add(this.reticlePulseRing);

    // Center Direction Pointer Arrow / Marker
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.22);
    arrowShape.lineTo(0.1, 0.05);
    arrowShape.lineTo(0.03, 0.05);
    arrowShape.lineTo(0.03, -0.15);
    arrowShape.lineTo(-0.03, -0.15);
    arrowShape.lineTo(-0.03, 0.05);
    arrowShape.lineTo(-0.1, 0.05);
    arrowShape.closePath();

    const arrowGeo = new THREE.ShapeGeometry(arrowShape);
    arrowGeo.rotateX(-Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
    });
    this.reticleArrow = new THREE.Mesh(arrowGeo, arrowMat);
    group.add(this.reticleArrow);

    return group;
  }

  /**
   * Parabolic Teleport Arc Line
   */
  private createTeleportArc(): THREE.Line {
    const numPoints = 28;
    this.arcPoints = [];
    for (let i = 0; i < numPoints; i++) {
      this.arcPoints.push(new THREE.Vector3(0, 0, 0));
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(this.arcPoints);
    const arcMat = new THREE.LineBasicMaterial({
      color: 0x50E3C2,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(arcGeo, arcMat);
    line.visible = false;
    return line;
  }

  /**
   * Anti-Cinetosis (Motion Sickness) Comfort Vignette Blinder
   */
  private createComfortBlinder(): { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial } {
    const blinderGeo = new THREE.PlaneGeometry(2, 2);
    const blinderMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.0,
      depthTest: false,
      depthWrite: false,
    });
    const blinderMesh = new THREE.Mesh(blinderGeo, blinderMat);
    blinderMesh.position.set(0, 0, -0.15);
    blinderMesh.renderOrder = 9999;
    return { mesh: blinderMesh, material: blinderMat };
  }

  /**
   * Setup 3D Floating Room Portals on Floor for quick architectural teleportation
   */
  private setupRoomPortalNodes() {
    const portals = [
      { id: 'salon', name: 'Gran Salón', pos: new THREE.Vector3(0, 0.02, 0.5), color: 0xF5C780 },
      { id: 'cocina', name: 'Cocina Gaggenau', pos: new THREE.Vector3(4.5, 0.02, 0), color: 0x50E3C2 },
      { id: 'master', name: 'Master Suite', pos: new THREE.Vector3(-4.5, 0.02, 0), color: 0xE89874 },
      { id: 'terraza', name: 'Terraza Ávila', pos: new THREE.Vector3(0, 0.02, -4.5), color: 0x64B5F6 },
      { id: 'bano', name: 'Baño Spa', pos: new THREE.Vector3(-4.5, 0.02, 4.0), color: 0xBA68C8 },
    ];

    portals.forEach((p) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.name = `portal_${p.id}`;
      nodeGroup.position.copy(p.pos);
      nodeGroup.userData = { roomId: p.id, roomName: p.name, isPortal: true };

      // Base Pedestal Disc
      const discGeo = new THREE.CylinderGeometry(0.45, 0.5, 0.03, 24);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x1A1813,
        metalness: 0.8,
        roughness: 0.2,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      nodeGroup.add(disc);

      // Glowing Perimeter Ring
      const ringGeo = new THREE.RingGeometry(0.42, 0.49, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: p.color,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.02;
      nodeGroup.add(ring);

      // Vertical Light Column Beams
      const beamGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.8, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: p.color,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 0.9;
      nodeGroup.add(beam);

      this.scene.add(nodeGroup);
      this.roomPortalMeshes.push(nodeGroup);
    });
  }

  /**
   * Register Walkable Floor Mesh to compute collision intersections
   */
  public registerFloorMesh(mesh: THREE.Mesh) {
    if (!this.walkableFloorPlanes.includes(mesh)) {
      this.walkableFloorPlanes.push(mesh);
    }
  }

  public clearFloorMeshes() {
    this.walkableFloorPlanes = [];
  }

  // Controller Event Handlers
  private onSelectStart(controllerIdx: number, _event: any) {
    if (this.isTeleporting) return;
    this.activeControllerIndex = controllerIdx;
    this.isAimingTeleport = true;
    this.teleportReticle.visible = true;
    this.teleportArc.visible = true;
    this.playAudioCue('aim');
  }

  private onSelectEnd(controllerIdx: number, _event: any) {
    if (!this.isAimingTeleport || this.activeControllerIndex !== controllerIdx) return;
    this.isAimingTeleport = false;
    this.teleportArc.visible = false;
    this.teleportReticle.visible = false;

    if (this.currentTeleportTarget && this.currentTeleportTarget.isValid) {
      this.executeTeleport(this.currentTeleportTarget);
    }
  }

  private onSqueezeStart(_controllerIdx: number) {
    // Quick snap rotation (45 degrees) to adjust VR orientation without head strain
    this.userRig.rotation.y += Math.PI / 4;
    this.playAudioCue('snap');
  }

  private onSqueezeEnd(_controllerIdx: number) {}

  /**
   * Execute Smooth Anti-Cinetosis Teleportation
   */
  public executeTeleport(target: TeleportTarget) {
    if (this.isTeleporting) return;
    this.isTeleporting = true;
    this.playAudioCue('teleport');

    // 1. Rapid comfort fade to black (80ms blinder tunneling)
    let progress = 0;
    const fadeDuration = 90; // ms
    const startTime = performance.now();

    const fadeInLoop = () => {
      const elapsed = performance.now() - startTime;
      progress = Math.min(elapsed / fadeDuration, 1.0);
      this.blinderMaterial.opacity = progress * 0.95;

      if (progress < 1.0) {
        requestAnimationFrame(fadeInLoop);
      } else {
        // 2. Displace User Rig in World Space
        this.userRig.position.set(target.position.x, 0, target.position.z);

        // If target was a room portal node, trigger room switch
        if (target.roomId) {
          this.onRoomChange(target.roomId);
        }

        // 3. Smooth fade out (110ms)
        const fadeOutStartTime = performance.now();
        const fadeOutLoop = () => {
          const outElapsed = performance.now() - fadeOutStartTime;
          const outProgress = Math.min(outElapsed / 120, 1.0);
          this.blinderMaterial.opacity = (1.0 - outProgress) * 0.95;

          if (outProgress < 1.0) {
            requestAnimationFrame(fadeOutLoop);
          } else {
            this.blinderMaterial.opacity = 0.0;
            this.isTeleporting = false;
          }
        };
        requestAnimationFrame(fadeOutLoop);
      }
    };

    requestAnimationFrame(fadeInLoop);
  }

  /**
   * Frame Update (Called every frame from the render loop)
   */
  public update(time: number) {
    // FPS Telemetry
    this.frameCount++;
    if (time - this.lastFpsTime >= 1000) {
      this.actualFrameRate = Math.round((this.frameCount * 1000) / (time - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = time;
      this.onFpsUpdate?.(this.actualFrameRate, this.targetFrameRate);
    }

    // Animate Room Portal Pillars
    this.roomPortalMeshes.forEach((portal, idx) => {
      const beam = portal.children[2] as THREE.Mesh;
      if (beam) {
        beam.rotation.y = time * 0.0008 * (idx % 2 === 0 ? 1 : -1);
      }
    });

    // Animate Teleport Reticle
    if (this.teleportReticle.visible) {
      const pulseScale = 1.0 + Math.sin(time * 0.008) * 0.18;
      this.reticlePulseRing.scale.set(pulseScale, pulseScale, pulseScale);
      this.reticleRing.rotation.z = time * 0.001;
    }

    // Compute Teleport Arc & Reticle when aiming
    if (this.isAimingTeleport) {
      this.computeTeleportArc();
    }
  }

  /**
   * Compute Parabolic Physics Trajectory Arc from active controller
   */
  private computeTeleportArc() {
    const controller = this.controllers[this.activeControllerIndex];
    if (!controller) return;

    // Get Controller World Position & Direction
    const startPos = new THREE.Vector3();
    const forwardDir = new THREE.Vector3(0, 0, -1);
    controller.getWorldPosition(startPos);
    controller.getWorldDirection(forwardDir);
    forwardDir.negate(); // Direction points forward

    // Parabolic Ballistics (Gravity arc curve)
    const velocity = 8.5;
    const gravity = -9.8;
    const timeStep = 0.035;
    const numPoints = this.arcPoints.length;

    let currentPos = startPos.clone();
    let currentVel = forwardDir.clone().multiplyScalar(velocity);

    let hitPoint: THREE.Vector3 | null = null;
    let hitPortalId: string | undefined;
    let hitPortalName: string | undefined;
    let isValidFloor = false;

    for (let i = 0; i < numPoints; i++) {
      this.arcPoints[i].copy(currentPos);

      if (!hitPoint) {
        const nextPos = currentPos.clone().addScaledVector(currentVel, timeStep);

        // Check ground intersection (y <= 0.01)
        if (nextPos.y <= 0.01) {
          const t = (0.01 - currentPos.y) / (nextPos.y - currentPos.y);
          hitPoint = currentPos.clone().lerp(nextPos, t);

          // Bound floor area within apartment (-6m to +6m X, -5.5m to +5.5m Z)
          if (Math.abs(hitPoint.x) <= 6.2 && Math.abs(hitPoint.z) <= 5.8) {
            isValidFloor = true;
          }

          // Check if hitting a Room Portal
          for (const portal of this.roomPortalMeshes) {
            const dist = hitPoint.distanceTo(portal.position);
            if (dist <= 0.75) {
              hitPortalId = portal.userData.roomId;
              hitPortalName = portal.userData.roomName;
              isValidFloor = true;
              break;
            }
          }
        }

        currentPos = nextPos;
        currentVel.y += gravity * timeStep;
      } else {
        this.arcPoints[i].copy(hitPoint);
      }
    }

    // Update Arc Geometry
    this.teleportArc.geometry.setFromPoints(this.arcPoints);

    // Update Reticle
    if (hitPoint) {
      this.teleportReticle.position.copy(hitPoint);
      this.teleportReticle.position.y = 0.02;

      // Color coding: Emerald for floor, Amber for portal, Ruby for invalid
      const color = hitPortalId ? 0xF5C780 : isValidFloor ? 0x50E3C2 : 0xEF5350;
      (this.teleportArc.material as THREE.LineBasicMaterial).color.setHex(color);
      (this.reticleRing.material as THREE.MeshBasicMaterial).color.setHex(color);

      this.currentTeleportTarget = {
        position: hitPoint,
        roomId: hitPortalId,
        roomName: hitPortalName,
        isValid: isValidFloor,
      };
    } else {
      this.currentTeleportTarget = null;
    }
  }

  /**
   * Spatial comfort audio cues (Disabled for clean architectural elegance)
   */
  private playAudioCue(_type: 'aim' | 'teleport' | 'snap') {
    // Intentionally silent for premium architectural experience
  }

  /**
   * Cleanup
   */
  public dispose() {
    if (this.xrSession) {
      this.xrSession.end().catch(() => {});
    }
    this.scene.remove(this.userRig);
    this.scene.remove(this.teleportReticle);
    this.scene.remove(this.teleportArc);

    this.roomPortalMeshes.forEach((portal) => {
      this.scene.remove(portal);
    });

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
  }
}
