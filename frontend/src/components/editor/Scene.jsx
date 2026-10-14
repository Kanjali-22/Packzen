import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useEditorStore } from '../../store/useEditorStore';
import { AssetModel, BottleModel, CanModel, JarModel, MailerBoxModel, PouchModel, ProductBoxModel } from './models/PackagingModels';
import { getSceneDimensions } from '../../data/templates/boxTemplates';
import { useShallow } from 'zustand/react/shallow';

const models = { bottle: BottleModel, mailer: MailerBoxModel, productBox: ProductBoxModel, can: CanModel, pouch: PouchModel, jar: JarModel };

export default function Scene() {
  const template = useEditorStore((state) => state.selectedTemplate);
  const artworkByTemplate = useEditorStore(useShallow((state) => state.artworkByTemplate));
  const materialByTemplate = useEditorStore(useShallow((state) => state.materialByTemplate));
  const objectSettingsByTemplate = useEditorStore(useShallow((state) => state.objectSettingsByTemplate));
  const lighting = useEditorStore((state) => state.lighting);
  const modelRef = useRef();

  const artwork = artworkByTemplate[template?.id] ?? null;
  const materialOverride = materialByTemplate[template?.id] ?? null;
  const objectSettings = objectSettingsByTemplate[template?.id] ?? {};

  useEffect(() => {
    if (modelRef.current) modelRef.current.scale.setScalar(0.92);
  }, [template?.id]);

  useFrame((_, delta) => {
    if (modelRef.current) {
      const nextScale = 1 - (1 - modelRef.current.scale.x) * Math.exp(-10 * delta);
      modelRef.current.scale.setScalar(nextScale);
    }
  });

  if (!template) return null;

  const Model = models[template.modelType];
  if (!Model) return null;
  const sceneDimensions = getSceneDimensions(template);
  const material = materialOverride ?? template.material;

  return (
    <>
      <group ref={modelRef} position={[0, sceneDimensions.height / 2 - 0.9, 0]} rotation={[0, Math.PI / 6, 0]}>
        {template.assetUrl ? <AssetModel url={template.assetUrl} fallback={<Model dimensions={sceneDimensions} material={material} artwork={artwork} parts={objectSettings} />} /> : <Model dimensions={sceneDimensions} material={material} artwork={artwork} parts={objectSettings} />}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} receiveShadow={lighting.shadows}>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={lighting.shadows ? 0.2 : 0} />
      </mesh>
    </>
  );
}
