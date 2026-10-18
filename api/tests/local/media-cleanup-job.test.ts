import { describe, expect, it } from 'vitest';
import { startMediaCleanupJob } from '../../jobs/mediaCleanupJob.js';
import type { MediaService } from '../../media/services/media.service.js';

function fakeService(results: { examined: number; cleaned: number; failed: number }[]) {
  let calls = 0;
  const service = {
    retryAllCleanup: async () => results[Math.min(calls++, results.length - 1)]!,
  } as unknown as MediaService;
  return { service, calls: () => calls };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('media cleanup job', () => {
  it('stops after a batch that cleaned nothing, instead of retrying the same failures', async () => {
    const fake = fakeService([{ examined: 200, cleaned: 0, failed: 200 }]);
    const job = startMediaCleanupJob(fake.service, 3600);
    await flush();
    job.stop();
    expect(fake.calls()).toBe(1);
  });

  it('keeps working through the backlog while batches make progress', async () => {
    const fake = fakeService([
      { examined: 200, cleaned: 200, failed: 0 },
      { examined: 50, cleaned: 50, failed: 0 },
      { examined: 0, cleaned: 0, failed: 0 },
    ]);
    const job = startMediaCleanupJob(fake.service, 3600);
    await flush();
    job.stop();
    expect(fake.calls()).toBe(3);
  });
});
