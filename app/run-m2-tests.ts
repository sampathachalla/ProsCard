// run-m2-tests.ts
// Ambient declarations for Node.js test harness in Expo/RN project
declare const global: any;
declare const require: any;
declare const process: any;

const Module = require('module');

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
  if (request === 'react-native-safe-area-context') {
    return 'react-native-safe-area-context-mock';
  }
  return origResolve.call(this, request, parent, isMain, options);
};

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

async function runM2Tests() {
  console.log('====================================================');
  console.log('   PROSCARD MILESTONE 2 COMPONENT TEST HARNESS      ');
  console.log('====================================================\n');

  const { runOnboardingComponentsTests } = await import(
    './components/onboardingComponents/Components/onboardingComponents.test'
  );

  console.log('--- Executing M2 Component Unit Tests ---');
  const results = runOnboardingComponentsTests();
  console.log(`M2 Component Tests: ${results.passed} passed, ${results.failed} failed\n`);

  if (results.failed > 0) {
    console.error('M2 Tests Failed!');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('   ALL MILESTONE 2 TESTS PASSED PERFECTLY!          ');
  console.log('====================================================\n');
}

runM2Tests().catch((err) => {
  console.error('Fatal M2 test harness failure:', err);
  process.exit(1);
});
