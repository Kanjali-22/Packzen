import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createBoxTextureCanvas } from './defaultArtworks';

/**
 * Realistic 3D Corrugated Cardboard Mailer Box with Hinge Open/Close Animation
 * Matches Reference Image 1 (three-quarter perspective, kraft corrugated texture,
 * watermark / prompt on top, interactive lid opening).
 */
export function RealisticMailerBox({
  dimensions = { width: 3.15, height: 0.62, depth: 2.02 },
  packageColor = '#c2a075',
  artwork = null,
  openProgress = 0, // 0 = closed, 1 = open
  showWireframe = false,
  showWatermark = true
}) {
  const { width: W, height: H, depth: D } = dimensions;
  const wallThickness = 0.035;

  // Generate or update canvas texture for lid face
  const texture = useMemo(() => {
    if (artwork?.src) {
      const loader = new THREE.TextureLoader();
      const loaded = loader.load(artwork.src);
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.wrapS = THREE.ClampToEdgeWrapping;
      loaded.wrapT = THREE.ClampToEdgeWrapping;
      return loaded;
    }

    // Otherwise, generate procedural kraft texture with watermark pattern
    const canvas = createBoxTextureCanvas({
      packageColor,
      showWatermark,
      scale: artwork?.scale ?? 1,
      offsetX: artwork?.offsetX ?? 0,
      offsetY: artwork?.offsetY ?? 0
    });
    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    canvasTexture.wrapS = THREE.ClampToEdgeWrapping;
    canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
    return canvasTexture;
  }, [artwork?.src, artwork?.scale, artwork?.offsetX, artwork?.offsetY, packageColor, showWatermark]);

  // Cardboard materials
  const kraftMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: packageColor,
      roughness: 0.88,
      metalness: 0.02,
      wireframe: showWireframe,
      side: THREE.DoubleSide
    });
  }, [packageColor, showWireframe]);

  const lidTopMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.82,
      metalness: 0.02,
      wireframe: showWireframe,
      side: THREE.DoubleSide
    });
  }, [texture, showWireframe]);

  // Darker inner cardboard material for depth
  const innerKraftMaterial = useMemo(() => {
    const innerColor = new THREE.Color(packageColor).multiplyScalar(0.92);
    return new THREE.MeshStandardMaterial({
      color: innerColor,
      roughness: 0.92,
      metalness: 0.01,
      wireframe: showWireframe,
      side: THREE.DoubleSide
    });
  }, [packageColor, showWireframe]);

  // Fluting / corrugated edge cut material
  const edgeCutMaterial = useMemo(() => {
    const edgeColor = new THREE.Color(packageColor).multiplyScalar(0.78);
    return new THREE.MeshStandardMaterial({
      color: edgeColor,
      roughness: 0.95,
      metalness: 0,
      wireframe: showWireframe
    });
  }, [packageColor, showWireframe]);

  // Lid hinge rotation calculation:
  // When openProgress goes 0 -> 1, lid rotates back around rear top edge
  const lidHingeAngle = openProgress * (-Math.PI * 0.62); // ~112 degrees backwards
  const tuckHingeAngle = Math.PI * 0.48 * (1 - openProgress * 0.25); // Folds down 90 deg when closed

  return (
    <group position={[0, -H / 2, 0]}>
      {/* ================================================================= */}
      {/* 1. BASE TRAY ASSEMBLY (Bottom, Front wall, Back wall, Side walls) */}
      {/* ================================================================= */}
      
      {/* Bottom tray floor */}
      <mesh position={[0, wallThickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[W, wallThickness, D]} />
        <primitive object={kraftMaterial} attach="material" />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, H / 2, D / 2 - wallThickness / 2]} receiveShadow castShadow>
        <boxGeometry args={[W, H, wallThickness]} />
        <primitive object={kraftMaterial} attach="material" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, H / 2, -D / 2 + wallThickness / 2]} receiveShadow castShadow>
        <boxGeometry args={[W, H, wallThickness]} />
        <primitive object={kraftMaterial} attach="material" />
      </mesh>

      {/* Left side wall (double rolled for realistic corrugated mailer) */}
      <mesh position={[-W / 2 + wallThickness, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness * 2, H, D]} />
        <primitive object={innerKraftMaterial} attach="material" />
      </mesh>

      {/* Right side wall (double rolled) */}
      <mesh position={[W / 2 - wallThickness, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness * 2, H, D]} />
        <primitive object={innerKraftMaterial} attach="material" />
      </mesh>

      {/* Tray interior floor liner */}
      <mesh position={[0, wallThickness + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W - wallThickness * 4, D - wallThickness * 2]} />
        <primitive object={innerKraftMaterial} attach="material" />
      </mesh>

      {/* ================================================================= */}
      {/* 2. HINGED LID ASSEMBLY (Pivots at top rear edge: y = H, z = -D/2) */}
      {/* ================================================================= */}
      <group position={[0, H, -D / 2 + wallThickness]} rotation={[lidHingeAngle, 0, 0]}>
        {/* Main Lid Panel (extending forward along +Z from the hinge) */}
        <group position={[0, 0, D / 2]}>
          {/* Lid thickness slab */}
          <mesh position={[0, wallThickness / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[W * 1.012, wallThickness, D * 1.012]} />
            <primitive object={kraftMaterial} attach="material" />
          </mesh>

          {/* Top Lid Printable/Artwork Face (facing +Y) */}
          <mesh position={[0, wallThickness + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
            <planeGeometry args={[W * 1.012, D * 1.012]} />
            <primitive object={lidTopMaterial} attach="material" />
          </mesh>

          {/* Inside of Lid (facing -Y) */}
          <mesh position={[0, -0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[W * 0.99, D * 0.99]} />
            <primitive object={innerKraftMaterial} attach="material" />
          </mesh>

          {/* Left Dust Flap attached to lid */}
          <mesh position={[-W * 1.012 / 2 + wallThickness / 2, -H * 0.42 * (1 - openProgress * 0.5), 0]} castShadow>
            <boxGeometry args={[wallThickness, H * 0.85, D * 0.88]} />
            <primitive object={kraftMaterial} attach="material" />
          </mesh>

          {/* Right Dust Flap attached to lid */}
          <mesh position={[W * 1.012 / 2 - wallThickness / 2, -H * 0.42 * (1 - openProgress * 0.5), 0]} castShadow>
            <boxGeometry args={[wallThickness, H * 0.85, D * 0.88]} />
            <primitive object={kraftMaterial} attach="material" />
          </mesh>

          {/* Front Tuck Flap (Hinged at the front edge of the lid) */}
          <group position={[0, 0, D * 1.012 / 2]} rotation={[tuckHingeAngle, 0, 0]}>
            {/* Front tuck panel */}
            <mesh position={[0, 0, H * 0.45]} castShadow receiveShadow>
              <boxGeometry args={[W * 1.008, wallThickness, H * 0.9]} />
              <primitive object={kraftMaterial} attach="material" />
            </mesh>
            {/* Rounded tuck tongue tabs on left/right edge */}
            <mesh position={[-W * 0.48, 0, H * 0.6]} castShadow>
              <boxGeometry args={[W * 0.04, wallThickness, H * 0.4]} />
              <primitive object={kraftMaterial} attach="material" />
            </mesh>
            <mesh position={[W * 0.48, 0, H * 0.6]} castShadow>
              <boxGeometry args={[W * 0.04, wallThickness, H * 0.4]} />
              <primitive object={kraftMaterial} attach="material" />
            </mesh>
          </group>
        </group>
      </group>

      {/* ================================================================= */}
      {/* 3. SOFT CONTACT GROUND SHADOW                                     */}
      {/* ================================================================= */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 1.45, D * 1.45]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.16 * (1 - openProgress * 0.35)}
          depthWrite={false}
        />
      </mesh>
      {/* Secondary softer diffuse shadow */}
      <mesh position={[0, -0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 1.9, D * 1.9]} />
        <meshBasicMaterial
          color="#1a1410"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
