import { createAppHarness } from './app-harness';
import { TEST_IDS } from '../testids';
import { THEME_TOKENS } from '../theme';

describe('example theme contract', () => {
  it('propagates theme mode across parent and sheet content while interactions continue', () => {
    const harness = createAppHarness();

    expect(harness.getTextByTestId(TEST_IDS.mainThemeSummary)).toContain(
      'Theme: light'
    );

    const lightMainStyle = harness.getViewStyleByTestId(TEST_IDS.mainContainer);
    expect(lightMainStyle.backgroundColor).toBe(THEME_TOKENS.light.background);

    harness.pressButtonByTestId(TEST_IDS.toggleThemeButton);

    expect(harness.getTextByTestId(TEST_IDS.mainThemeSummary)).toContain(
      'Theme: dark'
    );

    const darkMainStyle = harness.getViewStyleByTestId(TEST_IDS.mainContainer);
    expect(darkMainStyle.backgroundColor).toBe(THEME_TOKENS.dark.background);

    harness.pressButtonByTestId(TEST_IDS.openSheetButton);
    const darkSheetStyle = harness.getViewStyleByTestId(TEST_IDS.sheetContent);
    expect(darkSheetStyle.backgroundColor).toBe(THEME_TOKENS.dark.surface);

    harness.pressButtonByTestId(TEST_IDS.cyclePreferredColorSchemeButton);
    harness.pressButtonByTestId(TEST_IDS.cycleContentBackgroundStyleButton);
    harness.pressButtonByTestId(TEST_IDS.cycleContentBackgroundBlurStyleButton);
    expect(harness.getTextByTestId(TEST_IDS.mainSheetStyleSummary)).toContain(
      'Sheet style: light / blur / prominent'
    );

    harness.pressButtonByTestId(TEST_IDS.toggleThemeButton);

    expect(harness.getTextByTestId(TEST_IDS.mainThemeSummary)).toContain(
      'Theme: light'
    );

    const lightSheetStyle = harness.getViewStyleByTestId(TEST_IDS.sheetContent);
    expect(lightSheetStyle.backgroundColor).toBe(THEME_TOKENS.light.surface);

    harness.pressButtonByTestId(TEST_IDS.closeSheetButton);
    harness.unmount();
  });
});
