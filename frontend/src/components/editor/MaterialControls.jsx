import { useEditorStore } from '../../store/useEditorStore';
import { useShallow } from 'zustand/react/shallow';
import './editorPanels.css';

const basePresets = [
  { id: 'matte', name: 'Matte', roughness: 0.65, detail: 'Soft, low-reflection finish' },
  { id: 'gloss', name: 'Gloss', roughness: 0.18, detail: 'Clean reflective finish' }
];
const kraftPreset = { id: 'kraft', name: 'Kraft', roughness: 0.88, detail: 'Dry paper-like finish' };

export default function MaterialControls() {
  const template = useEditorStore((state) => state.selectedTemplate);
  const materialByTemplate = useEditorStore(useShallow((state) => state.materialByTemplate));
  const setMaterial = useEditorStore((state) => state.setMaterial);
  const clearMaterial = useEditorStore((state) => state.clearMaterial);
  if (!template) return <><b>Materials</b><p>Loading template…</p></>;

  const override = materialByTemplate[template?.id] ?? null;
  const material = override ?? template.material;
  const supportsKraft = template.modelType === 'mailer' || template.modelType === 'productBox';
  const presets = supportsKraft ? [...basePresets, kraftPreset] : basePresets;
  const update = (patch) => setMaterial(template.id, { ...material, ...patch });

  return <div className="editor-panel material-panel">
    <b>Material</b>
    <p>Adjust the primary {template.categoryLabel.toLowerCase()} surface.</p>
    <div className="material-panel__presets" aria-label="Material preset">
      {presets.map((preset) => <button type="button" className={Math.abs(material.roughness - preset.roughness) < 0.01 ? 'is-selected' : ''} key={preset.id} onClick={() => update({ roughness: preset.roughness, preset: preset.id })}><strong>{preset.name}</strong><small>{preset.detail}</small></button>)}
    </div>
    <label className="material-panel__color">Surface color <input type="color" value={material.color} aria-label="Surface color" onChange={(event) => update({ color: event.target.value, preset: 'custom' })} /></label>
    <label>Finish <output>{Math.round((1 - material.roughness) * 100)}%</output><input type="range" min="0.08" max="0.92" step="0.01" value={material.roughness} onChange={(event) => update({ roughness: Number(event.target.value), preset: 'custom' })} /></label>
    <button className="editor-panel__reset" type="button" onClick={() => clearMaterial(template.id)}>Reset material</button>
  </div>;
}
