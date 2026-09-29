// run-m1-stress-tests.ts
// Ambient declarations for Node.js test harness in Expo/RN project
declare const global: any;
declare const require: any;
declare const process: any;

const Module = require('module');
const { createRoot } = require('react-dom/client');
import React from 'react';

// 1. Environment & DOM Mocking
global.IS_REACT_ACT_ENVIRONMENT = true;
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.location = { href: 'http://localhost/', search: '', pathname: '/' };

class MockNode {
  nodeType: number;
  tagName: string;
  ownerDocument: any;
  style: Record<string, string>;
  childNodes: any[];
  sheet: { insertRule: () => number; cssRules: any[] };

  constructor(tag = 'DIV') {
    this.nodeType = 1;
    this.tagName = tag.toUpperCase();
    this.ownerDocument = (global as any).document;
    this.style = {};
    this.childNodes = [];
    this.sheet = { insertRule: () => 0, cssRules: [] };
  }
  setAttribute() {}
  removeAttribute() {}
  appendChild(child: any) { this.childNodes.push(child); return child; }
  removeChild(child: any) {
    const idx = this.childNodes.indexOf(child);
    if (idx !== -1) this.childNodes.splice(idx, 1);
    return child;
  }
  insertBefore(newNode: any) { this.childNodes.push(newNode); return newNode; }
  addEventListener() {}
  removeEventListener() {}
}

(global as any).Node = MockNode;
(global as any).Element = MockNode;
(global as any).HTMLElement = MockNode;
(global as any).HTMLIFrameElement = class extends MockNode {};
(global as any).ShadowRoot = class extends MockNode {};

const headNode = new MockNode('HEAD');
(global as any).document = {
  nodeType: 9,
  head: headNode,
  body: new MockNode('BODY'),
  createElement: (tag: string) => new MockNode(tag),
  getElementById: () => null,
  addEventListener: () => {},
  removeEventListener: () => {},
  createComment: () => ({ nodeType: 8 }),
  createTextNode: (text: string) => ({ nodeType: 3, textContent: text }),
  activeElement: null,
};

// 2. Intercept Native Modules
const origResolve = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request === 'react-native' || request.startsWith('react-native/')) {
    return origResolve.call(this, 'react-native-web', parent, isMain, options);
  }
  if (request === 'expo-router' || request.startsWith('expo-router/')) {
    return 'expo-router-mock';
  }
  if (request === 'expo-haptics' || request.startsWith('expo-haptics/')) {
    return 'expo-haptics-mock';
  }
  if (request === 'react-native-svg') {
    return 'react-native-svg-mock';
  }
  return origResolve.call(this, request, parent, isMain, options);
};

const routerEvents: { action: string; path?: string }[] = [];
require.cache['expo-router-mock'] = {
  id: 'expo-router-mock',
  filename: 'expo-router-mock',
  loaded: true,
  exports: {
    useRouter: () => ({
      replace: (path: string) => routerEvents.push({ action: 'replace', path }),
      push: (path: string) => routerEvents.push({ action: 'push', path }),
      back: () => routerEvents.push({ action: 'back' }),
    }),
  },
} as any;

const hapticsEvents: any[] = [];
require.cache['expo-haptics-mock'] = {
  id: 'expo-haptics-mock',
  filename: 'expo-haptics-mock',
  loaded: true,
  exports: {
    notificationAsync: async (type: any) => { hapticsEvents.push({ type }); },
    impactAsync: async (style: any) => { hapticsEvents.push({ style }); },
    selectionAsync: async () => { hapticsEvents.push({ action: 'selection' }); },
    NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
    ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  },
} as any;

require.cache['react-native-svg-mock'] = {
  id: 'react-native-svg-mock',
  filename: 'react-native-svg-mock',
  loaded: true,
  exports: {
    default: () => null,
    Svg: () => null,
    Path: () => null,
    Rect: () => null,
    Circle: () => null,
  },
} as any;

const storage = new Map<string, string>();
let failNextSetItem = false;
const mockStorage = {
  getItem: async (key: string) => storage.get(key) ?? null,
  setItem: async (key: string, val: string) => {
    if (failNextSetItem) {
      failNextSetItem = false;
      throw new Error('Simulated AsyncStorage Disk Error');
    }
    storage.set(key, String(val));
  },
  removeItem: async (key: string) => { storage.delete(key); },
  clear: async () => { storage.clear(); },
  get failNextSetItem() { return failNextSetItem; },
  set failNextSetItem(val: boolean) { failNextSetItem = val; },
};

const asPath = require.resolve('@react-native-async-storage/async-storage');
require.cache[asPath] = {
  id: asPath,
  filename: asPath,
  loaded: true,
  exports: { default: mockStorage, ...mockStorage },
} as any;

async function runAll() {
  console.log('====================================================');
  console.log('   PROSCARD MILESTONE 1 EMPIRICAL STRESS HARNESS    ');
  console.log('====================================================\n');

  // A. Baseline worker tests
  const { runValidateOnboardingTests } = await import('./components/onboardingComponents/Utils/validateOnboarding.test');
  const { runValidateOnboardingFlowGroupTests } = await import(
    './components/onboardingComponents/Utils/validateOnboardingFlowGroup.test'
  );
  const { runOnboardingMappersTests } = await import('./components/onboardingComponents/Utils/onboardingMappers.test');
  const { runCardsServiceTests } = await import('./components/cardsComponents/Services/cardsService.test');

  console.log('--- Executing Baseline Worker Tests ---');
  const baselineValidation = runValidateOnboardingTests();
  const baselineFlowGroups = runValidateOnboardingFlowGroupTests();
  const baselineMappers = runOnboardingMappersTests();
  const baselineCards = await runCardsServiceTests();

  console.log(`Baseline Validation: ${baselineValidation.passed} passed, ${baselineValidation.failed} failed`);
  console.log(`Baseline Flow Groups: ${baselineFlowGroups.passed} passed, ${baselineFlowGroups.failed} failed`);
  console.log(`Baseline Mappers:    ${baselineMappers.passed} passed, ${baselineMappers.failed} failed`);
  console.log(`Baseline Cards:      ${baselineCards.passed} passed, ${baselineCards.failed} failed\n`);

  // B. Cards Service Stress Tests
  console.log('--- Executing Cards Service Stress Tests ---');
  const { runCardsServiceStressTests } = await import('./components/cardsComponents/Services/cardsService.stress.test');
  const cardsStress = await runCardsServiceStressTests(mockStorage);
  console.log(`Cards Service Stress: ${cardsStress.passed} passed, ${cardsStress.failed} failed`);
  if (cardsStress.errors.length > 0) {
    console.error('Cards Service Errors:', JSON.stringify(cardsStress.errors, null, 2));
  }

  // C. Profile Service Stress Tests
  console.log('\n--- Executing Profile Service Stress Tests ---');
  const { runProfileServiceStressTests } = await import('./components/profileComponents/Services/profileService.stress.test');
  const profileStress = await runProfileServiceStressTests(mockStorage);
  console.log(`Profile Service Stress: ${profileStress.passed} passed, ${profileStress.failed} failed`);
  if (profileStress.errors.length > 0) {
    console.error('Profile Service Errors:', JSON.stringify(profileStress.errors, null, 2));
  }

  // D. useOnboardingStepper Hook Stress Tests
  const modStepper = await import('./components/onboardingComponents/Hooks/useOnboardingStepper');
  const useOnboardingStepper = (modStepper as any).default?.useOnboardingStepper || (modStepper as any).useOnboardingStepper;

  const { runStepperStressTests } = await import('./components/onboardingComponents/Hooks/useOnboardingStepper.stress.test');
  const stepperStress = await runStepperStressTests({
    useOnboardingStepper,
    createRoot,
    MockNode,
    mockStorage,
    routerEvents,
    hapticsEvents,
  });
  console.log(`Stepper Hook Stress: ${stepperStress.passed} passed, ${stepperStress.failed} failed`);
  if (stepperStress.errors.length > 0) {
    console.error('Stepper Hook Errors:', JSON.stringify(stepperStress.errors, null, 2));
  }

  const totalPassed =
    baselineValidation.passed +
    baselineMappers.passed +
    baselineCards.passed +
    cardsStress.passed +
    profileStress.passed +
    stepperStress.passed;

  const totalFailed =
    baselineValidation.failed +
    baselineMappers.failed +
    baselineCards.failed +
    cardsStress.failed +
    profileStress.failed +
    stepperStress.failed;

  console.log('\n====================================================');
  console.log(`   TOTAL RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('====================================================\n');

  const summary = {
    baselineValidation,
    baselineMappers,
    baselineCards,
    cardsStress,
    profileStress,
    stepperStress,
    totalPassed,
    totalFailed,
  };

  return summary;
}

runAll()
  .then((summary) => {
    if (summary.totalFailed > 0) {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Fatal stress harness failure:', err);
    process.exit(1);
  });
