jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { Platform } from 'react-native';
import {
  createFallbackMethod,
  getFallbackState,
  getPlatformConfig,
  guardNativeOnly,
  isNativeSheetSupported,
  warnUnsupportedPlatform,
} from '../platform/fallback';

describe('non-ios fallback behavior', () => {
  const platform = Platform as { OS: string };
  const devGlobal = globalThis as typeof globalThis & { __DEV__?: boolean };
  const previousDev = devGlobal.__DEV__ ?? true;

  beforeEach(() => {
    platform.OS = 'ios';
    jest.clearAllMocks();
    devGlobal.__DEV__ = true;
  });

  afterAll(() => {
    devGlobal.__DEV__ = previousDev;
  });

  it('reports support only on ios', () => {
    platform.OS = 'ios';
    expect(isNativeSheetSupported()).toBe(true);

    platform.OS = 'android';
    expect(isNativeSheetSupported()).toBe(false);
  });

  it('returns deterministic fallback state on non-ios', () => {
    platform.OS = 'ios';
    expect(getFallbackState()).toBeNull();

    platform.OS = 'android';
    expect(getFallbackState()).toEqual({
      isFallback: true,
      reason: 'unsupported-platform',
      platform: 'android',
    });
  });

  it('warns and returns undefined for guarded native operations on non-ios', () => {
    platform.OS = 'android';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const callback = jest.fn(() => 42);

    const result = guardNativeOnly('present', callback);

    expect(result).toBeUndefined();
    expect(callback).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('present is not supported on android')
    );
  });

  it('creates fallback methods that emit warnings', () => {
    platform.OS = 'web';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const fallbackDismiss = createFallbackMethod('dismiss');

    fallbackDismiss();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('dismiss is not supported on web')
    );
  });

  it('does not warn when not in dev mode', () => {
    platform.OS = 'android';
    devGlobal.__DEV__ = false;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    warnUnsupportedPlatform('snapToDetent');

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('keeps styling feature flags deterministic by platform', () => {
    platform.OS = 'ios';
    expect(getPlatformConfig().features.preferredColorScheme).toBe(true);
    expect(getPlatformConfig().features.contentBackgroundStyle).toBe(true);
    expect(getPlatformConfig().features.contentBackgroundBlurStyle).toBe(true);

    platform.OS = 'android';
    expect(getPlatformConfig().features.preferredColorScheme).toBe(false);
    expect(getPlatformConfig().features.contentBackgroundStyle).toBe(false);
    expect(getPlatformConfig().features.contentBackgroundBlurStyle).toBe(false);
  });
});
