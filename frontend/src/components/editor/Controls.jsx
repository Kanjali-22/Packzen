import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useEditorStore } from '../../store/useEditorStore';

export default function Controls() {
  const controlsRef = useRef();
  const camera = useThree((state) => state.camera);
  const template = useEditorStore((state) => state.selectedTemplate);

  useEffect(() => {
    if (!template?.camera) return;
    camera.position.set(...template.camera.position);
    camera.fov = template.camera.fov;
    camera.updateProjectionMatrix();
    controlsRef.current?.target.set(...template.camera.target);
    controlsRef.current?.update();
  }, [camera, template?.id]);

  return <OrbitControls ref={controlsRef} enableZoom enableRotate />;
}
