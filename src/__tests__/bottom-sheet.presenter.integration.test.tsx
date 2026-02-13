import React, { createRef } from 'react';
import TestRenderer from 'react-test-renderer';
import { BottomSheet } from '../components/BottomSheet';
import type { RnBottomSheetProps } from '../RnBottomSheet.nitro';
import type { BottomSheetMethods } from '../types/bottom-sheet';

type MockRnBottomSheetViewProps = RnBottomSheetProps & {
  hybridRef?: (instance: unknown) => void;
};

const mockNativeMethods = {
  present: jest.fn(),
  dismiss: jest.fn(),
  snapToDetent: jest.fn(),
  getCurrentDetentIndex: jest.fn(),
};

let mockLatestProps: MockRnBottomSheetViewProps | null = null;

jest.mock('react-native-nitro-modules', () => ({
  callback: <T extends (...args: any[]) => any>(fn: T) => fn,
}));

jest.mock('../platform/fallback', () => ({
  isNativeSheetSupported: () => true,
  warnUnsupportedPlatform: jest.fn(),
}));

jest.mock('../native/RnBottomSheetView', () => {
  const ReactRuntime = require('react');

  return {
    RnBottomSheetView: (props: MockRnBottomSheetViewProps) => {
      mockLatestProps = props;

      ReactRuntime.useEffect(() => {
        props.hybridRef?.(mockNativeMethods as never);
      }, [props.hybridRef]);

      return null;
    },
  };
});

describe('bottom-sheet presenter lifecycle integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLatestProps = null;
  });

  it('forwards native lifecycle callbacks in presenter order', () => {
    const callbackOrder: string[] = [];

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, {
          defaultOpen: false,
          onWillPresent: () => callbackOrder.push('willPresent'),
          onDidPresent: () => callbackOrder.push('didPresent'),
          onWillDismiss: () => callbackOrder.push('willDismiss'),
          onDidDismiss: () => callbackOrder.push('didDismiss'),
        })
      );
    });

    expect(mockLatestProps).not.toBeNull();

    TestRenderer.act(() => {
      mockLatestProps?.onWillPresent();
      mockLatestProps?.onDidPresent();
      mockLatestProps?.onWillDismiss();
      mockLatestProps?.onDidDismiss();
    });

    expect(callbackOrder).toEqual([
      'willPresent',
      'didPresent',
      'willDismiss',
      'didDismiss',
    ]);
  });

  it('synchronizes uncontrolled open state from native presenter events', () => {
    const ref = createRef<BottomSheetMethods>();
    const onOpenChange = jest.fn();
    const onWillPresent = jest.fn();
    const onDidPresent = jest.fn();
    const onWillDismiss = jest.fn();
    const onDidDismiss = jest.fn();

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, {
          ref,
          defaultOpen: false,
          onOpenChange,
          onWillPresent,
          onDidPresent,
          onWillDismiss,
          onDidDismiss,
        })
      );
    });

    expect(mockLatestProps?.isOpen).toBe(false);

    TestRenderer.act(() => {
      ref.current?.present();
    });

    expect(mockNativeMethods.present).toHaveBeenCalledTimes(1);
    expect(mockLatestProps?.isOpen).toBe(true);

    TestRenderer.act(() => {
      mockLatestProps?.onWillPresent();
      mockLatestProps?.onDidPresent();
      mockLatestProps?.onOpenChange(true, 'programmatic');
    });

    expect(onWillPresent).toHaveBeenCalledTimes(1);
    expect(onDidPresent).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true, 'programmatic');

    TestRenderer.act(() => {
      mockLatestProps?.onWillDismiss();
      mockLatestProps?.onDidDismiss();
      mockLatestProps?.onOpenChange(false, 'swipe');
    });

    expect(onWillDismiss).toHaveBeenCalledTimes(1);
    expect(onDidDismiss).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false, 'swipe');
    expect(mockLatestProps?.isOpen).toBe(false);
  });

  it('keeps controlled mode callback-only for present and dismiss', () => {
    const ref = createRef<BottomSheetMethods>();
    const onOpenChange = jest.fn();

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, {
          ref,
          isOpen: false,
          onOpenChange,
        })
      );
    });

    expect(mockLatestProps?.isOpen).toBe(false);

    TestRenderer.act(() => {
      ref.current?.present();
      ref.current?.dismiss();
    });

    expect(mockNativeMethods.present).not.toHaveBeenCalled();
    expect(mockNativeMethods.dismiss).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(true, 'programmatic');
    expect(onOpenChange).toHaveBeenCalledWith(false, 'programmatic');
    expect(mockLatestProps?.isOpen).toBe(false);
  });

  it('forwards styling props to native presenter host with defaults', () => {
    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, {
          defaultOpen: false,
          preferredColorScheme: 'dark',
          contentBackgroundStyle: 'blur',
          contentBackgroundBlurStyle: 'prominent',
        })
      );
    });

    expect(mockLatestProps?.preferredColorScheme).toBe('dark');
    expect(mockLatestProps?.contentBackgroundStyle).toBe('blur');
    expect(mockLatestProps?.contentBackgroundBlurStyle).toBe('prominent');
  });
});
