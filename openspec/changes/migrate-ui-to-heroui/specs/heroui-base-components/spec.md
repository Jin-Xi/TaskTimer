## ADDED Requirements

### Requirement: Button component replacement
The system SHALL replace the custom Button component with HeroUI Button component while maintaining all existing functionality.

#### Scenario: Button variants mapping
- **WHEN** code uses `<Button variant="primary">`
- **THEN** HeroUI Button renders with `color="green"` style
- **AND** component appearance matches current primary button style

#### Scenario: Secondary button
- **WHEN** code uses `<Button variant="secondary">`
- **THEN** HeroUI Button renders with `variant="bordered"` style
- **AND** colors match current secondary button (neutral border, white/neutral-900 background)

#### Scenario: Danger button
- **WHEN** code uses `<Button variant="danger">`
- **THEN** HeroUI Button renders with `color="danger"` mapped to terracotta-400
- **AND** hover state uses terracotta-500

#### Scenario: Ghost button
- **WHEN** code uses `<Button variant="ghost">`
- **THEN** HeroUI Button renders with `variant="light"` style
- **AND** background is transparent with hover neutral-100

#### Scenario: Button sizes
- **WHEN** code uses `<Button size="sm">`
- **THEN** HeroUI Button uses `size="sm"` with appropriate padding
- **AND** text size is `text-xs`

#### Scenario: Loading state
- **WHEN** code uses `<Button isLoading={true}>`
- **THEN** HeroUI Button shows loading spinner
- **AND** button is disabled during loading
- **AND** loading animation matches current implementation

#### Scenario: Disabled state
- **WHEN** button has `disabled={true}` prop
- **THEN** button has `opacity-50` and `cursor-not-allowed`
- **AND** button cannot be clicked

### Requirement: Badge to Chip migration
The system SHALL replace the custom Badge component with HeroUI Chip component.

#### Scenario: Chip color mapping
- **WHEN** code uses `<Badge color="green">`
- **THEN** HeroUI Chip uses `color="success"` mapped to ChronoFlow green
- **AND** background uses green-100, text uses green-700

#### Scenario: Custom color chips
- **WHEN** code uses `<Badge color="ochre">`
- **THEN** HeroUI Chip renders with custom `color` style
- **AND** uses ochre-100 background and ochre-700 text

#### Scenario: Clickable badges
- **WHEN** Badge has `onClick` prop
- **THEN** HeroUI Chip is pressable
- **AND** visual feedback (brightness/scale) occurs on hover and active

#### Scenario: Badge content
- **WHEN** Badge contains children text
- **THEN** HeroUI Chip displays same content
- **AND** text is `text-xs font-bold uppercase tracking-widest`

### Requirement: Input component replacement
The system SHALL use HeroUI Input component for text input fields.

#### Scenario: Basic input
- **WHEN** input renders
- **THEN** HeroUI Input has `border-2 border-neutral-100` style
- **AND** `rounded-xl` corner radius
- **AND** focus state shows green-500 border with ring effect

#### Scenario: Input with icon
- **WHEN** input has `startContent` with icon
- **THEN** icon is positioned on left side
- **AND** icon is `text-neutral-300` color
- **AND** icon spacing is `pl-4`

#### Scenario: Password input
- **WHEN** input type is "password"
- **THEN** HeroUI Input masks the text
- **AND** placeholder shows appropriate text

#### Scenario: Input validation state
- **WHEN** input has validation error
- **THEN** border color changes to terracotta-400
- **AND** error message displays below input

### Requirement: Select component replacement
The system SHALL use HeroUI Select component for dropdown selections.

#### Scenario: Select with options
- **WHEN** Select renders with options
- **THEN** dropdown shows on click
- **AND** each option displays correctly
- **AND** selected value is displayed in trigger

#### Scenario: Select with optgroups
- **WHEN** AI model Select needs grouped options
- **THEN** HeroUI Select displays option groups
- **AND** group headers are visually distinct
- **AND** models are nested under their respective group names

#### Scenario: Select with icon
- **WHEN** Select has `endContent` with ChevronDown icon
- **THEN** icon is positioned on right side
- **AND** icon rotates when dropdown opens

### Requirement: Modal component replacement
The system SHALL use HeroUI Modal component for all modal dialogs.

#### Scenario: Modal opens and closes
- **WHEN** modal is triggered to open
- **THEN** HeroUI Modal appears with backdrop
- **AND** backdrop has `bg-neutral-950/70 backdrop-blur-sm`
- **AND** pressing Escape key closes modal
- **AND** clicking backdrop closes modal

#### Scenario: Modal content structure
- **WHEN** modal renders
- **THEN** ModalContent contains ModalHeader, ModalBody, and ModalFooter
- **AND** header has close button
- **AND** body has scrollable content if needed
- **AND** footer has action buttons

#### Scenario: Modal animation
- **WHEN** modal opens
- **THEN** modal uses Framer Motion fade-in and zoom-in animation
- **AND** animation duration is ~300ms
- **AND** backdrop fades in simultaneously

#### Scenario: Modal sizes
- **WHEN** modal size prop is "lg"
- **THEN** modal has `max-w-[28rem]` width
- **AND** modal is centered on screen
- **AND** modal has `rounded-[2.5rem]` corner radius

### Requirement: Custom className support
The system SHALL allow custom className overrides on HeroUI components.

#### Scenario: Override button styles
- **WHEN** HeroUI Button has custom `className`
- **THEN** custom styles are applied
- **AND** custom styles take precedence over default styles
- **AND** component functionality remains intact

#### Scenario: Dark mode custom styles
- **WHEN** component has `className="dark:custom-style"`
- **THEN** custom dark mode style applies
- **AND** does not conflict with HeroUI theme dark mode
