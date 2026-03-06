## ADDED Requirements

### Requirement: Task card using HeroUI Card
The system SHALL render individual task items using HeroUI Card component.

#### Scenario: Task card structure
- **WHEN** task renders in TaskList
- **THEN** HeroUI Card contains the task content
- **AND** card has `rounded-xl` border radius
- **AND** card has border that changes on hover
- **AND** card has `min-h-[3.5rem]` minimum height

#### Scenario: Active task card styling
- **WHEN** task status is RUNNING
- **THEN** card has `border-green-500` border
- **AND** card has `shadow-md` with green tint
- **AND** card has `ring-1 ring-terracotta-500/20`

#### Scenario: Completed task card styling
- **WHEN** task status is COMPLETED
- **THEN** card has `opacity-60`
- **AND** card has `grayscale-[0.3]` filter
- **AND** task title has `line-through` decoration

#### Scenario: Locked task card styling
- **WHEN** task has incomplete parent dependencies
- **THEN** card has `opacity-50`
- **AND** card has `pointer-events-none`
- **AND** lock icon is visible

#### Scenario: Task card hover effect
- **WHEN** user hovers over task card
- **THEN** border changes to green-300/50
- **AND** shadow increases
- **AND** hover transition is `duration-200`

### Requirement: Task status button
The system SHALL use HeroUI Button for the task status toggle button.

#### Scenario: Play button for idle task
- **WHEN** task status is IDLE
- **THEN** button shows Play icon
- **AND** button has `bg-neutral-50` background
- **AND** button changes to `bg-green-500` on hover
- **AND** Play icon has `ml-0.5` offset

#### Scenario: Pause button for running task
- **WHEN** task status is RUNNING
- **THEN** button shows Pause icon with `fill-current`
- **THEN** button has `bg-ochre-300` background
- **AND** button has `text-white` text color
- **AND** button has `shadow-ochre/40` shadow

#### Scenario: Check button for completed task
- **WHEN** task status is COMPLETED
- **THEN** button shows CheckCircle icon
- **AND** button has `bg-green-100` background
- **AND** button has `text-green-600` color

#### Scenario: Lock button for locked task
- **WHEN** task is locked by parent dependencies
- **THEN** button shows Lock icon
- **AND** button has `cursor-not-allowed` state
- **AND** button is disabled

### Requirement: Task metadata chips
The system SHALL use HeroUI Chip component for task tags and milestone counts.

#### Scenario: Milestone count chip
- **WHEN** task has milestones
- **THEN** Chip displays milestone count
- **AND** Chip has Flag icon
- **AND** Chip has `text-[9px]` text size
- **AND** Chip has `h-5` height

#### Scenario: Task tag chips
- **WHEN** task has tags
- **THEN** each tag renders as a Chip
- **AND** Chip color matches category color
- **AND** Chip has `variant="flat"`
- **AND** Chip has `text-[9px]` text size

#### Scenario: Multiple chips layout
- **WHEN** task has multiple tags and milestone count
- **THEN** chips are wrapped in flex container
- **AND** chips have `gap-1.5` spacing
- **AND** chips are aligned in one line

### Requirement: Task action buttons
The system SHALL use HeroUI Button for task actions (tag, complete, delete).

#### Scenario: Action buttons visibility
- **WHEN** user hovers over task card
- **THEN** action buttons fade in with `opacity-100`
- **AND** buttons slide in with `translate-x-0`
- **AND** transition is `duration-200`

#### Scenario: Tag button
- **WHEN** user clicks tag button
- **THEN** tagging modal opens
- **AND** button has `isIconOnly` prop
- **AND** button has `size="sm"`
- **AND** button has `variant="light"`

#### Scenario: Complete toggle button
- **WHEN** user clicks complete button
- **THEN** task status toggles between COMPLETED and IDLE
- **AND** button changes icon (CheckCircle vs Circle)
- **AND** button color changes to green when completed

#### Scenario: Delete button
- **WHEN** user clicks delete button
- **THEN** confirmation dialog appears
- **AND** button has `color="danger"` mapped to terracotta
- **AND** button has `variant="light"`

### Requirement: Task time display
The system SHALL display task time with appropriate color coding.

#### Scenario: Running task time
- **WHEN** task status is RUNNING
- **THEN** time display has `text-green-600` color (dark: `text-green-400`)
- **AND** time is in monospace font with `tabular-nums`

#### Scenario: Idle task time
- **WHEN** task is not running
- **THEN** time display has `text-neutral-800` color (dark: `text-slate-500`)
- **AND** time format is "Xh Xm" or "Xm"

#### Scenario: Estimated time display
- **WHEN** task has no actual time but has estimated time
- **THEN** display shows "Est: Xh Xm"
- **AND** color is `text-neutral-700` (dark: `text-neutral-600`)

### Requirement: Selection mode styling
The system SHALL support multi-select mode for bulk operations.

#### Scenario: Selection mode active
- **WHEN** selection mode is enabled
- **THEN** task cards show checkbox instead of status button
- **AND** checkbox uses HeroUI Checkbox component
- **AND** unselected cards have neutral border

#### Scenario: Selected task card
- **WHEN** task is selected in selection mode
- **THEN** card has `bg-green-50` background (dark: `bg-green-900/10`)
- **AND** card has `border-green-500` border
- **AND** card has `shadow-sm` with elevation

#### Scenario: Checkbox toggle
- **WHEN** user clicks checkbox
- **THEN** task selection state toggles
- **AND** visual state updates immediately
- **AND** checkbox shows Check icon when selected
