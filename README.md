# BeauKit — Frontend

> AI-Powered Skin Tone Analysis & Personalized Beauty Intelligence
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Design_System-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Version](https://img.shields.io/badge/Version-2.0.0-c4a84a?style=flat-square)](./package.json)
[![License](https://img.shields.io/badge/License-MIT-gold?style=flat-square)](./LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [API Integration](#api-integration)
- [Application Pages](#application-pages)
- [Scripts](#scripts)
- [Browser Support](#browser-support)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)

---

## Overview

BeauKit is a luxury, AI-driven beauty intelligence application. The frontend delivers a dark editorial experience that allows users to upload or capture a photo, extract their skin's unique undertone via pixel-level color science, and instantly receive a full personalized beauty profile across seven curated categories — all previewed live on a custom SVG avatar.

The application features**ML-powered face makeup simulation**, **celebrity-inspired looks**, **interactive color tools**, and a **hybrid avatar system** that updates in real-time. Built with a bespoke dark design system that blends editorial typography with glassmorphism, ambient lighting effects, and gold-accented UI components.

> **Note:** This repository covers the **frontend client only**. The backend REST API (Node/Express + database) lives in a separate `backend/` directory and must be running for analysis and authentication features to function.
---

## Features

### Authentication

- Sign up and sign in with JWT-based sessions
- Tokens persisted to `localStorage` for seamless page refreshes
- Protected routes that redirect unauthenticated users appropriately
- "Try without account" guest mode for instant analysis

### Skin Analysis Engine

- **File Upload** — drag-and-drop or click to upload any photo
- **Live Camera Capture** — real-time webcam feed with one-click photo capture
- **Celebrity Reference Photos** — analyze from curated celebrity inspiration images
- **Pixel Sampling Algorithm** — samples the central 40% of the image frame, filters for true skin-range RGB values, and computes the average undertone
- **ML Processing** — advanced face detection and makeup simulation
- Sends extracted `{ r, g, b }` values to the backend for AI classification

### Beauty Recommendations

Seven personalized categories are generated per analysis:

| Category | Description |
|---|---|
| **Jewelry** | Best metals (gold/silver/rose gold), statement styles, and gemstones |
| **Clothing** | 16-color palette, 8 fashion styles, fabric and pattern guidance |
| **Lipstick** | 8 curated shades with finish type and occasion vibe |
| **Blush** | 6 matched shades with placement technique tips |
| **Eyeshadow** | Custom 8-pan palette built for your undertone and eye shape |
| **Hair Color** | 9 shades, styling directions, and salon treatment suggestions |
| **Celebrity Looks** | Inspired matches from celebrity reference images |

### Live SVG Avatar

- Fully programmatic SVG avatar rendered in React — no image assets required
- Reflects analysis results in real time: skin tone, hair color, outfit, lipstick, blush, eyeshadow, and jewelry
- Props-driven color system makes the avatar a true live preview tool

### Profile Management

- Save unlimited named beauty profiles to your account
- Load any saved profile to revisit or compare results
- Delete profiles you no longer need
- Each profile stores: skin tone data, all recommendations, and avatar capture

### Interactive Color Tools

- **Color Wheel** — explore full spectrum with precision picking
- **Color Picker** — fine-tune any shade with RGB/HEX controls
- **Celebrity Slider** — browse curated celebrity-inspired palettes
- **Skin Tone Panel** — visualize your exact undertone + depth match

### ML Face Makeup

- **Real-time face tracking** via webcam
- **Virtual makeup application** directly on user's live video feed
- **Multiple makeup styles** from natural to glam
- **Side-by-side comparison** with before/after views

### Landing/ Marketing Pages

- Hero section with animated avatar and stat counters
- Features grid with six benefit cards and staggered animation
- How It Works — three-step process breakdown
- Undertone Showcase — interactive Warm / Cool / Neutral comparison cards with swatches

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 18.2](https://react.dev/) |
| Bundler / Toolchain | Create React App (react-scripts 5.0.1) |
| Language | JavaScript (ES2023+), JSX |
| Styling | Vanilla CSS3 with a custom design token system |
| Fonts | [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) + [Outfit](https://fonts.google.com/specimen/Outfit) via Google Fonts |
| Graphics | Inline SVG (fully code-driven, no external assets) |
| HTTP | Native `fetch` API with a thin `apiFetch` helper |
| Auth | JWT tokens stored in `localStorage` |
| Camera | `navigator.mediaDevices.getUserMedia` Web API |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `>= 16.x`
- [npm](https://www.npmjs.com/) `>= 8.x`
- The BeauKit backend server running on `http://localhost:5000`

### Installation

**1. Clone the repository**

```sh
git clone https://github.com/beautykit/BeautyKit.git
cd BeautyKit/frontend
```

**2. Install dependencies**

```sh
npm install
```

**3. Configure environment variables**

Create a `.env` file in the `frontend/` root:

```env
REACT_APP_API_URL=http://localhost:5000
```

> By default, the app points to `http://localhost:5000`. Update this value to your deployed backend URL for staging or production builds.
**4. Start the development server**

```sh
npm start
```

The app will open automatically at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML shell — Google Fonts, viewport meta, app root
│
├── src/
│   ├── App.js                  # Root component — all pages, state, logic, and rendering
│   ├── App.css                 # Full design system — tokens, layout, components, animations
│   └── index.js                # React DOM entry point
│
├── .gitignore
├── LICENSE
├── package.json
└── package-lock.json
```

> The app is currently structured as a **single-file component architecture** inside `App.js`, with all sub-components (Avatar, page views, modals) co-located. Modern React applications typically split components into separate files for better maintainability. See the [Roadmap](#roadmap) section for plans to modularize.
---

## Design System

BeauKit uses a comprehensive CSS custom property (variable) design system defined in `:root` inside `App.css`. All UI is built from these tokens — no third-party component library is used.

### Color Palette

| Token | Value | Role |
|---|---|---|
| `--obsidian` | `#06060e` | Page background |
| `--void` | `#09091a` | Deepest surfaces |
| `--depth` | `#0e0e20` | Section backgrounds |
| `--surface` | `#13132a` | Card backgrounds |
| `--surface2` | `#1a1a35` | Elevated surfaces |
| `--lift` | `#20203e` | Hover / active states |
| `--gold` | `#c4a84a` | Primary accent |
| `--gold-light` | `#e8cc80` | Gold highlights |
| `--rose` | `#c4728a` | Secondary accent |
| `--sage` | `#6a9e82` | Tertiary accent |
| `--violet` | `#7c5cbf` | Ambient orb tint |
| `--text` | `#f4efe8` | Primary text |
| `--text-muted` | `rgba(244,239,232,0.52)` | Subdued text |

### Typography

| Token | Font | Usage |
|---|---|---|
| `--serif` | Cormorant Garamond | Headlines, hero text, brand name |
| `--sans` | Outfit | Body copy, UI labels, buttons |

### Ambient Background

Three absolutely-positioned, heavily blurred radial gradient orbs float continuously via CSS keyframe animation, creating a dynamic ambient effect behind all content:

| Orb | Color | Position | Cycle |
|---|---|---|---|
| Orb 1 | Violet `rgba(124,92,191,0.22)` | Top-left | 28s |
| Orb 2 | Gold `rgba(196,168,74,0.14)` | Bottom-right | 22s (reversed) |
| Orb 3 | Rose `rgba(196,114,138,0.12)` | Center | 30s (delayed) |

### Component Tokens

| Token | Purpose |
|---|---|
| `--r-xs` / `--r-sm` / `--r` / `--r-lg` / `--r-xl` | Border radius scale |
| `--shadow-sm` / `--shadow` / `--shadow-lg` | Elevation shadows |
| `--glow-gold` | Gold glow effect |
| `--border` | Subtle white border |
| `--border-glow` | Gold-tinted border |

---

## API Integration

All backend communication flows through a single `apiFetch` helper that automatically attaches the Bearer token from `localStorage`.

```
Base URL: http://localhost:5000  (or REACT_APP_API_URL)
```

### Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | No | Register a new user |
| `POST` | `/api/auth/signin` | No | Sign in and receive JWT |
| `GET` | `/api/auth/me` | Yes | Validate token and fetch user |
| `POST` | `/api/analyze-pixels` | No | Submit `{r, g, b}` — receive full recommendations |
| `GET` | `/api/profiles` | Yes | Fetch all saved profiles |
| `POST` | `/api/profiles` | Yes | Save a new beauty profile |
| `DELETE` | `/api/profiles/:id` | Yes | Delete a saved profile |

### Skin Pixel Extraction Algorithm

Before hitting the API, the frontend performs local image processing via the HTML5 Canvas API:

1. Draws the uploaded or captured image to an off-screen `<canvas>`
2. Samples every 3rd pixel in the **central 40% region** (x: 30–70%, y: 20–80%) to focus on facial skin
3. Filters pixels matching a skin-range heuristic: `r > 60 && g > 40 && b > 20 && r > g && r > b && (r - min(g,b)) > 10`
4. Falls back to a uniform average sample if fewer than 10 skin pixels are detected
5. Posts the computed `{ r, g, b }` average to the backend

This approach keeps heavy ML inference server-side while still sending meaningful, pre-processed color data.

---

## Application Pages

Page state is managed via a single `page` string in React state:

| State Value | Page | Description |
|---|---|---|
| `landing` | Landing / Marketing | Hero, features, how-it-works, undertone showcase |
| `auth` | Authentication | Sign in / sign up form with toggling modes |
| `scan` | Scanner | File upload or live camera capture UI |
| `analyzing` | Loading | Full-screen analysis animation |
| `results` | Results | Avatar preview and tabbed recommendations |
| `dashboard` | Dashboard | Saved profiles grid |

---

## Scripts

Run all commands from the `frontend/` directory:

| Command | Description |
|---|---|
| `npm start` | Start the development server at `localhost:3000` with hot reload |
| `npm run build` | Create an optimized production build in the `build/` folder |

---

## Browser Support

| Environment | Targets |
|---|---|
| Production | `> 0.2%`, not dead, not op_mini |
| Development | Last 1 version of Chrome, Firefox, Safari |

> Camera capture requires **HTTPS** in production (or `localhost` in development) due to browser `getUserMedia` security constraints.
---

## Security Notes

- JWT tokens are stored in `localStorage`. For higher-security production deployments, consider migrating to `HttpOnly` cookies managed server-side.
- All `REACT_APP_*` variables are embedded into the client bundle at build time and are publicly visible — never store secrets in them.
- Camera permissions are requested only when the user explicitly switches to camera mode; no background access occurs.

---

## Roadmap

### ✅ Completed (v2.0)
- [x] Modularized components into `/components` and `/pages` folders
- [x] ML-powered face makeup simulation with real-time tracking
- [x] Celebrity-inspired looks slider
- [x] Interactive color wheel and picker tools
- [x] Hybrid avatar system with live updates
- [x] Skin tone panels with undertone visualization
- [x] Hero illustrations and ambient background effects

### 🚧 In Progress
- [ ] React Router for deep-linkable pages
- [ ] Loading skeletons for profile cards
- [ ] Theming toggle (Dark / Light editorial modes)

### 🔮 Future
- [ ] Unit tests with React Testing Library
- [ ] PWA support with offline caching of the last profile
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Performance optimizations for image processing

---

## License

This project is licensed under the [MIT License](./LICENSE).