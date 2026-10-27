import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ArrowRight } from 'lucide-react';
import { getDielineTemplate } from '../data/dielineTemplates';
import { getBoxStyle, generateDielineLayout } from '../utils/dielineGeometry';
import DielineTemplatePreview from '../components/dieline/DielineTemplatePreview';
import Dieline3DPreview from '../components/dieline/Dieline3DPreview';
import '../styles/dielineTemplates.css';

const UNITS = ['mm', 'cm', 'in'];
const UNIT_LABELS = { mm: 'Millimeters', cm: 'Centimeters', in: 'Inches' };
const UNIT_CONVERSION = { mm: 1, cm: 10, in: 25.4 };

export default function DielineConfigurePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('template');
  const template = getDielineTemplate(templateId);

  const [dimensions, setDimensions] = useState(() => 
    template ? { ...template.dimensions } : { length: 300, width: 200, height: 150, unit: 'mm' }
  );
  const [materialThickness, setMaterialThickness] = useState(1.5);
  const [glueFlapWidth, setGlueFlapWidth] = useState(() => {
    const style = template ? getBoxStyle(template.styleId) : null;
    return style?.defaultGlueFlapWidth ?? 0;
  });

  const boxStyle = template ? getBoxStyle(template.styleId) : null;

  // Generate layout for previews
  const layout = useMemo(() => {
    if (!template) return null;
    return generateDielineLayout(dimensions, template.styleId, materialThickness);
  }, [template, dimensions, materialThickness]);

  const handleDimensionChange = (key, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    setDimensions(prev => ({ ...prev, [key]: numValue }));
  };

  const handleUnitChange = (newUnit) => {
    if (newUnit === dimensions.unit) return;
    
    const factor = UNIT_CONVERSION[dimensions.unit] / UNIT_CONVERSION[newUnit];
    setDimensions({
      length: parseFloat((dimensions.length * factor).toFixed(2)),
      width: parseFloat((dimensions.width * factor).toFixed(2)),
      height: parseFloat((dimensions.height * factor).toFixed(2)),
      unit: newUnit
    });
  };

  const handleOpenInEditor = () => {
    if (!template) return;
    navigate('/dieline/editor', {
      state: {
        templateId: template.id,
        dimensions,
        styleId: template.styleId,
        materialThickness,
        glueFlapWidth
      }
    });
  };

  if (!template) {
    return (
      <div className="dieline-configure-page">
        <div className="dieline-gallery-container">
          <div className="dieline-configure-error">
            <h2>Template Not Found</h2>
            <p>The requested template could not be found.</p>
            <Link to="/dieline" className="button button--dark">
              <ArrowLeft size={14} />
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dieline-configure-page">
      <div className="dieline-gallery-container">
        <div className="dieline-configure-header">
          <button type="button" onClick={() => navigate('/dieline')} className="back-button">
            <ArrowLeft size={16} />
            Back to Gallery
          </button>
        </div>

        <div className="dieline-configure-content">
          {/* Left column: Template info and controls */}
          <aside className="dieline-configure-sidebar">
            <div className="template-meta">
              {template.code && <span className="template-code">{template.code}</span>}
              <h1>{template.title}</h1>
              <p className="template-category">{template.category}</p>
              <p className="template-description">{template.description}</p>
            </div>

            <div className="configure-controls">
              <h3>Configure Dimensions</h3>
              
              <div className="form-group">
                <label>Unit</label>
                <select 
                  value={dimensions.unit} 
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="form-select"
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Length</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={dimensions.length}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                    min={boxStyle?.minDimensions?.length || 10}
                    max={boxStyle?.maxDimensions?.length || 10000}
                    step="0.1"
                    className="form-input"
                  />
                  <span className="input-unit">{dimensions.unit}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Width</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    min={boxStyle?.minDimensions?.width || 10}
                    max={boxStyle?.maxDimensions?.width || 10000}
                    step="0.1"
                    className="form-input"
                  />
                  <span className="input-unit">{dimensions.unit}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Height</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    min={boxStyle?.minDimensions?.height || 10}
                    max={boxStyle?.maxDimensions?.height || 10000}
                    step="0.1"
                    className="form-input"
                  />
                  <span className="input-unit">{dimensions.unit}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Material Thickness</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={materialThickness}
                    onChange={(e) => setMaterialThickness(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="10"
                    step="0.1"
                    className="form-input"
                  />
                  <span className="input-unit">{dimensions.unit}</span>
                </div>
              </div>

              {boxStyle?.supportsGlueFlap && (
                <div className="form-group">
                  <label>Glue Flap Width</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      value={glueFlapWidth}
                      onChange={(e) => setGlueFlapWidth(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.5"
                      className="form-input"
                    />
                    <span className="input-unit">{dimensions.unit}</span>
                  </div>
                </div>
              )}
            </div>

            {template.illustrative && (
              <div className="configure-compatibility-note">
                <p>
                  <strong>Compatibility Note:</strong> This template uses the closest 
                  supported editor structure: <strong>{boxStyle?.name}</strong>
                </p>
              </div>
            )}

            <button 
              type="button" 
              className="button button--purple button--wide"
              onClick={handleOpenInEditor}
            >
              Open in Editor
              <ArrowRight size={16} />
            </button>
          </aside>

          {/* Center column: 2D Preview */}
          <div className="dieline-configure-preview-2d">
            <h3>2D Dieline Preview</h3>
            <div className="preview-2d-canvas">
              {layout && (
                <DielineTemplatePreview template={{ ...template, dimensions }} />
              )}
            </div>
          </div>

          {/* Right column: 3D Preview */}
          <div className="dieline-configure-preview-3d">
            <h3>3D Preview</h3>
            <div className="preview-3d-canvas">
              {layout && (
                <Dieline3DPreview
                  layout={layout}
                  dimensions={dimensions}
                  styleId={template.styleId}
                  materialThickness={materialThickness}
                  unit={dimensions.unit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
