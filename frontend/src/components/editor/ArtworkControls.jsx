import { useRef, useState } from 'react';
import { ImageUp, Trash2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useShallow } from 'zustand/react/shallow';
import './artworkControls.css';

const supportedTypes = new Set(['image/png', 'image/jpeg']);
const maximumBytes = 8 * 1024 * 1024;

export default function ArtworkControls() {
  const inputRef = useRef();
  const [error, setError] = useState('');
  const template = useEditorStore((state) => state.selectedTemplate);
  const artworkByTemplate = useEditorStore(useShallow((state) => state.artworkByTemplate));
  const setArtwork = useEditorStore((state) => state.setArtwork);
  const updateArtwork = useEditorStore((state) => state.updateArtwork);
  const clearArtwork = useEditorStore((state) => state.clearArtwork);
  const supported = template?.modelType === 'bottle' || template?.modelType === 'mailer';

  const artwork = artworkByTemplate[template?.id] ?? null;

  const selectFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!supportedTypes.has(file.type)) {
      setError('Choose a PNG or JPG image.');
      return;
    }
    if (file.size > maximumBytes) {
      setError('Choose an image smaller than 8 MB.');
      return;
    }
    const src = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setError('');
      setArtwork(template.id, { src, objectUrl: true, filename: file.name, scale: 1, offsetX: 0, offsetY: 0 });
    };
    image.onerror = () => {
      URL.revokeObjectURL(src);
      setError('That image could not be loaded. Try another PNG or JPG.');
    };
    image.src = src;
  };

  if (!template) return <><b>Artwork</b><p>Loading template…</p></>;
  if (!supported) return <><b>Artwork</b><p>Artwork editing is currently available for the bottle and mailer box only.</p></>;

  return <div className="artwork-controls">
    <b>Label artwork</b>
    <p>{template.modelType === 'bottle' ? 'Artwork follows the front of the bottle label.' : 'Artwork is placed on the front panel of the mailer.'}</p>
    <input ref={inputRef} className="artwork-controls__input" type="file" accept="image/png,image/jpeg" onChange={selectFile} />
    <button className="artwork-controls__upload" type="button" onClick={() => inputRef.current?.click()}><ImageUp size={15} />{artwork ? 'Replace image' : 'Upload PNG or JPG'}</button>
    {error && <p className="artwork-controls__error" role="alert">{error}</p>}
    {artwork && <>
      <small>{artwork.filename}</small>
      <label>Scale <output>{Math.round(artwork.scale * 100)}%</output><input type="range" min="0.55" max="1.25" step="0.01" value={artwork.scale} onChange={(event) => updateArtwork(template.id, { scale: Number(event.target.value) })} /></label>
      <label>Horizontal <output>{Math.round(artwork.offsetX * 100)}</output><input type="range" min="-1" max="1" step="0.01" value={artwork.offsetX} onChange={(event) => updateArtwork(template.id, { offsetX: Number(event.target.value) })} /></label>
      <label>Vertical <output>{Math.round(artwork.offsetY * 100)}</output><input type="range" min="-1" max="1" step="0.01" value={artwork.offsetY} onChange={(event) => updateArtwork(template.id, { offsetY: Number(event.target.value) })} /></label>
      <button className="artwork-controls__clear" type="button" onClick={() => clearArtwork(template.id)}><Trash2 size={14} />Remove artwork</button>
    </>}
  </div>;
}
