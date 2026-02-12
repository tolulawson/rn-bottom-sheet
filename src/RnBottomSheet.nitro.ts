import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

export interface RnBottomSheetProps extends HybridViewProps {
  color: string;
}
export interface RnBottomSheetMethods extends HybridViewMethods {}

export type RnBottomSheet = HybridView<
  RnBottomSheetProps,
  RnBottomSheetMethods
>;
