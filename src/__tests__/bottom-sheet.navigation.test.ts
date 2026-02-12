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

describe('bottom-sheet navigation sync behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLatestProps = null;
  });

  it('syncs controlled open state when route-level state changes', () => {
    const onOpenChange = jest.fn();
    let renderer: TestRenderer.ReactTestRenderer;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        React.createElement(BottomSheet, {
          isOpen: false,
          onOpenChange,
        })
      );
    });

    expect(mockLatestProps?.isOpen).toBe(false);

    TestRenderer.act(() => {
      renderer!.update(
        React.createElement(BottomSheet, {
          isOpen: true,
          onOpenChange,
        })
      );
    });

    expect(mockLatestProps?.isOpen).toBe(true);

    TestRenderer.act(() => {
      renderer!.update(
        React.createElement(BottomSheet, {
          isOpen: false,
          onOpenChange,
        })
      );
    });

    expect(mockLatestProps?.isOpen).toBe(false);
  });

  it('emits native close intent to controlled owner without forcing native dismiss', () => {
    const onOpenChange = jest.fn();

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, {
          isOpen: true,
          onOpenChange,
        })
      );
    });

    expect(mockLatestProps?.isOpen).toBe(true);

    TestRenderer.act(() => {
      mockLatestProps?.onOpenChange(false, 'swipe');
    });

    expect(onOpenChange).toHaveBeenCalledWith(false, 'swipe');
    expect(mockLatestProps?.isOpen).toBe(true);
    expect(mockNativeMethods.dismiss).not.toHaveBeenCalled();
  });

  it('forwards non-programmatic close reasons from native callbacks', () => {
    const onOpenChange = jest.fn();

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, {
          isOpen: true,
          onOpenChange,
        })
      );
    });

    TestRenderer.act(() => {
      mockLatestProps?.onOpenChange(false, 'backdrop');
      mockLatestProps?.onOpenChange(false, 'system');
    });

    expect(onOpenChange).toHaveBeenNthCalledWith(1, false, 'backdrop');
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false, 'system');
  });

  it('uses callback-only imperative flow in controlled mode to avoid loops', () => {
    const onOpenChange = jest.fn();
    const ref = createRef<BottomSheetMethods>();

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, {
          isOpen: false,
          onOpenChange,
          ref,
        })
      );
    });

    TestRenderer.act(() => {
      ref.current?.present();
      ref.current?.dismiss();
    });

    expect(onOpenChange).toHaveBeenNthCalledWith(1, true, 'programmatic');
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false, 'programmatic');
    expect(mockNativeMethods.present).not.toHaveBeenCalled();
    expect(mockNativeMethods.dismiss).not.toHaveBeenCalled();
  });
});
