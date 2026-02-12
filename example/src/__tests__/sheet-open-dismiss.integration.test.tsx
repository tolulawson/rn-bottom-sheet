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
      title: props.title,
      onPress: props.onPress,
    });

  return {
    View,
    Text,
    Button,
    StyleSheet: {
      create: (styles: unknown) => styles,
    },
  };
});

jest.mock(
  'rn-bottom-sheet',
  () => {
    const ReactBottomSheetMockRuntime = require('react');
    const { View } = require('react-native');

    function BottomSheet(props: any) {
      const {
        isOpen,
        onWillPresent,
        onDidPresent,
        onOpenChange,
        onWillDismiss,
        onDidDismiss,
        children,
      } = props;
      const previousOpenState = ReactBottomSheetMockRuntime.useRef(
        null as boolean | null
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

      if (!isOpen) {
        return null;
      }

      return ReactBottomSheetMockRuntime.createElement(
        View,
        { testID: 'mock-bottom-sheet' },
        children
      );
    }

    return {
      BottomSheet,
    };
  },
  { virtual: true }
);

const { Button, Text } = require('react-native');
const App = require('../App').default;

describe('example iOS open/dismiss integration flow', () => {
  it('opens and dismisses the sheet while emitting lifecycle callbacks', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      // Silence expected log noise from example callbacks during assertions.
    });
    let renderer: any;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(ReactRuntime.createElement(App));
    });

    const getStatusText = () => {
      const statusNode = renderer.root.findAllByType(Text).find((node: any) => {
        const text = flattenTextContent(node.props.children);
        return text.startsWith('Sheet:');
      });

      if (!statusNode) {
        throw new Error('Status text was not rendered');
      }

      return flattenTextContent(statusNode.props.children);
    };

    const getButtonByTitle = (title: string) => {
      const button = renderer.root
        .findAllByType(Button)
        .find((node: any) => node.props.title === title);

      if (!button) {
        throw new Error(`Expected button "${title}" to exist`);
      }

      return button;
    };

    expect(getStatusText()).toContain('Sheet: Closed');

    TestRenderer.act(() => {
      getButtonByTitle('Open Sheet').props.onPress();
    });

    expect(getStatusText()).toContain('Sheet: Open');

    TestRenderer.act(() => {
      getButtonByTitle('Close').props.onPress();
    });

    expect(getStatusText()).toContain('Sheet: Closed');

    const loggedMessages = consoleLogSpy.mock.calls.map((call) => call[0]);
    expect(loggedMessages).toEqual(
      expect.arrayContaining([
        'Will present',
        'Did present',
        'Sheet open changed: true, reason: programmatic',
        'Will dismiss',
        'Did dismiss',
        'Sheet open changed: false, reason: programmatic',
      ])
    );

    consoleLogSpy.mockRestore();
  });
});

function flattenTextContent(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => flattenTextContent(item)).join('');
  }

  if (value === null || value === undefined || typeof value === 'boolean') {
    return '';
  }

  return String(value);
}
