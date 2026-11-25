import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useAppStore } from '../store/useAppStore';
import { SceneWrapper } from './common/SceneWrapper';
import { getSimColors } from './common/colors';
import { canUseWebGL, createChipBox, disposeSceneResources } from './common/threeUtils';

export type MemoryZoneId = 'periph1' | 'free1' | 'ram' | 'free2' | 'rom';

interface MemoryZoneInfo {
  id: MemoryZoneId;
  label: string;
  range: string;
  start: number;
  end: number;
  writable: boolean;
  hasChip: boolean;
  description: string;
}

const MEMORY_MAP: MemoryZoneInfo[] = [
  {
    id: 'periph1',
    label: 'Périphérique 1',
    range: '$0000 – $0003',
    start: 0x0000,
    end: 0x0003,
    writable: true,
    hasChip: true,
    description: '4 registres d’interface E/S. Le décodeur active CS_PERIPH1.',
  },
  {
    id: 'free1',
    label: 'Espace Libre (bas)',
    range: '$0004 – $1FFF',
    start: 0x0004,
    end: 0x1fff,
    writable: false,
    hasChip: false,
    description: 'Zone non câblée : aucun CS activé, aucune puce ne répond sur le bus.',
  },
  {
    id: 'ram',
    label: 'Mémoire RAM',
    range: '$2000 – $3FFF',
    start: 0x2000,
    end: 0x3fff,
    writable: true,
    hasChip: true,
    description: '8 Kio de RAM lecture/écriture. Le décodeur active CS_RAM.',
  },
  {
    id: 'free2',
    label: 'Espace Libre (haut)',
    range: '$4000 – $4FFF',
    start: 0x4000,
    end: 0x4fff,
    writable: false,
    hasChip: false,
    description: 'Zone libre juste avant la frontière $4FFF de la ROM sur la diapo 9.',
  },
  {
    id: 'rom',
    label: 'Mémoire ROM',
    range: '$5000 – $FFFF',
    start: 0x5000,
    end: 0xffff,
    writable: false,
    hasChip: true,
    description: 'Mémoire programme non volatile (lecture seule). Le décodeur active CS_ROM.',
  },
];

function resolveAddress(addr: number): MemoryZoneInfo {
  return (
    MEMORY_MAP.find((z) => addr >= z.start && addr <= z.end) ??
    MEMORY_MAP[MEMORY_MAP.length - 1]
  );
}

const PRESETS = [
  { label: 'Périph. 1 ($0002)', addr: 0x0002 },
  { label: 'Libre ($1200)', addr: 0x1200 },
  { label: 'RAM ($2A10)', addr: 0x2a10 },
  { label: 'Libre ($4500)', addr: 0x4500 },
  { label: 'ROM ($E100)', addr: 0xe100 },
];

/**
 * Simulation interactive du décodage d'adresse et de la cartographie mémoire $0000-$FFFF
 * Optimisée 60 FPS (mises à jour React uniquement au changement de phase 1/2/3).
 */
export const AddressDecoding3D: React.FC = () => {
  const { state } = useAppStore();
  const isDark = state.preferences.theme === 'dark';
  const colorBlind = state.preferences.colorBlind;
  const webglOk = canUseWebGL();

  const [renderMode, setRenderMode] = useState<'3d' | '2d'>(
    state.preferences.lowPerfMode || !webglOk ? '2d' : '3d',
  );
  const [address, setAddress] = useState<number>(0x2a10);
  const [addrInput, setAddrInput] = useState<string>('2A10');
  const [rwMode, setRwMode] = useState<'R' | 'W'>('R');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [phaseIndex, setPhaseIndex] = useState<1 | 2 | 3>(1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const stepRef = useRef(0);
  const lastPhaseRef = useRef<1 | 2 | 3>(1);
  const zoneRef = useRef<MemoryZoneInfo>(resolveAddress(address));
  const rwRef = useRef(rwMode);

  // Refs SVG pour animation 2D fluide 60 FPS
  const svgAddrPacketRef = useRef<SVGRectElement | null>(null);
  const svgDataPacketRef = useRef<SVGCircleElement | null>(null);

  const activeZone = useMemo(() => resolveAddress(address), [address]);
  const writeBlockedInRom = rwMode === 'W' && activeZone.id === 'rom';

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    zoneRef.current = activeZone;
  }, [activeZone]);
  useEffect(() => {
    rwRef.current = rwMode;
  }, [rwMode]);

  useEffect(() => {
    if (state.preferences.lowPerfMode) setRenderMode('2d');
  }, [state.preferences.lowPerfMode]);

  const handleHexChange = (raw: string) => {
    const clean = raw.replace(/[^0-9a-fA-F]/g, '').slice(0, 4).toUpperCase();
    setAddrInput(clean);
    if (clean.length > 0) {
      const parsed = parseInt(clean, 16);
      if (!Number.isNaN(parsed)) {
        setAddress(Math.min(0xffff, Math.max(0, parsed)));
      }
    }
  };

  const selectPreset = (val: number) => {
    setAddress(val);
    setAddrInput(val.toString(16).toUpperCase().padStart(4, '0'));
    stepRef.current = 0.02;
    lastPhaseRef.current = 1;
    setPhaseIndex(1);
  };

  const update2DSvgPackets = (p: number) => {
    const zInfo = zoneRef.current;
    const rw = rwRef.current;
    const blockedRom = rw === 'W' && zInfo.id === 'rom';

    if (svgAddrPacketRef.current) {
      if (p < 0.33) {
        svgAddrPacketRef.current.setAttribute('opacity', '1');
        svgAddrPacketRef.current.setAttribute('x', String(182 + (p / 0.33) * 124));
      } else {
        svgAddrPacketRef.current.setAttribute('opacity', '0');
      }
    }

    if (svgDataPacketRef.current) {
      if (p >= 0.66 && zInfo.hasChip && !blockedRom) {
        svgDataPacketRef.current.setAttribute('opacity', '1');
        const u = (p - 0.66) / 0.34;
        svgDataPacketRef.current.setAttribute(
          'cx',
          String(rw === 'R' ? 466 - u * 280 : 186 + u * 280),
        );
      } else {
        svgDataPacketRef.current.setAttribute('opacity', '0');
      }
    }
  };

  // Boucle 2D 60 FPS
  useEffect(() => {
    if (renderMode !== '2d') return;
    update2DSvgPackets(stepRef.current);

    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (isPlayingRef.current) {
        stepRef.current = (stepRef.current + dt * 0.3 * speedRef.current) % 1;
        update2DSvgPackets(stepRef.current);
        const nextP: 1 | 2 | 3 = stepRef.current < 0.33 ? 1 : stepRef.current < 0.66 ? 2 : 3;
        if (nextP !== lastPhaseRef.current) {
          lastPhaseRef.current = nextP;
          setPhaseIndex(nextP);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [renderMode]);

  // Scène Three.js 60 FPS
  useEffect(() => {
    if (renderMode !== '3d' || !containerRef.current) return;
    const mount = containerRef.current;
    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 390;
    const palette = getSimColors(colorBlind, isDark);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x0b1120 : 0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0.2, 6.8, 10.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = false;
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

    scene.add(new THREE.HemisphereLight(0xffffff, isDark ? 0x0f172a : 0xcbd5e1, 0.85));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(5, 10, 6);
    scene.add(dirLight);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(11.4, 0.16, 6.6),
      new THREE.MeshStandardMaterial({ color: palette.boardBase, roughness: 0.7 }),
    );
    board.position.set(0, -0.08, 0);
    scene.add(board);

    const cpu = createChipBox({
      width: 2.2,
      height: 0.65,
      depth: 2.2,
      bodyColor: palette.cpuBody,
      labelTitle: 'Unité Centrale',
      labelSubtitle: 'Bus 16 bits ($0000-$FFFF)',
      accentCss: palette.addressCss,
    });
    cpu.group.position.set(-4.1, 0, 0);
    scene.add(cpu.group);

    const decoder = createChipBox({
      width: 2.0,
      height: 0.5,
      depth: 1.4,
      bodyColor: palette.decoderBody,
      labelTitle: 'Décodeur',
      labelSubtitle: 'Génère /CS',
      accentCss: palette.controlCss,
    });
    decoder.group.position.set(-0.6, 0, -1.7);
    scene.add(decoder.group);

    const chipSpecs: {
      id: MemoryZoneId;
      z: number;
      title: string;
      sub: string;
      color: number;
      accent: string;
    }[] = [
      {
        id: 'periph1',
        z: -2.15,
        title: 'Périphérique 1',
        sub: '$0000 – $0003',
        color: palette.periphBody,
        accent: palette.addressCss,
      },
      {
        id: 'ram',
        z: -0.2,
        title: 'RAM (8 Kio)',
        sub: '$2000 – $3FFF',
        color: palette.ramBody,
        accent: palette.okCss,
      },
      {
        id: 'rom',
        z: 1.85,
        title: 'ROM (Programme)',
        sub: '$5000 – $FFFF',
        color: palette.romBody,
        accent: palette.controlCss,
      },
    ];

    const targetMeshes: Record<
      string,
      { mat: THREE.MeshStandardMaterial; z: number; csLine: THREE.Mesh }
    > = {};

    for (const spec of chipSpecs) {
      const chip = createChipBox({
        width: 2.45,
        height: 0.55,
        depth: 1.25,
        bodyColor: spec.color,
        labelTitle: spec.title,
        labelSubtitle: spec.sub,
        accentCss: spec.accent,
      });
      chip.group.position.set(3.6, 0, spec.z);
      scene.add(chip.group);

      const startVec = new THREE.Vector3(0.4, 0.14, -1.7);
      const endVec = new THREE.Vector3(2.35, 0.14, spec.z);
      const dist = startVec.distanceTo(endVec);
      const csMat = new THREE.MeshStandardMaterial({
        color: palette.controlHex,
        emissive: palette.controlHex,
        emissiveIntensity: 0.1,
        roughness: 0.35,
      });
      const csLine = new THREE.Mesh(new THREE.BoxGeometry(dist, 0.05, 0.08), csMat);
      csLine.position.copy(startVec).lerp(endVec, 0.5);
      csLine.rotation.y = -Math.atan2(endVec.z - startVec.z, endVec.x - startVec.x);
      scene.add(csLine);

      targetMeshes[spec.id] = { mat: chip.bodyMat, z: spec.z, csLine };
    }

    const addrRail = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.06, 0.14),
      new THREE.MeshStandardMaterial({ color: palette.addressHex, roughness: 0.35 }),
    );
    addrRail.position.set(-0.2, 0.04, 0.25);
    scene.add(addrRail);

    const dataRail = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.06, 0.16),
      new THREE.MeshStandardMaterial({ color: palette.dataHex, roughness: 0.35 }),
    );
    dataRail.position.set(-0.2, 0.04, 0.85);
    scene.add(dataRail);

    const addrPacket = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.24, 0.32),
      new THREE.MeshStandardMaterial({
        color: palette.addressHex,
        emissive: palette.addressHex,
        emissiveIntensity: 0.6,
      }),
    );
    scene.add(addrPacket);

    const dataPacket = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 14, 14),
      new THREE.MeshStandardMaterial({
        color: palette.dataHex,
        emissive: palette.dataHex,
        emissiveIntensity: 0.6,
      }),
    );
    scene.add(dataPacket);

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
        stepRef.current = (stepRef.current + dt * 0.3 * speedRef.current) % 1;
        const nextP: 1 | 2 | 3 = stepRef.current < 0.33 ? 1 : stepRef.current < 0.66 ? 2 : 3;
        if (nextP !== lastPhaseRef.current) {
          lastPhaseRef.current = nextP;
          setPhaseIndex(nextP);
        }
      }

      const p = stepRef.current;
      const zInfo = zoneRef.current;
      const rw = rwRef.current;

      for (const [id, item] of Object.entries(targetMeshes)) {
        const csMat = item.csLine.material as THREE.MeshStandardMaterial;
        const isSelected = zInfo.hasChip && zInfo.id === id && p >= 0.33;
        item.mat.emissive.setHex(isSelected ? palette.okHex : 0x000000);
        item.mat.emissiveIntensity = isSelected ? 0.32 : 0;
        csMat.emissiveIntensity = isSelected ? 0.9 : 0.08;
      }

      if (p < 0.33) {
        const u = p / 0.33;
        addrPacket.visible = true;
        addrPacket.position.set(
          THREE.MathUtils.lerp(-2.8, -0.6, u),
          0.28,
          THREE.MathUtils.lerp(0.25, -1.0, u),
        );
        dataPacket.visible = false;
      } else if (p < 0.66) {
        addrPacket.visible = true;
        addrPacket.position.set(-0.6, 0.38, -0.9);
        dataPacket.visible = false;
      } else {
        addrPacket.visible = false;
        const targetEntry = targetMeshes[zInfo.id];
        const canTransfer = zInfo.hasChip && !(rw === 'W' && zInfo.id === 'rom');
        if (targetEntry && canTransfer) {
          dataPacket.visible = true;
          const u = (p - 0.66) / 0.34;
          const fromX = rw === 'R' ? 2.4 : -2.8;
          const toX = rw === 'R' ? -2.8 : 2.4;
          const fromZ = rw === 'R' ? targetEntry.z : 0.85;
          const toZ = rw === 'R' ? 0.85 : targetEntry.z;
          dataPacket.position.set(
            THREE.MathUtils.lerp(fromX, toX, u),
            0.3,
            THREE.MathUtils.lerp(fromZ, toZ, u),
          );
        } else {
          dataPacket.visible = false;
        }
      }

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

  const hexFormatted = `$${address.toString(16).toUpperCase().padStart(4, '0')}`;

  const statusText = useMemo(() => {
    if (phaseIndex === 1) {
      return `Phase 1/3 · L’Unité Centrale envoie l’adresse ${hexFormatted} sur le bus d’adresses bleu vers le décodeur.`;
    }
    if (phaseIndex === 2) {
      if (!activeZone.hasChip) {
        return `Phase 2/3 · ${hexFormatted} tombe dans ${activeZone.label} (${activeZone.range}) : aucun /CS activé !`;
      }
      if (writeBlockedInRom) {
        return `Phase 2/3 · /CS_ROM actif pour ${hexFormatted}, mais écriture impossible en ROM (mémoire morte) !`;
      }
      return `Phase 2/3 · Le décodeur reconnaît ${activeZone.range} et active uniquement le /CS de « ${activeZone.label} ».`;
    }
    if (!activeZone.hasChip) {
      return `Phase 3/3 · Aucun boîtier câblé à l’adresse ${hexFormatted} : aucune donnée valide sur le bus rouge.`;
    }
    if (writeBlockedInRom) {
      return `Phase 3/3 · Écriture refusée : la ROM ($5000–$FFFF) est en lecture seule.`;
    }
    return rwMode === 'R'
      ? `Phase 3/3 · Lecture : « ${activeZone.label} » place l’octet demandé sur le bus de données rouge vers le CPU.`
      : `Phase 3/3 · Écriture : le CPU envoie l’octet sur le bus rouge vers « ${activeZone.label} ».`;
  }, [phaseIndex, hexFormatted, activeZone, writeBlockedInRom, rwMode]);

  const handleStep = () => {
    setIsPlaying(false);
    const nextP: 1 | 2 | 3 = phaseIndex === 1 ? 2 : phaseIndex === 2 ? 3 : 1;
    const nextProgress = nextP === 1 ? 0.1 : nextP === 2 ? 0.45 : 0.78;
    stepRef.current = nextProgress;
    lastPhaseRef.current = nextP;
    setPhaseIndex(nextP);
    if (renderMode === '2d') {
      update2DSvgPackets(nextProgress);
    }
  };

  const handleReset = () => {
    stepRef.current = 0;
    lastPhaseRef.current = 1;
    setPhaseIndex(1);
    setIsPlaying(true);
    if (renderMode === '2d') {
      update2DSvgPackets(0);
    }
  };

  return (
    <SceneWrapper
      title="Simulation : Décodage d’adresse & Cartographie ($0000–$FFFF)"
      subtitle="Teste une adresse du cours (diapo 9) et observe comment le décodeur évite les conflits de bus."
      isPlaying={isPlaying}
      onTogglePlay={() => setIsPlaying((p) => !p)}
      onStep={handleStep}
      onReset={handleReset}
      speed={speed}
      onSpeedChange={setSpeed}
      renderMode={renderMode}
      onRenderModeChange={setRenderMode}
      statusText={statusText}
      extraControls={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Adresse 16 bits :</span>
              <span className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 min-h-[42px]">
                <span className="font-mono text-slate-400 mr-1">$</span>
                <input
                  type="text"
                  value={addrInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  maxLength={4}
                  aria-label="Adresse hexadécimale 16 bits"
                  className="w-16 font-mono font-semibold text-sm uppercase bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none tabular-nums"
                />
              </span>
            </label>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRwMode('R')}
                className={`min-h-[42px] px-3 rounded-xl text-xs font-medium border transition-colors ${
                  rwMode === 'R'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                Lecture (R)
              </button>
              <button
                type="button"
                onClick={() => setRwMode('W')}
                className={`min-h-[42px] px-3 rounded-xl text-xs font-medium border transition-colors ${
                  rwMode === 'W'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                Écriture (W)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => {
              const isCurr = resolveAddress(p.addr).id === activeZone.id;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => selectPreset(p.addr)}
                  className={`min-h-[38px] px-3 rounded-lg text-xs font-mono border transition-colors ${
                    isCurr
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      }
    >
      {renderMode === '3d' ? (
        <div
          ref={containerRef}
          className="w-full h-[320px] sm:h-[390px] cursor-grab active:cursor-grabbing"
          aria-label="Simulation 3D du décodage d'adresse"
        />
      ) : (
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
          <svg
            viewBox="0 0 760 340"
            className="w-full h-auto max-h-[350px]"
            role="img"
            aria-label="Schéma 2D du décodage d'adresse et de la cartographie mémoire"
          >
            <rect
              x="24"
              y="108"
              width="148"
              height="120"
              rx="14"
              fill={isDark ? '#1e293b' : '#334155'}
            />
            <text x="98" y="156" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700">
              Unité Centrale
            </text>
            <text x="98" y="180" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontFamily="monospace">
              Adr : {hexFormatted}
            </text>
            <text x="98" y="200" textAnchor="middle" fill="#fcd34d" fontSize="11" fontWeight="600">
              Mode : {rwMode === 'R' ? 'LECTURE' : 'ÉCRITURE'}
            </text>

            <rect
              x="238"
              y="26"
              width="160"
              height="76"
              rx="12"
              fill={isDark ? '#7c2d12' : '#c2410c'}
            />
            <text x="318" y="58" textAnchor="middle" fill="#ffffff" fontSize="13.5" fontWeight="700">
              Décodeur d’adresse
            </text>
            <text x="318" y="80" textAnchor="middle" fill="#fed7aa" fontSize="11">
              {activeZone.hasChip && phaseIndex >= 2
                ? `Active /CS_${activeZone.id.toUpperCase()}`
                : 'Aucun /CS actif'}
            </text>

            <path
              d="M 172 142 L 478 142 M 318 142 L 318 102"
              fill="none"
              stroke="var(--bus-address)"
              strokeWidth="4.5"
            />
            <line
              x1="172"
              y1="196"
              x2="478"
              y2="196"
              stroke="var(--bus-data)"
              strokeWidth="4.5"
            />

            {MEMORY_MAP.map((zone, idx) => {
              const y = 20 + idx * 62;
              const isMatch = zone.id === activeZone.id;
              const isLit = isMatch && phaseIndex >= 2;
              const fill =
                zone.id === 'periph1'
                  ? '#0284c7'
                  : zone.id === 'ram'
                    ? '#0d9488'
                    : zone.id === 'rom'
                      ? '#4f46e5'
                      : isDark
                        ? '#1e293b'
                        : '#e2e8f0';
              const textFill = zone.hasChip ? '#ffffff' : isDark ? '#94a3b8' : '#475569';

              return (
                <g key={zone.id}>
                  {zone.hasChip && (
                    <line
                      x1="398"
                      y1="64"
                      x2="478"
                      y2={y + 26}
                      stroke="var(--bus-control)"
                      strokeWidth={isLit ? 4 : 1.5}
                      strokeDasharray={isLit ? undefined : '4 4'}
                      opacity={isLit ? 1 : 0.45}
                    />
                  )}
                  <rect
                    x="478"
                    y={y}
                    width="256"
                    height="52"
                    rx="10"
                    fill={fill}
                    stroke={isLit ? 'var(--bus-control)' : isDark ? '#334155' : '#94a3b8'}
                    strokeWidth={isLit ? 3 : 1}
                  />
                  <text x="494" y={y + 22} fill={textFill} fontSize="13" fontWeight="700">
                    {zone.label}
                  </text>
                  <text
                    x="494"
                    y={y + 40}
                    fill={textFill}
                    fontSize="11"
                    fontFamily="monospace"
                    opacity="0.9"
                  >
                    {zone.range}
                  </text>
                  {isMatch && (
                    <text
                      x="720"
                      y={y + 31}
                      textAnchor="end"
                      fill={zone.hasChip ? '#fde047' : 'var(--bus-data)'}
                      fontSize="11"
                      fontWeight="700"
                    >
                      {zone.hasChip ? 'CS ACTIF ✓' : 'LIBRE ✕'}
                    </text>
                  )}
                </g>
              );
            })}

            <rect
              ref={svgAddrPacketRef}
              x="182"
              y="133"
              width="20"
              height="18"
              rx="4"
              fill="var(--bus-address)"
            />
            <circle
              ref={svgDataPacketRef}
              cx="466"
              cy="196"
              r="9"
              fill="var(--bus-data)"
              opacity="0"
            />
          </svg>
        </div>
      )}
    </SceneWrapper>
  );
};
