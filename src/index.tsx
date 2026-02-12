import { getHostComponent } from 'react-native-nitro-modules';
const RnBottomSheetConfig = require('../nitrogen/generated/shared/json/RnBottomSheetConfig.json');
import type {
  RnBottomSheetMethods,
  RnBottomSheetProps,
} from './RnBottomSheet.nitro';

export const RnBottomSheetView = getHostComponent<
  RnBottomSheetProps,
  RnBottomSheetMethods
>('RnBottomSheet', () => RnBottomSheetConfig);
