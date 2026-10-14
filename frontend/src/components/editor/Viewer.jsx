import { Canvas } from '@react-three/fiber';
import Controls from './Controls';
import Lights from './Lights';
import Scene from './Scene';
import { useEditorStore } from '../../store/useEditorStore';

export default function Viewer() {
  const setExportCanvas = useEditorStore((state) => state.setExportCanvas);
  const lighting = useEditorStore((state) => state.lighting);
  return (
    <div
      className="editor-viewer"
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        shadows={lighting.shadows}
        dpr={1}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 1, 5], fov: 45 }}
        onCreated={({ gl }) => setExportCanvas(gl.domElement)}
      >
        <color attach="background" args={[lighting.background]} />

        <Lights />
        <Scene />
        <Controls />
      </Canvas>
    </div>
  );
}
