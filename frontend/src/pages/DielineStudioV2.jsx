import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, FolderOpen, Save, Download, Settings, User,
  Hand, ZoomIn, ZoomOut, Maximize2, Grid as GridIcon, 
  Ruler, Eye, RotateCcw, Box as BoxIcon, ArrowLeft
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './DielineStudioV2.css';

// ============================================================================
// GEOMETRY UTILITIES
// ============================================================================

const UNITS = { mm: 1, cm: 10, in: 25.4 };

function convertUnit(value, fromUnit, toUnit) {
  const from = UNITS[fromUnit] || UNITS.mm;
  const to = UNITS[toUnit] || UNITS.mm;
  return (value * from) / to;
}

function validateDimensions(dimensions) {
  const errors = [];
  const { length, width, height } = dimensions;
  
  if (typeof length !== 'number' || length <= 0) errors.push('Length must be positive');
  if (typeof width !== 'number' || width <= 0) errors.push('Width must be positive');
  if (typeof height !== 'number' || height <= 0) errors.push('Height must be positive');
  
  return { valid: errors.length === 0, errors };
}

// Generate horizontal cross-shaped net for shipping box
function generateShippingBoxLayout(L, W, H, glueWidth = 30) {
  const panels = {};
  const foldLines = [];
  const cutLines = [];
  
  // Horizontal strip: Front | Side1 | Back | Side2 | Glue
  let currentX = 0;
  const panelY = W / 2; // Flaps extend above and below
  
  // Front panel
  panels.front = { x: currentX, y: panelY, width: L, height: H, type: 'panel', name: 'Front Panel' };
  currentX += L;
  
  // Side 1 panel
  panels.side1 = { x: currentX, y: panelY, width: W, height: H, type: 'panel', name: 'Side 1' };
  foldLines.push({ x1: currentX, y1: panelY, x2: currentX, y2: panelY + H, type: 'fold' });
  currentX += W;
  
  // Back panel  
  panels.back = { x: currentX, y: panelY, width: L, height: H, type: 'panel', name: 'Back Panel' };
  foldLines.push({ x1: currentX, y1: panelY, x2: currentX, y2: panelY + H, type: 'fold' });
  currentX += L;
  
  // Side 2 panel
  panels.side2 = { x: currentX, y: panelY, width: W, height: H, type: 'panel', name: 'Side 2' };
  foldLines.push({ x1: currentX, y1: panelY, x2: currentX, y2: panelY + H, type: 'fold' });
  currentX += W;
  
  // Glue flap
  if (glueWidth > 0) {
    panels.glue = { x: currentX, y: panelY, width: glueWidth, height: H, type: 'glue', name: 'Glue Flap' };
    foldLines.push({ x1: currentX, y1: panelY, x2: currentX, y2: panelY + H, type: 'fold' });
    currentX += glueWidth;
  }
  
  // Top flaps
  panels.topFlap1 = { x: 0, y: 0, width: L, height: W / 2, type: 'flap', name: 'Top Flap 1' };
  panels.topFlap2 = { x: L + W, y: 0, width: L, height: W / 2, type: 'flap', name: 'Top Flap 2' };
  foldLines.push({ x1: 0, y1: W / 2, x2: L, y2: W / 2, type: 'fold' });
  foldLines.push({ x1: L + W, y1: W / 2, x2: 2 * L + W, y2: W / 2, type: 'fold' });
  
  // Bottom flaps
  const bottomY = panelY + H;
  panels.bottomFlap1 = { x: 0, y: bottomY, width: L, height: W / 2, type: 'flap', name: 'Bottom Flap 1' };
  panels.bottomFlap2 = { x: L + W, y: bottomY, width: L, height: W / 2, type: 'flap', name: 'Bottom Flap 2' };
  foldLines.push({ x1: 0, y1: bottomY, x2: L, y2: bottomY, type: 'fold' });
  foldLines.push({ x1: L + W, y1: bottomY, x2: 2 * L + W, y2: bottomY, type: 'fold' });
  
  // Cut line (perimeter)
  const totalWidth = currentX;
  const totalHeight = W / 2 + H + W / 2;
  
  // Outer cut perimeter
  cutLines.push(
    // Top edge with notches
    { x1: 0, y1: 0, x2: L, y2: 0, type: 'cut' },
    { x1: L, y1: 0, x2: L, y2: W / 2, type: 'cut' },
    { x1: L, y1: W / 2, x2: L + W, y2: W / 2, type: 'cut' },
    { x1: L + W, y1: W / 2, x2: L + W, y2: 0, type: 'cut' },
    { x1: L + W, y1: 0, x2: 2 * L + W, y2: 0, type: 'cut' },
    { x1: 2 * L + W, y1: 0, x2: 2 * L + W, y2: W / 2, type: 'cut' },
    { x1: 2 * L + W, y1: W / 2, x2: totalWidth, y2: W / 2, type: 'cut' },
    // Right edge
    { x1: totalWidth, y1: W / 2, x2: totalWidth, y2: bottomY, type: 'cut' },
    { x1: totalWidth, y1: bottomY, x2: 2 * L + W, y2: bottomY, type: 'cut' },
    // Bottom edge with notches
    { x1: 2 * L + W, y1: bottomY, x2: 2 * L + W, y2: totalHeight, type: 'cut' },
    { x1: 2 * L + W, y1: totalHeight, x2: L + W, y2: totalHeight, type: 'cut' },
    { x1: L + W, y1: totalHeight, x2: L + W, y2: bottomY, type: 'cut' },
    { x1: L + W, y1: bottomY, x2: L, y2: bottomY, type: 'cut' },
    { x1: L, y1: bottomY, x2: L, y2: totalHeight, type: 'cut' },
    { x1: L, y1: totalHeight, x2: 0, y2: totalHeight, type: 'cut' },
    // Left edge
    { x1: 0, y1: totalHeight, x2: 0, y2: 0, type: 'cut' }
  );
  
  return {
    panels,
    foldLines,
    cutLines,
    totalWidth,
    totalHeight,
    bounds: { minX: 0, minY: 0, maxX: totalWidth, maxY: totalHeight }
  };
}

function generateDielineLayout(dimensions, styleId, materialThickness = 0, glueFlapWidth = 30) {
  const { length, width, height } = dimensions;
  
  if (styleId === 'shipping-box') {
    return generateShippingBoxLayout(length, width, height, glueFlapWidth);
  }
  
  // Fallback for other styles
  return generateShippingBoxLayout(length, width, height, glueFlapWidth);
}

// ============================================================================
// 3D BOX COMPONENT
// ============================================================================

function Box3D({ dimensions, materialThickness, selectedPanel, onPanelSelect }) {
  const { length, width, height } = dimensions;
  const t = Math.max(materialThickness, 0.5);
  
  const parts = [
    { id: 'bottom', size: [length, t, width], position: [0, t / 2, 0], color: '#e8dcc8' },
    { id: 'front', size: [length, height, t], position: [0, height / 2 + t, -width / 2], color: '#e8dcc8' },
    { id: 'back', size: [length, height, t], position: [0, height / 2 + t, width / 2], color: '#e8dcc8' },
    { id: 'side1', size: [t, height, width], position: [-length / 2, height / 2 + t, 0], color: '#e8dcc8' },
    { id: 'side2', size: [t, height, width], position: [length / 2, height / 2 + t, 0], color: '#e8dcc8' },
    { id: 'top', size: [length, t, width], position: [0, height + 1.5 * t, 0], color: '#d0c4b8' },
  ];
  
  return (
    <group>
      {parts.map((part) => (
        <mesh
          key={part.id}
          position={part.position}
          onClick={(e) => {
            e.stopPropagation();
            onPanelSelect?.(part.id);
          }}
          castShadow
          receiveShadow
        >
          <boxGeometry args={part.size} />
          <meshStandardMaterial
            color={selectedPanel === part.id ? '#90cdf4' : part.color}
            roughness={0.78}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================================
// DIELINE STUDIO COMPONENT
// ============================================================================

export default function DielineStudioV2() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateConfig = location.state || {};
  
  // Core configuration state (initialized from navigation state if available)
  const [boxStyle, setBoxStyle] = useState(stateConfig.styleId || 'shipping-box');
  const [dimensions, setDimensions] = useState(
    stateConfig.dimensions || { length: 300, width: 200, height: 150 }
  );
  const [unit, setUnit] = useState(stateConfig.dimensions?.unit || 'mm');
  const [materialThickness, setMaterialThickness] = useState(stateConfig.materialThickness || 1.5);
  const [glueFlapWidth, setGlueFlapWidth] = useState(stateConfig.glueFlapWidth || 30);
  
  // Display options
  const [showDimensions, setShowDimensions] = useState(true);
  const [showFoldLines, setShowFoldLines] = useState(true);
  const [showCutLines, setShowCutLines] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  
  // View mode
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [selectedPanel, setSelectedPanel] = useState(null);
  
  // Canvas state
  const [layout, setLayout] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('select'); // 'select' or 'pan'
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const viewRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
  const sizeRef = useRef({ width: 0, height: 0 });
  const rafRef = useRef(null);
  
  // Generate layout when configuration changes
  const updateDieline = useCallback(() => {
    const validation = validateDimensions(dimensions);
    if (!validation.valid) {
      console.error('Invalid dimensions:', validation.errors);
      return;
    }
    
    const newLayout = generateDielineLayout(dimensions, boxStyle, materialThickness, glueFlapWidth);
    setLayout(newLayout);
  }, [dimensions, boxStyle, materialThickness, glueFlapWidth]);
  
  useEffect(() => {
    updateDieline();
  }, [updateDieline]);
  
  // Canvas drawing
  const drawCanvas = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas || !layout) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const { width, height } = sizeRef.current;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      
      // Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
      
      const view = viewRef.current;
      const s = view.scale;
      const ox = view.offsetX;
      const oy = view.offsetY;
      
      const px = (x) => ox + x * s;
      const py = (y) => oy + y * s;
      
      // Grid
      if (showGrid && s > 0) {
        const gridStepWorld = s < 0.35 ? 100 : s < 0.7 ? 50 : 10;
        const step = gridStepWorld * s;
        if (step >= 5) {
          const startX = ((ox % step) + step) % step;
          const startY = ((oy % step) + step) % step;
          ctx.beginPath();
          ctx.strokeStyle = '#e9eef5';
          ctx.lineWidth = 1;
          for (let x = startX; x < width; x += step) {
            ctx.moveTo(Math.round(x) + 0.5, 0);
            ctx.lineTo(Math.round(x) + 0.5, height);
          }
          for (let y = startY; y < height; y += step) {
            ctx.moveTo(0, Math.round(y) + 0.5);
            ctx.lineTo(width, Math.round(y) + 0.5);
          }
          ctx.stroke();
        }
      }
      
      if (!layout.panels) return;
      
      // Draw panels
      Object.entries(layout.panels).forEach(([id, panel]) => {
        const x = px(panel.x);
        const y = py(panel.y);
        const w = panel.width * s;
        const h = panel.height * s;
        const selected = id === selectedPanel;
        
        const fillByType = {
          panel: '#ffffff',
          flap: '#f1f5f9',
          glue: '#fff7ed',
        };
        ctx.fillStyle = selected ? '#dbeafe' : (fillByType[panel.type] || '#ffffff');
        ctx.fillRect(x, y, w, h);
        
        ctx.strokeStyle = selected ? '#2563eb' : '#334155';
        ctx.lineWidth = selected ? 2.2 : 1.4;
        ctx.strokeRect(x, y, w, h);
        
        // Panel labels
        if (showDimensions && s >= 0.22 && w >= 38 && h >= 24) {
          ctx.fillStyle = '#334155';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const fontSize = Math.max(9, Math.min(13, 11 * Math.min(s + 0.3, 1.2)));
          ctx.font = `${fontSize}px sans-serif`;
          const label = `${panel.width.toFixed(0)} × ${panel.height.toFixed(0)} ${unit}`;
          ctx.fillText(label, x + w / 2, y + h / 2, Math.max(0, w - 8));
          if (h >= 42) {
            ctx.fillStyle = '#64748b';
            ctx.font = `${Math.max(9, fontSize - 1)}px sans-serif`;
            ctx.fillText(panel.name || id, x + w / 2, y + h / 2 + fontSize + 3, Math.max(0, w - 8));
          }
        }
      });
      
      // Draw fold lines (blue dashed)
      if (showFoldLines && Array.isArray(layout.foldLines)) {
        ctx.save();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        layout.foldLines.forEach((line) => {
          if (line.x1 !== undefined) {
            ctx.moveTo(px(line.x1), py(line.y1));
            ctx.lineTo(px(line.x2), py(line.y2));
          }
        });
        ctx.stroke();
        ctx.restore();
      }
      
      // Draw cut lines (red solid)
      if (showCutLines && Array.isArray(layout.cutLines)) {
        ctx.save();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.beginPath();
        layout.cutLines.forEach((line) => {
          if (line.x1 !== undefined) {
            ctx.moveTo(px(line.x1), py(line.y1));
            ctx.lineTo(px(line.x2), py(line.y2));
          }
        });
        ctx.stroke();
        ctx.restore();
      }
      
      // Total dimensions
      if (showDimensions && layout.bounds) {
        ctx.save();
        ctx.strokeStyle = '#94a3b8';
        ctx.fillStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        const bx = px(layout.bounds.minX);
        const by = py(layout.bounds.minY);
        const bw = layout.totalWidth * s;
        const bh = layout.totalHeight * s;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(
          `Total: ${layout.totalWidth.toFixed(0)} × ${layout.totalHeight.toFixed(0)} ${unit}`,
          bx + bw / 2,
          by - 5
        );
        ctx.restore();
      }
    });
  }, [layout, selectedPanel, showGrid, showDimensions, showFoldLines, showCutLines, unit]);
  
  // Fit to view
  const fitToView = useCallback(() => {
    if (!layout || !layout.bounds) return;
    const { width, height } = sizeRef.current;
    if (width <= 0 || height <= 0) return;
    
    const padding = 60;
    const usableWidth = Math.max(1, width - padding * 2);
    const usableHeight = Math.max(1, height - padding * 2);
    const nextScale = Math.min(
      usableWidth / layout.totalWidth,
      usableHeight / layout.totalHeight,
      3
    );
    const safeScale = Math.max(0.05, Math.min(nextScale, 8));
    
    viewRef.current = {
      scale: safeScale,
      offsetX: (width - layout.totalWidth * safeScale) / 2,
      offsetY: (height - layout.totalHeight * safeScale) / 2,
    };
    setScale(safeScale);
    drawCanvas();
  }, [layout, drawCanvas]);
  
  // Zoom
  const handleZoom = useCallback((factor, centerX, centerY) => {
    const view = viewRef.current;
    const nextScale = Math.max(0.05, Math.min(8, view.scale * factor));
    const ratio = nextScale / view.scale;
    
    const cx = centerX !== undefined ? centerX : sizeRef.current.width / 2;
    const cy = centerY !== undefined ? centerY : sizeRef.current.height / 2;
    
    viewRef.current = {
      scale: nextScale,
      offsetX: cx - (cx - view.offsetX) * ratio,
      offsetY: cy - (cy - view.offsetY) * ratio,
    };
    setScale(nextScale);
    drawCanvas();
  }, [drawCanvas]);
  
  // Canvas setup and resize
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;
    
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const dpr = window.devicePixelRatio || 1;
      
      sizeRef.current = { width, height };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      drawCanvas();
    };
    
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(container);
    resize();
    
    // Initial fit after first layout
    if (layout) {
      setTimeout(fitToView, 100);
    }
    
    return () => observer?.disconnect();
  }, [layout, drawCanvas, fitToView]);
  
  // Canvas events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    
    const onWheel = (event) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * 0.0015);
      handleZoom(factor, event.clientX - rect.left, event.clientY - rect.top);
    };
    
    const onPointerDown = (event) => {
      if (tool === 'pan' || event.button === 1 || event.shiftKey) {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        dragRef.current = {
          startX: event.clientX - rect.left,
          startY: event.clientY - rect.top,
          offsetX: viewRef.current.offsetX,
          offsetY: viewRef.current.offsetY,
          moved: false,
        };
        canvas.style.cursor = 'grabbing';
      }
    };
    
    const onPointerMove = (event) => {
      if (!dragRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const dx = (event.clientX - rect.left) - dragRef.current.startX;
      const dy = (event.clientY - rect.top) - dragRef.current.startY;
      if (Math.abs(dx) + Math.abs(dy) > 2) dragRef.current.moved = true;
      
      viewRef.current = {
        ...viewRef.current,
        offsetX: dragRef.current.offsetX + dx,
        offsetY: dragRef.current.offsetY + dy,
      };
      drawCanvas();
    };
    
    const onPointerUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        canvas.style.cursor = tool === 'pan' ? 'grab' : 'default';
      }
    };
    
    const onClick = (event) => {
      if (dragRef.current?.moved) return;
      if (tool !== 'select') return;
      
      const rect = canvas.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;
      const worldX = (cx - viewRef.current.offsetX) / viewRef.current.scale;
      const worldY = (cy - viewRef.current.offsetY) / viewRef.current.scale;
      
      if (!layout?.panels) return;
      const panelEntries = Object.entries(layout.panels);
      for (let i = panelEntries.length - 1; i >= 0; i -= 1) {
        const [id, p] = panelEntries[i];
        if (worldX >= p.x && worldX <= p.x + p.width && worldY >= p.y && worldY <= p.y + p.height) {
          setSelectedPanel(id);
          return;
        }
      }
      setSelectedPanel(null);
    };
    
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('click', onClick);
    
    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('click', onClick);
    };
  }, [tool, layout, handleZoom, drawCanvas]);
  
  // Redraw when options change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  
  const panelList = layout?.panels ? Object.keys(layout.panels).filter(id => layout.panels[id].type !== 'glue') : [];
  
  const selectedPanelData = selectedPanel && layout?.panels?.[selectedPanel];
  
  // Export handlers
  const handleSave = useCallback(() => {
    const projectData = {
      boxStyle,
      dimensions,
      unit,
      materialThickness,
      glueFlapWidth,
      layout,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('dieline-project', JSON.stringify(projectData));
    alert('Project saved to browser storage');
  }, [boxStyle, dimensions, unit, materialThickness, glueFlapWidth, layout]);
  
  const handleExportSVG = useCallback(() => {
    if (!layout) return;
    
    // Simple SVG export
    const padding = 20;
    const totalWidth = layout.totalWidth + padding * 2;
    const totalHeight = layout.totalHeight + padding * 2;
    
    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">\n`;
    svg += `  <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="white"/>\n`;
    
    // Panels
    Object.entries(layout.panels).forEach(([id, panel]) => {
      const x = padding + panel.x;
      const y = padding + panel.y;
      svg += `  <rect x="${x}" y="${y}" width="${panel.width}" height="${panel.height}" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>\n`;
    });
    
    // Fold lines (blue dashed)
    if (layout.foldLines) {
      layout.foldLines.forEach((line) => {
        if (line.x1 !== undefined) {
          const x1 = padding + line.x1;
          const y1 = padding + line.y1;
          const x2 = padding + line.x2;
          const y2 = padding + line.y2;
          svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="6,4"/>\n`;
        }
      });
    }
    
    // Cut lines (red solid)
    if (layout.cutLines) {
      layout.cutLines.forEach((line) => {
        if (line.x1 !== undefined) {
          const x1 = padding + line.x1;
          const y1 = padding + line.y1;
          const x2 = padding + line.x2;
          const y2 = padding + line.y2;
          svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#dc2626" stroke-width="2"/>\n`;
        }
      });
    }
    
    svg += `</svg>`;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dieline-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [layout]);
  
  const handleExportJSON = useCallback(() => {
    const projectData = {
      version: '1.0',
      boxStyle,
      dimensions,
      unit,
      materialThickness,
      glueFlapWidth,
      layout,
      exportedAt: new Date().toISOString()
    };
    
    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dieline-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [boxStyle, dimensions, unit, materialThickness, glueFlapWidth, layout]);
  
  // Normalize 3D dimensions
  const maxDim = Math.max(dimensions.length, dimensions.width, dimensions.height);
  const normalized3D = {
    length: dimensions.length / maxDim * 4,
    width: dimensions.width / maxDim * 4,
    height: dimensions.height / maxDim * 4,
  };
  
  return (
    <div className="dieline-studio-v2">
      {/* Top Toolbar */}
      <header className="dst-toolbar">
        <div className="dst-toolbar-left">
          <div className="dst-logo">
            <BoxIcon size={24} />
            <span>Dieline Editor</span>
          </div>
          <div className="dst-toolbar-divider" />
          {stateConfig.templateId && (
            <button className="dst-btn" onClick={() => navigate('/dieline')} title="Back to Gallery">
              <ArrowLeft size={18} />
              <span>Gallery</span>
            </button>
          )}
          <button className="dst-btn" title="New">
            <FileText size={18} />
            <span>New</span>
          </button>
          <button className="dst-btn" title="Open">
            <FolderOpen size={18} />
            <span>Open</span>
          </button>
          <button className="dst-btn" onClick={handleSave} title="Save">
            <Save size={18} />
            <span>Save</span>
          </button>
          <div className="dst-export-group">
            <button className="dst-btn" onClick={handleExportSVG} title="Export SVG">
              <Download size={18} />
              <span>Export SVG</span>
            </button>
            <button className="dst-btn" onClick={handleExportJSON} title="Export JSON">
              <Download size={18} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
        
        <div className="dst-toolbar-center">
          <div className="dst-view-switch">
            <button 
              className={viewMode === '2d' ? 'active' : ''} 
              onClick={() => setViewMode('2d')}
            >
              2D View
            </button>
            <button 
              className={viewMode === '3d' ? 'active' : ''} 
              onClick={() => setViewMode('3d')}
            >
              3D Preview
            </button>
          </div>
        </div>
        
        <div className="dst-toolbar-right">
          <button className="dst-btn-icon" title="Settings">
            <Settings size={18} />
          </button>
          <button className="dst-btn-icon dst-btn-user" title="Account">
            <User size={18} />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="dst-main">
        {/* Left Sidebar */}
        <aside className="dst-sidebar dst-sidebar-left">
          <section className="dst-section">
            <h3 className="dst-section-title">Box Style</h3>
            <select 
              className="dst-select"
              value={boxStyle}
              onChange={(e) => setBoxStyle(e.target.value)}
            >
              <option value="shipping-box">Shipping Box (RSC)</option>
              <option value="folding-carton">Folding Carton</option>
              <option value="mailer-box">Mailer Box</option>
              <option value="custom-box">Custom Rectangular Box</option>
            </select>
          </section>
          
          <section className="dst-section">
            <h3 className="dst-section-title">Dimensions</h3>
            <div className="dst-input-group">
              <label>Unit</label>
              <select 
                className="dst-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="in">inches</option>
              </select>
            </div>
            <div className="dst-input-group">
              <label>Length (L)</label>
              <input
                type="number"
                className="dst-input"
                value={dimensions.length}
                onChange={(e) => setDimensions({...dimensions, length: parseFloat(e.target.value) || 0})}
                min="1"
                step="1"
              />
            </div>
            <div className="dst-input-group">
              <label>Width (W)</label>
              <input
                type="number"
                className="dst-input"
                value={dimensions.width}
                onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value) || 0})}
                min="1"
                step="1"
              />
            </div>
            <div className="dst-input-group">
              <label>Height (H)</label>
              <input
                type="number"
                className="dst-input"
                value={dimensions.height}
                onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value) || 0})}
                min="1"
                step="1"
              />
            </div>
          </section>
          
          <section className="dst-section">
            <h3 className="dst-section-title">Material</h3>
            <div className="dst-input-group">
              <label>Material Thickness</label>
              <div className="dst-input-with-unit">
                <input
                  type="number"
                  className="dst-input"
                  value={materialThickness}
                  onChange={(e) => setMaterialThickness(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                />
                <span className="dst-unit">mm</span>
              </div>
            </div>
            <div className="dst-input-group">
              <label>Glue Flap Width</label>
              <div className="dst-input-with-unit">
                <input
                  type="number"
                  className="dst-input"
                  value={glueFlapWidth}
                  onChange={(e) => setGlueFlapWidth(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1"
                />
                <span className="dst-unit">mm</span>
              </div>
            </div>
          </section>
          
          <section className="dst-section">
            <h3 className="dst-section-title">Options</h3>
            <label className="dst-checkbox">
              <input
                type="checkbox"
                checked={showDimensions}
                onChange={(e) => setShowDimensions(e.target.checked)}
              />
              <span>Show Dimensions</span>
            </label>
            <label className="dst-checkbox">
              <input
                type="checkbox"
                checked={showFoldLines}
                onChange={(e) => setShowFoldLines(e.target.checked)}
              />
              <span>Show Fold Lines</span>
            </label>
            <label className="dst-checkbox">
              <input
                type="checkbox"
                checked={showCutLines}
                onChange={(e) => setShowCutLines(e.target.checked)}
              />
              <span>Show Cut Lines</span>
            </label>
            <label className="dst-checkbox">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              <span>Show Grid</span>
            </label>
          </section>
          
          <section className="dst-section">
            <button className="dst-btn-primary" onClick={updateDieline}>
              <RotateCcw size={16} />
              Update Dieline
            </button>
            <button className="dst-btn-secondary" onClick={() => {
              setDimensions({ length: 300, width: 200, height: 150 });
              setMaterialThickness(1.5);
              setGlueFlapWidth(30);
            }}>
              Reset
            </button>
          </section>
        </aside>
        
        {/* Center Canvas */}
        <div className="dst-canvas-wrapper">
          {viewMode === '2d' && (
            <>
              <div className="dst-canvas-toolbar">
                <div className="dst-canvas-toolbar-left">
                  <button 
                    className={`dst-btn-icon ${tool === 'select' ? 'active' : ''}`}
                    onClick={() => setTool('select')}
                    title="Select"
                  >
                    <Hand size={18} />
                  </button>
                  <button 
                    className={`dst-btn-icon ${tool === 'pan' ? 'active' : ''}`}
                    onClick={() => setTool('pan')}
                    title="Pan"
                  >
                    <Hand size={18} />
                  </button>
                  <div className="dst-toolbar-divider-small" />
                  <button className="dst-btn-icon" onClick={() => handleZoom(1.2)} title="Zoom In">
                    <ZoomIn size={18} />
                  </button>
                  <button className="dst-btn-icon" onClick={() => handleZoom(1/1.2)} title="Zoom Out">
                    <ZoomOut size={18} />
                  </button>
                  <button className="dst-btn-icon" onClick={fitToView} title="Fit to View">
                    <Maximize2 size={18} />
                  </button>
                  <div className="dst-toolbar-divider-small" />
                  <button 
                    className={`dst-btn-icon ${showGrid ? 'active' : ''}`}
                    onClick={() => setShowGrid(!showGrid)}
                    title="Grid"
                  >
                    <GridIcon size={18} />
                  </button>
                  <button 
                    className={`dst-btn-icon ${showDimensions ? 'active' : ''}`}
                    onClick={() => setShowDimensions(!showDimensions)}
                    title="Dimensions"
                  >
                    <Ruler size={18} />
                  </button>
                  <button 
                    className={`dst-btn-icon ${showFoldLines ? 'active' : ''}`}
                    onClick={() => setShowFoldLines(!showFoldLines)}
                    title="Fold Lines"
                  >
                    <Eye size={18} />
                  </button>
                </div>
                <div className="dst-canvas-toolbar-right">
                  <span className="dst-toolbar-info">
                    {Math.round(scale * 100)}% • {unit}
                  </span>
                </div>
              </div>
              
              <div ref={containerRef} className="dst-canvas-container">
                <canvas
                  ref={canvasRef}
                  className="dst-canvas"
                  style={{ cursor: tool === 'pan' ? 'grab' : 'default' }}
                />
              </div>
              
              {/* Panel View */}
              <div className="dst-panel-view">
                <div className="dst-panel-view-label">Panel View</div>
                <div className="dst-panel-thumbnails">
                  {panelList.map((panelId) => {
                    const panel = layout.panels[panelId];
                    return (
                      <button
                        key={panelId}
                        className={`dst-panel-thumb ${selectedPanel === panelId ? 'active' : ''}`}
                        onClick={() => setSelectedPanel(panelId)}
                        title={panel.name || panelId}
                      >
                        <div className="dst-panel-thumb-box">
                          <BoxIcon size={20} />
                        </div>
                        <span>{panel.name || panelId}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          
          {viewMode === '3d' && (
            <div className="dst-3d-container">
              <Canvas
                camera={{ position: [7, 6, 8], fov: 40, near: 0.01, far: 1000 }}
                shadows
              >
                <color attach="background" args={['#f7fafc']} />
                <ambientLight intensity={1.1} />
                <directionalLight position={[8, 12, 10]} intensity={2} castShadow />
                <directionalLight position={[-8, 6, -5]} intensity={0.7} />
                
                <group scale={[
                  normalized3D.length / 4,
                  normalized3D.height / 4,
                  normalized3D.width / 4,
                ]}>
                  <Box3D
                    dimensions={{ length: 4, width: (dimensions.width / dimensions.length) * 4, height: (dimensions.height / dimensions.length) * 4 }}
                    materialThickness={materialThickness / maxDim * 4}
                    selectedPanel={selectedPanel}
                    onPanelSelect={setSelectedPanel}
                  />
                </group>
                
                <gridHelper args={[12, 24, '#cbd5e0', '#e2e8f0']} position={[0, -0.1, 0]} />
                <OrbitControls makeDefault enablePan enableZoom enableRotate minDistance={2} maxDistance={30} target={[0, 1, 0]} />
              </Canvas>
            </div>
          )}
        </div>
        
        {/* Right Sidebar */}
        <aside className="dst-sidebar dst-sidebar-right">
          <section className="dst-section">
            <h3 className="dst-section-title">3D Preview</h3>
            <div className="dst-3d-preview-small">
              <Canvas
                camera={{ position: [7, 6, 8], fov: 40 }}
                shadows
              >
                <color attach="background" args={['#ffffff']} />
                <ambientLight intensity={1.1} />
                <directionalLight position={[8, 12, 10]} intensity={2} castShadow />
                
                <group scale={[
                  normalized3D.length / 4,
                  normalized3D.height / 4,
                  normalized3D.width / 4,
                ]}>
                  <Box3D
                    dimensions={{ length: 4, width: (dimensions.width / dimensions.length) * 4, height: (dimensions.height / dimensions.length) * 4 }}
                    materialThickness={materialThickness / maxDim * 4}
                    selectedPanel={selectedPanel}
                    onPanelSelect={setSelectedPanel}
                  />
                </group>
                
                <OrbitControls makeDefault enablePan enableZoom enableRotate minDistance={2} maxDistance={30} target={[0, 1, 0]} />
              </Canvas>
            </div>
            <div className="dst-3d-controls">
              <button className="dst-btn-icon" title="Reset Camera">
                <RotateCcw size={16} />
              </button>
              <button className="dst-btn-icon" title="Zoom In">
                <ZoomIn size={16} />
              </button>
              <button className="dst-btn-icon" title="Zoom Out">
                <ZoomOut size={16} />
              </button>
              <button className="dst-btn-icon" title="Fit">
                <Maximize2 size={16} />
              </button>
            </div>
          </section>
          
          <section className="dst-section">
            <h3 className="dst-section-title">Panel Details</h3>
            {selectedPanelData ? (
              <div className="dst-panel-details">
                <div className="dst-detail-row">
                  <span className="dst-detail-label">Name</span>
                  <span className="dst-detail-value">{selectedPanelData.name || selectedPanel}</span>
                </div>
                <div className="dst-detail-row">
                  <span className="dst-detail-label">Type</span>
                  <span className="dst-detail-value">{selectedPanelData.type}</span>
                </div>
                <div className="dst-detail-row">
                  <span className="dst-detail-label">Width</span>
                  <span className="dst-detail-value">{selectedPanelData.width.toFixed(1)} {unit}</span>
                </div>
                <div className="dst-detail-row">
                  <span className="dst-detail-label">Height</span>
                  <span className="dst-detail-value">{selectedPanelData.height.toFixed(1)} {unit}</span>
                </div>
                <div className="dst-detail-row">
                  <span className="dst-detail-label">Position</span>
                  <span className="dst-detail-value">
                    X: {selectedPanelData.x.toFixed(1)}, Y: {selectedPanelData.y.toFixed(1)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="dst-empty-state">No panel selected</p>
            )}
          </section>
          
          <section className="dst-section">
            <h3 className="dst-section-title">Material Info</h3>
            <div className="dst-material-info">
              <div className="dst-material-swatch"></div>
              <div className="dst-material-text">
                <div className="dst-material-name">Cardboard (E-Flute)</div>
                <div className="dst-material-thickness">{materialThickness} mm thickness</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
