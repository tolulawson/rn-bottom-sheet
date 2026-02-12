import { View, StyleSheet, Text, Button } from 'react-native';
import { useRef, useState, useCallback, useMemo } from 'react';
import { BottomSheet, useBottomSheetNavigation } from 'rn-bottom-sheet';
import type {
  BottomSheetChangeReason,
  BottomSheetMethods,
  BackgroundInteractionMode,
} from 'rn-bottom-sheet';

type InSheetRoute = 'summary' | 'details';

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

/**
 * Example app demonstrating controlled BottomSheet usage.
 */
export default function App() {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [routeSheetOpen, setRouteSheetOpen] = useState(false);
  const [currentDetent, setCurrentDetent] = useState(0);
  const [selectedDetent, setSelectedDetent] = useState(1);
  const [inSheetRoute, setInSheetRoute] = useState<InSheetRoute>('summary');
  const [grabberVisible, setGrabberVisible] = useState(true);
  const [allowSwipeToDismiss, setAllowSwipeToDismiss] = useState(true);
  const [expandsWhenScrolledToEdge, setExpandsWhenScrolledToEdge] =
    useState(true);
  const [backgroundModeIndex, setBackgroundModeIndex] = useState(0);
  const { Component: AnimatedSheetComponent, isReanimatedWrapperActive } =
    useMemo(resolveAnimatedBottomSheet, []);

  const backgroundModes: BackgroundInteractionMode[] = [
    'modal',
    'nonModal',
    { upThrough: 1 },
  ];
  const backgroundInteraction = backgroundModes[backgroundModeIndex] ?? 'modal';

  const handleOpenChange = useCallback(
    (open: boolean, reason: BottomSheetChangeReason) => {
      console.log(`Sheet open changed: ${open}, reason: ${reason}`);
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

  const detents = ['fit', 'medium', 'large'] as const;
  const detentLabels = ['Fit', 'Medium', 'Large'] as const;

  const handleSnapToDetent = useCallback((index: number) => {
    setSelectedDetent(index);
    sheetRef.current?.snapToDetent(index);
  }, []);

  const navigationSheet = useBottomSheetNavigation({
    routeIsOpen: routeSheetOpen,
    onRouteOpen(reason) {
      console.log(`Route requested open, reason: ${reason}`);
      setRouteSheetOpen(true);
    },
    onRouteClose(reason) {
      console.log(`Route requested close, reason: ${reason}`);
      setRouteSheetOpen(false);
      setInSheetRoute('summary');
    },
    onOpenChange: handleOpenChange,
  });

  const cycleBackgroundInteraction = useCallback(() => {
    setBackgroundModeIndex((current) => (current + 1) % backgroundModes.length);
  }, [backgroundModes.length]);

  const renderBackgroundInteractionLabel = (
    mode: BackgroundInteractionMode
  ): string => {
    if (typeof mode === 'string') {
      return mode;
    }
    return `upThrough(${mode.upThrough})`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>rn-bottom-sheet Example</Text>
      <Text style={styles.status}>
        Sheet: {navigationSheet.isOpen ? 'Open' : 'Closed'} | Detent:{' '}
        {currentDetent} ({detentLabels[currentDetent] ?? 'Unknown'})
      </Text>
      <Text style={styles.status}>
        Grabber: {grabberVisible ? 'On' : 'Off'} | Swipe dismiss:{' '}
        {allowSwipeToDismiss ? 'On' : 'Off'}
      </Text>
      <Text style={styles.status}>
        Expand on scroll: {expandsWhenScrolledToEdge ? 'On' : 'Off'} |
        Background: {renderBackgroundInteractionLabel(backgroundInteraction)}
      </Text>
      <Text style={styles.status}>
        In-sheet route: {inSheetRoute === 'summary' ? 'Summary' : 'Details'} |
        Animation wrapper:{' '}
        {isReanimatedWrapperActive ? 'Reanimated' : 'Fallback'}
      </Text>
      <Button title="Open Sheet" onPress={() => setRouteSheetOpen(true)} />
      <View style={styles.buttonSpacer} />
      <Button title="Close Sheet" onPress={() => setRouteSheetOpen(false)} />
      <View style={styles.buttonSpacer} />
      <Button title="Snap to Fit" onPress={() => handleSnapToDetent(0)} />
      <View style={styles.buttonSpacer} />
      <Button title="Snap to Medium" onPress={() => handleSnapToDetent(1)} />
      <View style={styles.buttonSpacer} />
      <Button title="Snap to Large" onPress={() => handleSnapToDetent(2)} />
      <View style={styles.buttonSpacer} />
      <Button
        title="Toggle Grabber"
        onPress={() => setGrabberVisible((visible) => !visible)}
      />
      <View style={styles.buttonSpacer} />
      <Button
        title="Toggle Swipe Dismiss"
        onPress={() => setAllowSwipeToDismiss((allowed) => !allowed)}
      />
      <View style={styles.buttonSpacer} />
      <Button
        title="Toggle Expand On Scroll"
        onPress={() => setExpandsWhenScrolledToEdge((expand) => !expand)}
      />
      <View style={styles.buttonSpacer} />
      <Button
        title="Cycle Background Interaction"
        onPress={cycleBackgroundInteraction}
      />

      <AnimatedSheetComponent
        ref={sheetRef}
        isOpen={navigationSheet.isOpen}
        detents={[...detents]}
        initialDetent={1}
        selectedDetent={selectedDetent}
        grabberVisible={grabberVisible}
        allowSwipeToDismiss={allowSwipeToDismiss}
        backgroundInteraction={backgroundInteraction}
        cornerRadius={-1}
        expandsWhenScrolledToEdge={expandsWhenScrolledToEdge}
        onOpenChange={navigationSheet.onOpenChange}
        onDetentChange={handleDetentChange}
        onWillPresent={() => console.log('Will present')}
        onDidPresent={() => console.log('Did present')}
        onWillDismiss={() => console.log('Will dismiss')}
        onDidDismiss={() => console.log('Did dismiss')}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Sheet Content</Text>
          <Text style={styles.sheetSubtitle}>
            In-Sheet Route: {inSheetRoute === 'summary' ? 'Summary' : 'Details'}
          </Text>
          {inSheetRoute === 'summary' ? (
            <Button
              title="Go to Details"
              onPress={() => setInSheetRoute('details')}
            />
          ) : (
            <Button
              title="Back to Summary"
              onPress={() => setInSheetRoute('summary')}
            />
          )}
          <View style={styles.buttonSpacer} />
          <Button title="Close" onPress={() => setRouteSheetOpen(false)} />
        </View>
      </AnimatedSheetComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
    color: '#666',
    textAlign: 'center',
  },
  buttonSpacer: {
    height: 8,
  },
  sheetContent: {
    padding: 20,
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
});
