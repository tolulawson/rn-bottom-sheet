import { callback, type HybridRef } from 'react-native-nitro-modules';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import type {
  NativeChangeReason,
  RnBottomSheetMethods,
  RnBottomSheetProps,
} from '../RnBottomSheet.nitro';
import { RnBottomSheetView } from '../native/RnBottomSheetView';
import {
  isNativeSheetSupported,
  warnUnsupportedPlatform,
} from '../platform/fallback';
import type {
  BottomSheetMethods,
  BottomSheetProps,
} from '../types/bottom-sheet';
import {
  createLifecycleHandlers,
  isControlledProps,
  toNativeContentBackgroundBlurStyle,
  toNativeContentBackgroundStyle,
  resolveInitialDetentIndex,
  resolveSelectedDetentIndex,
  toNativeBackgroundInteraction,
  toNativeDetentConfig,
  toNativePreferredColorScheme,
} from './bottom-sheet-utils';

type NativeBottomSheetRef = HybridRef<RnBottomSheetProps, RnBottomSheetMethods>;

export const BottomSheet = forwardRef<BottomSheetMethods, BottomSheetProps>(
  function BottomSheet(props, ref) {
    const supported = isNativeSheetSupported();
    const controlled = isControlledProps(props);

    const {
      detents,
      initialDetent,
      selectedDetent,
      onOpenChange,
      onDetentChange,
      onWillPresent,
      onDidPresent,
      onWillDismiss,
      onDidDismiss,
      grabberVisible = true,
      allowSwipeToDismiss = true,
      backgroundInteraction,
      cornerRadius = -1,
      expandsWhenScrolledToEdge = true,
      preferredColorScheme,
      contentBackgroundStyle,
      contentBackgroundBlurStyle,
      children,
    } = props;

    const [uncontrolledOpen, setUncontrolledOpen] = useState(() => {
      if (!controlled && 'defaultOpen' in props) {
        return Boolean(props.defaultOpen);
      }
      return false;
    });
    const nativeRef = useRef<NativeBottomSheetRef | null>(null);

    const nativeDetents = useMemo(
      () => toNativeDetentConfig(detents),
      [detents]
    );
    const nativeBackgroundInteraction = useMemo(
      () => toNativeBackgroundInteraction(backgroundInteraction),
      [backgroundInteraction]
    );
    const nativePreferredColorScheme = useMemo(
      () => toNativePreferredColorScheme(preferredColorScheme),
      [preferredColorScheme]
    );
    const nativeContentBackgroundStyle = useMemo(
      () => toNativeContentBackgroundStyle(contentBackgroundStyle),
      [contentBackgroundStyle]
    );
    const nativeContentBackgroundBlurStyle = useMemo(
      () => toNativeContentBackgroundBlurStyle(contentBackgroundBlurStyle),
      [contentBackgroundBlurStyle]
    );
    const initialDetentIndex = useMemo(
      () => resolveInitialDetentIndex(initialDetent, nativeDetents.length),
      [initialDetent, nativeDetents.length]
    );
    const selectedDetentIndex = useMemo(
      () => resolveSelectedDetentIndex(selectedDetent, nativeDetents.length),
      [selectedDetent, nativeDetents.length]
    );

    const resolvedIsOpen = isControlledProps(props)
      ? props.isOpen
      : uncontrolledOpen;

    const handleHybridRef = useCallback((instance: NativeBottomSheetRef) => {
      nativeRef.current = instance;
    }, []);

    const handleNativeOpenChange = useCallback(
      (nextOpen: boolean, reason: NativeChangeReason) => {
        if (!controlled) {
          setUncontrolledOpen(nextOpen);
        }
        onOpenChange?.(nextOpen, reason);
      },
      [controlled, onOpenChange]
    );
    const handleNativeDetentChange = useCallback(
      (index: number, reason: NativeChangeReason) => {
        onDetentChange?.(index, reason);
      },
      [onDetentChange]
    );
    const lifecycleHandlers = useMemo(
      () =>
        createLifecycleHandlers({
          onWillPresent,
          onDidPresent,
          onWillDismiss,
          onDidDismiss,
        }),
      [onDidDismiss, onDidPresent, onWillDismiss, onWillPresent]
    );

    useEffect(() => {
      if (!supported) {
        warnUnsupportedPlatform('BottomSheet');
      }
    }, [supported]);

    useImperativeHandle(
      ref,
      () => ({
        present() {
          if (!supported) {
            if (!controlled) {
              setUncontrolledOpen(true);
            }
            onOpenChange?.(true, 'programmatic');
            warnUnsupportedPlatform('present');
            return;
          }

          if (controlled) {
            onOpenChange?.(true, 'programmatic');
            return;
          }

          setUncontrolledOpen(true);
          nativeRef.current?.present();
        },
        dismiss() {
          if (!supported) {
            if (!controlled) {
              setUncontrolledOpen(false);
            }
            onOpenChange?.(false, 'programmatic');
            warnUnsupportedPlatform('dismiss');
            return;
          }

          if (controlled) {
            onOpenChange?.(false, 'programmatic');
            return;
          }

          setUncontrolledOpen(false);
          nativeRef.current?.dismiss();
        },
        snapToDetent(index: number) {
          if (!supported) {
            warnUnsupportedPlatform('snapToDetent');
            return;
          }

          nativeRef.current?.snapToDetent(index);
        },
        getCurrentDetentIndex() {
          if (!supported) {
            warnUnsupportedPlatform('getCurrentDetentIndex');
            return -1;
          }

          return nativeRef.current?.getCurrentDetentIndex() ?? -1;
        },
      }),
      [controlled, onOpenChange, supported]
    );

    if (!supported) {
      return resolvedIsOpen ? <View>{children}</View> : null;
    }

    return (
      <RnBottomSheetView
        hybridRef={callback(handleHybridRef)}
        isOpen={resolvedIsOpen}
        detents={nativeDetents}
        initialDetentIndex={initialDetentIndex}
        selectedDetentIndex={selectedDetentIndex}
        grabberVisible={grabberVisible}
        allowSwipeToDismiss={allowSwipeToDismiss}
        backgroundInteraction={nativeBackgroundInteraction}
        cornerRadius={cornerRadius}
        expandsWhenScrolledToEdge={expandsWhenScrolledToEdge}
        preferredColorScheme={nativePreferredColorScheme}
        contentBackgroundStyle={nativeContentBackgroundStyle}
        contentBackgroundBlurStyle={nativeContentBackgroundBlurStyle}
        onOpenChange={callback(handleNativeOpenChange)}
        onDetentChange={callback(handleNativeDetentChange)}
        onWillPresent={callback(lifecycleHandlers.onNativeWillPresent)}
        onDidPresent={callback(lifecycleHandlers.onNativeDidPresent)}
        onWillDismiss={callback(lifecycleHandlers.onNativeWillDismiss)}
        onDidDismiss={callback(lifecycleHandlers.onNativeDidDismiss)}
      >
        {children}
      </RnBottomSheetView>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';
