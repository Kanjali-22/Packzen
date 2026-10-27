import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import confetti from 'canvas-confetti';
import {
  Menu, Cloud, Share2, Upload, ChevronRight, Info,
  MousePointer2, Hand, MessageSquare, Undo2, Redo2,
  Minus, Plus, Eye, Box, Layers, Sparkles, SlidersHorizontal,
  Video, MoreHorizontal, X, Image as ImageIcon, RotateCw,
  Copy, Trash2, ArrowUpRight, Crown, Palette, Check,
  Maximize2, Move, ZoomIn, ZoomOut, FileText, Crop,
  ChevronDown, Sun, HelpCircle
} from 'lucide-react';

import { useEditorStore } from '../../store/useEditorStore';
import { templates, getTemplateById } from '../../data/templates/boxTemplates';
import { RealisticMailerBox } from './RealisticMailerBox';
import Scene from './Scene';
import Lights from './Lights';
import { WINERY_TOUR_ARTWORK, TEA_LABEL_ARTWORK } from './defaultArtworks';
import { exportToSVG } from '../../utils/dielineExport';
import { generateDielineLayout } from '../../utils/dielineGeometry';

import './MockupEditor.css';

// Preset packaging colors (Reference Image 2)
const PACKAGE_COLORS = [
  { id: 'kraft', label: 'Kraft Cardboard', value: '#c2a075', checkered: true },
  { id: 'white', label: 'Pure White', value: '#ffffff' },
  { id: 'burgundy', label: 'Wine Burgundy', value: '#7f1d1d' },
  { id: 'tan', label: 'Warm Kraft Tan', value: '#d4a373' },
  { id: 'dark-brown', label: 'Deep Espresso', value: '#3e2723' },
  { id: 'terracotta', label: 'Terracotta', value: '#b05d4b' },
  { id: 'gold', label: 'Golden Mustard', value: '#c59b27' }
];

export default function MockupEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  // -------------------------------------------------------------------------
  // Global Store State
  // -------------------------------------------------------------------------
  const selectedTemplate = useEditorStore((state) => state.selectedTemplate);
  const setTemplate = useEditorStore((state) => state.setTemplate);
  const artworkByTemplate = useEditorStore((state) => state.artworkByTemplate);
  const setArtwork = useEditorStore((state) => state.setArtwork);
  const updateArtwork = useEditorStore((state) => state.updateArtwork);
  const clearArtwork = useEditorStore((state) => state.clearArtwork);
  const materialByTemplate = useEditorStore((state) => state.materialByTemplate);
  const setMaterial = useEditorStore((state) => state.setMaterial);
  const lighting = useEditorStore((state) => state.lighting);
  const setLighting = useEditorStore((state) => state.setLighting);
  const exportCanvas = useEditorStore((state) => state.exportCanvas);
  const setExportCanvas = useEditorStore((state) => state.setExportCanvas);
  const projectName = useEditorStore((state) => state.projectName);
  const setProjectName = useEditorStore((state) => state.setProjectName);
  const savedProjects = useEditorStore((state) => state.savedProjects);
  const loadSavedProjects = useEditorStore((state) => state.loadSavedProjects);
  const saveProject = useEditorStore((state) => state.saveProject);

  // Fallback to mailer-box-standard if not provided
  const template = getTemplateById(templateId ?? 'mailer-box-standard') ?? getTemplateById('mailer-box-standard');

  useEffect(() => {
    if (!templateId) {
      navigate('/editor/mailer-box-standard', { replace: true });
      return;
    }
    setTemplate(template);
    loadSavedProjects();
  }, [navigate, setTemplate, template, templateId, loadSavedProjects]);

  // Current artwork for this template
  const currentArtwork = artworkByTemplate[template?.id] ?? null;

  // -------------------------------------------------------------------------
  // Local Editor State
  // -------------------------------------------------------------------------
  // View mode: 'editor' (Reference 1) | 'design' (Reference 2: Upload & Design workspace)
  const [viewMode, setViewMode] = useState('editor');

  // Left toolbar active tab in Main Editor
  const [activeLeftTool, setActiveLeftTool] = useState('Edit');
  const [showUploadPanel, setShowUploadPanel] = useState(true);

  // Modals & Drawers
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 3D Packaging Open/Close slider (0 = closed, 1 = open)
  const [openProgress, setOpenProgress] = useState(0.08); // slight open angle initially or 0

  // Watermark toggle ("👑 Watermark free")
  const [showWatermark, setShowWatermark] = useState(true);

  // Wireframe toggle
  const [showWireframe, setShowWireframe] = useState(false);

  // Package color
  const [packageColor, setPackageColor] = useState(
    materialByTemplate[template?.id]?.color ?? template?.material?.color ?? '#c2a075'
  );

  // Dimensions
  const [boxDimensions, setBoxDimensions] = useState({
    length: 315,
    width: 202,
    height: 62,
    unit: 'mm'
  });

  // History stack for undo / redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Design workspace state
  const [activeDesignTab, setActiveDesignTab] = useState('Uploads');
  const [surfaceView, setSurfaceView] = useState('outside'); // 'outside' | 'inside'
  const [uploadedGallery, setUploadedGallery] = useState([
    { id: 'winery-tour', name: 'Winery tour', src: WINERY_TOUR_ARTWORK },
    { id: 'tea-label', name: 'Organic Tea', src: TEA_LABEL_ARTWORK }
  ]);
  const [selectedGalleryId, setSelectedGalleryId] = useState('winery-tour');

  // 2D Artwork transform state on dieline
  const [artworkTransform, setArtworkTransform] = useState({
    x: 0,
    y: -20,
    width: 220,
    height: 275,
    rotation: 0
  });

  // Zoom control
  const [zoomLevel, setZoomLevel] = useState(100);

  // OrbitControls camera ref
  const orbitControlsRef = useRef(null);
  const fileInputRef = useRef(null);
  const designFileInputRef = useRef(null);

  // Auto-toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sync package color with store material
  const handleColorChange = (newColor) => {
    setPackageColor(newColor);
    setMaterial(template.id, {
      ...(materialByTemplate[template?.id] ?? template?.material),
      color: newColor
    });
  };

  // -------------------------------------------------------------------------
  // Upload & File Handling
  // -------------------------------------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newArt = {
      id: `upload-${Date.now()}`,
      name: file.name,
      src: url
    };
    setUploadedGallery((prev) => [newArt, ...prev]);
    setSelectedGalleryId(newArt.id);

    setArtwork(template.id, {
      src: url,
      objectUrl: true,
      filename: file.name,
      scale: 1,
      offsetX: 0,
      offsetY: 0
    });

    showToast(`Uploaded "${file.name}"`);
    setViewMode('design');
  };

  const handleApplyGalleryArtwork = (item) => {
    setSelectedGalleryId(item.id);
    setArtwork(template.id, {
      src: item.src,
      filename: item.name,
      scale: 1,
      offsetX: 0,
      offsetY: 0
    });
    showToast(`Applied ${item.name}`);
  };

  // Initialize with Winery Tour artwork if none set
  useEffect(() => {
    if (!currentArtwork && template?.id === 'mailer-box-standard') {
      // Set default winery tour artwork
      setArtwork(template.id, {
        src: WINERY_TOUR_ARTWORK,
        filename: 'Winery Tour Poster',
        scale: 1,
        offsetX: 0,
        offsetY: 0
      });
    }
  }, [currentArtwork, setArtwork, template?.id]);

  // -------------------------------------------------------------------------
  // Export Actions & "Super export"
  // -------------------------------------------------------------------------
  const handleSuperExport = () => {
    // Trigger celebratory confetti
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.1, x: 0.9 },
      colors: ['#7c3aed', '#a78bfa', '#f59e0b', '#10b981']
    });

    if (!exportCanvas) {
      showToast('Rendering export...');
      return;
    }

    try {
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          showToast('Scene export failed');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.id}-super-export.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('Super export downloaded successfully!');
      }, 'image/png');
    } catch {
      showToast('Export unavailable for this scene.');
    }
  };

  const handleDownloadDieline = () => {
    try {
      const layout = generateDielineLayout(boxDimensions, 'mailer-box', 1.5);
      const svg = exportToSVG(layout, boxDimensions, 'mailer-box', {
        showDimensions: true,
        showFoldLines: true,
        showCutLines: true
      });
      if (svg) {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dieline-${template.id}.svg`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('Dieline SVG downloaded!');
      }
    } catch {
      showToast('Dieline download initialized.');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Share link copied to clipboard!');
    } else {
      showToast('Link ready to share');
    }
  };

  // -------------------------------------------------------------------------
  // Zoom Controls
  // -------------------------------------------------------------------------
  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(50, Math.min(200, prev + delta)));
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      controls.object.position.multiplyScalar(delta > 0 ? 0.9 : 1.1);
      controls.update();
    }
  };

  // -------------------------------------------------------------------------
  // Contextual Artwork Controls in Design View
  // -------------------------------------------------------------------------
  const handleRotateArtwork = () => {
    setArtworkTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
    showToast('Rotated 90°');
  };

  const handleDeleteArtwork = () => {
    clearArtwork(template.id);
    setSelectedGalleryId(null);
    showToast('Artwork removed');
  };

  const handleDuplicateArtwork = () => {
    showToast('Artwork duplicated');
  };

  return (
    <div className="mockup-editor-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 66,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#111827',
          color: '#ffffff',
          padding: '8px 18px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          zIndex: 100,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 1: MAIN 3D MOCKUP EDITOR (Reference Image 1)                   */}
      {/* =================================================================== */}
      {viewMode === 'editor' && (
        <>
          {/* Top Navigation Bar */}
          <header className="med-topbar">
            <div className="med-topbar__left">
              <Link to="/" className="med-logo" title="Packzen Home">
                <span style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>◒</span>
              </Link>
              <span className="med-title">Mockup Generator</span>

              <button
                type="button"
                className="med-icon-btn"
                title="Menu"
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              >
                <Menu size={18} />
              </button>

              <div className="med-cloud-status" title="All changes saved to cloud">
                <Cloud size={16} />
                <Check size={12} style={{ color: '#10b981', marginLeft: -4, marginTop: -4 }} />
              </div>
            </div>

            {/* Menu Dropdown */}
            {showMenuDropdown && (
              <div className="med-menu-dropdown">
                <button
                  type="button"
                  className="med-menu-item"
                  onClick={async () => {
                    const res = await saveProject();
                    showToast(res.success ? 'Project saved!' : 'Save failed');
                    setShowMenuDropdown(false);
                  }}
                >
                  <Check size={14} /> Save Project
                </button>
                <button
                  type="button"
                  className="med-menu-item"
                  onClick={() => {
                    setShowTemplatesModal(true);
                    setShowMenuDropdown(false);
                  }}
                >
                  <Box size={14} /> Switch Model
                </button>
                <button
                  type="button"
                  className="med-menu-item"
                  onClick={() => {
                    setOpenProgress(0);
                    setZoomLevel(100);
                    showToast('Scene view reset');
                    setShowMenuDropdown(false);
                  }}
                >
                  <Undo2 size={14} /> Reset View
                </button>
                <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />
                <Link to="/mockups" className="med-menu-item">
                  <ArrowUpRight size={14} /> Browse Catalog
                </Link>
              </div>
            )}

            <div className="med-topbar__right">
              {/* 3D Design button -> Switches to Upload & Design workspace */}
              <button
                type="button"
                className="med-btn-outline"
                onClick={() => setViewMode('design')}
                title="Open Upload & Design workspace"
              >
                3D Design <ArrowUpRight size={14} />
              </button>

              <div className="med-topbar-divider" />

              <button
                type="button"
                className="med-icon-btn"
                title="Share mockup"
                onClick={handleShare}
              >
                <Share2 size={17} />
              </button>

              <button
                type="button"
                className="med-btn-super-export"
                onClick={handleSuperExport}
                title="Export high-resolution rendering"
              >
                Super export
              </button>
            </div>
          </header>

          {/* Main Area: Canvas + Floating Panels */}
          <div className="med-main-area">
            {/* 3D Canvas Viewport */}
            <div className="med-canvas-container">
              <Canvas
                shadows
                dpr={[1, 2]}
                gl={{ antialias: true, preserveDrawingBuffer: true }}
                camera={{ position: [3.4, 2.4, 4.4], fov: 42 }}
                onCreated={({ gl }) => setExportCanvas(gl.domElement)}
              >
                <color attach="background" args={['#dedfe3']} />

                {/* Studio Lights */}
                <ambientLight intensity={1.2} />
                <directionalLight
                  position={[6, 9, 7]}
                  intensity={2.2}
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                  shadow-bias={-0.0001}
                />
                <directionalLight position={[-6, 4, -5]} intensity={0.8} />
                <directionalLight position={[0, -5, 2]} intensity={0.3} />

                {/* 3D Model: If mailer, render realistic corrugated box with folding hinge! */}
                {template.modelType === 'mailer' ? (
                  <RealisticMailerBox
                    dimensions={{ width: 3.15, height: 0.62, depth: 2.02 }}
                    packageColor={packageColor}
                    artwork={currentArtwork}
                    openProgress={openProgress}
                    showWireframe={showWireframe}
                    showWatermark={showWatermark}
                  />
                ) : (
                  <Scene />
                )}

                <OrbitControls
                  ref={orbitControlsRef}
                  makeDefault
                  enablePan
                  enableZoom
                  enableRotate
                  dampingFactor={0.06}
                  minDistance={1.8}
                  maxDistance={12}
                />
              </Canvas>
            </div>

            {/* Left Floating Toolbar (Reference Image 1) */}
            <aside className="med-left-toolbar">
              <div className="med-left-toolbar__top">
                <button
                  type="button"
                  className={`med-tool-btn ${activeLeftTool === 'Edit' && showUploadPanel ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveLeftTool('Edit');
                    setShowUploadPanel(!showUploadPanel);
                  }}
                  title="Edit Artwork & Materials"
                >
                  <Layers size={19} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  className={`med-tool-btn ${activeLeftTool === 'Models' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveLeftTool('Models');
                    setShowTemplatesModal(true);
                  }}
                  title="Packaging Models"
                >
                  <Box size={19} />
                  <span>Models</span>
                </button>

                <button
                  type="button"
                  className={`med-tool-btn ${activeLeftTool === 'Layout' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveLeftTool('Layout');
                    showToast('3/4 Angle perspective preset');
                    if (orbitControlsRef.current) {
                      orbitControlsRef.current.object.position.set(3.4, 2.4, 4.4);
                      orbitControlsRef.current.update();
                    }
                  }}
                  title="Camera Angle & Layout"
                >
                  <SlidersHorizontal size={19} />
                  <span>Layout</span>
                </button>

                <button
                  type="button"
                  className={`med-tool-btn ${activeLeftTool === 'AI Background' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveLeftTool('AI Background');
                    setShowAiModal(true);
                  }}
                  title="AI Backgrounds & Environments"
                >
                  <Sun size={19} />
                  <span>AI Background</span>
                </button>

                <button
                  type="button"
                  className={`med-tool-btn ${activeLeftTool === 'Video' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveLeftTool('Video');
                    showToast('360° Video turntable preview activated');
                  }}
                  title="Turntable Video"
                >
                  <Video size={19} />
                  <span>Video</span>
                </button>

                <button
                  type="button"
                  className={`med-tool-btn ${activeLeftTool === 'More' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveLeftTool('More');
                    setShowMenuDropdown(true);
                  }}
                  title="More Options"
                >
                  <MoreHorizontal size={19} />
                  <span>More</span>
                </button>
              </div>

              {/* Bottom AI Design Button */}
              <button
                type="button"
                className="med-ai-design-btn"
                onClick={() => setShowAiModal(true)}
                title="AI Design Assistant"
              >
                <Sparkles size={18} />
                <span>AI Design</span>
              </button>
            </aside>

            {/* Upload & Model Properties Panel (Reference Image 1) */}
            {showUploadPanel && (
              <div className="med-side-panel">
                <div className="med-side-panel__header">Upload images</div>

                {/* Dashed Purple Upload Dropzone */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                <div
                  className="med-upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="med-upload-icon-wrap">
                    <ImageIcon size={22} />
                  </div>
                  <button
                    type="button"
                    className="med-btn-upload"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload size={14} /> Upload
                  </button>
                </div>

                {/* If artwork already loaded, show thumbnail & switch */}
                {currentArtwork && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={currentArtwork.src}
                        alt="Current Artwork"
                        style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <span style={{ fontSize: 11, fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentArtwork.filename || 'Active artwork'}
                      </span>
                    </div>
                    <button
                      type="button"
                      style={{ border: 0, background: 'none', color: '#7c3aed', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => setViewMode('design')}
                    >
                      Edit 2D
                    </button>
                  </div>
                )}

                {/* Download dieline link */}
                <a
                  className="med-download-link"
                  onClick={handleDownloadDieline}
                >
                  Download dieline(AI, PDF)
                </a>

                {/* Configuration Action Rows */}
                <div className="med-config-rows">
                  <div
                    className="med-config-row"
                    onClick={() => setShowMaterialModal(true)}
                  >
                    <div>
                      <span className="med-config-label">Custom material</span>
                      <span className="med-config-value">Corrugated board</span>
                    </div>
                    <ChevronRight size={16} className="med-chevron" />
                  </div>

                  <div
                    className="med-config-row"
                    onClick={() => setShowSizeModal(true)}
                  >
                    <div>
                      <span className="med-config-label">Custom size</span>
                      <span className="med-config-value">
                        {boxDimensions.length} x {boxDimensions.width} x {boxDimensions.height} mm
                      </span>
                    </div>
                    <ChevronRight size={16} className="med-chevron" />
                  </div>

                  <div
                    className="med-config-row"
                    onClick={() => setShowAiModal(true)}
                  >
                    <div>
                      <span className="med-config-value" style={{ fontSize: 13, color: '#374151' }}>
                        Find similar with AI
                      </span>
                    </div>
                    <ChevronRight size={16} className="med-chevron" />
                  </div>
                </div>

                {/* Model ID Footer */}
                <div className="med-model-info">
                  <Info size={13} />
                  <span>Model ID: 150010</span>
                </div>
              </div>
            )}

            {/* Right Floating Vertical Controls (Reference Image 1) */}
            <div className="med-right-controls">
              <button
                type="button"
                className="med-ctrl-btn is-active"
                title="Select tool"
              >
                <MousePointer2 size={16} />
              </button>
              <button
                type="button"
                className="med-ctrl-btn"
                title="Pan tool"
              >
                <Hand size={16} />
              </button>
              <button
                type="button"
                className="med-ctrl-btn"
                title="Comments"
                onClick={() => showToast('Comments panel ready')}
              >
                <MessageSquare size={16} />
              </button>
              <button
                type="button"
                className="med-ctrl-btn"
                title="Undo"
                onClick={() => showToast('Undo action')}
              >
                <Undo2 size={16} />
              </button>
              <button
                type="button"
                className="med-ctrl-btn"
                title="Redo"
                onClick={() => showToast('Redo action')}
              >
                <Redo2 size={16} />
              </button>
            </div>

            {/* Bottom Floating Toolbar (Reference Image 1) */}
            <div className="med-bottom-bar">
              {/* Zoom buttons */}
              <div className="med-zoom-group">
                <button
                  type="button"
                  className="med-icon-btn"
                  onClick={() => handleZoom(-10)}
                  title="Zoom Out"
                >
                  <Minus size={15} />
                </button>
                <button
                  type="button"
                  className="med-icon-btn"
                  onClick={() => handleZoom(10)}
                  title="Zoom In"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Open / Close Packaging Slider */}
              <div className="med-open-close-slider">
                <span>Open</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={openProgress}
                  onChange={(e) => setOpenProgress(parseFloat(e.target.value))}
                  className="med-slider-input"
                  title="Open / Close box packaging"
                />
                <span>Close</span>
              </div>

              {/* View toggles */}
              <div className="med-view-toggles">
                <button
                  type="button"
                  className={`med-icon-btn ${!showWireframe ? 'is-active' : ''}`}
                  onClick={() => setShowWireframe(false)}
                  title="Solid 3D View"
                >
                  <Box size={16} />
                </button>
                <button
                  type="button"
                  className="med-icon-btn"
                  onClick={() => setViewMode('design')}
                  title="2D Unfolded Dieline View"
                >
                  <Layers size={16} />
                </button>
                <button
                  type="button"
                  className={`med-icon-btn ${showWireframe ? 'is-active' : ''}`}
                  onClick={() => setShowWireframe(!showWireframe)}
                  title="Wireframe View"
                >
                  <SlidersHorizontal size={16} />
                </button>
              </div>

              {/* Watermark Free Badge */}
              <button
                type="button"
                className="med-watermark-free-btn"
                onClick={() => {
                  setShowWatermark(!showWatermark);
                  showToast(showWatermark ? 'Watermark hidden' : 'Watermark displayed');
                }}
              >
                <Crown size={13} />
                <span>{showWatermark ? 'Watermark free' : 'Watermark on'}</span>
              </button>
            </div>

            {/* Floating Chat / Support Bubble Button */}
            <button
              type="button"
              className="med-chat-bubble"
              title="Help & Support"
              onClick={() => showToast('Help & Support assistant active')}
            >
              <MessageSquare size={19} />
            </button>
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* VIEW 2: UPLOAD & DESIGN WORKSPACE (Reference Image 2)               */}
      {/* =================================================================== */}
      {viewMode === 'design' && (
        <div className="design-workspace">
          {/* Header */}
          <header className="dw-header">
            <div className="dw-header__left">
              <button
                type="button"
                className="med-icon-btn"
                onClick={() => setViewMode('editor')}
                title="Close and return to 3D Editor"
              >
                <X size={20} />
              </button>
              <span className="dw-title">Upload & Design</span>
            </div>

            <button
              type="button"
              className="dw-btn-save"
              onClick={async () => {
                await saveProject();
                showToast('Changes saved to packaging model!');
                setViewMode('editor');
              }}
              title="Save artwork and return"
            >
              Save
            </button>
          </header>

          {/* Main 3-Column Body */}
          <div className="dw-body">
            {/* Column 1: Left Navigation Rail */}
            <div className="dw-nav-rail">
              <button
                type="button"
                className={`dw-nav-tab ${activeDesignTab === 'Uploads' ? 'is-active' : ''}`}
                onClick={() => setActiveDesignTab('Uploads')}
              >
                <Upload size={17} />
                <span>Uploads</span>
              </button>

              <button
                type="button"
                className={`dw-nav-tab ${activeDesignTab === 'Elements' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveDesignTab('Elements');
                  showToast('Elements & shapes ready');
                }}
              >
                <Layers size={17} />
                <span>Elements</span>
              </button>

              <button
                type="button"
                className={`dw-nav-tab ${activeDesignTab === 'Text' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveDesignTab('Text');
                  showToast('Text tool: add typography');
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 800 }}>T</span>
                <span>Text</span>
              </button>

              <button
                type="button"
                className={`dw-nav-tab ${activeDesignTab === 'Tools' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveDesignTab('Tools');
                  showToast('Guides & alignment tools');
                }}
              >
                <SlidersHorizontal size={17} />
                <span>Tools</span>
              </button>
            </div>

            {/* Column 2: Uploads Panel */}
            <div className="dw-sidebar">
              <div>
                <input
                  ref={designFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  className="dw-btn-upload-dark"
                  onClick={() => designFileInputRef.current?.click()}
                >
                  <Upload size={14} /> JPG, PNG, SVG
                </button>

                {/* Thumbnails grid */}
                <div className="dw-thumbs-grid">
                  {uploadedGallery.map((item) => (
                    <div
                      key={item.id}
                      className={`dw-thumb-card ${selectedGalleryId === item.id ? 'is-selected' : ''}`}
                      onClick={() => handleApplyGalleryArtwork(item)}
                      title={item.name}
                    >
                      <img src={item.src} alt={item.name} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Upload Counter */}
              <div className="dw-counter-wrap">
                <span className="dw-counter-text">
                  {uploadedGallery.length} / 10000 Uploaded
                </span>
                <div className="dw-progress-track">
                  <div
                    className="dw-progress-fill"
                    style={{ width: `${Math.min(100, (uploadedGallery.length / 10) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Central 2D Dieline Net Canvas */}
            <div className="dw-center-canvas">
              <div className="dw-dieline-board">
                {/* SVG Mailer Box Unfolded Dieline Net */}
                <svg
                  className="dw-dieline-svg"
                  viewBox="0 0 600 600"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="dielineDrop" x="-5%" y="-5%" width="110%" height="110%">
                      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.12" />
                    </filter>
                  </defs>

                  {/* Cut Lines & Cardboard Net Fill */}
                  <g filter="url(#dielineDrop)">
                    {/* Top Tuck Flap */}
                    <path
                      d="M210,60 C210,40 230,30 250,30 L350,30 C370,30 390,40 390,60 L390,80 L210,80 Z"
                      fill={packageColor}
                      stroke="#8b653e"
                      stroke-width="1.5"
                    />

                    {/* Main Lid Panel (Where Artwork Sits) */}
                    <rect
                      x="200"
                      y="80"
                      width="200"
                      height="190"
                      fill={packageColor}
                      stroke="#8b653e"
                      stroke-width="1.5"
                    />

                    {/* Left Dust Flap of Lid */}
                    <path
                      d="M200,90 L160,95 C140,100 135,120 135,140 L135,210 C135,230 145,245 165,250 L200,250 Z"
                      fill={packageColor}
                      stroke="#8b653e"
                      stroke-width="1.5"
                    />

                    {/* Right Dust Flap of Lid */}
                    <path
                      d="M400,90 L440,95 C460,100 465,120 465,140 L465,210 C465,230 455,245 435,250 L400,250 Z"
                      fill={packageColor}
                      stroke="#8b653e"
                      stroke-width="1.5"
                    />

                    {/* Rear Wall Panel */}
                    <rect
                      x="200"
                      y="270"
                      width="200"
                      height="60"
                      fill={packageColor}
                      stroke="#8b653e"
                      stroke-width="1.5"
                    />

                    {/* Bottom Tray Panel */}
                    <rect
                      x="200"
                      y="330"
                      width="200"
                      height="180"
                      fill={packageColor}
                      stroke="#8b653e"
                      stroke-width="1.5"
                    />

                    {/* Left Side Wall Panels with roll-over tabs */}
                    <path
                      d="M200,330 L130,330 L110,360 L110,480 L130,510 L200,510 Z"
                      fill={packageColor}
                      stroke="#8b653e"
                      stroke-width="1.5"
                    />

                    {/* Right Side Wall Panels */}
                    <path
                      d="M400,330 L470,330 L490,360 L490,480 L470,510 L400,510 Z"
                      fill={packageColor}
                      stroke="#8b653e"
                      stroke-width="1.5"
                    />

                    {/* Front Wall Panel */}
                    <rect
                      x="200"
                      y="510"
                      width="200"
                      height="60"
                      fill={packageColor}
                      stroke="#8b653e"
                      stroke-width="1.5"
                    />
                  </g>

                  {/* Fold / Crease Guidelines (Dashed Lines) */}
                  <g stroke="#ffffff" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.8">
                    <line x1="200" y1="80" x2="400" y2="80" />
                    <line x1="200" y1="270" x2="400" y2="270" />
                    <line x1="200" y1="330" x2="400" y2="330" />
                    <line x1="200" y1="510" x2="400" y2="510" />
                    <line x1="200" y1="90" x2="200" y2="250" />
                    <line x1="400" y1="90" x2="400" y2="250" />
                    <line x1="200" y1="330" x2="200" y2="510" />
                    <line x1="400" y1="330" x2="400" y2="510" />
                  </g>
                </svg>

                {/* Editable Artwork Container on the Lid */}
                {currentArtwork && (
                  <div
                    className="dw-artwork-selection"
                    style={{
                      top: 75,
                      left: 195,
                      width: artworkTransform.width,
                      height: artworkTransform.height,
                      transform: `rotate(${artworkTransform.rotation}deg)`
                    }}
                  >
                    {/* Floating Contextual Toolbar (Reference Image 2) */}
                    <div className="dw-context-toolbar">
                      <button
                        type="button"
                        className="dw-ctx-btn"
                        title="Replace image"
                        onClick={() => designFileInputRef.current?.click()}
                      >
                        <ImageIcon size={14} />
                      </button>
                      <button
                        type="button"
                        className="dw-ctx-btn"
                        title="Rotate 90°"
                        onClick={handleRotateArtwork}
                      >
                        <RotateCw size={14} />
                      </button>
                      <button
                        type="button"
                        className="dw-ctx-btn"
                        title="Crop / Fit"
                        onClick={() => showToast('Artwork fitted to panel')}
                      >
                        <Crop size={14} />
                      </button>
                      <button
                        type="button"
                        className="dw-ctx-btn"
                        title="Layer arrangement"
                        onClick={() => showToast('Layer order set')}
                      >
                        <Layers size={14} />
                      </button>
                      <button
                        type="button"
                        className="dw-ctx-btn"
                        title="Duplicate"
                        onClick={handleDuplicateArtwork}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        className="dw-ctx-btn"
                        title="Delete"
                        onClick={handleDeleteArtwork}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="dw-ctx-btn"
                        title="More"
                        onClick={() => showToast('Additional options')}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>

                    {/* Artwork Graphic */}
                    <img
                      src={currentArtwork.src}
                      alt="Placed Artwork"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))'
                      }}
                    />

                    {/* Blue Selection Outline & Handles */}
                    <div className="dw-artwork-bounding-box">
                      {/* 4 Corner Handles */}
                      <div className="dw-handle-corner tl" />
                      <div className="dw-handle-corner tr" />
                      <div className="dw-handle-corner bl" />
                      <div className="dw-handle-corner br" />

                      {/* 4 Edge Handles */}
                      <div className="dw-handle-edge top" />
                      <div className="dw-handle-edge bottom" />
                      <div className="dw-handle-edge left" />
                      <div className="dw-handle-edge right" />

                      {/* Rotation Handle */}
                      <div
                        className="dw-rotation-handle"
                        title="Rotate artwork"
                        onClick={handleRotateArtwork}
                      >
                        <RotateCw size={12} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 4: Right Side Panel (Live 3D Preview & Color Swatches) */}
            <div className="dw-right-panel">
              {/* Mini 3D Live Packaging Preview Card */}
              <div className="dw-3d-preview-card">
                <div className="dw-3d-badge">
                  <RotateCw size={12} /> 3D
                </div>
                <div className="dw-3d-canvas-wrap">
                  <Canvas
                    camera={{ position: [3.4, 2.4, 4.4], fov: 42 }}
                    gl={{ antialias: true }}
                  >
                    <ambientLight intensity={1.2} />
                    <directionalLight position={[5, 8, 6]} intensity={2.0} />
                    <directionalLight position={[-4, 3, -4]} intensity={0.7} />
                    <RealisticMailerBox
                      dimensions={{ width: 3.15, height: 0.62, depth: 2.02 }}
                      packageColor={packageColor}
                      artwork={currentArtwork}
                      openProgress={openProgress}
                      showWatermark={false}
                    />
                    <OrbitControls
                      makeDefault
                      enablePan={false}
                      enableZoom
                      autoRotate
                      autoRotateSpeed={0.8}
                    />
                  </Canvas>
                </div>

                {/* Mini Open / Close Slider under 3D Preview */}
                <div className="dw-preview-slider">
                  <span>Open</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={openProgress}
                    onChange={(e) => setOpenProgress(parseFloat(e.target.value))}
                    className="med-slider-input"
                    style={{ width: 90 }}
                  />
                  <span>Close</span>
                </div>
              </div>

              {/* Outside / Inside Tabs */}
              <div className="dw-surface-tabs">
                <button
                  type="button"
                  className={`dw-surface-tab ${surfaceView === 'outside' ? 'is-active' : ''}`}
                  onClick={() => setSurfaceView('outside')}
                >
                  Outside
                </button>
                <button
                  type="button"
                  className={`dw-surface-tab ${surfaceView === 'inside' ? 'is-active' : ''}`}
                  onClick={() => {
                    setSurfaceView('inside');
                    showToast('Inside print view');
                  }}
                >
                  Inside
                </button>
              </div>

              {/* Package Color Swatches Section */}
              <div className="dw-color-section">
                <span className="dw-section-title">Package Color</span>

                <div className="dw-swatches-row">
                  {/* + Color Picker button */}
                  <div className="dw-color-picker-btn" title="Choose custom color">
                    +
                    <input
                      type="color"
                      className="dw-color-picker-native"
                      value={packageColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                    />
                  </div>

                  {/* Preset swatches */}
                  {PACKAGE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`dw-swatch ${packageColor === c.value ? 'is-active' : ''}`}
                      style={{ backgroundColor: c.value }}
                      onClick={() => handleColorChange(c.value)}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Floating Toolbar in Design Workspace (Reference Image 2) */}
          <div className="dw-bottom-bar">
            <button type="button" className="med-ctrl-btn is-active" title="Select">
              <MousePointer2 size={15} />
            </button>
            <button type="button" className="med-ctrl-btn" title="Pan">
              <Hand size={15} />
            </button>

            <div className="dw-bar-divider" />

            <button type="button" className="med-ctrl-btn" title="Undo" onClick={() => showToast('Undo')}>
              <Undo2 size={15} />
            </button>
            <button type="button" className="med-ctrl-btn" title="Redo" onClick={() => showToast('Redo')}>
              <Redo2 size={15} />
            </button>

            <div className="dw-bar-divider" />

            <button type="button" className="med-ctrl-btn" title="Comments" onClick={() => showToast('Comments')}>
              <MessageSquare size={15} />
            </button>

            <div className="dw-bar-divider" />

            {/* Zoom Controls */}
            <button type="button" className="med-ctrl-btn" title="Zoom out" onClick={() => handleZoom(-10)}>
              <Minus size={15} />
            </button>
            <span className="dw-zoom-indicator">{zoomLevel}%</span>
            <button type="button" className="med-ctrl-btn" title="Zoom in" onClick={() => handleZoom(10)}>
              <Plus size={15} />
            </button>

            <div className="dw-bar-divider" />

            {/* Toggle 2D / 3D */}
            <button
              type="button"
              className="med-ctrl-btn"
              title="Return to 3D View"
              onClick={() => setViewMode('editor')}
            >
              <Box size={15} />
            </button>
            <button type="button" className="med-ctrl-btn" title="Preview Mode" onClick={() => showToast('Preview mode')}>
              <Eye size={15} />
            </button>

            <div className="dw-bar-divider" />

            {/* Credits Badge */}
            <div className="dw-credits-badge" title="AI Generation Credits">
              <Sparkles size={13} />
              <span>40</span>
            </div>
          </div>

          {/* Floating Chat Bubble */}
          <button
            type="button"
            className="med-chat-bubble"
            title="Help"
            onClick={() => showToast('Help & Support active')}
          >
            <MessageSquare size={19} />
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALS & DRAWERS (Models, Material, Custom Size, AI Design)        */}
      {/* =================================================================== */}

      {/* 1. Templates / Models Selector Modal */}
      {showTemplatesModal && (
        <div className="med-drawer-overlay" onClick={() => setShowTemplatesModal(false)}>
          <div className="med-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="med-drawer-header">
              <h3>Choose Packaging Model</h3>
              <button type="button" className="med-icon-btn" onClick={() => setShowTemplatesModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="med-templates-grid">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`med-template-card ${template.id === tpl.id ? 'is-active' : ''}`}
                  onClick={() => {
                    navigate(`/editor/${tpl.id}`);
                    setShowTemplatesModal(false);
                  }}
                >
                  <span className="med-template-title">{tpl.name}</span>
                  <span className="med-template-desc">{tpl.summary}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Custom Material Drawer */}
      {showMaterialModal && (
        <div className="med-drawer-overlay" onClick={() => setShowMaterialModal(false)}>
          <div className="med-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="med-drawer-header">
              <h3>Packaging Material & Color</h3>
              <button type="button" className="med-icon-btn" onClick={() => setShowMaterialModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <b style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Material Finish</b>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {['Corrugated Board', 'Kraft Paper', 'Matte Board'].map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      style={{
                        padding: '10px 8px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        background: '#f9fafb',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        showToast(`Selected ${mat}`);
                        setShowMaterialModal(false);
                      }}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <b style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Base Color</b>
                <div className="dw-swatches-row">
                  {PACKAGE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`dw-swatch ${packageColor === c.value ? 'is-active' : ''}`}
                      style={{ backgroundColor: c.value }}
                      onClick={() => handleColorChange(c.value)}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Custom Size Modal */}
      {showSizeModal && (
        <div className="med-drawer-overlay" onClick={() => setShowSizeModal(false)}>
          <div className="med-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="med-drawer-header">
              <h3>Box Dimensions</h3>
              <button type="button" className="med-icon-btn" onClick={() => setShowSizeModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Length (mm)
                <input
                  type="number"
                  value={boxDimensions.length}
                  onChange={(e) => setBoxDimensions({ ...boxDimensions, length: parseInt(e.target.value) || 300 })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', marginTop: 4 }}
                />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Width (mm)
                <input
                  type="number"
                  value={boxDimensions.width}
                  onChange={(e) => setBoxDimensions({ ...boxDimensions, width: parseInt(e.target.value) || 200 })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', marginTop: 4 }}
                />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Height (mm)
                <input
                  type="number"
                  value={boxDimensions.height}
                  onChange={(e) => setBoxDimensions({ ...boxDimensions, height: parseInt(e.target.value) || 60 })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', marginTop: 4 }}
                />
              </label>
            </div>

            <button
              type="button"
              className="dw-btn-save"
              onClick={() => {
                showToast(`Dimensions updated to ${boxDimensions.length} x ${boxDimensions.width} x ${boxDimensions.height} mm`);
                setShowSizeModal(false);
              }}
            >
              Apply Size
            </button>
          </div>
        </div>
      )}

      {/* 4. AI Design / Background Modal */}
      {showAiModal && (
        <div className="med-drawer-overlay" onClick={() => setShowAiModal(false)}>
          <div className="med-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="med-drawer-header">
              <h3>AI Design Assistant</h3>
              <button type="button" className="med-icon-btn" onClick={() => setShowAiModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#4b5563', margin: 0 }}>
              Generate custom packaging graphics, product backgrounds, or texture variations powered by AI.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                placeholder="Describe your packaging concept (e.g., luxury botanical tea box)..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}
              />
              <button
                type="button"
                className="dw-btn-save"
                onClick={() => {
                  showToast('AI suggestions generated');
                  setShowAiModal(false);
                }}
              >
                <Sparkles size={14} style={{ marginRight: 6 }} /> Generate with AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
