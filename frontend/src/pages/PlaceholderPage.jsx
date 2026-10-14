import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, ImageUp, Layers3, SlidersHorizontal, Sun, FolderKanban } from 'lucide-react';
import Viewer from '../components/editor/Viewer';
import ArtworkControls from '../components/editor/ArtworkControls';
import TemplateControls from '../components/editor/TemplateControls';
import MaterialControls from '../components/editor/MaterialControls';
import ObjectControls from '../components/editor/ObjectControls';
import LightingControls from '../components/editor/LightingControls';
import ProjectsControls from '../components/editor/ProjectsControls';
import { getTemplateById } from '../data/templates/boxTemplates';
import { useEditorStore } from '../store/useEditorStore';

const editorTools = [
  ['Templates', Box],
  ['Artwork', ImageUp],
  ['Objects', Layers3],
  ['Materials', SlidersHorizontal],
  ['Lighting', Sun],
  ['Projects', FolderKanban]
];

function EditorPage() {
  const [activeTool, setActiveTool] = useState('Templates');
  const { templateId } = useParams();
  const navigate = useNavigate();
  const selectedTemplate = useEditorStore((state) => state.selectedTemplate);
  const setTemplate = useEditorStore((state) => state.setTemplate);
  const exportCanvas = useEditorStore((state) => state.exportCanvas);
  const [exportError, setExportError] = useState('');
  const template = getTemplateById(templateId ?? 'mailer-box-standard');

  useEffect(() => {
    if (!templateId) {
      navigate('/editor/mailer-box-standard', { replace: true });
      return;
    }
    setTemplate(template);
  }, [navigate, setTemplate, template, templateId]);

  if (templateId && !template) {
    return <section className="editor"><header><Link className="brand" to="/"><span>◒</span>PackZen</Link></header><div className="placeholder"><div><p className="eyebrow">EDITOR TEMPLATE</p><h1>Template not found</h1><p>This editor link does not match an available packaging model.</p><Link className="button button--dark" to="/mockups">Browse templates</Link></div></div></section>;
  }

  const exportPng = () => {
    if (!exportCanvas) return;
    try {
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          setExportError('The current scene could not be exported.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.id}-preview.png`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
        setExportError('');
      }, 'image/png');
    } catch {
      setExportError('Export is unavailable for this scene.');
    }
  };

  return (
    <section className="editor">
      <header>
        <Link className="brand" to="/"><span>◒</span>PackZen</Link>
        <b>Untitled packaging concept</b>
        <button className="button button--dark" type="button" disabled={!exportCanvas} onClick={exportPng}>Export PNG</button>
      </header>
      <div className="editor__body">
        <aside aria-label="Editor tools">
          {editorTools.map(([label, Icon]) => (
            <button
              className={activeTool === label ? 'is-active' : ''}
              type="button"
              key={label}
              onClick={() => setActiveTool(label)}
            >
              <Icon size={19} />{label}
            </button>
          ))}
        </aside>
        <main className="editor__canvas">
          <Viewer />
        </main>
        <aside className="properties" aria-label="Object properties">
          {activeTool === 'Templates' ? (
            <TemplateControls template={selectedTemplate} />
          ) : activeTool === 'Artwork' ? <ArtworkControls /> : activeTool === 'Materials' ? <MaterialControls /> : activeTool === 'Objects' ? <ObjectControls /> : activeTool === 'Lighting' ? <LightingControls /> : activeTool === 'Projects' ? <ProjectsControls /> : (
            <>
              <b>{activeTool}</b>
              <p>Controls for this section are coming next.</p>
            </>
          )}
          {exportError && <p className="editor__export-error" role="alert">{exportError}</p>}
        </aside>
      </div>
    </section>
  );
}

export default function PlaceholderPage({ kind = 'Feature' }) {
  const location = useLocation();
  if (location.pathname.startsWith('/editor')) return <EditorPage />;
  return <section className="placeholder grid-bg"><div><p className="eyebrow">PACKZEN PLATFORM</p><h1>{kind}</h1><p>This thoughtfully designed part of PackZen is taking shape. Explore the marketplace while we finish the experience.</p><Link className="button button--dark" to="/mockups">Explore mockups</Link></div></section>;
}
