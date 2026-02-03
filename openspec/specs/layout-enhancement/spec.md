### Requirement: Unified control bar layout

The analyze page SHALL display a unified control bar that contains the model selector and action buttons in a single horizontal row on tablet and desktop viewports.

#### Scenario: Desktop layout displays unified control bar
- **WHEN** the user views the analyze page on a viewport width >= 640px
- **THEN** the model selector and action buttons (Analyze, Clear) SHALL appear in the same horizontal row

#### Scenario: Mobile layout stacks controls
- **WHEN** the user views the analyze page on a viewport width < 640px
- **THEN** the model selector SHALL appear above the action buttons in a stacked layout

### Requirement: Controls visible before image upload

The control bar (model selector and action buttons) SHALL be visible before an image is uploaded, with the Analyze button disabled.

#### Scenario: Control bar shown without image
- **WHEN** the user visits the analyze page without uploading an image
- **THEN** the model selector SHALL be visible and functional
- **THEN** the Analyze button SHALL be visible but disabled
- **THEN** the Clear button SHALL be hidden (nothing to clear)

#### Scenario: Control bar fully enabled with image
- **WHEN** the user uploads an image
- **THEN** the Analyze button SHALL become enabled
- **THEN** the Clear button SHALL become visible

### Requirement: Consistent spacing between sections

The analyze page SHALL use consistent spacing: 24px (gap-6) between major sections and 16px (gap-4) within related content groups.

#### Scenario: Section spacing is uniform
- **WHEN** the user views the analyze page
- **THEN** the gap between the header and dropzone SHALL be 24px
- **THEN** the gap between the dropzone and mode selector SHALL be 24px
- **THEN** the gap between the mode selector and result area SHALL be 24px
