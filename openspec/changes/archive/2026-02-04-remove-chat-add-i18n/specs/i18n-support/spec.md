## ADDED Requirements

### Requirement: Screenshot page title and subtitle use i18n

The Screenshot page SHALL display a translated title and subtitle using the keys `screenshot.title` and `screenshot.subtitle`.

#### Scenario: Title displays in user's language
- **WHEN** user views the Screenshot page with language set to zh-TW
- **THEN** the title displays in Traditional Chinese

#### Scenario: Title displays in English
- **WHEN** user views the Screenshot page with language set to en-US
- **THEN** the title displays "Screenshot Analysis" in English

---

### Requirement: Dropzone UI text uses i18n

The image dropzone component SHALL use translation keys for all user-facing text including title, subtitle, paste instruction, and file selection button.

#### Scenario: Dropzone shows translated instructions
- **WHEN** user views the dropzone area
- **THEN** all text (title, subtitle, paste/select prompts) displays in the user's selected language

#### Scenario: Keyboard shortcut hint is localized
- **WHEN** user views the paste from clipboard instruction
- **THEN** the shortcut hint displays using `screenshot.shortcut` translation key

---

### Requirement: Analysis mode selector uses i18n

The analysis mode selector SHALL display translated labels and descriptions for each mode (explain, ocr, code, error, translate) using keys `screenshot.modes.<mode>` and `screenshot.modes.<mode>Description`.

#### Scenario: Mode labels in Japanese
- **WHEN** user has language set to ja-JP
- **THEN** all five analysis mode labels display in Japanese

#### Scenario: Mode descriptions show on hover/selection
- **WHEN** user interacts with a mode option
- **THEN** the description displays in the user's selected language

---

### Requirement: Analysis action buttons use i18n

The analyze button, clear button, and reanalyze button SHALL use translation keys `screenshot.analyze`, `screenshot.clear`, and `screenshot.reanalyze`.

#### Scenario: Analyze button text is translated
- **WHEN** user has an image loaded and language is zh-TW
- **THEN** the analyze button displays the Chinese translation

#### Scenario: Loading state text is translated
- **WHEN** analysis is in progress
- **THEN** the button displays translated "Analyzing..." text from `screenshot.analyzing`

---

### Requirement: Analysis result section uses i18n

The result section header SHALL use translation key `screenshot.result`.

#### Scenario: Result header in user's language
- **WHEN** analysis completes and results are displayed
- **THEN** the result section header displays in the user's selected language

---

### Requirement: Error messages use i18n

All error messages related to screenshot functionality SHALL use translation keys under `screenshot.errors.*`.

#### Scenario: Invalid file type error
- **WHEN** user attempts to upload a non-image file
- **THEN** error message displays translated text from `screenshot.errors.invalidFileType`

#### Scenario: Clipboard error
- **WHEN** clipboard access fails
- **THEN** error message displays translated text from `screenshot.errors.clipboardError`

#### Scenario: No image in clipboard
- **WHEN** user pastes but clipboard contains no image
- **THEN** error message displays translated text from `screenshot.errors.noImageInClipboard`

#### Scenario: File read error
- **WHEN** file reading fails
- **THEN** error message displays translated text from `screenshot.errors.readError`

---

### Requirement: Navigation label uses i18n

The sidebar navigation item and command palette action for the Analyze page SHALL use translation key `nav.analyze`.

#### Scenario: Sidebar nav item translated
- **WHEN** user views the sidebar
- **THEN** the Analyze navigation label displays in their selected language

#### Scenario: Command palette action translated
- **WHEN** user opens command palette (Cmd+K)
- **THEN** the "Go to Analyze" action displays in their selected language

---

### Requirement: All three locales have complete translations

Translation files for en-US, zh-TW, and ja-JP SHALL contain all screenshot-related keys with appropriate translations.

#### Scenario: No missing keys in zh-TW
- **WHEN** application loads with zh-TW locale
- **THEN** no translation keys appear as raw keys in the UI (all have translations)

#### Scenario: No missing keys in ja-JP
- **WHEN** application loads with ja-JP locale
- **THEN** no translation keys appear as raw keys in the UI (all have translations)

#### Scenario: No missing keys in en-US
- **WHEN** application loads with en-US locale
- **THEN** no translation keys appear as raw keys in the UI (all have translations)
