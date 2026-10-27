/**
 * Default artwork SVGs, textures, and helpers for the Mockup Editor
 */

// High-resolution SVG data URI for the Winery Tour artwork (Reference Image 2)
export const WINERY_TOUR_ARTWORK = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
  <defs>
    <linearGradient id="creamBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#faf5ec" />
      <stop offset="100%" stop-color="#f3ece0" />
    </linearGradient>
    <linearGradient id="wineGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#991b1b" />
      <stop offset="60%" stop-color="#671115" />
      <stop offset="100%" stop-color="#450a0a" />
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Top Cream Card Area -->
  <rect width="600" height="750" fill="url(#creamBg)" />
  
  <!-- Subtle decorative corner border -->
  <rect x="25" y="25" width="550" height="700" fill="none" stroke="#d5c7b3" stroke-width="1.5" stroke-dasharray="4,4" />
  <rect x="32" y="32" width="536" height="686" fill="none" stroke="#e8dfd3" stroke-width="1" />

  <!-- Invitation Header -->
  <text x="300" y="90" text-anchor="middle" font-family="'Georgia', serif" font-size="16" fill="#713f36" letter-spacing="1.5">You are invited to a</text>
  <text x="300" y="145" text-anchor="middle" font-family="'Brush Script MT', 'Bickham Script Pro', cursive, 'Snell Roundhand', serif" font-size="52" font-style="italic" fill="#881337" font-weight="bold">Winery tour</text>

  <!-- Grapes and leaves illustration on top right -->
  <g transform="translate(420, 160) scale(0.75)">
    <!-- Vine leaves -->
    <path d="M40,20 Q60,-10 90,10 Q110,40 80,60 Q50,70 40,20 Z" fill="#9f2a36" opacity="0.85" />
    <path d="M20,30 Q0,10 -20,35 Q-15,65 15,60 Z" fill="#7f1d24" opacity="0.85" />
    <!-- Grape cluster -->
    <circle cx="20" cy="50" r="10" fill="#671115" />
    <circle cx="36" cy="52" r="10" fill="#881337" />
    <circle cx="28" cy="66" r="10" fill="#581014" />
    <circle cx="44" cy="68" r="10" fill="#781422" />
    <circle cx="36" cy="82" r="9" fill="#671115" />
    <circle cx="28" cy="95" r="8" fill="#581014" />
  </g>

  <!-- Hand holding wine glass (Detailed line art & fills) -->
  <g transform="translate(140, 180) scale(0.95)" filter="url(#softShadow)">
    <!-- Wine glass bowl -->
    <path d="M70,120 C70,190 120,230 150,230 C180,230 230,190 230,120 Z" fill="none" stroke="#4a1a1f" stroke-width="2.5" />
    <!-- Wine liquid -->
    <path d="M76,140 C100,165 160,160 224,140 C222,185 185,224 150,224 C115,224 78,185 76,140 Z" fill="url(#wineGrad)" />
    <!-- Wine surface wave & highlights -->
    <ellipse cx="150" cy="140" rx="74" ry="14" fill="#a82333" opacity="0.6" />
    <path d="M90,160 Q120,200 150,215" stroke="#fca5a5" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round" />
    <path d="M210,150 Q215,180 185,210" stroke="#fff" stroke-width="2" fill="none" opacity="0.5" stroke-linecap="round" />
    <!-- Glass stem & base -->
    <line x1="150" y1="230" x2="150" y2="330" stroke="#4a1a1f" stroke-width="3" />
    <path d="M100,340 C125,335 175,335 200,340" stroke="#4a1a1f" stroke-width="3.5" fill="none" stroke-linecap="round" />

    <!-- Hand fingers wrapping around glass -->
    <!-- Arm sleeve / cuff -->
    <path d="M-100,380 L-10,340 L10,380 L-80,430 Z" fill="#d97706" opacity="0.25" stroke="#78350f" stroke-width="2" />
    <!-- Forearm / Hand -->
    <path d="M-20,330 C20,300 60,280 80,260 C100,240 120,210 130,180 C135,165 130,150 115,155 C100,160 90,185 80,210 C70,235 40,265 10,290 Z" fill="#fde68a" stroke="#78350f" stroke-width="2.5" />
    <!-- Fingers clutching stem -->
    <path d="M130,195 C150,195 165,205 165,215 C165,225 145,230 130,225" fill="#fde68a" stroke="#78350f" stroke-width="2" />
    <path d="M125,230 C155,235 168,245 165,255 C162,265 140,265 120,260" fill="#fde68a" stroke="#78350f" stroke-width="2" />
    <path d="M115,265 C145,270 155,282 150,292 C145,300 130,298 110,292" fill="#fde68a" stroke="#78350f" stroke-width="2" />
    <!-- Thumb -->
    <path d="M95,190 C95,170 110,160 120,165 C125,170 120,185 110,195 Z" fill="#fde68a" stroke="#78350f" stroke-width="2" />
  </g>

  <!-- Premium Quality Seal -->
  <g transform="translate(390, 310)" filter="url(#softShadow)">
    <circle cx="45" cy="45" r="45" fill="#781422" />
    <circle cx="45" cy="45" r="40" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="3,2" />
    <text x="45" y="38" text-anchor="middle" font-family="'Georgia', serif" font-size="11" font-weight="bold" fill="#fff" letter-spacing="1">PREMIUM</text>
    <text x="45" y="55" text-anchor="middle" font-family="'Georgia', serif" font-size="12" font-style="italic" fill="#fef08a">quality</text>
  </g>

  <!-- Dark Wine Red Bottom Panel with Scalloped Edge -->
  <g transform="translate(0, 440)">
    <!-- Scalloped transition line -->
    <path d="M0,0 Q15,-12 30,0 Q45,-12 60,0 Q75,-12 90,0 Q105,-12 120,0 Q135,-12 150,0 Q165,-12 180,0 Q195,-12 210,0 Q225,-12 240,0 Q255,-12 270,0 Q285,-12 300,0 Q315,-12 330,0 Q345,-12 360,0 Q375,-12 390,0 Q405,-12 420,0 Q435,-12 450,0 Q465,-12 480,0 Q495,-12 510,0 Q525,-12 540,0 Q555,-12 570,0 Q585,-12 600,0 L600,310 L0,310 Z" fill="#4c0d12" />

    <!-- Event details boxes -->
    <!-- Left Box -->
    <rect x="70" y="45" width="180" height="130" fill="none" stroke="#88222b" stroke-width="1.2" />
    <text x="160" y="85" text-anchor="middle" font-family="'Georgia', serif" font-size="24" font-weight="bold" fill="#fef08a" letter-spacing="1">Dec 24</text>
    <text x="160" y="115" text-anchor="middle" font-family="'Georgia', serif" font-size="18" fill="#fff">9pm</text>
    <text x="160" y="145" text-anchor="middle" font-family="'Georgia', serif" font-size="12" fill="#fca5a5" letter-spacing="1">Wine Center, CA</text>

    <!-- Right Box -->
    <rect x="270" y="45" width="260" height="130" fill="none" stroke="#88222b" stroke-width="1.2" />
    <text x="400" y="90" text-anchor="middle" font-family="'Georgia', serif" font-size="13" font-style="italic" fill="#fed7aa">Lorem ipsum dolor sit amet,</text>
    <text x="400" y="115" text-anchor="middle" font-family="'Georgia', serif" font-size="12" fill="#fed7aa">consectetur adipiscing elit,</text>
    <text x="400" y="140" text-anchor="middle" font-family="'Georgia', serif" font-size="12" fill="#fed7aa">sed do eiusmod tempor.</text>

    <!-- Bottom subtext line -->
    <text x="300" y="225" text-anchor="middle" font-family="'Georgia', serif" font-size="11" fill="#fca5a5" opacity="0.8">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</text>
  </g>
</svg>
`);

// High-resolution SVG data URI for the Tea / Coffee label (Reference Image 2 thumbnail 2)
export const TEA_LABEL_ARTWORK = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
  <defs>
    <linearGradient id="kraftBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d4b483" />
      <stop offset="100%" stop-color="#c19a6b" />
    </linearGradient>
    <linearGradient id="greenBadge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2d5a27" />
      <stop offset="100%" stop-color="#1e3f1a" />
    </linearGradient>
  </defs>

  <rect width="600" height="450" fill="url(#kraftBg)" />
  <rect x="15" y="15" width="570" height="420" fill="none" stroke="#5a3d28" stroke-width="2" />

  <!-- Left Green Banner -->
  <rect x="35" y="35" width="220" height="380" fill="url(#greenBadge)" rx="8" />
  
  <!-- Emblem in green banner -->
  <circle cx="145" cy="130" r="45" fill="#f4ebd9" />
  <circle cx="145" cy="130" r="40" fill="none" stroke="#2d5a27" stroke-width="2" stroke-dasharray="4,2" />
  <!-- Tea leaf icon -->
  <path d="M145,105 C165,115 170,140 145,155 C120,140 125,115 145,105 Z" fill="#2d5a27" />
  <path d="M145,110 L145,150" stroke="#f4ebd9" stroke-width="2" />

  <text x="145" y="210" text-anchor="middle" font-family="'Georgia', serif" font-size="20" font-weight="bold" fill="#f4ebd9" letter-spacing="1">ORGANIC</text>
  <text x="145" y="235" text-anchor="middle" font-family="'Georgia', serif" font-size="16" font-style="italic" fill="#c2e0b8">Green Tea</text>
  <text x="145" y="280" text-anchor="middle" font-family="'Georgia', serif" font-size="11" fill="#f4ebd9" opacity="0.8">100% NATURAL LEAF</text>
  <rect x="75" y="310" width="140" height="30" fill="#f4ebd9" rx="4" />
  <text x="145" y="330" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e3f1a">50 PYRAMID BAGS</text>

  <!-- Right Details Area -->
  <rect x="280" y="35" width="285" height="175" fill="#fefae0" rx="8" stroke="#a47e5b" stroke-width="1.5" />
  <text x="422" y="70" text-anchor="middle" font-family="'Georgia', serif" font-size="16" font-weight="bold" fill="#43281c">BREWING GUIDE</text>
  <text x="310" y="105" font-family="sans-serif" font-size="11" fill="#58311e">⏱ Steep: 2-3 mins at 80°C</text>
  <text x="310" y="130" font-family="sans-serif" font-size="11" fill="#58311e">💧 Fresh spring water</text>
  <text x="310" y="155" font-family="sans-serif" font-size="11" fill="#58311e">🍃 Single origin high elevation</text>

  <!-- Nutrition / Badges row -->
  <rect x="280" y="230" width="285" height="185" fill="#fefae0" rx="8" stroke="#a47e5b" stroke-width="1.5" />
  <text x="422" y="265" text-anchor="middle" font-family="'Georgia', serif" font-size="14" font-weight="bold" fill="#43281c">AUTHENTIC ORIGIN</text>
  <circle cx="330" cy="325" r="28" fill="#2d5a27" />
  <text x="330" y="330" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff">BIO</text>
  <circle cx="422" cy="325" r="28" fill="#bc6c25" />
  <text x="422" y="330" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#fff">FAIR</text>
  <circle cx="514" cy="325" r="28" fill="#283618" />
  <text x="514" y="330" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#fff">ECO</text>
  <text x="422" y="385" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#606c38">Crafted with pure organic ingredients</text>
</svg>
`);

/**
 * Procedural texture generator for realistic kraft cardboard with repeating Pacdora-style watermark
 * and "Upload your images or create with AI" center placeholder text.
 */
export function createBoxTextureCanvas({
  artworkSrc = null,
  packageColor = '#c2a075',
  showWatermark = true,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  rotation = 0
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Fill base packaging color
  ctx.fillStyle = packageColor;
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Add realistic subtle kraft paper fiber noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Add subtle corrugation lines (vertical micro-stripes)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.018)';
  for (let x = 0; x < 1024; x += 12) {
    ctx.fillRect(x, 0, 6, 1024);
  }

  // 4. If artwork is applied, draw the artwork!
  if (artworkSrc) {
    // If artwork exists, we return canvas immediately or caller draws onto it
    return canvas;
  }

  // 5. If no artwork and showWatermark, draw the authentic Pacdora watermark pattern and prompt!
  if (showWatermark) {
    // Subtle repeating diamond grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    for (let x = -1024; x < 2048; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 1024, 1024);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, 1024);
      ctx.lineTo(x + 1024, 0);
      ctx.stroke();
    }

    // Repeating logo marks "Pacdora" or "Packzen"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const stepX = 220;
    const stepY = 160;
    for (let y = 60; y < 1024; y += stepY) {
      for (let x = 80; x < 1024; x += stepX) {
        ctx.fillText('pacdora', x, y);
      }
    }

    // Prominent centered prompt text (as in Reference Image 1)
    ctx.fillStyle = 'rgba(30, 25, 20, 0.48)';
    ctx.font = '600 36px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Upload your images', 512, 490);
    ctx.fillText('or create with AI', 512, 540);
    ctx.restore();
  }

  return canvas;
}
