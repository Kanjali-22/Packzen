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

import MockupEditor from '../components/editor/MockupEditor';

function EditorPage() {
  return <MockupEditor />;
}


export default function PlaceholderPage({ kind = 'Feature' }) {
  const location = useLocation();
  if (location.pathname.startsWith('/editor')) return <EditorPage />;
  return <section className="placeholder grid-bg"><div><p className="eyebrow">PACKZEN PLATFORM</p><h1>{kind}</h1><p>This thoughtfully designed part of PackZen is taking shape. Explore the marketplace while we finish the experience.</p><Link className="button button--dark" to="/mockups">Explore mockups</Link></div></section>;
}
