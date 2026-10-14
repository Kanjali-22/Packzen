import { Box, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { getAllBoxStyles, getBoxStyle } from '../../utils/dielineGeometry';

export default function BoxStyleSelector({
  selectedStyle,
  onStyleChange,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const boxStyles = getAllBoxStyles();
  const currentStyle = getBoxStyle(selectedStyle);

  const handleSelect = (styleId) => {
    onStyleChange?.(styleId);
    setIsOpen(false);
  };

  return (
    <div className="box-style-selector">
      <button
        className={`style-selector-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
      >
        <div className="selector-preview">
          <Box size={18} />
        </div>
        <div className="selector-info">
          <span className="selector-name">{currentStyle?.name || 'Select Style'}</span>
          <span className="selector-category">{currentStyle?.category || ''}</span>
        </div>
        <span className="selector-chevron">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      
      {isOpen && (
        <div className="style-selector-dropdown">
          <div className="dropdown-header">
            <span>Select Box Style</span>
          </div>
          <div className="dropdown-list">
            {getAllBoxStyles().map(style => (
              <button
                key={style.id}
                className={`dropdown-item ${selectedStyle === style.id ? 'selected' : ''}`}
                onClick={() => handleSelect(style.id)}
                disabled={disabled}
              >
                <div className="item-icon">
                  <Box size={16} />
                </div>
                <div className="item-info">
                  <span className="item-name">{style.name}</span>
                  <span className="item-desc">{style.description}</span>
                </div>
                {selectedStyle === style.id && (
                  <Check size={16} className="item-check" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}