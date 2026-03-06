## ADDED Requirements

### Requirement: AI Settings modal using HeroUI Modal
The system SHALL render the AI Settings modal using HeroUI Modal component.

#### Scenario: Modal container structure
- **WHEN** AI Settings modal opens
- **THEN** HeroUI Modal contains ModalContent
- **AND** ModalContent has `max-w-[28rem]` width
- **AND** ModalContent has `rounded-[2.5rem]` corner radius
- **AND** ModalContent has border with `border-neutral-100`

#### Scenario: Modal header
- **WHEN** modal renders
- **THEN** ModalHeader displays "AI 配置" title
- **AND** header shows icon with gradient background
- **AND** icon container is `w-14 h-14` with `rounded-[1.5rem]`
- **AND** icon gradient is `from-slate-river-400 to-slate-river-500`

#### Scenario: Modal backdrop
- **WHEN** modal is open
- **THEN** backdrop has `bg-neutral-950/70` opacity
- **AND** backdrop has `backdrop-blur-sm` blur effect
- **AND** clicking backdrop closes modal

### Requirement: Provider selection using HeroUI buttons
The system SHALL render AI provider selection using HeroUI Button components.

#### Scenario: Provider grid layout
- **WHEN** provider selection renders
- **THEN** buttons are in 2x2 grid layout
- **AND** each button has `h-auto` height
- **AND** each button has `py-3 px-4` padding
- **AND** buttons have `gap-2` spacing

#### Scenario: Selected provider button
- **WHEN** provider is selected
- **THEN** button has `bg-slate-river-500` background
- **AND** button has `text-white` text color
- **AND** button has `shadow-lg` shadow
- **AND** provider description has `text-slate-river-100` color

#### Scenario: Unselected provider button
- **WHEN** provider is not selected
- **THEN** button has `bg-neutral-50` background (dark: `bg-neutral-800`)
- **AND** button has `text-neutral-600` color
- **AND** button changes on hover to show interactivity

#### Scenario: Provider button content
- **WHEN** provider button renders
- **THEN** button shows provider label in bold
- **AND** button shows provider description below label
- **AND** description has `text-xs` size
- **AND** text is left-aligned

### Requirement: API Key input using HeroUI Input
The system SHALL use HeroUI Input for API key entry.

#### Scenario: Password input field
- **WHEN** API Key input renders
- **THEN** Input has `type="password"`
- **AND** Input masks entered text
- **AND** Input has placeholder text for guidance

#### Scenario: Input with icon
- **WHEN** API Key input renders
- **THEN** Input has Key icon in `startContent`
- **AND** icon is `text-neutral-300` color
- **AND** icon is `w-4 h-4` size
- **AND** icon is positioned with `pl-4`

#### Scenario: Input styling
- **WHEN** API Key input renders
- **THEN** Input has `bg-neutral-50` background (dark: `bg-neutral-950/50`)
- **AND** Input has `border-2` with `border-neutral-100` color
- **AND** Input has `rounded-xl` corner radius
- **AND** Input has `min-h-unit-12` height

#### Scenario: Input focus state
- **WHEN** user focuses API Key input
- **THEN** border changes to `border-slate-river-500`
- **AND** focus ring appears with `ring-4 ring-slate-river-500/10`
- **AND** transition is smooth

### Requirement: Model selection using HeroUI Select
The system SHALL use HeroUI Select for AI model selection.

#### Scenario: Select dropdown
- **WHEN** model Select is clicked
- **THEN** dropdown list appears
- **AND** dropdown has `rounded-xl` corner radius
- **AND** dropdown has `bg-neutral-50` background (dark: `bg-neutral-900`)

#### Scenario: Model grouping
- **WHEN** Select renders grouped models
- **THEN** models are grouped by provider category
- **AND** group headers are displayed
- **AND** group headers have `text-xs font-bold` style
- **AND** group headers have `text-neutral-400` color

#### Scenario: Selected model display
- **WHEN** model is selected
- **THEN** Select trigger shows selected model name
- **AND** ChevronDown icon appears on right side
- **AND** icon rotates when dropdown is open

#### Scenario: Select trigger styling
- **WHEN** model Select renders
- **THEN** trigger has `bg-neutral-50` background
- **AND** trigger has `border-2` with `border-neutral-100`
- **AND** trigger has `rounded-xl` corner radius
- **AND** trigger has `min-h-unit-12` height with `py-3` padding

### Requirement: Conditional Base URL input
The system SHALL show Base URL input only when custom provider is selected.

#### Scenario: Custom provider selected
- **WHEN** provider is set to "custom"
- **THEN** Base URL input becomes visible
- **AND** input has Globe icon in `startContent`
- **AND** input has URL type for validation
- **AND** placeholder shows "https://api.example.com/v1"

#### Scenario: Non-custom provider selected
- **WHEN** provider is NOT "custom"
- **THEN** Base URL input is hidden
- **AND** form layout adjusts accordingly

### Requirement: Save button with success state
The system SHALL use HeroUI Button for save action with visual feedback.

#### Scenario: Default save button
- **WHEN** modal first renders
- **THEN** button has `bg-slate-river-500` background
- **AND** button has `shadow-xl` shadow
- **AND** button has `py-4` padding
- **AND** button shows Server icon

#### Scenario: Save success state
- **WHEN** user clicks save and configuration is saved
- **THEN** button changes to `bg-green-500` background
- **AND** button shows CheckCircle2 icon
- **AND** button text changes to "已更新"
- **AND** success state lasts for 2 seconds

#### Scenario: Button full width
- **WHEN** save button renders
- **THEN** button has `w-full` width
- **AND** button is centered in ModalFooter
- **AND** button has `text-base font-black` typography

### Requirement: Info text display
The system SHALL display privacy info text below save button.

#### Scenario: Privacy notice
- **WHEN** modal renders
- **THEN** info text is displayed
- **AND** text explains local storage
- **AND** text has `text-xs` size
- **AND** text is centered
- **AND** text has `text-neutral-400` color

### Requirement: Modal close functionality
The system SHALL provide multiple ways to close the modal.

#### Scenario: Close button
- **WHEN** user clicks close button (X icon)
- **THEN** modal closes
- **AND** close button is in top-right of header
- **AND** close button has `p-2` padding
- **AND** close button has `rounded-xl` hover background

#### Scenario: Escape key
- **WHEN** user presses Escape key
- **THEN** modal closes
- **AND** any unsaved changes are preserved in local state

#### Scenario: Backdrop click
- **WHEN** user clicks backdrop area
- **THEN** modal closes
- **AND** backdrop click area excludes modal content
