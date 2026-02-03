## ADDED Requirements

### Requirement: Document metadata is domain-agnostic

The Document type SHALL contain only generic metadata fields that apply to any knowledge base domain. The system SHALL NOT include domain-specific fields such as manufacturer, productName, productCode, or dentalDocType.

#### Scenario: Document creation with generic fields
- **WHEN** a user uploads a document
- **THEN** the system stores only generic metadata: id, name, file info, knowledge base reference, tags, and timestamps

#### Scenario: No dental fields in document type
- **WHEN** the Document TypeScript interface is defined
- **THEN** it SHALL NOT contain fields named manufacturer, productName, productCode, or dentalDocType

### Requirement: Knowledge base replaces material categories

The system SHALL use the term "Knowledge Base" instead of "Material Category" throughout the codebase and UI. Type aliases referencing dental terminology SHALL be removed.

#### Scenario: Type definitions use generic names
- **WHEN** referencing the knowledge base data structure
- **THEN** the type SHALL be named KnowledgeBase, not MaterialCategory

#### Scenario: UI displays generic terminology
- **WHEN** viewing the knowledge base list
- **THEN** the header SHALL display "Knowledge Bases" (or localized equivalent), not "材料類別"

### Requirement: Constants file contains only generic options

The constants file SHALL NOT contain domain-specific lists such as dental manufacturers or material categories. It MAY contain generic document type options.

#### Scenario: No hardcoded manufacturers
- **WHEN** the constants file is loaded
- **THEN** there SHALL be no MANUFACTURERS constant array

#### Scenario: No hardcoded categories
- **WHEN** the constants file is loaded
- **THEN** there SHALL be no DEFAULT_CATEGORIES constant with dental material types

### Requirement: Document filters are generic

The document filtering UI SHALL provide only generic filter options. Domain-specific filters such as manufacturer and dental document type SHALL be removed.

#### Scenario: Filter options are generic
- **WHEN** the document filter panel is rendered
- **THEN** it SHALL NOT display manufacturer or dental document type filter dropdowns

#### Scenario: Knowledge base filter remains
- **WHEN** filtering documents
- **THEN** users can still filter by knowledge base (formerly category)

### Requirement: Localization uses domain-neutral text

All localization files (zh-TW, en-US, ja-JP) SHALL use domain-neutral terminology. References to dental materials, manufacturers, or specific product examples SHALL be replaced with generic document/knowledge base terminology.

#### Scenario: Chinese tagline is generic
- **WHEN** displaying the app in Traditional Chinese
- **THEN** the tagline SHALL NOT contain "牙科材料"

#### Scenario: Chat placeholder is generic
- **WHEN** viewing the chat input in any language
- **THEN** the placeholder text SHALL reference documents generically, not dental materials

#### Scenario: Quick actions are generic
- **WHEN** viewing the chat welcome screen
- **THEN** example prompts SHALL NOT reference specific dental products like "Filtek Z350 XT"
