// components/cardsComponents/Services/cardsService.test.ts
import {
  getCards,
  getCardById,
  savePrimaryCard,
  subscribeCards,
} from './cardsService';

function assertEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual !== expected) {
    throw new Error(`Assert failed: expected ${String(expected)}, got ${String(actual)}. ${msg || ''}`);
  }
}

export async function runCardsServiceTests(): Promise<{ passed: number; failed: number }> {
  let passed = 0;
  let failed = 0;

  const testCases: [string, () => void | Promise<void>][] = [
    [
      'test_getCards_returns_initial_cards',
      () => {
        const cards = getCards();
        assertEqual(Array.isArray(cards), true);
        assertEqual(cards.length >= 1, true);
        assertEqual(cards[0].id, '1');
      },
    ],
    [
      'test_getCardById_finds_card',
      () => {
        const card = getCardById('1');
        assertEqual(card !== undefined, true);
        assertEqual(card?.id, '1');
      },
    ],
    [
      'test_savePrimaryCard_updates_in_memory_and_notifies_listener',
      async () => {
        let notified = false;
        const unsubscribe = subscribeCards((updatedCards) => {
          notified = true;
          assertEqual(updatedCards[0].name, 'Test Name');
        });

        await savePrimaryCard({
          name: 'Test Name',
          title: 'Chief Tester',
          company: 'Test Co',
        });

        unsubscribe();
        assertEqual(notified, true, 'Listener should have been called');
        const primary = getCards()[0];
        assertEqual(primary.name, 'Test Name');
        assertEqual(primary.title, 'Chief Tester');
      },
    ],
    [
      'test_subscribeCards_unsubscribe_prevents_subsequent_calls',
      async () => {
        let callCount = 0;
        const unsubscribe = subscribeCards(() => {
          callCount++;
        });

        unsubscribe();
        await savePrimaryCard({
          name: 'Post Unsubscribe Name',
        });

        assertEqual(callCount, 0, 'Unsubscribed listener should not be called');
      },
    ],
  ];

  for (const [name, fn] of testCases) {
    try {
      await fn();
      passed++;
    } catch (err) {
      console.error(`FAILED: ${name}:`, err);
      failed++;
    }
  }

  // Teardown: restore default primary card
  await savePrimaryCard({
    name: 'Sampath Kambhampati',
    title: 'Founder & CEO',
    company: 'ProsCard',
  });

  return { passed, failed };
}
