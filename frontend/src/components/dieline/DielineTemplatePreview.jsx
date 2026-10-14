import { generateDielineLayout } from '../../utils/dielineGeometry';

const TONES = {
  violet: '#7758e8', blue: '#3c70e8', green: '#259b78', orange: '#e77a31',
  purple: '#9a58d4', teal: '#208f97', pink: '#d5578f', yellow: '#ae8615',
  red: '#c95858', navy: '#365b88', brown: '#96704f', sky: '#418cb5',
};

export default function DielineTemplatePreview({ template }) {
  const layout = generateDielineLayout(template.dimensions, template.styleId, 1);
  const padding = 24;
  const width = Math.max(1, layout.totalWidth + padding * 2);
  const height = Math.max(1, layout.totalHeight + padding * 2);
  const tone = TONES[template.previewTone] ?? TONES.violet;

  return (
    <svg className="dieline-template-preview" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${template.title} dieline preview`}>
      <rect width={width} height={height} fill="#f6f5f3" />
      <g transform={`translate(${padding} ${padding})`}>
        {Object.entries(layout.panels).map(([id, panel]) => (
          <rect key={id} x={panel.x} y={panel.y} width={panel.width} height={panel.height} fill="#fff" stroke={tone} strokeWidth="1.5" rx="1" />
        ))}
        {layout.cutLines.map((line, index) => (
          <rect key={`cut-${index}`} x={line.x} y={line.y} width={line.width} height={line.height} fill="none" stroke={tone} strokeWidth="2" />
        ))}
        {layout.foldLines.map((line, index) => (
          <line key={`fold-${index}`} x1={line.x} y1={line.y} x2={line.x + (line.width ?? 0)} y2={line.y + (line.height ?? 0)} stroke="#e36b63" strokeWidth="1.5" strokeDasharray="5 4" />
        ))}
      </g>
    </svg>
  );
}
