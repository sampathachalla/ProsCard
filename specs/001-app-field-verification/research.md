# Research: Full App Field Verification & Layout Stability Testing

## Unknowns & Resolution

### Unknown 1: React Native Web / Node headless testing of layout renderers
- **Context**: The mobile app runs on Expo / React Native (`react-native-web` alias configured in `vitest.config.mts`), with Vitest in `environment: 'node'`.
- **Decision**: Test layout templates using Vitest with React component rendering (`react-test-renderer` or direct functional evaluation of layout template builder `createCardDetailTemplate` and section render functions).
- **Rationale**: Node environment with `react-native-web` alias allows executing component render trees synchronously in under 2 seconds without requiring device emulators or external browsers.
- **Alternatives considered**: Playwright web e2e tests (requires starting Expo web server and browser downloads) or Maestro (requires booted iOS/Android simulators).

### Unknown 2: Layout Matrix Coverage
- **Context**: The app defines 8 identity styles, 8 professional styles, and 8 connection styles across legacy and modern variants.
- **Decision**: Construct a parameterized matrix test that iterates over every combination of Identity, Professional, and Connection layout IDs with a suite of stress payloads (Empty, Normal, Max Budget, Over-Budget Extreme, Multi-Byte / Japanese, Composite ZWJ Emojis, Long URLs/Emails).
- **Rationale**: Exhaustive combinatorial tests catch edge-case layout styling bugs before release.
- **Alternatives considered**: Testing only default layout (misses bugs like `spotlightName` unclipped rendering).

### Unknown 3: Responsive Font Scaling Limits
- **Context**: Viewport widths range from narrow phones (320px) to tablet / web share columns (520px+).
- **Decision**: Verify `getResponsiveSingleLineFontSize`, `getProfessionalTaglineFontSize`, and `getEffectiveCardContentWidth` across viewports `[320, 360, 390, 414, 520]` against maximum length inputs to guarantee output sizes stay within readable bounds (`min <= calculated <= max`).
- **Rationale**: Deterministic mathematical proof that text bounding boxes do not exceed allocated widths.
