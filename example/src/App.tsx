import { Button, StyleSheet, Text, View } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { BottomSheet, useBottomSheetNavigation } from 'rn-bottom-sheet';
import type {
  BackgroundInteractionMode,
  BottomSheetChangeReason,
  BottomSheetContentBackgroundBlurStyle,
  BottomSheetContentBackgroundStyle,
  BottomSheetDetent,
  BottomSheetMethods,
  BottomSheetPreferredColorScheme,
} from 'rn-bottom-sheet';

import { InSheetControls } from './components/InSheetControls';
import { getResetRouteOnClose, type InSheetRoute } from './example-state';
import { TEST_IDS } from './testids';
import { THEME_TOKENS, type ThemeMode } from './theme';

type DetentPreset = 'all' | 'fit' | 'medium' | 'large';

const DETENT_LABELS = ['Fit', 'Medium', 'Large'] as const;
const DETENT_PRESET_ORDER: readonly DetentPreset[] = [
  'all',
  'fit',
  'medium',
  'large',
];
const DETENT_PRESETS: Record<DetentPreset, readonly BottomSheetDetent[]> = {
  all: ['fit', 'medium', 'large'],
  fit: ['fit'],
  medium: ['medium'],
  large: ['large'],
};
const BACKGROUND_MODES: BackgroundInteractionMode[] = [
  'modal',
  'nonModal',
  { upThrough: 1 },
];
const PREFERRED_COLOR_SCHEMES: BottomSheetPreferredColorScheme[] = [
  'system',
  'light',
  'dark',
];
const CONTENT_BACKGROUND_STYLES: BottomSheetContentBackgroundStyle[] = [
  'system',
  'blur',
  'clear',
];
const CONTENT_BACKGROUND_BLUR_STYLES: BottomSheetContentBackgroundBlurStyle[] =
  ['regular', 'prominent', 'light', 'dark'];

function renderBackgroundInteractionLabel(
  mode: BackgroundInteractionMode
): string {
  if (typeof mode === 'string') {
    return mode;
  }

  return `upThrough(${mode.upThrough})`;
}

function renderDetentPresetLabel(preset: DetentPreset): string {
  switch (preset) {
    case 'fit':
      return 'Fit only';
    case 'medium':
      return 'Medium only';
    case 'large':
      return 'Large only';
    default:
      return 'All detents';
  }
}

function cycleEnumValue<T>(values: readonly T[], current: T): T {
  const currentIndex = values.indexOf(current);
  if (currentIndex < 0) {
    return values[0]!;
  }
  return values[(currentIndex + 1) % values.length]!;
}

/**
 * Example app demonstrating controlled BottomSheet usage.
 *
 * State philosophy:
 * - `routeSheetOpen` is the single source of truth for open/close.
 * - `sheetPhase` is display-only, driven exclusively by native lifecycle
 *   callbacks (onWillPresent / onDidPresent / onWillDismiss / onDidDismiss).
 * - `handleOpenChange` is the sole callback that syncs `routeSheetOpen`.
 *   No `onRouteOpen` / `onRouteClose` callbacks are used, eliminating
 *   double-update races that previously caused the reopen-after-close bug.
 */
export default function App() {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [routeSheetOpen, setRouteSheetOpen] = useState(false);
  const [sheetPhase, setSheetPhase] = useState<string>('closed');
  const [currentDetent, setCurrentDetent] = useState(0);
  const [selectedDetent, setSelectedDetent] = useState(0);
  const [detentPreset, setDetentPreset] = useState<DetentPreset>('all');
  const [inSheetRoute, setInSheetRoute] = useState<InSheetRoute>('summary');
  const [grabberVisible, setGrabberVisible] = useState(true);
  const [allowSwipeToDismiss, setAllowSwipeToDismiss] = useState(true);
  const [expandsWhenScrolledToEdge, setExpandsWhenScrolledToEdge] =
    useState(true);
  const [backgroundModeIndex, setBackgroundModeIndex] = useState(0);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [preferredColorScheme, setPreferredColorScheme] =
    useState<BottomSheetPreferredColorScheme>('system');
  const [contentBackgroundStyle, setContentBackgroundStyle] =
    useState<BottomSheetContentBackgroundStyle>('system');
  const [contentBackgroundBlurStyle, setContentBackgroundBlurStyle] =
    useState<BottomSheetContentBackgroundBlurStyle>('regular');

  const theme = THEME_TOKENS[themeMode];
  const backgroundInteraction =
    BACKGROUND_MODES[backgroundModeIndex] ?? 'modal';
  const activeDetents = DETENT_PRESETS[detentPreset] ?? DETENT_PRESETS.all;
  const availableDetentCount = activeDetents.length;
  const detentPresetLabel = renderDetentPresetLabel(detentPreset);

  // -------------------------------------------------------------------
  // Sole open-state synchronisation handler.  No other callback should
  // write to `routeSheetOpen`.
  // -------------------------------------------------------------------
  const handleOpenChange = useCallback(
    (open: boolean, _reason: BottomSheetChangeReason) => {
      console.log(`Sheet open changed: ${open}, reason: ${_reason}`);
      setRouteSheetOpen(open);
      if (!open) {
        setInSheetRoute((r) => getResetRouteOnClose(false, r));
      }
    },
    []
  );

  const handleDetentChange = useCallback(
    (index: number, reason: BottomSheetChangeReason) => {
      console.log(`Detent changed: ${index}, reason: ${reason}`);
      setCurrentDetent(index);
      setSelectedDetent(index);
    },
    []
  );

  // -------------------------------------------------------------------
  // Open / close requests — guard only on `routeSheetOpen`.
  // -------------------------------------------------------------------
  const requestOpenSheet = useCallback(() => {
    if (routeSheetOpen) return;
    setRouteSheetOpen(true);
  }, [routeSheetOpen]);

  const requestCloseSheet = useCallback(() => {
    if (!routeSheetOpen) return;
    setRouteSheetOpen(false);
  }, [routeSheetOpen]);

  const handleToggleTheme = useCallback(() => {
    setThemeMode((m) => (m === 'light' ? 'dark' : 'light'));
  }, []);

  const handleToggleRoute = useCallback(() => {
    setInSheetRoute((r) => (r === 'summary' ? 'details' : 'summary'));
  }, []);

  const handleSnapToDetent = useCallback(
    (index: number) => {
      if (index < 0 || index >= availableDetentCount) {
        return;
      }
      setSelectedDetent(index);
      sheetRef.current?.snapToDetent(index);
    },
    [availableDetentCount]
  );

  const handleCycleDetentPreset = useCallback(() => {
    setDetentPreset((current) => cycleEnumValue(DETENT_PRESET_ORDER, current));
    setCurrentDetent(0);
    setSelectedDetent(0);
    sheetRef.current?.snapToDetent(0);
  }, []);

  // -------------------------------------------------------------------
  // Navigation adapter — only `onOpenChange` is provided.
  // No `onRouteOpen` / `onRouteClose` to prevent double-updates.
  // -------------------------------------------------------------------
  const navigationSheet = useBottomSheetNavigation({
    routeIsOpen: routeSheetOpen,
    onOpenChange: handleOpenChange,
  });

  const cycleBackgroundInteraction = useCallback(() => {
    setBackgroundModeIndex((i) => (i + 1) % BACKGROUND_MODES.length);
  }, []);

  const cyclePreferredColorScheme = useCallback(() => {
    setPreferredColorScheme((current) =>
      cycleEnumValue(PREFERRED_COLOR_SCHEMES, current)
    );
  }, []);

  const cycleContentBackgroundStyle = useCallback(() => {
    setContentBackgroundStyle((current) =>
      cycleEnumValue(CONTENT_BACKGROUND_STYLES, current)
    );
  }, []);

  const cycleContentBackgroundBlurStyle = useCallback(() => {
    setContentBackgroundBlurStyle((current) =>
      cycleEnumValue(CONTENT_BACKGROUND_BLUR_STYLES, current)
    );
  }, []);

  return (
    <View
      accessibilityLabel={TEST_IDS.mainContainer}
      style={[styles.container, { backgroundColor: theme.background }]}
      testID={TEST_IDS.mainContainer}
    >
      <Text
        accessibilityLabel={TEST_IDS.mainTitle}
        style={[styles.title, { color: theme.text }]}
        testID={TEST_IDS.mainTitle}
      >
        rn-bottom-sheet Example
      </Text>
      <Text
        accessibilityLabel={TEST_IDS.mainSummary}
        accessibilityValue={{
          text: `Sheet: ${
            navigationSheet.isOpen ? 'Open' : 'Closed'
          } | Detent: ${currentDetent} (${
            DETENT_LABELS[currentDetent] ?? 'Unknown'
          })`,
        }}
        style={[styles.status, { color: theme.mutedText }]}
        testID={TEST_IDS.mainSummary}
      >
        Sheet: {navigationSheet.isOpen ? 'Open' : 'Closed'} | Detent:{' '}
        {currentDetent} ({DETENT_LABELS[currentDetent] ?? 'Unknown'})
      </Text>
      <Text
        accessibilityLabel={TEST_IDS.mainSheetPhase}
        style={[styles.status, { color: theme.mutedText }]}
        testID={TEST_IDS.mainSheetPhase}
      >
        Phase: {sheetPhase}
      </Text>
      <Text
        accessibilityLabel={TEST_IDS.mainRouteSummary}
        accessibilityValue={{
          text: `Route: ${
            inSheetRoute === 'summary' ? 'Summary' : 'Details'
          } | Background: ${renderBackgroundInteractionLabel(
            backgroundInteraction
          )} | Detents: ${detentPresetLabel}`,
        }}
        style={[styles.status, { color: theme.mutedText }]}
        testID={TEST_IDS.mainRouteSummary}
      >
        Route: {inSheetRoute === 'summary' ? 'Summary' : 'Details'} |
        Background: {renderBackgroundInteractionLabel(backgroundInteraction)} |
        Detents: {detentPresetLabel}
      </Text>
      <Text
        accessibilityLabel={TEST_IDS.mainThemeSummary}
        accessibilityValue={{ text: `Theme: ${themeMode}` }}
        style={[styles.status, { color: theme.mutedText }]}
        testID={TEST_IDS.mainThemeSummary}
      >
        Theme: {themeMode}
      </Text>
      <Text
        accessibilityLabel={TEST_IDS.mainSheetStyleSummary}
        accessibilityValue={{
          text: `Sheet style: ${preferredColorScheme} / ${contentBackgroundStyle} / ${contentBackgroundBlurStyle}`,
        }}
        style={[styles.status, { color: theme.mutedText }]}
        testID={TEST_IDS.mainSheetStyleSummary}
      >
        Sheet style: {preferredColorScheme} / {contentBackgroundStyle} /{' '}
        {contentBackgroundBlurStyle}
      </Text>
      <Button
        accessibilityLabel={TEST_IDS.openSheetButton}
        onPress={requestOpenSheet}
        testID={TEST_IDS.openSheetButton}
        title="Open Sheet"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.toggleThemeButton}
        onPress={handleToggleTheme}
        testID={TEST_IDS.toggleThemeButton}
        title={themeMode === 'light' ? 'Enable Dark Mode' : 'Enable Light Mode'}
      />

      <BottomSheet
        allowSwipeToDismiss={allowSwipeToDismiss}
        backgroundInteraction={backgroundInteraction}
        contentBackgroundBlurStyle={contentBackgroundBlurStyle}
        contentBackgroundStyle={contentBackgroundStyle}
        cornerRadius={-1}
        detents={[...activeDetents]}
        expandsWhenScrolledToEdge={expandsWhenScrolledToEdge}
        grabberVisible={grabberVisible}
        initialDetent={0}
        isOpen={navigationSheet.isOpen}
        onDetentChange={handleDetentChange}
        onDidDismiss={() => {
          console.log('Did dismiss');
          setSheetPhase('closed');
          setInSheetRoute((r) => getResetRouteOnClose(false, r));
        }}
        onDidPresent={() => {
          console.log('Did present');
          setSheetPhase('open');
        }}
        onOpenChange={navigationSheet.onOpenChange}
        onWillDismiss={() => {
          console.log('Will dismiss');
          setSheetPhase('dismissing');
        }}
        onWillPresent={() => {
          console.log('Will present');
          setSheetPhase('opening');
        }}
        preferredColorScheme={preferredColorScheme}
        ref={sheetRef}
        selectedDetent={selectedDetent}
      >
        <InSheetControls
          allowSwipeToDismiss={allowSwipeToDismiss}
          availableDetentCount={availableDetentCount}
          backgroundInteraction={backgroundInteraction}
          contentBackgroundBlurStyle={contentBackgroundBlurStyle}
          contentBackgroundStyle={contentBackgroundStyle}
          currentDetent={currentDetent}
          detentPresetLabel={detentPresetLabel}
          expandsWhenScrolledToEdge={expandsWhenScrolledToEdge}
          grabberVisible={grabberVisible}
          onClose={requestCloseSheet}
          onCycleBackgroundInteraction={cycleBackgroundInteraction}
          onCycleContentBackgroundBlurStyle={cycleContentBackgroundBlurStyle}
          onCycleContentBackgroundStyle={cycleContentBackgroundStyle}
          onCycleDetentPreset={handleCycleDetentPreset}
          onCyclePreferredColorScheme={cyclePreferredColorScheme}
          onSnapToDetent={handleSnapToDetent}
          onToggleExpandOnScroll={() => setExpandsWhenScrolledToEdge((v) => !v)}
          onToggleGrabber={() => setGrabberVisible((v) => !v)}
          onToggleRoute={handleToggleRoute}
          onToggleSwipeDismiss={() => setAllowSwipeToDismiss((v) => !v)}
          preferredColorScheme={preferredColorScheme}
          route={inSheetRoute}
          theme={theme}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonSpacer: {
    height: 8,
  },
});
