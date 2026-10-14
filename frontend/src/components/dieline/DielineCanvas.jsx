import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Ruler,
  Eye,
  EyeOff,
} from 'lucide-react';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minHeight: 320,
    overflow: 'hidden',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    color: '#0f172a',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    padding: '10px 12px',
    borderBottom: '1px solid #e2e8f0',
    background: '#ffffff',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 34,
    height: 34,
    padding: '0 9px',
    border: '1px solid #cbd5e1',
    borderRadius: 7,
    background: '#ffffff',
    color: '#334155',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  activeButton: {
    background: '#eff6ff',
    borderColor: '#93c5fd',
    color: '#1d4ed8',
  },
  separator: {
    width: 1,
    height: 24,
    margin: '0 4px',
    background: '#e2e8f0',
  },
  status: {
    marginLeft: 'auto',
    color: '#64748b',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  drawingArea: {
    position: 'relative',
    flex: 1,
    minHeight: 240,
    overflow: 'hidden',
    background: '#f8fafc',
    cursor: 'default',
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: '100%',
    touchAction: 'none',
  },
  hint: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    padding: '5px 8px',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.9)',
    color: '#64748b',
    fontSize: 11,
    pointerEvents: 'none',
  },
  empty: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    color: '#64748b',
    textAlign: 'center',
    fontSize: 14,
  },
};

const validNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value);

function getPanelBounds(panels) {
  const entries = Object.values(panels || {}).filter(
    (p) =>
      p &&
      validNumber(p.x) &&
      validNumber(p.y) &&
      validNumber(p.width) &&
      validNumber(p.height) &&
      p.width >= 0 &&
      p.height >= 0
  );

  if (!entries.length) return null;

  const minX = Math.min(...entries.map((p) => p.x));
  const minY = Math.min(...entries.map((p) => p.y));
  const maxX = Math.max(...entries.map((p) => p.x + p.width));
  const maxY = Math.max(...entries.map((p) => p.y + p.height));

  if (!(maxX > minX) || !(maxY > minY)) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export default function DielineCanvas({
  layout,
  dimensions,
  unit = 'mm',
  materialThickness = 0,
  onPanelSelect,
  selectedPanel = null,
  onLayoutChange,
  className,
  style,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const viewRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
  const sizeRef = useRef({ width: 0, height: 0 });
  const rafRef = useRef(null);

  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showFoldLines, setShowFoldLines] = useState(true);
  const [hasFitted, setHasFitted] = useState(false);

  const panels = layout?.panels ?? {};
  const panelEntries = useMemo(
    () =>
      Object.entries(panels).filter(
        ([, p]) =>
          p &&
          validNumber(p.x) &&
          validNumber(p.y) &&
          validNumber(p.width) &&
          validNumber(p.height) &&
          p.width >= 0 &&
          p.height >= 0
      ),
    [panels]
  );
  const bounds = useMemo(() => getPanelBounds(panels), [panels]);

  const requestDraw = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = sizeRef.current;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      const view = viewRef.current;
      const s = view.scale;
      const ox = view.offsetX;
      const oy = view.offsetY;

      // Grid stays aligned to the drawing's world coordinates.
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

      if (!panelEntries.length || !bounds) {
        ctx.fillStyle = '#64748b';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No dieline layout to display', width / 2, height / 2);
        return;
      }

      const px = (x) => ox + x * s;
      const py = (y) => oy + y * s;

      // Draw panel fills and borders.
      panelEntries.forEach(([id, panel]) => {
        const x = px(panel.x);
        const y = py(panel.y);
        const w = panel.width * s;
        const h = panel.height * s;
        const selected = id === selectedPanel;

        const fillByType = {
          panel: '#ffffff',
          flap: '#f1f5f9',
          tuck: '#eff6ff',
          dust: '#f8fafc',
          lid: '#fefce8',
          glue: '#fff7ed',
        };
        ctx.fillStyle = selected ? '#dbeafe' : (fillByType[panel.type] || '#ffffff');
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = selected ? '#2563eb' : '#334155';
        ctx.lineWidth = selected ? 2.2 : 1.4;
        ctx.strokeRect(x, y, w, h);

        if (showDimensions && s >= 0.22 && w >= 38 && h >= 24) {
          ctx.fillStyle = '#334155';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const fontSize = Math.max(9, Math.min(13, 11 * Math.min(s + 0.3, 1.2)));
          ctx.font = `${fontSize}px sans-serif`;
          const label = `${panel.width.toFixed(1)} × ${panel.height.toFixed(1)} ${unit}`;
          ctx.fillText(label, x + w / 2, y + h / 2, Math.max(0, w - 8));
          if (h >= 42) {
            ctx.fillStyle = '#64748b';
            ctx.font = `${Math.max(9, fontSize - 1)}px sans-serif`;
            ctx.fillText(id, x + w / 2, y + h / 2 + fontSize + 3, Math.max(0, w - 8));
          }
        } else if (s >= 0.3 && w >= 45 && h >= 25) {
          ctx.fillStyle = '#334155';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(id, x + w / 2, y + h / 2, Math.max(0, w - 8));
        }
      });

      // Draw fold lines on top of panels (blue dashed).
      if (showFoldLines && Array.isArray(layout?.foldLines)) {
        ctx.save();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        layout.foldLines.forEach((line) => {
          if (!line || !validNumber(line.x) || !validNumber(line.y)) return;
          const x = px(line.x);
          const y = py(line.y);
          const w = validNumber(line.width) ? line.width * s : 0;
          const h = validNumber(line.height) ? line.height * s : 0;
          ctx.moveTo(x, y);
          ctx.lineTo(x + w, y + h);
        });
        ctx.stroke();
        ctx.restore();
      }
      
      // Draw cut lines (red solid perimeter).
      if (Array.isArray(layout?.cutLines)) {
        ctx.save();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([]);
        ctx.beginPath();
        layout.cutLines.forEach((line) => {
          if (!line) return;
          // Support both {x1, y1, x2, y2} and {x, y, width, height} formats
          if (validNumber(line.x1) && validNumber(line.y1) && validNumber(line.x2) && validNumber(line.y2)) {
            ctx.moveTo(px(line.x1), py(line.y1));
            ctx.lineTo(px(line.x2), py(line.y2));
          } else if (validNumber(line.x) && validNumber(line.y) && validNumber(line.width) && validNumber(line.height)) {
            // Legacy format: treat as bounding rect
            const x = px(line.x);
            const y = py(line.y);
            const w = line.width * s;
            const h = line.height * s;
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x, y + h);
            ctx.closePath();
          }
        });
        ctx.stroke();
        ctx.restore();
      }

      // Dimension bounds around the complete net.
      if (showDimensions) {
        ctx.save();
        ctx.strokeStyle = '#94a3b8';
        ctx.fillStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(px(bounds.minX), py(bounds.minY), bounds.width * s, bounds.height * s);
        ctx.setLineDash([]);
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(
          `${bounds.width.toFixed(1)} × ${bounds.height.toFixed(1)} ${unit}`,
          px(bounds.minX + bounds.width / 2),
          py(bounds.minY) - 5
        );
        ctx.restore();
      }
    });
  }, [
    panelEntries,
    bounds,
    selectedPanel,
    showGrid,
    showDimensions,
    showFoldLines,
    layout,
    unit,
  ]);

  const fitToView = useCallback(() => {
    const { width, height } = sizeRef.current;
    if (!bounds || width <= 0 || height <= 0) return;

    const padding = 48;
    const usableWidth = Math.max(1, width - padding * 2);
    const usableHeight = Math.max(1, height - padding * 2);
    const nextScale = Math.min(
      usableWidth / bounds.width,
      usableHeight / bounds.height,
      3
    );
    const safeScale = Math.max(0.02, Math.min(nextScale, 8));

    viewRef.current = {
      scale: safeScale,
      offsetX: (width - bounds.width * safeScale) / 2 - bounds.minX * safeScale,
      offsetY: (height - bounds.height * safeScale) / 2 - bounds.minY * safeScale,
    };
    setScale(safeScale);
    setHasFitted(true);
    requestDraw();
  }, [bounds, requestDraw]);

  const zoomAt = useCallback((factor, x, y) => {
    const view = viewRef.current;
    const nextScale = Math.max(0.02, Math.min(8, view.scale * factor));
    const ratio = nextScale / view.scale;
    viewRef.current = {
      scale: nextScale,
      offsetX: x - (x - view.offsetX) * ratio,
      offsetY: y - (y - view.offsetY) * ratio,
    };
    setScale(nextScale);
    requestDraw();
  }, [requestDraw]);

  const handleZoom = useCallback((factor) => {
    const { width, height } = sizeRef.current;
    zoomAt(factor, width / 2, height / 2);
  }, [zoomAt]);

  // Measure the drawing area and scale the canvas for high-DPI displays.
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
      setViewport({ width, height });
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (!hasFitted && bounds) {
        // Fit after the first real measurement.
        const padding = 48;
        const nextScale = Math.min(
          (width - padding * 2) / bounds.width,
          (height - padding * 2) / bounds.height,
          3
        );
        const safeScale = Math.max(0.02, Math.min(nextScale, 8));
        viewRef.current = {
          scale: safeScale,
          offsetX: (width - bounds.width * safeScale) / 2 - bounds.minX * safeScale,
          offsetY: (height - bounds.height * safeScale) / 2 - bounds.minY * safeScale,
        };
        setScale(safeScale);
        setHasFitted(true);
      }
      requestDraw();
    };

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resize)
      : null;
    if (observer) observer.observe(container);
    resize();

    return () => observer?.disconnect();
  }, [bounds, hasFitted, requestDraw]);

  // Redraw when the visible state or layout changes.
  useEffect(() => {
    requestDraw();
  }, [requestDraw, viewport]);

  // Native non-passive wheel handler allows reliable trackpad/mouse-wheel zoom.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const onWheel = (event) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * 0.0015);
      zoomAt(factor, event.clientX - rect.left, event.clientY - rect.top);
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const eventToCanvas = (event) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event) => {
    const panGesture = event.button === 1 || (event.button === 0 && event.shiftKey);
    if (!panGesture) return;

    event.preventDefault();
    const point = eventToCanvas(event);
    dragRef.current = {
      startX: point.x,
      startY: point.y,
      offsetX: viewRef.current.offsetX,
      offsetY: viewRef.current.offsetY,
      moved: false,
    };
    event.currentTarget.style.cursor = 'grabbing';
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    const point = eventToCanvas(event);
    const dx = point.x - dragRef.current.startX;
    const dy = point.y - dragRef.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 2) dragRef.current.moved = true;

    viewRef.current = {
      ...viewRef.current,
      offsetX: dragRef.current.offsetX + dx,
      offsetY: dragRef.current.offsetY + dy,
    };
    requestDraw();
  };

  const finishPan = (event) => {
    if (dragRef.current?.moved) {
      suppressClickRef.current = true;
      requestAnimationFrame(() => {
        suppressClickRef.current = false;
      });
    }
    dragRef.current = null;
    if (event?.currentTarget) event.currentTarget.style.cursor = 'default';
  };

  const handleClick = (event) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    const point = eventToCanvas(event);
    const worldX = (point.x - viewRef.current.offsetX) / viewRef.current.scale;
    const worldY = (point.y - viewRef.current.offsetY) / viewRef.current.scale;

    // Reverse order means the visually topmost panel wins in overlapping areas.
    for (let i = panelEntries.length - 1; i >= 0; i -= 1) {
      const [id, p] = panelEntries[i];
      if (
        worldX >= p.x &&
        worldX <= p.x + p.width &&
        worldY >= p.y &&
        worldY <= p.y + p.height
      ) {
        onPanelSelect?.(id, p);
        return;
      }
    }
    onPanelSelect?.(null, null);
  };

  const buttonStyle = (active = false) => ({
    ...styles.button,
    ...(active ? styles.activeButton : {}),
  });

  if (!layout || !layout.panels || panelEntries.length === 0) {
    return (
      <div className={className} style={{ ...styles.root, ...style }}>
        <div style={styles.toolbar}>
          <strong style={{ fontSize: 13 }}>2D Dieline</strong>
          <span style={styles.status}>Waiting for layout</span>
        </div>
        <div style={styles.empty}>
          Enter valid box dimensions and select a box style to generate the dieline.
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ ...styles.root, ...style }}>
      <div style={styles.toolbar}>
        <strong style={{ fontSize: 13, marginRight: 4 }}>2D Dieline</strong>

        <button type="button" style={buttonStyle()} onClick={() => handleZoom(1.2)} title="Zoom in" aria-label="Zoom in">
          <ZoomIn size={16} />
        </button>
        <button type="button" style={buttonStyle()} onClick={() => handleZoom(1 / 1.2)} title="Zoom out" aria-label="Zoom out">
          <ZoomOut size={16} />
        </button>
        <button type="button" style={buttonStyle()} onClick={fitToView} title="Fit to view" aria-label="Fit to view">
          <Maximize2 size={16} />
        </button>

        <span style={styles.separator} />

        <button type="button" style={buttonStyle(showGrid)} onClick={() => setShowGrid((v) => !v)} title="Toggle grid" aria-label="Toggle grid">
          <Grid size={16} />
          <span>Grid</span>
        </button>
        <button type="button" style={buttonStyle(showDimensions)} onClick={() => setShowDimensions((v) => !v)} title="Toggle dimensions" aria-label="Toggle dimensions">
          <Ruler size={16} />
          <span>Dims</span>
        </button>
        <button type="button" style={buttonStyle(showFoldLines)} onClick={() => setShowFoldLines((v) => !v)} title="Toggle fold lines" aria-label="Toggle fold lines">
          {showFoldLines ? <Eye size={16} /> : <EyeOff size={16} />}
          <span>Folds</span>
        </button>

        <span style={styles.status}>{Math.round(scale * 100)}% · {unit}</span>
      </div>

      <div ref={containerRef} style={styles.drawingArea}>
        <canvas
          ref={canvasRef}
          style={styles.canvas}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPan}
          onPointerCancel={finishPan}
          onClick={handleClick}
          onContextMenu={(event) => event.preventDefault()}
          aria-label="Interactive 2D dieline canvas"
          role="img"
        />
        <div style={styles.hint}>Shift + drag or middle mouse to pan · Scroll to zoom · Click a panel to select</div>
      </div>
    </div>
  );
}
