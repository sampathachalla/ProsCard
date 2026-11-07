<!--
Sync Impact Report
- Version change: template (unversioned) -> 1.0.0
- Modified principles: none (initial project constitution)
- Added principles:
  - I. One Source of Truth Across Surfaces
  - II. Safe, Predictable User Content
  - III. Runtime-Compatible Delivery
  - IV. Secure Configuration and Data Handling
  - V. Small, Verifiable Changes
- Added sections:
  - Product and Platform Constraints
  - Development and Release Workflow
- Removed sections: none
- Follow-up TODOs: none
-->
# VC Pros Constitution

## Core Principles

### I. One Source of Truth Across Surfaces
Every saved card change MUST propagate consistently to the card list, editor preview, share QR,
public web card, contact export, wallet pass, and home-screen widget wherever that field is shown.
Account-wide edits MUST update every eligible card; card-only edits MUST remain scoped to the
selected card. Derived artifacts MUST be regenerated from current card data and MUST NOT silently
reuse stale QR images, logos, titles, or contact values. This prevents users from sharing a view
that differs from what they just saved.

### II. Safe, Predictable User Content
All user-controlled fields MUST have explicit, shared validation rules at every trust boundary.
Character limits MUST preserve readable layouts on the mobile card, public web card, contact card,
and wallet card, including when every field is filled to its maximum. Long content MUST wrap,
truncate, or be rejected according to the documented field contract; it MUST NOT overlap controls,
escape containers, or make essential actions inaccessible. User-visible validation and success
messages MUST clearly explain the result of an action.

### III. Runtime-Compatible Delivery
Native capabilities and JavaScript-delivered capabilities MUST be treated as separate release
surfaces. An OTA update MUST target only builds with the matching runtime version and channel.
Changes to native modules, entitlements, extensions, widgets, permissions, or platform metadata
MUST use a new native build. An OTA update MUST NOT be presented as a substitute for a required
native build. Release configuration MUST keep production authentication mode and backend endpoints
explicit so local or test values cannot reach store users.

### IV. Secure Configuration and Data Handling
Credentials, signing material, private keys, access tokens, and user secrets MUST NOT be committed,
logged, embedded in client bundles, or copied into specifications. Inputs from clients, uploads,
public card URLs, and external services MUST be validated before use. Production services MUST use
approved encrypted endpoints, least-privilege access, and environment-specific configuration.
Sensitive actions MUST fail safely with an actionable message rather than exposing internal state.

### V. Small, Verifiable Changes
Implementation MUST make the smallest change that completely satisfies the approved specification.
Existing components, data contracts, and dependencies MUST be reused before adding alternatives.
Unrelated refactors, renames, dependency changes, builds, deployments, and OTA publications MUST NOT
be bundled into a feature unless explicitly authorized. Verification MUST be proportional to risk
and recorded accurately; no test, build, deployment, container, or OTA update may be reported as
successful unless it actually ran and its result was observed.

## Product and Platform Constraints

- VC Pros is a digital business-card product spanning an Expo/React Native iOS client, backend
  services, public web cards, contact exports, wallet passes, QR sharing, and an iOS widget.
- Accessibility, safe-area behavior, readable contrast, touch targets, keyboard behavior, and
  responsive layouts MUST be considered for every user-facing mobile change.
- The app MUST preserve a clear distinction between sign-in and sign-up: returning users reach
  their cards, while new users complete onboarding before normal app use.
- Shareable artifacts MUST resolve to the intended current card and MUST remain usable when opened
  outside the app.
- Features unavailable or unreliable on a target platform MUST be hidden or clearly marked rather
  than exposed as non-working actions.

## Development and Release Workflow

1. Define the user outcome, scope, acceptance scenarios, edge cases, and affected surfaces before
   implementation.
2. Inspect current repository state and preserve unrelated or uncommitted user work.
3. Change only the files required by the approved scope and keep frontend/backend contracts aligned.
4. Run verification only when explicitly requested or through an approved Pros Toolkit test command;
   otherwise report verification as not run.
5. Before release, classify the change as backend, OTA-compatible JavaScript/assets, or native.
6. Commit and push the exact intended changes before deploying them so production state is traceable.
7. Deploy backend containers only when backend behavior changed. Publish OTA updates only when the
   installed build runtime and channel are confirmed. Create a native build when native code or
   configuration changed.
8. Record the commit, deployed target, runtime/channel, and observed result in the handoff.

## Governance

This constitution governs specifications, plans, implementation, review, and release work for VC
Pros. Feature artifacts and implementation decisions MUST comply with it. Any exception MUST be
documented with its user impact, risk, owner, and removal or migration plan.

Amendments require a written rationale and a review of affected specifications and workflows.
Version changes follow semantic versioning: MAJOR for incompatible principle removals or
redefinitions, MINOR for new principles or materially expanded obligations, and PATCH for
clarifications that do not change required behavior. Compliance MUST be reviewed when a feature is
specified, before implementation is accepted, and before any production release.

**Version**: 1.0.0 | **Ratified**: 2026-11-07 | **Last Amended**: 2026-11-07
