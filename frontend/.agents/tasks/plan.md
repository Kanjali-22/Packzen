# Implementation Plan: Packzen Dieline Platform

## Overview

Build a complete, interconnected Dieline Templates Platform with three screens:
1. **Templates Gallery** (`/dieline`) — Browse and search templates
2. **Template Configuration** (`/dieline/configure?template=<id>`) — Configure dimensions and preview
3. **Dieline Editor** (`/dieline/editor`) — Full editor with 2D canvas, 3D preview, and properties

All screens must share template state dynamically. The gallery is already functional; we need to fix geometry, create the configuration screen, restructure the editor, and ensure 2D/3D sync.

---

## FEAT-001: Fix Dieline Geometry & Canvas Rendering

**Goal:** Generate correct horizontal net layouts (proper cross/T-shape) for RSC/shipping-box, and fix canvas rendering to show blue dashed fold lines and red solid cut lines.

- [ ] 1. **Rewrite `generateDielineLayout` for horizontal net layout**
      - File: `src/utils/dielineGeometry.js`
      - For `styleId='shipping-box'`: Create horizontal strip of 4 body panels (front L×H, side1 W×H, back L×H, side2 W×H) plus glue flap on right, with top flaps above strip (W/2 tall for major flaps on front/back, L/2 wide for minor flaps on sides) and bottom flaps below strip (same pattern).
      - Generate vertical fold lines between adjacent horizontal panels, horizontal fold lines between flaps and body strip.
      - Return correct `{panels, foldLines, cutLines, totalWidth, totalHeight}` where `panels` is an object keyed by panel ID with `{x, y, width, height, type}`, `foldLines` is an array with `{x, y, width, height}` (width>0 for horizontal lines, height>0 for vertical lines).
      - Generate `cutLines` as the actual perimeter outline of the net (not a bounding rect). Each cut line: `{x1, y1, x2, y2, type: 'cut'}` or adapt to existing `{x, y, width, height}` format.
      - Apply the same horizontal layout strategy to `folding-carton`, `mailer-box`, `custom-box`.
      - Verify: `npm run dev`, open `/dieline`, click 'Regular Slotted Carton', verify horizontal strip layout (not vertical stack).

- [ ] 2. **Fix canvas rendering colors**
      - File: `src/components/dieline/DielineCanvas.jsx`
      - Change fold line color from grey (`#64748b`) to blue (`#2563eb`) dashed lines.
      - Change cut line rendering from drawing a single bounding rectangle to drawing the actual perimeter cut lines (red solid lines).
      - Verify: In the editor, fold lines are blue dashed, cut lines are red solid perimeter.

- [ ] 3. **Test dimension updates**
      - Open `/dieline`, click any template, change dimensions in properties panel from 300×200×150 to 400×300×200mm.
      - Verify: 2D canvas updates immediately with correct horizontal layout and new dimensions.
      - Verify: No console errors. `npm run build` succeeds.

---

## FEAT-002: Create Template Configuration Screen

**Goal:** Create `/dieline/configure?template=<id>` with large 2D preview, 3D preview, dimension controls, and "Open in Editor" button. Change gallery to navigate to this screen instead of rendering the editor inline.

- [ ] 1. **Create `DielineConfigurePage.jsx`**
      - File: `src/pages/DielineConfigurePage.jsx`
      - Read `templateId` from URL query param (`useSearchParams`), look up template from `dielineTemplates`.
      - Display template name, category, description at top.
      - Three-column layout: left (template info + dimension controls), center (large `DielineTemplatePreview` SVG), right (`Dieline3DPreview`).
      - Dimension controls: length, width, height inputs (styled with `.form-input` from existing CSS), unit selector (mm/cm/in), material thickness, glue flap width (if `template.styleId` supports it).
      - Initialize state from `template.dimensions`, update on input change.
      - Pass current dimensions to `DielineTemplatePreview` and `Dieline3DPreview` so they update live.
      - Add compatibility note when `template.illustrative` is true: "Uses closest supported structure: {getBoxStyle(styleId).name}".
      - Add "Open in Editor" button: `navigate('/dieline/editor', {state: {templateId, dimensions, styleId, materialThickness}})`.
      - Add back button: `navigate('/dieline')`.
      - Verify: Changing dimensions updates both previews immediately.

- [ ] 2. **Modify gallery to navigate to configuration screen**
      - File: `src/pages/DielineTemplatesPage.jsx`
      - Remove the inline `DielineStudio` rendering (the `selectedTemplate` conditional block).
      - Change `chooseTemplate` function to: `navigate('/dieline/configure?template=' + encodeURIComponent(template.id))`.
      - Verify: Clicking a template card navigates to `/dieline/configure?template=<id>`.

- [ ] 3. **Add route**
      - File: `src/App.jsx`
      - Add: `<Route path="/dieline/configure" element={<Shell><DielineConfigurePage /></Shell>} />`
      - Verify: Route works, no console errors.

- [ ] 4. **Add CSS for configuration screen**
      - File: `src/styles/dielineTemplates.css`
      - Add `.dieline-configure-page` with three-column grid layout: `grid-template-columns: 1fr 1.2fr 1fr`, responsive stack on smaller screens.
      - Style preview containers: `.dieline-configure-preview` (center SVG canvas), `.dieline-configure-3d` (right Three.js canvas).
      - Verify: Layout is visually balanced, previews are large and clear.

- [ ] 5. **Integration test**
      - Run `npm run dev`, open `/dieline`, click "Mailer Box".
      - Verify: Browser navigates to `/dieline/configure?template=mailer-box`, shows template name/description, large 2D preview, 3D preview, dimension inputs.
      - Change width from 200 to 250mm.
      - Verify: Both 2D and 3D previews update immediately.
      - Click "Open in Editor".
      - Verify: Browser navigates to `/dieline/editor`.

---

## FEAT-003: Restructure Editor to Three-Panel Layout

**Goal:** Make `/dieline/editor` a dedicated route, accept template config from `location.state`, implement three-panel horizontal layout (LEFT: properties, CENTER: 2D canvas, RIGHT: 3D preview + panel info).

- [ ] 1. **Accept configuration state**
      - File: `src/pages/DielineStudio.jsx`
      - At top of component, read `location.state` using `useLocation` from `react-router-dom`.
      - If `location.state` contains `{templateId, dimensions, styleId, materialThickness}`, use those values to initialize state instead of `DEFAULT_DIMENSIONS`/`DEFAULT_STYLE`.
      - Look up template from `dielineTemplates` using `templateId` if provided.
      - Verify: Editor initializes with passed configuration, not hardcoded defaults.

- [ ] 2. **Change layout to three-panel horizontal grid**
      - File: `src/styles/index.css`
      - Update `.dieline-main` to: `display: grid; grid-template-columns: 320px 1fr 400px;`.
      - LEFT column: `DielineProperties` (already exists).
      - CENTER column: `DielineCanvas` (full height).
      - RIGHT column: `Dieline3DPreview` (top half, min-height: 300px) + selected panel info card (bottom half).
      - Remove `.dieline-editor-area` vertical grid-template-rows (was stacking canvas + 3D vertically).
      - Verify: Layout is three horizontal panels, visually proportional.

- [ ] 3. **Add back button**
      - File: `src/pages/DielineStudio.jsx`
      - Add breadcrumb or button in toolbar: `<button onClick={() => navigate('/dieline')}><ArrowLeft /> Back to Gallery</button>`.
      - Import `useNavigate` from `react-router-dom`.
      - Remove `onBack` prop (no longer needed).
      - Verify: Clicking back button navigates to `/dieline`.

- [ ] 4. **Add route**
      - File: `src/App.jsx`
      - Add: `<Route path="/dieline/editor" element={<Shell><DielineStudio /></Shell>} />`.
      - Remove or keep the existing `/editor` route as a separate placeholder (for 3D mockup editor, not dieline editor).
      - Verify: Route works, no console errors.

- [ ] 5. **Integration test**
      - Run `npm run dev`, open `/dieline`, click "Folding Carton", configure dimensions to 160×90×55mm, click "Open in Editor".
      - Verify: `/dieline/editor` opens with three-panel horizontal layout.
      - Verify: 2D canvas and 3D preview show folding carton with 160×90×55mm dimensions (not default 300×200×150mm).
      - Change length to 180mm in left properties panel.
      - Verify: Both 2D canvas and 3D preview update immediately.
      - Click "Back to Gallery".
      - Verify: Browser returns to `/dieline`.

---

## FEAT-004: Fix 3D Preview Camera & Geometry

**Goal:** Ensure the 3D box is properly framed (not tiny, not showing flat panels), camera centers on the box, dimensions match configuration.

- [ ] 1. **Adjust camera target**
      - File: `src/components/dieline/Dieline3DPreview.jsx`
      - Change camera target from fixed `[0, 1, 0]` to `[0, normalizedDimensions.height/2, 0]` so it centers on the middle of the box height.
      - Verify: Camera centers on the box, not an arbitrary point.

- [ ] 2. **Verify group scale logic**
      - The current code: group scale multiplies by `[normalizedDimensions.length/4, normalizedDimensions.height/4, normalizedDimensions.width/4]`, inner BoxModel receives fixed dimensions `{length: 4, width: (W/L)*4, height: (H/L)*4}`.
      - This appears correct (inner model is always 4 units long, group scale adjusts for proportions).
      - Test with dimension ratios: 300×200×150, 400×400×400 (cube), 600×100×50 (long thin box).
      - If box is too small, increase inner BoxModel dimensions from 4 to 6 or 8 (and adjust group scale denominator).
      - If box is too large, decrease dimensions.
      - Verify: Box remains centered and fully visible in viewport.

- [ ] 3. **Verify panel positions**
      - BoxModel positions: bottom `[0, t/2, 0]`, side1 `[0, H/2+t, -W/2]`, side2 `[0, H/2+t, W/2]`, end1 `[-L/2, H/2+t, 0]`, end2 `[L/2, H/2+t, 0]`, lid `[0, H+1.5t, 0]`.
      - These positions are correct for a closed box.
      - If panels appear flat/stacked instead of forming a 3D box, check that positions use Y-axis for vertical (height), X-axis for length, Z-axis for width.
      - Verify: Box looks like a 3D box with 6 visible faces, not a flat stack.

- [ ] 4. **Test OrbitControls zoom range**
      - Current: `minDistance: 2, maxDistance: 30`.
      - Test: User can zoom close enough to inspect details, not so far that box becomes a dot.
      - Adjust if needed.
      - Verify: OrbitControls allow smooth rotation, zoom, pan.

- [ ] 5. **Integration test**
      - Run `npm run dev`, open `/dieline`, click "Regular Slotted Carton", configure 300×200×150mm, open editor.
      - Verify: 3D preview shows recognizable 3D box with 6 faces, centered in viewport, reasonable size.
      - Change dimensions to 600×100×50mm (long thin box).
      - Verify: 3D box updates to long thin shape, remains fully visible.
      - Change dimensions to 200×200×200mm (cube).
      - Verify: 3D box updates to cube, remains centered.
      - Drag on 3D canvas to rotate box.
      - Verify: Box rotates smoothly, all 6 faces visible at different angles.

---

## Final Verification

After completing all FEATs:

- [ ] **End-to-end flow test**
      - Run `npm run dev`, open `http://localhost:5173/dieline`.
      - Search "tuck", verify search filters templates.
      - Select "Tuck End Boxes" category, verify category filter works.
      - Sort by A-Z, verify sort works.
      - Click "Reverse Tuck End Box" template card.
      - Verify: Browser navigates to `/dieline/configure?template=reverse-tuck-end`.
      - Change dimensions to 140×80×50mm.
      - Verify: 2D preview (SVG) and 3D preview (Three.js) update immediately.
      - Click "Open in Editor".
      - Verify: Browser navigates to `/dieline/editor`, editor shows three-panel layout with 140×80×50mm configuration.
      - Change height to 60mm in properties panel.
      - Verify: 2D canvas (center) and 3D preview (right) update immediately.
      - Verify: 2D canvas shows horizontal net layout with blue dashed fold lines and red solid cut lines.
      - Click "Back to Gallery".
      - Verify: Browser returns to `/dieline`, gallery state preserved.

- [ ] **Build test**
      - Run `npm run build`.
      - Verify: Build succeeds with no errors.
      - Run `npm run preview`, test the production build.

- [ ] **Cross-browser test**
      - Test in Chrome, Firefox, Safari.
      - Verify: All interactions work, no console errors.

---

## Notes

- **Geometry coordinate system:** Use millimeters as the base unit. X-axis = length, Y-axis = height, Z-axis = width. Top-left origin for 2D canvas (Y increases downward), center origin for 3D scene.
- **React Router state:** Use `navigate(path, {state: {...}})` to pass template configuration from configure screen to editor. Editor reads `location.state` with `useLocation()`.
- **CSS conventions:** Reuse existing styles from `src/styles/index.css` and `src/styles/dielineTemplates.css`. Add new classes with `dieline-` prefix for consistency.
- **No backend:** All data comes from `src/data/dielineTemplates.js`. Filtering, sorting, search are client-side only.
- **No new dependencies:** Use existing React 19, Vite 8, React Router, Three.js, lucide-react. Do not add Tailwind, MUI, or other UI libraries.

