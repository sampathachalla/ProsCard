// components/cardsComponents/Services/cardsService.stress.test.ts
import {
  getCards,
  savePrimaryCard,
  subscribeCards,
  notifyCardListeners,
  hydrateCards,
  CARDS,
} from './cardsService';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

function assertEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual !== expected) {
    throw new Error(`Assert failed: expected ${String(expected)}, got ${String(actual)}. ${msg || ''}`);
  }
}

export async function runCardsServiceStressTests(
  mockStorage: {
    getItem: (k: string) => Promise<string | null>;
    setItem: (k: string, v: string) => Promise<void>;
    removeItem: (k: string) => Promise<void>;
    clear: () => Promise<void>;
    failNextSetItem?: boolean;
  }
): Promise<{ passed: number; failed: number; errors: { test: string; error: string }[] }> {
  let passed = 0;
  let failed = 0;
  const errors: { test: string; error: string }[] = [];

  const initialPrimary = { ...CARDS[0] };

  const testCases: [string, () => Promise<void> | void][] = [
    [
      'STRESS-CARD-01: Partial field update preserves unmentioned properties',
      async () => {
        const original = { ...getCards()[0] };
        await savePrimaryCard({
          name: 'Ada Lovelace',
        });
        const current = getCards()[0];
        assertEqual(current.name, 'Ada Lovelace', 'Name should update');
        assertEqual(current.id, original.id, 'id should be preserved');
        assertEqual(current.category, original.category, 'category should be preserved');
        assertEqual(current.title, original.title, 'title should be preserved');
        assertEqual(current.company, original.company, 'company should be preserved');
        assertEqual(current.phone, original.phone, 'phone should be preserved');
        assertEqual(current.email, original.email, 'email should be preserved');
        assertEqual(current.gradient[0], original.gradient[0], 'gradient[0] should be preserved');
        assertEqual(current.gradient[1], original.gradient[1], 'gradient[1] should be preserved');
      },
    ],
    [
      'STRESS-CARD-02: Updating gradient replaces color tuple correctly',
      async () => {
        const newGradient: [string, string] = ['#ff0055', '#ffaa00'];
        await savePrimaryCard({ gradient: newGradient });
        const current = getCards()[0];
        assertEqual(current.gradient[0], '#ff0055');
        assertEqual(current.gradient[1], '#ffaa00');
      },
    ],
    [
      'STRESS-CARD-03: Multiple distinct subscribers all receive notifications in order',
      async () => {
        const order: number[] = [];
        const unsubs: (() => void)[] = [];

        unsubs.push(subscribeCards(() => { order.push(1); }));
        unsubs.push(subscribeCards(() => { order.push(2); }));
        unsubs.push(subscribeCards(() => { order.push(3); }));

        await savePrimaryCard({ name: 'Notification Order Test' });

        unsubs.forEach((u) => u());
        assertEqual(order.length, 3, 'All 3 subscribers must be called');
        assertEqual(order.join(','), '1,2,3', 'Subscribers must be notified in registration order');
      },
    ],
    [
      'STRESS-CARD-04: Duplicate subscription with same reference is idempotent',
      async () => {
        let callCount = 0;
        const listener = () => { callCount++; };

        const unsub1 = subscribeCards(listener);
        const unsub2 = subscribeCards(listener); // duplicate registration

        await savePrimaryCard({ name: 'Idempotency Test' });

        unsub1();
        unsub2();

        assertEqual(callCount, 1, 'Set semantics must prevent duplicate notifications for identical function reference');
      },
    ],
    [
      'STRESS-CARD-05: Double unsubscribe does not throw and leaves other listeners intact',
      async () => {
        let otherCalled = false;
        const unsubOther = subscribeCards(() => { otherCalled = true; });

        let targetCalled = false;
        const unsubTarget = subscribeCards(() => { targetCalled = true; });

        unsubTarget();
        unsubTarget(); // redundant call

        await savePrimaryCard({ name: 'Redundant Unsub Test' });
        unsubOther();

        assertEqual(targetCalled, false, 'Target should not be called');
        assertEqual(otherCalled, true, 'Other listener should still be called');
      },
    ],
    [
      'STRESS-CARD-06: Exception isolation: Throwing listener does not crash notifyCardListeners or block others',
      async () => {
        let secondListenerCalled = false;

        const unsubThrower = subscribeCards(() => {
          throw new Error('Adversarial listener failure!');
        });
        const unsubSecond = subscribeCards(() => {
          secondListenerCalled = true;
        });

        // notifyCardListeners catches errors internally
        notifyCardListeners();

        unsubThrower();
        unsubSecond();

        assertEqual(secondListenerCalled, true, 'Second listener must be called even if the first throws an exception');
      },
    ],
    [
      'STRESS-CARD-07: Rapid concurrent savePrimaryCard invocations preserve consistency',
      async () => {
        const promises = [];
        for (let i = 0; i < 20; i++) {
          promises.push(savePrimaryCard({ name: `Concurrent User ${i}` }));
        }
        await Promise.all(promises);

        const current = getCards()[0];
        assert(current.name.startsWith('Concurrent User'), 'Final primary card must have a valid concurrent name');
        assertEqual(getCards().length, 4, 'CARDS array length must remain unchanged at 4');
      },
    ],
    [
      'STRESS-CARD-08: AsyncStorage write failure in savePrimaryCard is caught gracefully',
      async () => {
        mockStorage.failNextSetItem = true;
        let notified = false;
        const unsub = subscribeCards(() => { notified = true; });

        // savePrimaryCard should not throw unhandled rejection
        const result = await savePrimaryCard({ name: 'Resilient User' });

        unsub();
        mockStorage.failNextSetItem = false;

        assertEqual(result.name, 'Resilient User', 'Updated card should be returned');
        assertEqual(getCards()[0].name, 'Resilient User', 'In-memory card should update');
        assertEqual(notified, true, 'Subscribers must still be notified');
      },
    ],
    [
      'STRESS-CARD-09: hydrateCards restores cards from stored userCards',
      async () => {
        const storedCards = [
          {
            id: '1',
            name: 'Hydrated Person',
            title: 'Hydrated Role',
            company: 'Hydrated Inc',
            category: 'Business',
            email: 'hydrated@inc.com',
            phone: '+1 800 000 0000',
            gradient: ['#000000', '#ffffff'],
          },
        ];
        await mockStorage.setItem('userCards', JSON.stringify(storedCards));

        let hydratedNotified = false;
        const unsub = subscribeCards(() => { hydratedNotified = true; });

        const hydrated = await hydrateCards();
        unsub();

        assertEqual(hydrated[0].name, 'Hydrated Person', 'CARDS[0] must be hydrated');
        assertEqual(hydratedNotified, true, 'Subscribers must be notified on hydration');
      },
    ],
    [
      'STRESS-CARD-10: hydrateCards with corrupt JSON in userCards handles gracefully',
      async () => {
        await mockStorage.setItem('userCards', '{corrupt json!@#$');

        // Should not throw
        const result = await hydrateCards();
        assert(Array.isArray(result), 'Result should still be cards array');
      },
    ],
  ];

  for (const [name, fn] of testCases) {
    try {
      await fn();
      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ test: name, error: msg });
      failed++;
    }
  }

  // Teardown: restore initial primary card
  await savePrimaryCard(initialPrimary);

  return { passed, failed, errors };
}
