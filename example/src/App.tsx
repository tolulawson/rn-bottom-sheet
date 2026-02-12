import { Button, StyleSheet, Text, View } from 'react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { BottomSheet, useBottomSheetNavigation } from 'rn-bottom-sheet';
import type {
  BackgroundInteractionMode,
  BottomSheetChangeReason,
  BottomSheetMethods,
} from 'rn-bottom-sheet';

import { InSheetControls } from './components/InSheetControls';
import {
  getPhaseForCloseRequest,
  getPhaseForOpenRequest,
  getResetRouteOnClose,
  isOpenRequestNoOp,
  type InSheetRoute,
  type SheetPhase,
} from './example-state';
import { TEST_IDS } from './testids';
import { THEME_TOKENS, type ThemeMode } from './theme';

const DETENTS = ['fit', 'medium', 'large'] as const;
const DETENT_LABELS = ['Fit', 'Medium', 'Large'] as const;
const BACKGROUND_MODES: BackgroundInteractionMode[] = [
  'modal',
  'nonModal',
  { upThrough: 1 },
];

function resolveAnimatedBottomSheet(): {
  Component: typeof BottomSheet;
  isReanimatedWrapperActive: boolean;
} {
  try {
    const reanimated = require('react-native-reanimated') as {
      createAnimatedComponent?: (
        component: typeof BottomSheet
      ) => typeof BottomSheet;
    };

    if (typeof reanimated.createAnimatedComponent === 'function') {
      return {
        Component: reanimated.createAnimatedComponent(
          BottomSheet
        ) as typeof BottomSheet,
        isReanimatedWrapperActive: true,
      };
    }
  } catch {
    // Optional dependency: fallback to the standard BottomSheet component.
  }

  return {
    Component: BottomSheet,
    isReanimatedWrapperActive: false,
  };
}

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
 */
export default function App() {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [routeSheetOpen, setRouteSheetOpen] = useState(false);
  const [sheetPhase, setSheetPhase] = useState<SheetPhase>('closed');
  const [currentDetent, setCurrentDetent] = useState(1);
  const [selectedDetent, setSelectedDetent] = useState(1);
  const [inSheetRoute, setInSheetRoute] = useState<InSheetRoute>('summary');
  const [grabberVisible, setGrabberVisible] = useState(true);
  const [allowSwipeToDismiss, setAllowSwipeToDismiss] = useState(true);
  const [expandsWhenScrolledToEdge, setExpandsWhenScrolledToEdge] =
    useState(true);
  const [backgroundModeIndex, setBackgroundModeIndex] = useState(0);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const { Component: AnimatedSheetComponent, isReanimatedWrapperActive } =
    useMemo(resolveAnimatedBottomSheet, []);

  const theme = THEME_TOKENS[themeMode];
  const backgroundInteraction =
    BACKGROUND_MODES[backgroundModeIndex] ?? 'modal';

  const handleOpenChange = useCallback(
    (open: boolean, reason: BottomSheetChangeReason) => {
      console.log(`Sheet open changed: ${open}, reason: ${reason}`);

      if (!open) {
        setInSheetRoute((currentRoute) =>
          getResetRouteOnClose(false, currentRoute)
        );
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

  const requestOpenSheet = useCallback(() => {
    if (isOpenRequestNoOp(sheetPhase)) {
      return;
    }

    setSheetPhase(getPhaseForOpenRequest(sheetPhase));
    setRouteSheetOpen(true);
  }, [sheetPhase]);

  const requestCloseSheet = useCallback(() => {
    setSheetPhase((currentPhase) => getPhaseForCloseRequest(currentPhase));
    setRouteSheetOpen(false);
    setInSheetRoute((currentRoute) =>
      getResetRouteOnClose(false, currentRoute)
    );
  }, []);

  const handleToggleTheme = useCallback(() => {
    setThemeMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'));
  }, []);

  const handleToggleRoute = useCallback(() => {
    setInSheetRoute((currentRoute) =>
      currentRoute === 'summary' ? 'details' : 'summary'
    );
  }, []);

  const handleSnapToDetent = useCallback((index: number) => {
    setSelectedDetent(index);
    sheetRef.current?.snapToDetent(index);
  }, []);

  const navigationSheet = useBottomSheetNavigation({
    routeIsOpen: routeSheetOpen,
    onRouteOpen(reason) {
      console.log(`Route requested open, reason: ${reason}`);
      setRouteSheetOpen(true);
      setSheetPhase((currentPhase) => getPhaseForOpenRequest(currentPhase));
    },
    onRouteClose(reason) {
      console.log(`Route requested close, reason: ${reason}`);
      setRouteSheetOpen(false);
      setSheetPhase((currentPhase) => getPhaseForCloseRequest(currentPhase));
      setInSheetRoute((currentRoute) =>
        getResetRouteOnClose(false, currentRoute)
      );
    },
    onOpenChange: handleOpenChange,
  });

  const cycleBackgroundInteraction = useCallback(() => {
    setBackgroundModeIndex(
      (currentIndex) => (currentIndex + 1) % BACKGROUND_MODES.length
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
        Theme: {themeMode} | Animation wrapper:{' '}
        {isReanimatedWrapperActive ? 'Reanimated' : 'Fallback'}
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

      <AnimatedSheetComponent
        allowSwipeToDismiss={allowSwipeToDismiss}
        backgroundInteraction={backgroundInteraction}
        cornerRadius={-1}
        detents={[...DETENTS]}
        expandsWhenScrolledToEdge={expandsWhenScrolledToEdge}
        grabberVisible={grabberVisible}
        initialDetent={1}
        isOpen={navigationSheet.isOpen}
        onDetentChange={handleDetentChange}
        onDidDismiss={() => {
          console.log('Did dismiss');
          setSheetPhase('closed');
          setInSheetRoute((currentRoute) =>
            getResetRouteOnClose(false, currentRoute)
          );
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
          onToggleExpandOnScroll={() =>
            setExpandsWhenScrolledToEdge((expand) => !expand)
          }
          onToggleGrabber={() => setGrabberVisible((visible) => !visible)}
          onToggleRoute={handleToggleRoute}
          onToggleSwipeDismiss={() =>
            setAllowSwipeToDismiss((allowed) => !allowed)
          }
          route={inSheetRoute}
          theme={theme}
        />
      </AnimatedSheetComponent>
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
