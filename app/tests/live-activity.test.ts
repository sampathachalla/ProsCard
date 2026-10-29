import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Platform } from 'react-native';

const { factory, writeWidgetQrImage } = vi.hoisted(() => ({
  factory: { start: vi.fn(), getInstances: vi.fn() },
  writeWidgetQrImage: vi.fn().mockResolvedValue('file:///group/vcpros-live-activity-qr.png'),
}));

vi.mock('expo-constants', () => ({ default: { appOwnership: null } }));
vi.mock('@/pages/share/Services/homeScreenWidgetService', () => ({ writeWidgetQrImage }));
vi.mock('@/widgets/VCProsCardLiveActivity', () => ({ default: factory }));

import {
  isCardLiveActivityRunning,
  startCardLiveActivity,
  stopCardLiveActivity,
} from '@/pages/share/Services/liveActivityService';

const input = { cardName: 'Sampath', qrSvg: null, shareUrl: 'https://vcpros.example/share/card-1' };

describe('card Live Activity', () => {
  beforeEach(() => {
    Platform.OS = 'ios';
    writeWidgetQrImage.mockResolvedValue('file:///group/vcpros-live-activity-qr.png');
  });

  it('starts a Live Activity that opens the card link', async () => {
    factory.getInstances.mockReturnValue([]);

    await expect(startCardLiveActivity(input)).resolves.toBe('started');
    expect(factory.start).toHaveBeenCalledWith(
      { cardName: 'Sampath', qrImageUri: 'file:///group/vcpros-live-activity-qr.png' },
      'https://vcpros.example/share/card-1',
    );
  });

  it('replaces a running activity so only one card is shown', async () => {
    const running = { end: vi.fn().mockResolvedValue(undefined) };
    factory.getInstances.mockReturnValue([running]);

    await expect(startCardLiveActivity(input)).resolves.toBe('updated');
    expect(running.end).toHaveBeenCalledWith('immediate');
    expect(factory.start).toHaveBeenCalledTimes(1);
  });

  it('stops every running activity and reports state', async () => {
    const running = { end: vi.fn().mockResolvedValue(undefined) };
    factory.getInstances.mockReturnValue([running]);
    await expect(isCardLiveActivityRunning()).resolves.toBe(true);

    await stopCardLiveActivity();
    expect(running.end).toHaveBeenCalledWith('immediate');
  });

  it('is unavailable outside iOS', async () => {
    Platform.OS = 'android';
    await expect(startCardLiveActivity(input)).resolves.toBe('unsupported');
    await expect(isCardLiveActivityRunning()).resolves.toBe(false);
    expect(factory.start).not.toHaveBeenCalled();
  });
});
