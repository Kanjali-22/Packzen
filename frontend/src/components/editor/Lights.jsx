import { useEditorStore } from '../../store/useEditorStore';

export default function Lights() {
  const lighting = useEditorStore((state) => state.lighting);
  return (
    <>
      <ambientLight intensity={0.8 * lighting.intensity} />
      <directionalLight
        position={[4, 5, 3]}
        intensity={1.2 * lighting.intensity}
        castShadow={lighting.shadows}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.4 * lighting.intensity} />
    </>
  );
}
