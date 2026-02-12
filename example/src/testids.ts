export const TEST_IDS = {
  mainContainer: 'main-container',
  mainTitle: 'main-title',
  mainSummary: 'main-summary',
  mainSheetPhase: 'main-sheet-phase',
  mainRouteSummary: 'main-route-summary',
  mainThemeSummary: 'main-theme-summary',
  openSheetButton: 'open-sheet-button',
  toggleThemeButton: 'toggle-theme-button',
  sheetContent: 'sheet-content',
  sheetTitle: 'sheet-title',
  sheetRouteSummary: 'sheet-route-summary',
  routeToggleButton: 'route-toggle-button',
  closeSheetButton: 'close-sheet-button',
  snapFitButton: 'snap-fit-button',
  snapMediumButton: 'snap-medium-button',
  snapLargeButton: 'snap-large-button',
  toggleGrabberButton: 'toggle-grabber-button',
  toggleSwipeDismissButton: 'toggle-swipe-dismiss-button',
  toggleExpandOnScrollButton: 'toggle-expand-on-scroll-button',
  cycleBackgroundInteractionButton: 'cycle-background-interaction-button',
} as const;

export type TestId = (typeof TEST_IDS)[keyof typeof TEST_IDS];
