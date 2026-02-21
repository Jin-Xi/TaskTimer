# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Vite development server with HMR
- `npm run build` - TypeScript type check + production build
- `npm run preview` - Preview production build locally
- `npm run test` - Run Vitest unit tests
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Generate test coverage report
- `npm run server` - Start the Socket.IO sync server (port 3001)

## Architecture Overview

ChronoFlow is a React 19 + TypeScript productivity application with AI-powered task analysis. The architecture follows a three-tier pattern:

### Frontend (React + Vite)
- **Entry Point**: `src/main.tsx` → `src/App.tsx` (main application container)
- **UI Components**: Located in `src/components/`
  - `TaskTimer.tsx` - Main timer interface with milestone tracking
  - `TaskList.tsx` - Task explorer with CRUD operations
  - `ProjectManager.tsx` - Project workflow management with WBS
  - `AIInsights.tsx` - AI productivity coach interface
  - `AIProjectGenerator.tsx` - AI-powered goal decomposition
  - `FullscreenFocus.tsx` - Immersive focus mode overlay
  - `Stats.tsx` - Data visualization with Recharts
  - `GuideModal.tsx` - Onboarding experience

### State & Data Layer
- **Storage Service** (`src/services/storageService.ts`):
  - Primary data persistence using LocalStorage
  - Socket.IO client for real-time sync across tabs/devices
  - CRUD operations for Tasks, Categories, Projects
  - Includes demo data that initializes on first load
  - Key functions: `subscribeToTasks`, `addTask`, `updateTask`, `deleteTask`, etc.

- **AI Service** (`src/services/aiService.ts`):
  - Integrates Google Gemini 3 Flash for productivity analysis
  - Two main functions:
    - `generateProductivityAnalysis` - Analyzes completed tasks, provides score/suggestions
    - `generateProjectPlan` - Decomposes goals into structured WBS projects
  - Uses structured JSON output with Type schemas

- **Type Definitions** (`src/types.ts`):
  - Core types: `Task`, `Project`, `Category`, `Milestone`, `TimeLog`
  - Task statuses: `IDLE`, `RUNNING`, `PAUSED`, `COMPLETED`, `BREAK`
  - Task dependencies via `parentTaskIds` array
  - Milestone system with Git-like branching (main branch + custom branches)

### Backend (Socket.IO Server)
- **Sync Server** (`server/index.js`):
  - Express + Socket.IO server on port 3001
  - Simple file-based DB (`server/db.json`)
  - Broadcasts data changes to connected clients
  - CORS-enabled for development

### Key Architectural Patterns

1. **Subscription Pattern**: The storage service uses `subscribeTo*()` functions that return unsubscribe callbacks. This is how React components stay in sync with data changes.

2. **Task Dependencies**: Projects can define parent-child task relationships. Tasks with `parentTaskIds` cannot be started until all parents are `COMPLETED`. This enforcement happens in `handleStartTask()` in `App.tsx:165-171`.

3. **Milestone System**: Tasks track progress through milestones. Each milestone stores the `taskTime` (total elapsed time at creation), enabling Git-like branching visualization.

4. **Localization**: All UI strings are centralized in `src/constants.ts` under `TRANSLATIONS`. Supports `zh-CN` (Simplified Chinese) and `zh-TW` (Traditional Chinese). The language state is stored in LocalStorage (`chrono_lang`).

5. **Dark Mode**: Implemented via Tailwind's `dark:` classes + document class toggling. Preference stored in `chrono_dark_mode`.

6. **AI Integration**:
   - API keys are **NOT** stored in the UI for security
   - Uses `process.env.API_KEY` (must be set in `.env` as `VITE_API_KEY`)
   - Only sends anonymized data (title, tags, duration) to AI, never raw logs

## Important File Locations

- `src/constants.ts` - Translations, navigation config, default categories
- `src/utils/timeUtils.ts` - Time formatting utilities (`formatTime`, `formatDurationHuman`)
- `vite.config.ts` - Vite + Vitest configuration
- `tailwind.config.js` - Tailwind CSS customization
- `postcss.config.js` - PostCSS with Tailwind + Autoprefixer

## Testing

- Tests are located in `src/tests/`
- Vitest is configured with `globals: true` (no need to import describe/test/expect)
- Test environment: `jsdom`
- Coverage reports use v8 provider
- Run `npm run test:coverage` for detailed coverage metrics

## Environment Variables

Required for AI features:
```env
VITE_API_KEY=your_google_gemini_api_key_here
```

## Deployment Notes

- Build output: `dist/` directory
- Static site deployment (Vercel, Netlify, GitHub Pages supported)
- Source maps enabled in production builds
- Remember to set `VITE_API_KEY` in production environment variables
- For SPA hosting, ensure 404s redirect to `index.html`

## Recent Changes

Based on git history, the project recently underwent:
- Project structure refactoring
- Language setting optimizations
- Enhanced translations and estimated time features
- Improved category management

## Data Flow

1. User interacts with UI component
2. Component calls handler function from `App.tsx`
3. Handler updates data via `storageService` (LocalStorage + Socket emit)
4. Socket server broadcasts update to all clients
5. Subscribed components re-render with new data
6. LocalStorage ensures persistence across sessions
