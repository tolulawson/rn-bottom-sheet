import type {
  RnBottomSheetMethods,
  RnBottomSheetProps,
} from '../RnBottomSheet.nitro';
import { RnBottomSheetView } from '../native/RnBottomSheetView';

export type BottomSheetNativeViewProps = RnBottomSheetProps;
export type BottomSheetNativeViewMethods = RnBottomSheetMethods;

/**
 * Documented Reanimated compatibility surface for direct native host usage.
 *
 * Supported animated prop pathways:
 * - `isOpen`
 * - `selectedDetentIndex`
 * - `backgroundInteraction`
 * - `cornerRadius`
 *
 * Non-goal:
 * - Frame-by-frame control over UIKit's internal sheet transition timeline.
 */
export const BottomSheetNativeView = RnBottomSheetView;
