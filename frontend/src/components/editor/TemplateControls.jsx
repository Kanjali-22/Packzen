import { Link } from 'react-router-dom';

export default function TemplateControls({ template }) {
  if (!template) return <><b>Selected template</b><p>Loading template…</p></>;
  const { dimensions } = template;
  return <div className="editor-panel">
    <b>Selected template</b>
    <h2>{template.name}</h2>
    <p>{template.summary}</p>
    <div className="editor-panel__dimensions" aria-label="Template dimensions">
      <span><small>Width</small>{dimensions.width} {dimensions.unit}</span>
      <span><small>Height</small>{dimensions.height} {dimensions.unit}</span>
      <span><small>Depth</small>{dimensions.depth} {dimensions.unit}</span>
    </div>
    <small className="editor-panel__note">Template identity and dimensions come from the shared catalog.</small>
    <Link className="button button--dark button--sm" to="/mockups">Browse mockups</Link>
  </div>;
}
