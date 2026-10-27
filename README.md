# PackZen — 3D Packaging Design Studio, CAD Dieline Generator & Template Marketplace

<div align="center">

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-443e38?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**An end-to-end cloud packaging engineering and creative visualization platform.**  
Create production-accurate CAD dielines, preview 3D box folds in real time, apply brand artwork onto 3D packaging mockups with PBR materials, and export print-ready vector files.

[Features](#-key-features) • [Architecture](#-monorepo-architecture) • [Tech Stack](#-technology-stack) • [Quick Start](#-quick-start--installation) • [API Reference](#-rest-api-reference) • [CAD Dieline Engine](#-cad-dieline-studio--standards)

---

</div>

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Interactive 3D Mockup Studio](#1-interactive-3d-mockup-studio)
  - [2. Parametric CAD Dieline Studio & 3D Fold Simulator](#2-parametric-cad-dieline-studio--3d-fold-simulator)
  - [3. Packaging Template & Mockup Marketplace](#3-packaging-template--mockup-marketplace)
  - [4. Authentication, Security & Password Reset Mailer](#4-authentication-security--password-reset-mailer)
  - [5. Pricing Plans & Commercial Matrix](#5-pricing-plans--commercial-matrix)
- [Monorepo Architecture](#-monorepo-architecture)
- [Technology Stack](#-technology-stack)
- [CAD Dieline Studio & Standards](#-cad-dieline-studio--standards)
  - [Supported Packaging Styles](#supported-packaging-styles)
  - [Engineering Layout & Export Formats](#engineering-layout--export-formats)
- [Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone Repository](#step-1-clone-repository)
  - [Step 2: Install Dependencies](#step-2-install-dependencies)
  - [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
  - [Step 4: Run Application](#step-4-run-application)
- [Demo Account Credentials](#-demo-account-credentials)
- [REST API Reference](#-rest-api-reference)
- [Available Scripts](#-available-scripts)
- [Browser Compatibility & Performance](#-browser-compatibility--performance)
- [Contributing & License](#-contributing--license)

---

## 💡 Overview

**PackZen** bridges the divide between structural packaging engineering and visual brand design. Traditional workflows require complex industrial CAD suites for dielines (such as ArtiosCAD) and separate 3D software (such as Blender or Cinema4D) for marketing renders.

PackZen unifies this workflow in a single browser-native application:
- **For Packaging Engineers & Manufacturers**: Accurately generate 2D flat dieline nets according to FEFCO standards, input custom caliper thicknesses and glue flaps, toggle between metric and imperial units, and export vector **SVG**, **PDF**, **PNG**, and **JSON** files ready for CNC die-cutting tables.
- **For Brand Designers & 3D Artists**: Upload brand artwork, position graphics live onto 3D packaging surfaces with sub-panel precision, adjust PBR material sheen (matte, gloss, metallic, cardboard, paperboard), calibrate multi-source studio lighting, and save project revisions directly in browser storage.
- **For Agencies & Businesses**: Browse a comprehensive catalog of industry-standard packaging forms, share interactive prototypes, and manage user accounts with role-based access.

---

## ✨ Key Features

### 1. Interactive 3D Mockup Studio
*Route: `/editor`, `/editor/:templateId`*
- **Real-Time WebGL Rendering**: Powered by Three.js and React Three Fiber with 60 FPS OrbitControls (rotate, pan, zoom, camera framing).
- **Procedural & Parametric Meshes**: High-detail packaging geometry including realistic mailer boxes with articulated folding flaps, tuck ends, cans, and pouches.
- **Live Texture & Artwork Projection**: Upload brand graphics (`PNG`, `JPEG`, `SVG`); translate, scale, and rotate textures directly onto box surfaces.
- **PBR Surface Materials**: Adjust roughness, metalness, clearcoat, base color swatches, and custom hex palettes to simulate cardboard, kraft paper, gloss laminate, and matte finishes.
- **Studio Lighting & Shadows**: Ambient light intensity, customizable directional key/fill lights, soft contact shadows, and viewport background tones.
- **Browser Persistence**: Save up to 50 packaging projects with artwork snapshots in `localStorage` and restore them instantly.

### 2. Parametric CAD Dieline Studio & 3D Fold Simulator
*Routes: `/dieline` (Gallery) → `/dieline/configure` (Parameters) → `/dieline/editor` (CAD Workspace)*
- **Parametric Net Calculator**: Input exact Length ($L$) × Width ($W$) × Height ($H$) to generate mathematically verified dielines.
- **Bi-Directional Unit Engine**: Live real-time conversions between millimeters (`mm`), centimeters (`cm`), and inches (`in`).
- **Production Tolerances**: Configurable board caliper thickness and custom glue flap width.
- **Interactive 2D Canvas Workspace**:
  - **Red Solid Lines (`#e53e3e`)**: Cutting perimeter edges for die blades.
  - **Blue Dashed Lines (`#3182ce`)**: Crease and score fold lines.
  - **Yellow Perforation Lines (`#d69e2e`)**: Tear-away and perforated flaps.
  - **Interactive Selection**: Click any body panel or flap to view exact dimensions, coordinates, and aspect ratios.
  - **Canvas Utilities**: Mouse-centered zoom, smooth pan, fit-to-view calculation, grid overlay, and dimension callout toggles.
- **Live Synchronized 3D Fold Preview**: Orbit a 3D cardboard representation of the exact 2D dieline to verify structural integrity before fabrication.
- **Multi-Format Exports**:
  - **SVG**: Clean, layered vector paths compatible with Adobe Illustrator, Inkscape, and laser cutters.
  - **PDF**: Print-ready vector document with dimensional margins and legends.
  - **PNG**: High-DPI raster snapshots at $2\times$ magnification.
  - **JSON**: Full structural schema including panel vertices, bounding boxes, and metadata for versioning.

### 3. Packaging Template & Mockup Marketplace
*Routes: `/mockups`, `/mockups/:category`, `/mockups/item/:slug`*
- **70+ Packaging Templates** across 12 distinct categories:
  - Shipping Boxes & Corrugated Cartons
  - Stand-Up Pouches & Sachets
  - Cosmetic Bottles, Jars & Droppers
  - Beverage Cans & Soda Containers
  - Squeeze Tubes
  - Cups & Food Containers
  - Gift Boxes & Rigid Magnetic Boxes
  - Paper Bags & Carrier Sleeves
  - Pizza Cartons & Takeaway Packaging
- **Smart Filtering & Facets**: Instant filtering by category, structural shape, target industry, and Free vs. Premium tiers.
- **Live Search & Sorting**: Search by title or keyword tags with responsive pagination.
- **Template Specification Drawer**: Review technical dimensions, suitable materials, and launch directly into the 3D editor with 1 click.

### 4. Authentication, Security & Password Reset Mailer
*Routes: `/login`, `/signup`, `/forgot-password`, `/reset-password`*
- **JSON Web Token (JWT) Sessions**: Secure, stateless authentication with 7-day token persistence in `localStorage`.
- **Password Security**: Strong hashing using **Bcrypt.js** (10 salt rounds).
- **Automated Password Reset**:
  - Secure cryptographic reset tokens (`crypto.randomBytes(32)`) hashed with SHA-256 and stored with 1-hour expiration.
  - Dispatch via **Nodemailer** with branded responsive HTML email template.
  - Built-in fallback to **Ethereal Email sandbox** for development without requiring external SMTP credentials.
  - Token verification and strength validation on `/reset-password`.
- **One-Click Demo Authentication**: Instantly populate test credentials on the login screen for rapid evaluation.

### 5. Pricing Plans & Commercial Matrix
*Route: `/pricing`*
- **Transparent Tiers**: Free, Pro ($19/mo), and Business ($59/mo) plans.
- **Interactive Billing Switcher**: Monthly vs. Annual toggle with discount badges.
- **Detailed Comparison Matrix**: Side-by-side evaluation across 3D rendering resolution, export formats, cloud storage, and team seats.
- **Interactive FAQ Accordion**: Expandable answers addressing commercial licensing, file formats, and die-cutting guidelines.

---

## 🏗️ Monorepo Architecture

PackZen is organized as a clean, decoupled monorepo managed from the workspace root:

```
Packzen/
├── package.json                   # Root orchestrator (concurrent dev runners)
├── README.md                      # Unified documentation
│
├── backend/                       # Node.js + Express REST API & Auth Service
│   ├── package.json               # Backend dependencies (express, mongoose, bcryptjs, etc.)
│   ├── .env                       # Environment configuration (PORT, MONGO_URI, JWT_SECRET, SMTP)
│   ├── server.js                  # Express bootstrap, MongoDB connection, demo user seeder
│   ├── models/
│   │   └── User.js                # Mongoose schema (roles, bcrypt hashes, reset tokens)
│   ├── routes/
│   │   └── auth.js                # Auth endpoints (register, login, me, reset-password)
│   └── utils/
│       └── mailer.js              # Nodemailer dispatcher with Ethereal development fallback
│
└── frontend/                      # React 19 + Three.js + Vite Web Application
    ├── package.json               # Frontend dependencies & scripts
    ├── vite.config.js             # Vite configuration with React & Tailwind plugins
    ├── index.html                 # Entry point with Google typography & metadata
    └── src/
        ├── main.jsx               # React DOM root with AuthProvider & Router
        ├── App.jsx                # Application routing table & layout shell
        │
        ├── components/
        │   ├── common/            # Accordion, Pagination, Modal primitives
        │   ├── layout/            # PageLayout, Navbar, Footer
        │   ├── cards/             # MockupCard, DielineCard, CategoryCard
        │   ├── filters/           # FilterSidebar, SearchBar, SortDropdown
        │   ├── editor/            # 3D Mockup Studio components:
        │   │   ├── MockupEditor.jsx       # Main 3D studio docking workspace
        │   │   ├── Viewer.jsx             # Three.js Canvas & OrbitControls
        │   │   ├── Scene.jsx              # Scene staging, lighting & camera setup
        │   │   ├── RealisticMailerBox.jsx # Procedural 3D mailer box mesh
        │   │   ├── ArtworkControls.jsx    # Texture upload, scaling & positioning
        │   │   ├── MaterialControls.jsx   # PBR roughness, metallicity & colors
        │   │   ├── LightingControls.jsx   # Studio environment & shadow toggles
        │   │   ├── ObjectControls.jsx     # Mesh panel visibility & transforms
        │   │   └── ProjectsControls.jsx   # LocalStorage project save/load manager
        │   └── dieline/           # CAD Dieline Studio components:
        │       ├── DielineCanvas.jsx      # High-DPI Fabric.js 2D net canvas
        │       ├── Dieline3DPreview.jsx   # Synchronized 3D box fold preview
        │       ├── DielineToolbar.jsx     # Zoom, pan, fit-to-view, grid & export
        │       ├── DielineProperties.jsx  # Parametric dimension & caliper inputs
        │       └── BoxStyleSelector.jsx   # Box style switcher (RSC, Mailer, etc.)
        │
        ├── context/
        │   └── AuthContext.jsx    # Global user session, token sync & logout
        ├── store/
        │   └── useEditorStore.js  # Zustand store for 3D scene, materials & projects
        ├── services/
        │   ├── api.js             # Centralized Axios/fetch API configuration
        │   ├── authService.js     # User registration, login & profile calls
        │   └── mockupService.js   # Mockup catalog query service
        ├── utils/
        │   ├── dielineGeometry.js # Mathematical CAD net layout algorithms
        │   └── dielineExport.js   # Vector SVG, PDF, PNG, and JSON export engines
        ├── data/
        │   ├── dielineTemplates.js# FEFCO and standard packaging templates
        │   ├── mockups.js         # Mockup catalog dataset (70+ items)
        │   ├── categories.js      # Category taxonomy & color swatches
        │   ├── pricing.js         # Subscription tiers & comparison matrix
        │   └── faqs.js            # Frequently asked questions
        ├── pages/
        │   ├── HomePage.jsx             # Landing page with interactive showcases
        │   ├── TemplateGallery.jsx      # Packaging marketplace & filters
        │   ├── DetailPage.jsx           # Mockup technical detail view
        │   ├── DielineTemplatesPage.jsx # Dieline template gallery
        │   ├── DielineConfigurePage.jsx # Parametric dimension configurator
        │   ├── DielineStudio.jsx        # CAD dieline editor (2D + 3D)
        │   ├── PricingPage.jsx          # Plans, pricing & feature comparison
        │   ├── LoginPage.jsx            # Sign In / Sign Up / Forgot Password
        │   ├── ResetPasswordPage.jsx    # Tokenized password reset form
        │   └── PlaceholderPage.jsx      # Dynamic fallback & 3D editor mount
        └── styles/
            ├── index.css          # Tailwind CSS v4 directives & font imports
            ├── tokens.css         # CSS design tokens (colors, elevation, radii)
            ├── global.css         # Typography, button primitives, layout rules
            └── MockupEditor.css   # Studio docking panels & controls styling
```

---

## 💻 Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `v19.x` | Modern reactive component architecture & hooks |
| **Build Tooling** | **Vite** | `v6.x` | Blazing-fast development server with instant HMR |
| **Client Routing** | **React Router DOM** | `v7.x` | SPA route handling, parameter parsing & nested layouts |
| **3D Graphics Engine** | **Three.js** | `r186` | WebGL rendering, mesh matrices, geometry generation |
| **React 3D Bridge** | **@react-three/fiber** | `v9.8` | Declarative Three.js scene graph inside React |
| **3D Helpers** | **@react-three/drei** | `v10.7` | OrbitControls, ContactShadows, Environment maps |
| **2D CAD Engine** | **Fabric.js** & Canvas API | `v5.5` | High-DPI interactive 2D canvas, panel selection, vectors |
| **State Management** | **Zustand** | `v5.0` | 3D scene store, artwork transforms, project persistence |
| **Styling** | **Tailwind CSS** | `v4.3` | Utility-first styling with modern Vite engine |
| **Iconography** | **Lucide React** | `Latest` | Consistent vector iconography for CAD toolbars & menus |
| **Micro-Delights** | **Canvas Confetti** | `v1.9` | Particle animations upon successful signups |
| **Backend Server** | **Node.js** (ESM) | `v18+` | Server runtime with native ES modules |
| **API Framework** | **Express.js** | `v4.21` | REST routing, JSON parsing, and CORS middleware |
| **Database** | **MongoDB** | `v6+` | Flexible document database for user profiles & accounts |
| **ODM** | **Mongoose** | `v9.11` | Schemas, indexing, pre-save hooks, connection lifecycle |
| **Security & Passwords** | **Bcrypt.js** | `v3.0` | Salt generation and one-way password hashing (10 rounds) |
| **Authentication** | **JSON Web Tokens** | `v9.0` | Signed Bearer tokens for secure authenticated sessions |
| **Email Service** | **Nodemailer** | `v10.2` | Password reset emails with Ethereal development sandbox |
| **Process Orchestration**| **Concurrently** | `v9.1` | Simultaneous frontend & backend execution from root |

---

## 📐 CAD Dieline Studio & Standards

PackZen includes a purpose-built parametric dieline calculation engine located in `frontend/src/utils/dielineGeometry.js`.

### Supported Packaging Styles

| Style ID | Name | Classification | Standard Dimensions (mm) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `shipping-box` | **Regular Slotted Carton (RSC)** | FEFCO 0201 | $300 \times 200 \times 150$ | Standard 4-flap corrugated shipping carton with glue tab |
| `folding-carton`| **Folding Carton** | Retail Tuck | $120 \times 80 \times 40$ | Retail paperboard carton with top/bottom tuck closures |
| `mailer-box` | **Mailer Box** | Self-Locking | $300 \times 200 \times 100$ | E-commerce mailer with rollover hinged lid & locking ears |
| `custom-box` | **Custom Rectangular Net**| Custom | $200 \times 150 \times 100$ | Fully configurable parametric box net with custom flaps |

### Engineering Layout & Export Formats

```
      +-----------+                  Fold Line (Blue Dashed): -- -- -- --
      | Top Flap  |                  Cut Line  (Red Solid)  : ------------
+-----+-----------+-----+-----------+
|Glue |   Panel   |Side |   Panel   |
|Tab  |     1     |  1  |     2     |  <-- Horizontal Net Arrangement
+-----+-----------+-----+-----------+
      | Btm Flap  |
      +-----------+
```

- **Mathematical Net Calculation**:
  - Automatically calculates total bounding box width: $W_{\text{total}} = 2 \times (L + W) + \text{GlueFlap} + 2 \times \text{Margin}$.
  - Computes folding flap offsets based on material caliper thickness.
  - Generates synchronized line segments categorized as `cut` (perimeter), `fold` (scores), or `perf` (perforations).
- **Export Specifications**:
  - **SVG (`.svg`)**: Proper `<defs>`, stroke styles (`stroke-width`, `stroke-dasharray`), and layer groups (`<g class="cut-lines">`, `<g class="fold-lines">`).
  - **PDF (`.pdf`)**: Formatted for standard ISO paper sizes (A4/A3) or custom bounding dimensions with dimensional legends.
  - **JSON (`.json`)**: Full mathematical description of panels, coordinates, bounding box, units, and timestamps.
  - **PNG (`.png`)**: High-resolution raster export rendered at $2\times$ pixel ratio for pitch decks and documentation.

---

## 🚀 Quick Start & Installation

### Prerequisites

Make sure the following tools are installed on your machine:
- **Node.js**: `v18.0.0` or higher (`node -v`)
- **npm**: `v9.0.0` or higher (`npm -v`)
- **MongoDB**: A local instance running on `mongodb://127.0.0.1:27017` or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

---

### Step 1: Clone Repository

```bash
git clone https://github.com/Vivek7804/Packzen.git
cd Packzen
```

---

### Step 2: Install Dependencies

Install all dependencies across the root workspace, backend, and frontend:

```bash
# 1. Install root workspace tools (concurrently)
npm install

# 2. Install backend dependencies
cd backend && npm install

# 3. Install frontend dependencies
cd ../frontend && npm install

# 4. Return to root
cd ..
```

---

### Step 3: Configure Environment Variables

#### Backend Configuration (`backend/.env`)

Create or edit `backend/.env`:

```env
# Server Port
PORT=5050

# MongoDB Connection String (Local or Atlas)
MONGO_URI=mongodb://127.0.0.1:27017/packzen

# JSON Web Token Secret
JWT_SECRET=packzen_super_secret_jwt_key_2026

# Allowed Client Origin
FRONTEND_URL=http://localhost:5173

# Optional: Real SMTP Configuration for Password Reset Emails
# If omitted, PackZen automatically uses the Ethereal sandbox with terminal links.
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password
```

#### Frontend Configuration (`frontend/.env`)

Create or edit `frontend/.env`:

```env
# Backend API Base URL
VITE_API_URL=http://localhost:5050
```

---

### Step 4: Run Application

Start both the frontend and backend servers simultaneously with a single root command:

```bash
npm run dev
```

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:5173](http://localhost:5173) | Vite dev server with Hot Module Replacement |
| **Backend REST API** | [http://localhost:5050](http://localhost:5050) | Express server with live file watcher |
| **API Health Check** | [http://localhost:5050/](http://localhost:5050/) | JSON endpoint verifying MongoDB status |

---

## 🔑 Demo Account Credentials

PackZen includes an automatic database seeder. Whenever the backend connects to MongoDB, it verifies or seeds a ready-to-use demo designer account:

| Field | Demo Value |
| :--- | :--- |
| **Email** | `demo@packzen.dev` |
| **Password** | `packzen123` |
| **Role** | Art Director / Packaging Designer |
| **Company** | PackZen Studio |

> 💡 **Tip**: On the `/login` screen, click the **"Auto-fill Demo Credentials"** button to instantly authenticate without typing.

---

## 📡 REST API Reference

All backend routes are served relative to `http://localhost:5050`.

### Health & Mockups

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Health check, server uptime & MongoDB connection status | No |
| `GET` | `/api/mockups` | Retrieve packaging mockup catalog items | No |

### Authentication & Account (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Create a new user account | No | `{ name, email, password, company }` |
| `POST` | `/api/auth/login` | Authenticate credentials & return JWT | No | `{ email, password }` |
| `GET` | `/api/auth/me` | Fetch active authenticated user profile | Yes (`Bearer <token>`) | *None* |
| `POST` | `/api/auth/forgot-password` | Generate reset token & trigger email | No | `{ email }` |
| `POST` | `/api/auth/verify-reset-token`| Validate password reset token validity | No | `{ token }` |
| `POST` | `/api/auth/reset-password` | Set new password using verified token | No | `{ token, password }` |
| `PUT` | `/api/auth/update-profile` | Update user name, company, or avatar | Yes (`Bearer <token>`) | `{ name, company, avatar }` |
| `POST` | `/api/auth/change-password`| Update password with current password | Yes (`Bearer <token>`) | `{ currentPassword, newPassword }` |

---

## 📜 Available Scripts

### Workspace Root (`/`)

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs both frontend and backend concurrently via `concurrently` |
| `npm run dev:frontend` | Starts only the Vite frontend development server |
| `npm run start:backend` | Starts only the Express backend with Node.js |

### Frontend Directory (`frontend/`)

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server on `http://localhost:5173` |
| `npm run build` | Compiles production assets into `frontend/dist/` |
| `npm run preview` | Locally serves the production build for testing |

### Backend Directory (`backend/`)

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Express server with `node --watch server.js` |
| `npm start` | Starts Express server in production mode |

---

## 🌐 Browser Compatibility & Performance

- **Supported Browsers**: Google Chrome (recommended for WebGL performance), Microsoft Edge, Mozilla Firefox, Apple Safari 16+.
- **Graphics Acceleration**: Requires WebGL 2.0 support for real-time 3D rendering and shadow maps.
- **Canvas Rendering**: Uses high-DPI scaling (`window.devicePixelRatio`) with hardware acceleration for smooth 60 FPS panning and zooming on 4K screens.
- **Bundle Optimization**: Built with Vite and Rollup code-splitting to ensure fast initial page loads.

---

## 🤝 Contributing & License

Contributions, bug reports, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
<sub>Crafted with precision for packaging designers and structural engineers worldwide.</sub>
</div>
