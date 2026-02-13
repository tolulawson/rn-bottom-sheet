import { createAppHarness } from './app-harness';
import { TEST_IDS } from '../testids';

describe('example iOS open/dismiss integration flow', () => {
  it('opens, uses in-sheet controls, updates route/theme summaries, and dismisses cleanly', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      // Silence expected callback logging in test assertions.
    });
    const harness = createAppHarness();

    expect(harness.getTextByTestId(TEST_IDS.mainSummary)).toContain(
      'Sheet: Closed'
    );
    expect(harness.getTextByTestId(TEST_IDS.mainRouteSummary)).toContain(
      'Route: Summary'
    );

    harness.pressButtonByTestId(TEST_IDS.openSheetButton);
    expect(harness.getTextByTestId(TEST_IDS.mainSummary)).toContain(
      'Sheet: Open'
    );

    harness.pressButtonByTestId(TEST_IDS.snapLargeButton);
    expect(harness.getTextByTestId(TEST_IDS.mainSummary)).toContain(
      'Detent: 2 (Large)'
    );

    harness.pressButtonByTestId(TEST_IDS.toggleGrabberButton);
    harness.pressButtonByTestId(TEST_IDS.toggleSwipeDismissButton);
    harness.pressButtonByTestId(TEST_IDS.toggleExpandOnScrollButton);
    harness.pressButtonByTestId(TEST_IDS.cycleBackgroundInteractionButton);
    harness.pressButtonByTestId(TEST_IDS.cyclePreferredColorSchemeButton);
    harness.pressButtonByTestId(TEST_IDS.cycleContentBackgroundStyleButton);
    harness.pressButtonByTestId(TEST_IDS.cycleContentBackgroundBlurStyleButton);
    harness.pressButtonByTestId(TEST_IDS.cycleDetentPresetButton);
    harness.pressButtonByTestId(TEST_IDS.cycleDetentPresetButton);
    harness.pressButtonByTestId(TEST_IDS.cycleDetentPresetButton);
    harness.pressButtonByTestId(TEST_IDS.cycleDetentPresetButton);

    const allStatusLines = harness.getAllTextContent();
    expect(allStatusLines).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Grabber: Off | Swipe dismiss: Off'),
        expect.stringContaining('Expand on scroll: Off | Background: nonModal'),
        expect.stringContaining('Detent preset: All detents'),
        expect.stringContaining('Sheet style: light / blur / prominent'),
      ])
    );

    harness.pressButtonByTestId(TEST_IDS.routeToggleButton);
    expect(harness.getTextByTestId(TEST_IDS.mainRouteSummary)).toContain(
      'Route: Details'
    );

    harness.pressButtonByTestId(TEST_IDS.toggleThemeButton);
    expect(harness.getTextByTestId(TEST_IDS.mainThemeSummary)).toContain(
      'Theme: dark'
    );

    harness.pressButtonByTestId(TEST_IDS.routeToggleButton);
    expect(harness.getTextByTestId(TEST_IDS.mainRouteSummary)).toContain(
      'Route: Summary'
    );

    harness.pressButtonByTestId(TEST_IDS.closeSheetButton);
    expect(harness.getTextByTestId(TEST_IDS.mainSummary)).toContain(
      'Sheet: Closed'
    );

    const loggedMessages = consoleLogSpy.mock.calls.map((call) => call[0]);
    expect(loggedMessages).toEqual(
      expect.arrayContaining([
        'Will present',
        'Did present',
        'Sheet open changed: true, reason: programmatic',
        'Detent changed: 2, reason: programmatic',
        'Will dismiss',
        'Did dismiss',
        'Sheet open changed: false, reason: programmatic',
      ])
    );

    harness.unmount();
    consoleLogSpy.mockRestore();
  });
});
