/**
 * Nitro View Contract for RnBottomSheet
 *
 * This file defines the native view interface used by Nitrogen to generate
 * the Swift/Kotlin bindings and JavaScript host component configuration.
 *
 * IMPORTANT: Run `yarn nitrogen` after any changes to regenerate bindings.
 */

import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

// =============================================================================
// Detent Types (Native Bridge)
// =============================================================================

/**
 * Detent configuration passed to native layer.
 * Native code interprets the type field to construct appropriate UIKit detents.
 */
export type NativeDetentType = 'semantic' | 'fraction' | 'points';

export interface NativeDetentConfig {
  /** Detent type: 'semantic', 'fraction', or 'points' */
  type: NativeDetentType;
  /** For semantic: 'medium' or 'large'. For fraction/points: numeric value */
  value: string | number;
  /** Unique identifier for this detent */
  identifier: string;
}

// =============================================================================
// Callback Types (Native Bridge)
// =============================================================================

/**
 * Reason for state change, mapped from native events.
 */
export type NativeChangeReason =
  | 'programmatic'
  | 'swipe'
  | 'backdrop'
  | 'system';

/**
 * Background interaction mode for native layer.
 */
export type NativeBackgroundInteraction = string | number;

// =============================================================================
// Props Interface
// =============================================================================

export interface RnBottomSheetProps extends HybridViewProps {
  /**
   * Array of detent configurations.
   * Native layer will convert these to UISheetPresentationController.Detent values.
   */
  detents: NativeDetentConfig[];

  /**
   * Index of the initially selected detent when sheet opens.
   */
  initialDetentIndex: number;

  /**
   * Index of the currently selected detent (for controlled mode).
   * -1 indicates uncontrolled mode.
   */
  selectedDetentIndex: number;

  /**
   * Whether the sheet is currently open.
   */
  isOpen: boolean;

  /**
   * Whether to show the grabber handle at top of sheet.
   */
  grabberVisible: boolean;

  /**
   * Whether swipe-to-dismiss is enabled.
   */
  allowSwipeToDismiss: boolean;

  /**
   * Background interaction mode.
   * 'modal' = dimmed, non-interactive
   * 'nonModal' = no dimming, interactive
   * number = interactive up through detent at that index
   */
  backgroundInteraction: NativeBackgroundInteraction;

  /**
   * Corner radius of the sheet. -1 for system default.
   */
  cornerRadius: number;

  /**
   * Whether sheet expands when scrolled content reaches edge.
   */
  expandsWhenScrolledToEdge: boolean;

  // -------------------------------------------------------------------------
  // Callbacks (wrapped by Nitro callback system)
  // -------------------------------------------------------------------------

  /**
   * Called when open state changes.
   * @param isOpen - New open state
   * @param reason - What caused the change
   */
  onOpenChange: (isOpen: boolean, reason: NativeChangeReason) => void;

  /**
   * Called when selected detent changes.
   * @param index - New detent index
   * @param reason - What caused the change
   */
  onDetentChange: (index: number, reason: NativeChangeReason) => void;

  /**
   * Called just before sheet begins presenting.
   */
  onWillPresent: () => void;

  /**
   * Called after sheet finishes presenting.
   */
  onDidPresent: () => void;

  /**
   * Called just before sheet begins dismissing.
   */
  onWillDismiss: () => void;

  /**
   * Called after sheet finishes dismissing.
   */
  onDidDismiss: () => void;
}

// =============================================================================
// Methods Interface
// =============================================================================

export interface RnBottomSheetMethods extends HybridViewMethods {
  /**
   * Present the sheet programmatically.
   */
  present(): void;

  /**
   * Dismiss the sheet programmatically.
   */
  dismiss(): void;

  /**
   * Snap to a specific detent by index.
   * @param index - Target detent index
   */
  snapToDetent(index: number): void;

  /**
   * Get the current detent index.
   * @returns Current detent index
   */
  getCurrentDetentIndex(): number;
}

// =============================================================================
// Hybrid View Type
// =============================================================================

export type RnBottomSheet = HybridView<
  RnBottomSheetProps,
  RnBottomSheetMethods
>;
