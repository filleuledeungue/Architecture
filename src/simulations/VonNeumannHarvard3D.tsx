import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useAppStore } from '../store/useAppStore';
import { SceneWrapper } from './common/SceneWrapper';
import { getSimColors } from './common/colors';
import { canUseWebGL, createChipBox, disposeSceneResources } from './common/threeUtils';

/**
 * Simulation côte à côte : Von Neumann vs Harvard (3D Three.js 60 FPS + repli 2D SVG fluide)
 * Important : la boucle rAF manipule directement les objets Three.js / SVG sans déclencher
 * de re-render React à 60 Hz, garantissant une fluidité parfaite même sur mobile.
 */
const CYCLE_MESSAGES = [
  'Cycle 1 : Von Neumann lit l’instruction sur son bus unique (la donnée attend !). Pendant ce temps, Harvard lit instruction ET donnée en même temps.',
  'Cycle 2 : Goulot d’étranglement ! Von Neumann bloque la prochaine instruction pour transférer la donnée. Harvard garde les 2 autoroutes fluides.',
  'Cycle 3 : Von Neumann libère enfin le bus pour l’instruction suivante. Harvard a déjà pris de l’avance grâce aux bus séparés.',
];

export const VonNeumannHarvard3D: React.FC = () => {
  const { state } = useAppStore();
  const isDark = state.preferences.theme === 'dark';
  const colorBlind = state.preferences.colorBlind;
  const webglOk = canUseWebGL();

  const [renderMode, setRenderMode] = useState<'3d' | '2d'>(
    state.preferences.lowPerfMode || !webglOk ? '2d' : '3d',
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  // Seul l'indice de phase discret (0, 1, 2) déclenche une mise à jour React (3 fois/cycle max)
  const [cycleIdx, setCycleIdx] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const phaseRef = useRef(0);
  const lastCycleIdxRef = useRef(0);

  // Refs SVG pour animation directe 60 FPS sans re-render React
  const svgVnInstrRef = useRef<SVGRectElement | null>(null);
  const svgVnDataRef = useRef<SVGCircleElement | null>(null);
  const svgVnGateRef = useRef<SVGRectElement | null>(null);
  const svgVnWaitDataTextRef = useRef<SVGTextElement | null>(null);
  const svgVnWaitInstrTextRef = useRef<SVGTextElement | null>(null);
  const svgHvInstrRef = useRef<SVGRectElement | null>(null);
  const svgHvDataRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (state.preferences.lowPerfMode) {
      setRenderMode('2d');
    }
  }, [state.preferences.lowPerfMode]);

  const apply2DSvgPositions = (t: number) => {
    if (svgVnInstrRef.current && svgVnDataRef.current) {
      if (t < 0.5) {
        const u = t * 2;
        svgVnInstrRef.current.setAttribute('y', String(202 - u * 82));
        svgVnInstrRef.current.setAttribute('opacity', '1');
        svgVnDataRef.current.setAttribute('cy', '196');
        svgVnDataRef.current.setAttribute('opacity', '0.5');
        if (svgVnWaitDataTextRef.current) svgVnWaitDataTextRef.current.setAttribute('opacity', '1');
        if (svgVnWaitInstrTextRef.current) svgVnWaitInstrTextRef.current.setAttribute('opacity', '0');
      } else {
        const u = (t - 0.5) * 2;
        svgVnInstrRef.current.setAttribute('y', '190');
        svgVnInstrRef.current.setAttribute('opacity', '0.5');
        svgVnDataRef.current.setAttribute('cy', String(124 + u * 80));
        svgVnDataRef.current.setAttribute('opacity', '1');
        if (svgVnWaitDataTextRef.current) svgVnWaitDataTextRef.current.setAttribute('opacity', '0');
        if (svgVnWaitInstrTextRef.current) svgVnWaitInstrTextRef.current.setAttribute('opacity', '1');
      }
    }

    if (svgVnGateRef.current) {
      const blocked = t >= 0.4 && t <= 0.6;
      svgVnGateRef.current.setAttribute('stroke-width', blocked ? '3' : '1.5');
    }

    if (svgHvInstrRef.current) {
      svgHvInstrRef.current.setAttribute('x', String(476 + t * 32));
      svgHvInstrRef.current.setAttribute('y', String(202 - t * 82));
    }
    if (svgHvDataRef.current) {
      const dtPhase = (t + 0.2) % 1;
      svgHvDataRef.current.setAttribute('cx', String(622 + dtPhase * 32));
      svgHvDataRef.current.setAttribute('cy', String(122 + dtPhase * 82));
    }
  };

  // Boucle 2D SVG fluide 60 FPS via refs DOM
  useEffect(() => {
    if (renderMode !== '2d') return;
    apply2DSvgPositions(phaseRef.current);

    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (isPlayingRef.current) {
        phaseRef.current = (phaseRef.current + dt * 0.34 * speedRef.current) % 1;
        apply2DSvgPositions(phaseRef.current);
        const nextIdx = Math.min(2, Math.floor(phaseRef.current * 3));
        if (nextIdx !== lastCycleIdxRef.current) {
          lastCycleIdxRef.current = nextIdx;
          setCycleIdx(nextIdx);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [renderMode]);

  // Scène Three.js fluide 60 FPS (aucun setState par frame !)
  useEffect(() => {
    if (renderMode !== '3d' || !containerRef.current) return;

    const mount = containerRef.current;
    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 380;
    const palette = getSimColors(colorBlind, isDark);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x0b1120 : 0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 7.6, 10.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = false; // Désactivé pour garantir 60 FPS constants
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 6;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.target.set(0, 0.4, 0);

    // Éclairage performant et contrasté
    scene.add(new THREE.HemisphereLight(0xffffff, isDark ? 0x0f172a : 0xcbd5e1, 0.85));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.35);
    dirLight.position.set(6, 10, 7);
    scene.add(dirLight);

    // --- Plateau gauche : Von Neumann ---
    const vnPlatform = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.14, 6.2),
      new THREE.MeshStandardMaterial({ color: palette.boardBase, roughness: 0.68, metalness: 0.1 }),
    );
    vnPlatform.position.set(-3.4, -0.07, 0);
    scene.add(vnPlatform);

    const vnCpu = createChipBox({
      width: 2.1,
      height: 0.55,
      depth: 1.3,
      bodyColor: palette.cpuBody,
      labelTitle: 'Unité Centrale',
      labelSubtitle: 'Von Neumann',
      accentCss: palette.addressCss,
    });
    vnCpu.group.position.set(-3.4, 0, -1.9);
    scene.add(vnCpu.group);

    const vnMem = createChipBox({
      width: 2.6,
      height: 0.55,
      depth: 1.4,
      bodyColor: palette.ramBody,
      labelTitle: 'Mémoire Principale',
      labelSubtitle: 'ROM + RAM unifiées',
      accentCss: palette.dataCss,
    });
    vnMem.group.position.set(-3.4, 0, 1.85);
    scene.add(vnMem.group);

    const vnAddrRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.06, 2.5),
      new THREE.MeshStandardMaterial({ color: palette.addressHex, roughness: 0.35 }),
    );
    vnAddrRail.position.set(-3.62, 0.04, 0);
    scene.add(vnAddrRail);

    const vnDataRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.06, 2.5),
      new THREE.MeshStandardMaterial({ color: palette.dataHex, roughness: 0.35 }),
    );
    vnDataRail.position.set(-3.18, 0.04, 0);
    scene.add(vnDataRail);

    const bottleneckRingMat = new THREE.MeshStandardMaterial({
      color: palette.controlHex,
      emissive: palette.controlHex,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    const bottleneckGate = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.05, 10, 20),
      bottleneckRingMat,
    );
    bottleneckGate.position.set(-3.4, 0.32, 0);
    scene.add(bottleneckGate);

    const vnInstrPacket = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.24, 0.32),
      new THREE.MeshStandardMaterial({
        color: palette.addressHex,
        emissive: palette.addressHex,
        emissiveIntensity: 0.55,
      }),
    );
    scene.add(vnInstrPacket);

    const vnDataPacket = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 14, 14),
      new THREE.MeshStandardMaterial({
        color: palette.dataHex,
        emissive: palette.dataHex,
        emissiveIntensity: 0.55,
      }),
    );
    scene.add(vnDataPacket);

    // --- Plateau droit : Harvard ---
    const hvPlatform = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.14, 6.2),
      new THREE.MeshStandardMaterial({ color: palette.boardBase, roughness: 0.68, metalness: 0.1 }),
    );
    hvPlatform.position.set(3.4, -0.07, 0);
    scene.add(hvPlatform);

    const hvCpu = createChipBox({
      width: 2.3,
      height: 0.55,
      depth: 1.3,
      bodyColor: palette.cpuBody,
      labelTitle: 'UAL + E/S',
      labelSubtitle: 'Harvard (Parallèle)',
      accentCss: palette.okCss,
    });
    hvCpu.group.position.set(3.4, 0, -1.9);
    scene.add(hvCpu.group);

    const hvProgMem = createChipBox({
      width: 2.2,
      height: 0.52,
      depth: 1.35,
      bodyColor: palette.romBody,
      labelTitle: 'Mém. Programme',
      labelSubtitle: 'Instructions',
      accentCss: palette.addressCss,
    });
    hvProgMem.group.position.set(2.05, 0, 1.85);
    scene.add(hvProgMem.group);

    const hvDataMem = createChipBox({
      width: 2.2,
      height: 0.52,
      depth: 1.35,
      bodyColor: palette.ramBody,
      labelTitle: 'Mém. Données',
      labelSubtitle: 'Variables RAM',
      accentCss: palette.dataCss,
    });
    hvDataMem.group.position.set(4.75, 0, 1.85);
    scene.add(hvDataMem.group);

    const hvProgRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.06, 2.7),
      new THREE.MeshStandardMaterial({ color: palette.addressHex, roughness: 0.35 }),
    );
    hvProgRail.position.set(2.4, 0.04, 0);
    hvProgRail.rotation.y = 0.24;
    scene.add(hvProgRail);

    const hvDataRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.06, 2.7),
      new THREE.MeshStandardMaterial({ color: palette.dataHex, roughness: 0.35 }),
    );
    hvDataRail.position.set(4.4, 0.04, 0);
    hvDataRail.rotation.y = -0.24;
    scene.add(hvDataRail);

    const hvInstrPacket = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.24, 0.32),
      new THREE.MeshStandardMaterial({
        color: palette.addressHex,
        emissive: palette.addressHex,
        emissiveIntensity: 0.55,
      }),
    );
    scene.add(hvInstrPacket);

    const hvDataPacket = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 14, 14),
      new THREE.MeshStandardMaterial({
        color: palette.dataHex,
        emissive: palette.dataHex,
        emissiveIntensity: 0.55,
      }),
    );
    scene.add(hvDataPacket);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(mount);

    let rafId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (isPlayingRef.current) {
        phaseRef.current = (phaseRef.current + dt * 0.34 * speedRef.current) % 1;
        const nextIdx = Math.min(2, Math.floor(phaseRef.current * 3));
        if (nextIdx !== lastCycleIdxRef.current) {
          lastCycleIdxRef.current = nextIdx;
          setCycleIdx(nextIdx);
        }
      }

      const t = phaseRef.current;

      if (t < 0.5) {
        const u = t * 2;
        vnInstrPacket.position.set(-3.62, 0.3, 1.15 - u * 2.35);
        vnDataPacket.position.set(-3.18, 0.3, 0.72 + Math.sin(u * Math.PI * 3) * 0.08);
        bottleneckRingMat.emissiveIntensity = 0.25 + 0.55 * Math.sin(u * Math.PI);
      } else {
        const u = (t - 0.5) * 2;
        vnInstrPacket.position.set(-3.62, 0.3, 0.72 + Math.sin(u * Math.PI * 3) * 0.08);
        vnDataPacket.position.set(-3.18, 0.3, -1.2 + u * 2.35);
        bottleneckRingMat.emissiveIntensity = 0.25 + 0.55 * Math.sin(u * Math.PI);
      }

      const hvProgT = t;
      const hvDataT = (t + 0.15) % 1;
      hvInstrPacket.position.set(
        THREE.MathUtils.lerp(2.05, 2.75, hvProgT),
        0.3,
        THREE.MathUtils.lerp(1.15, -1.2, hvProgT),
      );
      hvDataPacket.position.set(
        THREE.MathUtils.lerp(4.05, 4.75, hvDataT),
        0.3,
        THREE.MathUtils.lerp(-1.2, 1.15, hvDataT),
      );

      controls.update();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.dispose();
      disposeSceneResources(scene);
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [renderMode, isDark, colorBlind]);

  const handleStep = () => {
    setIsPlaying(false);
    const nextIdx = (lastCycleIdxRef.current + 1) % 3;
    const nextPhase = nextIdx / 3 + 0.08;
    phaseRef.current = nextPhase % 1;
    lastCycleIdxRef.current = nextIdx;
    setCycleIdx(nextIdx);
    if (renderMode === '2d') {
      apply2DSvgPositions(phaseRef.current);
    }
  };

  const handleReset = () => {
    phaseRef.current = 0;
    lastCycleIdxRef.current = 0;
    setCycleIdx(0);
    setIsPlaying(true);
    if (renderMode === '2d') {
      apply2DSvgPositions(0);
    }
  };

  return (
    <SceneWrapper
      title="Simulation : Von Neumann vs Harvard"
      subtitle="Fais glisser pour tourner la scène 3D (ou passe en Schéma 2D Éco). Observe le bouchon sur le bus unique de Von Neumann."
      isPlaying={isPlaying}
      onTogglePlay={() => setIsPlaying((p) => !p)}
      onStep={handleStep}
      onReset={handleReset}
      speed={speed}
      onSpeedChange={setSpeed}
      renderMode={renderMode}
      onRenderModeChange={setRenderMode}
      statusText={CYCLE_MESSAGES[cycleIdx]}
    >
      {renderMode === '3d' ? (
        <div
          ref={containerRef}
          className="w-full h-[320px] sm:h-[380px] cursor-grab active:cursor-grabbing"
          aria-label="Simulation 3D comparant Von Neumann et Harvard"
        />
      ) : (
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
          <svg
            viewBox="0 0 760 320"
            className="w-full h-auto max-h-[340px]"
            role="img"
            aria-label="Schéma animé 2D comparant Von Neumann et Harvard"
          >
            <rect
              x="16"
              y="16"
              width="348"
              height="288"
              rx="16"
              fill={isDark ? '#111827' : '#ffffff'}
              stroke={isDark ? '#334155' : '#cbd5e1'}
              strokeWidth="1.5"
            />
            <text
              x="190"
              y="44"
              textAnchor="middle"
              fill={isDark ? '#f8fafc' : '#0f172a'}
              fontSize="15"
              fontWeight="700"
            >
              VON NEUMANN (1 seul bus partagé)
            </text>

            <rect
              x="105"
              y="62"
              width="170"
              height="52"
              rx="10"
              fill={isDark ? '#1e293b' : '#334155'}
            />
            <text x="190" y="93" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">
              Unité Centrale + E/S
            </text>

            <line
              x1="172"
              y1="114"
              x2="172"
              y2="214"
              stroke="var(--bus-address)"
              strokeWidth="5"
            />
            <line
              x1="208"
              y1="114"
              x2="208"
              y2="214"
              stroke="var(--bus-data)"
              strokeWidth="5"
            />
            <rect
              ref={svgVnGateRef}
              x="120"
              y="151"
              width="140"
              height="26"
              rx="6"
              fill={isDark ? '#1e293b' : '#fef3c7'}
              stroke="var(--bus-control)"
              strokeWidth="1.5"
            />
            <text
              x="190"
              y="168"
              textAnchor="middle"
              fill={isDark ? '#fcd34d' : '#9a3412'}
              fontSize="11"
              fontWeight="700"
            >
              GOULOT (1 accès/cycle)
            </text>

            <rect
              ref={svgVnInstrRef}
              x="162"
              y="190"
              width="20"
              height="16"
              rx="4"
              fill="var(--bus-address)"
            />
            <circle ref={svgVnDataRef} cx="208" cy="196" r="8" fill="var(--bus-data)" />

            <text
              ref={svgVnWaitDataTextRef}
              x="275"
              y="198"
              fill="var(--bus-data)"
              fontSize="10"
              fontWeight="600"
            >
              Donnée attend…
            </text>
            <text
              ref={svgVnWaitInstrTextRef}
              x="98"
              y="198"
              textAnchor="end"
              fill="var(--bus-address)"
              fontSize="10"
              fontWeight="600"
              opacity="0"
            >
              Instr. attend…
            </text>

            <rect x="75" y="214" width="230" height="66" rx="10" fill="#0d9488" />
            <text x="190" y="244" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="700">
              Mémoire Principale Unique
            </text>
            <text x="190" y="263" textAnchor="middle" fill="#ccfbf1" fontSize="11">
              ROM (Programme) + RAM (Données)
            </text>

            <rect
              x="396"
              y="16"
              width="348"
              height="288"
              rx="16"
              fill={isDark ? '#111827' : '#ffffff'}
              stroke={isDark ? '#334155' : '#cbd5e1'}
              strokeWidth="1.5"
            />
            <text
              x="570"
              y="44"
              textAnchor="middle"
              fill={isDark ? '#f8fafc' : '#0f172a'}
              fontSize="15"
              fontWeight="700"
            >
              HARVARD (2 bus indépendants)
            </text>

            <rect
              x="475"
              y="62"
              width="190"
              height="52"
              rx="10"
              fill={isDark ? '#1e293b' : '#334155'}
            />
            <text x="570" y="93" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">
              UAL + Entrées / Sorties
            </text>

            <line
              x1="518"
              y1="114"
              x2="486"
              y2="214"
              stroke="var(--bus-address)"
              strokeWidth="5"
            />
            <line
              x1="622"
              y1="114"
              x2="654"
              y2="214"
              stroke="var(--bus-data)"
              strokeWidth="5"
            />

            <rect
              ref={svgHvInstrRef}
              x="476"
              y="202"
              width="20"
              height="16"
              rx="4"
              fill="var(--bus-address)"
            />
            <circle ref={svgHvDataRef} cx="622" cy="122" r="8" fill="var(--bus-data)" />

            <text
              x="570"
              y="168"
              textAnchor="middle"
              fill="var(--semantic-ok)"
              fontSize="11"
              fontWeight="700"
            >
              SIMULTANÉ ✓
            </text>

            <rect x="416" y="214" width="142" height="66" rx="10" fill="#4f46e5" />
            <text x="487" y="244" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">
              Mém. Programme
            </text>
            <text x="487" y="263" textAnchor="middle" fill="#e0e7ff" fontSize="10.5">
              Instructions seules
            </text>

            <rect x="582" y="214" width="142" height="66" rx="10" fill="#0d9488" />
            <text x="653" y="244" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">
              Mém. Données
            </text>
            <text x="653" y="263" textAnchor="middle" fill="#ccfbf1" fontSize="10.5">
              Variables (RAM)
            </text>
          </svg>
        </div>
      )}
    </SceneWrapper>
  );
};
