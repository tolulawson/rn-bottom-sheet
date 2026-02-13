/**
 * Non-iOS Fallback Utilities
 *
 * Provides deterministic fallback behavior for non-iOS platforms.
 * Per constitution: Non-iOS platforms get explicit fallback (no crash).
 */

import { Platform } from 'react-native';

// =============================================================================
// Platform Detection
// =============================================================================

/**
 * Check if native sheet is supported on current platform.
 */
export function isNativeSheetSupported(): boolean {
  return Platform.OS === 'ios';
}

/**
 * Get the current platform for logging.
 */
export function getPlatformName(): string {
  return Platform.OS;
}

// =============================================================================
// Warning Messages
// =============================================================================

const WARNING_PREFIX = '[rn-bottom-sheet]';

/**
 * Log a warning about unsupported platform usage.
 */
export function warnUnsupportedPlatform(operation: string): void {
  if (__DEV__) {
    console.warn(
      `${WARNING_PREFIX} ${operation} is not supported on ${getPlatformName()}. ` +
        `Native sheet functionality requires iOS. ` +
        `The component will render children without sheet behavior.`
    );
  }
}

/**
 * Log a warning about a specific unsupported feature.
 */
export function warnUnsupportedFeature(feature: string): void {
  if (__DEV__) {
    console.warn(
      `${WARNING_PREFIX} ${feature} is not available on ${getPlatformName()}.`
    );
  }
}

// =============================================================================
// Fallback Behavior
// =============================================================================

/**
 * Fallback state for non-iOS platforms.
 */
export interface FallbackState {
  /** Whether fallback mode is active */
  isFallback: true;
  /** Reason for fallback */
  reason: 'unsupported-platform';
  /** Platform name */
  platform: string;
}

/**
 * Get fallback state for current platform.
 */
export function getFallbackState(): FallbackState | null {
  if (isNativeSheetSupported()) {
    return null;
  }

  return {
    isFallback: true,
    reason: 'unsupported-platform',
    platform: getPlatformName(),
  };
}

// =============================================================================
// Guard Functions
// =============================================================================

/**
 * Execute a callback only if native sheet is supported.
 * Otherwise, log a warning and return undefined.
 */
export function guardNativeOnly<T>(
  operation: string,
  callback: () => T
): T | undefined {
  if (!isNativeSheetSupported()) {
    warnUnsupportedPlatform(operation);
    return undefined;
  }
  return callback();
}

/**
 * Create a no-op function that logs a warning when called on unsupported platforms.
 */
export function createFallbackMethod(methodName: string): () => void {
  return () => {
    warnUnsupportedPlatform(methodName);
  };
}

// =============================================================================
// Platform-Specific Config
// =============================================================================

/**
 * Platform-specific configuration defaults.
 */
export const PLATFORM_CONFIG = {
  ios: {
    supported: true,
    minVersion: 16,
    features: {
      detents: true,
      grabber: true,
      backgroundInteraction: true,
      cornerRadius: true,
      preferredColorScheme: true,
      contentBackgroundStyle: true,
      contentBackgroundBlurStyle: true,
    },
  },
  android: {
    supported: false,
    features: {
      detents: false,
      grabber: false,
      backgroundInteraction: false,
      cornerRadius: false,
      preferredColorScheme: false,
      contentBackgroundStyle: false,
      contentBackgroundBlurStyle: false,
    },
  },
  web: {
    supported: false,
    features: {
      detents: false,
      grabber: false,
      backgroundInteraction: false,
      cornerRadius: false,
      preferredColorScheme: false,
      contentBackgroundStyle: false,
      contentBackgroundBlurStyle: false,
    },
  },
} as const;

/**
 * Get configuration for the current platform.
 */
export function getPlatformConfig() {
  const platform = getPlatformName() as keyof typeof PLATFORM_CONFIG;
  return PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.android;
}
