# Quickstart: Layout Stability & Field Verification Test Run

## Prerequisites
- Node.js 18+
- Dependencies installed in `app/` and `api/`

## Running Tests

### 1. App Layout Matrix & Field Safety Test Suite
Runs all app tests including the combinatorial layout matrix test, unicode stress test, and viewport scaling tests:

```bash
cd app
npm test
```

Or run only the field safety and layout verification suite:

```bash
cd app
npx vitest run tests/card-text-safety.test.ts tests/card-layout-matrix.test.ts
```

**Expected Outcome**:
All test files pass with 0 failures.

### 2. API Schema & Constraint Validation Suite
Runs local validation unit tests checking API request schemas against character budgets:

```bash
cd api
npm run test:local
```

**Expected Outcome**:
All 11 local unit test files pass with 0 failures.
