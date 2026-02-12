import { View, StyleSheet, Text, Button } from 'react-native';
import { useRef, useState, useCallback } from 'react';
import { BottomSheet } from 'rn-bottom-sheet';
import type {
  BottomSheetChangeReason,
  BottomSheetMethods,
  BackgroundInteractionMode,
} from 'rn-bottom-sheet';

/**
 * Example app demonstrating controlled BottomSheet usage.
 */
export default function App() {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentDetent, setCurrentDetent] = useState(0);
  const [selectedDetent, setSelectedDetent] = useState(1);
  const [grabberVisible, setGrabberVisible] = useState(true);
  const [allowSwipeToDismiss, setAllowSwipeToDismiss] = useState(true);
  const [expandsWhenScrolledToEdge, setExpandsWhenScrolledToEdge] =
    useState(true);
  const [backgroundModeIndex, setBackgroundModeIndex] = useState(0);

  const backgroundModes: BackgroundInteractionMode[] = [
    'modal',
    'nonModal',
    { upThrough: 1 },
  ];
  const backgroundInteraction = backgroundModes[backgroundModeIndex] ?? 'modal';

  const handleOpenChange = useCallback(
    (open: boolean, reason: BottomSheetChangeReason) => {
      console.log(`Sheet open changed: ${open}, reason: ${reason}`);
      setIsOpen(open);
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
        Sheet: {isOpen ? 'Open' : 'Closed'} | Detent: {currentDetent} (
        {detentLabels[currentDetent] ?? 'Unknown'})
      </Text>
      <Text style={styles.status}>
        Grabber: {grabberVisible ? 'On' : 'Off'} | Swipe dismiss:{' '}
        {allowSwipeToDismiss ? 'On' : 'Off'}
      </Text>
      <Text style={styles.status}>
        Expand on scroll: {expandsWhenScrolledToEdge ? 'On' : 'Off'} |
        Background: {renderBackgroundInteractionLabel(backgroundInteraction)}
      </Text>
      <Button title="Open Sheet" onPress={() => setIsOpen(true)} />
      <View style={styles.buttonSpacer} />
      <Button title="Close Sheet" onPress={() => setIsOpen(false)} />
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

      <BottomSheet
        ref={sheetRef}
        isOpen={isOpen}
        detents={[...detents]}
        initialDetent={1}
        selectedDetent={selectedDetent}
        grabberVisible={grabberVisible}
        allowSwipeToDismiss={allowSwipeToDismiss}
        backgroundInteraction={backgroundInteraction}
        cornerRadius={-1}
        expandsWhenScrolledToEdge={expandsWhenScrolledToEdge}
        onOpenChange={handleOpenChange}
        onDetentChange={handleDetentChange}
        onWillPresent={() => console.log('Will present')}
        onDidPresent={() => console.log('Did present')}
        onWillDismiss={() => console.log('Will dismiss')}
        onDidDismiss={() => console.log('Did dismiss')}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Sheet Content</Text>
          <Button title="Close" onPress={() => setIsOpen(false)} />
        </View>
      </BottomSheet>
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
});
