import * as THREE from 'three';

/**
 * Crée une étiquette nette sur texture Canvas pour les composants 3D
 * (évite les badges HTML flottants qui masquent la scène)
 */
export function makeLabelTexture(
  title: string,
  subtitle?: string,
  bgColor = '#0f172a',
  textColor = '#f8fafc',
  accentColor = '#38bdf8',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Liseré supérieur discret
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, canvas.width, 14);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(title, canvas.width / 2, subtitle ? 76 : 98);

    if (subtitle) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 28px "IBM Plex Mono", monospace';
      ctx.fillText(subtitle, canvas.width / 2, 134);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Construit un boîtier électronique composite (corps, broches dorées, plaque étiquette)
 */
export function createChipBox(options: {
  width: number;
  height: number;
  depth: number;
  bodyColor: number;
  pinColor?: number;
  labelTitle: string;
  labelSubtitle?: string;
  accentCss?: string;
}): {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  bodyMat: THREE.MeshStandardMaterial;
} {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: options.bodyColor,
    roughness: 0.42,
    metalness: 0.18,
  });

  const bodyGeo = new THREE.BoxGeometry(options.width, options.height, options.depth);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = options.height / 2 + 0.08;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Plaque d'étiquette sur la face supérieure
  const labelTex = makeLabelTexture(
    options.labelTitle,
    options.labelSubtitle,
    '#0f172a',
    '#f8fafc',
    options.accentCss ?? '#38bdf8',
  );
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.5,
    metalness: 0.05,
  });
  const labelGeo = new THREE.PlaneGeometry(options.width * 0.88, options.depth * 0.78);
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.position.y = options.height + 0.085;
  group.add(labelMesh);

  // Broches métalliques latérales (rendu matériel réaliste)
  const pinMat = new THREE.MeshStandardMaterial({
    color: options.pinColor ?? 0xd4af37,
    roughness: 0.28,
    metalness: 0.82,
  });
  const pinCount = Math.max(3, Math.floor(options.width * 3));
  const pinGeo = new THREE.BoxGeometry(0.06, 0.08, 0.16);
  for (let i = 0; i < pinCount; i++) {
    const px = -options.width * 0.4 + (i / Math.max(1, pinCount - 1)) * (options.width * 0.8);
    const frontPin = new THREE.Mesh(pinGeo, pinMat);
    frontPin.position.set(px, 0.04, options.depth / 2 + 0.05);
    group.add(frontPin);

    const backPin = new THREE.Mesh(pinGeo, pinMat);
    backPin.position.set(px, 0.04, -options.depth / 2 - 0.05);
    group.add(backPin);
  }

  return { group, bodyMesh, bodyMat };
}

/**
 * Vérifie si WebGL est disponible sans rendu logiciel dégradé
 */
export function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Libère proprement toute la mémoire GPU d'une scène Three.js
 */
export function disposeSceneResources(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        if (!m) continue;
        const std = m as THREE.MeshStandardMaterial;
        std.map?.dispose();
        std.emissiveMap?.dispose();
        m.dispose();
      }
    }
  });
}
