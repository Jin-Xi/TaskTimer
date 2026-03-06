# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Vite development server with HMR
- `npm run build` - TypeScript type check + production build
- `npm run preview` - Preview production build locally
- `npm run test` - Run Vitest unit tests
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Generate test coverage report

## Architecture Overview

ChronoFlow is a React 19 + TypeScript productivity application with AI-powered task analysis. The architecture follows a client-side pattern with LocalStorage persistence.

### Frontend (React + Vite)
- **Entry Point**: `src/main.tsx` → `src/App.tsx` (main application container)
- **UI Framework**: HeroUI v2 (`@heroui/react`) - Modern React component library with built-in animations
- **UI Components**: Located in `src/components/`
  - `TaskTimer.tsx` - Main timer interface with milestone tracking
  - `TaskList.tsx` - Task explorer with CRUD operations
  - `ProjectManager.tsx` - Project workflow management with WBS
  - `AIInsights.tsx` - AI productivity coach interface
  - `AIProjectGenerator.tsx` - AI-powered goal decomposition
  - `FullscreenFocus.tsx` - Immersive focus mode overlay
  - `Stats.tsx` - Data visualization with Recharts
  - `GuideModal.tsx` - Onboarding experience
  - `AISettingsModal.tsx` - AI provider configuration

### State & Data Layer
- **Storage Service** (`src/services/storageService.ts`):
  - Primary data persistence using LocalStorage
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

## HeroUI Component Usage

This project uses HeroUI v2 as the primary UI component library. Key patterns:

### Button Component

```tsx
import { Button } from '@heroui/react';

// Basic button with color
<Button color="primary" onPress={handleClick}>
  Click me
</Button>

// With variants and states
<Button
  variant="solid"          // solid, bordered, flat, light, ghost, faded
  color="success"          // default, primary, secondary, success, warning, danger
  isDisabled={false}
  isLoading={loading}
  size="lg"                // sm, md, lg
  className="rounded-2xl"
>
  Save
</Button>

// Icon-only button
<Button isIconOnly variant="light" onPress={handleClose}>
  <X className="w-5 h-5" />
</Button>
```

### Chip Component (replaces Badge)

```tsx
import { Chip } from '@heroui/react';

// Color mapping for ChronoFlow tags:
// green (chronoflow) → success
// ochre → warning
// terracotta → danger
// slate-river → default

<Chip
  color="success"
  variant="flat"
  className="rounded-2xl"
>
  {tagName}
</Chip>
```

### Modal Component

```tsx
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  size="2xl"               // sm, md, lg, xl, 2xl, 5xl, full
  classNames={{
    wrapper: "bg-neutral-950/70 backdrop-blur-sm z-[100]",
    base: "rounded-[3rem] shadow-2xl border overflow-hidden",
    backdrop: "bg-gradient-to-b from-neutral-950/60 to-neutral-950/80",
  }}
  motionProps={{
    variants: {
      enter: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
      exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
    }
  }}
>
  <ModalContent className="bg-white dark:bg-neutral-900">
    <ModalHeader className="flex-col pt-10">
      <h2>Title</h2>
    </ModalHeader>
    <ModalBody>
      Content here
    </ModalBody>
    <ModalFooter>
      <Button variant="light" onPress={onClose}>Cancel</Button>
      <Button color="primary" onPress={handleSave}>Save</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Checkbox Component

```tsx
import { Checkbox } from '@heroui/react';

<Checkbox
  isSelected={checked}
  onValueChange={setChecked}
  color="success"
  classNames={{
    wrapper: "rounded-md",
  }}
>
  Label text
</Checkbox>
```

### Important API Differences

- Button uses `onPress` instead of `onClick` (though `onClick` works too)
- Button uses `isDisabled` instead of `disabled`
- Button uses `isLoading` instead of `loading`
- Chip uses `color` with HeroUI color names, not custom colors
- Modal uses `isOpen` instead of `open`
- Modal children are organized into `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`
- HeroUI v2 uses `HeroUIProvider` (not `NextUIProvider` which was deprecated)

### Color Mapping (Custom → HeroUI)

| ChronoFlow Color | HeroUI Color | Usage |
|-----------------|--------------|-------|
| green | success | Primary actions, success states |
| ochre | warning | Warning states, moderate priority |
| terracotta | danger | Destructive actions, errors |
| slate-river | default | Neutral, informational |

### Helper Function for Tag Colors

```tsx
const getChipColor = (tagName: string): 'success' | 'warning' | 'danger' | 'default' => {
  const category = categories.find(c => c.name === tagName);
  if (!category) return 'default';

  const color = category.color;
  if (color === 'green') return 'success';
  if (color === 'ochre') return 'warning';
  if (color === 'terracotta') return 'danger';
  return 'default';
};
```

## Important File Locations

- `src/constants.ts` - Translations, navigation config, default categories
- `src/utils/timeUtils.ts` - Time formatting utilities (`formatTime`, `formatDurationHuman`)
- `vite.config.ts` - Vite + Vitest configuration
- `tailwind.config.js` - Tailwind CSS customization (includes HeroUI content paths)
- `postcss.config.js` - PostCSS with Tailwind + Autoprefixer
- `src/main.tsx` - HeroUIProvider wrapper configuration

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

- Build output: `dist/` directory (target: ~90KB gzipped)
- Static site deployment (Vercel, Netlify, GitHub Pages supported)
- Source maps enabled in production builds
- Remember to set `VITE_API_KEY` in production environment variables
- For SPA hosting, ensure 404s redirect to `index.html`
- **HeroUI Bundle**: @heroui/react@^2.8.9 includes Framer Motion for animations

## Recent Changes

Based on git history, the project recently underwent:
- HeroUI v2 migration (Phases 0-4 completed)
  - Phase 0: Setup and configuration
  - Phase 1: AISettingsModal prototype (AISettingsModalHeroUI.tsx)
  - Phase 2: Base component replacement (Button → HeroUI Button, Badge → HeroUI Chip)
  - Phase 3: TaskList UI enhancements with HeroUI components
  - Phase 4: GuideModal migrated to HeroUI Modal
- Project structure refactoring
- Language setting optimizations
- Enhanced translations and estimated time features
- Improved category management
- Removed Socket.IO sync server (now pure client-side LocalStorage)
- Deprecated custom Button and Badge components (replaced with HeroUI)

## Data Flow

1. User interacts with UI component
2. Component calls handler function from `App.tsx`
3. Handler updates data via `storageService` (LocalStorage)
4. Storage service emits update event
5. Subscribed components re-render with new data
6. LocalStorage ensures persistence across sessions

# 行为规范
- 你可以随时使用 npm run dev 启动服务来验证你的修改。但是，在你完成任务并向我输出最终结果之前，你必须终止该开发服务器的进程。绝对不能让它在后台持续运行。
