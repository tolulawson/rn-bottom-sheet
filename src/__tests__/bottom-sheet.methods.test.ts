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

describe('bottom-sheet imperative methods and detent callbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLatestProps = null;
    mockNativeMethods.getCurrentDetentIndex.mockReturnValue(1);
  });

  it('forwards imperative snapToDetent calls to native methods', () => {
    const ref = createRef<BottomSheetMethods>();

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, { defaultOpen: false, ref })
      );
    });

    TestRenderer.act(() => {
      ref.current?.snapToDetent(2);
    });

    expect(mockNativeMethods.snapToDetent).toHaveBeenCalledWith(2);
  });

  it('maps native detent change events to onDetentChange callback', () => {
    const onDetentChange = jest.fn();

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, {
          defaultOpen: false,
          onDetentChange,
        })
      );
    });

    expect(mockLatestProps).not.toBeNull();

    TestRenderer.act(() => {
      mockLatestProps?.onDetentChange(1, 'swipe');
    });

    expect(onDetentChange).toHaveBeenCalledWith(1, 'swipe');
  });
});
