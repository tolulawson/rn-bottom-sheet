import {
  isControlledProps,
  toNativeContentBackgroundBlurStyle,
  toNativeContentBackgroundStyle,
  resolveInitialDetentIndex,
  resolveSelectedDetentIndex,
  toNativeBackgroundInteraction,
  toNativeDetentConfig,
  toNativePreferredColorScheme,
} from '../components/bottom-sheet-utils';
import type { BottomSheetProps } from '../types/bottom-sheet';

describe('bottom-sheet wrapper utilities', () => {
  it('detects controlled props', () => {
    const controlledProps: BottomSheetProps = {
      isOpen: false,
      onOpenChange: jest.fn(),
    };

    expect(isControlledProps(controlledProps)).toBe(true);
  });

  it('detects uncontrolled props', () => {
    const uncontrolledProps: BottomSheetProps = {
      defaultOpen: true,
    };

    expect(isControlledProps(uncontrolledProps)).toBe(false);
  });

  it('maps background interaction mode to native shape', () => {
    expect(toNativeBackgroundInteraction(undefined)).toBe('modal');
    expect(toNativeBackgroundInteraction('nonModal')).toBe('nonModal');
    expect(toNativeBackgroundInteraction({ upThrough: 2 })).toBe(2);
  });

  it('maps styling props to native defaults and supported values', () => {
    expect(toNativePreferredColorScheme(undefined)).toBe('system');
    expect(toNativePreferredColorScheme('dark')).toBe('dark');
    expect(toNativeContentBackgroundStyle(undefined)).toBe('system');
    expect(toNativeContentBackgroundStyle('blur')).toBe('blur');
    expect(toNativeContentBackgroundBlurStyle(undefined)).toBe('regular');
    expect(toNativeContentBackgroundBlurStyle('prominent')).toBe('prominent');
  });

  it('rejects invalid styling values', () => {
    expect(() => toNativePreferredColorScheme('sepia' as never)).toThrow(
      'Invalid preferredColorScheme value'
    );
    expect(() => toNativeContentBackgroundStyle('glass' as never)).toThrow(
      'Invalid contentBackgroundStyle value'
    );
    expect(() => toNativeContentBackgroundBlurStyle('extra' as never)).toThrow(
      'Invalid contentBackgroundBlurStyle value'
    );
  });

  it('rejects invalid background interaction values', () => {
    expect(() => toNativeBackgroundInteraction({ upThrough: -1 })).toThrow(
      'Invalid backgroundInteraction.upThrough value'
    );
    expect(() => toNativeBackgroundInteraction({ upThrough: 1.5 })).toThrow(
      'Invalid backgroundInteraction.upThrough value'
    );
  });

  it('converts detents to native config and applies defaults', () => {
    expect(toNativeDetentConfig(undefined)).toEqual([
      {
        type: 'semantic',
        value: 'medium',
        identifier: 'medium',
      },
      {
        type: 'semantic',
        value: 'large',
        identifier: 'large',
      },
    ]);
  });

  it('rejects invalid detent configuration', () => {
    expect(() =>
      toNativeDetentConfig([{ type: 'fraction', value: 2 }])
    ).toThrow('Invalid detent configuration');
  });

  it('validates initial and selected detent indexes', () => {
    expect(resolveInitialDetentIndex(undefined, 2)).toBe(0);
    expect(resolveInitialDetentIndex(1, 2)).toBe(1);
    expect(resolveSelectedDetentIndex(undefined, 2)).toBe(-1);
    expect(resolveSelectedDetentIndex(1, 2)).toBe(1);
  });

  it('throws for out-of-range detent indexes', () => {
    expect(() => resolveInitialDetentIndex(2, 2)).toThrow(
      'initialDetent index 2 is out of bounds'
    );
    expect(() => resolveSelectedDetentIndex(-1, 2)).toThrow(
      'selectedDetent index -1 is out of bounds'
    );
  });
});
