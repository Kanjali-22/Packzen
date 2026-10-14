import { useEditorStore } from '../../store/useEditorStore';
import './objectLightingControls.css';

export default function LightingControls() {
  const lighting = useEditorStore((state) => state.lighting);
  const setLighting = useEditorStore((state) => state.setLighting);
  const resetLighting = useEditorStore((state) => state.resetLighting);

  return <div className="editor-panel lighting-panel">
    <b>Lighting</b>
    <p>Adjust the studio environment used by the live viewport and PNG export.</p>
    <label className="lighting-panel__color">Background <input type="color" value={lighting.background} aria-label="Viewport background color" onChange={(event) => setLighting({ background: event.target.value })} /></label>
    <label>Light intensity <output>{Math.round(lighting.intensity * 100)}%</output><input type="range" min="0.35" max="1.8" step="0.01" value={lighting.intensity} onChange={(event) => setLighting({ intensity: Number(event.target.value) })} /></label>
    <label className="lighting-panel__shadow"><input type="checkbox" checked={lighting.shadows} onChange={(event) => setLighting({ shadows: event.target.checked })} />Enable product shadows</label>
    <button className="editor-panel__reset" type="button" onClick={resetLighting}>Reset lighting</button>
  </div>;
}
