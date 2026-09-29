import { z } from 'zod';
export const onboardingDraftSchema = z.record(z.string(), z.unknown());
