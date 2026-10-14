/**
 * Dieline Geometry Utilities
 * Core geometry calculations for dieline generation
 * Supports multiple box styles with proper panel arrangements, fold lines, and cut lines
 */

// Unit conversion constants
export const UNITS = {
  mm: 1,
  cm: 10,
  in: 25.4
};

/**
 * Convert value from one unit to another
 */
export function convertUnit(value, fromUnit, toUnit) {
  const from = UNITS[fromUnit] || UNITS.mm;
  const to = UNITS[toUnit] || UNITS.mm;
  return (value * from) / to;
}

/**
 * Convert value to millimeters (base unit)
 */
export function toMM(value, unit) {
  return convertUnit(value, unit, 'mm');
}

/**
 * Convert from millimeters to target unit
 */
export function fromMM(value, unit) {
  return convertUnit(value, 'mm', unit);
}

/**
 * Validate dimensions are positive numbers
 */
export function validateDimensions(dimensions) {
  const errors = [];
  const { length, width, height } = dimensions;
  
  if (typeof length !== 'number' || length <= 0) {
    errors.push('Length must be a positive number');
  }
  if (typeof width !== 'number' || width <= 0) {
    errors.push('Width must be a positive number');
  }
  if (typeof height !== 'number' || height <= 0) {
    errors.push('Height must be a positive number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Box style definitions with geometry rules
 */
export const BOX_STYLES = {
  'shipping-box': {
    id: 'shipping-box',
    name: 'Shipping Box (RSC)',
    description: 'Regular Slotted Carton - Standard shipping box with four flaps',
    category: 'shipping',
    defaultDimensions: { length: 300, width: 200, height: 150, unit: 'mm' },
    minDimensions: { length: 50, width: 50, height: 20 },
    maxDimensions: { length: 2000, width: 1500, height: 1000 },
    supportsGlueFlap: true,
    defaultGlueFlapWidth: 30,
    panels: ['bottom', 'side1', 'top', 'side2', 'flap1', 'flap2', 'flap3', 'flap4', 'glue'],
    // Panel arrangement: bottom - side1 - top - side2 (vertical), flaps on top/bottom, glue on side
    layout: 'vertical'
  },
  'folding-carton': {
    id: 'folding-carton',
    name: 'Folding Carton',
    description: 'Folding carton with tuck flaps - Common for retail packaging',
    category: 'retail',
    defaultDimensions: { length: 120, width: 80, height: 40, unit: 'mm' },
    minDimensions: { length: 30, width: 20, height: 10 },
    maxDimensions: { length: 500, width: 400, height: 200 },
    supportsGlueFlap: true,
    defaultGlueFlapWidth: 20,
    panels: ['bottom', 'side1', 'top', 'side2', 'tuck-top', 'tuck-bottom', 'glue', 'dust-flap'],
    layout: 'vertical'
  },
  'mailer-box': {
    id: 'mailer-box',
    name: 'Mailer Box',
    description: 'Self-locking mailer box with dust flaps - E-commerce shipping',
    category: 'mailer',
    defaultDimensions: { length: 300, width: 200, height: 100, unit: 'mm' },
    minDimensions: { length: 100, width: 80, height: 30 },
    maxDimensions: { length: 600, width: 400, height: 300 },
    supportsGlueFlap: false,
    defaultGlueFlapWidth: 0,
    panels: ['bottom', 'side1', 'top', 'side2', 'lid', 'dust-flap1', 'dust-flap2', 'dust-flap3', 'dust-flap4'],
    layout: 'vertical'
  },
  'custom-box': {
    id: 'custom-box',
    name: 'Custom Rectangular Box',
    description: 'Fully customizable rectangular box with configurable flaps',
    category: 'custom',
    defaultDimensions: { length: 200, width: 150, height: 100, unit: 'mm' },
    minDimensions: { length: 20, width: 20, height: 10 },
    maxDimensions: { length: 3000, width: 2000, height: 1500 },
    supportsGlueFlap: true,
    defaultGlueFlapWidth: 25,
    panels: ['bottom', 'side1', 'top', 'side2', 'flap1', 'flap2', 'flap3', 'flap4', 'glue'],
    layout: 'vertical'
  }
};

/**
 * Get box style by ID
 */
export function getBoxStyle(styleId) {
  return BOX_STYLES[styleId] || BOX_STYLES['shipping-box'];
}

/**
 * Get all available box styles
 */
export function getAllBoxStyles() {
  return Object.values(BOX_STYLES);
}

/**
 * Calculate panel dimensions for a box style
 */
export function calculatePanelDimensions(dimensions, styleId, materialThickness = 0) {
  const style = getBoxStyle(styleId);
  const { length, width, height } = dimensions;
  const t = materialThickness;
  
  // Internal dimensions (accounting for material thickness)
  const internalLength = length - 2 * t;
  const internalWidth = width - 2 * t;
  const internalHeight = height - 2 * t;
  
  const panels = {};
  
  switch (styleId) {
    case 'shipping-box':
      panels.bottom = { width: internalLength, height: internalWidth, type: 'panel' };
      panels.side1 = { width: internalLength, height: internalHeight, type: 'panel' };
      panels.top = { width: internalLength, height: internalWidth, type: 'panel' };
      panels.side2 = { width: internalLength, height: internalHeight, type: 'panel' };
      panels.flap1 = { width: internalLength, height: internalWidth / 2, type: 'flap' };
      panels.flap2 = { width: internalLength, height: internalWidth / 2, type: 'flap' };
      panels.flap3 = { width: internalLength, height: internalWidth / 2, type: 'flap' };
      panels.flap4 = { width: internalLength, height: internalWidth / 2, type: 'flap' };
      panels.glue = { width: style.defaultGlueFlapWidth, height: internalHeight, type: 'glue' };
      break;
      
    case 'folding-carton':
      panels.bottom = { width: internalLength, height: internalWidth, type: 'panel' };
      panels.side1 = { width: internalLength, height: internalHeight, type: 'panel' };
      panels.top = { width: internalLength, height: internalWidth, type: 'panel' };
      panels.side2 = { width: internalLength, height: internalHeight, type: 'panel' };
      panels['tuck-top'] = { width: internalLength, height: internalWidth * 0.6, type: 'tuck' };
      panels['tuck-bottom'] = { width: internalLength, height: internalWidth * 0.4, type: 'tuck' };
      panels.glue = { width: style.defaultGlueFlapWidth, height: internalHeight, type: 'glue' };
      panels['dust-flap'] = { width: internalLength, height: 15, type: 'dust' };
      break;
      
    case 'mailer-box':
      panels.bottom = { width: internalLength, height: internalWidth, type: 'panel' };
      panels.side1 = { width: internalLength, height: internalHeight, type: 'panel' };
      panels.top = { width: internalLength, height: internalWidth, type: 'panel' };
      panels.side2 = { width: internalLength, height: internalHeight, type: 'panel' };
      panels.lid = { width: internalLength + 2 * t, height: internalWidth + 2 * t, type: 'lid' };
      panels['dust-flap1'] = { width: internalLength, height: 20, type: 'dust' };
      panels['dust-flap2'] = { width: internalLength, height: 20, type: 'dust' };
      panels['dust-flap3'] = { width: internalWidth, height: 20, type: 'dust' };
      panels['dust-flap4'] = { width: internalWidth, height: 20, type: 'dust' };
      break;
      
    case 'custom-box':
      panels.bottom = { width: internalLength, height: internalWidth, type: 'panel' };
      panels.side1 = { width: internalLength, height: internalHeight, type: 'panel' };
      panels.top = { width: internalLength, height: internalWidth, type: 'panel' };
      panels.side2 = { width: internalLength, height: internalHeight, type: 'panel' };
      panels.flap1 = { width: internalLength, height: internalWidth / 2, type: 'flap' };
      panels.flap2 = { width: internalLength, height: internalWidth / 2, type: 'flap' };
      panels.flap3 = { width: internalLength, height: internalWidth / 2, type: 'flap' };
      panels.flap4 = { width: internalLength, height: internalWidth / 2, type: 'flap' };
      panels.glue = { width: style.defaultGlueFlapWidth, height: internalHeight, type: 'glue' };
      break;
  }
  
  return panels;
}

/**
 * Generate 2D dieline layout for a box style
 * Returns panel positions, fold lines, and cut lines for rendering
 */
export function generateDielineLayout(dimensions, styleId, materialThickness = 0) {
  const style = getBoxStyle(styleId);
  const panels = calculatePanelDimensions(dimensions, styleId, materialThickness);
  const { length, width, height } = dimensions;
  const t = materialThickness;
  
  const panelPositions = {};
  const foldLines = [];
  const cutLines = [];
  
  // Horizontal strip layout for shipping-box, folding-carton, mailer-box, custom-box
  // Layout: horizontal row of 4 body panels with flaps above and below
  if (['shipping-box', 'custom-box'].includes(styleId)) {
    // Horizontal strip: front (L×H), side1 (W×H), back (L×H), side2 (W×H)
    const L = panels.bottom.width;  // length
    const W = panels.bottom.height; // width
    const H = panels.side1.height;  // height
    const flapHeight = W / 2;
    
    let currentX = 0;
    
    // Front panel (bottom in original naming, but front in horizontal layout)
    panelPositions.bottom = {
      x: currentX,
      y: flapHeight,
      width: L,
      height: H,
      type: 'panel'
    };
    currentX += L;
    
    // Vertical fold line after front panel
    foldLines.push({
      x: currentX,
      y: flapHeight,
      width: 0,
      height: H,
      type: 'fold'
    });
    
    // Side1 panel
    panelPositions.side1 = {
      x: currentX,
      y: flapHeight,
      width: W,
      height: H,
      type: 'panel'
    };
    currentX += W;
    
    // Vertical fold line after side1
    foldLines.push({
      x: currentX,
      y: flapHeight,
      width: 0,
      height: H,
      type: 'fold'
    });
    
    // Back panel (top in original naming)
    panelPositions.top = {
      x: currentX,
      y: flapHeight,
      width: L,
      height: H,
      type: 'panel'
    };
    currentX += L;
    
    // Vertical fold line after back
    foldLines.push({
      x: currentX,
      y: flapHeight,
      width: 0,
      height: H,
      type: 'fold'
    });
    
    // Side2 panel
    panelPositions.side2 = {
      x: currentX,
      y: flapHeight,
      width: W,
      height: H,
      type: 'panel'
    };
    currentX += W;
    
    // Glue flap on the right
    if (style.supportsGlueFlap && panels.glue) {
      foldLines.push({
        x: currentX,
        y: flapHeight,
        width: 0,
        height: H,
        type: 'fold'
      });
      
      panelPositions.glue = {
        x: currentX,
        y: flapHeight,
        width: panels.glue.width,
        height: H,
        type: 'glue'
      };
      currentX += panels.glue.width;
    }
    
    const stripWidth = currentX;
    
    // Top flaps (major flaps on front/back, minor flaps on sides)
    // Flap1 - top of front panel
    panelPositions.flap1 = {
      x: 0,
      y: 0,
      width: L,
      height: flapHeight,
      type: 'flap'
    };
    
    // Horizontal fold line between flap1 and front
    foldLines.push({
      x: 0,
      y: flapHeight,
      width: L,
      height: 0,
      type: 'fold'
    });
    
    // Flap2 - top of back panel (positioned above back panel)
    panelPositions.flap2 = {
      x: L + W,
      y: 0,
      width: L,
      height: flapHeight,
      type: 'flap'
    };
    
    // Horizontal fold line between flap2 and back
    foldLines.push({
      x: L + W,
      y: flapHeight,
      width: L,
      height: 0,
      type: 'fold'
    });
    
    // Bottom flaps
    // Flap3 - bottom of front panel
    panelPositions.flap3 = {
      x: 0,
      y: flapHeight + H,
      width: L,
      height: flapHeight,
      type: 'flap'
    };
    
    // Horizontal fold line between front and flap3
    foldLines.push({
      x: 0,
      y: flapHeight + H,
      width: L,
      height: 0,
      type: 'fold'
    });
    
    // Flap4 - bottom of back panel
    panelPositions.flap4 = {
      x: L + W,
      y: flapHeight + H,
      width: L,
      height: flapHeight,
      type: 'flap'
    };
    
    // Horizontal fold line between back and flap4
    foldLines.push({
      x: L + W,
      y: flapHeight + H,
      width: L,
      height: 0,
      type: 'fold'
    });
    
    // Generate actual perimeter cut lines
    // The net has a cross/T shape with flaps extending above and below the main strip
    const netHeight = flapHeight + H + flapHeight;
    
    // Top edge of left flap
    cutLines.push({ x1: 0, y1: 0, x2: L, y2: 0, type: 'cut' });
    // Right edge of left top flap
    cutLines.push({ x1: L, y1: 0, x2: L, y2: flapHeight, type: 'cut' });
    // Top edge between left and right flaps
    cutLines.push({ x1: L, y1: flapHeight, x2: L + W, y2: flapHeight, type: 'cut' });
    // Top edge of right flap
    cutLines.push({ x1: L + W, y1: 0, x2: L + W + L, y2: 0, type: 'cut' });
    // Right edge of right top flap
    cutLines.push({ x1: L + W + L, y1: 0, x2: L + W + L, y2: flapHeight, type: 'cut' });
    // Top right to far right
    cutLines.push({ x1: L + W + L, y1: flapHeight, x2: stripWidth, y2: flapHeight, type: 'cut' });
    // Right edge of strip
    cutLines.push({ x1: stripWidth, y1: flapHeight, x2: stripWidth, y2: flapHeight + H, type: 'cut' });
    // Bottom right corner
    cutLines.push({ x1: stripWidth, y1: flapHeight + H, x2: L + W + L, y2: flapHeight + H, type: 'cut' });
    // Right edge of right bottom flap
    cutLines.push({ x1: L + W + L, y1: flapHeight + H, x2: L + W + L, y2: netHeight, type: 'cut' });
    // Bottom edge of right flap
    cutLines.push({ x1: L + W + L, y1: netHeight, x2: L + W, y2: netHeight, type: 'cut' });
    // Bottom edge between flaps
    cutLines.push({ x1: L + W, y1: flapHeight + H, x2: L, y2: flapHeight + H, type: 'cut' });
    // Bottom edge of left flap
    cutLines.push({ x1: L, y1: netHeight, x2: 0, y2: netHeight, type: 'cut' });
    // Left edge of left bottom flap
    cutLines.push({ x1: 0, y1: netHeight, x2: 0, y2: flapHeight + H, type: 'cut' });
    // Left edge of strip
    cutLines.push({ x1: 0, y1: flapHeight + H, x2: 0, y2: 0, type: 'cut' });
    
    return {
      panels: panelPositions,
      foldLines,
      cutLines,
      totalWidth: stripWidth,
      totalHeight: netHeight,
      style
    };
  } else if (styleId === 'folding-carton') {
    // Similar horizontal layout with tuck flaps instead of straight flaps
    const L = panels.bottom.width;
    const W = panels.bottom.height;
    const H = panels.side1.height;
    const tuckTopHeight = panels['tuck-top'].height;
    const tuckBottomHeight = panels['tuck-bottom'].height;
    
    let currentX = 0;
    
    // Front panel
    panelPositions.bottom = {
      x: currentX,
      y: tuckTopHeight,
      width: L,
      height: H,
      type: 'panel'
    };
    currentX += L;
    
    foldLines.push({
      x: currentX,
      y: tuckTopHeight,
      width: 0,
      height: H,
      type: 'fold'
    });
    
    // Side1
    panelPositions.side1 = {
      x: currentX,
      y: tuckTopHeight,
      width: W,
      height: H,
      type: 'panel'
    };
    currentX += W;
    
    foldLines.push({
      x: currentX,
      y: tuckTopHeight,
      width: 0,
      height: H,
      type: 'fold'
    });
    
    // Back
    panelPositions.top = {
      x: currentX,
      y: tuckTopHeight,
      width: L,
      height: H,
      type: 'panel'
    };
    currentX += L;
    
    foldLines.push({
      x: currentX,
      y: tuckTopHeight,
      width: 0,
      height: H,
      type: 'fold'
    });
    
    // Side2
    panelPositions.side2 = {
      x: currentX,
      y: tuckTopHeight,
      width: W,
      height: H,
      type: 'panel'
    };
    currentX += W;
    
    // Glue flap
    if (panels.glue) {
      foldLines.push({
        x: currentX,
        y: tuckTopHeight,
        width: 0,
        height: H,
        type: 'fold'
      });
      
      panelPositions.glue = {
        x: currentX,
        y: tuckTopHeight,
        width: panels.glue.width,
        height: H,
        type: 'glue'
      };
      currentX += panels.glue.width;
    }
    
    const stripWidth = currentX;
    
    // Top tuck flap
    panelPositions['tuck-top'] = {
      x: 0,
      y: 0,
      width: L,
      height: tuckTopHeight,
      type: 'tuck'
    };
    
    foldLines.push({
      x: 0,
      y: tuckTopHeight,
      width: L,
      height: 0,
      type: 'fold'
    });
    
    // Bottom tuck flap
    panelPositions['tuck-bottom'] = {
      x: 0,
      y: tuckTopHeight + H,
      width: L,
      height: tuckBottomHeight,
      type: 'tuck'
    };
    
    foldLines.push({
      x: 0,
      y: tuckTopHeight + H,
      width: L,
      height: 0,
      type: 'fold'
    });
    
    // Dust flap
    if (panels['dust-flap']) {
      panelPositions['dust-flap'] = {
        x: L + W,
        y: 0,
        width: L,
        height: panels['dust-flap'].height,
        type: 'dust'
      };
      
      foldLines.push({
        x: L + W,
        y: panels['dust-flap'].height,
        width: L,
        height: 0,
        type: 'fold'
      });
    }
    
    const netHeight = tuckTopHeight + H + tuckBottomHeight;
    
    // Generate perimeter cut lines (simplified rectangular for now)
    cutLines.push({ x1: 0, y1: 0, x2: stripWidth, y2: 0, type: 'cut' });
    cutLines.push({ x1: stripWidth, y1: 0, x2: stripWidth, y2: netHeight, type: 'cut' });
    cutLines.push({ x1: stripWidth, y1: netHeight, x2: 0, y2: netHeight, type: 'cut' });
    cutLines.push({ x1: 0, y1: netHeight, x2: 0, y2: 0, type: 'cut' });
    
    return {
      panels: panelPositions,
      foldLines,
      cutLines,
      totalWidth: stripWidth,
      totalHeight: netHeight,
      style
    };
  } else if (styleId === 'mailer-box') {
    // Horizontal layout with lid attached to one side
    const L = panels.bottom.width;
    const W = panels.bottom.height;
    const H = panels.side1.height;
    
    let currentX = 0;
    
    // Front
    panelPositions.bottom = {
      x: currentX,
      y: W,
      width: L,
      height: H,
      type: 'panel'
    };
    currentX += L;
    
    foldLines.push({
      x: currentX,
      y: W,
      width: 0,
      height: H,
      type: 'fold'
    });
    
    // Side1
    panelPositions.side1 = {
      x: currentX,
      y: W,
      width: W,
      height: H,
      type: 'panel'
    };
    currentX += W;
    
    foldLines.push({
      x: currentX,
      y: W,
      width: 0,
      height: H,
      type: 'fold'
    });
    
    // Back
    panelPositions.top = {
      x: currentX,
      y: W,
      width: L,
      height: H,
      type: 'panel'
    };
    currentX += L;
    
    foldLines.push({
      x: currentX,
      y: W,
      width: 0,
      height: H,
      type: 'fold'
    });
    
    // Side2
    panelPositions.side2 = {
      x: currentX,
      y: W,
      width: W,
      height: H,
      type: 'panel'
    };
    currentX += W;
    
    const stripWidth = currentX;
    
    // Lid attached to top of front panel
    panelPositions.lid = {
      x: 0,
      y: 0,
      width: panels.lid.width,
      height: W,
      type: 'lid'
    };
    
    foldLines.push({
      x: 0,
      y: W,
      width: L,
      height: 0,
      type: 'fold'
    });
    
    // Dust flaps (simplified positioning)
    if (panels['dust-flap1']) {
      panelPositions['dust-flap1'] = {
        x: 0,
        y: W + H,
        width: L,
        height: panels['dust-flap1'].height,
        type: 'dust'
      };
      
      foldLines.push({
        x: 0,
        y: W + H,
        width: L,
        height: 0,
        type: 'fold'
      });
    }
    
    const netHeight = W + H + (panels['dust-flap1']?.height || 0);
    
    // Perimeter cut lines
    cutLines.push({ x1: 0, y1: 0, x2: stripWidth, y2: 0, type: 'cut' });
    cutLines.push({ x1: stripWidth, y1: 0, x2: stripWidth, y2: netHeight, type: 'cut' });
    cutLines.push({ x1: stripWidth, y1: netHeight, x2: 0, y2: netHeight, type: 'cut' });
    cutLines.push({ x1: 0, y1: netHeight, x2: 0, y2: 0, type: 'cut' });
    
    return {
      panels: panelPositions,
      foldLines,
      cutLines,
      totalWidth: stripWidth,
      totalHeight: netHeight,
      style
    };
  }
  
  // Fallback to vertical layout for unsupported styles
  let currentY = 0;
  const panelOrder = style.panels.filter(p => panels[p]);
  
  panelOrder.forEach((panelId, index) => {
    const panel = panels[panelId];
    if (!panel) return;
    
    panelPositions[panelId] = {
      x: 0,
      y: currentY,
      width: panel.width,
      height: panel.height,
      type: panel.type
    };
    
    if (index > 0 && panel.type !== 'glue') {
      foldLines.push({
        x: 0,
        y: currentY,
        width: panel.width,
        height: 0,
        type: 'fold'
      });
    }
    
    currentY += panel.height;
  });
  
  const totalWidth = Math.max(...Object.values(panelPositions).map(p => p.x + p.width));
  const totalHeight = currentY;
  
  cutLines.push({ x1: 0, y1: 0, x2: totalWidth, y2: 0, type: 'cut' });
  cutLines.push({ x1: totalWidth, y1: 0, x2: totalWidth, y2: totalHeight, type: 'cut' });
  cutLines.push({ x1: totalWidth, y1: totalHeight, x2: 0, y2: totalHeight, type: 'cut' });
  cutLines.push({ x1: 0, y1: totalHeight, x2: 0, y2: 0, type: 'cut' });
  
  return {
    panels: panelPositions,
    foldLines,
    cutLines,
    totalWidth,
    totalHeight,
    style
  };
}

/**
 * Generate 3D box geometry from dieline layout
 */
export function generate3DGeometry(layout, dimensions, materialThickness = 0) {
  const { panels } = layout;
  const { length, width, height } = dimensions;
  const t = materialThickness;
  
  // Create 3D mesh data for each panel
  const meshes = [];
  
  Object.entries(panels).forEach(([panelId, panel]) => {
    if (panel.type === 'glue') return; // Skip glue flap in 3D
    
    const isHorizontal = ['bottom', 'top', 'lid'].includes(panelId);
    const isVertical = ['side1', 'side2'].includes(panelId);
    const isFlap = panelId.startsWith('flap') || panelId.startsWith('tuck') || panelId.startsWith('dust');
    
    let position = [0, 0, 0];
    let rotation = [0, 0, 0];
    let scale = [1, 1, 1];
    
    if (isHorizontal) {
      // Horizontal panels (bottom, top, lid)
      position[1] = isHorizontal && panelId === 'top' ? height - t : 0;
      if (panelId === 'lid') position[1] = height;
    } else if (isVertical) {
      // Vertical side panels
      rotation[1] = panelId === 'side1' ? Math.PI / 2 : -Math.PI / 2;
      position[0] = panelId === 'side1' ? 0 : length;
      position[1] = height / 2;
    } else if (isFlap) {
      // Flaps are positioned relative to their parent panel
      // This is simplified - actual implementation would be more complex
    }
    
    meshes.push({
      id: panelId,
      type: panel.type,
      width: panel.width,
      height: panel.height,
      position,
      rotation,
      scale
    });
  });
  
  return meshes;
}

/**
 * Validate a complete dieline configuration
 */
export function validateDielineConfig(config) {
  const errors = [];
  
  if (!config.dimensions) {
    errors.push('Dimensions are required');
    return { valid: false, errors };
  }
  
  const dimValidation = validateDimensions(config.dimensions);
  if (!dimValidation.valid) {
    errors.push(...dimValidation.errors);
  }
  
  if (!config.styleId || !BOX_STYLES[config.styleId]) {
    errors.push('Valid box style is required');
  }
  
  if (config.materialThickness !== undefined) {
    if (typeof config.materialThickness !== 'number' || config.materialThickness < 0) {
      errors.push('Material thickness must be a non-negative number');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}