import React, { createRef } from 'react';
import TestRenderer from 'react-test-renderer';
import { BottomSheet } from '../components/BottomSheet';
import { toNativeDetentConfig } from '../components/bottom-sheet-utils';
import type { RnBottomSheetProps } from '../RnBottomSheet.nitro';
import type {
  BottomSheetMethods,
  BottomSheetProps,
} from '../types/bottom-sheet';

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

describe('bottom-sheet presenter detent integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLatestProps = null;
    mockNativeMethods.getCurrentDetentIndex.mockReturnValue(2);
  });

  it('forwards detent configuration and selected indexes to native presenter props', () => {
    const detents: BottomSheetProps['detents'] = [
      { type: 'points', value: 200 },
      'medium',
      'large',
    ];

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, {
          isOpen: true,
          onOpenChange: jest.fn(),
          detents,
          initialDetent: 1,
          selectedDetent: 2,
        })
      );
    });

    expect(mockLatestProps).not.toBeNull();
    expect(mockLatestProps?.detents).toEqual(toNativeDetentConfig(detents));
    expect(mockLatestProps?.initialDetentIndex).toBe(1);
    expect(mockLatestProps?.selectedDetentIndex).toBe(2);
  });

  it('updates selectedDetent index in native presenter when controlled props change', () => {
    const detents: BottomSheetProps['detents'] = ['medium', 'large'];

    let renderer: TestRenderer.ReactTestRenderer;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        React.createElement(BottomSheet, {
          isOpen: true,
          onOpenChange: jest.fn(),
          detents,
          selectedDetent: 0,
        })
      );
    });

    expect(mockLatestProps?.selectedDetentIndex).toBe(0);

    TestRenderer.act(() => {
      renderer.update(
        React.createElement(BottomSheet, {
          isOpen: true,
          onOpenChange: jest.fn(),
          detents,
          selectedDetent: 1,
        })
      );
    });

    expect(mockLatestProps?.selectedDetentIndex).toBe(1);
  });

  it('bridges native detent events and imperative detent methods', () => {
    const ref = createRef<BottomSheetMethods>();
    const onDetentChange = jest.fn();

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(BottomSheet, {
          ref,
          defaultOpen: false,
          detents: ['medium', 'large'],
          onDetentChange,
        })
      );
    });

    expect(mockLatestProps).not.toBeNull();

    TestRenderer.act(() => {
      mockLatestProps?.onDetentChange(1, 'swipe');
    });

    expect(onDetentChange).toHaveBeenCalledWith(1, 'swipe');

    TestRenderer.act(() => {
      ref.current?.snapToDetent(1);
    });

    expect(mockNativeMethods.snapToDetent).toHaveBeenCalledWith(1);
    expect(ref.current?.getCurrentDetentIndex()).toBe(2);
  });
});
