/**
 * rn-bottom-sheet
 *
 * Native iOS sheet bindings for React Native using Nitro Views.
 */

import { getHostComponent } from 'react-native-nitro-modules';
const RnBottomSheetConfig = require('../nitrogen/generated/shared/json/RnBottomSheetConfig.json');
import type {
  RnBottomSheetMethods,
  RnBottomSheetProps,
} from './RnBottomSheet.nitro';

// =============================================================================
// Native View (internal)
// =============================================================================

/**
 * Internal native view component.
 * Use BottomSheet component for the public API.
 */
export const RnBottomSheetView = getHostComponent<
  RnBottomSheetProps,
  RnBottomSheetMethods
>('RnBottomSheet', () => RnBottomSheetConfig);

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
// Nitro Types (for advanced usage)
// =============================================================================

export type {
  NativeDetentConfig,
  NativeChangeReason,
  NativeBackgroundInteraction,
  RnBottomSheetProps as NativeBottomSheetProps,
  RnBottomSheetMethods as NativeBottomSheetMethods,
} from './RnBottomSheet.nitro';
