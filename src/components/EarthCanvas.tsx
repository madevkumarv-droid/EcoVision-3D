import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RENEWABLE_PROJECTS } from '../data/projectsData';
import { RenewableProject, TechnologyType } from '../types';
import {
  Sun,
  Wind,
  Droplets,
  Flame,
  Battery,
  Waves,
  Atom,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Info,
  X,
  ExternalLink,
  Compass,
} from 'lucide-react';

interface EarthCanvasProps {
  onSelectProject?: (project: RenewableProject | null) => void;
  selectedProjectId?: string | null;
}

// Module-scope reusable math objects to avoid garbage collection inside render loop
const _vec3 = new THREE.Vector3();
const _targetVec = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _pointer = new THREE.Vector2();

// Color mapping for project technologies
const TECH_COLORS: Record<TechnologyType, string> = {
  solar: '#f59e0b',
  wind: '#06b6d4',
  hydro: '#3b82f6',
  geothermal: '#f97316',
  storage: '#10b981',
  tidal: '#14b8a6',
  advanced: '#a855f7',
};

export const EarthCanvas: React.FC<EarthCanvasProps> = ({
  onSelectProject,
  selectedProjectId,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<RenewableProject | null>(
    null
  );
  const [hoveredProject, setHoveredProject] = useState<RenewableProject | null>(
    null
  );
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [layerMode, setLayerMode] = useState<'standard' | 'night' | 'heatmap'>(
    'standard'
  );
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markerGroupRef = useRef<THREE.Group | null>(null);
  const markerMeshesMapRef = useRef<Map<string, THREE.Object3D>>(new Map());

  // Interaction tracking
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const rotationVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0.002 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isTargetingRef = useRef<boolean>(false);
  const isRotatingStateRef = useRef<boolean>(true);

  // Sync state ref
  useEffect(() => {
    isRotatingStateRef.current = isRotating;
  }, [isRotating]);

  // Synchronize selection from parent or internal
  useEffect(() => {
    if (selectedProjectId) {
      const proj =
        RENEWABLE_PROJECTS.find((p) => p.id === selectedProjectId) || null;
      if (proj && proj.id !== selectedProject?.id) {
        setSelectedProject(proj);
        focusProjectCoordinates(proj.lat, proj.lng);
      }
    }
  }, [selectedProjectId]);

  // Rotate globe smoothly toward target latitude/longitude
  const focusProjectCoordinates = useCallback((lat: number, lng: number) => {
    if (!globeGroupRef.current) return;
    isTargetingRef.current = true;
    setIsRotating(false);

    // Convert lat/lng to target group rotation
    const targetY = -(lng + 90) * (Math.PI / 180);
    const targetX = (lat - 10) * (Math.PI / 180);

    targetRotationRef.current = {
      x: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetX)),
      y: targetY,
    };
  }, []);

  // Procedural Earth surface canvas texture generator (zero external assets / 404s)
  const createProceduralEarthTexture = (mode: 'standard' | 'night' | 'heatmap'): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Deep Ocean Base
    if (mode === 'night') {
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      oceanGrad.addColorStop(0, '#020907');
      oceanGrad.addColorStop(0.5, '#04100c');
      oceanGrad.addColorStop(1, '#020907');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      oceanGrad.addColorStop(0, '#061a14');
      oceanGrad.addColorStop(0.3, '#08251c');
      oceanGrad.addColorStop(0.5, '#0a2f24');
      oceanGrad.addColorStop(0.7, '#08251c');
      oceanGrad.addColorStop(1, '#061a14');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Latitude & Longitude grid lines
    ctx.strokeStyle = mode === 'night' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(52, 211, 153, 0.1)';
    ctx.lineWidth = 1;
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = ((lng + 180) / 360) * canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Equator highlight
    ctx.strokeStyle = mode === 'night' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(16, 185, 129, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // 3. Procedural Continents (Accurate landmass polygon clusters with organic coastlines)
    const landColor = mode === 'night' ? '#092318' : '#143c2d';
    const highlightColor = mode === 'night' ? '#114a33' : '#1d5a44';
    const cityLightColor = '#f59e0b';

    // Continents geometry profiles
    const continents = [
      // North America
      {
        points: [
          [-168, 70], [-130, 72], [-80, 75], [-60, 60], [-65, 45],
          [-75, 35], [-82, 25], [-95, 20], [-105, 22], [-120, 35],
          [-125, 50], [-140, 60], [-168, 65],
        ],
      },
      // South America
      {
        points: [
          [-80, 10], [-60, 12], [-35, -5], [-38, -20], [-50, -40],
          [-68, -55], [-75, -45], [-72, -20], [-80, -5], [-80, 10],
        ],
      },
      // Europe
      {
        points: [
          [-10, 36], [0, 44], [-5, 50], [5, 55], [10, 65], [30, 70],
          [45, 65], [40, 50], [30, 45], [20, 38], [0, 36], [-10, 36],
        ],
      },
      // Africa
      {
        points: [
          [-17, 32], [10, 37], [32, 32], [42, 25], [51, 12],
          [40, -10], [32, -28], [20, -34], [15, -25], [10, -5],
          [-15, 12], [-17, 25], [-17, 32],
        ],
      },
      // Asia & Siberia
      {
        points: [
          [35, 40], [50, 45], [60, 65], [100, 75], [170, 68],
          [160, 50], [140, 40], [120, 35], [105, 20], [80, 10],
          [70, 22], [50, 30], [35, 40],
        ],
      },
      // India sub-continent
      {
        points: [
          [68, 25], [77, 32], [90, 26], [85, 20], [80, 10],
          [77, 8], [72, 18], [68, 25],
        ],
      },
      // Australia
      {
        points: [
          [115, -22], [130, -12], [142, -10], [152, -25], [150, -38],
          [138, -36], [128, -32], [115, -34], [113, -25], [115, -22],
        ],
      },
      // Antarctica
      {
        points: [
          [-180, -75], [0, -70], [90, -72], [180, -75],
          [180, -90], [-180, -90],
        ],
      },
    ];

    continents.forEach((cont) => {
      ctx.beginPath();
      cont.points.forEach(([lng, lat], i) => {
        const x = ((lng + 180) / 360) * canvas.width;
        const y = ((90 - lat) / 180) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      ctx.fillStyle = landColor;
      ctx.fill();

      // Subtle topographic contour stroke
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // For night mode: Add cluster lights inside landmasses
      if (mode === 'night') {
        ctx.fillStyle = cityLightColor;
        const [centerLng, centerLat] = cont.points[0];
        const cx = ((centerLng + 180) / 360) * canvas.width;
        const cy = ((90 - centerLat) / 180) * canvas.height;
        for (let i = 0; i < 18; i++) {
          const lx = (cx + (Math.sin(i * 1.7) * 70) + canvas.width) % canvas.width;
          const ly = Math.max(50, Math.min(canvas.height - 50, cy + Math.cos(i * 2.3) * 50));
          ctx.beginPath();
          ctx.arc(lx, ly, Math.random() * 1.5 + 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // If heatmap mode: draw radiant green/amber energy halos around major renewable corridors
    if (mode === 'heatmap') {
      RENEWABLE_PROJECTS.forEach((proj) => {
        const px = ((proj.lng + 180) / 360) * canvas.width;
        const py = ((90 - proj.lat) / 180) * canvas.height;

        const radial = ctx.createRadialGradient(px, py, 4, px, py, 60);
        radial.addColorStop(0, 'rgba(52, 211, 153, 0.7)');
        radial.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)');
        radial.addColorStop(1, 'rgba(6, 78, 59, 0)');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(px, py, 60, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  // Procedural Clouds Canvas Texture
  const createProceduralCloudTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Procedural soft cloud swaths
    for (let i = 0; i < 70; i++) {
      const cx = Math.random() * canvas.width;
      const cy = 60 + Math.random() * (canvas.height - 120);
      const radius = 30 + Math.random() * 70;

      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
      grad.addColorStop(0, 'rgba(230, 245, 238, 0.28)');
      grad.addColorStop(0.5, 'rgba(200, 235, 220, 0.12)');
      grad.addColorStop(1, 'rgba(200, 235, 220, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  // Convert Latitude / Longitude to 3D Cartesian coordinates on sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  };

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Detect software WebGL as per Three.js skill guidelines
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x133828, 1.4);
    scene.add(ambientLight);

    const keySunLight = new THREE.DirectionalLight(0xe8fbf4, 2.2);
    keySunLight.position.set(5, 3, 4);
    scene.add(keySunLight);

    const rimBlueLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    rimBlueLight.position.set(-5, -2, -3);
    scene.add(rimBlueLight);

    // Master Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // 1. Earth Sphere (Radius = 1.0)
    const earthGeo = new THREE.SphereGeometry(1.0, 64, 64);
    const earthTexture = createProceduralEarthTexture('standard');
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.15,
      bumpScale: 0.04,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMeshRef.current = earthMesh;
    globeGroup.add(earthMesh);

    // 2. Cloud Layer (Radius = 1.015)
    const cloudGeo = new THREE.SphereGeometry(1.015, 48, 48);
    const cloudTexture = createProceduralCloudTexture();
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
    cloudsMeshRef.current = cloudsMesh;
    globeGroup.add(cloudsMesh);

    // 3. Atmosphere Glow Layer (Radius = 1.05)
    const atmoGeo = new THREE.SphereGeometry(1.05, 48, 48);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.06, 0.72, 0.52, 1.0) * intensity * 0.9;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    globeGroup.add(atmoMesh);

    // 4. Renewable Energy Project Markers Group
    const markerGroup = new THREE.Group();
    markerGroupRef.current = markerGroup;
    globeGroup.add(markerGroup);

    // Populate Markers
    const markerMap = new Map<string, THREE.Object3D>();
    RENEWABLE_PROJECTS.forEach((proj) => {
      const pos = latLngToVector3(proj.lat, proj.lng, 1.01);
      const markerObj = new THREE.Group();
      markerObj.position.copy(pos);
      // Orient marker outward from globe center
      markerObj.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        pos.clone().normalize()
      );

      // Base ring
      const baseGeo = new THREE.RingGeometry(0.015, 0.03, 16);
      const baseMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(TECH_COLORS[proj.technology]),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const baseRing = new THREE.Mesh(baseGeo, baseMat);
      baseRing.rotation.x = Math.PI / 2;
      markerObj.add(baseRing);

      // Vertical stem
      const stemGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.05, 8);
      const stemMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(TECH_COLORS[proj.technology]),
      });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.025;
      markerObj.add(stem);

      // Glowing beacon head
      const headGeo = new THREE.SphereGeometry(0.018, 12, 12);
      const headMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(TECH_COLORS[proj.technology]),
        emissive: new THREE.Color(TECH_COLORS[proj.technology]),
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.055;
      markerObj.add(head);

      // User data for raycasting inspection
      markerObj.userData = { project: proj, headMesh: head, baseRing: baseRing };
      markerGroup.add(markerObj);
      markerMap.set(proj.id, markerObj);
    });
    markerMeshesMapRef.current = markerMap;

    // Animation Loop
    let frameId: number;
    let clock = new THREE.Clock();

    function renderLoop() {
      const delta = clock.getDelta();

      // Cloud animation
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += delta * 0.03;
      }

      // Smooth auto-rotation when user is not dragging
      if (isRotatingStateRef.current && !isDraggingRef.current && !isTargetingRef.current) {
        if (globeGroupRef.current) {
          globeGroupRef.current.rotation.y += rotationVelocityRef.current.y;
        }
      }

      // Smooth damp interpolation to targeted project
      if (isTargetingRef.current && globeGroupRef.current) {
        globeGroupRef.current.rotation.y = THREE.MathUtils.damp(
          globeGroupRef.current.rotation.y,
          targetRotationRef.current.y,
          4.5,
          delta
        );
        globeGroupRef.current.rotation.x = THREE.MathUtils.damp(
          globeGroupRef.current.rotation.x,
          targetRotationRef.current.x,
          4.5,
          delta
        );

        if (
          Math.abs(globeGroupRef.current.rotation.y - targetRotationRef.current.y) <
            0.002 &&
          Math.abs(globeGroupRef.current.rotation.x - targetRotationRef.current.x) <
            0.002
        ) {
          isTargetingRef.current = false;
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderLoop);
    }

    frameId = requestAnimationFrame(renderLoop);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
    };
  }, []);

  // Handle Layer Texture Switch
  useEffect(() => {
    if (!earthMeshRef.current) return;
    const newTexture = createProceduralEarthTexture(layerMode);
    (earthMeshRef.current.material as THREE.MeshStandardMaterial).map =
      newTexture;
    (earthMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate =
      true;
  }, [layerMode]);

  // Handle Technology Filter
  useEffect(() => {
    markerMeshesMapRef.current.forEach((markerObj) => {
      const proj = markerObj.userData.project as RenewableProject;
      if (activeFilter === 'all' || proj.technology === activeFilter) {
        markerObj.visible = true;
      } else {
        markerObj.visible = false;
      }
    });
  }, [activeFilter]);

  // Mouse & Touch Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    isTargetingRef.current = false;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Drag Rotation
    if (isDraggingRef.current && globeGroupRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.005;
      globeGroupRef.current.rotation.x = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, globeGroupRef.current.rotation.x + deltaY * 0.005)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // 2. Raycast Marker Hover
    if (!mountRef.current || !cameraRef.current || !markerGroupRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    _pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_pointer, cameraRef.current);
    const visibleMarkers: THREE.Object3D[] = [];
    markerGroupRef.current.children.forEach((child) => {
      if (child.visible) visibleMarkers.push(child);
    });

    const intersects = _raycaster.intersectObjects(visibleMarkers, true);
    if (intersects.length > 0) {
      // Find top parent marker
      let root = intersects[0].object;
      while (root.parent && root.parent !== markerGroupRef.current) {
        root = root.parent;
      }
      if (root.userData?.project) {
        setHoveredProject(root.userData.project);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        mountRef.current.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredProject(null);
    setTooltipPos(null);
    if (mountRef.current) {
      mountRef.current.style.cursor = 'grab';
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;

    // Check if clicked directly on marker
    if (!mountRef.current || !cameraRef.current || !markerGroupRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    _pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_pointer, cameraRef.current);
    const visibleMarkers: THREE.Object3D[] = [];
    markerGroupRef.current.children.forEach((child) => {
      if (child.visible) visibleMarkers.push(child);
    });

    const intersects = _raycaster.intersectObjects(visibleMarkers, true);
    if (intersects.length > 0) {
      let root = intersects[0].object;
      while (root.parent && root.parent !== markerGroupRef.current) {
        root = root.parent;
      }
      if (root.userData?.project) {
        const proj = root.userData.project as RenewableProject;
        setSelectedProject(proj);
        focusProjectCoordinates(proj.lat, proj.lng);
        if (onSelectProject) onSelectProject(proj);
      }
    }
  };

  // Zoom with Wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    e.preventDefault();
    const newZ = cameraRef.current.position.z + e.deltaY * 0.002;
    cameraRef.current.position.z = Math.max(1.8, Math.min(5.2, newZ));
  };

  return (
    <div className="relative w-full h-[620px] md:h-[720px] rounded-2xl overflow-hidden bg-radial from-[#072418] via-[#051610] to-[#030a07] border border-emerald-950/60 shadow-2xl">
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none select-none"
      />

      {/* Top Left Minimal Spec Badge */}
      <div className="absolute top-5 left-5 z-10 pointer-events-none">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/80">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>EARTH 3D EXPLORER</span>
          <span className="text-emerald-700">/</span>
          <span>{RENEWABLE_PROJECTS.length} GLOBAL CLEAN ENERGY HUBS</span>
        </div>
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsRotating(!isRotating)}
          title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            isRotating
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-black/60 border-emerald-900/30 text-emerald-500 hover:text-emerald-300'
          }`}
        >
          <RotateCw
            className={`w-3.5 h-3.5 inline mr-1.5 ${isRotating ? 'animate-spin' : ''}`}
            style={{ animationDuration: '6s' }}
          />
          {isRotating ? 'Auto-Rotate ON' : 'Paused'}
        </button>

        <div className="flex rounded-lg bg-black/60 p-0.5 border border-emerald-900/40 text-xs">
          {(['standard', 'night', 'heatmap'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setLayerMode(mode)}
              className={`px-2.5 py-1 rounded capitalize transition-all ${
                layerMode === mode
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-emerald-400/70 hover:text-emerald-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Hover Marker Tooltip */}
      {hoveredProject && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-12 bg-slate-950/90 text-white px-3 py-1.5 rounded-lg border border-emerald-500/40 shadow-xl backdrop-blur-md text-xs whitespace-nowrap"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="font-semibold text-emerald-300">
            {hoveredProject.name}
          </div>
          <div className="text-[11px] text-slate-300">
            {hoveredProject.country} · {hoveredProject.capacityMw.toLocaleString()}{' '}
            MW · {hoveredProject.techLabel}
          </div>
        </div>
      )}

      {/* Floating Project Detail Modal when a marker is clicked */}
      {selectedProject && (
        <div className="absolute top-16 right-5 z-20 w-80 md:w-96 bg-slate-950/90 border border-emerald-500/30 rounded-xl p-5 shadow-2xl backdrop-blur-md text-sm text-slate-200">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span
                className="text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: TECH_COLORS[selectedProject.technology] }}
              >
                {selectedProject.techLabel}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {selectedProject.name}
              </h3>
              <p className="text-xs text-emerald-400/80">
                {selectedProject.region}, {selectedProject.country}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedProject(null);
                if (onSelectProject) onSelectProject(null);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {selectedProject.description}
          </p>

          <div className="grid grid-cols-2 gap-2 p-3 bg-emerald-950/30 rounded-lg border border-emerald-900/30 mb-3 text-xs">
            <div>
              <div className="text-[10px] text-emerald-400/70 uppercase">
                Peak Capacity
              </div>
              <div className="font-mono font-semibold text-white">
                {selectedProject.capacityMw.toLocaleString()} MW
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400/70 uppercase">
                Annual CO2 Offset
              </div>
              <div className="font-mono font-semibold text-emerald-300">
                {(selectedProject.annualCo2OffsetTons / 1000000).toFixed(2)}M t/yr
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400/70 uppercase">
                Homes Powered
              </div>
              <div className="font-mono font-semibold text-white">
                {selectedProject.homesPoweredEquivalent.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400/70 uppercase">
                Commissioned
              </div>
              <div className="font-mono font-semibold text-white">
                {selectedProject.commissionYear}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-white/5 p-2.5 rounded-lg border border-white/5">
            <span className="text-emerald-400 font-medium">Innovation: </span>
            {selectedProject.keyInnovation}
          </div>
        </div>
      )}

      {/* Mandatory Unified Bottom Control Dock (Three.js Skill Directive) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl transition-all duration-300 ${
          isControlsCollapsed ? 'translate-y-[calc(100%-24px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Toggle Tab */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="flex items-center gap-1.5 px-4 py-1 text-xs font-medium text-emerald-300 bg-slate-950/90 border border-emerald-500/30 border-b-0 rounded-t-lg shadow-md hover:bg-emerald-950/80 transition-colors"
          >
            {isControlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Explorer Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Panel Body */}
        <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Technology Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
              <span className="text-[11px] font-mono text-emerald-400/70 whitespace-nowrap mr-1">
                FILTER:
              </span>
              {[
                { id: 'all', label: 'All Projects', icon: null },
                { id: 'solar', label: 'Solar', icon: Sun, color: '#f59e0b' },
                { id: 'wind', label: 'Wind', icon: Wind, color: '#06b6d4' },
                { id: 'hydro', label: 'Hydro', icon: Droplets, color: '#3b82f6' },
                { id: 'geothermal', label: 'Geothermal', icon: Flame, color: '#f97316' },
                { id: 'storage', label: 'Storage', icon: Battery, color: '#10b981' },
                { id: 'advanced', label: 'Fusion & DAC', icon: Atom, color: '#a855f7' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveFilter(item.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                    activeFilter === item.id
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-emerald-950/40 text-emerald-300/80 hover:bg-emerald-900/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Location Fly-To Dropdown / Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-emerald-400/70 whitespace-nowrap">
                FLY TO:
              </span>
              <select
                aria-label="Fly to renewable project"
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const proj =
                    RENEWABLE_PROJECTS.find((p) => p.id === e.target.value) ||
                    null;
                  if (proj) {
                    setSelectedProject(proj);
                    focusProjectCoordinates(proj.lat, proj.lng);
                    if (onSelectProject) onSelectProject(proj);
                  }
                }}
                className="bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option value="">Select Featured Site...</option>
                {RENEWABLE_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.country})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
