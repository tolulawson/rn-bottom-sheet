import { getHostComponent } from 'react-native-nitro-modules';
import type {
  RnBottomSheetMethods,
  RnBottomSheetProps,
} from '../RnBottomSheet.nitro';

const RnBottomSheetConfig = require('../../nitrogen/generated/shared/json/RnBottomSheetConfig.json');

/**
 * Internal native view component.
 * Use BottomSheet for the public API.
 */
export const RnBottomSheetView = getHostComponent<
  RnBottomSheetProps,
  RnBottomSheetMethods
>('RnBottomSheet', () => RnBottomSheetConfig);
