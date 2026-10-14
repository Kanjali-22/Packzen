
import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, RotateCcw } from 'lucide-react';

const COLORS = {
  panel: '#e8dcc8',
  flap: '#d4c4b0',
  tuck: '#c8b8a0',
  dust: '#b8a890',
  lid: '#d0c4b8',
};

function Panel({
  id,
  size,
  position,
  color,
  selected,
  wireframe,
  onSelect,
}) {
  const [length, height, thickness] = size;

  return (
    <mesh
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial
        color={selected ? '#90cdf4' : color}
        roughness={0.78}
        metalness={0}
        wireframe={wireframe}
      />
    </mesh>
  );
}

function BoxModel({
  dimensions,
  materialThickness,
  selectedPanel,
  onPanelSelect,
  showWireframe,
}) {
  const { length, width, height } = dimensions;
  const t = Math.max(materialThickness, 0.5);

  const parts = useMemo(() => {
    const L = length;
    const W = width;
    const H = height;

    return [
      {
        id: 'bottom',
        size: [L, t, W],
        position: [0, t / 2, 0],
        color: COLORS.panel,
      },
      {
        id: 'side1',
        size: [L, H, t],
        position: [0, H / 2 + t, -W / 2],
        color: COLORS.flap,
      },
      {
        id: 'side2',
        size: [L, H, t],
        position: [0, H / 2 + t, W / 2],
        color: COLORS.tuck,
      },
      {
        id: 'end1',
        size: [t, H, W],
        position: [-L / 2, H / 2 + t, 0],
        color: COLORS.dust,
      },
      {
        id: 'end2',
        size: [t, H, W],
        position: [L / 2, H / 2 + t, 0],
        color: COLORS.panel,
      },
      {
        id: 'lid',
        size: [L, t, W],
        position: [0, H + 1.5 * t, 0],
        color: COLORS.lid,
      },
    ];
  }, [length, width, height, t]);

  return (
    <group>
      {parts.map((part) => (
        <Panel
          key={part.id}
          {...part}
          selected={selectedPanel === part.id}
          wireframe={showWireframe}
          onSelect={onPanelSelect}
        />
      ))}
    </group>
  );
}

export default function Dieline3DPreview({
  layout,
  dimensions,
  styleId,
  materialThickness = 1.5,
  unit = 'mm',
  selectedPanel = null,
  onPanelSelect,
}) {
  const [showWireframe, setShowWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  if (!layout || !dimensions) {
    return (
      <div className="dieline-3d-preview">
        <div className="dieline-3d-empty">
          No layout to preview
        </div>
      </div>
    );
  }

  const safeDimensions = {
    length: Math.max(1, Number(dimensions.length) || 300),
    width: Math.max(1, Number(dimensions.width) || 200),
    height: Math.max(1, Number(dimensions.height) || 150),
  };

  const maxDimension = Math.max(
    safeDimensions.length,
    safeDimensions.width,
    safeDimensions.height
  );

  // Normalize the model for stable camera framing, regardless of units.
  const normalizedDimensions = {
    length: safeDimensions.length / maxDimension * 4,
    width: safeDimensions.width / maxDimension * 4,
    height: safeDimensions.height / maxDimension * 4,
  };

  // Calculate the camera target to center on the middle of the box height
  const cameraTarget = [0, normalizedDimensions.height / 2, 0];

  return (
    <div className="dieline-3d-preview">
      <div className="dieline-3d-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setShowWireframe((value) => !value)}
            title="Toggle Wireframe"
            aria-pressed={showWireframe}
          >
            <Box size={16} />
          </button>

          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setAutoRotate((value) => !value)}
            title="Toggle Auto Rotate"
            aria-pressed={autoRotate}
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="toolbar-info">
          {styleId ?? 'Box'} · {safeDimensions.length} ×{' '}
          {safeDimensions.width} × {safeDimensions.height} {unit}
        </div>
      </div>

      <div
        className="dieline-3d-canvas"
        style={{ minHeight: 400 }}
      >
        <Canvas
          camera={{
            position: [7, 6, 8],
            fov: 40,
            near: 0.01,
            far: 1000,
          }}
          shadows
          onPointerMissed={() => onPanelSelect?.(null)}
        >
          <color attach="background" args={['#f7fafc']} />

          <ambientLight intensity={1.1} />

          <directionalLight
            position={[8, 12, 10]}
            intensity={2}
            castShadow
          />

          <directionalLight
            position={[-8, 6, -5]}
            intensity={0.7}
          />

          <group
            scale={[
              normalizedDimensions.length / 4,
              normalizedDimensions.height / 4,
              normalizedDimensions.width / 4,
            ]}
          >
            <BoxModel
              dimensions={{
                length: 4,
                width:
                  (safeDimensions.width / safeDimensions.length) * 4,
                height:
                  (safeDimensions.height / safeDimensions.length) * 4,
              }}
              materialThickness={
                materialThickness / maxDimension * 4
              }
              selectedPanel={selectedPanel}
              onPanelSelect={(id) => onPanelSelect?.(id)}
              showWireframe={showWireframe}
            />
          </group>

          <gridHelper
            args={[12, 24, '#cbd5e0', '#e2e8f0']}
            position={[0, -0.1, 0]}
          />

          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
            minDistance={2}
            maxDistance={30}
            target={cameraTarget}
          />
        </Canvas>
      </div>
    </div>
  );
}
