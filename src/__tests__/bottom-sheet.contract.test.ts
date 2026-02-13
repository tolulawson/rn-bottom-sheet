jest.mock('react-native-nitro-modules', () => ({
  callback: <T extends (...args: any[]) => any>(fn: T) => fn,
  getHostComponent: () => () => null,
}));

describe('BottomSheet public contract', () => {
  it('exports the supported runtime API surface', () => {
    const PublicApi = require('../index') as Record<string, unknown>;

    expect(PublicApi.BottomSheet).toBeDefined();
    expect(PublicApi.BottomSheetView).toBeDefined();
    expect(PublicApi.BottomSheetNativeView).toBeDefined();
    expect(typeof PublicApi.createBottomSheetNavigationAdapter).toBe(
      'function'
    );
    expect(typeof PublicApi.useBottomSheetNavigation).toBe('function');
  });

  it('does not expose package-owned in-sheet navigation stack APIs', () => {
    const runtimeApi = require('../index') as Record<string, unknown>;

    expect(runtimeApi.BottomSheetNavigator).toBeUndefined();
    expect(runtimeApi.createBottomSheetNavigator).toBeUndefined();
    expect(runtimeApi.push).toBeUndefined();
    expect(runtimeApi.pop).toBeUndefined();
    expect(runtimeApi.replace).toBeUndefined();
  });
});
