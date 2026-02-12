/**
 * rn-bottom-sheet
 *
 * Native iOS sheet bindings for React Native using Nitro Views.
 */

import { BottomSheet } from './components/BottomSheet';
import { RnBottomSheetView } from './native/RnBottomSheetView';

// =============================================================================
// Public Components
// =============================================================================

/**
 * Public BottomSheet wrapper component.
 */
export { BottomSheet };

/**
 * Internal native view component export for advanced use-cases.
 */
export { RnBottomSheetView };

/**
 * Alias for native component export.
 */
export const BottomSheetView = RnBottomSheetView;

// =============================================================================
// Public Types
// =============================================================================

export type {
  // Detent types
  BottomSheetDetent,
  SemanticDetent,
  FractionDetent,
  PointsDetent,
  // Callback types
  BottomSheetChangeReason,
  OnOpenChangeCallback,
  OnDetentChangeCallback,
  LifecycleCallback,
  // Interaction types
  BackgroundInteractionMode,
  // Props types
  BottomSheetProps,
  BottomSheetBaseProps,
  ControlledProps,
  UncontrolledProps,
  // Methods types
  BottomSheetMethods,
  // Validation types
  DetentValidationResult,
  ConfigValidationResult,
} from './types/bottom-sheet';

// =============================================================================
// Utilities
// =============================================================================

export {
  // Validation
  validateDetent,
  validateDetents,
  // Normalization
  normalizeDetents,
  getDetentSortValue,
  getDetentIdentifier,
  // Type guards
  isSemanticDetent,
  isFractionDetent,
  isPointsDetent,
  // Native mapping
  detentToNativeIdentifier,
  detentsToNativeConfig,
  // Defaults
  DEFAULT_DETENTS,
  getDetentsWithDefaults,
} from './utils/detents';

// =============================================================================
// Optional Integration Utilities
// =============================================================================

export {
  createBottomSheetNavigationAdapter,
  useBottomSheetNavigation,
} from './navigation/bottom-sheet-adapter';

export type {
  BottomSheetNavigationAdapter,
  BottomSheetNavigationAdapterOptions,
} from './navigation/bottom-sheet-adapter';

// =============================================================================
// Nitro Types (for advanced usage)
// =============================================================================

export type {
  NativeDetentConfig,
  NativeChangeReason,
  NativeBackgroundInteraction,
  RnBottomSheetProps as NativeBottomSheetProps,
  RnBottomSheetMethods as NativeBottomSheetMethods,
} from './RnBottomSheet.nitro';
