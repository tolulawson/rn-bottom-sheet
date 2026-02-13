import { Button, StyleSheet, Text, View } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { BottomSheet, useBottomSheetNavigation } from 'rn-bottom-sheet';
import type {
  BackgroundInteractionMode,
  BottomSheetChangeReason,
  BottomSheetMethods,
} from 'rn-bottom-sheet';

import { InSheetControls } from './components/InSheetControls';
import { getResetRouteOnClose, type InSheetRoute } from './example-state';
import { TEST_IDS } from './testids';
import { THEME_TOKENS, type ThemeMode } from './theme';

const DETENTS = ['fit'] as const;
const DETENT_LABELS = ['Fit', 'Medium', 'Large'] as const;
const BACKGROUND_MODES: BackgroundInteractionMode[] = [
  'modal',
  'nonModal',
  { upThrough: 1 },
];

function renderBackgroundInteractionLabel(
  mode: BackgroundInteractionMode
): string {
  if (typeof mode === 'string') {
    return mode;
  }

  return `upThrough(${mode.upThrough})`;
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
  const [inSheetRoute, setInSheetRoute] = useState<InSheetRoute>('summary');
  const [grabberVisible, setGrabberVisible] = useState(true);
  const [allowSwipeToDismiss, setAllowSwipeToDismiss] = useState(true);
  const [expandsWhenScrolledToEdge, setExpandsWhenScrolledToEdge] =
    useState(true);
  const [backgroundModeIndex, setBackgroundModeIndex] = useState(0);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const theme = THEME_TOKENS[themeMode];
  const backgroundInteraction =
    BACKGROUND_MODES[backgroundModeIndex] ?? 'modal';

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

  const handleSnapToDetent = useCallback((index: number) => {
    setSelectedDetent(index);
    sheetRef.current?.snapToDetent(index);
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
        style={[styles.status, { color: theme.mutedText }]}
        testID={TEST_IDS.mainRouteSummary}
      >
        Route: {inSheetRoute === 'summary' ? 'Summary' : 'Details'} |
        Background: {renderBackgroundInteractionLabel(backgroundInteraction)}
      </Text>
      <Text
        accessibilityLabel={TEST_IDS.mainThemeSummary}
        style={[styles.status, { color: theme.mutedText }]}
        testID={TEST_IDS.mainThemeSummary}
      >
        Theme: {themeMode}
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
        cornerRadius={-1}
        detents={[...DETENTS]}
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
        ref={sheetRef}
        selectedDetent={selectedDetent}
      >
        <InSheetControls
          allowSwipeToDismiss={allowSwipeToDismiss}
          backgroundInteraction={backgroundInteraction}
          currentDetent={currentDetent}
          expandsWhenScrolledToEdge={expandsWhenScrolledToEdge}
          grabberVisible={grabberVisible}
          onClose={requestCloseSheet}
          onCycleBackgroundInteraction={cycleBackgroundInteraction}
          onSnapToDetent={handleSnapToDetent}
          onToggleExpandOnScroll={() => setExpandsWhenScrolledToEdge((v) => !v)}
          onToggleGrabber={() => setGrabberVisible((v) => !v)}
          onToggleRoute={handleToggleRoute}
          onToggleSwipeDismiss={() => setAllowSwipeToDismiss((v) => !v)}
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
