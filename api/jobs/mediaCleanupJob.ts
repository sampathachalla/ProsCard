import type { MediaService } from '../media/services/media.service.js';
import { log } from '../src/logger.js';

/** Max batches per tick so a huge backlog cannot block the process forever. */
const MAX_BATCHES_PER_TICK = 20;

export function startMediaCleanupJob(service: MediaService, intervalSeconds: number) {
  if (intervalSeconds === 0) return { stop() {} };

  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      let totalExamined = 0;
      let totalCleaned = 0;
      let totalFailed = 0;
      for (let batch = 0; batch < MAX_BATCHES_PER_TICK; batch++) {
        const result = await service.retryAllCleanup();
        totalExamined += result.examined;
        totalCleaned += result.cleaned;
        totalFailed += result.failed;
        // Stop when the queue is caught up, or when a batch made no progress: failed items stay queued,
        // so another batch this tick would only retry the same rows (e.g. during a storage outage).
        if (result.examined === 0 || result.cleaned === 0) break;
      }
      if (totalExamined > 0) {
        log('info', 'media_cleanup', {
          examined: totalExamined,
          cleaned: totalCleaned,
          failed: totalFailed,
        });
      }
    } catch (error) {
      log('error', 'media_cleanup_failed', {
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => void run(), intervalSeconds * 1000);
  timer.unref();
  void run();
  return { stop() { clearInterval(timer); } };
}
