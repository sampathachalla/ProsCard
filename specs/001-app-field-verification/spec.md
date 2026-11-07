# Feature Specification: Full App Field Verification & Layout Stability Tests

**Feature Branch**: `001-app-field-verification`
**Created**: 2026-11-07
**Status**: Specified
**Input**: Comprehensive testing across all user-inputted fields, edge-case character counts, layout variants (Identity, Professional, Connections), and surfaces (Preview, Full Card, Web View, Wallet View) to guarantee layouts never break.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extreme Character & Edge-Case Input Stability (Priority: P1)
As a user entering unusual, long, international, emoji-rich, or dense professional information, my business cards should render cleanly across all 24 template layouts without text overlapping, overflowing containers, or throwing runtime rendering exceptions.

**Why this priority**: Core value of digital business cards depends on visual credibility and zero visual corruption regardless of name length or formatting.

**Independent Test**: Can be validated via layout rendering and boundary stress tests verifying every layout variation with maximum and stress-length inputs.

**Acceptance Scenarios**:
1. **Given** a user with maximum allowed characters for name, title, company, accreditations, tagline, and bio, **When** rendered across all 8 Professional Layouts, **Then** text stays strictly within boundaries and scales or wraps without clipping container edges.
2. **Given** input containing multi-byte UTF-8, CJK characters, Arabic RTL characters, and composite ZWJ emojis, **When** processed by card text formatters, **Then** characters are never split into malformed surrogate halves and emoji integrity is preserved.

---

### User Story 2 - Full Viewport & Multi-Surface Layout Consistency (Priority: P2)
As a user viewing or sharing cards on mobile screens (small 320px up to large 520px+ viewports), in the Home Preview Card, in the Full Card Detail modal, in the Wallet Stack pass, and on the Web Share view, the card content should look well-balanced and properly ellipsized when appropriate.

**Why this priority**: Business cards are consumed on multiple surfaces and device widths; inconsistency damages presentation.

**Independent Test**: Test suite verifies font calculation formulas and dimension constraints across 320px, 375px, 414px, and 520px viewports.

**Acceptance Scenarios**:
1. **Given** a 320px narrow mobile viewport, **When** rendering single-line company and title in Corporate/Split layouts, **Then** computed font sizes never drop below readable thresholds (minimum 14px) and never overflow the allocated column width.
2. **Given** custom connection fields with long URLs or email addresses, **When** rendered in Full Card details or Connections layouts, **Then** values are clamped with middle/tail ellipsis without horizontal screen blowout.

---

### User Story 3 - Comprehensive Schema & Field Mutation Safety (Priority: P3)
As a user editing any card or profile field through the UI or API, invalid or overflowing data must be safely validated and formatted so the database and runtime card models remain clean.

**Why this priority**: Prevents bad data from entering the database or crashing backend serialization.

**Independent Test**: Vitest unit tests on `cardPatchSchema`, `cardSchema`, and profile onboarding mappers.

**Acceptance Scenarios**:
1. **Given** an API patch request exceeding character bounds or combined full-name limits, **When** processed by the API, **Then** it is rejected with clear 400 validation errors.
2. **Given** legacy unclipped cards loaded from storage, **When** passed to the layout renderers, **Then** `fitCardText` and `fitProfessionalName` sanitize the fields before rendering.

---

## Edge Cases

- **ZWJ sequences and flags**: Emojis like `👨‍👩‍👧‍👦` (11 UTF-16 code units) or `🇺🇸` clamped near boundary limits must not produce  replacement characters.
- **Single massive unbroken word**: A 50-character unbroken string (e.g. `Supercalifragilistic...`) must be clipped cleanly at max limit rather than erased when seeking word boundaries.
- **Accreditations explosion**: A list like `MD, PhD, MBA, CFA, PMP, CPA, JD, RN` must render as clean pills with `numberOfLines={1}` without pushing subsequent card sections off-screen.
- **Empty & Partial states**: Cards with missing fields or partial names (e.g. only suffix or only middle name) must not render dangling whitespace or "null".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All card fields (`displayName`, `preferredName`, `prefix`, `firstName`, `middleName`, `lastName`, `suffix`, `title`, `company`, `accreditations`, `tagline`, `bio`, `cardTag`) MUST strictly conform to defined `CARD_TEXT_LIMITS`.
- **FR-002**: Combined full-name parts (`prefix` + `first` + `middle` + `last` + `suffix`) MUST not exceed 32 characters in the rendered single-line name.
- **FR-003**: The rendering pipeline MUST support all 8 Identity templates (`classic`, `minimal`, `spotlight`, `editorial` and their `-new` variants).
- **FR-004**: The rendering pipeline MUST support all 8 Professional templates (`classic`, `spotlight`, `banner`, `badge` and their `-new` variants).
- **FR-005**: The rendering pipeline MUST support all 8 Connection templates (`classic`, `banner`, `editorial`, `compact` and their `-new` variants).
- **FR-006**: Automated test suites MUST execute without requiring booted emulators or external network dependencies.

### Success Criteria *(mandatory)*

- **SC-001**: 100% of defined card layouts (8 Identity × 8 Professional × 8 Connection = 24 styles) pass automated data matrix stress testing with edge-case strings.
- **SC-002**: 0 visual regressions or broken layout errors in unit tests across viewports 320px, 375px, 414px, and 520px.
- **SC-003**: Zero test failures in client test suite (`app`) and local API test suite (`api`).
