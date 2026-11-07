# Tasks: Full App Field Verification & Layout Stability Tests

**Input**: Design documents from `/specs/001-app-field-verification/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Test harness and baseline verification

- [x] T001 Verify Vitest configuration and Node execution environment with react-native-web aliases in `app/vitest.config.mts`
- [x] T002 [P] Establish shared card text boundary definitions in `app/utils/cardTextLayout.ts` and `api/shared/card-text-limits.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core string sanitation, boundary helpers, and database/schema limits

**⚠️ CRITICAL**: Foundational clamping and server schema guards must be in place before layout render validation.

- [x] T003 Implement Unicode grapheme cluster splitting (`splitGraphemes`) in `app/utils/cardTextLayout.ts` to prevent splitting surrogate pairs or ZWJ emojis
- [x] T004 Implement word-boundary and separator aware string trimming (`fitCardText`) in `app/utils/cardTextLayout.ts`
- [x] T005 Implement adaptive single-line professional name shortening (`fitProfessionalName`) in `app/utils/cardTextLayout.ts` enforcing the 32-character limit
- [x] T006 [P] Update server validation schema `api/cards/utils/card.schemas.ts` to enforce `CARD_TEXT_LIMITS` for `prefix` (12), `suffix` (12), `cardTag` (24), and combined full name ($\le 32$)
- [x] T007 [P] Enforce connection value length limits by type (text $\le 120$, phone $\le 100$, email $\le 254$, url $\le 2048$) in `api/cards/utils/card.schemas.ts`

**Checkpoint**: Foundational clamping and schema validation complete.

---

## Phase 3: User Story 1 - Extreme Character & Edge-Case Input Stability (Priority: P1) 🎯 MVP

**Goal**: Guarantee that entering edge-case text, composite emojis, multi-byte characters, or maximal string lengths never breaks layout rendering or crashes across any of the 24 layout templates.

**Independent Test**: Execute `app/tests/card-text-safety.test.ts` to verify grapheme safety, name fitting, and input clamping under extreme conditions.

### Tests for User Story 1
- [x] T008 [P] [US1] Unit test for Unicode ZWJ emojis, word-boundary trimming, and progressive name fitting in `app/tests/card-text-safety.test.ts`
- [x] T009 [P] [US1] API schema test for rejecting over-limit prefix, suffix, card tag, and combined name in `api/tests/local/validation.test.ts`

### Implementation for User Story 1
- [x] T010 [P] [US1] Enforce single-line name constraints and field allocation in `app/pages/editView/Components/CardSectionEditor.tsx`
- [x] T011 [P] [US1] Sanitize `spotlightName` and `corporateNameText` with `fitProfessionalName` in `app/pages/cards/Templates/sections/ProfessionalSectionRenderer.tsx`
- [x] T012 [P] [US1] Sanitize full name construction with `fitProfessionalName` in `app/pages/walletCard/Utils/walletPassFields.ts`

**Checkpoint**: User Story 1 functional and tested.

---

## Phase 4: User Story 2 - Full Viewport & Multi-Surface Layout Consistency (Priority: P2)

**Goal**: Ensure all 24 card layout combinations render safely without horizontal overflow or unconstrained text blowout across viewports from 320px to 768px.

**Independent Test**: Execute `app/tests/card-layout-matrix.test.ts` to verify template creation and responsive font calculations across all layouts and screen sizes.

### Tests for User Story 2
- [x] T013 [P] [US2] Combinatorial layout matrix test covering 8 Identity, 8 Professional, and 8 Connection layouts with stress profiles in `app/tests/card-layout-matrix.test.ts`
- [x] T014 [P] [US2] Mathematical boundary tests for `getResponsiveSingleLineFontSize`, `getProfessionalTaglineFontSize`, `getResponsiveAccreditationLimit`, and `getEffectiveCardContentWidth` in `app/tests/card-layout-matrix.test.ts`

### Implementation for User Story 2
- [x] T015 [P] [US2] Clamp accreditation pills and badge text with `numberOfLines={1}` and `flexShrink: 1` in `app/pages/cards/Templates/sections/SectionSharedComponents.tsx`
- [x] T016 [P] [US2] Clamp full card detail values with `numberOfLines` (2 for text/urls, 6 for multiline) in `app/pages/fullCard/Components/CardDetailField.tsx`
- [x] T017 [P] [US2] Clamp wallet stack card tag pill with `numberOfLines={1}` and `max-w-[70%]` in `app/pages/walletCard/Components/WalletStackView.tsx`
- [x] T018 [P] [US2] Clamp standard wallet card category header with `numberOfLines={1}` in `app/common/ui/StandardWalletCard.tsx`
- [x] T019 [P] [US2] Clamp preview QR hero caption with `numberOfLines={1}` in `app/pages/previewCard/Components/HomePreviewCardFace.tsx`

**Checkpoint**: User Story 2 functional and tested.

---

## Phase 5: User Story 3 - Comprehensive Schema & Field Mutation Safety (Priority: P3)

**Goal**: Validate full regression testing across mobile client and backend API suites ensuring no broken dependencies, regressions, or unexpected mutations.

**Independent Test**: Execute full test suites `npm test` in `app` and `npm run test:local` in `api`.

### Implementation & Verification for User Story 3
- [x] T020 [P] [US3] Verify client test suite integrity: run all 38 test suites in `app/` via `npm test`
- [x] T021 [P] [US3] Verify API local test suite integrity: run all 11 test suites in `api/` via `npm run test:local`

**Checkpoint**: User Story 3 verified with 0 failures across all 250 combined automated tests.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanliness, and readiness verification

- [x] T022 [P] Document test and validation procedures in `specs/001-app-field-verification/quickstart.md`
- [x] T023 Verify git working tree status and clean non-essential artifacts

---

## Dependencies & Execution Order

- **Phase 1 (Setup)** $\rightarrow$ **Phase 2 (Foundational)**: Prerequisite for all stories.
- **Phase 3 (US1)**: First MVP increment (P1).
- **Phase 4 (US2)**: Builds upon US1 constraints to verify visual rendering across viewports (P2).
- **Phase 5 (US3)**: Full regression gate across client and API suites (P3).
- **Phase 6 (Polish)**: Final verification and documentation.

## Summary Metrics

- **Total Tasks**: 23
- **Phase Breakdown**:
  - Setup: 2 tasks
  - Foundational: 5 tasks
  - User Story 1 (P1): 5 tasks
  - User Story 2 (P2): 7 tasks
  - User Story 3 (P3): 2 tasks
  - Polish: 2 tasks
- **Completed**: 23 / 23 (100% verified and tested)
