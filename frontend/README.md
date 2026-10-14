You are working inside an existing React/Vite project.

I am building a product called "PackZen", inspired by the UX, information architecture, density, spacing, card systems, navigation behavior, category browsing, pricing presentation, and responsive structure of the Pacdora screenshots I am providing.

IMPORTANT:
- Use the uploaded screenshots as the primary visual reference.
- Recreate the overall UI structure and interaction patterns closely, but use PackZen branding, original copy, original assets, and original component implementation.
- Do not reuse Pacdora logos, copyrighted images, or proprietary assets.
- This phase is FRONTEND ONLY.
- Do not implement backend, authentication server logic, Three.js, or real 3D rendering yet.
- However, architect the frontend so those features can be integrated later without rewriting everything.

==================================================
TECH STACK
==================================================

Use:

- React 19
- Vite
- JavaScript
- React Router DOM
- Plain handwritten CSS
- No Tailwind
- No Bootstrap
- No Material UI
- No Chakra
- No external UI component library
- No Three.js in this phase
- No backend in this phase

You may use:
- lucide-react only for icons if needed

Use local mock data files for dynamic content.

==================================================
PRIMARY OBJECTIVE
==================================================

Build a fully dynamic frontend resembling the product experience shown in the provided screenshots.

I do NOT want a single static landing page.

Build a complete frontend product shell including:

1. Homepage
2. Mockup marketplace
3. Mockup category browsing
4. Dieline marketplace
5. Dieline category browsing
6. Pricing
7. Tool navigation mega-menu
8. Search
9. Filters
10. Sorting
11. Pagination
12. Dynamic product cards
13. Dynamic category cards
14. Responsive navigation
15. Dynamic FAQ accordions
16. Reusable CTA sections
17. Product-detail-ready routing architecture
18. Editor-ready routing architecture

Everything should work using mock data.

==================================================
ROUTES
==================================================

Create these routes:

/
 /mockups
 /mockups/:category
 /mockups/item/:slug

 /dielines
 /dielines/:category
 /dielines/item/:slug

 /pricing

 /ai-creation
 /packaging-lab

 /editor
 /login
 /signup

The editor, login, signup, AI Creation, and Packaging Lab routes can initially show polished placeholder pages.

Do not leave dead links.

==================================================
GLOBAL DESIGN LANGUAGE
==================================================

The screenshots show a clean, editorial SaaS/product design.

Match that general visual direction:

- Light background
- White surfaces
- Near-black typography
- Soft purple/lavender supporting backgrounds
- Black outlines on important cards
- Restrained purple accent
- Large rounded cards
- Fine grid backgrounds in selected hero/CTA areas
- Spacious layout
- High information density without looking cluttered
- Clean editorial typography
- Minimal shadows
- Strong borders instead of excessive shadows
- Subtle hover transitions

DO NOT create:
- dark neon UI
- glass-heavy dashboards
- cyberpunk styling
- giant gradients everywhere
- generic startup landing page styling
- excessive pill buttons
- excessive shadows

Use CSS variables for the entire design system.

Example tokens:

--color-bg
--color-surface
--color-text
--color-muted
--color-border
--color-accent
--color-accent-soft

--radius-sm
--radius-md
--radius-lg
--radius-xl

--container-width
--header-height

==================================================
TYPOGRAPHY
==================================================

Use a clean geometric sans-serif.

Preferred:
- Inter
or
- Manrope

Use:
- strong headline hierarchy
- tight heading letter spacing
- readable body text
- small uppercase labels where appropriate

==================================================
NAVBAR
==================================================

Recreate the structure seen in the screenshots.

Desktop:

LEFT:
PackZen logo

CENTER:
- Mockups
- Dieline Templates
- AI Creation
- Packaging Lab
- Business
- Pricing

RIGHT:
- Language selector
- Log in

Navbar should:
- remain sticky
- have a subtle bottom border
- remain readable while scrolling
- support dropdown / mega-menu interactions

==================================================
TOOLS MEGA MENU
==================================================

Create a large dropdown similar in concept to the screenshot.

Group tools into three columns:

RESEARCH & DESIGN
- Packaging Research
- AI Creation
- Illustrator Integration

VISUALIZE
- Mockup Generator
- 3D Modeling Studio

DIELINE & PRINT
- Dieline Generator
- Printing Services

Each item:
- icon
- title
- small description
- hover state

The menu should:
- animate subtly
- close on outside click
- close on Escape
- be keyboard accessible

==================================================
HOMEPAGE
==================================================

Build the homepage from reusable sections.

--------------------------------------------------
SECTION 1 — HERO
--------------------------------------------------

Large headline similar in composition to the screenshots.

Example original PackZen copy:

"Everything you need for packaging mockups and dielines."

Highlight "PackZen" or another keyword in purple.

Below the heading create three large tool cards:

1. Mockup Generator
2. 3D Packaging Studio
3. Dieline Generator

Each card:
- image area
- title
- arrow button
- strong border
- subtle background variation
- hover lift

Cards should be generated from an array.

--------------------------------------------------
SECTION 2 — TOP MOCKUP CATEGORIES
--------------------------------------------------

Heading:
"Top mockup categories"

Create 12 dynamic categories.

Examples:
- Box
- Pouch
- Bottle
- Can
- Tube
- Cup & Container
- Food Packaging
- Water Bottle
- Gift Box
- Paper Bag
- Pizza Packaging
- Supplement Bottle

Each category card:
- category name
- "Mockups" subtitle
- thumbnail
- small "+" or arrow affordance
- hover animation

Use CSS Grid.

Include:
"View all mockups →"

--------------------------------------------------
SECTION 3 — TOP DIELINE CATEGORIES
--------------------------------------------------

Examples:
- Folding Box
- Tuck End Box
- Mailer Box
- Box With Lid
- Display Box
- Tray Box
- Rigid Box
- Envelope

Use blueprint/technical placeholder imagery.

Include:
"View all dielines →"

--------------------------------------------------
SECTION 4 — BRAND / TRUST STRIP
--------------------------------------------------

Create muted fictional/sample brand logos as text marks.

Do not use trademark logos from the screenshot.

Examples:
- Northstar
- Aster
- Mono
- Orbit
- Helix
- Vertex

--------------------------------------------------
SECTION 5 — TOOL SHOWCASES
--------------------------------------------------

Create alternating two-column cards.

Showcases:

1. Mockup Generator
2. Dieline Template Maker
3. Browser 3D Studio
4. AI Background Studio

Each section should contain:
- visual mock interface
- headline
- description
- primary CTA
- secondary CTA

Alternate image/text position.

Create believable fake product-editor screenshots using CSS components rather than copying screenshots.

--------------------------------------------------
SECTION 6 — FINAL CTA
--------------------------------------------------

Large editorial CTA.

Example:

"START YOUR DESIGN JOURNEY WITH PACKZEN."

Use subtle grid background.

Button:
"View all tools →"

--------------------------------------------------
SECTION 7 — FOOTER
--------------------------------------------------

Large multi-column footer.

Columns:
- Mockups
- Dielines
- Tools
- Resources
- Company

Add:
- PackZen logo
- social placeholders
- copyright
- privacy
- terms

==================================================
MOCKUPS MARKETPLACE
==================================================

Route:
/mockups

This page must be dynamic.

Desktop structure:

LEFT SIDEBAR
MAIN CONTENT

Sidebar should be sticky.

Create filters:

- Search
- Categories
- Product type
- Shape
- Industry
- Free / Premium
- Orientation

Include collapsible filter groups.

MAIN HEADER:

Title:
"Packaging Mockups"

Subtitle with total results count.

Controls:
- Sort by Popular
- Newest
- Name
- Filter button on mobile

--------------------------------------------------
MARKETPLACE GRID
--------------------------------------------------

Use mock data containing at least 60 items.

Each item must have:

{
 id,
 title,
 slug,
 category,
 type,
 image,
 premium,
 rating,
 tags
}

Grid:
- 4 or 5 columns on large screens
- responsive down to 1 column

Card:
- image
- title
- small metadata
- optional premium badge
- hover image scale
- favorite button
- open-details action

Filtering must actually work.

Search must actually work.

Sorting must actually work.

Pagination must actually work.

Do not hardcode repeated JSX cards manually.

==================================================
MOCKUP CATEGORY ROUTES
==================================================

Example:

/mockups/box
/mockups/bottle
/mockups/pouch

Read category from the URL.

Filter mock data automatically.

Show:
- title
- description
- category chips
- item grid

==================================================
MOCKUP DETAIL PAGE
==================================================

Route:
/mockups/item/:slug

Create a product detail layout containing:

- large mockup preview
- title
- category
- tags
- description
- "Customize this mockup" button
- related mockups

Button should navigate to:

/editor?template=<slug>

No 3D functionality yet.

==================================================
DIELINE MARKETPLACE
==================================================

Route:
/dielines

Reuse marketplace architecture.

Dieline items should include:

{
 id,
 title,
 slug,
 type,
 image,
 dimensions,
 category,
 premium
}

Create at least 40 mock dieline records.

Filters:
- packaging type
- dimension type
- category
- free/premium

Use technical drawing style thumbnails.

==================================================
DIELINE DETAIL PAGE
==================================================

Route:
/dielines/item/:slug

Layout:
- large dieline preview
- technical information
- configurable dimensions UI placeholder
- "Open in dieline editor" button

==================================================
PRICING PAGE
==================================================

Recreate the structure shown in the screenshot, but use original PackZen content.

Hero:
"Choose your PackZen plan"

Billing toggle:
Monthly / Yearly

Plans:
- Free
- Pro
- Business

Pricing values may be mock values.

Create feature arrays and render dynamically.

Highlight Pro using purple outline/accent.

Below pricing cards create:

"Compare features"

Build dynamic comparison groups:

- Export
- Mockup Generator
- 3D Studio
- Dieline Generator
- AI
- Collaboration
- Storage
- Support

Use check marks and values.

Do not hardcode entire table cell-by-cell.

==================================================
FAQ
==================================================

Create reusable Accordion component.

Use on:
- pricing
- mockups
- dielines

Accordion must:
- expand/collapse
- only optionally allow one item open
- animate smoothly
- be accessible

==================================================
DYNAMIC DATA ARCHITECTURE
==================================================

Create:

src/data/mockups.js
src/data/dielines.js
src/data/categories.js
src/data/pricing.js
src/data/faqs.js
src/data/tools.js

All repeated content must come from data arrays.

This is important because backend/API data will replace these arrays later.

==================================================
STATE
==================================================

For this frontend phase use React state/context only where needed.

Manage:
- filters
- search
- sorting
- pagination
- favorites
- menu state

Do not introduce Redux.

You may use URLSearchParams where appropriate so filters can eventually be shareable.

==================================================
COMPONENT ARCHITECTURE
==================================================

Use a scalable folder structure:

src/
  assets/

  components/
    common/
      Button.jsx
      Container.jsx
      SectionHeading.jsx
      Badge.jsx
      SearchInput.jsx
      Pagination.jsx
      Accordion.jsx

    navigation/
      Navbar.jsx
      MegaMenu.jsx
      MobileMenu.jsx

    cards/
      ToolCard.jsx
      CategoryCard.jsx
      MockupCard.jsx
      DielineCard.jsx
      PricingCard.jsx

    filters/
      FilterSidebar.jsx
      FilterGroup.jsx
      SortDropdown.jsx

    home/
      Hero.jsx
      MockupCategories.jsx
      DielineCategories.jsx
      BrandStrip.jsx
      FeatureShowcase.jsx
      FinalCTA.jsx

    layout/
      Footer.jsx
      PageLayout.jsx

  pages/
    HomePage.jsx
    MockupsPage.jsx
    MockupCategoryPage.jsx
    MockupDetailPage.jsx
    DielinesPage.jsx
    DielineCategoryPage.jsx
    DielineDetailPage.jsx
    PricingPage.jsx
    EditorPlaceholderPage.jsx
    LoginPage.jsx
    SignupPage.jsx
    AiCreationPage.jsx
    PackagingLabPage.jsx
    NotFoundPage.jsx

  data/
    mockups.js
    dielines.js
    categories.js
    pricing.js
    faqs.js
    tools.js

  styles/
    tokens.css
    reset.css
    global.css
    navbar.css
    cards.css
    marketplace.css
    pricing.css
    responsive.css

  App.jsx
  main.jsx

==================================================
RESPONSIVE REQUIREMENTS
==================================================

Desktop:
1440px optimized.

Also test:
- 1280px
- 1024px
- 768px
- 390px

Desktop marketplace:
sticky sidebar + multi-column grid.

Tablet:
sidebar can collapse.

Mobile:
filter drawer
mobile menu
1-2 column cards
large touch targets

No horizontal overflow.

==================================================
INTERACTIONS
==================================================

Implement functional:

- navbar dropdowns
- mega menu
- mobile navigation
- search
- category filtering
- multiple filters
- sort
- pagination
- favorites toggle
- FAQ accordions
- billing toggle
- CTA navigation
- category navigation
- product detail navigation
- related item navigation

All buttons must either:
1. work,
2. navigate somewhere,
or
3. visibly be marked "Coming soon".

Do not create dead buttons.

==================================================
ACCESSIBILITY
==================================================

Use:
- semantic HTML
- button elements for interactive controls
- labels for inputs
- keyboard navigation
- aria-expanded for accordions
- visible focus states
- alt text for imagery

==================================================
PERFORMANCE
==================================================

- lazy-load marketplace images
- use route-level lazy loading if reasonable
- avoid unnecessary re-renders
- use CSS for visual effects instead of heavy JS
- keep bundle lean

==================================================
PLACEHOLDER ASSETS
==================================================

Do NOT depend heavily on random Unsplash photos.

Create a coherent placeholder asset strategy.

Use:
- locally generated placeholder cards
- CSS mockups
- simple SVG packaging illustrations
- royalty-free images where appropriate

Keep imagery visually consistent.

Create an assets manifest so images can later be swapped for PackZen production assets.

==================================================
VERY IMPORTANT FUTURE ARCHITECTURE
==================================================

This frontend will later integrate with:

Frontend:
React

3D:
Three.js / React Three Fiber

Backend:
Node.js + Express

Database:
PostgreSQL

Storage:
S3-compatible object storage

Later features:
- real 3D editor
- GLB/GLTF models
- label texture upload
- UV mapping
- materials
- high-resolution export
- accounts
- saved projects
- credit system
- AI features

Therefore:

DO NOT tightly couple marketplace UI with mock data.

Create service abstraction now:

src/services/mockupService.js
src/services/dielineService.js

For now these services return local mock data asynchronously.

Example:

getMockups(filters)
getMockupBySlug(slug)
getDielines(filters)
getDielineBySlug(slug)

Later I should be able to replace these implementations with Express API calls without rewriting page components.

==================================================
EDITOR PLACEHOLDER
==================================================

Create /editor now.

Do NOT implement Three.js.

Create the future editor shell:

Topbar
--------------------------------------------------
Left tools | Main viewport | Right properties
--------------------------------------------------

Left:
- Templates
- Upload
- Materials
- Lighting

Center:
"3D workspace coming next"

Right:
- Transform
- Appearance
- Export settings

Make this route visually polished so the next development phase can insert React Three Fiber directly into the viewport.

==================================================
CODE QUALITY
==================================================

- Functional components only
- Hooks
- Clean prop contracts
- Avoid giant components
- Avoid duplicate CSS
- Avoid inline styles unless necessary
- No unnecessary dependencies
- No Tailwind
- No UI framework
- No backend
- No Three.js yet
- No fake APIs
- No huge monolithic App.jsx

==================================================
IMPLEMENTATION PROCESS
==================================================

Do not generate everything blindly in one giant file.

Work in this order:

1. Inspect current repository.
2. Show me current file structure.
3. Identify anything that should be preserved.
4. Install only necessary dependencies.
5. Create global design tokens.
6. Build routing.
7. Build navigation and footer.
8. Build reusable components.
9. Build homepage.
10. Build mockup marketplace.
11. Build mockup details.
12. Build dieline marketplace.
13. Build dieline details.
14. Build pricing.
15. Build editor placeholder.
16. Add responsive behavior.
17. Run lint/build.
18. Fix every error.
19. Test all routes.
20. Give me a final implementation report.

Do NOT delete existing working code unless necessary.
If replacing something, explain why.

==================================================
VISUAL VALIDATION
==================================================

Continuously compare the implementation against the screenshots I uploaded.

Pay particular attention to:

- section widths
- vertical whitespace
- grid density
- typography sizing
- black border treatment
- purple accent usage
- marketplace card proportions
- sidebar proportions
- pricing card layout
- large light-purple sections
- mega-menu dimensions
- footer density

Do not simply produce a generic SaaS template.

The result should visibly belong to the same category and design language as the supplied references, while clearly being branded as PackZen.

==================================================
FINAL ACCEPTANCE CRITERIA
==================================================

Before finishing, verify:

[ ] npm run dev works
[ ] npm run build succeeds
[ ] no console errors
[ ] every route works
[ ] desktop responsive
[ ] tablet responsive
[ ] mobile responsive
[ ] navbar dropdown works
[ ] mega menu works
[ ] filters work
[ ] search works
[ ] sorting works
[ ] pagination works
[ ] category pages work
[ ] detail pages work
[ ] pricing toggle works
[ ] FAQ works
[ ] no dead CTAs
[ ] no Tailwind
[ ] no 3D yet
[ ] frontend architecture is ready for Express + Three.js later

At the end, provide:

1. Files created
2. Files modified
3. Dependencies added
4. Routes implemented
5. Functional interactions implemented
6. Build status
7. Remaining placeholders
8. Recommended next development phase

Start by inspecting the repository and the screenshots before writing code.