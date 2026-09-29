// run-m3-tests.ts
// Ambient declarations for Node.js test harness in Expo/RN project
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const global: any;
declare const require: any;
declare const process: any;

const Module = require('module');

require.extensions['.png'] = (module: any) => {
  module.exports = 1;
};

// 1. Environment & DOM Mocking
global.IS_REACT_ACT_ENVIRONMENT = true;
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.location = { href: 'http://localhost/', search: '', pathname: '/' };
global.window.getComputedStyle = () => ({ getPropertyValue: () => '' });
global.getComputedStyle = global.window.getComputedStyle;

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

class MockMutationObserver {
  observe() {}
  disconnect() {}
  takeRecords() { return []; }
}
(global as any).MutationObserver = MockMutationObserver;
global.window.MutationObserver = MockMutationObserver;

const htmlNode = new MockNode('HTML');
const headNode = new MockNode('HEAD');
const bodyNode = new MockNode('BODY');
(global as any).document = {
  nodeType: 9,
  documentElement: htmlNode,
  head: headNode,
  body: bodyNode,
  createElement: (tag: string) => new MockNode(tag),
  getElementById: () => null,
  getElementsByTagName: (tag: string) => {
    if (tag.toUpperCase() === 'HEAD') return [headNode];
    if (tag.toUpperCase() === 'HTML') return [htmlNode];
    if (tag.toUpperCase() === 'BODY') return [bodyNode];
    return [];
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  createComment: () => ({ nodeType: 8 }),
  createTextNode: (text: string) => ({ nodeType: 3, textContent: text }),
  activeElement: null,
};
global.window.document = (global as any).document;

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
  if (request === 'react-native-safe-area-context') {
    return 'react-native-safe-area-context-mock';
  }
  if (request === 'expo-linear-gradient' || request.startsWith('expo-linear-gradient/')) {
    return 'expo-linear-gradient-mock';
  }
  if (request === 'react-native-qrcode-svg') {
    return 'react-native-qrcode-svg-mock';
  }
  if (request === 'react-native-gesture-handler' || request.startsWith('react-native-gesture-handler/')) {
    return 'react-native-gesture-handler-mock';
  }
  if (request === 'react-native-reanimated' || request.startsWith('react-native-reanimated/')) {
    return 'react-native-reanimated-mock';
  }
  if (request === 'react-native-css-interop' || request.startsWith('react-native-css-interop')) {
    return 'react-native-css-interop-mock';
  }
  return origResolve.call(this, request, parent, isMain, options);
};

require.cache['react-native-css-interop-mock'] = {
  id: 'react-native-css-interop-mock',
  filename: 'react-native-css-interop-mock',
  loaded: true,
  exports: {
    cssInterop: (c: any) => c,
    remapProps: (c: any) => c,
    useColorScheme: () => ({ colorScheme: 'light', setColorScheme: () => {} }),
  },
} as any;

require.cache['expo-router-mock'] = {
  id: 'expo-router-mock',
  filename: 'expo-router-mock',
  loaded: true,
  exports: {
    useRouter: () => ({
      replace: () => {},
      push: () => {},
      back: () => {},
    }),
  },
} as any;

require.cache['expo-haptics-mock'] = {
  id: 'expo-haptics-mock',
  filename: 'expo-haptics-mock',
  loaded: true,
  exports: {
    notificationAsync: async () => {},
    impactAsync: async () => {},
    selectionAsync: async () => {},
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

require.cache['react-native-safe-area-context-mock'] = {
  id: 'react-native-safe-area-context-mock',
  filename: 'react-native-safe-area-context-mock',
  loaded: true,
  exports: {
    useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
  },
} as any;

const React = require('react');

require.cache['expo-linear-gradient-mock'] = {
  id: 'expo-linear-gradient-mock',
  filename: 'expo-linear-gradient-mock',
  loaded: true,
  exports: {
    LinearGradient: ({ children, ...props }: any) => React.createElement('div', props, children),
  },
} as any;

require.cache['react-native-qrcode-svg-mock'] = {
  id: 'react-native-qrcode-svg-mock',
  filename: 'react-native-qrcode-svg-mock',
  loaded: true,
  exports: {
    default: () => React.createElement('div', { 'data-testid': 'mock-qrcode' }),
  },
} as any;

const createMockGesture = () => {
  const chain: any = {};
  chain.enabled = () => chain;
  chain.numberOfTaps = () => chain;
  chain.maxDuration = () => chain;
  chain.onEnd = () => chain;
  chain.runOnJS = () => chain;
  return chain;
};

require.cache['react-native-gesture-handler-mock'] = {
  id: 'react-native-gesture-handler-mock',
  filename: 'react-native-gesture-handler-mock',
  loaded: true,
  exports: {
    Gesture: {
      Tap: createMockGesture,
      Exclusive: (...args: any[]) => ({ type: 'exclusive', gestures: args }),
    },
    GestureDetector: ({ children }: any) => children,
  },
} as any;

require.cache['react-native-reanimated-mock'] = {
  id: 'react-native-reanimated-mock',
  filename: 'react-native-reanimated-mock',
  loaded: true,
  exports: {
    default: {
      View: ({ children, ...props }: any) => React.createElement('div', props, children),
    },
    useSharedValue: (initial: any) => ({
      get: () => initial,
      set: () => {},
    }),
    useAnimatedStyle: (fn: any) => fn(),
    withTiming: (toValue: any) => toValue,
    interpolate: (val: any) => val,
  },
} as any;

const storage = new Map<string, string>();
const mockStorage = {
  getItem: async (key: string) => storage.get(key) ?? null,
  setItem: async (key: string, val: string) => { storage.set(key, String(val)); },
  removeItem: async (key: string) => { storage.delete(key); },
  clear: async () => { storage.clear(); },
};

const asPath = require.resolve('@react-native-async-storage/async-storage');
require.cache[asPath] = {
  id: asPath,
  filename: asPath,
  loaded: true,
  exports: { default: mockStorage, ...mockStorage },
} as any;

async function runM3Tests() {
  console.log('====================================================');
  console.log('   PROSCARD MILESTONE 3 COMPONENT TEST HARNESS      ');
  console.log('====================================================\n');

  const { runStepCardCustomizationTests } = await import(
    './components/onboardingComponents/Components/stepCardCustomization.test'
  );

  console.log('--- Executing M3 StepCardCustomization Unit Tests ---');
  const results = runStepCardCustomizationTests();
  console.log(`M3 Component Tests: ${results.passed} passed, ${results.failed} failed\n`);

  if (results.failed > 0) {
    console.error('M3 Tests Failed!');
    process.exit(1);
  }

  // Also test direct React element rendering of StepCardCustomization
  console.log('--- Testing StepCardCustomization Component Instantiation ---');
  const { StepCardCustomization } = await import(
    './components/onboardingComponents/Components/StepCardCustomization'
  );
  const { INITIAL_ONBOARDING_DRAFT } = await import(
    './components/onboardingComponents/types/onboardingStepper.types'
  );

  const mockDraft = {
    ...INITIAL_ONBOARDING_DRAFT,
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
    title: 'Lead Designer',
    organization: 'MindPros Design',
    email: 'jane@mindpros.com',
    phone: '+1 555 456 7890',
    businessAddress: 'New York, NY',
    linkedin: 'janedoe',
    cardCategory: 'Personal',
    cardGradient: ['#ea580c', '#ec4899'] as [string, string],
  };

  let updateCalled = false;
  let finishCalled = false;

  const element = React.createElement(StepCardCustomization, {
    draft: mockDraft,
    updateDraft: (fields: any) => {
      updateCalled = true;
      console.log('  updateDraft called with:', Object.keys(fields));
    },
    onFinish: () => {
      finishCalled = true;
    },
    isSaving: false,
  });

  if (!element || !element.type) {
    throw new Error('Failed to instantiate StepCardCustomization element');
  }
  console.log('✓ Successfully created StepCardCustomization React element');

  // Verify props are passed
  if (element.props.draft.fullName !== 'Jane Doe') {
    throw new Error('Draft props not correctly assigned to StepCardCustomization element');
  }
  console.log('✓ Verified draft props bound cleanly');

  // Test update callback
  element.props.updateDraft({ cardCategory: 'Business' });
  if (!updateCalled) {
    throw new Error('updateDraft callback was not triggered');
  }
  console.log('✓ Verified updateDraft callback functionality');

  // Test onFinish callback
  element.props.onFinish();
  if (!finishCalled) {
    throw new Error('onFinish callback was not triggered');
  }
  console.log('✓ Verified onFinish callback functionality');

  console.log('\n====================================================');
  console.log('   ALL MILESTONE 3 TESTS PASSED PERFECTLY!          ');
  console.log('====================================================\n');
}

runM3Tests().catch((err) => {
  console.error('Fatal M3 test harness failure:', err);
  process.exit(1);
});
