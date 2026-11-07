# Implementation Plan: Full App Field Verification & Layout Stability Tests

**Branch**: `001-app-field-verification` | **Date**: 2026-11-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-app-field-verification/spec.md`

## Summary

Build an automated end-to-end field verification and layout matrix test suite covering all 24 layout combinations (8 Identity × 8 Professional × 8 Connection) across multiple screen sizes (320px – 520px) and extreme stress inputs (max-length text, ZWJ composite emojis, multi-byte Asian and RTL scripts, long unbroken tokens). Verify that every card field cleanly renders, wraps, or truncates without throwing exceptions, overlapping elements, or breaking mobile, web, and wallet card representations.

## Technical Context

**Language/Version**: TypeScript 5.8, Node.js 18+
**Primary Dependencies**: React Native 0.88, React Native Web, Expo 58, Vitest 5.0
**Storage**: PostgreSQL (API), AsyncStorage (App local state)
**Testing**: Vitest (`app/tests/`, `api/tests/local/`)
**Target Platform**: iOS, Android, Web (Expo Web Export / Mobile Web)
**Project Type**: Mobile Application + Express Backend API
**Performance Goals**: Test execution < 3 seconds across entire layout matrix without requiring device simulators
**Constraints**: Zero visual regressions, no dependency installations, no breaking existing layouts or API endpoints
**Scale/Scope**: 24 distinct card layout styles, 4 distinct view surfaces (Preview, Full Card, Web Share, Wallet Pass)

## Constitution Check

- Smallest surgical changes only.
- App and server limits strictly aligned.
- All tests automated, deterministic, and locally runnable.
- No new external packages or network dependencies required.

## Phases

### Phase 0: Outline & Research
- Completed. Detailed in [research.md](./research.md).

### Phase 1: Design & Contracts
- Completed.
- Entities and layout budgets documented in [data-model.md](./data-model.md).
- Validation contracts defined in [contracts/card-validation.contract.md](./contracts/card-validation.contract.md).
- Execution instructions defined in [quickstart.md](./quickstart.md).

### Phase 2: Implementation & Verification Tasks
- Write `app/tests/card-layout-matrix.test.ts` implementing a full combinatorial test across all 24 card layouts with extreme stress payloads.
- Verify `createCardDetailTemplate` generation across all layout combinations.
- Verify viewport font scaling bounds (`getResponsiveSingleLineFontSize`, `getProfessionalTaglineFontSize`) across viewports 320px – 520px.
- Run complete test suites (`npm test` in `app`, `npm run test:local` in `api`) and resolve any unexpected breakage.
