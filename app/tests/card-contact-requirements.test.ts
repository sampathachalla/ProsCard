import { describe, expect, it } from 'vitest';
import { requiredCardConnectionStatus } from '@/pages/profile/Services/profileConnections';
import type { DynamicCardField } from '@/pages/cards/types/card.types';

function field(id: string, title: string, type: DynamicCardField['type'], value: string): DynamicCardField {
  return { id, title, type, value };
}

describe('shared onboarding and card contact requirements', () => {
  it('accepts an email plus a website', () => {
    const result = requiredCardConnectionStatus([
      field('email', 'Email', 'email', 'person@example.com'),
      field('website', 'Website', 'url', 'https://example.com'),
    ]);
    expect(result.complete).toBe(true);
  });

  it('accepts an email plus a social profile', () => {
    const result = requiredCardConnectionStatus([
      field('email', 'Email', 'email', 'person@example.com'),
      field('linkedin', 'LinkedIn', 'url', 'https://linkedin.com/in/person'),
    ]);
    expect(result.complete).toBe(true);
  });

  it('rejects phone and address when email or a link is missing', () => {
    const result = requiredCardConnectionStatus([
      field('phone', 'Phone', 'phone', '+1 555 123 4567'),
      field('address', 'Address', 'text', 'Baltimore, MD'),
    ]);
    expect(result.complete).toBe(false);
    expect(result.hasEmail).toBe(false);
    expect(result.hasWebsiteOrSocial).toBe(false);
  });
});
