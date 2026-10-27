
import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  FileText,
  Image as ImageIcon,
  Box,
  Settings,
  HelpCircle,
} from 'lucide-react';

export default function DielineToolbar({
  onBackToGallery,
  onSave,
  onExportSVG,
  onExportPDF,
  onExportPNG,
  onExportJSON,
  onImportJSON,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onFitView,
  onResetView,
  onToggleGrid,
  onToggleDimensions,
  onToggleFoldLines,
  onToggleCutLines,
  showGrid = false,
  showDimensions = false,
  showFoldLines = false,
  showCutLines = false,
  viewport,
  layout,
  unit = 'mm',
  onNewProject,
  onOpenProject,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const toolbarRef = useRef(null);

  // Close dropdowns when clicking outside or pressing Escape.
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!toolbarRef.current?.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleMenu = (menu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const handleExport = (type) => {
    setOpenMenu(null);

    const exporters = {
      svg: onExportSVG,
      pdf: onExportPDF,
      png: onExportPNG,
      json: onExportJSON,
    };

    exporters[type]?.();
  };

  const handleProjectAction = (action) => {
    setOpenMenu(null);

    const actions = {
      new: onNewProject,
      open: onOpenProject,
    };

    actions[action]?.();
  };

  const scale = Number.isFinite(viewport?.scale)
    ? Math.round(viewport.scale * 100)
    : null;

  const width = Number.isFinite(layout?.totalWidth)
    ? layout.totalWidth.toFixed(1)
    : null;

  const height = Number.isFinite(layout?.totalHeight)
    ? layout.totalHeight.toFixed(1)
    : null;

  const dimensions =
    width !== null && height !== null
      ? `${width} × ${height} ${unit}`
      : 'Dimensions unavailable';

  const exportItems = [
    { id: 'svg', label: 'Export SVG', icon: ImageIcon },
    { id: 'pdf', label: 'Export PDF', icon: FileText },
    { id: 'png', label: 'Export PNG', icon: ImageIcon },
    { id: 'json', label: 'Export JSON', icon: Box },
  ];

  const projectItems = [
    { id: 'new', label: 'New Project', icon: FileText },
    { id: 'open', label: 'Open Project', icon: Upload },
  ];

  const renderMenu = (items, onSelect) => (
    <div className="dropdown-menu" role="menu">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className="dropdown-item"
          role="menuitem"
          onClick={() => onSelect(id)}
        >
          <Icon size={14} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );

  const renderToggle = (label, checked, onChange, shortcut) => (
    <label
      className="toolbar-toggle"
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        aria-label={label}
      />
      <span className="toolbar-tooltip">{label}</span>
    </label>
  );

  return (
    <div className="dieline-toolbar" ref={toolbarRef}>
      {/* Left: Back button and project actions */}
      <div className="toolbar-section">
        {onBackToGallery && (
          <>
            <button
              type="button"
              className="toolbar-btn"
              onClick={onBackToGallery}
              title="Back to Gallery"
              aria-label="Back to gallery"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="toolbar-divider" />
          </>
        )}
        
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => handleProjectAction('new')}
            title="New Project (Ctrl+N)"
            aria-label="New project"
          >
            <FileText size={16} />
          </button>

          <button
            type="button"
            className="toolbar-btn"
            onClick={() => handleProjectAction('open')}
            title="Open Project (Ctrl+O)"
            aria-label="Open project"
          >
            <Upload size={16} />
          </button>

          <button
            type="button"
            className="toolbar-btn"
            onClick={onSave}
            title="Save Project (Ctrl+S)"
            aria-label="Save project"
          >
            <Save size={16} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Undo / Redo */}
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo size={16} />
          </button>

          <button
            type="button"
            className="toolbar-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo size={16} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* View controls */}
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={onFitView}
            title="Fit to View (F)"
            aria-label="Fit to view"
          >
            <Maximize2 size={16} />
          </button>

          <button
            type="button"
            className="toolbar-btn"
            onClick={onResetView}
            title="Reset View (R)"
            aria-label="Reset view"
          >
            <Minimize2 size={16} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Display toggles */}
        <div className="toolbar-group">
          {renderToggle('Grid', showGrid, onToggleGrid, 'G')}

          {renderToggle(
            'Dimensions',
            showDimensions,
            onToggleDimensions,
            'D'
          )}

          {renderToggle(
            'Fold Lines',
            showFoldLines,
            onToggleFoldLines
          )}

          {renderToggle(
            'Cut Lines',
            showCutLines,
            onToggleCutLines
          )}
        </div>
      </div>

      {/* Center: Zoom and dieline dimensions */}
      <div className="toolbar-section toolbar-center">
        <div className="toolbar-group">
          <span className="toolbar-info">
            {scale !== null ? `${scale}%` : 'Zoom unavailable'}
            {' • '}
            {dimensions}
          </span>
        </div>
      </div>

      {/* Right: Export, project menu, settings and help */}
      <div className="toolbar-section toolbar-right">
        <div className="toolbar-group">
          {/* Export dropdown */}
          <div className="dropdown">
            <button
              type="button"
              className="toolbar-btn dropdown-trigger"
              onClick={() => toggleMenu('export')}
              title="Export"
              aria-label="Export options"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'export'}
            >
              <Download size={16} />
            </button>

            {openMenu === 'export' &&
              renderMenu(exportItems, handleExport)}
          </div>

          {/* Project dropdown */}
          <div className="dropdown">
            <button
              type="button"
              className="toolbar-btn dropdown-trigger"
              onClick={() => toggleMenu('project')}
              title="Project"
              aria-label="Project options"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'project'}
            >
              <Box size={16} />
            </button>

            {openMenu === 'project' &&
              renderMenu(projectItems, handleProjectAction)}
          </div>
        </div>

        {/* Settings and help */}
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setOpenMenu(null)}
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>

          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setOpenMenu(null)}
            title="Help"
            aria-label="Help"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
