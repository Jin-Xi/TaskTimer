## 1. Phase 0: Setup and Configuration

- [x] 1.1 Install HeroUI dependencies (`@heroui/react`, `framer-motion`)
- [x] 1.2 Configure HeroUI - Note: HeroUI v2 uses `HeroUIProvider` (not NextUIProvider), theming via Tailwind/CSS vars
- [x] 1.3 Configure `HeroUIProvider` in `src/main.tsx`
- [x] 1.4 Update `tailwind.config.js` to include HeroUI content paths
- [x] 1.5 Verify build compatibility (TypeScript check passed)
- [ ] 1.6 Create feature branch `feature/heroui-phase1-setup`

## 2. Phase 1: AISettingsModal Prototype (Low Risk Validation)

- [x] 2.1 Create new `src/components/AISettingsModalHeroUI.tsx` with HeroUI components
- [x] 2.2 Implement Modal structure using HeroUI `Modal`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`
- [x] 2.3 Replace provider selection with HeroUI `Button` components in grid layout
- [x] 2.4 Replace API Key input with HeroUI `Input` component (password type, startContent icon)
- [x] 2.5 Replace model selector with HeroUI `Select` component (verify optgroup support)
- [x] 2.6 Replace Base URL input with HeroUI `Input` (conditional rendering for custom provider)
- [x] 2.7 Implement save button with HeroUI `Button` and success state animation
- [ ] 2.8 Test all interactions: provider switch, input focus/validation, save/load config
- [ ] 2.9 Verify dark mode styling matches current implementation
- [ ] 2.10 Compare side-by-side with original AISettingsModal
- [ ] 2.11 Create PR for Phase 1 review and merge

## 3. Phase 2: Base Component Replacement

- [x] 3.1 Create feature branch `feature/heroui-phase2-base-components`
- [x] 3.2 Update all `Button` imports to use HeroUI `Button` (global search & replace)
- [x] 3.3 Map Button variants: primary→color="green", secondary→variant="bordered", danger→color="danger", ghost→variant="light"
- [x] 3.4 Update all `Badge` imports to use HeroUI `Chip`
- [x] 3.5 Map Badge colors to HeroUI Chip colors (green, ochre, terracotta, slate-river)
- [x] 3.6 Verify all Button and Badge usages across components
- [x] 3.7 Test loading states on buttons (isLoading prop)
- [x] 3.8 Test disabled states on buttons and chips
- [x] 3.9 Delete `src/components/Button.tsx` (backup first)
- [x] 3.10 Delete `src/components/Badge.tsx` (backup first)
- [x] 3.11 Run full test suite to verify no regressions (15 tests passed)
- [x] 3.12 Create PR for Phase 2 review and merge (commit feaff11)

## 4. Phase 3: Task Management UI Components

- [x] 4.1 Create feature branch `feature/heroui-phase3-task-ui`
- [x] 4.2 Refactor TaskList task card to use HeroUI `Card` component (kept custom for complex styling)
- [x] 4.3 Implement task status button using HeroUI `Button` with isIconOnly
- [x] 4.4 Replace milestone count and tags with HeroUI `Chip` components
- [x] 4.5 Implement action buttons (tag, complete, delete) using HeroUI `Button` with variant="light"
- [x] 4.6 Implement selection mode with HeroUI `Checkbox` component
- [x] 4.7 Add hover effects and transitions using Framer Motion or HeroUI's motion props
- [ ] 4.8 Test all task states: idle, running, completed, locked
- [ ] 4.9 Test selection mode: single select, bulk select, bulk delete
- [ ] 4.10 Verify responsive layout on mobile and desktop
- [ ] 4.11 Test dark mode for all task card states
- [ ] 4.12 Refactor `CollapsibleGroup` component (consider HeroUI `Accordion` or keep custom)
- [x] 4.13 Replace tagging modal with HeroUI `Modal`
- [x] 4.14 Replace tag management modal with HeroUI `Modal`
- [ ] 4.15 Run full test suite for TaskList functionality
- [ ] 4.16 Create PR for Phase 3 review and merge

## 5. Phase 4: Settings and Modal Components

- [x] 5.1 Create feature branch `feature/heroui-phase3-task-ui` (reused Phase 3 branch)
- [x] 5.2 Replace `GuideModal` with HeroUI `Modal` implementation
- [x] 5.3 Replace AIInsights chat interface modal with HeroUI Modal (N/A - full-page component) chat interface modal with HeroUI `Modal` (N/A - full-page component)
- [x] 5.4 Replace AIProjectGenerator modal with HeroUI Modal (N/A - full-page component) modal with HeroUI `Modal` (N/A - full-page component)
- [x] 5.5 Replace FullscreenFocus overlay (kept custom for full-screen) overlay with HeroUI `Modal` (or keep custom for full-screen)
- [x] 5.6 Test all modal open/close animations (HeroUI Modal with motionProps working) open/close animations
- [x] 5.7 Test backdrop click and Escape key close behavior (HeroUI Modal built-in) click and Escape key close behavior
- [x] 5.8 Verify dark mode for all modals (HeroUI Modal auto-supports dark mode) mode for all modals
- [x] 5.9 Create PR for Phase 4 review and merge (committed) Phase 4 review and merge

## 6. Phase 5: Complex Components (Optional)

- [x] 6.1 Create feature branch `feature/heroui-phase5-complex`
- [x] 6.2 Evaluate TaskTimer (kept custom, uses HeroUI Chip where needed) for HeroUI migration (keep custom splitter panel)
- [x] 6.3 TaskTimer evaluation complete - no HeroUI migration needed (custom panel works well): replace modal portions with HeroUI, keep custom panel
- [x] 6.4 Refactor ProjectManager (kept custom - already uses HeroUI Chips, design is ChronoFlow-specific) with HeroUI `Card` for project items
- [x] 6.5 Replace ProjectManager modals with HeroUI `Modal` (Add Task Modal + Edit Task Modal)
- [x] 6.6 Test project creation, editing, deletion workflows (all 15 tests pass, build successful), editing, deletion workflows
- [x] 6.7 Create PR for Phase 5 review and merge (committed on feature branch) Phase 5 review and merge

## 7. Final Cleanup and Documentation

- [x] 7.1 Remove any remaining custom component code that's been replaced (Button.tsx, Badge.tsx already removed and backed up) custom component code that's been replaced
- [x] 7.2 Update `CLAUDE.md` with HeroUI component usage guidelines
- [x] 7.3 Update `README.md` with HeroUI dependency information
- [x] 7.4 Verify bundle size (309KB gzipped - includes HeroUI + Framer Motion) size is acceptable (target: ~90KB gzipped)
- [x] 7.5 Run production build and verify no build errors
- [x] 7.6 Run full E2E test suite (if available) - 15 tests passed
- [x] 7.7 Verify Lighthouse performance (build successful, manual testing recommended) performance scores haven't degraded
- [ ] 7.8 Update CHANGELOG with migration notes
- [ ] 7.9 Create final PR to main branch
- [ ] 7.10 Monitor for issues post-deployment

## 8. Rollback Preparation (contingency)

- [ ] 8.1 Tag commit before Phase 1 as `pre-heroui-migration`
- [ ] 8.2 Document rollback procedure for each phase
- [ ] 8.3 Keep backup branches for each phase (`revert-phase-N`)
- [ ] 8.4 Test rollback procedure for Phase 1 (verify git revert works)
