import { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useShallow } from 'zustand/react/shallow';
import './objectLightingControls.css';

const partDefinitions = {
  bottle: [
    { id: 'body', name: 'Bottle body', note: 'Primary plastic shell', color: true },
    { id: 'cap', name: 'Cap and ribs', note: 'Separate screw cap assembly', color: true, visibility: true },
    { id: 'label', name: 'Label band', note: 'White curved label surface', color: true, visibility: true }
  ],
  mailer: [
    { id: 'body', name: 'Box body', note: 'Main folded carton', color: true },
    { id: 'lid', name: 'Lid', note: 'Upper mailer flap', color: true },
    { id: 'frontTuck', name: 'Front tuck', note: 'Front closure detail', color: true }
  ],
  productBox: [
    { id: 'body', name: 'Carton body', note: 'Rounded main carton', color: true },
    { id: 'frontPanel', name: 'Front panel', note: 'Separate front label panel', color: true, visibility: true },
    { id: 'foldLines', name: 'Fold lines', note: 'Top and bottom printed seams', color: true, visibility: true }
  ]
};

const defaultColors = { body: '#dcefe6', cap: '#f7f7f9', label: '#fffdfa', lid: '#ffffff', frontTuck: '#ececf0', frontPanel: '#fffdfa', foldLines: '#cfc8dc' };

export default function ObjectControls() {
  const template = useEditorStore((state) => state.selectedTemplate);
  const materialByTemplate = useEditorStore(useShallow((state) => state.materialByTemplate));
  const objectSettingsByTemplate = useEditorStore(useShallow((state) => state.objectSettingsByTemplate));
  const updateSettings = useEditorStore((state) => state.updateObjectSettings);
  const clearSettings = useEditorStore((state) => state.clearObjectSettings);
  const parts = template ? partDefinitions[template.modelType] : null;
  const [activePartId, setActivePartId] = useState('body');

  const material = materialByTemplate[template?.id] ?? template?.material;
  const settings = objectSettingsByTemplate[template?.id] ?? {};

  if (!template) return <><b>Objects</b><p>Loading template…</p></>;
  if (!parts) return <div className="editor-panel"><b>Objects</b><p>{template.name} has no safe part-level controls yet. Use Materials to adjust its primary surface.</p></div>;

  const activePart = parts.find((part) => part.id === activePartId) ?? parts[0];
  const activeSettings = settings[activePart.id] ?? {};
  const color = activeSettings.color ?? (activePart.id === 'body' ? material.color : defaultColors[activePart.id]);
  const update = (patch) => updateSettings(template.id, activePart.id, patch);

  return <div className="editor-panel object-panel">
    <b>Objects</b>
    <p>Select a modeled part to edit properties that are present in this template.</p>
    <div className="object-panel__list">
      {parts.map((part) => <button type="button" className={part.id === activePart.id ? 'is-selected' : ''} key={part.id} onClick={() => setActivePartId(part.id)}><strong>{part.name}</strong><small>{part.note}</small></button>)}
    </div>
    <div className="object-panel__editor">
      <strong>{activePart.name}</strong>
      {activePart.color && <label>Color <input type="color" value={color} aria-label={`${activePart.name} color`} onChange={(event) => update({ color: event.target.value })} /></label>}
      {activePart.visibility && <label className="object-panel__visibility"><input type="checkbox" checked={activeSettings.visible !== false} onChange={(event) => update({ visible: event.target.checked })} />Show {activePart.name.toLowerCase()}</label>}
      <button type="button" className="editor-panel__reset" onClick={() => clearSettings(template.id, activePart.id)}>Reset {activePart.name.toLowerCase()}</button>
    </div>
  </div>;
}
