# HeroUI Migration Rollback Guide

This document describes how to rollback the HeroUI migration if needed.

## Pre-Migration Baseline

**Tag:** `pre-heroui-migration` (can be created from commit `d0c7f26` or similar)
**Date:** Before HeroUI migration began
**Branch:** `glm实验性分支` (or equivalent)

## Rollback Procedure

### Quick Rollback (Git Revert)

If you need to rollback the entire HeroUI migration:

```bash
# 1. Checkout the pre-migration commit
git checkout d0c7f26  # or use the tagged commit

# 2. Create a rollback branch
git checkout -b rollback/heroui-migration

# 3. Push the rollback branch
git push origin rollback/heroui-migration
```

### Selective Rollback by Phase

If you need to rollback specific phases:

#### Rollback Phase 5 (ProjectManager Modals)
```bash
git revert 928c97e..HEAD  # Revert from Phase 5 completion
```

#### Rollback Phase 4 (GuideModal)
```bash
git revert 64ca0f8  # Revert Phase 4 commit
```

#### Rollback Phase 3 (TaskList)
```bash
git revert 5d7c16e  # Revert Phase 3 commit
```

#### Rollback Phase 2 (Base Components)
```bash
# Restore Button.tsx and Badge.tsx from backup
cp .backup/Button.tsx.backup src/components/Button.tsx
cp .backup/Badge.tsx.backup src/components/Badge.tsx

# Update imports back to custom components
git checkout HEAD~1 -- src/components/
```

## Backup Files

The following files have been backed up before deletion:
- `.backup/Button.tsx.backup` - Original Button component
- `.backup/Badge.tsx.backup` - Original Badge component

## Migration Commits Reference

- `5d7c16e` - Phase 3: Task Management UI Components
- `64ca0f8` - Phase 4: Settings and Modal Components
- `2d33a93` - Phase 4 & 5: Documentation and ProjectManager modals
- `928c97e` - docs: Update task progress

## Dependencies to Remove (if needed)

If completely removing HeroUI:

```bash
npm uninstall @heroui/react framer-motion
```

Then restore:
- `src/main.tsx` - Remove HeroUIProvider wrapper
- `tailwind.config.js` - Remove HeroUI content paths
- `src/components/Button.tsx` - Restore from backup
- `src/components/Badge.tsx` - Restore from backup

## Testing After Rollback

After any rollback, verify:
1. All 15 unit tests pass: `npm run test`
2. Production build succeeds: `npm run build`
3. UI renders correctly in both light and dark modes
4. All component interactions work as expected
