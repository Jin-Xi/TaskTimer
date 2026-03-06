## ADDED Requirements

### Requirement: HeroUI dependency installation
The system SHALL install `@nextui-org/react` and its peer dependencies as project dependencies.

#### Scenario: Install HeroUI packages
- **WHEN** developer runs `npm install @nextui-org/react framer-motion`
- **THEN** packages are added to `package.json` dependencies
- **AND** `node_modules` contains the installed packages

### Requirement: HeroUI theme configuration
The system SHALL provide a HeroUI theme configuration that extends the default theme with ChronoFlow brand colors.

#### Scenario: Theme file exists
- **WHEN** system starts
- **THEN** `src/theme.ts` file exists with `chronoFlowTheme` configuration
- **AND** theme includes green, ochre, terracotta, and slate-river color definitions

#### Scenario: Theme color mapping
- **WHEN** HeroUI components use `color="green"`
- **THEN** component renders using ChronoFlow green-400 (#84B179)
- **AND** dark mode uses green-700 (#366032) for text

### Requirement: NextUIProvider integration
The system SHALL wrap the application root component with NextUIProvider to enable HeroUI components.

#### Scenario: App uses NextUIProvider
- **WHEN** App.tsx renders
- **THEN** NextUIProvider wraps the entire component tree
- **AND** theme prop is set to `chronoFlowTheme`

### Requirement: Tailwind CSS configuration compatibility
The system SHALL maintain compatibility between existing Tailwind configuration and HeroUI requirements.

#### Scenario: Tailwind config includes HeroUI
- **WHEN** Tailwind builds CSS
- **THEN** `tailwind.config.js` includes HeroUI content paths
- **AND** existing ChronoFlow custom colors are preserved

### Requirement: Dark mode support
The system SHALL support dark mode using HeroUI's built-in dark mode system.

#### Scenario: Dark mode toggle
- **WHEN** user toggles dark mode
- **THEN** HeroUI components automatically switch to dark theme
- **AND** no manual `dark:` className overrides are required for basic components

#### Scenario: Custom component dark mode
- **WHEN** custom components need dark mode styling
- **THEN** developer can use `dark:` Tailwind classes
- **AND** HeroUI theme provides CSS variables for dark colors

### Requirement: Icon library compatibility
The system SHALL continue using Lucide React icons without conflicts with HeroUI.

#### Scenario: Lucide icons work with HeroUI components
- **WHEN** Lucide icons are used as children of HeroUI components
- **THEN** icons render correctly
- **AND** no size or alignment issues occur

### Requirement: Bundle size optimization
The system SHALL use tree-shaking to only import used HeroUI components.

#### Scenario: Tree-shaking works
- **WHEN** production build is created
- **THEN** unused HeroUI components are excluded from bundle
- **AND** bundle size increase is limited to ~40KB gzipped
