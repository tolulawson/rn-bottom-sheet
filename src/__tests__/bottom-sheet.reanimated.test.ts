import React, { createRef } from 'react';
import TestRenderer from 'react-test-renderer';
import { BottomSheet } from '../components/BottomSheet';
import { BottomSheetView } from '../index';
import type { RnBottomSheetProps } from '../RnBottomSheet.nitro';
import type { BottomSheetMethods } from '../types/bottom-sheet';

type MockRnBottomSheetViewProps = RnBottomSheetProps & {
  hybridRef?: (instance: unknown) => void;
};

type CreateAnimatedComponent = <P extends object>(
  component: React.ComponentType<P>
) => React.ComponentType<P>;

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

  const MockRnBottomSheetView = ReactRuntime.forwardRef(function MockView(
    props: MockRnBottomSheetViewProps,
    _ref: React.Ref<unknown>
  ) {
    mockLatestProps = props;

    ReactRuntime.useEffect(() => {
      props.hybridRef?.(mockNativeMethods as never);
    }, [props.hybridRef]);

    return null;
  });

  return { RnBottomSheetView: MockRnBottomSheetView };
});

jest.mock(
  'react-native-reanimated',
  () => {
    const ReactRuntime = require('react');

    return {
      createAnimatedComponent: <P extends object>(
        Component: React.ComponentType<P>
      ) =>
        ReactRuntime.forwardRef(function AnimatedCompat(
          props: P,
          ref: React.Ref<unknown>
        ) {
          return ReactRuntime.createElement(
            Component as React.ComponentType<P>,
            {
              ...(props as object),
              ref,
            }
          );
        }),
    };
  },
  { virtual: true }
);

const { createAnimatedComponent } = jest.requireMock(
  'react-native-reanimated'
) as {
  createAnimatedComponent: CreateAnimatedComponent;
};

function createNativeProps(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    detents: [{ type: 'semantic', value: 'medium', identifier: 'medium' }],
    initialDetentIndex: 0,
    selectedDetentIndex: -1,
    isOpen: false,
    grabberVisible: true,
    allowSwipeToDismiss: true,
    backgroundInteraction: 'modal',
    cornerRadius: -1,
    expandsWhenScrolledToEdge: true,
    onOpenChange: jest.fn(),
    onDetentChange: jest.fn(),
    onWillPresent: jest.fn(),
    onDidPresent: jest.fn(),
    onWillDismiss: jest.fn(),
    onDidDismiss: jest.fn(),
    ...overrides,
  };
}

describe('bottom-sheet reanimated compatibility contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLatestProps = null;
  });

  it('supports animated wrapping of BottomSheet while preserving imperative ref methods', () => {
    const AnimatedBottomSheet = createAnimatedComponent(
      BottomSheet
    ) as typeof BottomSheet;
    const ref = createRef<BottomSheetMethods>();

    TestRenderer.act(() => {
      TestRenderer.create(
        React.createElement(AnimatedBottomSheet, {
          defaultOpen: false,
          ref,
        })
      );
    });

    TestRenderer.act(() => {
      ref.current?.present();
      ref.current?.snapToDetent(1);
      ref.current?.dismiss();
    });

    expect(mockNativeMethods.present).toHaveBeenCalledTimes(1);
    expect(mockNativeMethods.snapToDetent).toHaveBeenCalledWith(1);
    expect(mockNativeMethods.dismiss).toHaveBeenCalledTimes(1);
  });

  it('supports animated prop updates without breaking wrapper callbacks', () => {
    const AnimatedBottomSheet = createAnimatedComponent(
      BottomSheet
    ) as typeof BottomSheet;
    const onOpenChange = jest.fn();
    let renderer: TestRenderer.ReactTestRenderer;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        React.createElement(AnimatedBottomSheet, {
          isOpen: false,
          onOpenChange,
        })
      );
    });

    expect(mockLatestProps?.isOpen).toBe(false);

    TestRenderer.act(() => {
      renderer!.update(
        React.createElement(AnimatedBottomSheet, {
          isOpen: true,
          onOpenChange,
          selectedDetent: 0,
        })
      );
    });

    expect(mockLatestProps?.isOpen).toBe(true);
    expect(mockLatestProps?.selectedDetentIndex).toBe(0);

    TestRenderer.act(() => {
      mockLatestProps?.onOpenChange(false, 'swipe');
    });

    expect(onOpenChange).toHaveBeenCalledWith(false, 'swipe');
  });

  it('supports animated wrapping of the native host component export', () => {
    const AnimatedBottomSheetView = createAnimatedComponent(
      BottomSheetView as React.ComponentType<any>
    ) as React.ComponentType<any>;
    const firstProps = createNativeProps();
    let renderer: TestRenderer.ReactTestRenderer;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        React.createElement(AnimatedBottomSheetView, firstProps)
      );
    });

    expect(mockLatestProps?.isOpen).toBe(false);
    expect(mockLatestProps?.detents).toEqual(firstProps.detents);

    const updatedProps = createNativeProps({
      isOpen: true,
      selectedDetentIndex: 0,
      backgroundInteraction: 0,
    });

    TestRenderer.act(() => {
      renderer!.update(
        React.createElement(AnimatedBottomSheetView, updatedProps)
      );
    });

    expect(mockLatestProps?.isOpen).toBe(true);
    expect(mockLatestProps?.selectedDetentIndex).toBe(0);
    expect(mockLatestProps?.backgroundInteraction).toBe(0);
  });
});
