import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, Upload, Undo, Redo, AlertCircle, CheckCircle, RotateCcw, FileText, Image, Box } from 'lucide-react';
import DielineCanvas from '../components/dieline/DielineCanvas';
import Dieline3DPreview from '../components/dieline/Dieline3DPreview';
import DielineProperties from '../components/dieline/DielineProperties';
import DielineToolbar from '../components/dieline/DielineToolbar';
import BoxStyleSelector from '../components/dieline/BoxStyleSelector';
import { generateDielineLayout, validateDielineConfig, getAllBoxStyles, getBoxStyle } from '../utils/dielineGeometry';
import { exportToSVG, exportToPDF, exportToPNG, exportToJSON, exportProjectFile, importFromJSON, generateFilename } from '../utils/dielineExport';
import { getDielineTemplate } from '../data/dielineTemplates';

const DEFAULT_DIMENSIONS = { length: 300, width: 200, height: 150, unit: 'mm' };
const DEFAULT_STYLE = 'shipping-box';
const DEFAULT_MATERIAL_THICKNESS = 1.5;
const DEFAULT_GLUE_FLAP_WIDTH = 30;

export default function DielineStudio() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Read configuration from location.state
  const stateConfig = location.state || {};
  const template = stateConfig.templateId ? getDielineTemplate(stateConfig.templateId) : null;
  
  // Core state - initialize from location.state or template or defaults
  const [dimensions, setDimensions] = useState(
    stateConfig.dimensions ?? template?.dimensions ?? DEFAULT_DIMENSIONS
  );
  const [styleId, setStyleId] = useState(
    stateConfig.styleId ?? template?.styleId ?? DEFAULT_STYLE
  );
  const [materialThickness, setMaterialThickness] = useState(
    stateConfig.materialThickness ?? DEFAULT_MATERIAL_THICKNESS
  );
  const [glueFlapWidth, setGlueFlapWidth] = useState(
    stateConfig.glueFlapWidth ?? DEFAULT_GLUE_FLAP_WIDTH
  );
  const [unit, setUnit] = useState(
    stateConfig.dimensions?.unit ?? template?.dimensions?.unit ?? 'mm'
  );
  
  // UI state
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showFoldLines, setShowFoldLines] = useState(true);
  const [showCutLines, setShowCutLines] = useState(true);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [viewport, setViewport] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const [layout, setLayout] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // History for undo/redo
  const [history, setHistory] = useState([{ dimensions, styleId, materialThickness, glueFlapWidth, unit }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Export/import
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  
  // Canvas ref for PNG export
  const canvasRef = useRef(null);

  // Generate layout when parameters change
  useEffect(() => {
    const config = {
      dimensions,
      styleId,
      materialThickness,
      glueFlapWidth,
      unit
    };
    
    const validation = validateDielineConfig(config);
    setValidationErrors(validation.errors);
    
    if (validation.valid) {
      const newLayout = generateDielineLayout(dimensions, styleId, materialThickness);
      setLayout(newLayout);
    }
  }, [dimensions, styleId, materialThickness, glueFlapWidth, unit]);

  // History management
  const pushHistory = useCallback((newState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-50); // Limit history size
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setHistoryIndex(newIndex);
      applyState(state);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setHistoryIndex(newIndex);
      applyState(state);
    }
  }, [history, historyIndex]);

  const applyState = (state) => {
    setDimensions(state.dimensions);
    setStyleId(state.styleId);
    setMaterialThickness(state.materialThickness);
    setGlueFlapWidth(state.glueFlapWidth);
    setUnit(state.unit);
  };

  // Track changes for history
  useEffect(() => {
    if (historyIndex === history.length - 1) {
      pushHistory({ dimensions, styleId, materialThickness, glueFlapWidth, unit });
    }
  }, [dimensions, styleId, materialThickness, glueFlapWidth, unit, history, historyIndex, pushHistory]);

  // Export handlers
  const handleExportSVG = useCallback(() => {
    if (!layout) return;
    const svg = exportToSVG(layout, dimensions, styleId, {
      showDimensions,
      showFoldLines,
      showCutLines,
      showGrid,
      unit,
      margin: 20
    });
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFilename('dieline', 'svg');
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  }, [layout, dimensions, styleId, showDimensions, showFoldLines, showCutLines, showGrid, unit]);

  const handleExportPDF = useCallback(() => {
    if (!layout) return;
    exportToPDF(layout, dimensions, styleId, {
      showDimensions,
      showFoldLines,
      showCutLines,
      unit,
      pageSize: 'A4',
      orientation: 'landscape',
      margins: 20
    });
    setShowExportModal(false);
  }, [layout, dimensions, styleId, showDimensions, showFoldLines, showCutLines, unit]);

  const handleExportPNG = useCallback(() => {
    if (!canvasRef.current) return;
    exportToPNG(canvasRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      filename: generateFilename('dieline', 'png')
    }).catch(err => console.error('PNG export failed:', err));
    setShowExportModal(false);
  }, []);

  const handleExportJSON = useCallback(() => {
    if (!layout) return;
    exportProjectFile({
      layout,
      dimensions,
      styleId,
      materialThickness,
      unit,
      metadata: {
        name: 'Dieline Project',
        description: `Box style: ${getBoxStyle(styleId)?.name}`
      }
    });
    setShowExportModal(false);
  }, [layout, dimensions, styleId, materialThickness, unit]);

  const handleImportJSON = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = importFromJSON(e.target.result);
      if (result.success) {
        const project = result.project;
        setDimensions(project.settings.dimensions);
        setStyleId(project.settings.styleId);
        setMaterialThickness(project.settings.materialThickness);
        setUnit(project.settings.unit);
        setLayout(project.layout);
        setShowImportModal(false);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    };
    reader.readAsText(file);
  }, []);

  // Toolbar callbacks
  const handleNewProject = useCallback(() => {
    if (confirm('Create new project? Unsaved changes will be lost.')) {
      setDimensions(DEFAULT_DIMENSIONS);
      setStyleId(DEFAULT_STYLE);
      setMaterialThickness(DEFAULT_MATERIAL_THICKNESS);
      setGlueFlapWidth(DEFAULT_GLUE_FLAP_WIDTH);
      setUnit('mm');
      setLayout(null);
      setHistory([{ dimensions: DEFAULT_DIMENSIONS, styleId: DEFAULT_STYLE, materialThickness: DEFAULT_MATERIAL_THICKNESS, glueFlapWidth: DEFAULT_GLUE_FLAP_WIDTH, unit: 'mm' }]);
      setHistoryIndex(0);
    }
  }, []);

  const handleOpenProject = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const handleSave = useCallback(() => {
    // Save to localStorage or backend
    const projectData = {
      layout,
      dimensions,
      styleId,
      materialThickness,
      unit,
      metadata: {
        name: 'Dieline Project',
        description: `Box style: ${getBoxStyle(styleId)?.name}`,
        savedAt: new Date().toISOString()
      }
    };
    localStorage.setItem('dieline-current-project', JSON.stringify(projectData));
    alert('Project saved to browser storage');
  }, [layout, dimensions, styleId, materialThickness, unit]);

  const handleFitView = useCallback(() => {
    // Canvas will handle fit to view
  }, []);

  const handleResetView = useCallback(() => {
    setViewport({ scale: 1, offsetX: 0, offsetY: 0 });
  }, []);

  const handleToggleGrid = useCallback((checked) => setShowGrid(checked), []);
  const handleToggleDimensions = useCallback((checked) => setShowDimensions(checked), []);
  const handleToggleFoldLines = useCallback((checked) => setShowFoldLines(checked), []);
  const handleToggleCutLines = useCallback((checked) => setShowCutLines(checked), []);

  // Get current style info
  const currentStyle = getBoxStyle(styleId);
  const boxStyles = getAllBoxStyles();

  // Handle layout changes from canvas
  const handleLayoutChange = useCallback((changes) => {
    if (changes.showGrid !== undefined) setShowGrid(changes.showGrid);
    if (changes.showFoldLines !== undefined) setShowFoldLines(changes.showFoldLines);
    if (changes.showCutLines !== undefined) setShowCutLines(changes.showCutLines);
  }, []);

  // Handle dimension changes from properties panel
  const handleDimensionsChange = useCallback((newDimensions) => {
    setDimensions(newDimensions);
  }, []);

  const handleStyleChange = useCallback((newStyleId) => {
    setStyleId(newStyleId);
    // Reset glue flap width for styles that don't support it
    const style = getBoxStyle(newStyleId);
    if (!style.supportsGlueFlap) {
      setGlueFlapWidth(0);
    }
  }, []);

  const handleMaterialThicknessChange = useCallback((value) => {
    setMaterialThickness(Math.max(0, value));
  }, []);

  const handleGlueFlapWidthChange = useCallback((value) => {
    setGlueFlapWidth(Math.max(0, value));
  }, []);

  const handleUnitChange = useCallback((newUnit) => {
    if (newUnit === unit) return;
    
    // Convert dimensions to new unit
    const converted = {};
    Object.entries(dimensions).forEach(([key, value]) => {
      if (key !== 'unit') {
        converted[key] = parseFloat((value * (UNIT_CONVERSION[unit] / UNIT_CONVERSION[newUnit])).toFixed(2));
      }
    });
    converted.unit = newUnit;
    setDimensions(converted);
  }, [dimensions, unit]);

  const UNIT_CONVERSION = { mm: 1, cm: 10, in: 25.4 };
  
  // Back to gallery handler
  const handleBackToGallery = useCallback(() => {
    navigate('/dieline');
  }, [navigate]);

  return (
    <div className="dieline-studio">
      <DielineToolbar
        onBackToGallery={handleBackToGallery}
        onSave={handleSave}
        onExportSVG={handleExportSVG}
        onExportPDF={handleExportPDF}
        onExportPNG={handleExportPNG}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onFitView={handleFitView}
        onResetView={handleResetView}
        onToggleGrid={handleToggleGrid}
        onToggleDimensions={handleToggleDimensions}
        onToggleFoldLines={handleToggleFoldLines}
        onToggleCutLines={handleToggleCutLines}
        showGrid={showGrid}
        showDimensions={showDimensions}
        showFoldLines={showFoldLines}
        showCutLines={showCutLines}
        viewport={viewport}
        layout={layout}
        unit={unit}
        onNewProject={handleNewProject}
        onOpenProject={handleOpenProject}
      />
      
      <div className="dieline-main">
        <aside className="dieline-sidebar dieline-sidebar-left">
          <DielineProperties
            dimensions={dimensions}
            styleId={styleId}
            materialThickness={materialThickness}
            glueFlapWidth={glueFlapWidth}
            unit={unit}
            onDimensionsChange={handleDimensionsChange}
            onStyleChange={handleStyleChange}
            onMaterialThicknessChange={handleMaterialThicknessChange}
            onGlueFlapWidthChange={handleGlueFlapWidthChange}
            onUnitChange={handleUnitChange}
            validationErrors={validationErrors}
          />
        </aside>
        
        <div className="dieline-editor-area">
          <DielineCanvas
            ref={canvasRef}
            layout={layout}
            dimensions={dimensions}
            styleId={styleId}
            materialThickness={materialThickness}
            unit={unit}
            showDimensions={showDimensions}
            showFoldLines={showFoldLines}
            showCutLines={showCutLines}
            showGrid={showGrid}
            onLayoutChange={handleLayoutChange}
            onPanelSelect={setSelectedPanel}
          />
        </div>
        
        <aside className="dieline-sidebar dieline-sidebar-right">
          <div className="dieline-3d-preview-container">
            <Dieline3DPreview
              layout={layout}
              dimensions={dimensions}
              styleId={styleId}
              materialThickness={materialThickness}
              unit={unit}
              selectedPanel={selectedPanel}
              onPanelSelect={setSelectedPanel}
            />
          </div>
          
          {selectedPanel && (
            <div className="dieline-panel-info-sidebar">
              <h4>Selected Panel</h4>
              <dl>
                <dt>Type</dt>
                <dd>{selectedPanel.type}</dd>
                <dt>Width</dt>
                <dd>{selectedPanel.width?.toFixed(1)} {unit}</dd>
                <dt>Height</dt>
                <dd>{selectedPanel.height?.toFixed(1)} {unit}</dd>
                <dt>Position</dt>
                <dd>({selectedPanel.x?.toFixed(1)}, {selectedPanel.y?.toFixed(1)})</dd>
              </dl>
            </div>
          )}
        </aside>
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Export Dieline</h3>
            <div className="modal-buttons">
              <button className="modal-btn" onClick={handleExportSVG}>
                <Download size={16} /> Export SVG
              </button>
              <button className="modal-btn" onClick={handleExportPDF}>
                <FileText size={16} /> Export PDF
              </button>
              <button className="modal-btn" onClick={handleExportPNG}>
                <Image size={16} /> Export PNG
              </button>
              <button className="modal-btn" onClick={handleExportJSON}>
                <Box size={16} /> Export JSON
              </button>
              <button className="modal-btn secondary" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Import Project</h3>
            <p>Select a JSON project file to import</p>
            <input 
              type="file" 
              accept=".json" 
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleImportJSON(e.target.files[0]);
                }
              }}
            />
            <div className="modal-buttons">
              <button className="modal-btn secondary" onClick={() => setShowImportModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
