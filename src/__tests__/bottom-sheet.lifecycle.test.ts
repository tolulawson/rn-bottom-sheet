import { createLifecycleHandlers } from '../components/bottom-sheet-utils';

describe('bottom-sheet lifecycle handlers', () => {
  it('maps native lifecycle events to user callbacks', () => {
    const onWillPresent = jest.fn();
    const onDidPresent = jest.fn();
    const onWillDismiss = jest.fn();
    const onDidDismiss = jest.fn();

    const handlers = createLifecycleHandlers({
      onWillPresent,
      onDidPresent,
      onWillDismiss,
      onDidDismiss,
    });

    handlers.onNativeWillPresent();
    handlers.onNativeDidPresent();
    handlers.onNativeWillDismiss();
    handlers.onNativeDidDismiss();

    expect(onWillPresent).toHaveBeenCalledTimes(1);
    expect(onDidPresent).toHaveBeenCalledTimes(1);
    expect(onWillDismiss).toHaveBeenCalledTimes(1);
    expect(onDidDismiss).toHaveBeenCalledTimes(1);
  });

  it('supports missing lifecycle callbacks without throwing', () => {
    const handlers = createLifecycleHandlers({});

    expect(() => handlers.onNativeWillPresent()).not.toThrow();
    expect(() => handlers.onNativeDidPresent()).not.toThrow();
    expect(() => handlers.onNativeWillDismiss()).not.toThrow();
    expect(() => handlers.onNativeDidDismiss()).not.toThrow();
  });
});
