import { Clone, RoundedBox, useGLTF } from '@react-three/drei';
import { Component, Suspense } from 'react';
import { ClampToEdgeWrapping, SRGBColorSpace, TextureLoader, Vector2 } from 'three';
import { useEffect, useState } from 'react';

function Material({ material, color }) {
  return <meshStandardMaterial color={color ?? material.color} roughness={material.roughness} metalness={material.metalness} />;
}

function LoadedAsset({ url }) {
  const { scene } = useGLTF(url);
  return <Clone object={scene} castShadow receiveShadow />;
}

class AssetFallbackBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.url !== this.props.url && this.state.failed) this.setState({ failed: false });
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// An optional licensed GLB/GLTF can replace a procedural model. If it is absent
// or fails to load, the matching procedural fallback stays available.
export function AssetModel({ url, fallback }) {
  return <AssetFallbackBoundary url={url} fallback={fallback}><Suspense fallback={fallback}><LoadedAsset url={url} /></Suspense></AssetFallbackBoundary>;
}

export function ProductBoxModel({ dimensions, material, parts = {} }) {
  const { width, height, depth } = dimensions;
  const radius = Math.min(width, height, depth) * 0.055;
  return <>
    <RoundedBox args={[width, height, depth]} radius={radius} smoothness={5} castShadow receiveShadow><Material material={material} color={parts.body?.color} /></RoundedBox>
    {parts.frontPanel?.visible !== false && <mesh position={[0, height * 0.01, depth / 2 + 0.006]} castShadow>
      <planeGeometry args={[width * 0.67, height * 0.56]} />
      <meshStandardMaterial color={parts.frontPanel?.color ?? '#fffdfa'} roughness={0.78} />
    </mesh>}
    {parts.foldLines?.visible !== false && <><mesh position={[0, height * 0.385, depth / 2 + 0.009]} castShadow>
      <boxGeometry args={[width * 0.78, height * 0.012, depth * 0.018]} />
      <meshStandardMaterial color={parts.foldLines?.color ?? '#cfc8dc'} roughness={0.7} />
    </mesh>
    <mesh position={[0, -height * 0.385, depth / 2 + 0.009]} castShadow>
      <boxGeometry args={[width * 0.78, height * 0.012, depth * 0.018]} />
      <meshStandardMaterial color={parts.foldLines?.color ?? '#cfc8dc'} roughness={0.7} />
    </mesh></>}
  </>;
}

function useArtworkTexture(source) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    let active = true;
    let loadedTexture;
    if (!source) {
      setTexture(null);
      return undefined;
    }
    new TextureLoader().load(source, (nextTexture) => {
      if (!active) {
        nextTexture.dispose();
        return;
      }
      nextTexture.colorSpace = SRGBColorSpace;
      nextTexture.wrapS = ClampToEdgeWrapping;
      nextTexture.wrapT = ClampToEdgeWrapping;
      nextTexture.anisotropy = 4;
      loadedTexture = nextTexture;
      setTexture(nextTexture);
    }, undefined, () => active && setTexture(null));
    return () => {
      active = false;
      loadedTexture?.dispose();
    };
  }, [source]);

  return texture;
}

function ArtworkMaterial({ texture }) {
  return <meshStandardMaterial map={texture} roughness={0.62} metalness={0} />;
}

function MailerArtwork({ dimensions, artwork }) {
  const texture = useArtworkTexture(artwork?.src);
  if (!texture) return null;
  const { width, height, depth } = dimensions;
  const scale = artwork.scale ?? 1;
  const aspect = texture.image.width / texture.image.height;
  const panelHeight = height * 0.35 * scale;
  const panelWidth = Math.min(width * 0.78, panelHeight * aspect);
  return <mesh position={[artwork.offsetX * width * 0.13, -height * 0.19 + artwork.offsetY * height * 0.08, depth / 2 + 0.006]} castShadow>
    <planeGeometry args={[panelWidth, panelHeight]} />
    <ArtworkMaterial texture={texture} />
  </mesh>;
}

function BottleArtwork({ dimensions, artwork }) {
  const texture = useArtworkTexture(artwork?.src);
  if (!texture) return null;
  const { width, height } = dimensions;
  const radius = width / 2;
  const labelHeight = height * 0.31;
  const scale = artwork.scale ?? 1;
  const panelHeight = labelHeight * 0.74 * scale;
  const desiredArcLength = panelHeight * (texture.image.width / texture.image.height);
  const arcLength = Math.min(radius * Math.PI * 1.1, desiredArcLength);
  const thetaLength = arcLength / radius;
  const thetaCenter = artwork.offsetX * 0.42;
  return <mesh position={[0, -height * 0.08 + artwork.offsetY * labelHeight * 0.12, 0]} castShadow>
    <cylinderGeometry args={[radius * 1.021, radius * 1.021, panelHeight, 64, 1, true, thetaCenter - thetaLength / 2, thetaLength]} />
    <ArtworkMaterial texture={texture} />
  </mesh>;
}

export function MailerBoxModel({ dimensions, material, artwork, parts = {} }) {
  const { width, height, depth } = dimensions;
  return <>
    <mesh castShadow receiveShadow position={[0, -height * 0.19, 0]}><boxGeometry args={[width, height * 0.62, depth]} /><Material material={material} color={parts.body?.color} /></mesh>
    <mesh castShadow receiveShadow position={[0, height * 0.205, -depth * 0.015]}><boxGeometry args={[width * 1.02, height * 0.16, depth * 1.02]} /><Material material={material} color={parts.lid?.color ?? '#ffffff'} /></mesh>
    <mesh castShadow receiveShadow position={[0, height * 0.075, depth * 0.515]}><boxGeometry args={[width * 1.02, height * 0.18, depth * 0.08]} /><Material material={material} color={parts.frontTuck?.color ?? '#ececf0'} /></mesh>
    <MailerArtwork dimensions={dimensions} artwork={artwork} />
  </>;
}

export function BottleModel({ dimensions, material, artwork, parts = {} }) {
  const { width, height } = dimensions;
  const radius = width / 2;
  const profile = [
    [-0.5, 0.88], [-0.47, 0.97], [-0.38, 1], [-0.08, 1], [0.14, 0.98],
    [0.23, 0.9], [0.3, 0.72], [0.37, 0.61], [0.44, 0.57]
  ].map(([y, scale]) => new Vector2(radius * scale, height * y));
  const labelHeight = height * 0.31;
  return <>
    <mesh castShadow receiveShadow><latheGeometry args={[profile, 64]} /><meshPhysicalMaterial color={parts.body?.color ?? material.color} roughness={material.roughness} metalness={material.metalness} clearcoat={Math.max(0.08, 0.58 - material.roughness * 0.6)} clearcoatRoughness={Math.min(0.45, material.roughness + 0.04)} /></mesh>
    {parts.cap?.visible !== false && <><mesh castShadow receiveShadow position={[0, height * 0.49, 0]}><cylinderGeometry args={[radius * 0.63, radius * 0.59, height * 0.1, 48]} /><meshStandardMaterial color={parts.cap?.color ?? '#f7f7f9'} roughness={0.34} /></mesh>
    {[-0.027, 0, 0.027].map((offset) => <mesh key={offset} position={[0, height * (0.49 + offset), 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[radius * 0.625, radius * 0.018, 8, 48]} /><meshStandardMaterial color={parts.cap?.color ?? '#dddde3'} roughness={0.32} /></mesh>)}</>}
    {parts.label?.visible !== false && <><mesh castShadow receiveShadow position={[0, -height * 0.08, 0]}><cylinderGeometry args={[radius * 1.012, radius * 1.012, labelHeight, 64, 1, true]} /><meshStandardMaterial color={parts.label?.color ?? '#fffdfa'} roughness={0.7} /></mesh>
    <BottleArtwork dimensions={dimensions} artwork={artwork} /></>}
  </>;
}

export function CanModel({ dimensions, material }) {
  const { width, height } = dimensions;
  const radius = width / 2;
  return <>
    <mesh castShadow receiveShadow><cylinderGeometry args={[radius, radius, height, 56]} /><Material material={material} /></mesh>
    {[-height / 2, height / 2].map((y) => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[radius * 0.84, radius * 0.075, 12, 48]} /><Material material={material} color="#d9d9df" /></mesh>)}
    <mesh position={[0, height * 0.503, 0]} rotation={[-Math.PI / 2, 0, 0]}><cylinderGeometry args={[radius * 0.82, radius * 0.82, 0.025, 48]} /><Material material={material} color="#ededf0" /></mesh>
  </>;
}

export function PouchModel({ dimensions, material }) {
  const { width, height, depth } = dimensions;
  return <>
    <mesh castShadow receiveShadow position={[0, -height * 0.04, 0]}><boxGeometry args={[width, height * 0.82, depth]} /><Material material={material} /></mesh>
    <mesh castShadow receiveShadow position={[0, height * 0.41, 0]}><boxGeometry args={[width * 0.82, height * 0.14, depth * 0.82]} /><Material material={material} /></mesh>
    {[-1, 1].map((side) => <mesh key={side} castShadow position={[side * width * 0.44, -height * 0.02, 0]} rotation={[0, 0, side * 0.08]}><boxGeometry args={[width * 0.09, height * 0.78, depth * 1.03]} /><Material material={material} color="#e39da5" /></mesh>)}
    <mesh castShadow position={[0, height * 0.32, depth * 0.52]}><boxGeometry args={[width * 0.86, height * 0.035, depth * 0.08]} /><Material material={material} color="#f6ccd0" /></mesh>
  </>;
}

export function JarModel({ dimensions, material }) {
  const { width, height } = dimensions;
  const radius = width / 2;
  return <>
    <mesh castShadow receiveShadow position={[0, -height * 0.12, 0]}><cylinderGeometry args={[radius, radius * 0.9, height * 0.68, 56]} /><Material material={material} /></mesh>
    <mesh castShadow receiveShadow position={[0, height * 0.32, 0]}><cylinderGeometry args={[radius * 1.03, radius * 1.03, height * 0.28, 56]} /><Material material={material} color="#f7f7f8" /></mesh>
    <mesh castShadow position={[0, height * 0.48, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius * 0.93, radius * 0.045, 10, 48]} /><Material material={material} color="#dedee5" /></mesh>
  </>;
}
