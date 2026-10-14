import { useState } from 'react';
import { 
  Box, Ruler, Droplet, 
  Minus, Plus, 
  ChevronDown, ChevronUp,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { getBoxStyle, getAllBoxStyles, validateDimensions } from '../../utils/dielineGeometry';

const UNITS = ['mm', 'cm', 'in'];
const UNIT_LABELS = { mm: 'Millimeters', cm: 'Centimeters', in: 'Inches' };

export default function DielineProperties({
  dimensions,
  styleId,
  materialThickness,
  glueFlapWidth,
  unit,
  onDimensionsChange,
  onStyleChange,
  onMaterialThicknessChange,
  onGlueFlapWidthChange,
  onUnitChange,
  validationErrors = []
}) {
  const [expandedSections, setExpandedSections] = useState({
    dimensions: true,
    style: true,
    material: true,
    advanced: false
  });

  const boxStyles = getAllBoxStyles();
  const currentStyle = getBoxStyle(styleId);
  
  const handleDimensionChange = (key, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const newDimensions = { ...dimensions, [key]: numValue };
    const validation = validateDimensions(newDimensions);
    
    if (validation.valid) {
      onDimensionsChange?.(newDimensions);
    }
  };

  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;
    
    // Convert dimensions to new unit
    const converted = {};
    Object.entries(dimensions).forEach(([key, value]) => {
      if (key !== 'unit') {
        converted[key] = parseFloat((value * (UNIT_CONVERSION[unit] / UNIT_CONVERSION[newUnit])).toFixed(2));
      }
    });
    converted.unit = newUnit;
    
    onUnitChange?.(converted);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const UNIT_CONVERSION = {
    mm: 1,
    cm: 10,
    in: 25.4
  };

  return (
    <div className="dieline-properties">
      <div className="properties-header">
        <h3>Properties</h3>
      </div>
      
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <div key={index} className="validation-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="properties-content">
        {/* Dimensions Section */}
        <div className="properties-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('dimensions')}
            type="button"
          >
            <Ruler size={16} />
            <span>Dimensions</span>
            <span className="section-chevron">
              {expandedSections.dimensions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>
          
          {expandedSections.dimensions && (
            <div className="section-content">
              <div className="form-group">
                <label>Unit</label>
                <select 
                  value={unit} 
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="form-select"
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Length</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      value={dimensions.length}
                      onChange={(e) => handleDimensionChange('length', e.target.value)}
                      min={currentStyle?.minDimensions?.length || 0}
                      max={currentStyle?.maxDimensions?.length || 10000}
                      step="0.1"
                      className="form-input"
                    />
                    <span className="input-unit">{unit}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Width</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      min={currentStyle?.minDimensions?.width || 0}
                      max={currentStyle?.maxDimensions?.width || 10000}
                      step="0.1"
                      className="form-input"
                    />
                    <span className="input-unit">{unit}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Height</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    min={currentStyle?.minDimensions?.height || 0}
                    max={currentStyle?.maxDimensions?.height || 10000}
                    step="0.1"
                    className="form-input"
                  />
                  <span className="input-unit">{unit}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Box Style Section */}
        <div className="properties-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('style')}
            type="button"
          >
            <Box size={16} />
            <span>Box Style</span>
            <span className="section-chevron">
              {expandedSections.style ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>
          
          {expandedSections.style && (
            <div className="section-content">
              <div className="style-selector">
                {boxStyles.map(style => (
                  <button
                    key={style.id}
                    className={`style-option ${styleId === style.id ? 'selected' : ''}`}
                    onClick={() => onStyleChange?.(style.id)}
                  >
                    <div className="style-icon">
                      <Box size={20} />
                    </div>
                    <div className="style-info">
                      <span className="style-name">{style.name}</span>
                      <span className="style-desc">{style.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Material Section */}
        <div className="properties-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('material')}
            type="button"
          >
            <Droplet size={16} />
            <span>Material</span>
            <span className="section-chevron">
              {expandedSections.material ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>
          
          {expandedSections.material && (
            <div className="section-content">
              <div className="form-group">
                <label>Material Thickness</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={materialThickness}
                    onChange={(e) => onMaterialThicknessChange?.(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="10"
                    step="0.1"
                    className="form-input"
                  />
                  <span className="input-unit">{unit}</span>
                </div>
                <p className="form-hint">Thickness of the material (cardboard, corrugated, etc.)</p>
              </div>
              
              {currentStyle.supportsGlueFlap && (
                <div className="form-group">
                  <label>Glue Flap Width</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      value={glueFlapWidth}
                      onChange={(e) => onGlueFlapWidthChange?.(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.5"
                      className="form-input"
                    />
                    <span className="input-unit">{unit}</span>
                  </div>
                  <p className="form-hint">Width of the glue flap for assembly</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Advanced Section */}
        <div className="properties-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('advanced')}
            type="button"
          >
            <span>Advanced</span>
            <span className="section-chevron">
              {expandedSections.advanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>
          
          {expandedSections.advanced && (
            <div className="section-content">
              <div className="form-group">
                <label>Validation</label>
                <div className="validation-status">
                  {validationErrors.length === 0 ? (
                    <span className="validation-ok">
                      <CheckCircle size={14} />
                      All dimensions valid
                    </span>
                  ) : (
                    <span className="validation-warn">
                      <AlertCircle size={14} />
                      {validationErrors.length} issue(s) found
                    </span>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Style Constraints</label>
                <div className="constraints-list">
                  <p>Min: {currentStyle.minDimensions.length}×{currentStyle.minDimensions.width}×{currentStyle.minDimensions.height} {unit}</p>
                  <p>Max: {currentStyle.maxDimensions.length}×{currentStyle.maxDimensions.width}×{currentStyle.maxDimensions.height} {unit}</p>
                  <p>Glue Flap: {currentStyle.supportsGlueFlap ? 'Supported' : 'Not supported'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}