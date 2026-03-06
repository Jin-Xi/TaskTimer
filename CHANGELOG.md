# Changelog

All notable changes to ChronoFlow will be documented in this file.

## [Unreleased]

### Added
- HeroUI v2 component library integration (@heroui/react@^2.8.9)
- Framer Motion for animations (bundled with HeroUI)
- `HeroUIProvider` wrapper in `src/main.tsx`
- HeroUI `Button` component (replaced custom Button.tsx)
- HeroUI `Chip` component (replaced custom Badge.tsx)
- HeroUI `Modal` components (Modal, ModalContent, ModalHeader, ModalBody, ModalFooter)
- HeroUI `Checkbox` component for selection modes
- HeroUI Modal implementations:
  - GuideModal - Onboarding modal
  - TaskList tagging and tag management modals
  - ProjectManager Add Task and Edit Task modals
- AISettingsModalHeroUI.tsx prototype for AI settings

### Changed
- Migrated from custom Button component to HeroUI Button
  - API changes: `disabled` → `isDisabled`, `onClick` → `onPress`, `variant` values
  - Color mapping: primary → `color="success"`, danger → `color="danger"`
- Migrated from custom Badge component to HeroUI Chip
  - Color mapping: green → `success`, ochre → `warning`, terracotta → `danger`
- Updated Tailwind config to include HeroUI content paths
- Updated documentation (CLAUDE.md, README.md) with HeroUI usage guidelines

### Removed
- `src/components/Button.tsx` (backed up to `.backup/Button.tsx.backup`)
- `src/components/Badge.tsx` (backed up to `.backup/Badge.tsx.backup`)

### Fixed
- All 15 unit tests passing with HeroUI components
- TypeScript compilation successful with HeroUI v2 types

## [1.0.0] - 2026-03-06

### Initial Release
- Task timer with milestone tracking
- Project workflow management (WBS)
- AI-powered productivity insights
- Data visualization with Recharts
- Multi-language support (Simplified Chinese, Traditional Chinese)
- Dark mode support
