import { createAppHarness } from './app-harness';
import { TEST_IDS } from '../testids';

describe('example single-open contract', () => {
  it('keeps one open transition while open/opening and supports reopen after close', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      // Silence expected callback logging in test assertions.
    });
    const harness = createAppHarness();

    harness.pressButtonByTestId(TEST_IDS.openSheetButton);
    harness.pressButtonByTestId(TEST_IDS.openSheetButton);
    harness.pressButtonByTestId(TEST_IDS.openSheetButton);

    expect(harness.getTextByTestId(TEST_IDS.mainSummary)).toContain(
      'Sheet: Open'
    );
    expect(harness.getTextByTestId(TEST_IDS.mainSheetPhase)).toContain(
      'Phase: open'
    );

    const willPresentCountAfterDuplicateOpen = consoleLogSpy.mock.calls.filter(
      (call) => call[0] === 'Will present'
    ).length;
    expect(willPresentCountAfterDuplicateOpen).toBe(1);

    harness.pressButtonByTestId(TEST_IDS.closeSheetButton);
    expect(harness.getTextByTestId(TEST_IDS.mainSummary)).toContain(
      'Sheet: Closed'
    );

    harness.pressButtonByTestId(TEST_IDS.openSheetButton);
    expect(harness.getTextByTestId(TEST_IDS.mainSummary)).toContain(
      'Sheet: Open'
    );

    const totalWillPresentCount = consoleLogSpy.mock.calls.filter(
      (call) => call[0] === 'Will present'
    ).length;
    expect(totalWillPresentCount).toBe(2);

    harness.unmount();
    consoleLogSpy.mockRestore();
  });
});
