// components/profileComponents/Services/profileService.stress.test.ts
import {
  getProfile,
  saveProfile,
  getStoredUser,
  logoutUser,
  DEFAULT_PROFILE,
} from './profileService';
import type { Profile, StoredUser } from '../types/profile.types';

function assertEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual !== expected) {
    throw new Error(`Assert failed: expected ${String(expected)}, got ${String(actual)}. ${msg || ''}`);
  }
}

export async function runProfileServiceStressTests(
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

  const testCases: [string, () => Promise<void> | void][] = [
    [
      'STRESS-PROF-01: getProfile returns DEFAULT_PROFILE when storage is empty',
      async () => {
        await mockStorage.removeItem('userProfile');
        const profile = await getProfile();
        assertEqual(profile.fullName, '');
        assertEqual(profile.email, '');
        assertEqual(profile.social.linkedin, '');
        assertEqual(profile.social.github, '');
        assertEqual(profile.social.portfolio, '');
      },
    ],
    [
      'STRESS-PROF-02: saveProfile persists full profile and returns it',
      async () => {
        const testProfile: Profile = {
          ...DEFAULT_PROFILE,
          fullName: 'Grace Hopper',
          email: 'grace@navy.mil',
          title: 'Rear Admiral',
          organization: 'US Navy',
          social: {
            ...DEFAULT_PROFILE.social,
            github: 'https://github.com/ghopper',
            portfolio: 'https://hopper.dev',
          },
        };

        const saved = await saveProfile(testProfile);
        assertEqual(saved.fullName, 'Grace Hopper');

        const readBack = await getProfile();
        assertEqual(readBack.fullName, 'Grace Hopper');
        assertEqual(readBack.social.github, 'https://github.com/ghopper');
        assertEqual(readBack.social.portfolio, 'https://hopper.dev');
      },
    ],
    [
      'STRESS-PROF-03: getProfile merges sparse partial profile with DEFAULT_PROFILE defaults',
      async () => {
        // Only set fullName in storage without other fields or nested social
        await mockStorage.setItem('userProfile', JSON.stringify({ fullName: 'Sparse User' }));

        const profile = await getProfile();
        assertEqual(profile.fullName, 'Sparse User');
        assertEqual(profile.email, '', 'Default email should be preserved');
        assertEqual(typeof profile.social, 'object');
        assertEqual(profile.social.github, '', 'Default social.github should be preserved');
        assertEqual(profile.social.x, '', 'Default social.x should be preserved');
      },
    ],
    [
      'STRESS-PROF-04: getStoredUser and logoutUser manage userInfo correctly',
      async () => {
        const user: StoredUser = { id: 'u1', username: 'testuser' };
        await mockStorage.setItem('userInfo', JSON.stringify(user));

        const fetched = await getStoredUser();
        assertEqual(fetched?.username, 'testuser');

        await logoutUser();
        const afterLogout = await getStoredUser();
        assertEqual(afterLogout, null);
      },
    ],
    [
      'STRESS-PROF-05: saveProfile propagates rejection when storage write fails',
      async () => {
        mockStorage.failNextSetItem = true;
        let threw = false;
        try {
          await saveProfile(DEFAULT_PROFILE);
        } catch {
          threw = true;
        } finally {
          mockStorage.failNextSetItem = false;
        }
        assertEqual(threw, true, 'saveProfile must reject when storage write fails');
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

  // Cleanup
  await mockStorage.clear();

  return { passed, failed, errors };
}
