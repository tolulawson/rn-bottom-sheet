jest.mock('react', () => require('../../../node_modules/react'));
jest.mock('react/jsx-runtime', () =>
  require('../../../node_modules/react/jsx-runtime')
);
jest.mock('react/jsx-dev-runtime', () =>
  require('../../../node_modules/react/jsx-dev-runtime')
);

const ReactRuntime = require('react');
const TestRenderer = require('react-test-renderer');

jest.mock('react-native', () => {
  const ReactNativeMockRuntime = require('react');

  const View = (props: any) =>
    ReactNativeMockRuntime.createElement('View', props, props.children);
  const Text = (props: any) =>
    ReactNativeMockRuntime.createElement('Text', props, props.children);
  const Button = (props: any) =>
    ReactNativeMockRuntime.createElement('Button', {
      accessibilityLabel: props.accessibilityLabel,
      onPress: props.onPress,
      testID: props.testID,
      title: props.title,
    });

  return {
    Button,
    StyleSheet: {
      create: (styles: unknown) => styles,
    },
    Text,
    View,
  };
});

jest.mock(
  'rn-bottom-sheet',
  () => {
    const ReactBottomSheetMockRuntime = require('react');
    const { View } = require('react-native');

    const BottomSheet = ReactBottomSheetMockRuntime.forwardRef(
      function BottomSheet(props: any, ref: any) {
        const {
          isOpen,
          onDidDismiss,
          onDidPresent,
          onDetentChange,
          onOpenChange,
          onWillDismiss,
          onWillPresent,
          selectedDetent,
          children,
        } = props;
        const previousOpenState = ReactBottomSheetMockRuntime.useRef(
          null as boolean | null
        );
        const previousSelectedDetent =
          ReactBottomSheetMockRuntime.useRef(selectedDetent);
        const currentDetentIndex = ReactBottomSheetMockRuntime.useRef(
          selectedDetent ?? 0
        );

        ReactBottomSheetMockRuntime.useImperativeHandle(
          ref,
          () => ({
            dismiss() {
              onOpenChange?.(false, 'programmatic');
            },
            getCurrentDetentIndex() {
              return currentDetentIndex.current;
            },
            present() {
              onOpenChange?.(true, 'programmatic');
            },
            snapToDetent(index: number) {
              currentDetentIndex.current = index;
              onDetentChange?.(index, 'programmatic');
            },
          }),
          [onDetentChange, onOpenChange]
        );

        ReactBottomSheetMockRuntime.useEffect(() => {
          if (previousOpenState.current === null) {
            previousOpenState.current = isOpen;
            return;
          }

          if (previousOpenState.current === isOpen) {
            return;
          }

          if (isOpen) {
            onWillPresent?.();
            onDidPresent?.();
            onOpenChange?.(true, 'programmatic');
          } else {
            onWillDismiss?.();
            onDidDismiss?.();
            onOpenChange?.(false, 'programmatic');
          }

          previousOpenState.current = isOpen;
        }, [
          isOpen,
          onDidDismiss,
          onDidPresent,
          onOpenChange,
          onWillDismiss,
          onWillPresent,
        ]);

        ReactBottomSheetMockRuntime.useEffect(() => {
          if (previousSelectedDetent.current === selectedDetent) {
            return;
          }

          if (typeof selectedDetent === 'number') {
            currentDetentIndex.current = selectedDetent;
            onDetentChange?.(selectedDetent, 'programmatic');
          }

          previousSelectedDetent.current = selectedDetent;
        }, [onDetentChange, selectedDetent]);

        if (!isOpen) {
          return null;
        }

        return ReactBottomSheetMockRuntime.createElement(
          View,
          { testID: 'mock-bottom-sheet' },
          children
        );
      }
    );
    BottomSheet.displayName = 'BottomSheetMock';

    const useBottomSheetNavigation = (options: any) => ({
      isOpen: options.routeIsOpen,
      onOpenChange(nextOpen: boolean, reason: string) {
        options.onOpenChange?.(nextOpen, reason);

        if (nextOpen === options.routeIsOpen) {
          return;
        }

        if (nextOpen) {
          options.onRouteOpen?.(reason);
          return;
        }

        options.onRouteClose?.(reason);
      },
    });

    return {
      BottomSheet,
      useBottomSheetNavigation,
    };
  },
  { virtual: true }
);

const { Button, Text } = require('react-native');
const App = require('../App').default;

function flattenTextContent(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => flattenTextContent(item)).join('');
  }

  if (value === null || value === undefined || typeof value === 'boolean') {
    return '';
  }

  return String(value);
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!style) {
    return {};
  }

  if (!Array.isArray(style)) {
    return style as Record<string, unknown>;
  }

  return style.reduce<Record<string, unknown>>((resolved, currentStyle) => {
    if (!currentStyle) {
      return resolved;
    }

    return {
      ...resolved,
      ...(currentStyle as Record<string, unknown>),
    };
  }, {});
}

export function createAppHarness() {
  let renderer: any;

  TestRenderer.act(() => {
    renderer = TestRenderer.create(ReactRuntime.createElement(App));
  });

  const getButtonByTitle = (title: string) => {
    const button = renderer.root
      .findAllByType(Button)
      .find((node: any) => node.props.title === title);

    if (!button) {
      throw new Error(`Expected button titled "${title}" to exist`);
    }

    return button;
  };

  const getButtonByTestId = (testID: string) => {
    const button = renderer.root
      .findAllByType(Button)
      .find((node: any) => node.props.testID === testID);

    if (!button) {
      throw new Error(`Expected button with testID "${testID}" to exist`);
    }

    return button;
  };

  const pressButtonByTitle = (title: string) => {
    TestRenderer.act(() => {
      getButtonByTitle(title).props.onPress();
    });
  };

  const pressButtonByTestId = (testID: string) => {
    TestRenderer.act(() => {
      getButtonByTestId(testID).props.onPress();
    });
  };

  const getTextByTestId = (testID: string) => {
    const textNode = renderer.root
      .findAllByType(Text)
      .find((node: any) => node.props.testID === testID);

    if (!textNode) {
      throw new Error(`Expected text with testID "${testID}" to exist`);
    }

    return flattenTextContent(textNode.props.children);
  };

  const hasButtonWithTestId = (testID: string) =>
    renderer.root
      .findAllByType(Button)
      .some((node: any) => node.props.testID === testID);

  const getViewStyleByTestId = (testID: string) => {
    const node = renderer.root
      .findAll((candidate: any) => candidate.props.testID === testID)
      .at(0);

    if (!node) {
      throw new Error(`Expected view with testID "${testID}" to exist`);
    }

    return flattenStyle(node.props.style);
  };

  const getAllTextContent = () =>
    renderer.root
      .findAllByType(Text)
      .map((node: any) => flattenTextContent(node.props.children));

  const getButtonTitles = () =>
    renderer.root.findAllByType(Button).map((node: any) => node.props.title);

  return {
    getAllTextContent,
    getButtonByTestId,
    getButtonTitles,
    getTextByTestId,
    getViewStyleByTestId,
    hasButtonWithTestId,
    pressButtonByTestId,
    pressButtonByTitle,
    unmount() {
      TestRenderer.act(() => {
        renderer.unmount();
      });
    },
  };
}
