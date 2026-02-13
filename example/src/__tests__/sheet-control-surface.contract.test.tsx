import { createAppHarness } from './app-harness';
import { TEST_IDS } from '../testids';

describe('example control-surface contract', () => {
  it('exposes behavior controls inside the sheet and keeps parent summaries synced', () => {
    const harness = createAppHarness();

    expect(harness.hasButtonWithTestId(TEST_IDS.snapLargeButton)).toBe(false);
    expect(harness.hasButtonWithTestId(TEST_IDS.closeSheetButton)).toBe(false);

    harness.pressButtonByTestId(TEST_IDS.openSheetButton);

    expect(harness.getTextByTestId(TEST_IDS.sheetTitle)).toContain(
      'Sheet Controls'
    );
    expect(harness.getTextByTestId(TEST_IDS.sheetRouteSummary)).toContain(
      'In-Sheet Route: Summary'
    );
    expect(
      harness.getTextByTestId(TEST_IDS.sheetDetentPresetSummary)
    ).toContain('Detent preset: All detents');
    expect(harness.hasButtonWithTestId(TEST_IDS.snapLargeButton)).toBe(true);
    expect(harness.hasButtonWithTestId(TEST_IDS.cycleDetentPresetButton)).toBe(
      true
    );
    expect(
      harness.hasButtonWithTestId(TEST_IDS.cyclePreferredColorSchemeButton)
    ).toBe(true);
    expect(harness.hasButtonWithTestId(TEST_IDS.closeSheetButton)).toBe(true);
    expect(harness.hasButtonWithTestId(TEST_IDS.openSheetButton)).toBe(true);
    expect(harness.getViewStyleByTestId(TEST_IDS.sheetContent).width).toBe(
      '100%'
    );

    harness.pressButtonByTestId(TEST_IDS.routeToggleButton);
    expect(harness.getTextByTestId(TEST_IDS.mainRouteSummary)).toContain(
      'Route: Details'
    );

    harness.pressButtonByTestId(TEST_IDS.routeToggleButton);
    expect(harness.getTextByTestId(TEST_IDS.mainRouteSummary)).toContain(
      'Route: Summary'
    );

    harness.pressButtonByTestId(TEST_IDS.cycleDetentPresetButton);
    expect(harness.getTextByTestId(TEST_IDS.mainRouteSummary)).toContain(
      'Detents: Fit only'
    );

    harness.pressButtonByTestId(TEST_IDS.cyclePreferredColorSchemeButton);
    expect(harness.getTextByTestId(TEST_IDS.mainSheetStyleSummary)).toContain(
      'Sheet style: light / system / regular'
    );

    harness.pressButtonByTestId(TEST_IDS.closeSheetButton);
    expect(harness.getTextByTestId(TEST_IDS.mainSummary)).toContain(
      'Sheet: Closed'
    );
    expect(harness.getTextByTestId(TEST_IDS.mainRouteSummary)).toContain(
      'Route: Summary'
    );

    harness.unmount();
  });
});
